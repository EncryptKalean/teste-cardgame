const CACHE_NAME = "GDA-CardGame-V0.0.2";

// arquivos essenciais (app shell)
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./assets/css/base.css",
  "./assets/css/main.css",
  "./assets/css/menu.css",
  "./assets/css/tutorial.css",
  "./assets/js/main.js",
  "./assets/js/menu.js",
  "./manifest.json",
  // IMGs essenciais"
  "./assets/img/APP-192.png",
  "./assets/img/APP-500.png",
  "./assets/img/logo.webp",
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
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🚫 ignora coisas que não são http/https
  if (!url.protocol.startsWith("http")) return;

  // 🚫 só aceita GET
  if (event.request.method !== "GET") return;

  // 🔒 só cacheia coisas do seu próprio site
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. Inicia a busca na rede em segundo plano
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Ignora erro de rede silenciosamente
      });

      // 2. Retorna IMEDIATAMENTE o cache (se existir). 
      // Se não existir, espera a rede.
      return cachedResponse || fetchPromise;
    })
  );
});
