/* CapacityConnect service worker (Phase 3.4B) — hand-rolled, no build dep.
 *
 * Strategy:
 * - Precache: offline fallback page + manifest + icon (app shell minimum).
 * - Same-origin static assets (/_next/static/*, fonts, public files):
 *   cache-first, versioned cache.
 * - GET /api/catalog/* (public, no PII): stale-while-revalidate.
 * - Navigations to public catalog/demo pages: network-first, cache fallback.
 * - Everything else (authed pages /api/*, /trainee, /trainer, /admin,
 *   /exam, /verify): network-first with offline.html fallback for
 *   navigations; API calls are NEVER cached (no cross-account leakage on
 *   shared devices).
 * - Lesson downloads live in the `cc-lessons` cache, written by the page
 *   (see LearningPathPlayer offline support), never evicted here.
 */
const VERSION = 'cc-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const API_CACHE = `${VERSION}-catalog-api`;
const PRECACHE = ['/offline.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('cc-') && ![STATIC_CACHE, PAGES_CACHE, API_CACHE, 'cc-lessons'].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isNavigation(request) {
  return request.mode === 'navigate';
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Static assets: cache-first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(woff2?|ttf|png|jpg|jpeg|webp|avif|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Public catalog API: stale-while-revalidate (no PII in these payloads).
  if (url.pathname.startsWith('/api/catalog/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Navigations.
  if (isNavigation(request)) {
    const path = url.pathname;
    const cacheablePage = path === '/' || path.startsWith('/catalog') || path.startsWith('/demo');
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok && cacheablePage) {
            const copy = res.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
  }
  // All other same-origin GETs (authed pages/APIs): network-only by default.
});
