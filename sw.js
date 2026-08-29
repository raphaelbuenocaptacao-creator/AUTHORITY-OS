const CACHE = 'authority-os-shell-v25';
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

const PRIVATE_PATH = /\/(api|auth|login|logout|admin|session|token|account|profile|user|me)(\/|$)/i;
const PRIVATE_QUERY = /(token|access_token|refresh_token|password|secret|session|auth)=/i;

function isCacheSafe(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.headers.has('authorization')) return false;
  if (request.headers.has('cookie')) return false;
  if (PRIVATE_PATH.test(url.pathname)) return false;
  if (PRIVATE_QUERY.test(url.search)) return false;
  return true;
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (!isCacheSafe(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  const url = new URL(request.url);
  const shellPath = `.${url.pathname}`;
  if (!APP_SHELL.includes(shellPath)) return;

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
