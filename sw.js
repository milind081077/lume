// Lume Service Worker — offline-first caching
// Cache version: bump this string to force all clients to update
var CACHE = 'lume-v2';

var LOCAL_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

var FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ── INSTALL: pre-cache local assets ────────────────────────────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Core local files — must succeed
      return cache.addAll(LOCAL_ASSETS).then(function() {
        // Fonts — nice to have; don't fail install if offline during setup
        return Promise.all(FONT_URLS.map(function(url) {
          return cache.add(url).catch(function() {});
        }));
      });
    }).then(function() {
      // Activate immediately without waiting for old tabs to close
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: delete stale caches ──────────────────────────────────────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// ── FETCH: cache-first for local, network-first for fonts ──────────────────
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Local same-origin assets: cache-first, fall back to network, update cache
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        var networkFetch = fetch(e.request).then(function(response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE).then(function(cache) {
              cache.put(e.request, clone);
            });
          }
          return response;
        }).catch(function() {
          // Offline: return cache or the root index as ultimate fallback
          return cached || caches.match('./index.html');
        });
        // Return cached immediately, refresh in background (stale-while-revalidate)
        return cached || networkFetch;
      })
    );
    return;
  }

  // Google Fonts: network-first, cache on success, serve cache when offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
  }
  // All other external requests: let them pass through normally
});
