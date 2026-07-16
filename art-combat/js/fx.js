/* ═══════════════════════════════════════════════
   Canvas Combat — 視覺特效(粒子背景 / 戰鬥特效)
   ═══════════════════════════════════════════════ */

/* ── 全域漂浮粒子背景 ── */
const BgFX = (() => {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, parts = [], streaks = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function spawn() {
    const gold = Math.random() < 0.6;
    return {
      x: Math.random() * W, y: H + 20 + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.15 + Math.random() * 0.5),
      r: 0.6 + Math.random() * 2.2,
      a: 0.1 + Math.random() * 0.5,
      hue: gold ? 45 : 15,
      sat: gold ? 80 : 60,
      flicker: Math.random() * Math.PI * 2,
    };
  }
  for (let i = 0; i < 70; i++) { const p = spawn(); p.y = Math.random() * H; parts.push(p); }

  /* 偶發光線掃描 */
  function spawnStreak() {
    streaks.push({ x: Math.random() * W, y: -50, len: 120 + Math.random() * 200, a: 0.5, v: 6 + Math.random() * 6 });
  }

  let t = 0;
  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx + Math.sin(t + p.flicker) * 0.15;
      p.y += p.vy;
      if (p.y < -20) Object.assign(p, spawn());
      const tw = 0.6 + 0.4 * Math.sin(t * 3 + p.flicker);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},${p.sat}%,65%,${p.a * tw})`;
      ctx.shadowColor = `hsla(${p.hue},90%,60%,0.8)`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (Math.random() < 0.004) spawnStreak();
    streaks = streaks.filter(s => s.a > 0.01);
    for (const s of streaks) {
      s.y += s.v; s.a *= 0.97;
      const grad = ctx.createLinearGradient(s.x, s.y - s.len, s.x + s.len * 0.4, s.y);
      grad.addColorStop(0, 'rgba(230,200,120,0)');
      grad.addColorStop(1, `rgba(230,200,120,${s.a})`);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - s.len); ctx.lineTo(s.x + s.len * 0.4, s.y);
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  frame();
  return {};
})();

/* ── 戰鬥特效工具 ── */
const BattleFX = {
  stage() { return document.getElementById('battle-stage'); },
  layer() { return document.getElementById('fx-layer'); },

  shake(intensity = 1) {
    const st = this.stage();
    st.style.setProperty('--shake', `${6 * intensity}px`);
    st.classList.remove('shaking');
    void st.offsetWidth;
    st.classList.add('shaking');
    setTimeout(() => st.classList.remove('shaking'), 500);
  },

  flash(color = 'rgba(255,255,255,0.55)', dur = 260) {
    const el = document.createElement('div');
    el.className = 'fx-flash';
    el.style.background = color;
    el.style.animationDuration = dur + 'ms';
    this.layer().appendChild(el);
    setTimeout(() => el.remove(), dur + 60);
  },

  slash(side, heavy = false) {
    const el = document.createElement('div');
    el.className = 'fx-slash' + (heavy ? ' heavy' : '') + (side === 'right' ? ' from-right' : '');
    this.layer().appendChild(el);
    setTimeout(() => el.remove(), 600);
  },

  burst(x, y, hue = 45, count = 18, big = false) {
    const layer = this.layer();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-spark';
      const ang = Math.random() * Math.PI * 2;
      const dist = (big ? 90 : 55) + Math.random() * (big ? 140 : 70);
      p.style.left = x + '%'; p.style.top = y + '%';
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      p.style.background = `hsl(${hue + Math.random() * 30 - 15},90%,${60 + Math.random() * 25}%)`;
      p.style.width = p.style.height = (big ? 5 : 3) + Math.random() * 5 + 'px';
      layer.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  },

  damageNumber(x, y, text, kind = 'normal') {
    const el = document.createElement('div');
    el.className = `fx-dmg ${kind}`;
    el.textContent = text;
    el.style.left = x + '%'; el.style.top = y + '%';
    this.layer().appendChild(el);
    setTimeout(() => el.remove(), 1300);
  },

  hitStop(targetEl) {
    targetEl.classList.remove('hit-react');
    void targetEl.offsetWidth;
    targetEl.classList.add('hit-react');
    setTimeout(() => targetEl.classList.remove('hit-react'), 500);
  },

  dash(attackerEl, dir = 1) {
    attackerEl.classList.remove('dash-left', 'dash-right');
    void attackerEl.offsetWidth;
    attackerEl.classList.add(dir > 0 ? 'dash-right' : 'dash-left');
    setTimeout(() => attackerEl.classList.remove('dash-left', 'dash-right'), 700);
  },

  slowMo(on) {
    this.stage().classList.toggle('slowmo', on);
  },

  /* 全螢幕必殺演出 */
  ultraCinematic(char, skillName, cb) {
    const ov = document.getElementById('ultra-overlay');
    const figure = char.img
      ? `<img class="ultra-portrait" src="${char.img}" alt="${char.name}" style="--h:${char.hue}">`
      : `<div class="ultra-seal" style="--h:${char.hue};--h2:${char.hue2}">${char.mono}</div>`;
    ov.innerHTML = `
      <div class="ultra-bars top"></div><div class="ultra-bars bottom"></div>
      <div class="ultra-beams"></div>
      ${figure}
      <div class="ultra-name">
        <div class="ultra-charname">${char.name}</div>
        <div class="ultra-skill">${skillName}</div>
      </div>`;
    ov.classList.add('show');
    AudioEngine.play('ultra');
    setTimeout(() => this.flash('rgba(255,240,200,0.9)', 400), 1400);
    setTimeout(() => this.shake(2.2), 1450);
    setTimeout(() => { ov.classList.remove('show'); ov.innerHTML = ''; cb && cb(); }, 2100);
  },

  /* 勝利煙火 */
  fireworks(container, rounds = 5) {
    for (let r = 0; r < rounds; r++) {
      setTimeout(() => {
        this.burst(20 + Math.random() * 60, 15 + Math.random() * 40, Math.random() * 360, 26, true);
      }, r * 350);
    }
  },
};
