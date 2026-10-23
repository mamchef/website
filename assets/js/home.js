/* MamChef home page: hero tilt, sticky "kitchen to couch" story, bento spotlight, idle-loaded clay videos.
   transform/opacity only; everything is skipped when motion is off (OS prefers-reduced-motion). */
(function () {
  'use strict';
  var d = document, w = window;
  var off = function () { return w.mcMotionOff ? w.mcMotionOff() : d.documentElement.classList.contains('motion-off'); };
  var finePointer = w.matchMedia('(hover: hover) and (pointer: fine)');
  var videos = [];

  /* ---------- Hero: phone + arch tilt with the pointer (rAF-throttled CSS vars) ---------- */
  /* Phones / touch (same query as the calm-hero block in home.css): no tilt listeners at all; bound later if that stops matching. */
  var calmHero = w.matchMedia('(max-width: 899px), (pointer: coarse)');
  var hero = d.querySelector('.hero');
  var stage = d.querySelector('[data-tilt]');
  if (hero && stage) {
    var tx = 0, ty = 0, raf = 0, tiltOn = false;
    var apply = function () { raf = 0; stage.style.setProperty('--mx', tx.toFixed(3)); stage.style.setProperty('--my', ty.toFixed(3)); };
    var bindTilt = function () {
      if (tiltOn || calmHero.matches) return;
      tiltOn = true;
      hero.addEventListener('pointermove', function (e) {
        if (off() || !finePointer.matches || calmHero.matches) return;
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!raf) raf = w.requestAnimationFrame(apply);
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = w.requestAnimationFrame(apply); });
    };
    bindTilt();
    if (!tiltOn && calmHero.addEventListener) calmHero.addEventListener('change', bindTilt);
  }

  /* ---------- Story: the step in the middle of the viewport drives image, phone screen and ring ---------- */
  var story = d.querySelector('.story');
  var steps = d.querySelectorAll('.story .step');
  function activate(step) {
    if (!story || !step) return;
    story.setAttribute('data-active', step.getAttribute('data-step'));
    Array.prototype.forEach.call(steps, function (s) { s.classList.toggle('is-active', s === step); });
    syncVideos();
  }
  // Activation band = the middle 10% of the viewport. The pinned story only shows at >= 1024 px (CSS); below that the
  // steps are plain stacked cards. Steps are 74vh tall, so at most one is ever in the band; when none is (between
  // steps, or after the last one has left), the current step stays active: no fall-back to an earlier step.
  if (story && steps.length) {
    activate(steps[0]);
    if ('IntersectionObserver' in w) {
      var sio = new IntersectionObserver(function (entries) {
        var hit = null;
        entries.forEach(function (en) { if (en.isIntersecting) hit = en.target; });
        if (hit) activate(hit);
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      Array.prototype.forEach.call(steps, function (s) { sio.observe(s); });
    }
  }

  /* ---------- Bento: spotlight border follows the pointer, small tilt on the hovered tile; tap lift on touch ---------- */
  var bento = d.querySelector('[data-spotlight]');
  if (bento) {
    var tiles = bento.querySelectorAll('.tile');
    var px = 0, py = 0, brf = 0, hover = null;
    var paint = function () {
      brf = 0;
      Array.prototype.forEach.call(tiles, function (t) {
        var r = t.getBoundingClientRect();
        t.style.setProperty('--x', (px - r.left) + 'px');
        t.style.setProperty('--y', (py - r.top) + 'px');
        if (t === hover && !off()) {
          t.style.setProperty('--rx', (((px - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
          t.style.setProperty('--ry', (((py - r.top) / r.height - 0.5) * -6).toFixed(2) + 'deg');
        } else {
          t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg');
        }
      });
    };
    bento.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; hover = e.target.closest('.tile');
      if (!brf) brf = w.requestAnimationFrame(paint);
    }, { passive: true });
    bento.addEventListener('pointerleave', function () { hover = null; if (!brf) brf = w.requestAnimationFrame(paint); });
    bento.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || off()) return;
      var t = e.target.closest('.tile');
      if (!t) return;
      t.classList.add('is-tap');
      setTimeout(function () { t.classList.remove('is-tap'); }, 420);
    }, { passive: true });
  }

  /* ---------- Clay videos: desktop only, after idle, never on Save-Data / slow networks / motion off ---------- */
  var holders = d.querySelectorAll('[data-video]');
  function allowVideo() {
    var c = navigator.connection || {};
    return !off() && !c.saveData && !/(^|-)(2g|3g)$/.test(c.effectiveType || '') &&
      w.innerWidth >= 1100 && finePointer.matches;
  }
  function wanted(v) {
    if (d.hidden || off() || !v.inView) return false;
    return !v.holder.classList.contains('sv-video') || (story && story.getAttribute('data-active') === '1');
  }
  function syncVideos() {
    videos.forEach(function (v) {
      if (wanted(v)) {
        var p = v.el.play();
        if (p && p.catch) p.catch(function () { /* autoplay refused: the still stays */ });
      } else if (!v.el.paused) {
        v.el.pause();
      }
    });
  }
  function loadVideos() {
    if (!allowVideo() || !holders.length) return;
    var vio = 'IntersectionObserver' in w ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        videos.forEach(function (v) { if (v.holder === en.target) v.inView = en.isIntersecting; });
      });
      syncVideos();
    }, { threshold: 0.15 }) : null;
    Array.prototype.forEach.call(holders, function (h) {
      var el = d.createElement('video');
      el.muted = true; el.loop = true; el.playsInline = true; el.preload = 'auto';
      el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.setAttribute('aria-hidden', 'true');
      el.src = h.getAttribute('data-video');
      el.addEventListener('playing', function () { h.classList.add('is-playing'); });
      h.appendChild(el);
      var v = { el: el, holder: h, inView: !vio };
      videos.push(v);
      if (vio) vio.observe(h);
    });
    syncVideos();
  }
  w.addEventListener('load', function () {
    var idle = w.requestIdleCallback || function (fn) { return setTimeout(fn, 2500); };
    idle(loadVideos, { timeout: 6000 });
  });
  d.addEventListener('visibilitychange', syncVideos);
  d.addEventListener('mc:motion', function (e) {
    if (e.detail.off) {
      videos.forEach(function (v) { v.el.pause(); v.holder.classList.remove('is-playing'); });
      if (stage) { stage.style.setProperty('--mx', '0'); stage.style.setProperty('--my', '0'); }
    } else if (!videos.length) {
      loadVideos();
    } else {
      syncVideos();
    }
  });
})();
