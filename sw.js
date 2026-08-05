/* Knowledge Cabinet — offline shell.
   The small startup shell is installed eagerly; chapter, figure and font
   resources join a runtime cache only when a reader uses them. Bump SHELL for
   each shell release. CONTENT stays stable so read drawers survive updates;
   bump it only when the runtime chunk schema changes incompatibly. */
var SHELL = 'cabinet-shell-v14';
var CONTENT = 'cabinet-content-v1';

var FILES = [
  './',
  './index.html',
  './cabinet.css',
  './app.js',
  './content.js',
  './figures.js',
  './clippings.js',
  './manifest.webmanifest',
  './fonts/fonts.css',
  './fonts/bricolage-normal-300_800.woff2',
  './fonts/literata-normal-300_700.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
var SHELL_URLS = FILES.map(function (file) { return new URL(file, self.registration.scope).href; });

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
        return Promise.all(keys.filter(function (k) {
          return (k.indexOf('cabinet-shell-') === 0 && k !== SHELL) ||
            (k.indexOf('cabinet-content-') === 0 && k !== CONTENT);
        })
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

  /* Navigations always resolve to the shell document, even when they carry
     a share_target/bookmarklet query string (?url=...). Cache and match by
     path only in that case — keying on the full request would mint a new,
     permanent cache entry for every distinct link ever shared in. */
  var cacheKey = req.mode === 'navigate' ? url.origin + url.pathname : req.url;
  var cacheName = SHELL_URLS.indexOf(cacheKey) >= 0 ? SHELL : CONTENT;
  e.respondWith(caches.open(cacheName).then(function (cache) {
    return cache.match(cacheKey).then(function (hit) {
      var update = fetch(req).then(function (fresh) {
        if (!fresh || !fresh.ok || fresh.type !== 'basic') return fresh;
        return cache.put(cacheKey, fresh.clone()).then(function () { return fresh; });
      });
      if (hit) {
        /* Refresh in the background so the next open is current. */
        e.waitUntil(update.catch(function (err) {
          console.warn('Knowledge Cabinet cache refresh failed for ' + req.url, err);
        }));
        return hit;
      }
      return update;
    });
  }).catch(function (err) {
    console.warn('Knowledge Cabinet request failed for ' + req.url, err);
    /* A navigation with no network falls back to the shell. */
    if (req.mode === 'navigate') return caches.open(SHELL).then(function (cache) {
      return cache.match('./index.html');
    });
    return Response.error();
  }));
});
