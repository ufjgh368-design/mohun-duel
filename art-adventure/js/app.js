/* ═══════════════════════════════════════════════
   藝術尋寶大冒險 — 主程式（垂直切片：第1、2關）
   零依賴 vanilla JS。儲存鍵 aa_*
   ═══════════════════════════════════════════════ */
'use strict';

/* ── 狀態 ── */
const State = {
  exp: 0,
  cards: [],           // 收藏的藝術家 id
  cleared: {},         // { '1': stars, '2': stars }
  powers: [],          // 已獲得能力名
  seenIntro: false,
  load() {
    try {
      this.exp = +localStorage.getItem('aa_exp') || 0;
      this.cards = JSON.parse(localStorage.getItem('aa_cards') || '[]');
      this.cleared = JSON.parse(localStorage.getItem('aa_cleared') || '{}');
      this.powers = JSON.parse(localStorage.getItem('aa_powers') || '[]');
      this.seenIntro = localStorage.getItem('aa_intro') === '1';
    } catch (e) { /* 首次進入 */ }
  },
  save() {
    localStorage.setItem('aa_exp', this.exp);
    localStorage.setItem('aa_cards', JSON.stringify(this.cards));
    localStorage.setItem('aa_cleared', JSON.stringify(this.cleared));
    localStorage.setItem('aa_powers', JSON.stringify(this.powers));
    localStorage.setItem('aa_intro', this.seenIntro ? '1' : '0');
  },
  addCard(id) { if (!this.cards.includes(id)) this.cards.push(id); this.save(); },
  addPower(p) { if (!this.powers.includes(p)) this.powers.push(p); this.save(); },
  addExp(n) { this.exp += n; this.save(); updateHud(); },
  rankIndex() {
    let i = 0;
    for (let k = 0; k < AA_RANKS.length; k++) if (this.exp >= AA_RANKS[k].exp) i = k;
    return i;
  },
};

/* ── DOM 捷徑 ── */
const $ = sel => document.querySelector(sel);
const stage = $('#stage');
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

/* 真跡圖網址（執行時編碼，附寬度取縮圖） */
function artUrl(file, w = 900) {
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=' + w;
}
/* 作品圖來源：優先本機素材(src)，否則回退 Wikimedia */
function workSrc(w, width = 900) {
  return w.src ? w.src : artUrl(w.file, width);
}

/* ── HUD ── */
function updateHud() {
  const r = AA_RANKS[State.rankIndex()];
  const next = AA_RANKS[State.rankIndex() + 1];
  $('#hud-icon').textContent = r.icon;
  $('#hud-title').textContent = r.name;
  $('#hud-cardcount').textContent = State.cards.length;
  let pct = 100;
  if (next) {
    const span = next.exp - r.exp;
    pct = Math.max(0, Math.min(100, ((State.exp - r.exp) / span) * 100));
  }
  $('#hud-expfill').style.transform = 'scaleX(' + (pct / 100) + ')';
}
$('#hud-map').addEventListener('click', () => renderMap());

/* ── 慶祝特效 ── */
function confetti(n = 40) {
  const bits = ['🎉', '✨', '🎊', '⭐', '🎨', '🖌️', '🏆'];
  for (let i = 0; i < n; i++) {
    const c = el('div', 'confetti', bits[Math.floor(Math.random() * bits.length)]);
    c.style.left = Math.random() * 100 + 'vw';
    c.style.animationDuration = (1.6 + Math.random() * 1.8) + 's';
    c.style.fontSize = (16 + Math.random() * 20) + 'px';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3600);
  }
}

/* ═══════════════ 開場 ═══════════════ */
function renderIntro() {
  $('#hud').classList.add('hidden');
  stage.innerHTML = '';
  const s = el('section', 'screen intro');
  s.innerHTML = `
    <span class="orb float">🎨</span>
    <div class="logo">藝術尋寶大冒險</div>
    <div class="sub">成為藝術創作大師</div>
    <div class="story">
      世界上的<span class="em">藝術能量</span>被神秘力量打散了……<br>
      色彩、光線與靈感,散落在十個奇幻世界裡。<br><br>
      你是一位<span class="em">藝術學徒</span>。<br>
      旅行世界、拜訪偉大的藝術家、收集他們的力量,<br>
      一步步成長為真正的<span class="em">藝術創作大師</span>!
    </div>
    <button class="big-btn" id="intro-go">開始冒險 🚀</button>
  `;
  stage.appendChild(s);
  $('#intro-go').addEventListener('click', () => {
    State.seenIntro = true; State.save();
    renderMap();
  });
}

/* ═══════════════ 世界地圖 ═══════════════ */
function renderMap() {
  $('#hud').classList.remove('hidden');
  updateHud();
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.appendChild(el('div', 'map-title', '🗺️ 藝術世界地圖'));
  s.appendChild(el('div', 'map-sub', '完成每一關,獲得一項藝術能力'));

  const path = el('div', 'map-path');
  AA_MAP.forEach(m => {
    const stars = State.cleared[m.n];
    const cleared = stars != null;
    let cls = 'node';
    if (m.unlocked) cls += cleared ? ' cleared playable' : ' playable';
    else cls += ' locked';
    const node = el('div', cls);
    node.innerHTML = `
      <div class="n-icon">${m.icon}</div>
      <div class="n-body">
        <div class="n-lv">第 ${m.n} 關 · ${m.key}</div>
        <div class="n-world">${m.world}</div>
        <div class="n-power">能力：${m.power}</div>
        ${cleared ? `<div class="n-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>` : ''}
      </div>
      <div class="n-badge">${m.unlocked ? (cleared ? '🔄' : '▶️') : '🔒'}</div>
    `;
    if (m.unlocked) node.addEventListener('click', () => startLevel(m.n));
    path.appendChild(node);
  });
  s.appendChild(path);

  // 圖鑑入口
  const back = el('div', 'back-row');
  const colBtn = el('button', 'text-btn', `🃏 我的藝術卡收藏（${State.cards.length}）`);
  colBtn.addEventListener('click', renderCollection);
  back.appendChild(colBtn);
  s.appendChild(back);

  stage.appendChild(s);
}

function startLevel(n) {
  if (n === 1) return level1_start();
  if (n === 2) return level2_start();
  if (n === 3) return level3_start();
  if (n === 4) return level4_start();
  if (n === 5) return level5_start();
  if (n === 6) return level6_start();
  if (n === 7) return level7_start();
  if (n === 8) return level8_start();
  if (n === 9) return level9_start();
  if (n === 10) return level10_start();
}

function shuffle(arr) {
  arr = arr.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ═══════════════ 圖鑑收藏 ═══════════════ */
function renderCollection() {
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.appendChild(el('div', 'map-title', '🃏 藝術卡收藏'));
  s.appendChild(el('div', 'map-sub', `已收集 ${State.cards.length} / ${Object.keys(AA_ARTISTS).length} 位藝術家`));
  const grid = el('div', 'collection');
  Object.keys(AA_ARTISTS).forEach(id => {
    const a = AA_ARTISTS[id];
    const owned = State.cards.includes(id);
    const c = el('div', 'col-card');
    c.style.opacity = owned ? '1' : '.4';
    c.innerHTML = owned
      ? `<img src="${a.img}" alt="${a.name}"><b>${a.name}</b><small>${a.medium}</small>`
      : `<img src="${a.img}" alt="?" style="filter:grayscale(1) brightness(.7)"><b>? ? ?</b><small>未解鎖</small>`;
    grid.appendChild(c);
  });
  s.appendChild(grid);
  const back = el('div', 'back-row');
  const b = el('button', 'text-btn', '← 回到地圖');
  b.addEventListener('click', renderMap);
  back.appendChild(b);
  s.appendChild(back);
  stage.appendChild(s);
}

/* 載入真跡圖，含備援 */
function makeArtwork(workKey, onload) {
  const w = AA_WORKS[workKey];
  const frame = el('div', 'art-frame');
  const loading = el('div', 'art-loading', '🖼️ 真跡載入中……');
  frame.appendChild(loading);
  const img = new Image();
  img.className = 'artwork';
  img.alt = w.title;
  img.onload = () => { loading.remove(); frame.appendChild(img); if (onload) onload(img, frame); };
  img.onerror = () => { loading.innerHTML = `（圖片暫時無法顯示）<br><b>${w.title}</b>`; };
  img.src = workSrc(w);
  return { frame, imgEl: img };
}

/* ═══════════════ 第 1 關：接觸 ═══════════════ */
const GEM_POS = [
  [{ x: 24, y: 30 }, { x: 72, y: 34 }, { x: 48, y: 72 }],
  [{ x: 30, y: 62 }, { x: 66, y: 28 }, { x: 40, y: 40 }],
  [{ x: 20, y: 44 }, { x: 78, y: 58 }, { x: 52, y: 26 }],
];
const GEM_ICONS = ['💎', '🔷', '⭐'];

function level1_start() { level1_encounter(0, 0); }

// 每關的錯誤次數累加，用於評星
let _bossWrong = 0;

function level1_encounter(i, _phase) {
  const enc = AA_LEVEL1.encounters[i];
  const a = AA_ARTISTS[enc.artist];
  stage.innerHTML = '';
  const s = el('section', 'screen npc-scene');
  s.innerHTML = `
    <div class="map-sub">第 1 關 · 接觸　（${i + 1}/${AA_LEVEL1.encounters.length}）</div>
    <img class="npc-portrait" src="${a.img}" alt="${a.name}">
    <div class="npc-name">${a.name}</div>
    <span class="npc-medium">${a.medium}</span>
    <div class="bubble greet" id="l1-bubble">${a.greet}</div>
    <div class="tapcue" id="l1-cue">▼ 點一下繼續</div>
  `;
  stage.appendChild(s);
  let step = 0;
  const bubble = $('#l1-bubble');
  const advance = () => {
    step++;
    if (step === 1) {
      bubble.className = 'bubble';
      bubble.textContent = a.story;
    } else {
      s.removeEventListener('click', advance);
      level1_treasure(i);
    }
  };
  s.addEventListener('click', advance);
}

function level1_treasure(i) {
  const enc = AA_LEVEL1.encounters[i];
  const w = AA_WORKS[enc.work];
  const a = AA_ARTISTS[enc.artist];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 1 關 · 接觸　🔍 點亮畫中的三顆藝術寶石!</div>`;
  const { frame } = makeArtwork(enc.work, (img, fr) => {
    const pos = GEM_POS[i % GEM_POS.length];
    let found = 0;
    enc.gems.forEach((fact, g) => {
      const gem = el('div', 'gem', GEM_ICONS[g]);
      gem.style.left = pos[g].x + '%';
      gem.style.top = pos[g].y + '%';
      gem.addEventListener('click', ev => {
        ev.stopPropagation();
        if (gem.classList.contains('found')) return;
        gem.classList.add('found');
        found++;
        showBubble(fact);
        updateProg(found);
        if (found === enc.gems.length) {
          State.addExp(20);
          setTimeout(() => level1_card(i), 700);
        }
      });
      fr.appendChild(gem);
    });
  });
  s.appendChild(frame);
  s.appendChild(el('div', 'art-cap', `<b>《${w.title}》</b>　${a.name}　${w.year}<br>${w.caption}`));
  const prog = el('div', 'progress-pill', '寶石：0 / 3');
  prog.id = 'l1-prog';
  s.appendChild(prog);
  const bub = el('div', 'q-exp', '點一下畫面上閃亮的寶石,聽藝術家說故事～');
  bub.id = 'l1-fact'; bub.style.maxWidth = '560px'; bub.style.margin = '14px auto 0';
  s.appendChild(bub);
  stage.appendChild(s);

  function showBubble(t) { $('#l1-fact').innerHTML = '💬 ' + t; }
  function updateProg(f) { $('#l1-prog').textContent = `寶石：${f} / 3`; }
}

function level1_card(i) {
  const enc = AA_LEVEL1.encounters[i];
  const a = AA_ARTISTS[enc.artist];
  const isNew = !State.cards.includes(enc.artist);
  State.addCard(enc.artist);
  confetti(20);
  stage.innerHTML = '';
  const s = el('section', 'screen reward');
  s.innerHTML = `
    <div class="power-get">🃏 獲得藝術卡!</div>
    <div class="card-pop">
      <div class="mini-card"><img src="${a.img}" alt="${a.name}"><span>${a.name}</span></div>
    </div>
    <p style="color:var(--ink-soft);font-size:15px">${isNew ? '新的藝術家加入你的收藏!' : '你更了解這位藝術家了!'}</p>
    <div class="back-row"><button class="big-btn teal" id="l1-next">${i + 1 < AA_LEVEL1.encounters.length ? '拜訪下一位 →' : '前往守門人 🗝️'}</button></div>
  `;
  stage.appendChild(s);
  $('#l1-next').addEventListener('click', () => {
    if (i + 1 < AA_LEVEL1.encounters.length) level1_encounter(i + 1, 0);
    else { _bossWrong = 0; bossQuiz(AA_LEVEL1.boss, () => levelClear(1, '藝術之眼')); }
  });
}

/* ═══════════════ 第 2 關：觀察 ═══════════════ */
function level2_start() { _bossWrong = 0; level2_round(0); }

function level2_round(i) {
  if (i >= AA_LEVEL2.rounds.length) {
    bossQuiz(AA_LEVEL2.boss, () => levelClear(2, '觀察之眼'));
    return;
  }
  const r = AA_LEVEL2.rounds[i];
  const w = AA_WORKS[r.work];
  const a = AA_ARTISTS[w.artist];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 2 關 · 觀察　（${i + 1}/${AA_LEVEL2.rounds.length}）🔎 拖曳畫面用放大鏡</div>`;
  const lensWrap = el('div', 'lens-wrap');
  const { frame } = makeArtwork(r.work, (img, fr) => attachLens(fr, img, r.work));
  lensWrap.appendChild(frame);
  s.appendChild(lensWrap);
  s.appendChild(el('div', 'lens-hint', '💡 ' + r.hint));

  // 題目
  const qc = el('div', 'q-card');
  qc.appendChild(el('div', 'q-text', r.q));
  const opts = el('div', 'opts');
  r.c.forEach((txt, idx) => {
    const b = el('button', 'opt', txt);
    b.addEventListener('click', () => {
      if (qc.dataset.done) return;
      if (idx === r.a) {
        qc.dataset.done = '1';
        b.classList.add('correct');
        [...opts.children].forEach(o => o.disabled = true);
        State.addExp(20);
        const exp = el('div', 'q-exp', '✅ ' + r.exp);
        qc.appendChild(exp);
        const nb = el('div', 'back-row');
        const nbtn = el('button', 'big-btn teal', i + 1 < AA_LEVEL2.rounds.length ? '下一題 →' : '面對細節精靈 🧚');
        nbtn.addEventListener('click', () => level2_round(i + 1));
        nb.appendChild(nbtn);
        qc.appendChild(nb);
      } else {
        b.classList.add('wrong'); b.disabled = true;
      }
    });
    opts.appendChild(b);
  });
  qc.appendChild(opts);
  s.appendChild(qc);
  stage.appendChild(s);
}

/* 放大鏡：指標移動時放大該處 */
function attachLens(frame, img, workKey) {
  const lens = el('div', 'lens');
  lens.style.backgroundImage = `url("${workSrc(AA_WORKS[workKey], 1400)}")`;
  frame.appendChild(lens);
  const zoom = 2.1, LS = 150;
  function move(clientX, clientY) {
    const rect = img.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { lens.style.display = 'none'; return; }
    lens.style.display = 'block';
    lens.style.backgroundSize = (rect.width * zoom) + 'px ' + (rect.height * zoom) + 'px';
    lens.style.left = (x - LS / 2) + 'px';
    lens.style.top = (y - LS / 2) + 'px';
    lens.style.backgroundPosition = `-${x * zoom - LS / 2}px -${y * zoom - LS / 2}px`;
  }
  frame.addEventListener('mousemove', e => move(e.clientX, e.clientY));
  frame.addEventListener('mouseleave', () => lens.style.display = 'none');
  frame.addEventListener('touchstart', e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  frame.addEventListener('touchmove', e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  frame.addEventListener('touchend', () => lens.style.display = 'none');
}

/* ═══════════════ 第 3 關：描述（拖曳造句） ═══════════════ */
function level3_start() { _bossWrong = 0; level3_round(0); }

function level3_round(i) {
  if (i >= AA_LEVEL3.rounds.length) {
    bossQuiz(AA_LEVEL3.boss, () => levelClear(3, '藝術說書人'));
    return;
  }
  const r = AA_LEVEL3.rounds[i];
  const w = AA_WORKS[r.work];
  const a = AA_ARTISTS[w.artist];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 3 關 · 描述　（${i + 1}/${AA_LEVEL3.rounds.length}）💬 點詞語填進空格,說出你看到什麼</div>`;
  const { frame } = makeArtwork(r.work);
  frame.style.maxWidth = '460px';
  s.appendChild(frame);
  s.appendChild(el('div', 'art-cap', `<b>《${w.title}》</b>　${a.name}`));

  // 句子（含空格）
  const segs = r.template.split('|');
  const line = el('div', 'sent-line');
  const slots = [];
  segs.forEach((seg, idx) => {
    if (seg) line.appendChild(el('span', 'sent-txt', seg));
    if (idx < segs.length - 1) {
      const slot = el('button', 'slot', '＿＿');
      slots.push(slot);
      slot.addEventListener('click', () => clearSlot(slot));
      line.appendChild(slot);
    }
  });
  s.appendChild(line);

  // 詞語池
  const pool = el('div', 'chip-pool');
  const chips = {};
  shuffle(r.answers.concat(r.distractors)).forEach(word => {
    const chip = el('button', 'chip', word);
    chip.dataset.word = word;
    chip.addEventListener('click', () => placeWord(chip));
    chips[word] = chip;
    pool.appendChild(chip);
  });
  s.appendChild(pool);

  const ctrl = el('div', 'back-row'); ctrl.id = 'l3-ctrl';
  s.appendChild(ctrl);
  stage.appendChild(s);

  function placeWord(chip) {
    if (chip.classList.contains('used')) return;
    const empty = slots.find(sl => !sl.dataset.word);
    if (!empty) return;
    empty.dataset.word = chip.dataset.word;
    empty.textContent = chip.dataset.word;
    empty.classList.add('filled');
    chip.classList.add('used');
    refresh();
  }
  function clearSlot(slot) {
    if (!slot.dataset.word || slot.classList.contains('correct')) return;
    const word = slot.dataset.word;
    if (chips[word]) chips[word].classList.remove('used');
    delete slot.dataset.word;
    slot.textContent = '＿＿';
    slot.classList.remove('filled', 'wrong');
    refresh();
  }
  function refresh() {
    ctrl.innerHTML = '';
    if (slots.every(sl => sl.dataset.word)) {
      const btn = el('button', 'big-btn teal', '看看對不對 ✓');
      btn.addEventListener('click', check);
      ctrl.appendChild(btn);
    }
  }
  function check() {
    let ok = true;
    slots.forEach((sl, k) => {
      if (sl.dataset.word === r.answers[k]) sl.classList.add('correct');
      else { sl.classList.add('wrong'); ok = false; }
    });
    if (ok) {
      State.addExp(25);
      ctrl.innerHTML = '';
      let full = segs[0];
      slots.forEach((sl, k) => { full += sl.dataset.word + segs[k + 1]; });
      s.appendChild(el('div', 'q-exp', '✅ 你完成了一句漂亮的描述：<br>「' + full + '」'));
      const nb = el('div', 'back-row');
      const nbtn = el('button', 'big-btn teal', i + 1 < AA_LEVEL3.rounds.length ? '下一句 →' : '挑戰沉默魔王 🤐');
      nbtn.addEventListener('click', () => level3_round(i + 1));
      nb.appendChild(nbtn);
      s.appendChild(nb);
    } else {
      setTimeout(() => slots.forEach(sl => { if (sl.classList.contains('wrong')) clearSlot(sl); }), 850);
    }
  }
}

/* ═══════════════ 第 4 關：理解（劇情推理） ═══════════════ */
function level4_start() { _bossWrong = 0; level4_scene(0); }

function level4_scene(i) {
  if (i >= AA_LEVEL4.scenes.length) {
    bossQuiz(AA_LEVEL4.boss, () => levelClear(4, '藝術讀心術'));
    return;
  }
  const sc = AA_LEVEL4.scenes[i];
  const a = AA_ARTISTS[sc.artist];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `
    <div class="map-sub">第 4 關 · 理解　（${i + 1}/${AA_LEVEL4.scenes.length}）🔮 讀懂藝術家的心</div>
    <div class="scene-head">
      <img class="scene-portrait" src="${a.img}" alt="${a.name}">
      <div class="scene-name">${a.name}</div>
    </div>
  `;
  if (sc.work) {
    const { frame } = makeArtwork(sc.work);
    frame.style.maxWidth = '380px';
    s.appendChild(frame);
  }
  s.appendChild(el('div', 'bubble', sc.prompt));
  const opts = el('div', 'opts');
  sc.c.forEach((txt, idx) => {
    const b = el('button', 'opt', txt);
    b.addEventListener('click', () => {
      if (s.dataset.done) return;
      if (idx === sc.a) {
        s.dataset.done = '1';
        b.classList.add('correct');
        [...opts.children].forEach(o => o.disabled = true);
        State.addExp(25);
        s.appendChild(el('div', 'q-exp', '💡 ' + sc.exp));
        const nb = el('div', 'back-row');
        const nbtn = el('button', 'big-btn teal', i + 1 < AA_LEVEL4.scenes.length ? '繼續 →' : '看穿迷霧畫家 🌫️');
        nbtn.addEventListener('click', () => level4_scene(i + 1));
        nb.appendChild(nbtn);
        s.appendChild(nb);
      } else {
        b.classList.add('wrong'); b.disabled = true;
      }
    });
    opts.appendChild(b);
  });
  s.appendChild(opts);
  stage.appendChild(s);
}

/* ═══════════════ 第 7 關：辨析（左右比較） ═══════════════ */
function level7_start() { _bossWrong = 0; level7_round(0); }

function level7_round(i) {
  if (i >= AA_LEVEL7.rounds.length) {
    bossQuiz(AA_LEVEL7.boss, () => levelClear(7, '藝術偵探'));
    return;
  }
  const r = AA_LEVEL7.rounds[i];
  const wL = AA_WORKS[r.left], wR = AA_WORKS[r.right];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 7 關 · 辨析　（${i + 1}/${AA_LEVEL7.rounds.length}）⚖️ 比較左右兩件作品,找出異同</div>`;
  const row = el('div', 'compare-row');
  [['left', wL], ['right', wR]].forEach(([side, w]) => {
    const cell = el('div', 'compare-cell');
    cell.appendChild(el('div', 'compare-side', side === 'left' ? '⬅ 左' : '右 ➡'));
    const { frame } = makeArtwork(side === 'left' ? r.left : r.right);
    frame.style.maxWidth = '100%';
    cell.appendChild(frame);
    cell.appendChild(el('div', 'compare-title', `《${w.title}》 ${AA_ARTISTS[w.artist].name}`));
    row.appendChild(cell);
  });
  s.appendChild(row);
  const qhost = el('div'); qhost.id = 'l7-qhost';
  s.appendChild(qhost);
  stage.appendChild(s);
  askQ(0);

  function askQ(qi) {
    const q = r.questions[qi];
    const host = $('#l7-qhost'); host.innerHTML = '';
    const qc = el('div', 'q-card');
    qc.appendChild(el('div', 'q-text', q.q));
    const opts = el('div', 'opts');
    q.c.forEach((raw, idx) => {
      const label = raw === 'left' ? `⬅ 左：《${wL.title}》` : raw === 'right' ? `右 ➡：《${wR.title}》` : raw;
      const b = el('button', 'opt', label);
      b.addEventListener('click', () => {
        if (qc.dataset.done) return;
        if (idx === q.a) {
          qc.dataset.done = '1';
          b.classList.add('correct');
          [...opts.children].forEach(o => o.disabled = true);
          State.addExp(15);
          qc.appendChild(el('div', 'q-exp', '✅ ' + q.exp));
          const last = qi + 1 >= r.questions.length;
          const nb = el('div', 'back-row');
          const nbtn = el('button', 'big-btn teal',
            last ? (i + 1 < AA_LEVEL7.rounds.length ? '比較下一組 →' : '面對雙面畫家 👥') : '下一個問題 →');
          nbtn.addEventListener('click', () => last ? level7_round(i + 1) : askQ(qi + 1));
          nb.appendChild(nbtn);
          qc.appendChild(nb);
        } else {
          b.classList.add('wrong'); b.disabled = true;
        }
      });
      opts.appendChild(b);
    });
    qc.appendChild(opts);
    host.appendChild(qc);
  }
}

/* ═══════════════ 第 8 關：提煉（流程排序） ═══════════════ */
function level8_start() { _bossWrong = 0; level8_round(0); }

function level8_round(i) {
  if (i >= AA_LEVEL8.rounds.length) {
    bossQuiz(AA_LEVEL8.boss, () => levelClear(8, '藝術鍊金術'));
    return;
  }
  const r = AA_LEVEL8.rounds[i];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 8 關 · 提煉　（${i + 1}/${AA_LEVEL8.rounds.length}）🧪 ${r.title}：把步驟排成正確順序</div>`;

  const slotWrap = el('div', 'flow-slots');
  const slots = [];
  r.steps.forEach((_, idx) => {
    const slot = el('button', 'flow-slot');
    slot.innerHTML = `<span class="flow-num">${idx + 1}</span><span class="flow-txt">？</span>`;
    slot.addEventListener('click', () => clearSlot(slot));
    slots.push(slot);
    slotWrap.appendChild(slot);
    if (idx < r.steps.length - 1) slotWrap.appendChild(el('div', 'flow-arrow', '▼'));
  });
  s.appendChild(slotWrap);

  const pool = el('div', 'flow-pool');
  const chips = {};
  shuffle(r.steps.map((t, idx) => ({ t, idx }))).forEach(o => {
    const chip = el('button', 'flow-chip', o.t);
    chip.dataset.idx = o.idx;
    chip.addEventListener('click', () => place(chip));
    chips[o.idx] = chip;
    pool.appendChild(chip);
  });
  s.appendChild(pool);

  const ctrl = el('div', 'back-row'); ctrl.id = 'l8-ctrl';
  s.appendChild(ctrl);
  stage.appendChild(s);

  function place(chip) {
    if (chip.classList.contains('used')) return;
    const empty = slots.find(sl => !sl.dataset.idx);
    if (!empty) return;
    empty.dataset.idx = chip.dataset.idx;
    empty.querySelector('.flow-txt').textContent = chip.textContent;
    empty.classList.add('filled');
    chip.classList.add('used');
    refresh();
  }
  function clearSlot(slot) {
    if (!slot.dataset.idx || slot.classList.contains('correct')) return;
    if (chips[slot.dataset.idx]) chips[slot.dataset.idx].classList.remove('used');
    delete slot.dataset.idx;
    slot.querySelector('.flow-txt').textContent = '？';
    slot.classList.remove('filled', 'wrong');
    refresh();
  }
  function refresh() {
    ctrl.innerHTML = '';
    if (slots.every(sl => sl.dataset.idx)) {
      const btn = el('button', 'big-btn teal', '檢查順序 ✓');
      btn.addEventListener('click', check);
      ctrl.appendChild(btn);
    }
  }
  function check() {
    let ok = true;
    slots.forEach((sl, k) => {
      if (+sl.dataset.idx === k) sl.classList.add('correct');
      else { sl.classList.add('wrong'); ok = false; }
    });
    if (ok) {
      State.addExp(30);
      ctrl.innerHTML = '';
      const nb = el('button', 'big-btn teal', i + 1 < AA_LEVEL8.rounds.length ? '下一個流程 →' : '挑戰混亂博士 🌀');
      nb.addEventListener('click', () => level8_round(i + 1));
      ctrl.appendChild(nb);
    } else {
      setTimeout(() => slots.forEach(sl => { if (sl.classList.contains('wrong')) clearSlot(sl); }), 850);
    }
  }
}

/* ═══════════════ 第 6 關：遷移（分析新作品） ═══════════════ */
function level6_start() { _bossWrong = 0; level6_round(0); }

function level6_round(i) {
  if (i >= AA_LEVEL6.rounds.length) {
    bossQuiz(AA_LEVEL6.boss, () => levelClear(6, '藝術分析師'));
    return;
  }
  const r = AA_LEVEL6.rounds[i];
  const w = AA_WORKS[r.work];
  const a = AA_ARTISTS[w.artist];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 6 關 · 遷移　（${i + 1}/${AA_LEVEL6.rounds.length}）🔬 分析一件你沒看過的新作品</div>`;
  const { frame } = makeArtwork(r.work);
  frame.style.maxWidth = '440px';
  s.appendChild(frame);
  s.appendChild(el('div', 'art-cap', `<b>《${w.title}》</b>　${a.name}　${w.year}`));
  const qhost = el('div'); qhost.id = 'l6-qhost';
  s.appendChild(qhost);
  stage.appendChild(s);
  askQ(0);

  function askQ(qi) {
    const q = r.questions[qi];
    const host = $('#l6-qhost');
    host.innerHTML = '';
    const qc = el('div', 'q-card');
    qc.appendChild(el('div', 'dim-tag', '分析角度：' + q.dim));
    qc.appendChild(el('div', 'q-text', q.q));
    const opts = el('div', 'opts');
    q.c.forEach((txt, idx) => {
      const b = el('button', 'opt', txt);
      b.addEventListener('click', () => {
        if (qc.dataset.done) return;
        if (idx === q.a) {
          qc.dataset.done = '1';
          b.classList.add('correct');
          [...opts.children].forEach(o => o.disabled = true);
          State.addExp(15);
          qc.appendChild(el('div', 'q-exp', '✅ ' + q.exp));
          const last = qi + 1 >= r.questions.length;
          const nb = el('div', 'back-row');
          const nbtn = el('button', 'big-btn teal',
            last ? (i + 1 < AA_LEVEL6.rounds.length ? '分析下一件 →' : '揭穿偽裝藝術家 🎭') : '換個角度看 →');
          nbtn.addEventListener('click', () => last ? level6_round(i + 1) : askQ(qi + 1));
          nb.appendChild(nbtn);
          qc.appendChild(nb);
        } else {
          b.classList.add('wrong'); b.disabled = true;
        }
      });
      opts.appendChild(b);
    });
    qc.appendChild(opts);
    host.appendChild(qc);
  }
}

/* ═══════════════ 第 5 關：建立知識體系（連連看） ═══════════════ */
const SVGNS = 'http://www.w3.org/2000/svg';
function level5_start() { _bossWrong = 0; level5_round(0); }

function level5_round(i) {
  if (i >= AA_LEVEL5.rounds.length) {
    bossQuiz(AA_LEVEL5.boss, () => levelClear(5, '藝術地圖'));
    return;
  }
  const r = AA_LEVEL5.rounds[i];
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 5 關 · 建立知識體系　（${i + 1}/${AA_LEVEL5.rounds.length}）🧩 ${r.title}</div>`;

  const board = el('div', 'map-board');
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'map-lines');
  board.appendChild(svg);
  const colL = el('div', 'map-col left');
  const colR = el('div', 'map-col right');
  r.pairs.forEach((p, idx) => {
    const n = el('button', 'map-node', p.left);
    n.dataset.id = idx;
    colL.appendChild(n);
  });
  shuffle(r.pairs.map((p, idx) => ({ text: p.right, id: idx }))).forEach(p => {
    const n = el('button', 'map-node', p.text);
    n.dataset.id = p.id;
    colR.appendChild(n);
  });
  board.appendChild(colL);
  board.appendChild(colR);
  s.appendChild(board);

  const prog = el('div', 'progress-pill', `已連對：0 / ${r.pairs.length}`);
  prog.id = 'l5-prog';
  s.appendChild(prog);
  const ctrl = el('div', 'back-row'); ctrl.id = 'l5-ctrl';
  s.appendChild(ctrl);
  stage.appendChild(s);

  const total = r.pairs.length;
  let selL = null, matched = 0;

  function center(node, side) {
    const b = board.getBoundingClientRect(), n = node.getBoundingClientRect();
    return { x: (side === 'L' ? n.right : n.left) - b.left, y: n.top + n.height / 2 - b.top };
  }
  function drawLine(a, b, cls) {
    const ln = document.createElementNS(SVGNS, 'line');
    ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
    ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
    ln.setAttribute('class', cls);
    svg.appendChild(ln);
    return ln;
  }
  colL.addEventListener('click', e => {
    const n = e.target.closest('.map-node');
    if (!n || n.classList.contains('done')) return;
    if (selL) selL.classList.remove('sel');
    selL = n; n.classList.add('sel');
  });
  colR.addEventListener('click', e => {
    const n = e.target.closest('.map-node');
    if (!n || n.classList.contains('done') || !selL) return;
    const a = center(selL, 'L'), b = center(n, 'R');
    if (selL.dataset.id === n.dataset.id) {
      drawLine(a, b, 'ln-ok');
      selL.classList.remove('sel'); selL.classList.add('done'); n.classList.add('done');
      selL = null; matched++;
      $('#l5-prog').textContent = `已連對：${matched} / ${total}`;
      if (matched === total) { State.addExp(30); done(); }
    } else {
      const ln = drawLine(a, b, 'ln-bad');
      n.classList.add('shakex');
      setTimeout(() => { ln.remove(); n.classList.remove('shakex'); }, 700);
      selL.classList.remove('sel'); selL = null;
    }
  });
  function done() {
    const nb = el('button', 'big-btn teal', i + 1 < AA_LEVEL5.rounds.length ? '下一張知識圖 →' : '挑戰知識蜘蛛王 🕷️');
    nb.addEventListener('click', () => level5_round(i + 1));
    $('#l5-ctrl').appendChild(nb);
  }
}

/* ═══════════════ 創作畫布（第 9、10 關共用） ═══════════════ */
const PALETTE = ['#e0552b', '#f2a03d', '#ffd93b', '#4bbf73', '#3a86a6', '#8b5cf6', '#e05299', '#7a4b25', '#2b2b3a'];
const STAMPS = ['🐃', '🍌', '🏠', '☀️', '🌸', '🐟', '🏔️', '🌊', '🌳', '⛩️', '🌻', '⛵'];
const PAPER = '#fffdf7';

function makeCanvas(w, h) {
  const wrap = el('div', 'canvas-wrap');
  const canvas = document.createElement('canvas');
  canvas.className = 'draw-canvas';
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  wrap.appendChild(canvas);

  let color = PALETTE[0], size = 9, stamp = null, drawing = false;
  let strokes = 0, stampCount = 0;
  const usedColors = new Set();

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }
  function down(e) {
    const p = pos(e);
    if (stamp) {
      ctx.font = '52px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(stamp, p.x, p.y);
      stampCount++;
      return;
    }
    drawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 部分環境不支援 */ }
    ctx.strokeStyle = color; ctx.lineWidth = size;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 0.1, p.y + 0.1); ctx.stroke();
    strokes++; usedColors.add(color);
  }
  function move(e) {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  function up() { drawing = false; }
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  return {
    wrap, canvas,
    setColor(c) { color = c; stamp = null; },
    setStamp(s) { stamp = s; },
    setSize(n) { size = n; },
    erase() { color = PAPER; stamp = null; },
    clear() {
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);
      strokes = 0; stampCount = 0; usedColors.clear();
    },
    stats() { return { strokes, stamps: stampCount, colors: usedColors.size }; },
    hasWork() { return strokes > 0 || stampCount > 0; },
    toImage() { return canvas.toDataURL('image/png'); },
  };
}

/* 工具列：顏色、印章、橡皮擦、清空 */
function buildTools(api) {
  const bar = el('div', 'tools');
  const rowC = el('div', 'tool-row');
  rowC.appendChild(el('span', 'tool-label', '顏色'));
  PALETTE.forEach((c, i) => {
    const b = el('button', 'swatch' + (i === 0 ? ' on' : ''));
    b.style.background = c;
    b.dataset.color = c;
    b.addEventListener('click', () => {
      api.setColor(c);
      bar.querySelectorAll('.swatch,.stamp-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    });
    rowC.appendChild(b);
  });
  bar.appendChild(rowC);

  const rowS = el('div', 'tool-row');
  rowS.appendChild(el('span', 'tool-label', '印章'));
  STAMPS.forEach(s => {
    const b = el('button', 'stamp-btn', s);
    b.dataset.stamp = s;
    b.addEventListener('click', () => {
      api.setStamp(s);
      bar.querySelectorAll('.swatch,.stamp-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    });
    rowS.appendChild(b);
  });
  bar.appendChild(rowS);

  const rowA = el('div', 'tool-row');
  const er = el('button', 'tool-act', '🧽 橡皮擦');
  er.addEventListener('click', () => {
    api.erase();
    bar.querySelectorAll('.swatch,.stamp-btn').forEach(x => x.classList.remove('on'));
  });
  const cl = el('button', 'tool-act', '🗑️ 全部清空');
  cl.addEventListener('click', () => { if (confirm('確定要清空整張畫嗎?')) api.clear(); });
  rowA.appendChild(er); rowA.appendChild(cl);
  bar.appendChild(rowA);
  return bar;
}

/* ═══════════════ 第 9 關：創新（融合創作） ═══════════════ */
let _l9picked = [];
function level9_start() { _bossWrong = 0; _l9picked = []; level9_pick(); }

function level9_pick() {
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `
    <div class="map-sub">第 9 關 · 創新　🧠 選出兩種靈感,把它們「融合」成你自己的東西</div>
    <div class="q-exp" style="max-width:560px;margin:12px auto">複製人只會抄襲。你要做的不是模仿,而是<b>創造</b>——挑兩種你喜歡的風格,混出全新的作品!</div>
  `;
  const grid = el('div', 'style-grid');
  AA_LEVEL9.styles.forEach(st => {
    const c = el('button', 'style-card', `<span class="sc-icon">${st.icon}</span><span class="sc-label">${st.label}</span>`);
    c.dataset.id = st.id;
    c.addEventListener('click', () => {
      const i = _l9picked.indexOf(st.id);
      if (i >= 0) { _l9picked.splice(i, 1); c.classList.remove('on'); }
      else {
        if (_l9picked.length >= 2) return;
        _l9picked.push(st.id); c.classList.add('on');
      }
      refresh();
    });
    grid.appendChild(c);
  });
  s.appendChild(grid);
  const prog = el('div', 'progress-pill', '已選：0 / 2');
  prog.id = 'l9-prog';
  s.appendChild(prog);
  const ctrl = el('div', 'back-row'); ctrl.id = 'l9-ctrl';
  s.appendChild(ctrl);
  stage.appendChild(s);

  function refresh() {
    $('#l9-prog').textContent = `已選：${_l9picked.length} / 2`;
    const ctl = $('#l9-ctrl'); ctl.innerHTML = '';
    if (_l9picked.length === 2) {
      const b = el('button', 'big-btn', '開始融合創作 🎨');
      b.addEventListener('click', level9_create);
      ctl.appendChild(b);
    }
  }
}

function level9_create() {
  const names = _l9picked.map(id => AA_LEVEL9.styles.find(s => s.id === id));
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `
    <div class="map-sub">第 9 關 · 創新　🎨 把兩種靈感融合成你的新作品</div>
    <div class="fusion-banner">${names.map(n => `<span>${n.icon} ${n.label}</span>`).join('<b>＋</b>')}</div>
  `;
  const api = makeCanvas(720, 480);
  s.appendChild(api.wrap);
  s.appendChild(buildTools(api));
  const hint = el('div', 'q-exp', '💡 用顏色畫、用印章蓋,把兩種靈感混在一起。<b>沒有標準答案</b>,畫出你想像中的樣子就好!');
  hint.style.cssText = 'max-width:600px;margin:14px auto 0';
  s.appendChild(hint);
  const ctrl = el('div', 'back-row');
  const done = el('button', 'big-btn', '完成我的創作 ✨');
  done.addEventListener('click', () => {
    if (!api.hasWork()) { alert('先在畫布上畫點什麼或蓋個印章吧!'); return; }
    State.addExp(40);
    confetti(30);
    bossQuiz(AA_LEVEL9.boss, () => levelClear(9, '創世畫筆'));
  });
  ctrl.appendChild(done);
  s.appendChild(ctrl);
  stage.appendChild(s);
}

/* ═══════════════ 第 10 關：內化（代表作 → 展覽） ═══════════════ */
let _l10 = { img: null, title: '', author: '', stats: null };

function level10_start() {
  _bossWrong = 0;
  _l10 = { img: null, title: '', author: '', stats: null };
  stage.innerHTML = '';
  const s = el('section', 'screen intro');
  s.innerHTML = `
    <span class="orb float">👑</span>
    <div class="logo" style="font-size:clamp(24px,6vw,36px)">最後一關 · 內化</div>
    <div class="sub">畫出屬於你自己的代表作</div>
    <div class="story">
      你已經學會了觀察、描述、理解、分析與創造。<br>
      現在,沒有任何人可以告訴你「該畫什麼」。<br><br>
      最後要面對的<span class="em">不是敵人</span>,<br>
      而是那個<span class="em">害怕創作的自己</span>。<br><br>
      深呼吸——畫出你想畫的東西吧!
    </div>
    <button class="big-btn" id="l10-go">開始我的代表作 🖌️</button>
  `;
  stage.appendChild(s);
  $('#l10-go').addEventListener('click', level10_create);
}

function level10_create() {
  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `<div class="map-sub">第 10 關 · 內化　🖌️ 這是你的代表作,自由創作吧!</div>`;
  const api = makeCanvas(720, 540);
  s.appendChild(api.wrap);
  s.appendChild(buildTools(api));

  const form = el('div', 'work-form');
  form.innerHTML = `
    <label>作品名稱<input id="l10-title" type="text" maxlength="20" placeholder="幫你的作品取個名字"></label>
    <label>創作者<input id="l10-author" type="text" maxlength="12" placeholder="你的名字"></label>
  `;
  s.appendChild(form);

  const ctrl = el('div', 'back-row');
  const done = el('button', 'big-btn', '完成代表作 ✨');
  done.addEventListener('click', () => {
    if (!api.hasWork()) { alert('先畫下你的作品吧!'); return; }
    _l10.img = api.toImage();
    _l10.stats = api.stats();
    _l10.title = ($('#l10-title').value || '').trim() || '無題';
    _l10.author = ($('#l10-author').value || '').trim() || '一位藝術家';
    level10_review();
  });
  ctrl.appendChild(done);
  s.appendChild(ctrl);
  stage.appendChild(s);
}

function level10_review() {
  const st = _l10.stats;
  let comment;
  if (st.colors >= 4) comment = AA_LEVEL10.feedback.color;
  else if (st.stamps >= 3) comment = AA_LEVEL10.feedback.element;
  else comment = AA_LEVEL10.feedback.general[Math.floor(Math.random() * AA_LEVEL10.feedback.general.length)];

  stage.innerHTML = '';
  const s = el('section', 'screen');
  s.innerHTML = `
    <div class="map-sub">第 10 關 · 內化　🧑‍🏫 藝術老師的話</div>
    <div class="teacher-card">
      <div class="teacher-head">🧑‍🏫 藝術老師</div>
      <p>${comment}</p>
      <p class="teacher-tip">老師不打分數——因為創作沒有滿分。重要的是<b>你畫出了自己的東西</b>。</p>
    </div>
    <div class="selfcheck">
      <div class="sc-title">✍️ 想一想,勾選你做到的事：</div>
    </div>
  `;
  const box = s.querySelector('.selfcheck');
  AA_LEVEL10.selfCheck.forEach((t, i) => {
    const lab = el('label', 'sc-item', `<input type="checkbox" id="sc${i}"><span>${t}</span>`);
    box.appendChild(lab);
  });
  const ctrl = el('div', 'back-row');
  const b = el('button', 'big-btn', '把作品掛進展覽廳 🖼️');
  b.addEventListener('click', level10_exhibit);
  ctrl.appendChild(b);
  s.appendChild(ctrl);
  stage.appendChild(s);
}

function level10_exhibit() {
  // 完成最終關：給能力與經驗（沒有敵人，直接完成即勝利）
  if (State.cleared[10] == null) State.cleared[10] = 3;
  State.addPower('藝術大師');
  State.addExp(100);
  State.save();
  confetti(90);

  stage.innerHTML = '';
  const s = el('section', 'screen reward');
  s.innerHTML = `
    <span class="trophy">👑</span>
    <h2>你成為藝術創作大師了!</h2>
    <div class="gallery-frame">
      <img src="${_l10.img}" alt="${_l10.title}">
      <div class="gallery-plate">
        <b>《${_l10.title}》</b>
        <span>${_l10.author}</span>
      </div>
    </div>
    <div class="power-get">✨ 獲得最終能力：藝術大師</div>
    <div class="cert">
      <div class="cert-title">🏅 藝術神兵 · 創世畫筆 完成</div>
      <div class="cert-body">你集齊了十項藝術能力：</div>
      <div class="cert-powers">${AA_MAP.map(m => `<span>${m.power}</span>`).join('')}</div>
      <div class="cert-foot">你戰勝的不是怪物,而是那個<b>害怕創作的自己</b>。<br>從今天起,你就是一位真正的藝術創作者。</div>
    </div>
    <div class="back-row"><button class="big-btn" id="l10-end">回到地圖 🗺️</button></div>
  `;
  stage.appendChild(s);
  $('#l10-end').addEventListener('click', renderMap);
}

/* ═══════════════ Boss 對戰（通用問答） ═══════════════ */
function bossQuiz(boss, onWin) {
  let qi = 0;
  const total = boss.quiz.length;
  function render() {
    const q = boss.quiz[qi];
    stage.innerHTML = '';
    const s = el('section', 'screen boss-scene');
    s.innerHTML = `
      <div class="boss-avatar">${boss.icon}</div>
      <div class="boss-name">${boss.name}</div>
      <div class="boss-hp"><div class="boss-hpfill" style="width:${(1 - qi / total) * 100}%"></div></div>
      <p style="color:var(--ink-soft);font-size:14px;margin-bottom:4px">${qi === 0 ? boss.intro : '很好,再接再厲!'}</p>
    `;
    const qc = el('div', 'q-card');
    // Boss 第2關題目可能綁定作品縮圖
    if (q.work) {
      const thumb = el('img', null);
      thumb.src = workSrc(AA_WORKS[q.work], 500);
      thumb.style.cssText = 'width:100%;max-width:320px;border-radius:12px;display:block;margin:0 auto 12px';
      qc.appendChild(thumb);
    }
    qc.appendChild(el('div', 'q-text', q.q));
    const opts = el('div', 'opts');
    q.c.forEach((txt, idx) => {
      const b = el('button', 'opt', txt);
      b.addEventListener('click', () => {
        if (qc.dataset.done) return;
        if (idx === q.a) {
          qc.dataset.done = '1';
          b.classList.add('correct');
          [...opts.children].forEach(o => o.disabled = true);
          s.querySelector('.boss-hpfill').style.width = (1 - (qi + 1) / total) * 100 + '%';
          setTimeout(() => { qi++; qi < total ? render() : onWin(); }, 650);
        } else {
          b.classList.add('wrong'); b.disabled = true; _bossWrong++;
        }
      });
      opts.appendChild(b);
    });
    qc.appendChild(opts);
    s.appendChild(qc);
    stage.appendChild(s);
  }
  render();
}

/* ═══════════════ 過關獎勵 ═══════════════ */
function levelClear(n, power) {
  const stars = _bossWrong === 0 ? 3 : _bossWrong <= 2 ? 2 : 1;
  const prev = State.cleared[n];
  if (prev == null || stars > prev) State.cleared[n] = stars;
  State.addPower(power);
  State.addExp(100);
  State.save();
  confetti(60);
  stage.innerHTML = '';
  const s = el('section', 'screen reward');
  const info = AA_MAP.find(m => m.n === n);
  s.innerHTML = `
    <span class="trophy">🏆</span>
    <h2>第 ${n} 關 · ${info.key}　過關!</h2>
    <div class="n-stars" style="font-size:34px;letter-spacing:6px;color:var(--gold)">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <div class="power-get">✨ 獲得能力：${power}</div>
    <p style="color:var(--ink-soft);font-size:15px">EXP +100　目前稱號：${AA_RANKS[State.rankIndex()].name}</p>
    <div class="back-row"><button class="big-btn" id="clear-next">回到地圖 🗺️</button></div>
  `;
  stage.appendChild(s);
  $('#clear-next').addEventListener('click', renderMap);
}

/* ═══════════════ 啟動 ═══════════════ */
State.load();
if (State.seenIntro) renderMap(); else renderIntro();
