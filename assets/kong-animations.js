/* ═══════════════════════════════════════════════════════════════
   KONG Animations — ink-splash theme toggle + scroll reveals
   ═══════════════════════════════════════════════════════════════ */

(function() {
'use strict';

/* ── Theme ──────────────────────────────────────────────────── */
const root = document.documentElement;
const STORAGE_KEY = 'kong-theme';

function getCurrentTheme() {
  return root.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

function applyTheme(theme, skipSplash) {
  if (skipSplash) {
    root.setAttribute('data-theme', theme);
    updateToggleUI(theme);
    return;
  }
  triggerInkSplash(theme);
}

function updateToggleUI(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    const icon = btn.querySelector('.toggle-icon');
    const label = btn.querySelector('.toggle-label');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  });
}

/* ── Ink Splash ─────────────────────────────────────────────── */
function buildSplash() {
  if (document.getElementById('ink-splash')) return;
  const div = document.createElement('div');
  div.id = 'ink-splash';
  // Build a blob SVG
  div.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="ink-grad-dark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#121212"/>
        <stop offset="100%" stop-color="#121212"/>
      </radialGradient>
      <radialGradient id="ink-grad-light" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f5f5f5"/>
        <stop offset="100%" stop-color="#f5f5f5"/>
      </radialGradient>
    </defs>
    <!-- Dark blob (to dark mode) -->
    <g class="ink-blob" id="ink-to-dark">
      <ellipse cx="50" cy="50" rx="38" ry="34" fill="url(#ink-grad-dark)" opacity=".97"/>
      <path d="M50,16 C55,8 68,12 72,20 C82,18 90,28 86,38 C94,44 92,56 84,60 C88,70 80,80 70,78 C66,86 54,88 48,82 C40,88 28,84 26,76 C16,76 10,64 16,56 C8,50 10,38 18,34 C14,22 26,14 36,18 C40,12 48,14 50,16Z" fill="url(#ink-grad-dark)" opacity=".9"/>
    </g>
    <!-- Light blob (to light mode) -->
    <g class="ink-blob" id="ink-to-light" style="display:none">
      <ellipse cx="50" cy="50" rx="38" ry="34" fill="url(#ink-grad-light)" opacity=".97"/>
      <path d="M50,16 C55,8 68,12 72,20 C82,18 90,28 86,38 C94,44 92,56 84,60 C88,70 80,80 70,78 C66,86 54,88 48,82 C40,88 28,84 26,76 C16,76 10,64 16,56 C8,50 10,38 18,34 C14,22 26,14 36,18 C40,12 48,14 50,16Z" fill="url(#ink-grad-light)" opacity=".9"/>
    </g>
  </svg>`;
  document.body.appendChild(div);
}

function triggerInkSplash(newTheme) {
  buildSplash();
  const splash = document.getElementById('ink-splash');
  const toBlob = document.getElementById('ink-to-dark');
  const toWhite = document.getElementById('ink-to-light');

  // Position origin at toggle button if possible
  const btn = document.querySelector('.theme-toggle');
  let ox = '50%', oy = '50%';
  if (btn) {
    const r = btn.getBoundingClientRect();
    ox = ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(1) + '%';
    oy = ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(1) + '%';
  }

  // Show the right blob
  toBlob.style.display = newTheme === 'dark' ? '' : 'none';
  toWhite.style.display = newTheme === 'light' ? '' : 'none';
  const activeBlob = newTheme === 'dark' ? toBlob : toWhite;
  activeBlob.style.setProperty('--ox', ox);
  activeBlob.style.setProperty('--oy', oy);
  activeBlob.style.transformOrigin = `${ox} ${oy}`;

  // Spread
  splash.classList.remove('retreating');
  splash.classList.add('spreading');

  setTimeout(() => {
    // Switch theme while covered
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    updateToggleUI(newTheme);
  }, 420);

  setTimeout(() => {
    splash.classList.remove('spreading');
    splash.classList.add('retreating');
    setTimeout(() => splash.classList.remove('retreating'), 700);
  }, 820);
}

/* ── Init theme ─────────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(theme, true);
})();

/* ── Toggle click handler ───────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.theme-toggle');
  if (!btn) return;
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

/* ── Scroll reveal ──────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ── Parallax hero ──────────────────────────────────────────── */
function initParallax() {
  const heroImg = document.querySelector('.hero-bg-img');
  if (!heroImg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      heroImg.style.transform = `translateY(${y * 0.3}px) scale(1.08)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ── Sticky nav scroll ──────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.kong-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── Number count-up ────────────────────────────────────────── */
function initCountUp() {
  const els = document.querySelectorAll('[data-countup]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.countup);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1200;
      const start = performance.now();
      io.unobserve(el);
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (Number.isInteger(target) ? Math.round(target * ease) : (target * ease).toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}

/* ── Horizontal scroll momentum ────────────────────────────── */
function initHScroll() {
  document.querySelectorAll('[data-hscroll]').forEach(el => {
    let isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft });
    el.addEventListener('mouseleave', () => isDown = false);
    el.addEventListener('mouseup', () => isDown = false);
    el.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  });
}

/* ── Stagger children ───────────────────────────────────────── */
function initStagger() {
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.setAttribute('data-reveal', '');
      child.setAttribute('data-reveal-delay', Math.min(i + 1, 6));
    });
  });
}

/* ── Boot ───────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  buildSplash();
  initStagger();
  initReveal();
  initParallax();
  initNav();
  initCountUp();
  initHScroll();
}

})();
