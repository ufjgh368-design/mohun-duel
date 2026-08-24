/* ═══════════════════════════════════════════════
   我的 ADHD 大腦冒險 — 主程式
   零依賴 vanilla JS。儲存鍵 ad_*
   核心規則：不打分數、不比誰乖。每一關都會通過。
   ═══════════════════════════════════════════════ */
'use strict';

/* ── 狀態 ── */
const State = {
  cards: [],        // 已獲得的策略卡 id
  done: {},         // { '1': true, ... }
  seenIntro: false,
  manual: null,     // 大腦說明書
  load() {
    try {
      this.cards = JSON.parse(localStorage.getItem('ad_cards') || '[]');
      this.done = JSON.parse(localStorage.getItem('ad_done') || '{}');
      this.seenIntro = localStorage.getItem('ad_intro') === '1';
      this.manual = JSON.parse(localStorage.getItem('ad_manual') || 'null');
    } catch (e) { /* 首次進入 */ }
  },
  save() {
    localStorage.setItem('ad_cards', JSON.stringify(this.cards));
    localStorage.setItem('ad_done', JSON.stringify(this.done));
    localStorage.setItem('ad_intro', this.seenIntro ? '1' : '0');
    localStorage.setItem('ad_manual', JSON.stringify(this.manual));
  },
  addCard(id) { if (!this.cards.includes(id)) this.cards.push(id); this.save(); updateHud(); },
  has(id) { return this.cards.includes(id); },
  clearCount() { return Object.keys(this.done).length; },
};

/* ── 小工具 ── */
const $ = s => document.querySelector(s);
const stage = $('#stage');
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];

let _timers = [];
function later(fn, ms) { const t = setTimeout(fn, ms); _timers.push(t); return t; }
function every(fn, ms) { const t = setInterval(fn, ms); _timers.push(t); return t; }
function clearTimers() { _timers.forEach(t => { clearTimeout(t); clearInterval(t); }); _timers = []; }

function paint(node) {
  clearTimers();
  document.querySelectorAll('.overlay').forEach(o => o.remove());
  stage.innerHTML = '';
  stage.appendChild(node);
  window.scrollTo(0, 0);
}
function screen(cls) { return el('section', 'screen' + (cls ? ' ' + cls : '')); }
function btnRow() { return el('div', 'btn-row'); }
function button(label, cls, fn) {
  const b = el('button', 'big-btn' + (cls ? ' ' + cls : ''), label);
  b.addEventListener('click', fn);
  return b;
}

function confetti(n = 36) {
  const bits = ['🎉', '✨', '🎊', '⭐', '🧠', '🎴', '🏅'];
  for (let i = 0; i < n; i++) {
    const c = el('div', 'confetti', pick(bits));
    c.style.left = Math.random() * 100 + 'vw';
    c.style.animationDuration = (1.6 + Math.random() * 1.8) + 's';
    c.style.fontSize = (16 + Math.random() * 20) + 'px';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3600);
  }
}

/* ── HUD ── */
function updateHud() {
  $('#hud-cardcount').textContent = State.cards.length;
  const n = State.clearCount();
  $('#hud-title').textContent = n >= 6 ? '大腦探險家 · 全部走完了' : `大腦探險家 · ${n} / 6 個控制中心`;
  $('#hud-fill').style.transform = 'scaleX(' + (n / 6) + ')';
}
$('#hud-map').addEventListener('click', () => renderMap());
$('#hud-cards').addEventListener('click', () => renderCards());

/* ═══════════════ 開場 ═══════════════ */
function renderIntro() {
  $('#hud').classList.add('hidden');
  const s = screen('intro');
  s.innerHTML = `
    <span class="orb float">🧠</span>
    <div class="logo">我的 ADHD 大腦冒險</div>
    <div class="sub">不是打敗自己，<br>而是學會和自己的大腦合作。</div>
    <div class="story">
      每個人的大腦裡，都有一座<span class="em">控制中心</span>。<br><br>
      它負責記住事情、擋掉干擾、踩剎車、算時間。<br>
      平常它做得很好，你甚至不會注意到它在工作。<br><br>
      但是今天，控制中心裡跑進了一群<span class="em">搗蛋精靈</span>。<br><br>
      你是<span class="em">大腦探險家</span>。<br>
      你的任務不是把牠們打敗——<br>
      而是看清楚<span class="em">牠們到底在做什麼</span>，<br>
      然後找到跟牠們相處的方法。
    </div>
  `;
  const row = btnRow();
  row.appendChild(button('開始冒險 🚀', '', () => { State.seenIntro = true; State.save(); renderMap(); }));
  s.appendChild(row);
  const p = el('div', 'center');
  const pb = el('button', 'text-btn', '👨‍👩‍👧 給大人看的說明');
  pb.addEventListener('click', renderForAdults);
  p.appendChild(pb);
  s.appendChild(p);
  paint(s);
}

/* ═══════════════ 控制中心地圖 ═══════════════ */
function renderMap() {
  $('#hud').classList.remove('hidden');
  updateHud();
  const s = screen();
  s.appendChild(el('div', 'page-title', '🧠 我的大腦控制中心'));
  s.appendChild(el('div', 'page-sub', '六個房間，六種搗蛋精靈。<br>沒有分數，也沒有輸贏——只有「原來如此」。'));

  const path = el('div', 'map-path');
  AD_MAP.forEach((m, i) => {
    const done = !!State.done[m.n];
    const unlocked = done || i === 0 || !!State.done[AD_MAP[i - 1].n];
    let cls = 'node';
    if (unlocked) cls += ' playable'; else cls += ' locked';
    if (done) cls += ' done';
    if (m.boss) cls += ' boss';
    const node = el('div', cls);
    node.innerHTML = `
      <div class="n-icon">${m.icon}</div>
      <div class="n-body">
        <div class="n-lv">${m.boss ? 'FINAL · ' + m.en : '第 ' + m.n + ' 關 · ' + m.en}</div>
        <div class="n-name">${m.name}</div>
        <div class="n-sub">${m.sub}</div>
      </div>
      <div class="n-badge">${unlocked ? (done ? '✅' : '▶️') : '🔒'}</div>
    `;
    if (unlocked) node.addEventListener('click', () => startLevel(m.n));
    path.appendChild(node);
  });
  s.appendChild(path);

  const row = btnRow();
  if (State.manual) row.appendChild(button('📖 我的大腦說明書', 'cyan', () => showManual(State.manual)));
  const ab = el('button', 'text-btn', '👨‍👩‍👧 給大人看的說明');
  ab.addEventListener('click', renderForAdults);
  row.appendChild(ab);
  s.appendChild(row);
  paint(s);
}

function startLevel(n) {
  if (n === 1) return l1_intro();
  if (n === 2) return l2_intro();
  if (n === 3) return l3_intro();
  if (n === 4) return l4_intro();
  if (n === 5) return l5_intro();
  if (n === 6) return boss_intro();
}

/* ═══════════════ 通用：關卡開場 ═══════════════ */
function levelIntro(n, opts, nextFn) {
  const m = AD_MAP.find(x => x.n === n);
  const s = screen();
  s.innerHTML = `
    <div class="center" style="margin-bottom:14px">
      <span class="scene-tag">${m.boss ? '最終挑戰' : '第 ' + m.n + ' 關'}</span>
      <div style="font-size:56px;margin-top:10px">${m.icon}</div>
      <div class="scene-title">${m.name}</div>
      <div class="page-sub" style="margin-bottom:0">${m.en}</div>
    </div>
  `;
  const c = el('div', 'card');
  c.innerHTML = opts.story;
  s.appendChild(c);
  if (opts.rule) {
    const r = el('div', 'know');
    r.innerHTML = `<div class="kt">怎麼玩</div><div class="kb">${opts.rule}</div>`;
    s.appendChild(r);
  }
  const row = btnRow();
  row.appendChild(button(opts.btn || '開始 ▶️', '', nextFn));
  row.appendChild(button('回控制中心', 'ghost', renderMap));
  s.appendChild(row);
  paint(s);
}

/* ═══════════════ 通用：結尾三部曲 ═══════════════ */
/* 大腦小知識 → 拿策略卡 → 一起聊聊 → 回控制中心 */
function knowScreen(n, opts, nextFn) {
  const s = screen();
  s.appendChild(el('div', 'page-title', opts.title || '🔍 原來如此'));
  if (opts.lead) {
    const c = el('div', 'card');
    c.innerHTML = `<div class="narr">${opts.lead}</div>`;
    s.appendChild(c);
  }
  const k = el('div', 'know');
  k.innerHTML = `<div class="kt">大腦小知識</div><div class="kb">${opts.know}</div>`;
  s.appendChild(k);
  const row = btnRow();
  row.appendChild(button(opts.btn || '拿到策略卡 🎴', '', nextFn));
  s.appendChild(row);
  paint(s);
}

function cardScreen(cardId, nextFn, lead, btnLabel) {
  const c = AD_CARDS[cardId];
  const isNew = !State.has(cardId);
  State.addCard(cardId);
  const s = screen();
  s.appendChild(el('div', 'page-title', isNew ? '🎴 獲得新的策略卡！' : '🎴 你的策略卡'));
  if (lead) s.appendChild(el('div', 'page-sub', lead));
  const g = el('div', 'getcard');
  g.innerHTML = `
    <div class="gi">${c.icon}</div>
    <div class="gn">${c.name}</div>
    <div class="gt">${c.tag}</div>
    <div class="gh"><b>怎麼用：</b>${c.how}<br><br><b>為什麼有效：</b>${c.why}</div>
  `;
  s.appendChild(g);
  const row = btnRow();
  row.appendChild(button(btnLabel || '一起聊聊 💬', 'cyan', nextFn));
  s.appendChild(row);
  paint(s);
  if (isNew) confetti(24);
}

function talkScreen(n, questions, nextFn) {
  const s = screen();
  s.appendChild(el('div', 'page-title', '💬 一起聊聊'));
  s.appendChild(el('div', 'page-sub', '把遊戲機關上，跟旁邊的大人（或自己）聊一下。<br>沒有標準答案。'));
  const t = el('div', 'talk');
  t.innerHTML = `<div class="tt">試試看這樣問</div><ul>${questions.map(q => `<li>${q}</li>`).join('')}</ul>`;
  s.appendChild(t);
  const row = btnRow();
  row.appendChild(button('回控制中心 🧠', '', nextFn || renderMap));
  s.appendChild(row);
  paint(s);
}

function finishLevel(n) {
  State.done[n] = true;
  State.save();
  updateHud();
}

/* ═══════════════════════════════════════════════
   第 1 關：猴子注意力
   ═══════════════════════════════════════════════ */
let L1 = null;

function l1_intro() {
  levelIntro(1, {
    story: `
      <div class="speak"><b>媽媽：</b>「去房間幫我拿水壺。」</div>
      <div class="narr">你說好，然後站起來往房間走。</div>
      <div class="narr">從客廳到房間，只有十幾步。</div>
      <div class="narr">這麼近，怎麼可能會忘記呢？</div>`,
    rule: `你只要一直<b>往前走</b>就好。<br>路上會遇到一些東西——你可以看一下，也可以不看。<br>兩種都可以，這一關<b>沒有正確答案</b>。`,
    btn: '出發 🚶',
  }, l1_start);
}

function l1_start() {
  const slots = {};
  const ds = shuffle(AD_L1.distractions).slice(0, 4);
  [2, 3, 5, 6].forEach((s, i) => { slots[s] = ds[i]; });
  L1 = { step: 0, peeks: 0, met: [], slots };
  l1_walk();
}

function l1_missionStrip() {
  const cls = L1.peeks >= 3 ? 'gone' : L1.peeks === 2 ? 'fade2' : L1.peeks === 1 ? 'fade1' : '';
  return `<div class="mission-strip ${cls}">任務：去房間拿 ${AD_L1.mission.icon} ${AD_L1.mission.name}</div>`;
}

function l1_walk() {
  const s = screen();
  s.innerHTML = l1_missionStrip();
  const dots = el('div', 'steps');
  for (let i = 0; i < AD_L1.steps; i++) dots.appendChild(el('div', 'dot' + (i < L1.step ? ' on' : '')));
  s.appendChild(dots);

  const hall = el('div', 'hall');
  const d = L1.slots[L1.step];
  if (d) {
    hall.innerHTML = `<div class="walker pop-in">${d.icon}</div><div class="narr center">${d.line}</div>`;
  } else {
    const lines = ['走廊上什麼都沒有。', '你繼續往前走。', '房間門就在前面了。', '你走過客廳。', '腳步聲有點大。'];
    hall.innerHTML = `<div class="walker">🚶</div><div class="narr center">${lines[L1.step % lines.length]}</div>`;
  }
  s.appendChild(hall);

  const row = btnRow();
  if (d) {
    row.appendChild(button('去看一下 👀', 'orange', () => l1_peek(d)));
    row.appendChild(button('繼續往前走 ➡️', 'cyan', () => l1_next()));
  } else {
    row.appendChild(button('往前走 ➡️', '', () => l1_next()));
  }
  s.appendChild(row);
  paint(s);
}

function l1_peek(d) {
  L1.peeks++;
  L1.met.push(d);
  const s = screen();
  s.innerHTML = l1_missionStrip();
  const hall = el('div', 'hall');
  hall.innerHTML = `<div class="walker pop-in">${d.icon}</div><div class="narr center">${d.peek}</div>`;
  s.appendChild(hall);
  if (L1.peeks === 1) s.appendChild(el('div', 'page-sub', '（上面的任務……好像有點看不清楚了？）'));
  const row = btnRow();
  row.appendChild(button('好了好了，繼續走 ➡️', '', () => l1_next()));
  s.appendChild(row);
  paint(s);
}

function l1_next() {
  L1.step++;
  if (L1.step >= AD_L1.steps) return l1_room();
  l1_walk();
}

function l1_room() {
  const s = screen();
  s.innerHTML = l1_missionStrip();
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="scene-title">🚪 你到房間了</div>
    <div class="narr center">你站在房間中間。</div>
    <div class="narr center" style="font-weight:800">……你是來拿什麼的？</div>`;
  s.appendChild(c);

  const grid = el('div', 'item-grid');
  shuffle(AD_L1.roomItems).forEach(it => {
    const b = el('button', 'item-btn', it);
    b.addEventListener('click', () => l1_choose(it));
    grid.appendChild(b);
  });
  s.appendChild(grid);
  s.appendChild(el('div', 'page-sub', '選一個拿回去。'));
  paint(s);
}

function l1_choose(item) {
  const right = item === AD_L1.mission.icon;
  const s = screen();
  const c = el('div', 'card');
  if (right) {
    c.innerHTML = `
      <div class="scene-title">🥤 你拿了水壺回去</div>
      <div class="narr">媽媽說：「謝謝！」</div>
      <div class="narr">${L1.peeks === 0
        ? '你一路都沒有停下來。你自己知道那有多難——因為路上真的很多東西在叫你。'
        : '你中途看了 ' + L1.peeks + ' 次別的東西，但最後還是想起來了。你的大腦有把任務抓回來。'}</div>`;
  } else {
    c.innerHTML = `
      <div class="scene-title">${item} 你拿了「${AD_L1.itemNames[item]}」回去</div>
      <div class="speak"><b>媽媽：</b>「……我叫你拿水壺啊。」</div>
      <div class="narr">你愣了一下。<br>你真的、真的沒有故意。</div>
      <div class="narr">你只是——在走廊上被 ${L1.met.length ? L1.met.map(d => d.icon).join(' ') : '很多東西'} 打斷之後，那句話就不見了。</div>`;
  }
  s.appendChild(c);

  if (L1.met.length) {
    const k = el('div', 'know');
    k.innerHTML = `<div class="kt">你路上遇到的</div><div class="kb">${L1.met.map(d => d.icon + ' ' + d.name).join('　')}</div>`;
    s.appendChild(k);
  }
  const row = btnRow();
  row.appendChild(button('那到底發生什麼事？ 🔍', '', l1_know));
  s.appendChild(row);
  paint(s);
}

function l1_know() {
  knowScreen(1, {
    lead: `很多大人會說：「你怎麼那麼不專心？」<br>但剛剛在走廊上發生的，其實不是「不專心」。`,
    know: `你的大腦裡有一塊很小的白板，叫做<b>工作記憶</b>。<br>
      「去拿水壺」被寫在上面。<br><br>
      白板很小，而且<b>新的東西一進來，就會蓋掉舊的</b>。<br>
      LEGO 進來、狗狗進來、漫畫進來……<br>
      每進來一樣，水壺就被推得更遠一點。<br><br>
      所以不是<b>故意忘記</b>，<br>
      是那句話<b>真的被蓋掉了</b>。`,
  }, () => cardScreen('list', l1_talk, '有一個方法，可以讓白板變大：把它放到大腦外面。'));
}

function l1_talk() {
  finishLevel(1);
  talkScreen(1, [
    '剛剛走廊上，哪一個東西最難不看？',
    '在真實生活裡，你最常在哪裡「走到一半忘記」？',
    '（給大人）如果請他做事之前，先讓他<b>複述一次</b>，會不會比較容易記得？',
    '（給大人）「我剛剛講的是什麼？」比「你怎麼又忘記」更有幫助。',
  ]);
}

/* ═══════════════════════════════════════════════
   第 2 關：火山情緒
   ═══════════════════════════════════════════════ */
let L2 = null;

function l2_intro() {
  levelIntro(2, {
    story: `
      <div class="narr">早上，你的心情本來是這樣的：</div>
      <div class="narr center" style="font-size:34px">🙂 🙂 🙂</div>
      <div class="narr">還可以。沒什麼特別的。</div>
      <div class="narr">然後，事情開始一件一件發生。</div>`,
    rule: `一張一張翻開<b>事件卡</b>。<br>每一張都會讓情緒往上加一點。<br>你不會知道哪一張會讓火山爆發。`,
    btn: '開始這一天 🌅',
  }, () => l2_round(false));
}

function l2_round(withPause) {
  L2 = { emo: 0, i: 0, log: [], deck: shuffle(AD_L2.events), withPause, breaths: 0, exploded: false };
  l2_render();
}

function l2_render() {
  const s = screen();
  s.appendChild(el('div', 'page-title', L2.withPause ? '🌬️ 這次帶著暫停卡' : '🌋 火山情緒'));

  const face = L2.emo >= 9 ? '🤬' : L2.emo >= 7 ? '😠' : L2.emo >= 5 ? '😣' : L2.emo >= 3 ? '😐' : '🙂';
  const v = el('div', 'volcano', face);
  s.appendChild(v);

  const bar = el('div', 'emo-bar');
  const fill = el('div', 'emo-fill');
  fill.style.width = Math.min(100, (L2.emo / AD_L2.max) * 100) + '%';
  bar.appendChild(fill);
  s.appendChild(bar);
  s.appendChild(el('div', 'page-sub', `情緒能量：${Math.min(L2.emo, AD_L2.max)} / ${AD_L2.max}`));

  if (L2.log.length) {
    const last = L2.log[L2.log.length - 1];
    const c = el('div', 'event-card');
    c.innerHTML = `<div class="ei">${last.icon}</div>
      <div class="et">${last.who ? '<b>' + last.who + '：</b>' : ''}${last.text}</div>
      <div class="ev">情緒 +${last.v}</div>`;
    s.appendChild(c);
    v.classList.add('shake');
  } else {
    const c = el('div', 'event-card');
    c.innerHTML = `<div class="ei">🎴</div><div class="et">翻開第一張事件卡</div>`;
    s.appendChild(c);
  }

  const row = btnRow();
  row.appendChild(button('翻下一張 🎴', '', l2_draw));
  if (L2.withPause) row.appendChild(button('🧠 用暫停卡（深呼吸）', 'cyan', l2_breathe));
  s.appendChild(row);
  paint(s);
}

function l2_draw() {
  if (L2.i >= L2.deck.length) return l2_survived();
  const e = L2.deck[L2.i++];
  L2.emo += e.v;
  L2.log.push(e);
  if (L2.emo >= AD_L2.max) return l2_boom(e);
  l2_render();
}

function l2_breathe() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🌬️ 深呼吸'));
  s.appendChild(el('div', 'page-sub', '跟著球一起。球變大 = 吸氣，球變小 = 吐氣。'));
  const orb = el('div', 'breathe-orb', '準備');
  s.appendChild(orb);
  const row = btnRow();
  s.appendChild(row);
  paint(s);

  let cycle = 0;
  const inhale = () => {
    orb.textContent = '吸氣…';
    orb.classList.add('big');
    later(() => {
      orb.textContent = '吐氣…';
      orb.classList.remove('big');
      later(() => {
        cycle++;
        if (cycle < 2) inhale();
        else {
          L2.breaths++;
          L2.emo = Math.max(0, L2.emo - 4);
          orb.textContent = '好多了';
          row.appendChild(button('回到早上 ➡️', 'cyan', l2_render));
        }
      }, 4200);
    }, 4200);
  };
  later(inhale, 700);
}

function l2_boom(last) {
  L2.exploded = true;
  if (L2.withPause) return l2_boomAgain();
  const s = screen();
  s.appendChild(el('div', 'boom', '🌋💥'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="scene-title">爆炸了</div>
    <div class="narr center">你大吼了一聲。或是把書包摔在地上。</div>
    <div class="narr center">全家都嚇一跳。</div>
    <div class="speak"><b>大人：</b>「不過就是一句話，你發什麼脾氣？」</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('真的是那一句話嗎？ 🤔', '', () => l2_quiz(last)));
  s.appendChild(row);
  paint(s);
}

function l2_quiz(last) {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🤔 是哪一句話害的？'));
  const c = el('div', 'card');
  c.innerHTML = `<div class="narr center">最後一張卡是：</div>
    <div class="narr center" style="font-size:19px;font-weight:900">${last.icon} ${last.who ? last.who + '：' : ''}${last.text}</div>`;
  s.appendChild(c);

  const opts = el('div', 'opts');
  const answers = [
    { t: '就是最後那一句話害的', ok: false },
    { t: '是前面全部加起來，最後一句只是剛好在最上面', ok: true },
    { t: '因為我脾氣不好', ok: false },
  ];
  answers.forEach(a => {
    const b = el('button', 'opt', `<span class="oi">💭</span><span>${a.t}</span>`);
    b.addEventListener('click', () => {
      [...opts.children].forEach(x => { x.disabled = true; });
      b.classList.add(a.ok ? 'correct' : 'wrong');
      if (!a.ok) [...opts.children].forEach((x, i) => { if (answers[i].ok) x.classList.add('correct'); });
      later(l2_stack, 900);
    });
    opts.appendChild(b);
  });
  s.appendChild(opts);
  paint(s);
}

function l2_stack() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '📚 今天早上，其實發生了這些'));
  const list = el('div', 'order-list');
  let sum = 0;
  L2.log.forEach((e, i) => {
    sum += e.v;
    const it = el('div', 'order-item');
    it.innerHTML = `<span class="num">${i + 1}</span><span>${e.icon} ${e.who ? e.who + '：' : ''}${e.text}</span>
      <span style="margin-left:auto;font-weight:900;color:var(--red)">+${e.v}</span>`;
    list.appendChild(it);
  });
  s.appendChild(list);
  s.appendChild(el('div', 'page-sub', `全部加起來 = ${sum}。<br>火山不是被最後一句話點燃的，是<b>早就滿了</b>。`));
  const row = btnRow();
  row.appendChild(button('原來如此 🔍', '', l2_know));
  s.appendChild(row);
  paint(s);
}

function l2_know() {
  knowScreen(2, {
    know: `情緒不是<b>開關</b>，是<b>水位</b>。<br><br>
      每件小事都會加一點水。<br>找不到襪子加一點、被催加一點、被說「你很慢」再加一點。<br><br>
      水位滿了以後，<b>下一件事不管多小，都會溢出來</b>。<br><br>
      所以大人看到的是「他為了一句話發飆」，<br>
      但實際上是——<b>那已經是第七件事了</b>。<br><br>
      ADHD 的大腦，水位常常上升得比較快，也比較難自己降下來。<br>
      這不是脾氣差，這是<b>調節</b>比較辛苦。`,
  }, () => cardScreen('pause', l2_retryOffer, '有一個方法可以讓水位降下來。', '試試看這張卡 🌬️'));
}

function l2_retryOffer() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🌬️ 再過一次同樣的早上'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr">同樣的一天，同樣的十件事。</div>
    <div class="narr">這次你手上有<b>暫停卡</b>。</div>
    <div class="narr">水位快滿的時候，先按暫停、深呼吸兩次，水位會降下來 4 格。</div>
    <div class="narr">看看這次會不會不一樣。</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('再來一次 🌅', 'cyan', () => l2_round(true)));
  row.appendChild(button('先跳過', 'ghost', l2_talk));
  s.appendChild(row);
  paint(s);
}

/* 帶著暫停卡還是爆了——這也要能好好收尾，不能又繞回同一張卡 */
function l2_boomAgain() {
  const s = screen();
  s.appendChild(el('div', 'boom', '🌋💥'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="scene-title">這次還是爆了</div>
    <div class="narr">你按了 <b>${L2.breaths}</b> 次暫停，但水位還是滿出來了。</div>
    <div class="narr">這件事一定要講清楚：<b>暫停卡不是萬靈丹。</b></div>
    <div class="narr">有時候水位太高、事情太多、身體太累，深呼吸來不及救。<br>那不代表你做錯了，也不代表這張卡沒用。</div>
    <div class="narr">爆炸不是世界末日。<b>爆完了，一起收拾就好。</b></div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('再試一次 🔁', 'cyan', () => l2_round(true)));
  row.appendChild(button('一起聊聊 💬', '', l2_talk));
  s.appendChild(row);
  paint(s);
}

function l2_survived() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🙂 你撐過了整個早上'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr center" style="font-size:44px">🌋 ➡️ 🏔️</div>
    <div class="narr">十件事全部發生了，一件都沒有少。</div>
    <div class="narr">但是你按了 <b>${L2.breaths}</b> 次暫停，把水位放掉了一些。</div>
    <div class="narr">火山還在。只是今天沒有爆。</div>
    <div class="narr" style="color:var(--soft)">要注意：暫停卡<b>不是每次都有效</b>。有時候水位太高，還是會爆——那也沒關係，爆完了再一起收拾就好。</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('一起聊聊 💬', '', l2_talk));
  s.appendChild(row);
  paint(s);
  confetti(20);
}

function l2_talk() {
  finishLevel(2);
  talkScreen(2, [
    '你今天的情緒水位，現在大概幾格？',
    '什麼事情最會讓你的水位快速上升？',
    '水位很高的時候，你希望別人怎麼做？（不要講話？抱一下？離開一下？）',
    '（給大人）在孩子水位高的時候講道理，通常沒有用——先降水位，再談事情。',
  ]);
}

/* ═══════════════════════════════════════════════
   第 3 關：剎車壞掉
   ═══════════════════════════════════════════════ */
let L3 = null;

function l3_intro() {
  levelIntro(3, {
    story: `
      <div class="narr">桌上放了一顆糖果。</div>
      <div class="speak"><b>老師：</b>「三十秒之後才可以吃喔。」</div>
      <div class="narr">三十秒而已。你知道規則。你也想遵守。</div>
      <div class="narr">問題是——你的手不一定聽你的。</div>`,
    rule: `撐過 <b>30 秒</b>，糖果就是你的。<br>
      快忍不住的時候，可以按 <b>「我快忍不住了」</b> 換個方法撐。<br>
      如果真的伸手了——<b>也沒關係</b>，糖果一樣會給你。這一關不會失敗。`,
    btn: '把糖果放上桌 🍬',
  }, l3_start);
}

function l3_start() {
  L3 = { left: AD_L3.seconds, grabbed: false, grabAt: null, diverts: 0, shown: [] };
  const s = screen();
  s.appendChild(el('div', 'page-title', '🍬 還不能吃'));
  const t = el('div', 'timer-ring', L3.left + ' 秒');
  s.appendChild(t);
  const bar = el('div', 'timer-bar');
  const fill = el('div', 'timer-fill');
  bar.appendChild(fill);
  s.appendChild(bar);

  const stageBox = el('div', 'candy-stage');
  const candy = el('div', 'candy', '🍬');
  stageBox.appendChild(candy);
  s.appendChild(stageBox);

  const log = el('div', 'tempt-log');
  s.appendChild(log);

  const row = btnRow();
  const divBtn = button('🌬️ 我快忍不住了', 'cyan', () => l3_divert(log));
  row.appendChild(divBtn);
  s.appendChild(row);
  paint(s);

  candy.addEventListener('click', () => {
    if (L3.grabbed) return;
    L3.grabbed = true;
    L3.grabAt = AD_L3.seconds - L3.left;
    candy.textContent = '😮';
    candy.classList.remove('wiggle');
    const w = el('div', 'tempt');
    w.innerHTML = `<span>✋</span><span>你伸手了。第 ${L3.grabAt} 秒。手比你快。</span>`;
    log.appendChild(w);
  });

  every(() => {
    L3.left--;
    t.textContent = L3.left + ' 秒';
    fill.style.width = (L3.left / AD_L3.seconds * 100) + '%';
    if (L3.left <= 10) fill.classList.add('hot');

    AD_L3.temptations.forEach(tp => {
      if (tp.at === L3.left && !L3.shown.includes(tp.at)) {
        L3.shown.push(tp.at);
        const w = el('div', 'tempt');
        w.innerHTML = `<span>${tp.icon}</span><span>${tp.text}</span>`;
        log.appendChild(w);
        if (!L3.grabbed) {
          candy.classList.add('wiggle');
          candy.style.fontSize = (58 + L3.shown.length * 9) + 'px';
          candy.style.left = (25 + Math.random() * 50) + '%';
          candy.style.top = (30 + Math.random() * 40) + '%';
        }
      }
    });
    if (L3.left <= 0) l3_end();
  }, 1000);
}

function l3_divert(log) {
  L3.diverts++;
  const d = pick(AD_L3.divert);
  const w = el('div', 'tempt');
  w.style.borderColor = '#a8e6ee';
  w.style.background = '#e9fafc';
  w.innerHTML = `<span>${d.icon}</span><span>${d.text}</span>`;
  log.appendChild(w);
}

function l3_end() {
  clearTimers();
  const s = screen();
  s.appendChild(el('div', 'page-title', '🎉 時間到！糖果是你的'));
  const c = el('div', 'card');
  let body;
  if (!L3.grabbed && L3.diverts === 0) {
    body = `<div class="narr">你撐完了三十秒，什麼工具都沒用。</div>
      <div class="narr">別人可能覺得那很簡單。<b>只有你知道剛剛有多用力。</b></div>`;
  } else if (!L3.grabbed) {
    body = `<div class="narr">你撐完了三十秒——而且你用了 <b>${L3.diverts}</b> 次方法幫自己撐。</div>
      <div class="narr">這很重要：你不是「忍住」而已，你是<b>做了一件事</b>來幫忙。<br>忍耐會用完，方法不會。</div>`;
  } else {
    body = `<div class="narr">你在第 <b>${L3.grabAt}</b> 秒伸手了。</div>
      <div class="narr">先講清楚：<b>這不是壞小孩</b>。</div>
      <div class="narr">你當時知道規則嗎？知道。你想遵守嗎？想。<br>那為什麼手還是動了？</div>`;
  }
  c.innerHTML = `<div class="narr center" style="font-size:50px">🍬</div>${body}`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('因為…… 🔍', '', l3_know));
  s.appendChild(row);
  paint(s);
  confetti(18);
}

function l3_know() {
  knowScreen(3, {
    know: `自制力不是「<b>知不知道</b>」。<br><br>
      你完全知道不能吃。知道得很清楚。<br>
      但是「知道」和「停下來」，是大腦裡<b>兩個不同的部門</b>。<br><br>
      負責踩剎車的那個部門叫<b>抑制控制</b>。<br>
      它就像一塊肌肉——<b>會累</b>。<br>
      而且誘惑每強一次，它就要多出一次力。<br><br>
      ADHD 的剎車不是壞掉，是<b>比較慢、比較快累</b>。<br><br>
      所以有效的方法不是「你要更努力忍耐」，<br>
      而是——<b>讓剎車不用出那麼多力</b>：<br>
      把糖果收起來、換個地方、找事情做。`,
  }, () => cardScreen('quiet', l3_talk, '減少刺激，比增加忍耐有用。'));
}

function l3_talk() {
  finishLevel(3);
  talkScreen(3, [
    '剛剛第幾秒最難撐？',
    '如果糖果放在別的房間，會不會比較好撐？',
    '在你的生活裡，什麼東西最像那顆糖果？（手機？電視？遊戲？）',
    '（給大人）「把誘惑移開」比「叫他忍住」有效得多，而且不傷關係。',
  ]);
}

/* ═══════════════════════════════════════════════
   第 4 關：時間黑洞
   ═══════════════════════════════════════════════ */
let L4 = null;

function l4_intro() {
  levelIntro(4, {
    story: `
      <div class="speak"><b>媽媽：</b>「五分鐘，把房間整理好。」</div>
      <div class="narr">你說：「五分鐘？很快啊。」</div>
      <div class="narr">四十分鐘後，媽媽走進來。</div>
      <div class="speak"><b>媽媽：</b>「你這四十分鐘在幹嘛？」</div>
      <div class="narr">你也想知道。</div>`,
    rule: `這一關要做兩件事：<br>
      1️⃣ 先<b>猜</b>整理房間要花多久，再實際做一次。<br>
      2️⃣ 然後在<b>看不到時鐘</b>的情況下，感覺一分鐘。<br>
      看看你的大腦，時間感準不準。`,
    btn: '先猜猜看 🤔',
  }, l4_guess);
}

function l4_guess() {
  L4 = { guess: null, real: null, minGuess: null };
  const s = screen();
  s.appendChild(el('div', 'page-title', '🤔 你覺得要幾秒？'));
  const c = el('div', 'card');
  c.innerHTML = `<div class="narr center">地上有 <b>${AD_L4.items.length}</b> 樣東西要收進箱子。</div>
    <div class="narr center">你覺得你要花幾秒？</div>`;
  s.appendChild(c);
  const row = el('div', 'guess-row');
  [5, 10, 15, 20, 30, 45, 60].forEach(v => {
    const b = el('button', 'guess-btn', v + ' 秒');
    b.addEventListener('click', () => {
      [...row.children].forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      L4.guess = v;
      goRow.querySelector('button').disabled = false;
    });
    row.appendChild(b);
  });
  s.appendChild(row);
  const goRow = btnRow();
  const go = button('開始整理 🧹', '', l4_clean);
  go.disabled = true;
  goRow.appendChild(go);
  s.appendChild(goRow);
  paint(s);
}

function l4_clean() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🧹 把東西收進箱子'));
  s.appendChild(el('div', 'page-sub', '點一下就收好了。<br>（畫面上沒有時鐘——這是故意的。）'));
  const room = el('div', 'room');
  let left = AD_L4.items.length;
  const t0 = performance.now();
  AD_L4.items.forEach((it, i) => {
    const j = el('div', 'junk', it);
    j.style.left = (6 + Math.random() * 74) + '%';
    j.style.top = (8 + Math.random() * 68) + '%';
    j.addEventListener('click', () => {
      if (j.classList.contains('gone')) return;
      j.classList.add('gone');
      left--;
      if (left === 0) {
        L4.real = Math.round((performance.now() - t0) / 1000);
        later(l4_compare, 450);
      }
    });
    room.appendChild(j);
  });
  room.appendChild(el('div', 'box-icon', '📦'));
  s.appendChild(room);
  paint(s);
}

function l4_compare() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '⏱️ 對一下答案'));
  const cmp = el('div', 'compare');
  const a = el('div', 'cmp-box');
  a.innerHTML = `<div class="cl">你猜的</div><div class="cv">${L4.guess}秒</div>`;
  const b = el('div', 'cmp-box real');
  b.innerHTML = `<div class="cl">實際花的</div><div class="cv">${L4.real}秒</div>`;
  cmp.appendChild(a); cmp.appendChild(b);
  s.appendChild(cmp);

  const diff = L4.real - L4.guess;
  const c = el('div', 'card');
  c.style.marginTop = '16px';
  let msg;
  if (diff > 4) msg = `實際上比你猜的<b>多了 ${diff} 秒</b>。<br>而這還只是點一點而已——真正的整理房間，會差更多。`;
  else if (diff < -4) msg = `你比自己猜的<b>快了 ${-diff} 秒</b>。<br>有時候我們會高估一件事有多可怕，結果做起來比想像中快。`;
  else msg = `這次你猜得滿準的！<br>不過先別開心太早，下一個測驗比較難。`;
  c.innerHTML = `<div class="narr">${msg}</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('第二個測驗 ⏳', 'cyan', l4_minuteIntro));
  s.appendChild(row);
  paint(s);
}

function l4_minuteIntro() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '⏳ 感覺一分鐘'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr">接下來，畫面上<b>不會有任何數字</b>。</div>
    <div class="narr">你按下開始之後，覺得<b>一分鐘到了</b>，就按停。</div>
    <div class="narr">不可以看時鐘、不可以數手機。用感覺的就好。</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('開始 ▶️', '', l4_minute));
  s.appendChild(row);
  paint(s);
}

function l4_minute() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '⏳'));
  s.appendChild(el('div', 'page-sub', '覺得一分鐘到了，就按下面的按鈕。'));
  const orb = el('div', 'breathe-orb', '……');
  s.appendChild(orb);
  const t0 = performance.now();
  const row = btnRow();
  row.appendChild(button('一分鐘到了！ ⏹️', 'orange', () => {
    L4.minGuess = (performance.now() - t0) / 1000;
    l4_minuteResult();
  }));
  s.appendChild(row);
  paint(s);
}

function l4_minuteResult() {
  const real = L4.minGuess;
  const s = screen();
  s.appendChild(el('div', 'page-title', '⏱️ 你的一分鐘'));
  const cmp = el('div', 'compare');
  const a = el('div', 'cmp-box');
  a.innerHTML = `<div class="cl">真正的一分鐘</div><div class="cv">60秒</div>`;
  const b = el('div', 'cmp-box real');
  b.innerHTML = `<div class="cl">你的一分鐘</div><div class="cv">${real.toFixed(1)}秒</div>`;
  cmp.appendChild(a); cmp.appendChild(b);
  s.appendChild(cmp);

  const c = el('div', 'card');
  c.style.marginTop = '16px';
  let msg;
  if (real < 45) msg = `你的一分鐘，<b>比真的一分鐘短很多</b>。<br>這代表在你的感覺裡，時間過得比較慢——所以「再五分鐘」對你來說，可能真的很久。`;
  else if (real > 80) msg = `你的一分鐘，<b>比真的一分鐘長很多</b>。<br>這代表你很容易「一不小心就過了」——時間在你不注意的時候溜走了。`;
  else msg = `你抓得滿準的。不過要注意：<b>專心在做喜歡的事情時</b>，時間感會整個垮掉。`;
  c.innerHTML = `<div class="narr">${msg}</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('為什麼會這樣？ 🔍', '', l4_know));
  s.appendChild(row);
  paint(s);
}

function l4_know() {
  knowScreen(4, {
    know: `大腦裡沒有時鐘。<br>
      我們是靠<b>感覺</b>在估時間的——而感覺很容易騙人。<br><br>
      ADHD 的大腦特別容易兩件事：<br>
      ① <b>高估自己的速度</b>（「五分鐘就好」）<br>
      ② <b>低估工作要花的時間</b>（「這個很快」）<br><br>
      再加上做喜歡的事情時會<b>整個掉進去</b>，<br>
      一抬頭，四十分鐘就不見了。<br><br>
      所以「你都在混什麼」這句話，常常是誤會。<br>
      真正的問題是——<b>時間對他來說是看不見的</b>。<br><br>
      解法很單純：<b>把時間變成看得見的東西</b>。`,
  }, () => cardScreen('timer', l4_talk, '沙漏、倒數條、視覺計時器，都算。'));
}

function l4_talk() {
  finishLevel(4);
  talkScreen(4, [
    '你覺得自己是「時間過得太快」還是「太慢」的那一種？',
    '什麼事情你一做就會忘記時間？',
    '如果桌上放一個看得見的倒數計時器，會有幫助嗎？',
    '（給大人）「還有五分鐘」不如「你看，沙漏到這裡就要出門了」。',
  ]);
}

/* ═══════════════════════════════════════════════
   第 5 關：工作記憶背包
   ═══════════════════════════════════════════════ */
let L5 = null;

function l5_intro() {
  levelIntro(5, {
    story: `
      <div class="speak"><b>媽媽：</b>「等一下，你順便——」</div>
      <div class="narr">她一口氣講了四件事。</div>
      <div class="narr">你點頭。你真的有在聽。</div>
      <div class="narr">然後你走出房間，走到一半……</div>`,
    rule: `等一下會出現<b>四個指令</b>，只顯示幾秒鐘。<br>
      記住它們，路上還會有人再加東西。<br>
      最後把你記得的全部選出來。`,
    btn: '聽指令 👂',
  }, () => l5_show(false));
}

function l5_show(withList) {
  L5 = { withList, added: [], sec: Math.round(AD_L5.showMs / 1000) };
  const s = screen();
  s.appendChild(el('div', 'page-title', '👂 記住這些'));
  const list = el('div', 'order-list');
  AD_L5.orders.forEach((o, i) => {
    const it = el('div', 'order-item');
    it.innerHTML = `<span class="num">${i + 1}</span><span>${o.icon} ${o.text}</span>`;
    list.appendChild(it);
  });
  s.appendChild(list);
  const t = el('div', 'hold-timer', `${L5.sec} 秒後消失…`);
  s.appendChild(t);
  paint(s);
  every(() => {
    L5.sec--;
    t.textContent = L5.sec > 0 ? `${L5.sec} 秒後消失…` : '消失了！';
    if (L5.sec <= 0) { clearTimers(); later(l5_walk, 500); }
  }, 1000);
}

function l5_walk() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🚶 出發'));
  if (L5.withList) {
    const pin = el('div', 'know');
    pin.innerHTML = `<div class="kt">📋 清單卡（一直看得到）</div><div class="kb">${AD_L5.orders.map(o => o.icon + ' ' + o.text).join('<br>')}</div>`;
    s.appendChild(pin);
  }
  const hall = el('div', 'hall');
  hall.innerHTML = `<div class="walker">🚶</div>`;
  s.appendChild(hall);
  const noise = el('div', 'noise');
  s.appendChild(noise);
  const row = btnRow();
  s.appendChild(row);
  paint(s);

  const script = [
    { type: 'noise', text: '📺 電視聲音' },
    { type: 'extra', o: AD_L5.extras[0] },
    { type: 'noise', text: '🐶 狗在叫' },
    { type: 'noise', text: '📱 手機震動' },
    { type: 'extra', o: AD_L5.extras[1] },
    { type: 'noise', text: '🎵 有人放音樂' },
  ];
  let i = 0;
  const step = () => {
    if (i >= script.length) {
      row.appendChild(button('走到了，開始做事 ✅', '', l5_recall));
      return;
    }
    const e = script[i++];
    if (e.type === 'noise') {
      noise.appendChild(el('span', '', e.text));
      if (noise.children.length > 4) noise.removeChild(noise.firstChild);
    } else {
      L5.added.push(e.o);
      const sp = el('span', '', `👩 「${e.o.text}」`);
      sp.style.borderColor = 'var(--orange)';
      sp.style.background = '#fff6ee';
      noise.appendChild(sp);
      if (noise.children.length > 4) noise.removeChild(noise.firstChild);
    }
    later(step, 1400);
  };
  later(step, 700);
}

function l5_recall() {
  const all = AD_L5.orders.concat(L5.added);
  const options = shuffle(all.concat(AD_L5.decoys));
  const chosen = new Set();

  const s = screen();
  s.appendChild(el('div', 'page-title', '🎒 你要做的是哪些？'));
  s.appendChild(el('div', 'page-sub', '把你記得的全部點出來（有些是假的，沒有人叫你做）。'));
  if (L5.withList) {
    const pin = el('div', 'know');
    pin.innerHTML = `<div class="kt">📋 清單卡</div><div class="kb">${AD_L5.orders.map(o => o.icon + ' ' + o.text).join('<br>')}</div>`;
    s.appendChild(pin);
  }
  const grid = el('div', 'recall-grid');
  options.forEach(o => {
    const b = el('button', 'opt', `<span class="oi">${o.icon}</span><span>${o.text}</span>`);
    b.addEventListener('click', () => {
      if (chosen.has(o.text)) { chosen.delete(o.text); b.classList.remove('on'); }
      else { chosen.add(o.text); b.classList.add('on'); }
    });
    grid.appendChild(b);
  });
  s.appendChild(grid);
  const row = btnRow();
  row.appendChild(button('我記得的就這些 ✅', '', () => l5_result(all, chosen)));
  s.appendChild(row);
  paint(s);
}

function l5_result(all, chosen) {
  const got = all.filter(o => chosen.has(o.text));
  const missed = all.filter(o => !chosen.has(o.text));
  const wrong = [...chosen].filter(t => !all.some(o => o.text === t));

  const s = screen();
  s.appendChild(el('div', 'page-title', `🎒 你的背包裡有 ${got.length} / ${all.length} 件`));
  const list = el('div', 'order-list');
  all.forEach(o => {
    const ok = chosen.has(o.text);
    const it = el('div', 'order-item' + (ok ? '' : ' extra'));
    it.innerHTML = `<span class="num" style="${ok ? '' : 'background:var(--orange)'}">${ok ? '✓' : '✕'}</span>
      <span>${o.icon} ${o.text}</span>
      <span style="margin-left:auto;font-size:13px;color:var(--soft)">${ok ? '記得' : '掉出去了'}</span>`;
    list.appendChild(it);
  });
  s.appendChild(list);

  const c = el('div', 'card');
  c.style.marginTop = '14px';
  let msg;
  if (missed.length === 0 && wrong.length === 0) {
    msg = L5.withList
      ? `全部都記得——因為<b>你根本不用記</b>。清單幫你記了。<br>這就是重點：<b>不是把記憶練強，是把記憶搬到外面。</b>`
      : `你全部都記得！這很厲害。<br>不過注意一下：現實生活裡的指令通常更多、更雜、還會一直被打斷。`;
  } else {
    msg = `漏掉了 <b>${missed.length}</b> 件${wrong.length ? `，還多記了 ${wrong.length} 件沒人叫你做的事` : ''}。<br><br>
      這幾乎是一定會發生的。<b>不是你不認真。</b><br>
      而且注意：漏掉的常常是<b>後來才加上去的那幾件</b>——因為背包早就滿了。`;
  }
  c.innerHTML = `<div class="narr">${msg}</div>`;
  s.appendChild(c);

  const row = btnRow();
  row.appendChild(button('原來如此 🔍', '', () => l5_know()));
  s.appendChild(row);
  paint(s);
}

function l5_know() {
  knowScreen(5, {
    know: `工作記憶就是一個<b>很小的背包</b>。<br><br>
      大部分的人，一次大概裝得下 <b>4 到 7 樣</b>東西。<br>
      ADHD 的背包<b>比較小，而且底下有個洞</b>。<br><br>
      更麻煩的是：<br>
      走路要記、開門要記、有人講話又塞一件進來——<br>
      每塞一件，就有一件從洞裡掉出去。<br><br>
      所以「他就是不聽話」通常是誤會。<br>
      他有聽，只是<b>那句話在半路上掉了</b>。<br><br>
      解法不是把背包練大（很難），<br>
      而是——<b>一次少裝一點</b>，還有<b>把東西放在背包外面</b>。`,
  }, () => cardScreen('step', l5_retryOffer, '一次一件，就不會掉。', '繼續 ➡️'));
}

function l5_retryOffer() {
  if (!State.has('list')) return l5_talk();
  const s = screen();
  s.appendChild(el('div', 'page-title', '📋 用清單卡再玩一次？'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr">你在第一關拿到了<b>清單卡</b>。</div>
    <div class="narr">這次，指令<b>不會消失</b>——它會一直待在畫面上。</div>
    <div class="narr">同樣的干擾、同樣的加碼。看看差多少。</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('用清單卡再來一次 📋', 'cyan', () => l5_show(true)));
  row.appendChild(button('先跳過', 'ghost', l5_talk));
  s.appendChild(row);
  paint(s);
}

function l5_talk() {
  finishLevel(5);
  talkScreen(5, [
    '剛剛哪一件事最先從背包掉出去？',
    '如果大人一次只講一件事，會不會比較容易做到？',
    '你想把清單放在哪裡？（門上？桌上？手上？）',
    '（給大人）四件事一起講，等於什麼都沒講。講一件，做完，再講下一件。',
  ]);
}

/* ═══════════════════════════════════════════════
   Boss 關：早上出門
   ═══════════════════════════════════════════════ */
let B = null;
const BOSS_DECOYS = [
  { icon: '📺', text: '看一下電視' }, { icon: '🐶', text: '跟狗玩' },
  { icon: '📚', text: '翻漫畫' }, { icon: '🧱', text: '疊 LEGO' },
  { icon: '🎮', text: '打開遊戲' }, { icon: '🍪', text: '吃餅乾' },
];

function boss_intro() {
  levelIntro(6, {
    story: `
      <div class="narr">七點二十分。</div>
      <div class="narr">你必須在出門前，把<b>六件事</b>做完。</div>
      <div class="narr">同一時間，電話會響、狗會叫、爸爸會問問題、媽媽會催、鬧鐘會再響一次。</div>
      <div class="narr">全世界都在跟你的控制中心搶位置。</div>
      <div class="narr" style="font-weight:800">先自己試一次。不帶任何策略卡。</div>`,
    rule: `媽媽會把六件事講一次，<b>然後就不再講了</b>。<br>
      憑記憶點出正確的事情。點錯會浪費時間。<br>
      有人打斷你的時候，要先處理掉才能繼續。<br>
      <b>做不完是正常的。這一關不會失敗。</b>`,
    btn: '七點二十分，開始 ⏰',
  }, () => boss_brief(1, []));
}

function boss_brief(round, equipped) {
  B = { round, equipped, left: AD_BOSS.seconds, doneTasks: [], wrongs: 0, interrupts: 0, frozen: false, usedPause: false, usedHelp: false, cur: 0 };
  const s = screen();
  s.appendChild(el('div', 'page-title', round === 1 ? '👩 媽媽講了一次' : '👩 同樣的早上，再一次'));
  const list = el('div', 'order-list');
  AD_BOSS.tasks.forEach((t, i) => {
    const it = el('div', 'order-item');
    it.innerHTML = `<span class="num">${i + 1}</span><span>${t.icon} ${t.text}</span>`;
    list.appendChild(it);
  });
  s.appendChild(list);
  let sec = 6;
  const t = el('div', 'hold-timer', `${sec} 秒後開始…`);
  s.appendChild(t);
  paint(s);
  every(() => {
    sec--;
    t.textContent = sec > 0 ? `${sec} 秒後開始…` : '開始！';
    if (sec <= 0) { clearTimers(); later(boss_play, 400); }
  }, 1000);
}

function boss_play() {
  const eq = B.equipped;
  const hasList = eq.includes('list');
  const hasTimer = eq.includes('timer');
  const hasQuiet = eq.includes('quiet');
  const hasStep = eq.includes('step');

  const s = screen();
  const top = el('div', 'boss-top');
  const tb = el('div', 'tb');
  if (hasTimer) {
    tb.innerHTML = `<div class="timer-ring" id="b-time">${B.left} 秒</div>
      <div class="timer-bar"><div class="timer-fill" id="b-fill"></div></div>`;
  } else {
    tb.innerHTML = `<div class="timer-ring" id="b-time" style="font-size:20px;color:var(--soft)">還有一點時間……吧？</div>`;
  }
  top.appendChild(tb);
  s.appendChild(top);

  const status = el('div', 'page-sub', '');
  s.appendChild(status);

  if (hasList) {
    const pin = el('div', 'know');
    pin.style.marginTop = '0';
    pin.innerHTML = `<div class="kt">📋 清單卡</div><div class="kb" id="b-checklist"></div>`;
    s.appendChild(pin);
  }
  if (hasStep) {
    const now = el('div', 'know');
    now.style.marginTop = '10px';
    now.innerHTML = `<div class="kt">👣 一步一步卡</div><div class="kb" id="b-now" style="font-size:20px;font-weight:900"></div>`;
    s.appendChild(now);
  }

  const grid = el('div', 'task-grid');
  grid.style.marginTop = '14px';
  const all = shuffle(AD_BOSS.tasks.map(t => ({ ...t, real: true })).concat(BOSS_DECOYS.map(d => ({ ...d, real: false }))));
  all.forEach(t => {
    const b = el('button', 'task', `<span style="font-size:24px">${t.icon}</span><span>${t.text}</span>`);
    b.dataset.text = t.text;
    b.addEventListener('click', () => boss_tap(t, b, status));
    grid.appendChild(b);
  });
  s.appendChild(grid);

  const row = btnRow();
  if (eq.includes('pause')) {
    const pb = button('🧠 暫停卡（凍結 8 秒）', 'cyan', () => {
      if (B.usedPause) return;
      B.usedPause = true; B.frozen = true; pb.disabled = true;
      status.innerHTML = '🌬️ 你停下來深呼吸。世界安靜了八秒。';
      later(() => { B.frozen = false; status.innerHTML = ''; }, 8000);
    });
    row.appendChild(pb);
  }
  if (eq.includes('help')) {
    const hb = button('❤️ 求救卡（請家人幫一件）', 'orange', () => {
      if (B.usedHelp) return;
      B.usedHelp = true; hb.disabled = true;
      const rest = AD_BOSS.tasks.filter(t => !B.doneTasks.includes(t.text));
      if (!rest.length) return;
      const t = rest[0];
      B.doneTasks.push(t.text);
      const btn = grid.querySelector(`[data-text="${t.text}"]`);
      if (btn) btn.classList.add('done');
      status.innerHTML = `❤️ 你說了「我需要幫忙」。爸爸幫你${t.text}了。`;
      boss_refresh();
    });
    row.appendChild(hb);
  }
  s.appendChild(row);
  paint(s);

  B.grid = grid; B.status = status;
  boss_refresh();

  every(() => {
    if (B.frozen) return;
    B.left--;
    const tEl = $('#b-time');
    if (hasTimer) {
      if (tEl) tEl.textContent = B.left + ' 秒';
      const f = $('#b-fill');
      if (f) { f.style.width = (B.left / AD_BOSS.seconds * 100) + '%'; if (B.left <= 20) f.classList.add('hot'); }
    } else if (tEl && B.left === Math.round(AD_BOSS.seconds * 0.4)) {
      tEl.textContent = '好像快來不及了……？';
    }
    if (B.left <= 0) boss_end();
  }, 1000);

  const gap = hasQuiet ? 11000 : 6000;
  const fire = () => {
    if (B.left <= 3) return;
    if (!B.frozen) boss_interrupt();
    later(fire, gap + Math.random() * 2500);
  };
  later(fire, gap);
}

function boss_refresh() {
  const done = B.doneTasks;
  const cl = $('#b-checklist');
  if (cl) cl.innerHTML = AD_BOSS.tasks.map(t =>
    `${done.includes(t.text) ? '✅ <s style="opacity:.5">' + t.icon + ' ' + t.text + '</s>' : '⬜ ' + t.icon + ' ' + t.text}`).join('<br>');
  const nw = $('#b-now');
  if (nw) {
    const next = AD_BOSS.tasks.find(t => !done.includes(t.text));
    nw.innerHTML = next ? `現在只要做：${next.icon} ${next.text}` : '全部做完了！';
  }
}

function boss_tap(t, b, status) {
  if (B.left <= 0) return;
  if (b.classList.contains('done')) return;
  if (t.real) {
    if (B.equipped.includes('step')) {
      const next = AD_BOSS.tasks.find(x => !B.doneTasks.includes(x.text));
      if (next && next.text !== t.text) {
        status.innerHTML = `👣 一步一步：現在先做「${next.text}」就好。`;
        return;
      }
    }
    B.doneTasks.push(t.text);
    b.classList.add('done');
    status.innerHTML = `✅ ${t.text}，完成。`;
    boss_refresh();
    if (B.doneTasks.length === AD_BOSS.tasks.length) later(boss_end, 500);
  } else {
    B.wrongs++;
    B.left = Math.max(1, B.left - 3);
    b.classList.add('hide');
    status.innerHTML = `😵 你「${t.text}」了三秒鐘。時間 -3 秒。`;
  }
}

function boss_interrupt() {
  B.interrupts++;
  const it = pick(AD_BOSS.interrupts);
  const ov = el('div', 'overlay');
  const p = el('div', 'pop');
  p.innerHTML = `<div class="pi">${it.icon}</div><div class="pt">${it.text}</div>`;
  const b = el('button', 'big-btn orange', it.btn);
  b.addEventListener('click', () => ov.remove());
  p.appendChild(b);
  ov.appendChild(p);
  document.body.appendChild(ov);
}

function boss_end() {
  clearTimers();
  document.querySelectorAll('.overlay').forEach(o => o.remove());
  const n = B.doneTasks.length;
  const total = AD_BOSS.tasks.length;
  const s = screen();
  s.appendChild(el('div', 'page-title', B.left <= 0 ? '🚪 時間到，要出門了' : '🎉 全部做完了！'));

  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr center" style="font-size:44px">${n === total ? '🎒✨' : '🎒💨'}</div>
    <div class="narr center" style="font-size:21px;font-weight:900">做完 ${n} / ${total} 件</div>
    <div class="narr center" style="color:var(--soft)">被打斷 ${B.interrupts} 次${B.wrongs ? `　·　繞路 ${B.wrongs} 次` : ''}</div>`;
  s.appendChild(c);

  const miss = AD_BOSS.tasks.filter(t => !B.doneTasks.includes(t.text));
  if (miss.length) {
    const k = el('div', 'know');
    k.innerHTML = `<div class="kt">還沒做的</div><div class="kb">${miss.map(t => t.icon + ' ' + t.text).join('　')}</div>`;
    s.appendChild(k);
  }

  const row = btnRow();
  if (B.round === 1) {
    row.appendChild(button('那……為什麼會這樣？ 🔍', '', boss_know1));
  } else {
    row.appendChild(button('比較一下兩次 📊', '', boss_compare));
  }
  s.appendChild(row);
  paint(s);
  if (n === total) confetti(26);
  const rec = { n, interrupts: B.interrupts, wrongs: B.wrongs };
  if (B.round === 1) window._bossR1 = rec; else window._bossR2 = rec;
}

function boss_know1() {
  knowScreen(6, {
    title: '🔍 今天早上失敗了嗎？',
    lead: `如果剛剛很手忙腳亂——<b>那是設計出來的</b>。<br>這一關本來就沒有人可以輕鬆做完。`,
    know: `今天做不完，不是因為：<br>
      ❌ 不努力<br>
      ❌ 不在乎<br>
      ❌ 故意找麻煩<br><br>
      而是因為——<b>控制中心一次收到太多訊息</b>。<br><br>
      六件事要記（背包）<br>
      ＋ 五個人在打斷（注意力）<br>
      ＋ 時間在倒數（時間感）<br>
      ＋ 電視和漫畫在旁邊（剎車）<br>
      ＋ 有人一直催（情緒）<br><br>
      <b>前面五關的搗蛋精靈，剛剛全部一起出現了。</b><br><br>
      任何人的控制中心都會塞車。<br>
      差別只在於——有沒有人幫忙把訊息變少。`,
    btn: '拿最後一張卡 🎴',
  }, () => cardScreen('help', boss_equip, '這是最難拿、也最重要的一張。', '選要帶的卡 🎒'));
}

function boss_equip() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🎴 這次帶策略卡再來一次'));
  s.appendChild(el('div', 'page-sub', '同樣的六件事、同樣的打擾、同樣的時間。<br>唯一的差別是——這次你不是空手。<br><b>最多帶 3 張。</b>'));

  const chosen = [];
  const grid = el('div', 'equip-grid');
  const owned = Object.keys(AD_CARDS).filter(id => State.has(id));
  const effect = {
    list: '六件事一直看得見，不用背',
    pause: '遊戲中可用一次，時間凍結 8 秒',
    timer: '看得見的倒數（否則你不知道還剩多久）',
    quiet: '打擾變少、間隔變長',
    step: '一次只亮一件事，做完才換下一件',
    help: '可用一次，家人幫你完成一件',
  };
  owned.forEach(id => {
    const c = AD_CARDS[id];
    const b = el('button', 'equip', `<span class="ei">${c.icon}</span><span><span class="en">${c.name}</span><br><span class="et">${effect[id]}</span></span>`);
    b.addEventListener('click', () => {
      const i = chosen.indexOf(id);
      if (i >= 0) { chosen.splice(i, 1); b.classList.remove('on'); }
      else {
        if (chosen.length >= 3) return;
        chosen.push(id); b.classList.add('on');
      }
      goBtn.disabled = chosen.length === 0;
      cnt.textContent = `已選 ${chosen.length} / 3`;
    });
    grid.appendChild(b);
  });
  s.appendChild(grid);
  const cnt = el('div', 'page-sub', '已選 0 / 3');
  cnt.style.marginTop = '12px';
  s.appendChild(cnt);

  const row = btnRow();
  const goBtn = button('帶著卡出發 🌅', 'cyan', () => boss_brief(2, chosen));
  goBtn.disabled = true;
  row.appendChild(goBtn);
  s.appendChild(row);
  paint(s);
}

function boss_compare() {
  const r1 = window._bossR1 || { n: 0, interrupts: 0 };
  const r2 = window._bossR2 || { n: 0, interrupts: 0 };
  const s = screen();
  s.appendChild(el('div', 'page-title', '📊 兩次早上'));
  const cmp = el('div', 'compare');
  const a = el('div', 'cmp-box');
  a.innerHTML = `<div class="cl">第一次（空手）</div><div class="cv">${r1.n} 件</div>`;
  const b = el('div', 'cmp-box real');
  b.innerHTML = `<div class="cl">第二次（帶卡）</div><div class="cv">${r2.n} 件</div>`;
  cmp.appendChild(a); cmp.appendChild(b);
  s.appendChild(cmp);

  const c = el('div', 'card');
  c.style.marginTop = '16px';
  let msg;
  if (r2.n > r1.n) {
    msg = `多做完了 <b>${r2.n - r1.n}</b> 件。<br><br>
      注意一件事：<b>你沒有變得更努力</b>。<br>
      你的大腦跟第一次一模一樣，你也沒有比較乖。<br><br>
      改變的只有一件事——<b>環境變了</b>。<br>
      訊息變少了、時間看得見了、有人幫忙了。<br><br>
      這就是整個遊戲想說的事。`;
  } else if (r2.n === r1.n) {
    msg = `兩次一樣多。<br><br>
      這也很常見——策略卡不是魔法，<b>要練習才會順手</b>。<br>
      而且有時候，你第一次就已經拚到極限了。<br><br>
      可以再試一次，換不同的卡看看。`;
  } else {
    msg = `第二次反而少一點。<br><br>
      這完全可能發生：換新方法的時候，一開始常常會<b>更卡</b>。<br>
      工具要用熟才會變快。<br><br>
      重點不是這次的數字，是你知道了——<b>環境可以被改變</b>。`;
  }
  c.innerHTML = `<div class="narr">${msg}</div>`;
  s.appendChild(c);

  const row = btnRow();
  row.appendChild(button('最後一件事 💙', '', ending_start));
  if (r2.n <= r1.n) row.appendChild(button('換張卡再試一次', 'ghost', boss_equip));
  s.appendChild(row);
  paint(s);
}

/* ═══════════════════════════════════════════════
   結局：我的大腦說明書
   ═══════════════════════════════════════════════ */
let END = null;

function ending_start() {
  finishLevel(6);
  END = { fears: [], likes: [], name: '', plan: '' };
  const s = screen();
  s.appendChild(el('div', 'page-title', '💙 最後一件事'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr">這個遊戲到這裡，<b>沒有分數</b>。</div>
    <div class="narr">沒有人要知道你比較乖還是比較不乖。</div>
    <div class="narr">只剩下一句話要你自己填完：</div>
    <div class="narr center" style="font-size:22px;font-weight:900;margin-top:16px">
      「原來我的大腦最怕的是＿＿＿＿。」</div>`;
  s.appendChild(c);
  const row = btnRow();
  row.appendChild(button('我來填 ✏️', '', ending_fears));
  s.appendChild(row);
  paint(s);
}

function ending_fears() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '😰 我的大腦最怕的是……'));
  s.appendChild(el('div', 'page-sub', '選 1～3 個。沒有對錯，只有你自己知道。'));
  const wrap = el('div', 'chips');
  AD_FEARS.forEach(f => {
    const b = el('button', 'chip', f);
    b.addEventListener('click', () => {
      const i = END.fears.indexOf(f);
      if (i >= 0) { END.fears.splice(i, 1); b.classList.remove('on'); }
      else { if (END.fears.length >= 3) return; END.fears.push(f); b.classList.add('on'); }
      go.disabled = END.fears.length === 0 && !own.value.trim();
    });
    wrap.appendChild(b);
  });
  s.appendChild(wrap);
  const own = el('input', 'name-input');
  own.type = 'text';
  own.placeholder = '也可以自己寫一個（選填）';
  own.addEventListener('input', () => { go.disabled = END.fears.length === 0 && !own.value.trim(); });
  s.appendChild(own);
  const row = btnRow();
  const go = button('下一題 ➡️', '', () => {
    const v = own.value.trim();
    if (v && !END.fears.includes(v)) END.fears.push(v);
    ending_likes();
  });
  go.disabled = true;
  row.appendChild(go);
  s.appendChild(row);
  paint(s);
}

function ending_likes() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '😊 我的大腦最喜歡的是……'));
  s.appendChild(el('div', 'page-sub', '什麼樣的情況，會讓你的大腦比較輕鬆？選 1～3 個。'));
  const wrap = el('div', 'chips');
  AD_LIKES.forEach(f => {
    const b = el('button', 'chip', f);
    b.addEventListener('click', () => {
      const i = END.likes.indexOf(f);
      if (i >= 0) { END.likes.splice(i, 1); b.classList.remove('on'); }
      else { if (END.likes.length >= 3) return; END.likes.push(f); b.classList.add('on'); }
      go.disabled = END.likes.length === 0 && !own.value.trim();
    });
    wrap.appendChild(b);
  });
  s.appendChild(wrap);
  const own = el('input', 'name-input');
  own.type = 'text';
  own.placeholder = '也可以自己寫一個（選填）';
  own.addEventListener('input', () => { go.disabled = END.likes.length === 0 && !own.value.trim(); });
  s.appendChild(own);
  const row = btnRow();
  const go = button('下一題 ➡️', '', () => {
    const v = own.value.trim();
    if (v && !END.likes.includes(v)) END.likes.push(v);
    ending_plan();
  });
  go.disabled = true;
  row.appendChild(go);
  s.appendChild(row);
  paint(s);
}

function ending_plan() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🤝 換大人回答'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr">現在把手機或電腦轉過去，換旁邊的大人講一句話。</div>
    <div class="speak" style="font-size:19px">「那我們一起想一個方法，<br>下次讓你的大腦更輕鬆一點。」</div>
    <div class="narr">想到什麼方法，就寫在下面。<br>不用很厲害，一件小事就好。</div>`;
  s.appendChild(c);
  const nm = el('input', 'name-input');
  nm.type = 'text';
  nm.placeholder = '這本說明書是誰的？（名字，選填）';
  s.appendChild(nm);
  const ta = el('textarea', 'name-input');
  ta.placeholder = '我們的方法是……（例如：早上把六件事貼在門上，一次講一件）';
  s.appendChild(ta);
  const row = btnRow();
  row.appendChild(button('做成說明書 📖', '', () => {
    END.name = nm.value.trim();
    END.plan = ta.value.trim();
    const d = new Date();
    const at = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    State.manual = { ...END, at, cards: State.cards.slice() };
    State.save();
    showManual(State.manual, true);
  }));
  s.appendChild(row);
  paint(s);
}

function showManual(m, celebrate) {
  const s = screen();
  s.appendChild(el('div', 'page-title', '📖 我的大腦說明書'));
  s.appendChild(el('div', 'page-sub', '這不是診斷書，也不是成績單。<br>這是一份「怎麼跟我合作」的說明。'));

  const box = el('div', 'manual');
  box.innerHTML = `
    <h3>${m.name ? m.name + ' 的大腦' : '我的大腦'}</h3>
    <div class="who">大腦探險家證書 · ${m.at}</div>
    <div class="sec">
      <div class="sl">😰 我的大腦最怕</div>
      <div class="tags">${m.fears.map(f => `<span class="tag">${f}</span>`).join('')}</div>
    </div>
    <div class="sec">
      <div class="sl">😊 我的大腦最喜歡</div>
      <div class="tags">${m.likes.map(f => `<span class="tag want">${f}</span>`).join('')}</div>
    </div>
    <div class="sec">
      <div class="sl">🎴 我會用的策略</div>
      <div class="tags">${(m.cards || []).map(id => `<span class="tag card">${AD_CARDS[id].icon} ${AD_CARDS[id].name}</span>`).join('')}</div>
    </div>
    ${m.plan ? `<div class="sec"><div class="sl">🤝 我們一起想的方法</div>
      <div style="background:#fff;border:2px solid var(--line);border-radius:14px;padding:14px;font-size:16px;line-height:1.8">${m.plan.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div></div>` : ''}
  `;
  s.appendChild(box);

  const p = el('div', 'parent-note');
  p.innerHTML = `
    <div class="pn">💙 給看到這裡的大人</div>
    這個遊戲從頭到尾沒有給孩子打過分數，是故意的。<br><br>
    孩子在裡面「失敗」了很多次——忘記水壺、情緒爆炸、伸手拿糖果、時間估錯、東西記不住、早上做不完。
    這些失敗<b>全部都是設計好的</b>，因為那正是他每天真實的經驗。<br><br>
    差別只在於：在遊戲裡，每一次失敗後面都接著一句<b>「原來如此」</b>，而不是<b>「你怎麼又這樣」</b>。<br><br>
    如果今天只帶走一件事，希望是這一句：<br>
    <b>他不是不想做到，是他的控制中心一次收到太多訊息。</b><br><br>
    那份「我們一起想的方法」，比這整個遊戲都重要。
  `;
  s.appendChild(p);

  const row = btnRow();
  row.appendChild(button('回控制中心 🧠', '', renderMap));
  row.appendChild(button('重寫說明書 ✏️', 'ghost', ending_start));
  s.appendChild(row);
  paint(s);
  if (celebrate) confetti(50);
}

/* ═══════════════ 策略卡收藏 ═══════════════ */
function renderCards() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '🎴 我的策略卡'));
  s.appendChild(el('div', 'page-sub', `已收集 ${State.cards.length} / ${Object.keys(AD_CARDS).length} 張`));
  const grid = el('div', 'cards-grid');
  Object.keys(AD_CARDS).forEach(id => {
    const c = AD_CARDS[id];
    const has = State.has(id);
    const r = el('div', 'cardrow' + (has ? '' : ' locked'));
    r.innerHTML = has ? `
      <div class="ci">${c.icon}</div>
      <div>
        <div class="cn">${c.name}</div>
        <div class="ct">${c.tag}</div>
        <div class="ch">${c.how}</div>
        <div class="cw">💡 ${c.why}</div>
      </div>` : `
      <div class="ci">🔒</div>
      <div><div class="cn">？？？</div><div class="ch">還沒拿到這張卡。</div></div>`;
    grid.appendChild(r);
  });
  s.appendChild(grid);
  const row = btnRow();
  row.appendChild(button('回控制中心 🧠', '', renderMap));
  s.appendChild(row);
  paint(s);
}

/* ═══════════════ 給大人看的說明 ═══════════════ */
function renderForAdults() {
  const s = screen();
  s.appendChild(el('div', 'page-title', '👨‍👩‍👧 給大人看的說明'));
  const c = el('div', 'card');
  c.innerHTML = `
    <div class="narr"><b>這個遊戲在做什麼？</b><br>
    它不是在訓練孩子「聽話」或「更專心」。它想培養的是<b>後設認知</b>——讓孩子看得懂自己的注意力、情緒和執行功能是怎麼運作的，並且能講出來。</div>
    <div class="narr"><b>為什麼一直讓孩子失敗？</b><br>
    每一關都設計成「幾乎一定做不完」，因為那正是孩子每天的真實經驗。差別在於：在這裡，失敗後面接的是解釋，不是責備。</div>
    <div class="narr"><b>為什麼沒有分數？</b><br>
    一有分數，孩子就會開始表演「乖」，而不是誠實地觀察自己。所以全程不評分、不排名、不比較。</div>
    <div class="narr"><b>ADHD 的困難來自哪裡？</b><br>
    多半是執行功能、自我調節與工作記憶的挑戰，不是故意唱反調，也不是缺乏意願。這六關分別對應：注意力轉移、情緒調節、抑制控制、時間知覺、工作記憶，以及六者同時失守的日常情境。</div>
    <div class="narr" style="color:var(--soft);font-size:15px">本遊戲是教育與親子溝通用的體驗設計，<b>不是診斷工具</b>，也不能取代專業評估。如果孩子的困難已經影響到生活或學習，請找兒童心智科、臨床心理師或學校輔導老師談談。</div>`;
  s.appendChild(c);

  const w = el('div', 'talk');
  w.innerHTML = `<div class="tt">如果要帶成課程或親子工作坊</div>
    <ul>
      <li>建議名稱：<b>「ADHD 大腦冒險：五大控制中心」</b></li>
      <li>形式：桌遊 ＋ 角色扮演 ＋ 情境卡 ＋ 合作任務</li>
      <li>時間：60～90 分鐘可完成一次完整體驗</li>
      <li>對象：國小中高年級學生與家長；輔導老師、導師皆可帶領</li>
      <li>帶領重點：每關結束一定要留時間做「一起聊聊」，那才是真正的教學段落</li>
      <li>禁忌：不要在活動中比較誰做得比較好，也不要用結果評價孩子</li>
    </ul>`;
  s.appendChild(w);

  const row = btnRow();
  row.appendChild(button('回去', '', () => (State.seenIntro ? renderMap() : renderIntro())));
  s.appendChild(row);
  paint(s);
}

/* ═══════════════ 啟動 ═══════════════ */
State.load();
updateHud();
if (State.seenIntro) renderMap(); else renderIntro();
