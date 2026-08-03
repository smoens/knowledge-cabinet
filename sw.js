/* Knowledge Cabinet — offline shell.
   Cache-first for the shell so the book opens on a plane, on a train, and on
   an iPad with no signal. Bump SHELL when any shell file changes: the old
   cache is dropped wholesale on activate, so there is no partial-update state. */
var SHELL = 'cabinet-shell-v7';

var FILES = [
  './',
  './index.html',
  './cabinet.css',
  './app.js',
  './content.js',
  './figures.js',
  './manifest.webmanifest',
  './fonts/fonts.css',
  './fonts/bricolage-normal-300_800.woff2',
  './fonts/literata-normal-300_700.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== SHELL; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) {
        /* Refresh in the background so the next open is current. */
        fetch(req).then(function (fresh) {
          if (fresh && fresh.ok) caches.open(SHELL).then(function (c) { c.put(req, fresh); });
        }).catch(function () {});
        return hit;
      }
      return fetch(req).then(function (fresh) {
        if (fresh && fresh.ok && fresh.type === 'basic') {
          var copy = fresh.clone();
          caches.open(SHELL).then(function (c) { c.put(req, copy); });
        }
        return fresh;
      }).catch(function () {
        /* A navigation with no network falls back to the shell. */
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
