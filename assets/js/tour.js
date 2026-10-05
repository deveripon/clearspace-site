// Clearspace product tour: a 37-second motion piece.
// Every frame is a pure function of the clock (render(t)), so the tour can
// pause, jump to a chapter, respect reduced motion, and be exported to video
// frame by frame (window.__clearspaceTour.seek(t)).
(() => {
  const player = document.querySelector('[data-player]');
  if (!player) return;
  const $ = (s, el = player) => el.querySelector(s);
  const $$ = (s, el = player) => Array.from(el.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- math helpers
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const back = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const prog = (t, a, b, ease = easeOut) => ease(clamp((t - a) / (b - a)));
  const gb = (v) => `${v.toFixed(1)} GB`;
  const set = (el, o) => {
    if (!el) return;
    if (o.o !== undefined) el.style.opacity = o.o;
    const tf = [];
    if (o.x || o.y) tf.push(`translate(${o.x || 0}px, ${o.y || 0}px)`);
    if (o.s !== undefined) tf.push(`scale(${o.s})`);
    el.style.transform = tf.join(' ');
  };
  /** Fade + rise in at time a. */
  const rise = (el, t, a, dur = 0.55, dy = 18) => { const k = prog(t, a, a + dur); set(el, { o: k, y: (1 - k) * dy }); };

  // ---------- scenes
  const sceneEls = $$('[data-scene]');
  const SCENES = [
    {
      label: 'Disk full', dur: 6.2,
      caption: 'Build caches, node_modules and leftover agent worktrees quietly fill a developer’s Mac.',
      render(t, el) {
        rise($('[data-a]', el), t, 0.1);
        rise($('[data-b]', el), t, 0.35, 0.6, 24);
        const k = prog(t, 0.9, 4.4, easeInOut);
        const usedPct = lerp(55, 95.6, k);
        const used = $('[data-used]', el);
        used.style.width = `${usedPct}%`;
        used.style.background = usedPct > 88 ? '#d48a1c' : '';
        $('[data-free]', el).textContent = gb(lerp(222.3, 21.7, k));
        $$('[data-chip]', el).forEach((c, i) => {
          const q = clamp((t - (1.0 + i * 0.6)) / 1.25);
          const o = q <= 0 ? 0 : q < 0.15 ? q / 0.15 : q > 0.78 ? (1 - q) / 0.22 : 1;
          set(c, { o, y: lerp(0, 200, easeInOut(q)), s: lerp(1, 0.7, clamp((q - 0.5) / 0.5)) });
        });
        rise($('[data-warn]', el), t, 4.5, 0.5, 8);
      },
    },
    {
      label: 'Scan', dur: 6.4,
      caption: 'One scan finds where the space went, across your projects, package managers and apps.',
      render(t, el) {
        rise($('[data-a]', el), t, 0.1);
        rise($('[data-b]', el), t, 0.3, 0.6, 24);
        let found = 0;
        $$('[data-row]', el).forEach((r, i) => {
          const a = 0.8 + i * 0.5;
          rise(r, t, a, 0.4, 10);
          const v = Number(r.dataset.v) * prog(t, a + 0.1, a + 1.0, easeInOut);
          found += v;
          $('em', r).textContent = gb(v);
          $('i > b', r).style.width = `${(v / 28.9) * 100}%`;
        });
        $('[data-found]', el).textContent = gb(found);
        const scan = $('[data-scan]', el);
        const s = clamp((t - 0.7) / 3.2);
        set(scan, { o: s > 0 && s < 1 ? 1 : 0, y: lerp(0, 300, s) });
        rise($('[data-c]', el), t, 4.3, 0.5, 10);
      },
    },
    {
      label: 'Explain', dur: 6.2,
      caption: 'Every item says what it is, what happens after cleaning, and whether you lose anything.',
      render(t, el) {
        rise($('[data-a]', el), t, 0.1);
        rise($('[data-b]', el), t, 0.3, 0.6, 24);
        $$('[data-line]', el).forEach((line, i) => {
          const a = 1.0 + i * 1.1;
          rise($('dt', line), t, a, 0.35, 6);
          const k = prog(t, a + 0.15, a + 1.0, (x) => x);
          $('[data-type]', line).style.clipPath = `inset(0 ${100 - k * 100}% 0 0)`;
        });
        const pulse = clamp((t - 4.6) / 0.6);
        set($('[data-c]', el), { s: 1 + Math.sin(pulse * Math.PI) * 0.12 });
      },
    },
    {
      label: 'Protect', dur: 6.6,
      caption: 'Anything that could hold your work is marked Check first or locked, and checked again before cleaning.',
      render(t, el) {
        rise($('[data-a]', el), t, 0.1);
        rise($('[data-b]', el), t, 0.3, 0.6, 24);
        $$('[data-wt]', el).forEach((row, i) => {
          const a = 0.9 + i * 0.55;
          const k = clamp((t - a) / 0.45);
          set($('[data-badge]', row), { o: k > 0 ? 1 : 0, s: k > 0 ? lerp(0.5, 1, back(k)) : 0.5 });
          if (row.hasAttribute('data-locked')) row.style.opacity = lerp(1, 0.55, prog(t, a + 0.2, a + 0.7));
        });
        rise($('[data-c]', el), t, 1.4, 0.6, 24);
        $$('[data-tick]', el).forEach((li, i) => li.classList.toggle('on', t > 2.4 + i * 0.6));
      },
    },
    {
      label: 'Clean', dur: 7.4,
      caption: 'You review the list, then clean. Free space is measured on your disk before and after.',
      render(t, el) {
        rise($('[data-a]', el), t, 0.1);
        const sheet = $('[data-b]', el);
        const inK = prog(t, 0.3, 0.9);
        const outK = prog(t, 3.1, 3.5);
        set(sheet, { o: inK * (1 - outK), y: (1 - inK) * 24, s: 1 - outK * 0.03 });
        // cursor glides to the Clean button and clicks
        const cur = $('[data-cursor]', el);
        const m = prog(t, 1.2, 2.4, easeInOut);
        const click = t > 2.55 && t < 2.75;
        set(cur, { o: prog(t, 1.0, 1.3) * (1 - prog(t, 3.1, 3.4)), x: lerp(1120, 868, m), y: lerp(650, 554, m), s: click ? 0.88 : 1 });
        const btn = $('[data-cleanbtn]', el);
        btn.style.transform = click ? 'scale(0.96)' : '';
        const rp = clamp((t - 2.6) / 0.6);
        set($('[data-ripple]', el), { o: rp > 0 && rp < 1 ? 1 - rp : 0, s: rp });
        // result
        const res = $('[data-c]', el);
        const rk = prog(t, 3.4, 4.0);
        set(res, { o: rk, y: (1 - rk) * 24 });
        const c = prog(t, 3.8, 5.6, easeInOut);
        $('[data-freed]', el).textContent = gb(23.3 * c);
        $('[data-free2]', el).textContent = gb(21.7 + 23.3 * c);
        const used = $('[data-used2]', el);
        used.style.width = `${lerp(95.6, 90.9, c)}%`;
        const ok = clamp((t - 5.6) / 0.4);
        set($('[data-ok]', el), { o: ok > 0 ? 1 : 0, s: ok > 0 ? lerp(0.4, 1, back(ok)) : 0.4 });
      },
    },
    {
      label: 'Install', dur: 4.2, last: true,
      caption: 'Clearspace is free and open source. Install it with one command.',
      render(t, el) {
        const ik = prog(t, 0.15, 0.75);
        set($('[data-a]', el), { o: ik, s: lerp(0.9, 1, back(clamp((t - 0.15) / 0.6))) });
        rise($('[data-c]', el), t, 0.6);
        rise($('[data-d]', el), t, 1.2);
        rise($('[data-e]', el), t, 1.5);
      },
    },
  ];
  let acc = 0;
  SCENES.forEach((s, i) => { s.start = acc; acc += s.dur; s.el = sceneEls[i]; });
  const DURATION = acc;
  const FADE = 0.4;

  // ---------- chapters UI
  const chapters = $('[data-chapters]');
  SCENES.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<i><b></b></i><span>${s.label}</span>`;
    b.setAttribute('aria-label', `Chapter ${i + 1}: ${s.label}`);
    b.addEventListener('click', () => {
      userPaused = false;
      seek(reduced ? s.start + s.dur - FADE - 0.05 : s.start + 0.001);
      if (!reduced) play(); else render();
    });
    chapters.appendChild(b);
  });
  const chapterBtns = $$('button', chapters);
  const fills = chapterBtns.map((b) => $('i > b', b));
  const timeEl = $('[data-time]');
  const captionEl = $('[data-caption]');
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ---------- render
  let t = 0;
  let lastScene = -1;
  function render() {
    let cur = SCENES.length - 1;
    SCENES.forEach((s, i) => {
      const lt = t - s.start;
      const inside = lt >= 0 && (lt < s.dur || (s.last && t >= DURATION - 1e-6));
      if (inside && i < cur) cur = i;
      if (!inside) { s.el.style.visibility = 'hidden'; s.el.style.opacity = 0; return; }
      const fin = i === 0 ? 1 : clamp(lt / FADE);
      const fout = s.last ? 1 : clamp((s.dur - lt) / FADE);
      s.el.style.visibility = 'visible';
      s.el.style.opacity = Math.min(fin, fout);
      s.render(lt, s.el);
    });
    fills.forEach((f, i) => { f.style.width = `${clamp((t - SCENES[i].start) / SCENES[i].dur) * 100}%`; });
    if (cur !== lastScene) {
      chapterBtns.forEach((b, i) => b.classList.toggle('cur', i === cur));
      captionEl.textContent = SCENES[cur].caption;
      lastScene = cur;
    }
    timeEl.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
  }
  function seek(v) { t = clamp(v, 0, DURATION); player.classList.toggle('ended', t >= DURATION); render(); }

  // ---------- playback
  let playing = false;
  let userPaused = false;
  let raf = 0;
  let last = 0;
  const playBtn = $('[data-play]');
  function frame(now) {
    if (!playing) return;
    t += Math.min(0.1, (now - last) / 1000);
    last = now;
    if (t >= DURATION) { t = DURATION; render(); stop(); player.classList.add('ended'); return; }
    render();
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (playing) return;
    if (t >= DURATION) t = 0;
    playing = true;
    player.classList.add('playing');
    player.classList.remove('ended');
    playBtn.setAttribute('aria-label', 'Pause');
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    playing = false;
    cancelAnimationFrame(raf);
    player.classList.remove('playing');
    playBtn.setAttribute('aria-label', t >= DURATION ? 'Replay' : 'Play');
  }
  const toggle = () => { if (playing) { userPaused = true; stop(); } else { userPaused = false; play(); } };
  playBtn.addEventListener('click', toggle);
  $('[data-viewport]').addEventListener('click', toggle);

  // ---------- scale the 1280×720 stage to the viewport
  const viewport = $('[data-viewport]');
  const stage = $('[data-stage]');
  const fit = () => { stage.style.transform = `scale(${viewport.clientWidth / 1280})`; };
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(viewport); else window.addEventListener('resize', fit);
  fit();

  // ---------- autoplay while on screen (never with reduced motion)
  if (!reduced && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      const vis = entries.some((e) => e.isIntersecting);
      if (vis && !userPaused && t < DURATION) play();
      if (!vis && playing) stop();
    }, { threshold: 0.45 }).observe(viewport);
  }
  // Pause when the tab is hidden.
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });

  // First frame: with reduced motion show a complete scene instead of an empty one.
  seek(reduced ? SCENES[0].dur - FADE - 0.05 : 0);

  // Hook for exporting the tour as a video.
  window.__clearspaceTour = { duration: DURATION, seek: (v) => { userPaused = true; stop(); seek(v); }, scenes: SCENES.map((s) => ({ label: s.label, start: s.start, dur: s.dur })) };
})();
