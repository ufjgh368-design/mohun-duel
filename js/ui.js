/* ═══════════════════════════════════════════════
   墨魂對決 — UI 控制(導航 / 選角 / 結算 / 教師 / 圖鑑)
   ═══════════════════════════════════════════════ */

const UI = {
  sel: { mode: null, picks: [], aiLevel: 'normal', pickIndex: 0 },
  unlocks: JSON.parse(localStorage.getItem('mh_unlocks') || '{}'),
  board: JSON.parse(localStorage.getItem('mh_board') || '[]'),
  campaign: JSON.parse(localStorage.getItem('mh_campaign') || '{"unlocked":0,"stars":{}}'),
  cardCol: new Set(JSON.parse(localStorage.getItem('mh_cardcol') || '[]')),
  deck: JSON.parse(localStorage.getItem('mh_deck') || '[]'),

  /* ── 導航 ── */
  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const sc = document.getElementById(id);
    sc.classList.add('active');
    window.scrollTo(0, 0);
  },

  toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.remove('show'); void t.offsetWidth;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  },

  modal(html, onMount) {
    const bd = $('modal'), card = $('modal-card');
    card.innerHTML = html + '<button class="modal-close" id="modal-close">✕</button>';
    bd.classList.remove('hidden');
    requestAnimationFrame(() => bd.classList.add('open'));
    $('modal-close').onclick = () => this.closeModal();
    bd.onclick = e => { if (e.target === bd) this.closeModal(); };
    onMount && onMount(card);
  },
  closeModal() {
    const bd = $('modal');
    bd.classList.remove('open');
    setTimeout(() => bd.classList.add('hidden'), 250);
    AudioEngine.play('cancel');
  },

  /* ── 模式選擇 ── */
  renderModes() {
    const grid = $('mode-grid');
    grid.innerHTML = MODES.map((m, i) => `
      <button class="mode-card ${m.ready ? '' : 'wip'}" data-mode="${m.id}" style="--d:${i * 0.06}s">
        <span class="mode-icon">${m.icon}</span>
        <span class="mode-name">${m.name}</span>
        <span class="mode-desc">${m.desc}</span>
        ${m.ready ? '' : '<span class="mode-wip">開發中</span>'}
      </button>`).join('');
    grid.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      card.addEventListener('click', () => {
        const m = MODES.find(x => x.id === card.dataset.mode);
        if (!m.ready) { AudioEngine.play('cancel'); this.toast('此模式仍在鍛造中,敬請期待!'); return; }
        AudioEngine.play('confirm');
        this.enterMode(m.id);
      });
    });
  },

  enterMode(id) {
    this.sel = { mode: id, picks: [], aiLevel: this.sel.aiLevel || 'normal', pickIndex: 0 };
    if (id === 'teacher') { this.renderTeacher(); this.show('screen-teacher'); return; }
    if (id === 'gallery') { this.renderGallery(); this.show('screen-gallery'); return; }
    if (id === 'practice') { this.renderPracticeSetup(); this.show('screen-practice'); return; }
    if (id === 'campaign') { this.renderCampaign(); this.show('screen-campaign'); return; }
    if (id === 'cards') { this.renderCards(); this.show('screen-cards'); return; }
    this.renderCharSelect();
    this.show('screen-select');
  },

  /* ── 角色選擇 ── */
  renderCharSelect() {
    const mode = this.sel.mode;
    const titles = { solo: '選擇你的藝術家', versus: '雙人選角', survival: '生存試煉 · 選角', boss: '討伐遺忘之霧 · 選角', campaign: '闖關試煉 · 選擇出戰者' };
    $('select-title').textContent = titles[mode] || '選擇角色';
    $('select-hint').textContent = mode === 'versus'
      ? (this.sel.pickIndex === 0 ? '— P1 請選擇角色 —' : '— P2 請選擇角色 —')
      : mode === 'campaign' && this.sel.stage
        ? `${this.sel.stage.chapter}「${this.sel.stage.name}」— 對手:${this.sel.stage.boss ? BOSS_CHAR.name : CHARACTERS.find(c => c.id === this.sel.stage.enemy)?.name}`
        : '點選角色卡查看詳情並選定出戰者';
    $('char-detail').classList.add('hidden');

    const grid = $('char-grid');
    const cardHTML = (c, i) => {
      const picked = this.sel.picks.includes(c.id);
      const unlocked = this.unlocks[c.id];
      return `
      <button class="char-card ${picked ? 'picked' : ''}" data-id="${c.id}" style="--h:${c.hue};--h2:${c.hue2};--d:${Math.min(i * 0.04, 0.6)}s">
        ${picked ? `<span class="pick-badge">${mode === 'versus' && this.sel.picks[1] === c.id ? 'P2' : mode === 'versus' ? 'P1' : '出戰'}</span>` : ''}
        ${unlocked ? '<span class="char-star" title="已通關">✦</span>' : ''}
        <span class="char-portrait"><img src="${c.img}" alt="${c.name}" loading="lazy"></span>
        <span class="char-name">${c.name}</span>
        <span class="char-title">${c.title}</span>
        <span class="char-era">${c.era}</span>
        <span class="char-tags">${c.tags.slice(0, 2).map(t => `<i>${t}</i>`).join('')}</span>
        <span class="char-diff">${'◆'.repeat(c.difficulty)}${'◇'.repeat(5 - c.difficulty)}</span>
      </button>`;
    };
    let html = '', idx = 0;
    for (const med of MEDIUMS) {
      const group = CHARACTERS.filter(c => c.medium === med);
      if (!group.length) continue;
      html += `<div class="medium-header"><span>${med}</span><i>${group.length} 位</i></div>`;
      html += group.map(c => cardHTML(c, idx++)).join('');
    }
    grid.innerHTML = html;

    grid.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      card.addEventListener('click', () => this.pickChar(card.dataset.id));
    });

    /* AI 難度列 */
    const diffRow = $('ai-difficulty-row');
    if (mode === 'solo' || mode === 'boss') {
      diffRow.classList.remove('hidden');
      $('diff-btns').innerHTML = AI_LEVELS.map(l => `
        <button class="diff-btn ${l.id === this.sel.aiLevel ? 'on' : ''}" data-lvl="${l.id}">${l.name}<i>${l.label}</i></button>`).join('');
      $('diff-btns').querySelectorAll('.diff-btn').forEach(b => {
        b.addEventListener('click', () => {
          AudioEngine.play('click');
          this.sel.aiLevel = b.dataset.lvl;
          $('diff-btns').querySelectorAll('.diff-btn').forEach(x => x.classList.toggle('on', x === b));
        });
      });
    } else diffRow.classList.add('hidden');

    this.updatePickStatus();
  },

  pickChar(id) {
    const c = CHARACTERS.find(x => x.id === id);
    AudioEngine.play('select');
    const mode = this.sel.mode;
    if (mode === 'versus') {
      if (this.sel.pickIndex === 0) { this.sel.picks = [id]; this.sel.pickIndex = 1; }
      else if (this.sel.picks[0] === id) { this.toast('P2 請選擇不同的角色'); return; }
      else { this.sel.picks[1] = id; }
    } else {
      this.sel.picks = [id];
    }
    this.showCharDetail(c);
    this.renderCharSelect();
  },

  showCharDetail(c) {
    const det = $('char-detail');
    const statBar = (label, v) => `
      <div class="stat-row"><span>${label}</span>
        <div class="stat-bar"><div style="width:${v * 10}%"></div></div><b>${v}</b></div>`;
    det.innerHTML = `
      <div class="detail-inner" style="--h:${c.hue};--h2:${c.hue2}">
        <div class="detail-left">
          <div class="detail-portrait"><img src="${c.img}" alt="${c.name}"></div>
          <div class="detail-name">${c.name}</div>
          <div class="detail-title">${c.title} · ${c.origin}</div>
          <div class="detail-era">${c.era}</div>
          <div class="detail-tags">${c.tags.map(t => `<i>${t}</i>`).join('')}</div>
        </div>
        <div class="detail-mid">
          <p class="detail-desc">${c.desc}</p>
          <div class="detail-stats">
            ${statBar('攻擊', c.stats.atk)}${statBar('防禦', c.stats.def)}
            ${statBar('速度', c.stats.spd)}${statBar('學識', c.stats.wis)}
          </div>
        </div>
        <div class="detail-right">
          <div class="detail-skill"><i>輕擊</i><b>${c.skills.light.name}</b><span>${c.skills.light.desc}</span></div>
          <div class="detail-skill"><i>重擊</i><b>${c.skills.heavy.name}</b><span>${c.skills.heavy.desc}</span></div>
          <div class="detail-skill ultra"><i>必殺</i><b>${c.skills.ultra.name}</b><span>${c.skills.ultra.desc}</span></div>
        </div>
      </div>`;
    det.classList.remove('hidden');
    det.classList.remove('pop-in'); void det.offsetWidth;
    det.classList.add('pop-in');
  },

  updatePickStatus() {
    const mode = this.sel.mode;
    const btn = $('btn-battle-start');
    const status = $('pick-status');
    const nameOf = id => CHARACTERS.find(c => c.id === id)?.name || '—';
    let ready = false;
    if (mode === 'versus') {
      status.innerHTML = `<span class="ps p1">P1 · ${nameOf(this.sel.picks[0]) || '未選'}</span><span class="ps-vs">VS</span><span class="ps p2">P2 · ${this.sel.picks[1] ? nameOf(this.sel.picks[1]) : '未選'}</span>`;
      ready = this.sel.picks.length === 2 && !!this.sel.picks[1];
    } else {
      status.innerHTML = this.sel.picks[0] ? `<span class="ps p1">出戰 · ${nameOf(this.sel.picks[0])}</span>` : '';
      ready = this.sel.picks.length === 1;
    }
    btn.classList.toggle('hidden', !ready);
  },

  launchBattle() {
    const mode = this.sel.mode;
    const p1Char = CHARACTERS.find(c => c.id === this.sel.picks[0]);
    let p2Char, aiLevel = this.sel.aiLevel;
    if (mode === 'campaign') {
      const st = this.sel.stage;
      p2Char = st.boss ? BOSS_CHAR : CHARACTERS.find(c => c.id === st.enemy);
      Battle.start({ mode, p1Char, p2Char, aiLevel: st.ai, wave: 0, p2Hp: st.hp, stageIdx: CAMPAIGN_STAGES.indexOf(st), stageName: st.name });
      return;
    }
    if (mode === 'versus') p2Char = CHARACTERS.find(c => c.id === this.sel.picks[1]);
    else if (mode === 'boss') { p2Char = BOSS_CHAR; aiLevel = this.sel.aiLevel; }
    else if (mode === 'survival') {
      p2Char = this.randomEnemy(p1Char.id);
      aiLevel = AI_LEVELS[0].id;
    } else {
      p2Char = this.randomEnemy(p1Char.id);
    }
    Battle.start({ mode, p1Char, p2Char, aiLevel, wave: 0 });
  },

  randomEnemy(excludeId) {
    const pool = CHARACTERS.filter(c => c.id !== excludeId);
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* ── 勝負結算 ── */
  showResult(state, winnerIdx) {
    const win = state.p[winnerIdx];
    const p1 = state.p[0], p2 = state.p[1];
    const playerWon = !win.isCPU;
    const isVersus = state.mode === 'versus';

    const acc = f => f.st.total ? Math.round(f.st.correct / f.st.total * 100) : 0;
    const avgT = f => f.st.total ? (f.st.timeSum / f.st.total).toFixed(1) : '0.0';
    const score = f => f.st.correct * 100 + f.st.maxCombo * 40 + Math.round(f.st.dmg) + (acc(f) >= 80 ? 150 : 0);

    /* MVP:雙人取分數高者;單人取玩家 */
    const mvp = isVersus ? (score(p1) >= score(p2) ? p1 : p2) : p1;

    /* 解鎖與排行榜(玩家獲勝才記錄) */
    let unlockMsg = '';
    if (playerWon || isVersus) {
      const uc = win.char.id;
      if (!this.unlocks[uc] && uc !== 'boss-oblivion') {
        this.unlocks[uc] = true;
        localStorage.setItem('mh_unlocks', JSON.stringify(this.unlocks));
        unlockMsg = `<div class="unlock-banner">✦ 圖鑑解鎖:${win.char.name}的代表作品!</div>`;
      }
    }
    const recF = isVersus ? mvp : p1;
    const rec = { name: recF.char.name, mode: state.mode, wave: state.wave, score: score(recF), date: new Date().toISOString().slice(0, 10) };
    if (playerWon || isVersus) {
      this.board.push(rec);
      this.board.sort((a, b) => b.score - a.score);
      this.board = this.board.slice(0, 20);
      localStorage.setItem('mh_board', JSON.stringify(this.board));
    }

    const statCol = (f, label) => `
      <div class="result-col">
        <div class="rc-name">${label} ${f.char.name}${mvp === f && isVersus ? ' <b class="mvp">MVP</b>' : ''}</div>
        <div class="rc-stat"><span>答對率</span><b>${acc(f)}%</b></div>
        <div class="rc-stat"><span>答題數</span><b>${f.st.correct} / ${f.st.total}</b></div>
        <div class="rc-stat"><span>平均時間</span><b>${avgT(f)} 秒</b></div>
        <div class="rc-stat"><span>最大連擊</span><b>${f.st.maxCombo}</b></div>
        <div class="rc-stat"><span>總傷害</span><b>${Math.round(f.st.dmg)}</b></div>
        <div class="rc-stat score"><span>知識分數</span><b>${score(f)}</b></div>
      </div>`;

    const survival = state.mode === 'survival';
    const campaign = state.mode === 'campaign';
    const title = isVersus ? `${win.char.name} 勝利!` : playerWon ? 'VICTORY' : 'DEFEAT';

    /* 闖關進度與星級 */
    let stageBanner = '';
    const st = campaign && state.stageIdx != null ? CAMPAIGN_STAGES[state.stageIdx] : null;
    if (st && playerWon) {
      const a = acc(p1);
      const stars = a >= 80 ? 3 : a >= 60 ? 2 : 1;
      this.campaign.stars[st.id] = Math.max(this.campaign.stars[st.id] || 0, stars);
      if (state.stageIdx + 1 > this.campaign.unlocked) this.campaign.unlocked = state.stageIdx + 1;
      localStorage.setItem('mh_campaign', JSON.stringify(this.campaign));
      const allClear = this.campaign.unlocked >= CAMPAIGN_STAGES.length;
      stageBanner = `<div class="unlock-banner">🗺 「${st.name}」通關 ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${allClear && st.boss ? ' — 美術史行旅 全章制霸!' : ''}</div>`;
    }

    const card = $('result-card');
    card.innerHTML = `
      <div class="result-title ${playerWon || isVersus ? 'win' : 'lose'}">${title}</div>
      <div class="result-sub">${campaign && st ? `${st.chapter}「${st.name}」${playerWon ? '通過' : '受阻'}` : survival ? `第 ${state.wave + 1} 陣 ${playerWon ? '通過' : '止步'}` : isVersus ? '雙人對決結束' : playerWon ? win.char.skills.ultra.name + ' · 藝魂長存' : '莫氣餒,再讀再戰!'}</div>
      ${stageBanner}
      ${unlockMsg}
      <div class="result-cols">${statCol(p1, isVersus ? 'P1' : '玩家')}${isVersus || true ? statCol(p2, isVersus ? 'P2' : '對手') : ''}</div>
      <div class="result-actions">
        ${survival && playerWon ? '<button class="btn btn-gold btn-lg" id="btn-next-wave">下一陣 ▸</button>' : ''}
        ${campaign && playerWon && state.stageIdx + 1 < CAMPAIGN_STAGES.length ? '<button class="btn btn-gold btn-lg" id="btn-next-stage">下一關 ▸</button>' : ''}
        <button class="btn btn-gold" id="btn-rematch">${survival && playerWon ? '見好就收' : campaign ? '重選角色再戰' : '再戰一場'}</button>
        ${campaign ? '<button class="btn btn-ghost" id="btn-to-map">關卡地圖</button>' : ''}
        <button class="btn btn-ghost" id="btn-to-modes">返回模式</button>
        <button class="btn btn-ghost" id="btn-to-home">回首頁</button>
      </div>`;

    const bd = $('result-modal');
    bd.classList.remove('hidden');
    requestAnimationFrame(() => bd.classList.add('open'));

    const close = () => { bd.classList.remove('open'); setTimeout(() => bd.classList.add('hidden'), 250); };

    if (survival && playerWon) {
      $('btn-next-wave').onclick = () => {
        AudioEngine.play('confirm'); close();
        const wave = state.wave + 1;
        const lvlIdx = Math.min(wave, AI_LEVELS.length - 1);
        Battle.start({
          mode: 'survival', wave,
          p1Char: p1.char, p2Char: this.randomEnemy(p1.char.id),
          aiLevel: AI_LEVELS[lvlIdx].id,
          p1Hp: p1.maxHp, p1CurHp: clamp(p1.hp + 35, 1, p1.maxHp),
        });
      };
      $('btn-rematch').onclick = () => { AudioEngine.play('click'); close(); this.show('screen-modes'); this.toast(`生存紀錄:${state.wave + 1} 陣 · 已寫入排行榜`); };
    } else {
      $('btn-rematch').onclick = () => {
        AudioEngine.play('confirm'); close();
        this.renderCharSelect(); this.show('screen-select');
      };
    }
    const nextStageBtn = $('btn-next-stage');
    if (nextStageBtn) nextStageBtn.onclick = () => {
      AudioEngine.play('confirm'); close();
      const nst = CAMPAIGN_STAGES[state.stageIdx + 1];
      this.sel = { mode: 'campaign', stage: nst, picks: [p1.char.id], aiLevel: this.sel.aiLevel, pickIndex: 0 };
      Battle.start({
        mode: 'campaign', p1Char: p1.char,
        p2Char: nst.boss ? BOSS_CHAR : CHARACTERS.find(c => c.id === nst.enemy),
        aiLevel: nst.ai, p2Hp: nst.hp, stageIdx: state.stageIdx + 1, stageName: nst.name,
      });
    };
    const mapBtn = $('btn-to-map');
    if (mapBtn) mapBtn.onclick = () => { AudioEngine.play('click'); close(); this.renderCampaign(); this.show('screen-campaign'); };
    $('btn-to-modes').onclick = () => { AudioEngine.play('click'); close(); this.show('screen-modes'); };
    $('btn-to-home').onclick = () => { AudioEngine.play('click'); close(); this.show('screen-home'); };
  },

  /* ── 練習模式 ── */
  practice: { score: 0, streak: 0, total: 0, correct: 0, diff: 0, used: new Set() },
  renderPracticeSetup() {
    this.practice = { score: 0, streak: 0, total: 0, correct: 0, diff: 0, used: new Set() };
    $('practice-score').textContent = '';
    $('practice-wrap').innerHTML = `
      <div class="practice-setup fade-up">
        <h3>選擇修練難度</h3>
        <div class="practice-diff-row">
          <button class="mode-card sm" data-d="1"><span class="mode-icon">☘</span><span class="mode-name">初階</span><span class="mode-desc">基礎題 · 認識藝術家</span></button>
          <button class="mode-card sm" data-d="2"><span class="mode-icon">⚜</span><span class="mode-name">進階</span><span class="mode-desc">中等題 · 深入生平</span></button>
          <button class="mode-card sm" data-d="3"><span class="mode-icon">👑</span><span class="mode-name">大師</span><span class="mode-desc">困難題 · 挑戰史實細節</span></button>
          <button class="mode-card sm" data-d="0"><span class="mode-icon">🎲</span><span class="mode-name">混合</span><span class="mode-desc">全難度隨機出題</span></button>
        </div>
      </div>`;
    $('practice-wrap').querySelectorAll('.mode-card').forEach(b => {
      b.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      b.addEventListener('click', () => { AudioEngine.play('confirm'); this.practice.diff = +b.dataset.d; this.practiceNext(); });
    });
  },

  practiceNext() {
    const p = this.practice;
    const d = p.diff === 0 ? irand(1, 3) : p.diff;
    let pool = Bank.byDiff(d).filter(q => !p.used.has(q.q));
    if (!pool.length) { p.used.clear(); pool = Bank.byDiff(d); }
    const q = pool[Math.floor(Math.random() * pool.length)];
    p.used.add(q.q);
    const order = shuffled([0, 1, 2, 3]);
    const answer = order.indexOf(q.a);

    $('practice-score').innerHTML = `<span class="prac-score">分數 ${p.score} · 連對 ${p.streak} · 答對 ${p.correct}/${p.total}</span>`;
    $('practice-wrap').innerHTML = `
      <div class="q-panel practice-q fade-up">
        <div class="q-meta">
          <span class="q-cat">${q.cat || '知識'}</span>
          <span class="q-diff">${'★'.repeat(q.diff)}${'☆'.repeat(3 - q.diff)}</span>
        </div>
        <div class="q-text">${q.q}</div>
        <div class="q-choices">
          ${order.map((o, idx) => `<button class="q-choice" data-i="${idx}"><span class="q-key">${'ABCD'[idx]}</span><span>${q.c[o]}</span></button>`).join('')}
        </div>
        <div class="q-exp hidden" id="prac-exp"></div>
        <div class="prac-next hidden" id="prac-next"><button class="btn btn-gold">下一題 ▸</button></div>
      </div>`;

    const wrap = $('practice-wrap');
    wrap.querySelectorAll('.q-choice').forEach(b => {
      b.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      b.addEventListener('click', () => {
        const chosen = +b.dataset.i;
        const correct = chosen === answer;
        p.total++;
        if (correct) { p.correct++; p.streak++; p.score += q.diff * 50 + p.streak * 10; }
        else p.streak = 0;
        wrap.querySelectorAll('.q-choice').forEach((x, idx) => {
          x.disabled = true;
          if (idx === answer) x.classList.add('reveal-correct');
          if (idx === chosen && !correct) x.classList.add('reveal-wrong');
        });
        AudioEngine.play(correct ? 'correct' : 'wrong');
        const exp = $('prac-exp');
        if (q.exp) { exp.textContent = (correct ? '✦ ' : '✧ ') + q.exp; exp.classList.remove('hidden'); }
        $('practice-score').innerHTML = `<span class="prac-score">分數 ${p.score} · 連對 ${p.streak} · 答對 ${p.correct}/${p.total}</span>`;
        const nx = $('prac-next');
        nx.classList.remove('hidden');
        nx.querySelector('button').onclick = () => { AudioEngine.play('click'); this.practiceNext(); };
      });
    });
  },

  /* ── 教師模式 ── */
  renderTeacher() {
    const wrap = $('teacher-wrap');
    const rows = Bank.custom.map((q, i) => `
      <tr>
        <td class="tq">${q.q}</td>
        <td>${q.c[q.a]}</td>
        <td>${'★'.repeat(q.diff)}</td>
        <td>${q.cat || ''}</td>
        <td><button class="btn btn-tiny btn-danger" data-del="${i}">刪除</button></td>
      </tr>`).join('');

    wrap.innerHTML = `
      <div class="teacher-grid fade-up">
        <div class="glass-box">
          <h3>新增題目</h3>
          <label class="fld">題目<textarea id="tq-q" rows="2" placeholder="例:陳澄波的故鄉是哪座城市?"></textarea></label>
          <div class="fld-row">
            <label class="fld">選項 A(正確答案)<input id="tq-a" placeholder="嘉義"></label>
            <label class="fld">選項 B<input id="tq-b" placeholder="臺南"></label>
          </div>
          <div class="fld-row">
            <label class="fld">選項 C<input id="tq-c" placeholder="臺北"></label>
            <label class="fld">選項 D<input id="tq-d" placeholder="新竹"></label>
          </div>
          <div class="fld-row">
            <label class="fld">難度
              <select id="tq-diff"><option value="1">★ 輕擊(易)</option><option value="2">★★ 重擊(中)</option><option value="3">★★★ 必殺(難)</option></select>
            </label>
            <label class="fld">分類<input id="tq-cat" placeholder="人物 / 作品 / 歷史 / 風格"></label>
          </div>
          <label class="fld">解說(答題後顯示)<input id="tq-exp" placeholder="補充知識點,加深學習印象"></label>
          <button class="btn btn-gold" id="tq-add">加入題庫</button>
        </div>

        <div class="glass-box">
          <h3>CSV 匯入 / 匯出</h3>
          <p class="hint-text">欄位順序:${CSV_HEADER.join('、')}。可由 Excel / Google 試算表「下載為 CSV」後匯入。</p>
          <div class="fld-row">
            <label class="btn btn-ghost file-btn">選擇 CSV 檔案<input type="file" id="csv-file" accept=".csv,text/csv" hidden></label>
            <button class="btn btn-ghost" id="csv-export">匯出自訂題庫 CSV</button>
            <button class="btn btn-ghost" id="csv-template">下載範本</button>
          </div>
          <label class="fld">或直接貼上 CSV 內容<textarea id="csv-paste" rows="4" placeholder="題目,選項A,選項B,選項C,選項D,A,1,人物,解說文字"></textarea></label>
          <button class="btn btn-gold" id="csv-import">匯入貼上內容</button>
          <div class="teacher-toggle">
            <label class="switch-row">
              <input type="checkbox" id="custom-only" ${Bank.useCustomOnly ? 'checked' : ''}>
              <span>對戰時<b>只使用</b>自訂題庫(未勾選時與內建題庫混用)</span>
            </label>
          </div>
        </div>

        <div class="glass-box wide">
          <h3>自訂題庫(${Bank.custom.length} 題)<span class="hint-text" style="float:right">內建題庫 ${QUESTIONS.length} 題</span></h3>
          ${Bank.custom.length ? `
            <div class="table-scroll"><table class="q-table">
              <thead><tr><th>題目</th><th>正解</th><th>難度</th><th>分類</th><th></th></tr></thead>
              <tbody>${rows}</tbody>
            </table></div>` : '<p class="hint-text">尚無自訂題目。新增或匯入後,學生對戰時就會抽到你的題目!</p>'}
          ${Bank.custom.length ? '<button class="btn btn-danger btn-sm" id="clear-custom">清空自訂題庫</button>' : ''}
        </div>
      </div>`;

    /* 新增題目 */
    $('tq-add').onclick = () => {
      const g = id => $(id).value.trim();
      const q = g('tq-q'), A = g('tq-a'), B = g('tq-b'), C = g('tq-c'), D = g('tq-d');
      if (!q || !A || !B || !C || !D) { this.toast('題目與四個選項皆為必填'); AudioEngine.play('cancel'); return; }
      Bank.custom.push({ q, c: [A, B, C, D], a: 0, diff: +$('tq-diff').value, cat: g('tq-cat') || '自訂', exp: g('tq-exp') });
      Bank.save();
      AudioEngine.play('confirm');
      this.toast('已加入題庫!');
      this.renderTeacher();
    };

    /* 刪除 / 清空 */
    wrap.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      Bank.custom.splice(+b.dataset.del, 1); Bank.save();
      AudioEngine.play('cancel'); this.renderTeacher();
    });
    const clearBtn = $('clear-custom');
    if (clearBtn) clearBtn.onclick = () => {
      if (!confirm('確定清空全部自訂題庫?此動作無法復原。')) return;
      Bank.custom = []; Bank.save(); this.renderTeacher(); this.toast('已清空自訂題庫');
    };

    /* 只用自訂題庫 */
    $('custom-only').onchange = e => {
      Bank.useCustomOnly = e.target.checked; Bank.save();
      this.toast(Bank.useCustomOnly ? '對戰將只出自訂題目' : '對戰將混用內建與自訂題目');
    };

    /* CSV */
    $('csv-file').onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => this.importCSV(reader.result);
      reader.readAsText(file, 'utf-8');
      e.target.value = '';
    };
    $('csv-import').onclick = () => {
      const txt = $('csv-paste').value.trim();
      if (!txt) { this.toast('請先貼上 CSV 內容'); return; }
      this.importCSV(txt);
    };
    $('csv-export').onclick = () => {
      if (!Bank.custom.length) { this.toast('目前沒有自訂題目可匯出'); return; }
      const lines = [CSV_HEADER.join(',')];
      for (const q of Bank.custom) {
        const esc = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
        lines.push([q.q, q.c[0], q.c[1], q.c[2], q.c[3], 'ABCD'[q.a], q.diff, q.cat || '', q.exp || ''].map(esc).join(','));
      }
      this.downloadFile('墨魂對決-自訂題庫.csv', '﻿' + lines.join('\n'));
      AudioEngine.play('confirm');
    };
    $('csv-template').onclick = () => {
      const tpl = [CSV_HEADER.join(','),
        '"郭雪湖《南街殷賑》描繪哪條街?","迪化街","衡陽路","中山路","博愛路","A","1","作品","描繪大稻埕迪化街的節慶盛況"'].join('\n');
      this.downloadFile('題庫範本.csv', '﻿' + tpl);
      AudioEngine.play('confirm');
    };
  },

  downloadFile(name, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },

  /* 簡易 CSV 解析(支援引號欄位) */
  parseCSV(text) {
    const rows = [];
    let row = [], cell = '', inQ = false;
    text = text.replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; }
        else cell += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.some(c => c.trim() !== '')) rows.push(row);
        row = [];
      } else cell += ch;
    }
    row.push(cell);
    if (row.some(c => c.trim() !== '')) rows.push(row);
    return rows;
  },

  importCSV(text) {
    const rows = this.parseCSV(text);
    let added = 0, skipped = 0;
    for (const r of rows) {
      if (r[0] && r[0].includes('題目')) continue; // 標題列
      if (r.length < 6) { skipped++; continue; }
      const [q, A, B, C, D, ans, diff, cat, exp] = r.map(x => (x ?? '').trim());
      const aIdx = 'ABCD'.indexOf((ans || 'A').toUpperCase());
      if (!q || !A || !B || !C || !D || aIdx === -1) { skipped++; continue; }
      Bank.custom.push({ q, c: [A, B, C, D], a: aIdx, diff: clamp(parseInt(diff) || 1, 1, 3), cat: cat || '自訂', exp: exp || '' });
      added++;
    }
    Bank.save();
    AudioEngine.play(added ? 'confirm' : 'cancel');
    this.toast(`匯入完成:成功 ${added} 題${skipped ? `,略過 ${skipped} 列` : ''}`);
    this.renderTeacher();
  },

  /* ── 圖鑑 ── */
  renderGallery() {
    const unlockedCount = CHARACTERS.filter(c => this.unlocks[c.id]).length;
    $('gallery-progress').innerHTML = `<span class="prac-score">收藏進度 ${unlockedCount} / ${CHARACTERS.length}</span>`;
    const gCardHTML = (c, i) => {
      const un = this.unlocks[c.id];
      return `
      <div class="gallery-card fade-up ${un ? 'unlocked' : ''}" style="--h:${c.hue};--h2:${c.hue2};--d:${Math.min(i * 0.04, 0.6)}s" data-id="${c.id}">
        <div class="g-head">
          <span class="g-mono"><img src="${c.img}" alt="${c.name}" loading="lazy"></span>
          <div><div class="g-name">${c.name} ${un ? '<i class="g-star">✦</i>' : ''}</div><div class="g-title">${c.title} · ${c.era}</div></div>
        </div>
        <p class="g-desc">${c.desc}</p>
        <div class="g-works">
          ${c.works.map(w => `
            <div class="g-work ${un ? '' : 'locked'}">
              ${un ? `<b>《${w.title}》</b><span>${w.year} · ${w.note}</span>` : `<b>???</b><span>以此角色獲勝後解鎖</span>`}
            </div>`).join('')}
        </div>
      </div>`;
    };
    let gHtml = '', gIdx = 0;
    for (const med of MEDIUMS) {
      const group = CHARACTERS.filter(c => c.medium === med);
      if (!group.length) continue;
      gHtml += `<div class="medium-header"><span>${med}</span><i>${group.length} 位</i></div>`;
      gHtml += group.map(c => gCardHTML(c, gIdx++)).join('');
    }
    $('gallery-wrap').innerHTML = gHtml;
  },

  /* ── 闖關模式:美術史行旅 ── */
  renderCampaign() {
    const prog = this.campaign;
    const totalStars = Object.values(prog.stars).reduce((s, n) => s + n, 0);
    $('campaign-progress').innerHTML = `<span class="prac-score">進度 ${Math.min(prog.unlocked, CAMPAIGN_STAGES.length)} / ${CAMPAIGN_STAGES.length} 關 · ★ ${totalStars} / ${CAMPAIGN_STAGES.length * 3}</span>`;

    let html = '', lastChapter = '';
    CAMPAIGN_STAGES.forEach((st, i) => {
      if (st.chapter !== lastChapter) {
        lastChapter = st.chapter;
        html += `<div class="chapter-header"><span>${st.chapter}</span></div>`;
      }
      const enemy = st.boss ? BOSS_CHAR : CHARACTERS.find(c => c.id === st.enemy);
      const cleared = i < prog.unlocked;
      const current = i === prog.unlocked;
      const locked = i > prog.unlocked;
      const stars = prog.stars[st.id] || 0;
      html += `
        <button class="stage-node ${cleared ? 'cleared' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''} ${st.boss ? 'boss' : ''}"
                data-idx="${i}" ${locked ? 'disabled' : ''} style="--h:${enemy.hue};--h2:${enemy.hue2}">
          <span class="sn-no">${st.boss ? '👹' : i + 1}</span>
          <span class="sn-thumb">${enemy.img ? `<img src="${enemy.img}" alt="${enemy.name}" loading="lazy">` : `<b class="sn-mono">${enemy.mono}</b>`}</span>
          <span class="sn-body">
            <b class="sn-name">${st.name}</b>
            <i class="sn-enemy">${locked ? '???' : `對手 · ${enemy.name}`} · ${AI_LEVELS.find(l => l.id === st.ai)?.label || ''} · HP ${st.hp}</i>
            <i class="sn-intro">${locked ? '完成前一關後解鎖' : st.intro}</i>
          </span>
          <span class="sn-stars">${cleared ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : current ? '▶ 挑戰' : '🔒'}</span>
        </button>`;
    });
    $('campaign-wrap').innerHTML = html;

    $('campaign-wrap').querySelectorAll('.stage-node:not(.locked)').forEach(node => {
      node.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      node.addEventListener('click', () => {
        AudioEngine.play('confirm');
        const st = CAMPAIGN_STAGES[+node.dataset.idx];
        this.sel = { mode: 'campaign', stage: st, picks: [], aiLevel: this.sel.aiLevel, pickIndex: 0 };
        this.renderCharSelect();
        this.show('screen-select');
      });
    });
  },

  /* ── 卡牌模式 ── */
  cardCollected(card) {
    return card.wi === 0 || this.unlocks[card.charId] || this.cardCol.has(card.id);
  },

  renderCards() {
    const collected = CARDS.filter(c => this.cardCollected(c));
    /* 清掉牌組中已失效的卡 */
    this.deck = this.deck.filter(id => { const c = CARDS.find(x => x.id === id); return c && this.cardCollected(c); });
    $('cards-progress').innerHTML = `<span class="prac-score">收藏 ${collected.length} / ${CARDS.length} 張</span>`;

    const deckSlots = Array.from({ length: 5 }, (_, i) => {
      const card = CARDS.find(c => c.id === this.deck[i]);
      return card
        ? `<div class="deck-slot filled" data-id="${card.id}" style="--h:${card.hue}"><img src="${card.img}" alt=""><span>《${card.title}》</span><i>力 ${card.power}</i></div>`
        : `<div class="deck-slot"><span>空位</span></div>`;
    }).join('');

    let listHtml = '';
    for (const med of MEDIUMS) {
      const group = CARDS.filter(c => c.medium === med);
      listHtml += `<div class="medium-header"><span>${med}</span><i>${group.filter(c => this.cardCollected(c)).length} / ${group.length} 張</i></div>`;
      listHtml += `<div class="wcard-grid">` + group.map(c => {
        const got = this.cardCollected(c);
        const inDeck = this.deck.includes(c.id);
        return `
        <div class="wcard collectible ${got ? '' : 'locked'} ${inDeck ? 'in-deck' : ''}" data-id="${c.id}" style="--h:${c.hue};--h2:${c.hue2}">
          ${inDeck ? '<span class="wcard-badge">牌組</span>' : ''}
          <div class="wcard-head"><img src="${c.img}" alt="" loading="lazy"><span>${got ? c.name : '???'}</span></div>
          <div class="wcard-title">${got ? `《${c.title}》` : '尚未收藏'}</div>
          <div class="wcard-year">${got ? c.year : `以${c.name}獲勝或卡牌獎勵解鎖`}</div>
          <div class="wcard-foot">
            <span class="wcard-medium m-${MEDIUMS.indexOf(c.medium)}">${c.medium === '雕塑與現代藝術' ? '雕塑現代' : c.medium}</span>
            <span class="wcard-power">力 ${c.power}</span>
          </div>
        </div>`;
      }).join('') + `</div>`;
    }

    $('cards-wrap').innerHTML = `
      <div class="deck-bar glass-box">
        <div class="deck-bar-head">
          <h3>我的牌組(${this.deck.length} / 5)</h3>
          <div class="deck-rules">媒材相剋:油畫 ▶ 膠彩 ▶ 水彩 ▶ 油畫(+4)· 雕塑現代恆定 +1 · 每回合答題:對 +5 / 錯 −3 · 五回合定勝負</div>
        </div>
        <div class="deck-slots">${deckSlots}</div>
        <div class="deck-actions">
          <div class="difficulty-row"><span class="diff-label">對手</span>
            <div class="diff-btns" id="card-diff-btns">${AI_LEVELS.map(l => `<button class="diff-btn ${l.id === this.sel.aiLevel ? 'on' : ''}" data-lvl="${l.id}">${l.name}<i>${l.label}</i></button>`).join('')}</div>
          </div>
          <button class="btn btn-gold btn-lg ${this.deck.length === 5 ? '' : 'hidden'}" id="btn-card-battle">開始對決</button>
        </div>
      </div>
      <div class="cards-list">${listHtml}</div>`;

    /* 收藏卡點擊 → 加入/移出牌組 */
    $('cards-wrap').querySelectorAll('.wcard.collectible:not(.locked)').forEach(el => {
      el.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (this.deck.includes(id)) { this.deck = this.deck.filter(x => x !== id); AudioEngine.play('cancel'); }
        else if (this.deck.length >= 5) { this.toast('牌組已滿 5 張,先點掉一張'); AudioEngine.play('cancel'); return; }
        else { this.deck.push(id); AudioEngine.play('select'); }
        localStorage.setItem('mh_deck', JSON.stringify(this.deck));
        this.renderCards();
      });
    });
    /* 牌組槽點擊移除 */
    $('cards-wrap').querySelectorAll('.deck-slot.filled').forEach(el => {
      el.addEventListener('click', () => {
        this.deck = this.deck.filter(x => x !== el.dataset.id);
        localStorage.setItem('mh_deck', JSON.stringify(this.deck));
        AudioEngine.play('cancel');
        this.renderCards();
      });
    });
    $('card-diff-btns').querySelectorAll('.diff-btn').forEach(b => {
      b.addEventListener('click', () => {
        AudioEngine.play('click');
        this.sel.aiLevel = b.dataset.lvl;
        $('card-diff-btns').querySelectorAll('.diff-btn').forEach(x => x.classList.toggle('on', x === b));
      });
    });
    const battleBtn = $('btn-card-battle');
    if (battleBtn) battleBtn.onclick = () => { AudioEngine.play('confirm'); CardGame.start(this.deck, this.sel.aiLevel); };
  },

  finishCardGame(res) {
    /* 勝利抽一張新卡 */
    let boosterMsg = '';
    if (res.win) {
      const pool = CARDS.filter(c => !this.cardCollected(c));
      if (pool.length) {
        const newCard = pool[Math.floor(Math.random() * pool.length)];
        this.cardCol.add(newCard.id);
        localStorage.setItem('mh_cardcol', JSON.stringify([...this.cardCol]));
        boosterMsg = `<div class="unlock-banner">🃏 獲得新卡:${newCard.name}《${newCard.title}》!</div>`;
      } else {
        boosterMsg = '<div class="unlock-banner">🃏 九十張作品卡已全數收藏,策展人向你致敬!</div>';
      }
      AudioEngine.play('victory');
      BattleFX.fireworks(null, 5);
    } else {
      AudioEngine.play(res.tie ? 'miss' : 'defeat');
    }

    const score = res.score[0] * 100 + res.correct * 50;
    if (res.win) {
      this.board.push({ name: '卡牌策展人', mode: 'cards', score, date: new Date().toISOString().slice(0, 10) });
      this.board.sort((a, b) => b.score - a.score);
      this.board = this.board.slice(0, 20);
      localStorage.setItem('mh_board', JSON.stringify(this.board));
    }

    const card = $('result-card');
    card.innerHTML = `
      <div class="result-title ${res.win ? 'win' : 'lose'}">${res.win ? 'VICTORY' : res.tie ? 'DRAW' : 'DEFEAT'}</div>
      <div class="result-sub">卡牌對決 ${res.score[0]} : ${res.score[1]} · 答對 ${res.correct} / ${res.total}${res.win ? ` · 知識分數 ${score}` : ''}</div>
      ${boosterMsg}
      <div class="result-actions">
        <button class="btn btn-gold" id="btn-card-again">再來一局</button>
        <button class="btn btn-ghost" id="btn-card-deck">回牌組</button>
        <button class="btn btn-ghost" id="btn-card-home">回首頁</button>
      </div>`;
    const bd = $('result-modal');
    bd.classList.remove('hidden');
    requestAnimationFrame(() => bd.classList.add('open'));
    const close = () => { bd.classList.remove('open'); setTimeout(() => bd.classList.add('hidden'), 250); };
    $('btn-card-again').onclick = () => { AudioEngine.play('confirm'); close(); CardGame.start(this.deck, this.sel.aiLevel); };
    $('btn-card-deck').onclick = () => { AudioEngine.play('click'); close(); this.renderCards(); this.show('screen-cards'); };
    $('btn-card-home').onclick = () => { AudioEngine.play('click'); close(); this.show('screen-home'); };
  },

  /* ── 排行榜 ── */
  showLeaderboard() {
    const modeName = { solo: '單人', versus: '雙人', survival: '生存', boss: 'BOSS', campaign: '闖關', cards: '卡牌' };
    const rows = this.board.slice(0, 10).map((r, i) => `
      <tr class="${i < 3 ? 'top' + (i + 1) : ''}">
        <td>${i + 1}</td><td>${r.name}</td>
        <td>${modeName[r.mode] || r.mode}${r.mode === 'survival' ? ` · ${(r.wave ?? 0) + 1} 陣` : ''}</td>
        <td class="score-cell">${r.score}</td><td>${r.date}</td>
      </tr>`).join('');
    this.modal(`
      <h3 class="modal-title">排行榜</h3>
      ${this.board.length ? `
        <table class="board-table">
          <thead><tr><th>#</th><th>出戰角色</th><th>模式</th><th>知識分數</th><th>日期</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : '<p class="hint-text" style="text-align:center;padding:24px 0">尚無紀錄 — 打一場勝仗,名留藝史!</p>'}
    `);
  },

  /* ── 設定 ── */
  showSettings() {
    this.modal(`
      <h3 class="modal-title">設定</h3>
      <div class="settings-list">
        <label class="switch-row"><input type="checkbox" id="set-bgm" ${AudioEngine.bgmOn ? 'checked' : ''}><span>背景音樂</span></label>
        <label class="switch-row"><input type="checkbox" id="set-sfx" ${AudioEngine.sfxOn ? 'checked' : ''}><span>介面與戰鬥音效</span></label>
        <hr class="settings-hr">
        <button class="btn btn-danger btn-sm" id="set-reset">重置全部進度(圖鑑 / 排行榜 / 題庫)</button>
      </div>
    `, card => {
      card.querySelector('#set-bgm').onchange = () => { AudioEngine.toggleBGM(); this.syncAudioBtns(); };
      card.querySelector('#set-sfx').onchange = () => { AudioEngine.toggleSFX(); this.syncAudioBtns(); };
      card.querySelector('#set-reset').onclick = () => {
        if (!confirm('確定重置全部進度?圖鑑、排行榜與自訂題庫都會清空。')) return;
        ['mh_unlocks', 'mh_board', 'mh_custom_q', 'mh_custom_only', 'mh_campaign', 'mh_cardcol', 'mh_deck'].forEach(k => localStorage.removeItem(k));
        this.unlocks = {}; this.board = []; Bank.custom = []; Bank.useCustomOnly = false;
        this.campaign = { unlocked: 0, stars: {} }; this.cardCol = new Set(); this.deck = [];
        this.closeModal(); this.toast('已重置全部進度');
      };
    });
  },

  syncAudioBtns() {
    $('btn-bgm').classList.toggle('off', !AudioEngine.bgmOn);
    $('btn-sfx').classList.toggle('off', !AudioEngine.sfxOn);
    $('btn-sfx').textContent = AudioEngine.sfxOn ? '🔊' : '🔇';
  },

  /* ── 初始化 ── */
  init() {
    /* 首次互動啟動音訊 */
    const boot = () => { AudioEngine.init(); document.removeEventListener('pointerdown', boot); };
    document.addEventListener('pointerdown', boot);

    $('btn-start').onclick = () => { AudioEngine.play('confirm'); this.renderModes(); this.show('screen-modes'); };
    $('btn-gallery-home').onclick = () => { AudioEngine.play('click'); this.renderGallery(); this.show('screen-gallery'); };
    $('btn-leaderboard').onclick = () => { AudioEngine.play('click'); this.showLeaderboard(); };
    $('btn-settings').onclick = () => { AudioEngine.play('click'); this.showSettings(); };
    $('btn-bgm').onclick = () => { AudioEngine.init(); AudioEngine.toggleBGM(); this.syncAudioBtns(); AudioEngine.play('click'); };
    $('btn-sfx').onclick = () => { AudioEngine.init(); AudioEngine.toggleSFX(); this.syncAudioBtns(); };

    document.querySelectorAll('[data-back]').forEach(b => {
      b.addEventListener('click', () => {
        AudioEngine.play('cancel');
        const target = b.dataset.back;
        if (target === 'screen-modes') this.renderModes();
        this.show(target);
      });
    });

    $('btn-battle-start').onclick = () => { AudioEngine.play('confirm'); this.launchBattle(); };

    $('cb-quit').onclick = () => {
      if (CardGame.s && !CardGame.s.over && !confirm('確定放棄這場卡牌對決?')) return;
      CardGame.quit();
      AudioEngine.play('cancel');
      this.renderCards();
      this.show('screen-cards');
    };

    $('btn-flee').onclick = () => {
      if (!confirm('確定離開這場戰鬥?進度不會保存。')) return;
      Battle.stopTimer();
      if (Battle.s) Battle.s.over = true;
      AudioEngine.play('cancel');
      this.renderModes();
      this.show('screen-modes');
    };

    /* 全域按鈕 hover 音 */
    document.body.addEventListener('mouseenter', e => {
      if (e.target instanceof Element && e.target.closest('.btn:not(.q-choice)')) AudioEngine.play('hover');
    }, true);

    this.syncAudioBtns();
  },
};

document.addEventListener('DOMContentLoaded', () => UI.init());
