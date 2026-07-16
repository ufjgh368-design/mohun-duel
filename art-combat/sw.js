/* Canvas Combat Service Worker — 離線快取 */
const CACHE = 'art-combat-v3';
const ASSETS = [
  '.', 'index.html', 'css/style.css',
  'js/data.js', 'js/questions.js', 'js/audio.js', 'js/fx.js', 'js/game.js', 'js/ui.js',
  'manifest.json', 'assets/hero-bg.jpg', 'assets/audio/bgm.mp3',
  'assets/char/leonardo.png', 'assets/char/michelangelo.png', 'assets/char/raphael.png',
  'assets/char/caravaggio.png', 'assets/char/vermeer.png', 'assets/char/rembrandt.png', 'assets/char/goya.png',
  'assets/char/turner.png', 'assets/char/monet.png', 'assets/char/degas.png',
  'assets/char/cezanne.png', 'assets/char/vangogh.png', 'assets/char/dali.png',
  'assets/char/kahlo.png', 'assets/char/warhol.png', 'assets/char/picasso.png',
  'assets/char/kandinsky.png', 'assets/char/klimt.png',
  'assets/char/botticelli.png', 'assets/char/renoir.png', 'assets/char/gauguin.png',
  'assets/char/munch.png', 'assets/char/matisse.png', 'assets/char/pollock.png', 'assets/char/titian.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith('art-combat')).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 網路優先:上線永遠拿最新版,離線時退回快取 */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.url.startsWith(self.location.origin)) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html')))
  );
});
