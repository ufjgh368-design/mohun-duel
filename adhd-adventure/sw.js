/* 我的 ADHD 大腦冒險 Service Worker — 離線快取 */
/* 全遊戲零外部素材（純 emoji + CSS），所以清單很短 */
const CACHE = 'adhd-adventure-v1';
/* 不放 '.'：目錄 URL 在沒有目錄索引的伺服器會 404，
   addAll 只要一項失敗，整個 install 就失敗、SW 永遠裝不起來。
   離線直接開 /adhd-adventure/ 時，由下方 fetch 的 index.html 後備處理。 */
const ASSETS = [
  'index.html', 'manifest.json',
  'css/style.css',
  'js/data.js', 'js/app.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k.startsWith('adhd-adventure')).map(k => caches.delete(k))
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
