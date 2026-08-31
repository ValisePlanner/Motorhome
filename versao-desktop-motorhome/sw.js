/* =============================================================
   Valise Manager — Service Worker
   Estratégia: Cache-First para assets estáticos
                Network-First para CDN (Chart.js, FontAwesome)
   © 2025 José Ricardo Verona Alves
   ============================================================= */

const CACHE_NAME = 'valise-v1.0.3';
const CACHE_CDN  = 'valise-cdn-v1.0.0';

/* Assets locais — cacheados imediatamente na instalação */
const STATIC_ASSETS = [
  './index.html',
  './script.js',
  './style.css',
  './manifest.json',
  './LogoMi.ico',
  './LogoM02.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

/* URLs de CDN — cacheadas na primeira requisição */
const CDN_PATTERNS = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'flagcdn.com'
];

/* ── Instalação: pré-cache dos assets locais ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Ativação: remove caches antigos ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_CDN)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: estratégias diferenciadas por tipo de recurso ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Ignora requisições não-GET e chrome-extension */
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  /* CDN: Network-First com fallback para cache */
  if (CDN_PATTERNS.some(p => url.hostname.includes(p))) {
    event.respondWith(networkFirstCDN(event.request));
    return;
  }

  /* Assets locais: Cache-First com fallback para rede */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstLocal(event.request));
    return;
  }
});

/* Cache-First para arquivos locais */
async function cacheFirstLocal(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /* Offline e sem cache: retorna página principal como fallback */
    return caches.match('./index.html');
  }
}

/* Network-First para CDN */
async function networkFirstCDN(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_CDN);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

/* ── Mensagem para forçar atualização manual ── */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
