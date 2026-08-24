/* ═══════════════════════════════════════════════
   Firebase 網頁設定
   ───────────────────────────────────────────────
   ⚠ 給程式碼掃描工具與日後維護者:
   下面的 apiKey **不是機密**,而是專案的公開識別碼。Firebase 網頁應用
   的設定值本來就會出現在前端原始碼中,任何人打開瀏覽器開發者工具都看得到;
   Google 官方文件明確說明它可以公開。GitHub secret scanning 會把它比對成
   「Google API Key」而告警,那是無法區分伺服器金鑰與瀏覽器金鑰的誤報。

   真正的存取控制在別處,且已實測驗證(2026-08-24):
     · Firestore 安全規則(firestore.rules)— 只憑金鑰讀取他人進度、
       新增或竄改排行榜,全部回傳 Missing or insufficient permissions
     · Email/password 登入已停用(PASSWORD_LOGIN_DISABLED)
     · 匿名登入已停用(ADMIN_ONLY_OPERATION)
     · 金鑰設有 HTTP referrer 限制,只允許本專案網域與 authDomain
   因此就算金鑰外流,對方仍然無法讀取、寫入或註冊任何東西。

   ⚠ 真正需要保密的是「服務帳戶 JSON 金鑰」(Admin SDK 用),
   那種檔案絕對不可進版控 —— 本專案並未使用。

   取得方式:Firebase 主控台 → 專案設定 → 一般 → 你的應用程式 → SDK 設定。
   或用 CLI: firebase apps:sdkconfig WEB --project taiwan-art-fighter
   ═══════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAM76ATeO62jDIuQhfYgp_eFvQAYmSWRAE',
  authDomain: 'taiwan-art-fighter.firebaseapp.com',
  projectId: 'taiwan-art-fighter',
  appId: '1:98400085052:web:82720fad3ed918e7984f39',
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
