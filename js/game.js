/* ═══════════════════════════════════════════════
   墨魂對決 — 戰鬥引擎(回合制 × 答題判定 × AI)
   ═══════════════════════════════════════════════ */

/* ── 題庫管理 ── */
const Bank = {
  custom: JSON.parse(localStorage.getItem('mh_custom_q') || '[]'),
  useCustomOnly: JSON.parse(localStorage.getItem('mh_custom_only') || 'false'),
  save() {
    localStorage.setItem('mh_custom_q', JSON.stringify(this.custom));
    localStorage.setItem('mh_custom_only', JSON.stringify(this.useCustomOnly));
  },
  all() {
    if (this.useCustomOnly && this.custom.length) return this.custom.slice();
    return QUESTIONS.concat(this.custom);
  },
  byDiff(d) {
    const pool = this.all().filter(q => q.diff === d);
    return pool.length ? pool : this.all();
  },
};

const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const $ = id => document.getElementById(id);

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── 技能參數 ── */
const SKILL_DEF = {
  light: { key: 'light', label: '輕擊', diff: 1, base: 10, time: 20, energy: 25, crit: 0,    counter: 0,  hint: '簡單題 · 必中 · 低傷害' },
  heavy: { key: 'heavy', label: '重擊', diff: 2, base: 20, time: 25, energy: 35, crit: 0.25, counter: 8,  hint: '中等題 · 可暴擊 · 答錯遭反擊' },
  ultra: { key: 'ultra', label: '必殺', diff: 3, base: 46, time: 30, energy: 0,  crit: 0.15, counter: 12, hint: '連續兩題 · 全中釋放奧義 · 需集滿氣力' },
};

const Battle = {
  s: null,
  usedQ: new Set(),
  timerInt: null,

  /* config: {mode, p1Char, p2Char, aiLevel, wave} */
  start(config) {
    const mkFighter = (char, isCPU, hpMax) => ({
      char, isCPU, hp: hpMax, maxHp: hpMax, energy: 0, combo: 0,
      aiLevel: config.aiLevel,
      st: { correct: 0, total: 0, timeSum: 0, maxCombo: 0, dmg: 0 },
    });
    const wave = config.wave || 0;
    let p2hp = 100;
    if (config.mode === 'boss') p2hp = 240;
    if (config.mode === 'survival') p2hp = 100 + wave * 18;
    if (config.p2Hp) p2hp = config.p2Hp;

    this.s = {
      mode: config.mode, wave, stageIdx: config.stageIdx,
      round: 1, turn: 0, over: false,
      p: [mkFighter(config.p1Char, false, config.p1Hp || 100), mkFighter(config.p2Char, config.mode !== 'versus', p2hp)],
    };
    if (config.p1CurHp != null) this.s.p[0].hp = config.p1CurHp;
    this.stopTimer();
    this.usedQ.clear();
    UI.show('screen-battle');
    this.renderFighters();
    this.updateHUD();
    $('battle-bottom').innerHTML = '';
    this.announce(config.mode === 'boss' ? 'BOSS 降臨' : config.mode === 'survival' ? `第 ${wave + 1} 陣` : config.stageName ? config.stageName : '對決開始', 'big');
    AudioEngine.play('turn');
    setTimeout(() => this.beginTurn(), 1400);
  },

  fighterEl(i) { return $(i === 0 ? 'fighter-p1' : 'fighter-p2'); },

  renderFighters() {
    [0, 1].forEach(i => {
      const f = this.s.p[i];
      const c = f.char;
      const el = this.fighterEl(i);
      el.className = 'fighter ' + (i === 0 ? 'fighter-left' : 'fighter-right');
      el.innerHTML = c.img ? `
        <div class="fighter-figure" style="--h:${c.hue};--h2:${c.hue2}">
          <div class="figure-aura"></div>
          <img class="fighter-img" src="${c.img}" alt="${c.name}">
        </div>
        <div class="fighter-shadow"></div>` : `
        <div class="medallion" style="--h:${c.hue};--h2:${c.hue2}">
          <div class="medallion-ring"></div>
          <div class="medallion-mono">${c.mono}</div>
        </div>
        <div class="fighter-shadow"></div>`;
      el.classList.toggle('boss-size', c.id === 'boss-oblivion');
      $(i === 0 ? 'name-p1' : 'name-p2').textContent = c.name;
      $(i === 0 ? 'tag-p1' : 'tag-p2').textContent = f.isCPU ? (this.s.mode === 'boss' ? 'BOSS' : `CPU · ${AI_LEVELS.find(l => l.id === f.aiLevel)?.label || ''}`) : (this.s.mode === 'versus' ? `P${i + 1}` : '玩家');
    });
  },

  updateHUD() {
    [0, 1].forEach(i => {
      const f = this.s.p[i];
      const hpP = clamp(f.hp / f.maxHp * 100, 0, 100);
      const hpEl = $(i === 0 ? 'hp-p1' : 'hp-p2');
      hpEl.style.width = hpP + '%';
      hpEl.classList.toggle('low', hpP < 30);
      $(i === 0 ? 'hptext-p1' : 'hptext-p2').textContent = `${Math.ceil(f.hp)} / ${f.maxHp}`;
      $(i === 0 ? 'en-p1' : 'en-p2').style.width = clamp(f.energy, 0, 100) + '%';
      const comboEl = $(i === 0 ? 'combo-p1' : 'combo-p2');
      comboEl.textContent = f.combo >= 2 ? `${f.combo} COMBO` : '';
      if (f.combo >= 2) { comboEl.classList.remove('pop'); void comboEl.offsetWidth; comboEl.classList.add('pop'); }
    });
    $('round-label').textContent = `ROUND ${this.s.round}`;
  },

  announce(text, kind = '') {
    const el = $('announce');
    el.innerHTML = `<span class="${kind}">${text}</span>`;
    el.classList.remove('show'); void el.offsetWidth;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1300);
  },

  /* ── 回合流程 ── */
  beginTurn() {
    if (this.s.over) return;
    const i = this.s.turn;
    const f = this.s.p[i];
    this.setActiveGlow(i);
    this.announce(`${f.char.name} 的回合`);
    AudioEngine.play('turn');
    setTimeout(() => {
      if (f.isCPU) this.cpuTurn();
      else this.renderSkillSelect();
    }, 1100);
  },

  setActiveGlow(i) {
    $('panel-p1').classList.toggle('active-turn', i === 0);
    $('panel-p2').classList.toggle('active-turn', i === 1);
    this.fighterEl(0).classList.toggle('active-turn', i === 0);
    this.fighterEl(1).classList.toggle('active-turn', i === 1);
  },

  renderSkillSelect() {
    const i = this.s.turn;
    const f = this.s.p[i];
    const c = f.char;
    const bb = $('battle-bottom');
    const btn = key => {
      const sd = SKILL_DEF[key];
      const sk = c.skills[key];
      const locked = key === 'ultra' && f.energy < 100;
      return `
        <button class="skill-btn ${key} ${locked ? 'locked' : ''}" data-skill="${key}" ${locked ? 'disabled' : ''}>
          <span class="skill-type">${sd.label}</span>
          <span class="skill-name">${sk.name}</span>
          <span class="skill-hint">${locked ? '氣力不足 — 集滿後解放' : sd.hint}</span>
          ${key === 'ultra' && !locked ? '<span class="skill-ready">奧義解放!</span>' : ''}
        </button>`;
    };
    bb.innerHTML = `
      <div class="skill-panel fade-up">
        <div class="skill-panel-title">${this.s.mode === 'versus' ? `P${i + 1} ` : ''}${c.name} — 選擇招式</div>
        <div class="skill-row">${btn('light')}${btn('heavy')}${btn('ultra')}</div>
      </div>`;
    bb.querySelectorAll('.skill-btn:not(.locked)').forEach(b => {
      b.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      b.addEventListener('click', () => {
        AudioEngine.play('confirm');
        this.playerUseSkill(b.dataset.skill);
      });
    });
  },

  playerUseSkill(key) {
    const sd = SKILL_DEF[key];
    const f = this.s.p[this.s.turn];
    const skillName = f.char.skills[key].name;
    this.announce(`${sd.label} · ${skillName}`);
    if (key === 'ultra') {
      f.energy = 0; this.updateHUD();
      this.askChain(2, sd, [], skillName);
    } else {
      setTimeout(() => this.askQuestion(sd, res => this.resolveAttack(sd, res, skillName)), 900);
    }
  },

  /* 必殺:連續多題 */
  askChain(remaining, sd, results, skillName) {
    if (remaining === 0) {
      const allCorrect = results.every(r => r.correct);
      const avgTime = results.reduce((s, r) => s + r.time, 0) / results.length;
      this.resolveAttack(sd, { correct: allCorrect, time: avgTime }, skillName);
      return;
    }
    const stepNo = results.length + 1;
    setTimeout(() => {
      this.askQuestion(sd, res => {
        results.push(res);
        if (!res.correct) { this.askChain(0, sd, results, skillName); }
        else {
          if (remaining - 1 > 0) this.announce(`奧義試煉 ${stepNo} / 2 通過!`);
          this.askChain(remaining - 1, sd, results, skillName);
        }
      }, `奧義試煉 · 第 ${stepNo} 題 / 2`);
    }, 700);
  },

  /* ── 出題 ── */
  pickQuestion(diff) {
    let pool = Bank.byDiff(diff).filter(q => !this.usedQ.has(q.q));
    if (!pool.length) { this.usedQ.clear(); pool = Bank.byDiff(diff); }
    const q = pool[Math.floor(Math.random() * pool.length)];
    this.usedQ.add(q.q);
    const order = shuffled([0, 1, 2, 3]);
    return { q, choices: order.map(o => q.c[o]), answer: order.indexOf(q.a) };
  },

  askQuestion(sd, cb, subtitle = '') {
    const { q, choices, answer } = this.pickQuestion(sd.diff);
    const f = this.s.p[this.s.turn];
    const bb = $('battle-bottom');
    const diffStars = '★'.repeat(sd.diff) + '☆'.repeat(3 - sd.diff);
    bb.innerHTML = `
      <div class="q-panel fade-up">
        <div class="q-meta">
          <span class="q-cat">${q.cat || '知識'}</span>
          <span class="q-diff">${diffStars}</span>
          ${subtitle ? `<span class="q-sub">${subtitle}</span>` : ''}
        </div>
        <div class="q-text">${q.q}</div>
        <div class="q-choices">
          ${choices.map((c, idx) => `
            <button class="q-choice" data-i="${idx}">
              <span class="q-key">${'ABCD'[idx]}</span><span>${c}</span>
            </button>`).join('')}
        </div>
        <div class="q-exp hidden" id="q-exp"></div>
      </div>`;

    const t0 = performance.now();
    let done = false;

    const finish = (chosen, timedOut = false) => {
      if (done) return; done = true;
      this.stopTimer();
      const time = (performance.now() - t0) / 1000;
      const correct = !timedOut && chosen === answer;
      f.st.total++; f.st.timeSum += Math.min(time, sd.time);
      if (correct) f.st.correct++;
      bb.querySelectorAll('.q-choice').forEach((b, idx) => {
        b.disabled = true;
        if (idx === answer) b.classList.add('reveal-correct');
        if (idx === chosen && !correct) b.classList.add('reveal-wrong');
      });
      const exp = $('q-exp');
      if (q.exp) { exp.textContent = (correct ? '✦ ' : '✧ ') + q.exp; exp.classList.remove('hidden'); }
      AudioEngine.play(correct ? 'correct' : 'wrong');
      setTimeout(() => cb({ correct, time }), q.exp ? 1900 : 1100);
    };

    bb.querySelectorAll('.q-choice').forEach(b => {
      b.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      b.addEventListener('click', () => { AudioEngine.play('click'); finish(+b.dataset.i); });
    });

    this.startTimer(sd.time, () => finish(-1, true));
  },

  /* ── CPU 回合 ── */
  cpuTurn() {
    const f = this.s.p[1];
    const lvl = AI_LEVELS.find(l => l.id === f.aiLevel) || AI_LEVELS[1];
    // 策略:氣滿依機率放必殺;血量落後偏好重擊
    let key = 'light';
    if (f.energy >= 100 && Math.random() < lvl.ultraUse) key = 'ultra';
    else {
      const behind = f.hp < this.s.p[0].hp;
      const heavyProb = clamp(lvl.acc - 0.15 + (behind ? 0.25 : 0), 0.2, 0.9);
      if (Math.random() < heavyProb) key = 'heavy';
    }
    const sd = SKILL_DEF[key];
    const skillName = f.char.skills[key].name;
    this.announce(`${sd.label} · ${skillName}`);
    if (key === 'ultra') f.energy = 0, this.updateHUD();

    const doOne = (step, results) => {
      const need = key === 'ultra' ? 2 : 1;
      if (step > need || (results.length && !results[results.length - 1].correct)) {
        const allCorrect = results.length === need && results.every(r => r.correct);
        const avgTime = results.reduce((s, r) => s + r.time, 0) / results.length;
        this.resolveAttack(sd, { correct: allCorrect, time: avgTime }, skillName);
        return;
      }
      this.cpuAnswer(sd, lvl, res => { results.push(res); doOne(step + 1, results); },
        key === 'ultra' ? `奧義試煉 · 第 ${step} 題 / 2` : '');
    };
    setTimeout(() => doOne(1, []), 900);
  },

  cpuAnswer(sd, lvl, cb, subtitle) {
    const { q, choices, answer } = this.pickQuestion(sd.diff);
    const f = this.s.p[1];
    const bb = $('battle-bottom');
    const acc = clamp(lvl.acc - (sd.diff - 1) * 0.09, 0.1, 0.98);
    const willCorrect = Math.random() < acc;
    const chosen = willCorrect ? answer : shuffled([0, 1, 2, 3].filter(i => i !== answer))[0];
    const think = rand(lvl.thinkMin, lvl.thinkMax) * 1000;

    bb.innerHTML = `
      <div class="q-panel fade-up cpu">
        <div class="q-meta">
          <span class="q-cat">${q.cat || '知識'}</span>
          <span class="q-diff">${'★'.repeat(sd.diff)}${'☆'.repeat(3 - sd.diff)}</span>
          <span class="q-sub cpu-think">CPU 思考中<span class="dots"><i>.</i><i>.</i><i>.</i></span></span>
          ${subtitle ? `<span class="q-sub">${subtitle}</span>` : ''}
        </div>
        <div class="q-text">${q.q}</div>
        <div class="q-choices">
          ${choices.map((c, idx) => `
            <button class="q-choice" disabled data-i="${idx}">
              <span class="q-key">${'ABCD'[idx]}</span><span>${c}</span>
            </button>`).join('')}
        </div>
      </div>`;

    setTimeout(() => {
      const btns = bb.querySelectorAll('.q-choice');
      btns[chosen]?.classList.add('cpu-pick');
      AudioEngine.play('click');
      setTimeout(() => {
        f.st.total++; f.st.timeSum += think / 1000;
        if (willCorrect) f.st.correct++;
        btns.forEach((b, idx) => {
          if (idx === answer) b.classList.add('reveal-correct');
          if (idx === chosen && !willCorrect) b.classList.add('reveal-wrong');
        });
        AudioEngine.play(willCorrect ? 'correct' : 'wrong');
        setTimeout(() => cb({ correct: willCorrect, time: think / 1000 }), 1000);
      }, 800);
    }, think);
  },

  /* ── 計時器 ── */
  startTimer(seconds, onTimeout) {
    this.stopTimer();
    const ring = $('timer-ring'), text = $('timer-text');
    const t0 = performance.now();
    ring.classList.add('running');
    this.timerInt = setInterval(() => {
      const left = seconds - (performance.now() - t0) / 1000;
      const pct = clamp(left / seconds, 0, 1);
      ring.style.setProperty('--p', pct);
      ring.classList.toggle('danger', left < 6);
      const shown = Math.max(0, Math.ceil(left));
      if (text.textContent !== String(shown)) {
        text.textContent = shown;
        if (left < 6 && left > 0) AudioEngine.play('tick');
      }
      if (left <= 0) { this.stopTimer(); onTimeout(); }
    }, 80);
  },
  stopTimer() {
    if (this.timerInt) clearInterval(this.timerInt);
    this.timerInt = null;
    const ring = $('timer-ring');
    ring.classList.remove('running', 'danger');
    ring.style.setProperty('--p', 1);
    $('timer-text').textContent = '–';
  },

  /* ── 攻擊結算 ── */
  resolveAttack(sd, res, skillName) {
    const ai = this.s.turn, di = 1 - ai;
    const atk = this.s.p[ai], def = this.s.p[di];
    const atkEl = this.fighterEl(ai), defEl = this.fighterEl(di);
    const dir = ai === 0 ? 1 : -1;
    const defX = di === 0 ? 28 : 72;
    $('battle-bottom').innerHTML = '';

    const performHit = (dmg, isCrit, isUltra) => {
      BattleFX.dash(atkEl, dir);
      AudioEngine.play(isUltra ? 'attackH' : sd.key === 'light' ? 'attackL' : 'attackH');
      setTimeout(() => {
        BattleFX.slash(ai === 0 ? 'left' : 'right', sd.key !== 'light');
        BattleFX.hitStop(defEl);
        BattleFX.burst(defX, 46, atk.char.hue, isUltra ? 34 : isCrit ? 24 : 14, isUltra);
        BattleFX.shake(isUltra ? 2.2 : isCrit ? 1.5 : 0.8);
        if (isCrit || isUltra) BattleFX.flash(isUltra ? 'rgba(255,215,120,0.5)' : 'rgba(255,255,255,0.35)');
        AudioEngine.play(isUltra ? 'ko' : isCrit ? 'crit' : 'hit');
        BattleFX.damageNumber(defX, 34, Math.round(dmg), isUltra ? 'ultra' : isCrit ? 'crit' : 'normal');
        if (isCrit && !isUltra) BattleFX.damageNumber(defX, 22, 'CRITICAL!', 'crit-label');
        def.hp = clamp(def.hp - dmg, 0, def.maxHp);
        def.energy = clamp(def.energy + 12, 0, 100);
        atk.st.dmg += dmg;
        this.updateHUD();
        setTimeout(() => this.afterAction(), 900);
      }, 420);
    };

    if (res.correct) {
      atk.combo++;
      atk.st.maxCombo = Math.max(atk.st.maxCombo, atk.combo);
      if (sd.key !== 'ultra') {
        atk.energy = clamp(atk.energy + sd.energy, 0, 100);
        if (atk.energy >= 100) AudioEngine.play('energy');
      }
      const comboMult = 1 + clamp(atk.combo - 1, 0, 5) * 0.1;
      const speedBonus = res.time < sd.time * 0.35 ? 1.12 : 1;
      const isCrit = Math.random() < sd.crit;
      let dmg = sd.base * (1 + atk.char.stats.atk * 0.045) * comboMult * speedBonus * rand(0.92, 1.08);
      dmg *= (1 - def.char.stats.def * 0.018);
      if (isCrit) dmg *= 1.6;
      if (this.s.mode === 'boss' && this.s.turn === 1) dmg *= 1.2;

      if (sd.key === 'ultra') {
        BattleFX.slowMo(true);
        BattleFX.ultraCinematic(atk.char, skillName, () => {
          BattleFX.slowMo(false);
          performHit(dmg, false, true);
        });
      } else {
        performHit(dmg, isCrit, false);
      }
    } else {
      /* 答錯 */
      atk.combo = 0;
      this.announce(sd.key === 'ultra' ? '奧義失敗…' : 'MISS', 'miss');
      AudioEngine.play('miss');
      atkEl.classList.add('stagger');
      setTimeout(() => atkEl.classList.remove('stagger'), 700);
      if (sd.counter > 0) {
        setTimeout(() => {
          const atkX = ai === 0 ? 28 : 72;
          this.announce(`${def.char.name} 反擊!`);
          BattleFX.dash(defEl, -dir);
          setTimeout(() => {
            const cdmg = sd.counter * (1 + def.char.stats.spd * 0.03) * rand(0.9, 1.1);
            BattleFX.slash(di === 0 ? 'left' : 'right', false);
            BattleFX.hitStop(atkEl);
            BattleFX.burst(atkX, 46, def.char.hue, 12);
            BattleFX.shake(0.7);
            AudioEngine.play('hit');
            BattleFX.damageNumber(atkX, 34, Math.round(cdmg), 'counter');
            atk.hp = clamp(atk.hp - cdmg, 0, atk.maxHp);
            def.energy = clamp(def.energy + 10, 0, 100);
            def.st.dmg += cdmg;
            this.updateHUD();
            setTimeout(() => this.afterAction(), 900);
          }, 420);
        }, 900);
      } else {
        setTimeout(() => this.afterAction(), 1100);
      }
    }
  },

  afterAction() {
    if (this.s.over) return;
    const dead = this.s.p.findIndex(f => f.hp <= 0);
    if (dead !== -1) return this.endBattle(1 - dead);
    this.s.turn = 1 - this.s.turn;
    if (this.s.turn === 0) this.s.round++;
    this.updateHUD();
    this.beginTurn();
  },

  /* ── 勝負 ── */
  endBattle(winnerIdx) {
    this.s.over = true;
    this.stopTimer();
    const win = this.s.p[winnerIdx], lose = this.s.p[1 - winnerIdx];
    const loseEl = this.fighterEl(1 - winnerIdx);
    const winEl = this.fighterEl(winnerIdx);

    BattleFX.slowMo(true);
    AudioEngine.play('ko');
    this.announce('K.O.', 'ko');
    BattleFX.shake(2.5);
    BattleFX.flash('rgba(255,60,40,0.4)', 500);
    loseEl.classList.add('defeated');

    setTimeout(() => {
      BattleFX.slowMo(false);
      winEl.classList.add('victor');
      const playerWon = !win.isCPU;
      if (playerWon || this.s.mode === 'versus') {
        AudioEngine.play('victory');
        BattleFX.fireworks(null, 6);
      } else {
        AudioEngine.play('defeat');
      }
      setTimeout(() => UI.showResult(this.s, winnerIdx), 1600);
    }, 1500);
  },
};

/* ═══════════════════════════════════════════════
   卡牌對決引擎 — 五張作品卡 × 媒材相剋 × 答題加成
   ═══════════════════════════════════════════════ */
const CardGame = {
  s: null,
  usedQ: new Set(),
  qTimer: null,

  cardHTML(card, opts = {}) {
    return `
      <div class="wcard ${opts.cls || ''}" ${opts.data ? `data-id="${card.id}"` : ''} style="--h:${card.hue};--h2:${card.hue2}">
        <div class="wcard-head"><img src="${card.img}" alt="${card.name}" loading="lazy"><span>${card.name}</span></div>
        <div class="wcard-title">《${card.title}》</div>
        <div class="wcard-year">${card.year}</div>
        <div class="wcard-foot">
          <span class="wcard-medium m-${MEDIUMS.indexOf(card.medium)}">${card.medium === '雕塑與現代藝術' ? '雕塑現代' : card.medium}</span>
          <span class="wcard-power">力 ${card.power}</span>
        </div>
      </div>`;
  },

  start(deckIds, aiLevel) {
    const deck = deckIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean);
    if (deck.length !== 5) { UI.toast('牌組需要恰好 5 張卡'); return; }
    /* CPU 牌組:全收藏隨機抽 5,偏好高力卡 */
    const cpuDeck = shuffled(CARDS).sort((a, b) => (b.power + Math.random() * 6) - (a.power + Math.random() * 6)).slice(0, 5);
    this.s = {
      round: 1, score: [0, 0], hand: deck.slice(), cpuHand: shuffled(cpuDeck),
      aiLevel, correct: 0, total: 0, over: false, log: [],
    };
    this.usedQ.clear();
    UI.show('screen-cardbattle');
    this.renderRound();
  },

  scoreHTML() {
    const s = this.s;
    const pip = (n, who) => Array.from({ length: 3 }, (_, i) => `<i class="${i < n ? 'on ' + who : ''}"></i>`).join('');
    return `
      <div class="cb-score">
        <div class="cb-side"><b>你</b><div class="cb-pips">${pip(s.score[0], 'p')}</div></div>
        <div class="cb-round">第 ${Math.min(s.round, 5)} / 5 回合</div>
        <div class="cb-side right"><div class="cb-pips">${pip(s.score[1], 'c')}</div><b>策展人</b></div>
      </div>`;
  },

  renderRound() {
    const s = this.s;
    $('cb-arena').innerHTML = `
      ${this.scoreHTML()}
      <div class="cb-duel">
        <div class="cb-slot" id="cb-slot-p"><div class="cb-slot-empty">你的出牌</div></div>
        <div class="cb-vs">對</div>
        <div class="cb-slot" id="cb-slot-c"><div class="wcard wcard-back">?</div></div>
      </div>
      <div class="cb-bottom">
        <div class="cb-hint">選一張作品卡出戰 — 相剋 +4 · 答對 +5 · 答錯 −3</div>
        <div class="cb-hand">
          ${s.hand.map(c => this.cardHTML(c, { cls: 'in-hand', data: true })).join('')}
        </div>
      </div>`;
    $('cb-arena').querySelectorAll('.wcard.in-hand').forEach(el => {
      el.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      el.addEventListener('click', () => { AudioEngine.play('confirm'); this.playCard(el.dataset.id); });
    });
  },

  playCard(cardId) {
    const s = this.s;
    if (s.over) return;
    const pCard = s.hand.find(c => c.id === cardId);
    s.hand = s.hand.filter(c => c.id !== cardId);
    const cCard = s.cpuHand.shift();
    s.pCard = pCard; s.cCard = cCard;

    /* 顯示我方出牌,CPU 蓋牌,進入答題 */
    $('cb-slot-p').innerHTML = this.cardHTML(pCard, { cls: 'played' });
    this.askQuestion(res => this.reveal(res));
  },

  askQuestion(cb) {
    const s = this.s;
    let pool = Bank.byDiff(2).filter(q => !this.usedQ.has(q.q));
    if (!pool.length) { this.usedQ.clear(); pool = Bank.byDiff(2); }
    const q = pool[Math.floor(Math.random() * pool.length)];
    this.usedQ.add(q.q);
    const order = shuffled([0, 1, 2, 3]);
    const answer = order.indexOf(q.a);
    const TIME = 20;

    const bottom = document.querySelector('#cb-arena .cb-bottom');
    bottom.innerHTML = `
      <div class="q-panel cb-q fade-up">
        <div class="q-meta">
          <span class="q-cat">${q.cat || '知識'}</span>
          <span class="q-diff">★★☆</span>
          <span class="q-sub">答對 +5 力 · 答錯 −3 力</span>
        </div>
        <div class="cb-qtimer"><div id="cb-qbar" style="animation-duration:${TIME}s"></div></div>
        <div class="q-text">${q.q}</div>
        <div class="q-choices">
          ${order.map((o, idx) => `<button class="q-choice" data-i="${idx}"><span class="q-key">${'ABCD'[idx]}</span><span>${q.c[o]}</span></button>`).join('')}
        </div>
        <div class="q-exp hidden" id="cb-exp"></div>
      </div>`;

    let done = false;
    const finish = (chosen, timedOut = false) => {
      if (done) return; done = true;
      clearTimeout(this.qTimer);
      const correct = !timedOut && chosen === answer;
      s.total++; if (correct) s.correct++;
      bottom.querySelectorAll('.q-choice').forEach((b, idx) => {
        b.disabled = true;
        if (idx === answer) b.classList.add('reveal-correct');
        if (idx === chosen && !correct) b.classList.add('reveal-wrong');
      });
      const exp = $('cb-exp');
      if (q.exp) { exp.textContent = (correct ? '✦ ' : '✧ ') + q.exp; exp.classList.remove('hidden'); }
      AudioEngine.play(correct ? 'correct' : 'wrong');
      setTimeout(() => cb({ correct }), q.exp ? 1700 : 1000);
    };

    bottom.querySelectorAll('.q-choice').forEach(b => {
      b.addEventListener('mouseenter', () => AudioEngine.play('hover'));
      b.addEventListener('click', () => { AudioEngine.play('click'); finish(+b.dataset.i); });
    });
    this.qTimer = setTimeout(() => finish(-1, true), TIME * 1000);
  },

  calcPower(card, other, quizCorrect) {
    let p = card.power;
    const detail = [`基礎 ${card.power}`];
    if (MEDIUM_BEATS[card.medium] === other.medium) { p += 4; detail.push('相剋 +4'); }
    else if (card.medium === '雕塑與現代藝術') { p += 1; detail.push('恆定 +1'); }
    if (quizCorrect === true) { p += 5; detail.push('答對 +5'); }
    if (quizCorrect === false) { p -= 3; detail.push('答錯 −3'); }
    return { p, detail: detail.join(' · ') };
  },

  reveal(res) {
    const s = this.s;
    const lvl = AI_LEVELS.find(l => l.id === s.aiLevel) || AI_LEVELS[1];
    const cpuCorrect = Math.random() < lvl.acc;
    const P = this.calcPower(s.pCard, s.cCard, res.correct);
    const C = this.calcPower(s.cCard, s.pCard, cpuCorrect);

    /* 翻牌演出 */
    $('cb-slot-c').innerHTML = this.cardHTML(s.cCard, { cls: 'played flip-in' });
    AudioEngine.play('attackL');

    setTimeout(() => {
      const pWin = P.p > C.p, cWin = C.p > P.p;
      if (pWin) s.score[0]++; else if (cWin) s.score[1]++;
      $('cb-slot-p').insertAdjacentHTML('beforeend', `<div class="cb-power ${pWin ? 'win' : cWin ? 'lose' : ''}">${P.p}<i>${P.detail}${res.correct ? '' : ''}</i></div>`);
      $('cb-slot-c').insertAdjacentHTML('beforeend', `<div class="cb-power ${cWin ? 'win' : pWin ? 'lose' : ''}">${C.p}<i>${C.detail} · 策展人${cpuCorrect ? '答對' : '答錯'}</i></div>`);
      AudioEngine.play(pWin ? 'crit' : cWin ? 'hit' : 'miss');
      BattleFX && pWin && AudioEngine.play('energy');

      const bottom = document.querySelector('#cb-arena .cb-bottom');
      bottom.innerHTML = `
        <div class="cb-roundresult fade-up">
          <b>${pWin ? '你拿下這一回合!' : cWin ? '策展人拿下這回合…' : '平分秋色'}</b>
          <button class="btn btn-gold" id="cb-next">${s.round >= 5 || s.hand.length === 0 ? '看最終結果 ▸' : '下一回合 ▸'}</button>
        </div>`;
      /* 更新比分 */
      document.querySelector('#cb-arena .cb-score').outerHTML = this.scoreHTML();
      $('cb-next').onclick = () => {
        AudioEngine.play('click');
        s.round++;
        if (s.round > 5 || !s.hand.length) this.finish();
        else this.renderRound();
      };
    }, 900);
  },

  finish() {
    const s = this.s;
    s.over = true;
    const win = s.score[0] > s.score[1];
    const tie = s.score[0] === s.score[1];
    UI.finishCardGame({ win, tie, score: s.score, correct: s.correct, total: s.total });
  },

  quit() {
    clearTimeout(this.qTimer);
    if (this.s) this.s.over = true;
  },
};
