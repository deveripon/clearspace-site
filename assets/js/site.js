// Clearspace site: reveal on scroll, mobile menu, FAQ accordion, copy buttons,
// the node_modules vignette, the "right before cleaning" checklist and the lazy demo.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll reveal (fires once)
  const reveals = $$('.mk-reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -64px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('shown'));
  }

  // ---- Mobile menu
  const menuBtn = $('.mk-menu-btn');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('use', menuBtn).setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // ---- FAQ accordion: one open at a time, arrow keys move between questions
  const accButtons = $$('.mk-acc button');
  const setOpen = (btn, open) => {
    const acc = btn.closest('.mk-acc');
    acc.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    $('#' + btn.getAttribute('aria-controls')).hidden = !open;
    $('use', btn).setAttribute('href', open ? '#i-minus' : '#i-plus');
  };
  accButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      accButtons.forEach((b) => setOpen(b, false));
      setOpen(btn, open);
    });
    btn.addEventListener('keydown', (e) => {
      const map = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: accButtons.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      accButtons[(map[e.key] + accButtons.length) % accButtons.length].focus();
    });
  });

  // ---- Copy buttons
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = $('#' + btn.dataset.copy).cloneNode(true);
      $$('.prompt', code).forEach((p) => p.remove());
      const text = code.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        ta.remove();
      }
      const label = $('span', btn);
      btn.classList.add('done');
      $('use', btn).setAttribute('href', '#i-tick');
      label.textContent = 'Copied';
      setTimeout(() => {
        btn.classList.remove('done');
        $('use', btn).setAttribute('href', '#i-copy');
        label.textContent = 'Copy';
      }, 1800);
    });
  });

  // ---- node_modules vignette: live total
  const nm = $('[data-nm]');
  if (nm) {
    const total = $('[data-nm-total]', nm);
    const update = () => {
      const gb = $$('input', nm).filter((c) => c.checked).reduce((a, c) => a + Number(c.dataset.size), 0);
      total.textContent = gb ? `${gb.toFixed(1)} GB selected` : 'Nothing selected';
    };
    nm.addEventListener('change', update);
    update();
  }

  // ---- "Right before cleaning" checklist
  const verify = $('[data-verify]');
  if (verify) {
    const items = $$('.mk-checks li', verify);
    const done = $('[data-done]', verify);
    let timers = [];
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      items.forEach((li) => li.classList.remove('on', 'run'));
      done.classList.remove('on');
    };
    const play = () => {
      reset();
      if (reduced) { items.forEach((li) => li.classList.add('on')); done.classList.add('on'); return; }
      items.forEach((li, i) => {
        timers.push(setTimeout(() => li.classList.add('run'), 300 + i * 520));
        timers.push(setTimeout(() => { li.classList.remove('run'); li.classList.add('on'); }, 300 + i * 520 + 420));
      });
      timers.push(setTimeout(() => done.classList.add('on'), 300 + items.length * 520 + 200));
    };
    $('[data-replay]', verify).addEventListener('click', play);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { play(); io.disconnect(); }
      }, { threshold: 0.5 });
      io.observe(verify);
    } else play();
  }

  // ---- GitHub stars & forks (public API, cached for an hour in this browser)
  const REPO = 'deveripon/clearSpace';
  const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
  const showCounts = (d) => {
    $$('[data-gh-stars]').forEach((el) => { el.textContent = fmtCount(d.stars); el.hidden = false; });
    $$('[data-gh-forks]').forEach((el) => { el.textContent = fmtCount(d.forks); el.hidden = false; });
  };
  (async () => {
    const KEY = 'cs-gh-counts';
    try {
      const cached = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.at < 3600e3) { showCounts(cached); return; }
    } catch {}
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) return;
      const j = await r.json();
      const d = { stars: j.stargazers_count || 0, forks: j.forks_count || 0, at: Date.now() };
      showCounts(d);
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
    } catch {}
  })();

  // ---- Load the live demo only on wide screens, and only when it is near
  const frame = $('.mk-demo-frame');
  if (frame) {
    const wide = window.matchMedia('(min-width: 1000px)');
    const load = () => { if (wide.matches && !frame.src) frame.src = frame.dataset.src; };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { load(); if (frame.src) io.disconnect(); }
      }, { rootMargin: '400px 0px' });
      io.observe(frame);
      wide.addEventListener('change', load);
    } else load();
  }
})();
