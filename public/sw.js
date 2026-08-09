// Bumping the cache name discards everything the previous worker stored.
// v1 cached '/' cache-first, which meant a returning visitor could be served
// last season's HTML indefinitely — a deploy never reached them.
const CACHE = 'jl-static-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Never cache the API — status, posts and admin data must always be live.
  if (url.pathname.startsWith('/api/')) return;

  // HTML: network first, falling back to the cached copy only when offline.
  // This keeps deploys instant while still giving offline visitors a page.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Build assets are content-hashed, so cache-first is always correct.
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then(
          (hit) =>
            hit ||
            fetch(req).then((res) => {
              if (res.ok) c.put(req, res.clone());
              return res;
            })
        )
      )
    );
  }
});
