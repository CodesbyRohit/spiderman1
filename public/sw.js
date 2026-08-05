/* ARACHNID — minimal offline-first service worker (app shell only). */
const CACHE = 'arachnid-v2' // bumped: v1 cached the pre-fix bundle

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/manifest.webmanifest', '/favicon.svg']).catch(() => {}),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return
  if (request.url.includes('/api.github.com')) return
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone()
              caches.open(CACHE).then((cache) => cache.put(request, clone))
            }
            return res
          })
          .catch(() => caches.match('/')),
    ),
  )
})
