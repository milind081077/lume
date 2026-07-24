const CACHE = 'lume-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (ev) => {
  const url = new URL(ev.request.url);
  if (url.origin === self.location.origin) {
    ev.respondWith(
      caches.match(ev.request).then((cached) => {
        return cached || fetch(ev.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(ev.request, clone));
          return res;
        }).catch(() => cached);
      })
    );
  } else {
    ev.respondWith(
      fetch(ev.request).catch(() => caches.match(ev.request))
    );
  }
});
