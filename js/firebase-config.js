/* ═══════════════════════════════════════════════
   Firebase 網頁設定
   ───────────────────────────────────────────────
   這幾個值本來就會出現在前端原始碼中,不是機密金鑰;
   真正的存取控制由 Firestore 安全規則(firestore.rules)負責。

   取得方式:Firebase 主控台 → 專案設定 → 一般 → 你的應用程式 → SDK 設定。
   或用 CLI: firebase apps:sdkconfig WEB --project taiwan-art-fighter
   ═══════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: 'taiwan-art-fighter.firebaseapp.com',
  projectId: 'taiwan-art-fighter',
  appId: '',
};

/* Firebase JS SDK 版本(從 gstatic CDN 載入) */
const FIREBASE_SDK = '12.18.0';

/* 本作在共用資料庫中的命名空間。
   同一個 Firebase 專案由 ufjgh368-design.github.io 底下所有作品共用,
   玩家帳號與個人資料相通,各遊戲的進度與排行榜則以此 ID 分開存放。
   姊妹作只需複製本檔並改這一行:
     mohun = 墨魂對決 / canvas-combat = 西洋藝術大亂鬥
     art-adventure = 藝術尋寶大冒險 / adhd-adventure = ADHD 大腦冒險 */
const CLOUD_GAME_ID = 'mohun';
const CLOUD_GAME_NAME = '墨魂對決';
