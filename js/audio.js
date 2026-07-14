/* ═══════════════════════════════════════════════
   墨魂對決 — Web Audio 音效引擎(零素材合成音)
   ═══════════════════════════════════════════════ */

const AudioEngine = (() => {
  let ctx = null;
  let master, sfxGain, bgmGain;
  let bgmOn = JSON.parse(localStorage.getItem('mh_bgm') ?? 'true');
  let sfxOn = JSON.parse(localStorage.getItem('mh_sfx') ?? 'true');
  let bgmTimer = null;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = sfxOn ? 0.9 : 0; sfxGain.connect(master);
    bgmGain = ctx.createGain(); bgmGain.gain.value = bgmOn ? 0.32 : 0; bgmGain.connect(master);
    if (bgmOn) startBGM();
  }

  /* 基礎振盪器音符 */
  function tone({ freq = 440, dur = 0.2, type = 'sine', vol = 0.5, dest = null, attack = 0.005, decay = null, slideTo = null, delay = 0 }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (decay ?? dur));
    osc.connect(g); g.connect(dest || sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  /* 噪音爆裂(打擊/爆炸) */
  function noise({ dur = 0.25, vol = 0.5, freq = 1200, q = 1, delay = 0, type = 'bandpass' }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.value = freq; filt.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(sfxGain);
    src.start(t0);
  }

  /* 古箏式撥弦(用於 BGM 與 UI) */
  function pluck(freq, delay = 0, vol = 0.5, dest = null) {
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator(); osc.type = 'triangle';
    const osc2 = ctx.createOscillator(); osc2.type = 'sine';
    osc.frequency.value = freq; osc2.frequency.value = freq * 2.01;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    osc.connect(g); osc2.connect(g2); g2.connect(g);
    g.connect(dest || bgmGain);
    osc.start(t0); osc.stop(t0 + 1.6); osc2.start(t0); osc2.stop(t0 + 1.6);
  }

  /* ── SFX 定義 ── */
  const SFX = {
    hover:   () => tone({ freq: 880, dur: 0.06, type: 'sine', vol: 0.12 }),
    click:   () => { tone({ freq: 660, dur: 0.08, type: 'triangle', vol: 0.3 }); tone({ freq: 990, dur: 0.1, vol: 0.15, delay: 0.03 }); },
    confirm: () => { pluck(523.25, 0, 0.5, sfxGain); pluck(783.99, 0.08, 0.5, sfxGain); },
    cancel:  () => tone({ freq: 330, dur: 0.15, type: 'triangle', vol: 0.25, slideTo: 220 }),
    select:  () => { pluck(659.25, 0, 0.55, sfxGain); pluck(880, 0.1, 0.45, sfxGain); noise({ dur: 0.3, vol: 0.08, freq: 3000 }); },
    correct: () => { tone({ freq: 587.33, dur: 0.12, type: 'triangle', vol: 0.4 }); tone({ freq: 880, dur: 0.25, type: 'triangle', vol: 0.4, delay: 0.1 }); },
    wrong:   () => { tone({ freq: 220, dur: 0.3, type: 'sawtooth', vol: 0.25, slideTo: 110 }); noise({ dur: 0.2, vol: 0.12, freq: 400 }); },
    attackL: () => { noise({ dur: 0.15, vol: 0.3, freq: 2500, q: 2 }); tone({ freq: 700, dur: 0.12, type: 'square', vol: 0.12, slideTo: 1400 }); },
    attackH: () => { noise({ dur: 0.3, vol: 0.5, freq: 1500, q: 1.5 }); tone({ freq: 200, dur: 0.25, type: 'sawtooth', vol: 0.3, slideTo: 60 }); },
    hit:     () => { noise({ dur: 0.2, vol: 0.55, freq: 800 }); tone({ freq: 150, dur: 0.18, type: 'square', vol: 0.3, slideTo: 50 }); },
    crit:    () => { noise({ dur: 0.4, vol: 0.7, freq: 600 }); tone({ freq: 100, dur: 0.4, type: 'sawtooth', vol: 0.45, slideTo: 40 }); tone({ freq: 1760, dur: 0.3, type: 'sine', vol: 0.25, delay: 0.05 }); },
    miss:    () => { noise({ dur: 0.25, vol: 0.15, freq: 4000, q: 3 }); tone({ freq: 500, dur: 0.2, vol: 0.12, slideTo: 200 }); },
    ultra:   () => {
      tone({ freq: 65, dur: 1.2, type: 'sawtooth', vol: 0.4, slideTo: 30 });
      noise({ dur: 1.0, vol: 0.5, freq: 300, q: 0.7 });
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => pluck(f, 0.15 + i * 0.12, 0.6, sfxGain));
      noise({ dur: 0.6, vol: 0.6, freq: 1200, delay: 0.7 });
    },
    energy:  () => tone({ freq: 1174.66, dur: 0.3, type: 'sine', vol: 0.2, slideTo: 1760 }),
    tick:    () => tone({ freq: 1200, dur: 0.04, type: 'square', vol: 0.08 }),
    ko:      () => { noise({ dur: 1.2, vol: 0.8, freq: 500, q: 0.5 }); tone({ freq: 80, dur: 1.0, type: 'sawtooth', vol: 0.5, slideTo: 25 }); },
    victory: () => {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => pluck(f, i * 0.15, 0.6, sfxGain));
      tone({ freq: 261.63, dur: 1.6, type: 'triangle', vol: 0.2, delay: 0.6 });
    },
    defeat:  () => {
      [440, 415.3, 349.23, 293.66].forEach((f, i) => tone({ freq: f, dur: 0.5, type: 'triangle', vol: 0.3, delay: i * 0.3 }));
    },
    turn:    () => { noise({ dur: 0.5, vol: 0.15, freq: 2000, q: 3 }); pluck(440, 0.05, 0.4, sfxGain); },
  };

  function play(name) { if (ctx && sfxOn && SFX[name]) SFX[name](); }

  /* ── BGM:五聲音階即興撥弦 ── */
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 784.0]; // C 宮調五聲
  let bgmStep = 0;
  function bgmLoop() {
    if (!bgmOn || !ctx) return;
    const beat = 0.42;
    // 每小節 8 拍,主旋律 + 偶爾低音
    for (let i = 0; i < 8; i++) {
      if (Math.random() < 0.62) {
        const n = SCALE[Math.floor(Math.pow(Math.random(), 1.4) * SCALE.length)];
        pluck(n, i * beat, 0.35 + Math.random() * 0.2);
      }
      if (i % 4 === 0 && Math.random() < 0.8) pluck(SCALE[0] / 2, i * beat, 0.3);
    }
    bgmStep++;
    bgmTimer = setTimeout(bgmLoop, beat * 8 * 1000);
  }
  function startBGM() { stopBGMTimer(); bgmLoop(); }
  function stopBGMTimer() { if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; } }

  function toggleBGM() {
    bgmOn = !bgmOn;
    localStorage.setItem('mh_bgm', JSON.stringify(bgmOn));
    if (ctx) {
      bgmGain.gain.linearRampToValueAtTime(bgmOn ? 0.32 : 0, ctx.currentTime + 0.4);
      if (bgmOn) startBGM(); else stopBGMTimer();
    }
    return bgmOn;
  }
  function toggleSFX() {
    sfxOn = !sfxOn;
    localStorage.setItem('mh_sfx', JSON.stringify(sfxOn));
    if (ctx) sfxGain.gain.value = sfxOn ? 0.9 : 0;
    return sfxOn;
  }

  return { init, play, toggleBGM, toggleSFX, get bgmOn() { return bgmOn; }, get sfxOn() { return sfxOn; } };
})();
