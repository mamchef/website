/* MamChef home page: hero tilt, sticky "kitchen to couch" story, bento spotlight, idle-loaded clay videos.
   transform/opacity only; everything is skipped when motion is off (toggle or prefers-reduced-motion). */
(function () {
  'use strict';
  var d = document, w = window;
  var off = function () { return w.mcMotionOff ? w.mcMotionOff() : d.documentElement.classList.contains('motion-off'); };
  var finePointer = w.matchMedia('(hover: hover) and (pointer: fine)');
  var videos = [];

  /* ---------- Hero: phone + arch tilt with the pointer (rAF-throttled CSS vars) ---------- */
  var hero = d.querySelector('.hero');
  var stage = d.querySelector('[data-tilt]');
  if (hero && stage) {
    var tx = 0, ty = 0, raf = 0;
    var apply = function () { raf = 0; stage.style.setProperty('--mx', tx.toFixed(3)); stage.style.setProperty('--my', ty.toFixed(3)); };
    hero.addEventListener('pointermove', function (e) {
      if (off() || !finePointer.matches) return;
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = w.requestAnimationFrame(apply);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = w.requestAnimationFrame(apply); });
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
  // Activation band: viewport middle on desktop; on phones/tablets a thin band at the bottom edge of the pinned
  // visual, where the sticky step cards stop (so the active step is always the fully visible one).
  if (story && steps.length) {
    activate(steps[0]);
    var sio = null, live = [], narrow = w.matchMedia('(max-width: 899px)');
    var watch = function () {
      if (!('IntersectionObserver' in w)) return;
      if (sio) sio.disconnect();
      live = [];
      var margin = '-45% 0px -45% 0px';
      var vis = story.querySelector('.story-visual');
      if (narrow.matches && vis && vis.offsetParent !== null) {
        var line = vis.offsetHeight;
        margin = '-' + Math.round(line) + 'px 0px -' + Math.max(0, Math.round(w.innerHeight - line - 24)) + 'px 0px';
      }
      sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = live.indexOf(en.target);
          if (en.isIntersecting && i < 0) live.push(en.target);
          if (!en.isIntersecting && i >= 0) live.splice(i, 1);
        });
        var last = null;
        Array.prototype.forEach.call(steps, function (s) { if (live.indexOf(s) >= 0) last = s; });
        if (last) activate(last);
      }, { rootMargin: margin, threshold: 0 });
      Array.prototype.forEach.call(steps, function (s) { sio.observe(s); });
    };
    watch();
    var rt = 0;
    w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(watch, 200); });
    d.addEventListener('mc:motion', watch);
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
