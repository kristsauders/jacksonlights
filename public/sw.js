self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  clients.claim();
});
// Basic offline fallback caching shell assets (extend later if needed)
const CACHE = 'jl-static-v1';
const CORE = [ '/', '/favicon.ico' ];
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin) {
    // Don't cache uploaded media - always fetch fresh
    if (url.pathname.startsWith('/posts/')) return;
    if (CORE.includes(url.pathname)) {
      e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
      return;
    }
  }
});
