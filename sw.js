/* 墨魂對決 Service Worker — 離線快取 */
const CACHE = 'mohun-v5';
const ASSETS = [
  '.', 'index.html', 'css/style.css',
  'js/data.js', 'js/audio.js', 'js/fx.js', 'js/game.js', 'js/ui.js',
  'manifest.json', 'assets/hero-bg.jpg', 'assets/audio/bgm.mp3',
  'assets/char/chen-chengpo.jpg', 'assets/char/huang-tushui.jpg',
  'assets/char/kuo-hsuehhu.jpg', 'assets/char/chen-chin.jpg',
  'assets/char/li-meishu.jpg', 'assets/char/li-tsefan.jpg',
  'assets/char/liao-chichun.jpg', 'assets/char/ni-chianghuai.jpg',
  'assets/char/pu-tiensheng.jpg', 'assets/char/lan-yinding.jpg',
  'assets/char/li-shihchiao.jpg', 'assets/char/hung-juilin.jpg',
  'assets/char/yen-shuilong.jpg', 'assets/char/yang-sanlang.jpg',
  'assets/char/kuo-pochuan.jpg', 'assets/char/liu-chihsiang.jpg',
  'assets/char/chen-chihchi.jpg', 'assets/char/chang-wanchuan.jpg',
  'assets/char/chen-tewang.jpg', 'assets/char/yeh-huocheng.jpg',
  'assets/char/liao-techeng.jpg', 'assets/char/shen-chetsai.jpg',
  'assets/char/lin-yushan.jpg', 'assets/char/lu-tiehchou.jpg',
  'assets/char/lin-chihchu.jpg', 'assets/char/chen-huikun.jpg',
  'assets/char/hsiao-jusung.jpg', 'assets/char/chen-hsiayu.jpg',
  'assets/char/yang-yingfeng.jpg', 'assets/char/chuang-shihho.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
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
