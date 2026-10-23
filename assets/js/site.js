/* MamChef website: shared behaviour (all pages). No libraries.
   i18n contract: every [data-en] element gets innerHTML from data-<lang>; attributes via
   data-alt-*, data-aria-*, data-content-*, data-placeholder-*. EN is the static HTML. */
(function () {
  'use strict';
  var d = document, de = d.documentElement, w = window;

  function store(key, value) {
    try {
      if (value === undefined) return w.localStorage.getItem(key);
      w.localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: work without persistence */ }
    return null;
  }
  function each(sel, fn, root) { Array.prototype.forEach.call((root || d).querySelectorAll(sel), fn); }

  /* ---------- Language ---------- */
  var ATTRS = [['alt', 'alt'], ['aria', 'aria-label'], ['content', 'content'], ['placeholder', 'placeholder'], ['title', 'title']];

  function setLang(lang, persist) {
    lang = lang === 'lt' ? 'lt' : 'en';
    var changed = w.mcLang !== undefined && w.mcLang !== lang;
    if (lang !== 'en' || changed) {
      each('[data-en]', function (el) {
        var v = el.getAttribute('data-' + lang);
        if (v !== null && el.innerHTML !== v) el.innerHTML = v;
      });
      ATTRS.forEach(function (a) {
        each('[data-' + a[0] + '-en]', function (el) {
          var v = el.getAttribute('data-' + a[0] + '-' + lang);
          if (v !== null) el.setAttribute(a[1], v);
        });
      });
    }
    de.lang = lang;
    each('[data-set-lang]', function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang)); });
    if (persist) store('mc-lang', lang);
    w.mcLang = lang;
    de.classList.remove('i18n-wait');
    d.dispatchEvent(new CustomEvent('mc:lang', { detail: { lang: lang } }));
  }
  w.mcSetLang = setLang;
  w.changeLanguage = function (lang) { setLang(lang, true); }; // older inline callers

  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  setLang(store('mc-lang') || (nav.toLowerCase().indexOf('lt') === 0 ? 'lt' : 'en'), false);
  each('[data-set-lang]', function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); });
  });

  /* ---------- Motion: follows the OS "reduce motion" setting only (no on-page toggle) ---------- */
  var reduce = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function setMotion(off) {
    de.classList.toggle('motion-off', off);
    if (off) each('.rv, .hat-draw, [data-inview]', function (el) { el.classList.add('in'); });
    d.dispatchEvent(new CustomEvent('mc:motion', { detail: { off: off } }));
  }
  w.mcMotionOff = function () { return de.classList.contains('motion-off'); };
  setMotion(!!(reduce && reduce.matches));
  if (reduce && reduce.addEventListener) {
    reduce.addEventListener('change', function (e) { setMotion(e.matches); });
  }

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  var header = d.querySelector('[data-header]');
  var sheet = d.getElementById('mc-menu');
  var burger = d.querySelector('[data-burger]');
  var lastY = w.scrollY, ticking = false;
  function onScroll() {
    var y = w.scrollY;
    if (header && !d.body.classList.contains('sheet-open') && !header.contains(d.activeElement)) {
      if (y > lastY + 6 && y > 160) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 160) header.classList.remove('is-hidden');
    }
    lastY = y; ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); } }, { passive: true });
  if (header) header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ---------- Mobile menu sheet ---------- */
  function openSheet(open) {
    if (!sheet || !burger) return;
    burger.setAttribute('aria-expanded', String(open));
    var lbl = burger.getAttribute('data-aria-' + (open ? 'close-' : '') + (w.mcLang || 'en'));
    if (lbl) burger.setAttribute('aria-label', lbl);
    d.body.classList.toggle('sheet-open', open);
    if (open) {
      sheet.hidden = false;
      w.requestAnimationFrame(function () { sheet.classList.add('is-open'); });
      var first = sheet.querySelector('a, button');
      if (first) first.focus({ preventScroll: true });
    } else {
      sheet.classList.remove('is-open');
      setTimeout(function () { if (burger.getAttribute('aria-expanded') === 'false') sheet.hidden = true; }, 360);
    }
  }
  if (burger && sheet) {
    burger.addEventListener('click', function () { openSheet(burger.getAttribute('aria-expanded') !== 'true'); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) openSheet(false); });
    d.addEventListener('keydown', function (e) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { openSheet(false); burger.focus(); return; }
      if (e.key === 'Tab') { // keep focus inside header + sheet while open
        var items = Array.prototype.filter.call(
          d.querySelectorAll('[data-header] a, [data-header] button, #mc-menu a, #mc-menu button'),
          function (el) { return el.offsetParent !== null; });
        var i = items.indexOf(d.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    d.addEventListener('mc:lang', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      var lbl = burger.getAttribute('data-aria-' + (open ? 'close-' : '') + w.mcLang);
      if (lbl) burger.setAttribute('aria-label', lbl);
    });
    w.matchMedia('(min-width: 1100px)').addEventListener('change', function (e) { if (e.matches) openSheet(false); });
  }

  /* ---------- Reveal on view (same end state everywhere) ---------- */
  var targets = d.querySelectorAll('.rv, .hat-draw, [data-inview]');
  if (w.mcMotionOff() || !('IntersectionObserver' in w)) {
    each('.rv, .hat-draw, [data-inview]', function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- Footer year (static 2026 fallback in the HTML) ---------- */
  var y = new Date().getFullYear();
  if (y > 2026) each('[data-year]', function (el) { el.textContent = String(y); });

  /* ---------- Google Analytics: unchanged id, loaded only when the browser is idle ---------- */
  var ga = de.getAttribute('data-ga');
  if (ga) {
    w.addEventListener('load', function () {
      var idle = w.requestIdleCallback || function (fn) { return setTimeout(fn, 2000); };
      idle(function () {
        w.dataLayer = w.dataLayer || [];
        w.gtag = function () { w.dataLayer.push(arguments); };
        w.gtag('js', new Date());
        w.gtag('config', ga);
        var s = d.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga);
        d.head.appendChild(s);
      }, { timeout: 5000 });
    });
  }
})();
