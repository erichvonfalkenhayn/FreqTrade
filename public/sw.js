const CACHE_NAME = 'frequi-pwa-v1';
const APP_BASE = new URL('./', self.location.href);
const APP_SHELL = new URL('index.html', APP_BASE);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('frequi-pwa-') && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (
    request.method !== 'GET' ||
    requestUrl.origin !== APP_BASE.origin ||
    !requestUrl.pathname.startsWith(APP_BASE.pathname) ||
    requestUrl.pathname === new URL('api', APP_BASE).pathname ||
    requestUrl.pathname.startsWith(new URL('api/', APP_BASE).pathname)
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(APP_SHELL, response.clone());
            } catch (error) {
              console.error('Failed to cache the application shell.', error);
            }
          }
          return response;
        })
        .catch(async () => {
          const cachedShell = await caches.match(APP_SHELL);
          if (!cachedShell) {
            throw new Error('The application shell is not available offline.');
          }
          return cachedShell;
        }),
    );
    return;
  }

  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          } catch (error) {
            console.error('Failed to cache a static PWA resource.', error);
          }
        }
        return response;
      }),
    );
  }
});
