// sw.js — Valise PWA Service Worker
// Estratégia: Stale-While-Revalidate para assets estáticos, Network First para o HTML principal.
//
// IMPORTANTE: sempre que fizer deploy de alterações (mesmo que não toquem neste
// ficheiro), suba o número da versão abaixo. É essa mudança de byte no sw.js que
// faz o navegador detetar uma atualização, instalar o novo worker e limpar o
// cache antigo. Sem isto, o telemóvel pode continuar a servir a versão anterior
// indefinidamente, mesmo reinstalando o atalho do PWA.
const CACHE_VERSION = 'v5';
const CACHE_NAME = `valise-${CACHE_VERSION}`;

// Assets locais que serão cacheados na instalação
const ASSETS_LOCAIS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// Assets externos (fontes, ícones) — cacheados sob demanda (não bloqueiam install)
const ASSETS_EXTERNOS = [
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// ── INSTALL: pré-cacheamento dos assets locais ──────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Assets locais: falha crítica se não conseguir cachear
            return cache.addAll(ASSETS_LOCAIS).then(() => {
                // Assets externos: melhor esforço, sem bloquear instalação
                return Promise.allSettled(
                    ASSETS_EXTERNOS.map(url => cache.add(url).catch(() => {}))
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: limpeza de caches antigos ────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH: estratégia por tipo de recurso ──────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições não-GET e chrome-extension
    if (request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:') return;

    // Google Maps e links externos: sempre rede (não cachear)
    if (url.hostname.includes('google.com') || url.hostname.includes('maps.')) return;

    // HTML principal: Network First (garante versão fresca; cai para cache se offline)
    if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Demais recursos (CSS, JS, fontes, ícones): Stale-While-Revalidate
    // Serve do cache imediatamente (rápido, funciona offline) e, em paralelo,
    // busca na rede para atualizar o cache — assim, mesmo que o sw.js não
    // mude num deploy, a próxima visita já recebe a versão nova.
    event.respondWith(staleWhileRevalidate(request));
});

// ── Helpers de estratégia ──────────────────────────────────────────────────

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached || offlineFallback();
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
        .then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    // O fetch já foi disparado acima; aqui só devolvemos o cache sem esperar
    // por ele, deixando a atualização a terminar em segundo plano.
    if (cached) {
        return cached;
    }

    const fresh = await networkFetch;
    return fresh || offlineFallback();
}

function offlineFallback() {
    return new Response(
        `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Valise — Offline</title>
        <style>
            body { font-family: sans-serif; display: flex; flex-direction: column;
                   align-items: center; justify-content: center; min-height: 100vh;
                   background: #faf8f3; color: #1a3a28; text-align: center; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            p  { font-size: 14px; color: #708075; }
            button { margin-top: 20px; background: #1a3a28; color: #fff;
                     border: none; padding: 12px 24px; border-radius: 12px;
                     font-size: 15px; cursor: pointer; }
        </style></head><body>
        <h1>✈️ Sem conexão</h1>
        <p>O Valise não consegue aceder à rede agora.<br>Os seus dados locais continuam guardados.</p>
        <button onclick="location.reload()">Tentar novamente</button>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
}
