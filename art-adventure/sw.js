/* 藝術尋寶大冒險 Service Worker — 離線快取 */
/* 注意：SW 作用域為 /art-adventure/，因此所有素材都放在本資料夾內
   （立繪已由上層 ../assets/char/ 複製進來，否則離線時無法攔截） */
const CACHE = 'art-adventure-v1';
/* 不放 '.'：目錄 URL 在部分伺服器（含本機 serve.ps1）無目錄索引會 404，
   一旦 addAll 有任何一項失敗就整個 install 失敗、SW 永遠裝不起來。
   離線直接開 /art-adventure/ 時，由下方 fetch 的 index.html 後備處理。 */
const ASSETS = [
  'index.html', 'manifest.json',
  'css/style.css',
  'js/data.js', 'js/app.js',
  'assets/char/chen-chengpo.jpg',
  'assets/char/huang-tushui.jpg',
  'assets/char/kuo-hsuehhu.jpg',
  'assets/char/li-meishu.jpg',
  'assets/char/lan-yinding.jpg',
  'assets/works/tamsui.jpg',
  'assets/works/chiayi-park.jpg',
  'assets/works/mt-yu.jpg',
  'assets/works/buffaloes.jpg',
  'assets/works/nanjie.jpg',
  'assets/works/holiday.jpg',
  'assets/works/street-1927.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k.startsWith('art-adventure')).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* 網路優先：上線永遠拿最新版，離線時退回快取 */
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
