const CACHE_NAME = "GDACardGame-V0.1";

// arquivos essenciais (app shell)
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "assets/css/base.css",
  "assets/css/main.css",
  "assets/css/menu.css",
  "assets/css/tutorial.css",
  "assets/js/main.js",
  "assets/js/menu.js",
  "manifest.json",
  // IMGs essenciais"
  "assets/img/APP-192.png",
  "assets/img/APP-500.png",
  "assets/img/logo.webp",
];

// INSTALL → garante offline base
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

// FETCH (inteligente)
// FETCH (Stale-While-Revalidate para arquivos locais)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (!url.protocol.startsWith("http")) return;
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Faz a busca na rede em segundo plano
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se a rede falhar de vez (offline), o navegador usa o cache silenciosamente
      });

      // Retorna o cache IMEDIATAMENTE (super rápido). 
      // Se não tiver cache, entrega a resposta da rede.
      return cachedResponse || fetchPromise;
    })
  );
});
