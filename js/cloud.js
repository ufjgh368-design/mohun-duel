/* ═══════════════════════════════════════════════
   墨魂對決 — 雲端模組(Firebase Auth + Cloud Firestore)
   ───────────────────────────────────────────────
   只使用免費方案功能:Authentication 與 Firestore。
   未設定 / 離線 / 載入失敗時一律優雅降級,遊戲完全以本機模式運作。
   ═══════════════════════════════════════════════ */

const Cloud = {
  /* idle → loading → ready | unavailable */
  status: 'idle',
  user: null,
  fb: null,          // 載入後的 Firebase API 集合
  auth: null,
  db: null,
  pushTimer: null,
  onChange: null,    // UI 註冊的狀態變更回呼

  /* ── 設定 ── */
  config() {
    let cfg = { ...(typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : {}) };
    try {
      const override = JSON.parse(localStorage.getItem('mh_fbcfg') || 'null');
      if (override && override.apiKey) cfg = { ...cfg, ...override };
    } catch (_) { /* 忽略毀損的設定 */ }
    return cfg.apiKey && cfg.projectId ? cfg : null;
  },
  configured() { return !!this.config(); },
  saveConfig(cfg) {
    localStorage.setItem('mh_fbcfg', JSON.stringify(cfg));
  },

  /* ── 載入 SDK(動態 import,失敗即降級) ── */
  async load() {
    if (this.status === 'ready' || this.status === 'loading') return this.status === 'ready';
    const cfg = this.config();
    if (!cfg) { this.status = 'unavailable'; return false; }
    this.status = 'loading';
    this.emit();
    const v = typeof FIREBASE_SDK !== 'undefined' ? FIREBASE_SDK : '12.18.0';
    const base = `https://www.gstatic.com/firebasejs/${v}`;
    try {
      const [app, auth, store] = await Promise.all([
        import(`${base}/firebase-app.js`),
        import(`${base}/firebase-auth.js`),
        import(`${base}/firebase-firestore.js`),
      ]);
      this.fb = { ...app, ...auth, ...store };
      const application = app.initializeApp(cfg);
      this.auth = auth.getAuth(application);
      this.db = store.getFirestore(application);
      try { await auth.setPersistence(this.auth, auth.browserLocalPersistence); } catch (_) {}

      auth.onAuthStateChanged(this.auth, u => {
        this.user = u ? { uid: u.uid, name: u.displayName || '無名畫師', photo: u.photoURL || '', email: u.email || '' } : null;
        this.emit();
      });

      /* 手機瀏覽器可能走 redirect 流程,回來時取結果 */
      auth.getRedirectResult(this.auth).catch(() => {});

      this.status = 'ready';
      this.emit();
      return true;
    } catch (err) {
      console.warn('[Cloud] Firebase 載入失敗,改用本機模式:', err && err.message);
      this.status = 'unavailable';
      this.emit();
      return false;
    }
  },

  emit() { if (typeof this.onChange === 'function') this.onChange(this); },

  /* ── 登入 / 登出 ── */
  async signIn() {
    if (!(await this.load())) throw new Error('cloud-unavailable');
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = this.fb;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const t0 = Date.now();
    try {
      const res = await signInWithPopup(this.auth, provider);
      return res.user;
    } catch (err) {
      const code = err && err.code || '';
      /* 彈窗一開就關,多半是 auth handler 頁面自己出錯(例如 API 金鑰
         的 referrer 限制沒放行 authDomain),而不是使用者主動取消 */
      if (err) err.fastClose = (Date.now() - t0) < 4000;
      /* 彈窗被擋或環境不支援 → 改用轉址 */
      if (code.includes('popup-blocked') || code.includes('popup-closed') || code.includes('operation-not-supported')) {
        await signInWithRedirect(this.auth, provider);
        return null;
      }
      throw err;
    }
  },

  async signOut() {
    if (this.status !== 'ready' || !this.auth) return;
    await this.fb.signOut(this.auth);
  },

  /* ── 共用資料庫的命名空間 ──
     users/{uid}                  玩家檔案(所有姊妹作共用)
     users/{uid}/games/{gameId}   各遊戲進度
     leaderboards/{gameId}/scores/{uid}  各遊戲排行榜(單欄位索引,免建複合索引) */
  gameId() { return typeof CLOUD_GAME_ID !== 'undefined' ? CLOUD_GAME_ID : 'default'; },

  profileDoc() {
    if (!this.user || !this.db) return null;
    return this.fb.doc(this.db, 'users', this.user.uid);
  },
  progressDoc() {
    if (!this.user || !this.db) return null;
    return this.fb.doc(this.db, 'users', this.user.uid, 'games', this.gameId());
  },
  scoreDoc() {
    if (!this.user || !this.db) return null;
    return this.fb.doc(this.db, 'leaderboards', this.gameId(), 'scores', this.user.uid);
  },

  async pull() {
    const ref = this.progressDoc();
    if (!ref) return null;
    try {
      const snap = await this.fb.getDoc(ref);
      return snap.exists() ? (snap.data().progress || null) : null;
    } catch (err) {
      console.warn('[Cloud] 讀取進度失敗:', err && err.message);
      return null;
    }
  },

  async push(progress) {
    const ref = this.progressDoc();
    if (!ref) return false;
    try {
      /* 玩家檔案共用,各遊戲進度分開 */
      await Promise.all([
        this.fb.setDoc(this.profileDoc(), {
          name: this.user.name, photo: this.user.photo,
          lastGame: this.gameId(), updatedAt: this.fb.serverTimestamp(),
        }, { merge: true }),
        this.fb.setDoc(ref, {
          game: this.gameId(),
          progress,
          updatedAt: this.fb.serverTimestamp(),
        }, { merge: true }),
      ]);
      return true;
    } catch (err) {
      console.warn('[Cloud] 寫入進度失敗:', err && err.message);
      return false;
    }
  },

  /* 短時間內多次呼叫只寫一次,節省免費額度 */
  pushSoon(progress, delay = 1200) {
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.push(progress), delay);
  },

  /* ── 雲端排行榜(每位玩家一列最佳成績) ── */
  async submitScore(entry) {
    if (!this.user || !this.db) return false;
    try {
      const ref = this.scoreDoc();
      const snap = await this.fb.getDoc(ref);
      const prevBest = snap.exists() ? (snap.data().best || 0) : 0;
      if (snap.exists() && entry.score <= prevBest) {
        /* 不刷新最佳分數,只更新統計欄位(best 一併帶上,規則才驗得過) */
        await this.fb.setDoc(ref, {
          name: this.user.name, photo: this.user.photo, best: prevBest,
          stars: entry.stars, cards: entry.cards, updatedAt: this.fb.serverTimestamp(),
        }, { merge: true });
        return false;
      }
      await this.fb.setDoc(ref, {
        name: this.user.name, photo: this.user.photo,
        best: entry.score, mode: entry.mode, char: entry.char,
        stars: entry.stars, cards: entry.cards,
        updatedAt: this.fb.serverTimestamp(),
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Cloud] 上傳成績失敗:', err && err.message);
      return false;
    }
  },

  async topScores(n = 20) {
    if (!this.db) return null;
    try {
      const q = this.fb.query(
        this.fb.collection(this.db, 'leaderboards', this.gameId(), 'scores'),
        this.fb.orderBy('best', 'desc'),
        this.fb.limit(n)
      );
      const snap = await this.fb.getDocs(q);
      const rows = [];
      snap.forEach(d => rows.push({ uid: d.id, ...d.data() }));
      return rows;
    } catch (err) {
      console.warn('[Cloud] 讀取排行榜失敗:', err && err.message);
      return null;
    }
  },
};
