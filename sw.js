// garde la page pour l'ouvrir sans réseau ; version mamie-e24ed37ca66e
var V = "mamie-e24ed37ca66e";
var COQUILLE = ["./","index.html","manifest.json","icone-180.png","icone-512.png"];
var TOUS = ["./","index.html","manifest.json","icone-180.png","icone-512.png","p0.bin","p1.bin","p2.bin","p3.bin","p4.bin"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    // première installation : la page d'entrée range elle-même les morceaux en les téléchargeant ;
    // mise à jour : tout est rapatrié d'avance, pour que la nouvelle version s'ouvre aussi sans réseau
    var maj = cles.some(function (k) { return k.indexOf('mamie-') === 0 && k !== V; });
    return caches.open(V).then(function (c) { return c.addAll(maj ? TOUS : COQUILLE); });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k.indexOf('mamie-') === 0 && k !== V; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(V).then(function (c) {
    var cle = e.request.mode === 'navigate' ? 'index.html' : e.request;
    return c.match(cle, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request).then(function (rep) {
        if (rep.ok && e.request.mode !== 'navigate') c.put(e.request, rep.clone());
        return rep;
      });
    });
  }).catch(function () { return fetch(e.request); }));
});
