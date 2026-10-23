/* MamChef /chefs page: order-ticket demo, tabbed chef-app phone, week planner, drawing sign-up line, sticky phone CTA,
   "Start cooking" store link on phones, idle hero video, pointer parallax/tilt. No libraries. Nothing is stored or sent:
   the demo and the planner only change this page. transform/opacity only; motion off (OS setting) = final static state. */
(function () {
  'use strict';
  var d = document, w = window, de = d.documentElement;
  var off = function () { return w.mcMotionOff ? w.mcMotionOff() : de.classList.contains('motion-off'); };
  var lt = function () { return w.mcLang === 'lt'; };
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)');
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  // Both languages live on the node (site.js swaps data-en/data-lt), so a state survives a language switch
  function say(el, en, ltText) {
    el.setAttribute('data-en', en); el.setAttribute('data-lt', ltText);
    var v = lt() ? ltText : en;
    if (el.innerHTML !== v) el.innerHTML = v;
  }

  /* ---------- Header "Start cooking": iPhone + Android -> mamchef.com/chef-recruiter (nginx sends the phone to its store);
     iPad (iPad UA, or iPadOS Safari = Mac UA + touch, which the recruiter would send back to /chefs) -> the App Store listing;
     desktop + no-JS keep href="#start" (the closing section). os-ios / os-android come from the early inline script on <html>;
     only the href changes, so nothing moves. ---------- */
  var ua = navigator.userAgent || '', ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var store = de.classList.contains('os-ios') ? (ipad ? 'https://apps.apple.com/app/id6765938630' : 'https://mamchef.com/chef-recruiter')
    : de.classList.contains('os-android') ? 'https://mamchef.com/chef-recruiter' : '';
  if (store) $$('[data-ch-start]').forEach(function (a) { a.href = store; });

  /* ---------- Hero: accept or decline a sample order ---------- */
  var demo = $('[data-ch-demo]');
  if (demo) {
    var deck = demo.parentNode, head = $('[data-ch-head]', demo), note = $('[data-ch-note]', demo), stamp = $('[data-ch-stamp]', demo);
    var live = $('[data-ch-live]', demo), btns = $('.ch-t-btns', demo), again = $('[data-ch-again]', demo), acc = $('[data-ch-accept]', demo);
    var S = {
      neu: ['New order', 'Naujas užsakymas', 'Card held. Charged when you accept.', 'Suma kortelėje rezervuota. Nuskaitoma, kai priimate.'],
      acc: ['Preparing', 'Ruošiama', 'Payment taken.', 'Mokėjimas nuskaitytas.', 'Accepted', 'Priimta',
        'Order accepted. Payment taken.', 'Užsakymas priimtas. Mokėjimas nuskaitytas.'],
      dec: ['Declined', 'Atsisakyta', 'Nothing is charged.', 'Niekas nenuskaitoma.', 'Declined', 'Atsisakyta',
        'Order declined. Nothing is charged.', 'Užsakymo atsisakyta. Niekas nenuskaitoma.']
    };
    var setState = function (k) {
      var s = S[k];
      demo.setAttribute('data-state', k === 'neu' ? 'new' : k);
      deck.classList.toggle('is-acc', k === 'acc');
      say(head, s[0], s[1]); say(note, s[2], s[3]);
      btns.hidden = k !== 'neu'; again.hidden = k === 'neu';
      if (k === 'neu') {
        ['data-en', 'data-lt'].forEach(function (a) { stamp.removeAttribute(a); live.removeAttribute(a); });
        stamp.textContent = ''; live.textContent = '';
      } else {
        say(stamp, s[4], s[5]); say(live, s[6], s[7]);
        demo.classList.add('ch-used');
      }
    };
    acc.addEventListener('click', function () { setState('acc'); again.focus(); });
    $('[data-ch-decline]', demo).addEventListener('click', function () { setState('dec'); again.focus(); });
    again.addEventListener('click', function () { setState('neu'); acc.focus(); });
  }

  /* ---------- Hero: picture + oven glow follow a fine pointer (rAF-throttled CSS vars) ---------- */
  var hero = $('.ch-hero'), scene = $('[data-ch-scene]');
  if (hero && scene) {
    var tx = 0, ty = 0, raf = 0;
    var apply = function () { raf = 0; scene.style.setProperty('--mx', tx.toFixed(3)); scene.style.setProperty('--my', ty.toFixed(3)); };
    hero.addEventListener('pointermove', function (e) {
      if (off() || !fine.matches || e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = w.requestAnimationFrame(apply);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = w.requestAnimationFrame(apply); });
  }

  /* ---------- Kitchen tiles: small tilt under a mouse (max 3 deg) ---------- */
  $$('.ch-tile').forEach(function (t) {
    var r = null, f = 0, x = 0, y = 0;
    var paint = function () { f = 0; if (!r) return; t.style.setProperty('--rx', ((x - r.left) / r.width - 0.5) * 6 + 'deg'); t.style.setProperty('--ry', ((y - r.top) / r.height - 0.5) * -6 + 'deg'); };
    t.addEventListener('pointerenter', function (e) { r = e.pointerType === 'mouse' && !off() ? t.getBoundingClientRect() : null; });
    t.addEventListener('pointermove', function (e) { if (!r) return; x = e.clientX; y = e.clientY; if (!f) f = w.requestAnimationFrame(paint); }, { passive: true });
    t.addEventListener('pointerleave', function () { r = null; t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
  });

  /* ---------- A day in your kitchen: APG tabs (arrows, Home/End), no auto-advance ---------- */
  var day = $('#day'), tabs = $$('[role="tab"]', $('[data-ch-tabs]') || d), phone = $('.ch-phone');
  function select(i, focus) {
    tabs.forEach(function (t, j) {
      var on = j === i;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      d.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (day.getAttribute('data-step') !== String(i + 1)) {
      day.setAttribute('data-step', String(i + 1));
      if (phone && !off()) { phone.classList.remove('is-swap'); void phone.offsetWidth; phone.classList.add('is-swap'); }
    }
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j !== null) { e.preventDefault(); select(j, true); }
    });
  });

  /* ---------- Plan your week: plates = round(per day x days x 52/12), sales = round(price x plates); plain numbers, no qualifiers ---------- */
  var plan = $('[data-ch-plan]');
  if (plan) {
    var price = $('#ch-price', plan), per = $('#ch-per', plan), days = $$('.ch-day-chips input', plan);
    var receipt = $('[data-ch-receipt]', plan), out = $('[data-ch-out]', plan), vPrice = $('[data-ch-v="price"]', plan), vPer = $('[data-ch-v="per"]', plan);
    var R = {}; $$('[data-ch-r]', plan).forEach(function (el) { R[el.getAttribute('data-ch-r')] = el; });
    var NB = ' ', timer = 0, first = true;
    // Lithuanian forms by number: 1, 21 -> one; 2-9, 22 -> few; 10-20 -> many
    var ltP = function (n, one, few, many) {
      var a = n % 10, b = n % 100;
      return a === 1 && b !== 11 ? one : a >= 2 && a <= 9 && (b < 12 || b > 19) ? few : many;
    };
    var num = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB); };
    var plates = function (n) { return n + ' ' + (n === 1 ? 'plate' : 'plates'); };
    var ltPl = function (n) { return n + ' ' + ltP(n, 'patiekalas', 'patiekalai', 'patiekalų'); };
    var fill = function (el) { el.style.setProperty('--fill', (el.value - el.min) / (el.max - el.min) * 100 + '%'); };
    var render = function () {
      var p = +price.value, q = +per.value, k = days.filter(function (c) { return c.checked; }).length;
      var n = Math.round(q * k * 52 / 12), s = Math.round(p * n);
      fill(price); fill(per);
      vPrice.innerHTML = p + '&nbsp;€'; vPer.textContent = String(q);
      price.setAttribute('aria-valuetext', lt() ? p + ' ' + ltP(p, 'euras', 'eurai', 'eurų') + ' už patiekalą' : p + ' euros per plate');
      per.setAttribute('aria-valuetext', lt() ? ltPl(q) + ' per dieną' : plates(q) + ' a day');
      if (!k) {
        receipt.setAttribute('data-empty', '');
      } else {
        receipt.removeAttribute('data-empty');
        R.v1.textContent = String(n);
        say(R.f2, plates(n) + ' × ' + p + '&nbsp;€', ltPl(n) + ' × ' + p + '&nbsp;€');
        say(R.v2, num(s) + '&nbsp;€ <small class="ch-rc-per">/&nbsp;month</small>', num(s) + '&nbsp;€ <small class="ch-rc-per">/&nbsp;mėn.</small>');
      }
      // Screen readers: one polite sentence once the value settles (not on every slider step)
      var tell = function () {
        if (!k) say(out, 'Pick at least one day.', 'Pasirinkite bent vieną dieną.');
        else say(out, plates(n) + ' a month, ' + num(s) + ' € a month.', ltPl(n) + ' per mėnesį, ' + num(s) + ' € per mėnesį.');
      };
      clearTimeout(timer);
      if (first) {
        // First render: the result is readable at once, then the node becomes the live region, so nothing is spoken on load
        first = false; tell();
        out.setAttribute('role', 'status'); out.setAttribute('aria-live', 'polite'); out.setAttribute('aria-atomic', 'true');
        return;
      }
      timer = setTimeout(function () {
        tell();
        if (!off()) { receipt.classList.remove('is-print'); void receipt.offsetWidth; receipt.classList.add('is-print'); }
      }, 400);
    };
    [price, per].forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('keydown', function (e) { // PageUp / PageDown = 5 steps (native step is 1)
        if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
        e.preventDefault();
        el.value = Math.max(+el.min, Math.min(+el.max, +el.value + (e.key === 'PageUp' ? 5 : -5)));
        render();
      });
    });
    days.forEach(function (c) { c.addEventListener('change', render); });
    d.addEventListener('mc:lang', render);
    render();
  }

  /* ---------- Sign-up journey: the line draws with scroll (one rAF-throttled passive listener while in view) ---------- */
  var tl = $('[data-ch-tl]');
  if (tl) {
    var steps = $$('.ch-st', tl), line = $('.ch-tl-line', tl), H = 0, marks = [], on = false, tick = 0;
    var measure = function () {
      var lr = line.getBoundingClientRect(); H = lr.height;
      marks = steps.map(function (s) { var r = $('.ch-node', s).getBoundingClientRect(); return r.top + r.height / 2 - lr.top; });
      tl.style.setProperty('--h', H + 'px');
    };
    var frame = function () {
      tick = 0;
      var r = line.getBoundingClientRect(), y = w.innerHeight * 0.62 - r.top, p = Math.max(0, Math.min(1, y / (H || 1)));
      tl.style.setProperty('--p', p.toFixed(4));
      steps.forEach(function (s, i) { s.classList.toggle('is-on', y >= marks[i] - 4); });
      tl.classList.toggle('is-done', p >= 0.999);
    };
    var onScroll = function () { if (!tick) tick = w.requestAnimationFrame(frame); };
    var start = function () {
      if (off()) return;
      tl.classList.add('is-scrub'); measure(); frame();
      if ('IntersectionObserver' in w) {
        new IntersectionObserver(function (es) {
          var v = es[0].isIntersecting;
          if (v && !on) { on = true; measure(); w.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
          else if (!v && on) { on = false; w.removeEventListener('scroll', onScroll); frame(); }
        }, { rootMargin: '200px 0px' }).observe(tl);
      } else { w.addEventListener('scroll', onScroll, { passive: true }); }
      w.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
    };
    var stop = function () { tl.classList.remove('is-scrub', 'is-done'); tl.style.setProperty('--p', '1'); steps.forEach(function (s) { s.classList.add('is-on'); }); };
    start();
    d.addEventListener('mc:motion', function (e) { if (e.detail.off) { stop(); w.removeEventListener('scroll', onScroll); on = false; } });
  }

  /* ---------- Sticky phone CTA (< 768 px, CSS): after the hero, never over the closing #start section (it has the same
     badges) or the footer ---------- */
  var bar = $('[data-ch-bar]'), end = $('#start');
  if (bar && hero && end && 'IntersectionObserver' in w) {
    var st = { hero: true, end: false, past: false };
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === hero) st.hero = e.isIntersecting;
        else { st.end = e.isIntersecting; st.past = !e.isIntersecting && e.boundingClientRect.top < 0; }
      });
      var show = !st.hero && !st.end && !st.past;
      bar.classList.toggle('is-on', show);
      bar.inert = !show;
      bar.setAttribute('aria-hidden', String(!show));
    });
    bio.observe(hero); bio.observe(end);
  }

  /* ---------- Hero clay video: desktop fine pointer only, after idle, never Save-Data / slow / motion off ---------- */
  var holder = $('.ch-scene [data-video]'), vid = null, inView = true;
  function allow() {
    var c = navigator.connection || {};
    return !off() && !c.saveData && !/(^|-)(2g|3g)$/.test(c.effectiveType || '') && w.innerWidth >= 1200 && fine.matches;
  }
  function sync() {
    if (!vid) return;
    if (!d.hidden && !off() && inView) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () { /* autoplay refused: the still stays */ }); }
    else if (!vid.paused) vid.pause();
  }
  function loadVideo() {
    if (vid || !holder || !allow()) return;
    vid = d.createElement('video');
    vid.muted = true; vid.loop = true; vid.playsInline = true; vid.preload = 'auto';
    vid.setAttribute('muted', ''); vid.setAttribute('playsinline', ''); vid.setAttribute('aria-hidden', 'true');
    vid.src = holder.getAttribute('data-video');
    vid.addEventListener('playing', function () { holder.classList.add('is-playing'); });
    holder.appendChild(vid);
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(holder);
    sync();
  }
  w.addEventListener('load', function () {
    var idle = w.requestIdleCallback || function (fn) { return setTimeout(fn, 2500); };
    idle(loadVideo, { timeout: 6000 });
  });
  d.addEventListener('visibilitychange', sync);
  d.addEventListener('mc:motion', function (e) {
    if (e.detail.off) {
      if (vid) { vid.pause(); holder.classList.remove('is-playing'); }
      if (scene) { scene.style.setProperty('--mx', '0'); scene.style.setProperty('--my', '0'); }
    } else if (!vid) loadVideo(); else sync();
  });
})();
