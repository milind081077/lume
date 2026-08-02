// Lume Service Worker — offline-first caching
const CACHE = 'lume-v1';
const ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Install: pre-cache everything
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cache local assets; Google Fonts may fail offline — that's OK
      return cache.addAll(['/index.html', '/manifest.json', '/icons/icon.svg'])
        .then(function() {
          // Try fonts separately; don't fail install if they're unavailable
          return cache.addAll(ASSETS.filter(function(u){ return u.startsWith('https://'); }))
            .catch(function() {});
        });
    }).then(function() { return self.skipWaiting(); })
  );
});

// Activate: remove old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch: cache-first for local assets, network-first for everything else
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Local assets: cache-first
  if(url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if(cached) return cached;
        return fetch(e.request).then(function(response) {
          if(response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
          }
          return response;
        }).catch(function() {
          // Offline fallback: return cached index
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // External (fonts): network-first, cache on success, silent fail offline
  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      fetch(e.request).then(function(response) {
        if(response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
  }
});
