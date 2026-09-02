const CACHE_PREFIX = 'authority-os-shell-';
const CACHE = `${CACHE_PREFIX}v31-safe`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './manifest.webmanifest',
  './icon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/icon-512-maskable.svg'
];

const PRIVATE_PATH = /\/(api|auth|login|logout|admin|session|token|account|profile|user|users|me)(\/|$)/i;
const PRIVATE_QUERY_KEYS = new Set([
  'token', 'access_token', 'refresh_token', 'password', 'passwd', 'secret', 'session',
  'auth', 'authorization', 'api_key', 'apikey', 'key', 'code', 'credential', 'credentials'
]);

function hasPrivateQuery(url) {
  for (const key of url.searchParams.keys()) {
    if (PRIVATE_QUERY_KEYS.has(String(key).toLowerCase())) return true;
  }
  return false;
}

function isRequestCacheSafe(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.headers.has('authorization')) return false;
  if (request.headers.has('cookie')) return false;
  if (request.headers.has('range')) return false;
  if (PRIVATE_PATH.test(url.pathname)) return false;
  if (hasPrivateQuery(url)) return false;
  return true;
}

function isResponseCacheSafe(response) {
  if (!response || !response.ok || response.type === 'opaque' || response.status === 206) return false;
  const cacheControl = (response.headers.get('cache-control') || '').toLowerCase();
  if (cacheControl.includes('private') || cacheControl.includes('no-store')) return false;
  if (response.headers.has('set-cookie')) return false;
  if (response.headers.has('content-range')) return false;
  return true;
}

async function precacheShell() {
  const cache = await caches.open(CACHE);
  await Promise.all(APP_SHELL.map(async path => {
    try {
      const response = await fetch(path, {
        cache: 'no-store',
        credentials: 'omit'
      });
      if (isResponseCacheSafe(response)) {
        await cache.put(path, response.clone());
      }
    } catch (_) {
      // An optional shell asset must not block service-worker installation.
    }
  }));
}

self.addEventListener('install', event => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (!isRequestCacheSafe(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request, { cache: 'no-store' });
      } catch (_) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  const url = new URL(request.url);
  if (url.search) return;
  const shellPath = `.${url.pathname}`;
  if (!APP_SHELL.includes(shellPath)) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request, { cache: 'no-store', credentials: 'omit' });
    if (isResponseCacheSafe(response)) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
