/* MamChef /careers page: application form. Checks the fields in the browser (own EN/LT texts, never browser or server text), sends one
   multipart POST to the public API and shows the result. Nothing else is stored or sent: no cookies, no storage, no libraries. */
(function () {
  'use strict';
  var d = document, w = window;
  var form = d.querySelector('[data-cr-form]');
  if (!form) return;
  function $(s, r) { return (r || d).querySelector(s); }
  var lt = function () { return w.mcLang === 'lt'; };
  // Both languages live on the node (site.js swaps data-en/data-lt), so a state survives a language switch
  function say(el, en, ltText) {
    el.setAttribute('data-en', en); el.setAttribute('data-lt', ltText);
    var v = lt() ? ltText : en;
    if (el.innerHTML !== v) el.innerHTML = v;
  }

  // API host by site host: mamchef.com / www.mamchef.com -> prod API; everything else (dev.mamchef.com, localhost) -> dev API
  var PATH = '/api/public/careers/applications';
  var host = w.location.hostname;
  var ENDPOINT = (host === 'mamchef.com' || host === 'www.mamchef.com' ? 'https://api.mamchef.com' : 'https://api.dev.mamchef.com') + PATH;

  var MAX_CV = 5 * 1024 * 1024, MIN_MS = 3000;
  var t0 = Date.now();
  d.addEventListener('DOMContentLoaded', function () { t0 = Date.now(); });

  var T = {
    name: ['Please enter your name.', 'Įveskite vardą ir pavardę.'],
    email0: ['Please enter your e-mail.', 'Įveskite el. pašto adresą.'],
    email: ['This e-mail does not look right. Please check it.', 'Šis el. pašto adresas atrodo neteisingas. Patikrinkite jį.'],
    phone: ['Check the phone number, or leave it empty.', 'Patikrinkite telefono numerį arba palikite lauką tuščią.'],
    link: ['Check the link, or leave it empty.', 'Patikrinkite nuorodą arba palikite lauką tuščią.'],
    role: ['Please choose one.', 'Pasirinkite vieną.'],
    message: ['Please write a few sentences (at least 20 characters).', 'Parašykite kelis sakinius (bent 20 simbolių).'],
    cvType: ['Only PDF files, please.', 'Galima įkelti tik PDF failą.'],
    cvSize: ['This file is bigger than 5 MB. Please upload a smaller PDF.', 'Failas didesnis nei 5 MB. Įkelkite mažesnį PDF.'],
    cvServer: ['This file could not be accepted. Please upload a PDF up to 5 MB.', 'Šio failo priimti negalime. Įkelkite PDF iki 5 MB.'],
    consent: ['Please tick the box so we can keep your application.', 'Pažymėkite langelį, kad galėtume išsaugoti jūsų paraišką.'],
    generic: ['Please check this field.', 'Patikrinkite šį lauką.'],
    fields: ['Please check the marked fields.', 'Patikrinkite pažymėtus laukus.'],
    tooMany: ['Too many tries from this connection. Please wait a few minutes and try again.', 'Per daug bandymų iš šio ryšio. Palaukite kelias minutes ir bandykite dar kartą.'],
    fail: ['Something went wrong, and your application was not sent. Please try again, or e-mail it to <a href=\'mailto:support@mamchef.com\'>support@mamchef.com</a>.',
      'Kažkas nepavyko, ir paraiška neišsiųsta. Bandykite dar kartą arba atsiųskite ją el. paštu <a href=\'mailto:support@mamchef.com\'>support@mamchef.com</a>.'],
    send: ['Send application', 'Siųsti paraišką'], sending: ['Sending…', 'Siunčiama…']
  };

  var F = {
    name: $('#cr-name'), email: $('#cr-email'), phone: $('#cr-phone'), link: $('#cr-link'), role: $('#cr-role'),
    message: $('#cr-msg'), cv: $('#cr-cv'), consent: $('#cr-ok')
  };
  var ERR = { name: 'cr-name-err', email: 'cr-email-err', phone: 'cr-phone-err', link: 'cr-link-err', role: 'cr-role-err', message: 'cr-msg-err', cv: 'cr-cv-err', consent: 'cr-ok-err' };
  var HINT = { message: 'cr-msg-hint', cv: 'cr-cv-hint' };
  var banner = $('[data-cr-banner]'), btn = $('.cr-send', form), btnT = $('[data-cr-send-t]', form), rm = $('[data-cr-rm]', form);
  var done = $('[data-cr-done]'), busy = false, submitted = false;

  function showErr(k, msg) {
    var f = F[k], e = d.getElementById(ERR[k]);
    if (!msg) {
      e.hidden = true; e.textContent = ''; ['data-en', 'data-lt'].forEach(function (a) { e.removeAttribute(a); });
      f.removeAttribute('aria-invalid');
      if (HINT[k]) f.setAttribute('aria-describedby', HINT[k]); else f.removeAttribute('aria-describedby');
      return;
    }
    say(e, msg[0], msg[1]); e.hidden = false;
    f.setAttribute('aria-invalid', 'true');
    f.setAttribute('aria-describedby', (HINT[k] ? HINT[k] + ' ' : '') + ERR[k]);
  }

  // Field checks return a text pair, or null when the field is fine. The CV check is async (it reads the first 5 bytes).
  var CHECK = {
    name: function () { return F.name.value.trim() ? null : T.name; },
    email: function () {
      var v = F.email.value.trim();
      if (!v) return T.email0;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254 ? null : T.email;
    },
    phone: function () { var v = F.phone.value.trim(); return !v || /^[+0-9 ()\-]{6,30}$/.test(v) ? null : T.phone; },
    link: function () {
      var v = F.link.value.trim();
      if (!v) return null;
      if (v.length > 300 || !/^https?:\/\/\S+$/i.test(v)) return T.link;
      try { new URL(v); } catch (e) { return T.link; }
      return null;
    },
    role: function () { return F.role.value ? null : T.role; },
    message: function () { return F.message.value.trim().length >= 20 ? null : T.message; },
    consent: function () { return F.consent.checked ? null : T.consent; }
  };
  function checkCv() {
    var f = F.cv.files && F.cv.files[0];
    if (!f) return Promise.resolve(null);
    if (!/\.pdf$/i.test(f.name) || (f.type && f.type !== 'application/pdf')) return Promise.resolve(T.cvType);
    if (f.size > MAX_CV) return Promise.resolve(T.cvSize);
    return new Promise(function (ok) {
      var r = new FileReader();
      r.onload = function () {
        var b = new Uint8Array(r.result);
        ok(b.length === 5 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d ? null : T.cvType);
      };
      r.onerror = function () { ok(T.cvType); };
      r.readAsArrayBuffer(f.slice(0, 5));
    });
  }

  function setBanner(msg) {
    if (!msg) { banner.hidden = true; banner.textContent = ''; ['data-en', 'data-lt'].forEach(function (a) { banner.removeAttribute(a); }); return; }
    say(banner, msg[0], msg[1]); banner.hidden = false;
  }
  function setBusy(on) {
    busy = on; btn.disabled = on;
    if (on) btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy');
    say(btnT, (on ? T.sending : T.send)[0], (on ? T.sending : T.send)[1]);
  }

  // After the first submit, re-check a field as it changes
  Object.keys(CHECK).forEach(function (k) {
    var ev = (k === 'role' || k === 'consent') ? 'change' : 'input';
    F[k].addEventListener(ev, function () { if (submitted) showErr(k, CHECK[k]()); });
  });
  function syncRm() { rm.hidden = !(F.cv.files && F.cv.files.length); }
  F.cv.addEventListener('change', function () {
    syncRm();
    checkCv().then(function (m) {
      if (m) { F.cv.value = ''; syncRm(); }
      showErr('cv', m);
    });
  });
  rm.addEventListener('click', function () { F.cv.value = ''; syncRm(); showErr('cv', null); F.cv.focus(); });

  // "How we use it": opens the privacy notice right under the consent line (no jump away from the form, checkbox untouched).
  // The text is cloned from the notice below the form, so it stays single-sourced and follows the EN/LT switch. Without JS the link is still the #privacy anchor.
  var pop = null, popOpen = false;
  function syncPriv() {
    var a = $('.cr-check a[href="#privacy"]', form);
    if (!a) return;
    a.setAttribute('aria-expanded', String(popOpen)); a.setAttribute('aria-controls', 'cr-priv-pop');
  }
  form.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('.cr-check a[href="#privacy"]') : null;
    if (!a) return;
    var src = $('#privacy'); src = src && src.parentNode && $('p', src.parentNode);
    if (!src) return;
    ev.preventDefault();
    if (!pop) {
      pop = d.createElement('div'); pop.id = 'cr-priv-pop'; pop.className = 'cr-priv-pop'; pop.hidden = true;
      pop.appendChild(src.cloneNode(true));
      a.closest('.cr-field').insertBefore(pop, $('#cr-ok-err'));
    }
    popOpen = !popOpen; pop.hidden = !popOpen; syncPriv();
  });
  d.addEventListener('mc:lang', syncPriv);

  function firstInvalid(errs) {
    var order = ['name', 'email', 'phone', 'link', 'role', 'message', 'cv', 'consent'];
    for (var i = 0; i < order.length; i++) if (errs[order[i]]) return F[order[i]];
    return null;
  }
  function validateAll() {
    return checkCv().then(function (cvErr) {
      var errs = {}, any = false;
      Object.keys(CHECK).forEach(function (k) { var m = CHECK[k](); errs[k] = m; if (m) any = true; });
      errs.cv = cvErr; if (cvErr) any = true;
      if (cvErr) { F.cv.value = ''; syncRm(); }
      Object.keys(errs).forEach(function (k) { showErr(k, errs[k]); });
      return { errs: errs, any: any };
    });
  }

  function showDone(email) {
    $('[data-cr-email]', done).textContent = email;
    form.hidden = true; form.style.display = 'none'; done.hidden = false;
    var h = $('[data-cr-done-h]', done); h.focus();
  }

  function serverErrors(res) {
    return res.json().then(function (j) { return (j && j.data && j.data.errors) || {}; }, function () { return {}; });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (busy) return;
    submitted = true; setBanner(null); setBusy(true);
    validateAll().then(function (r) {
      if (r.any) {
        setBusy(false); setBanner(T.fields);
        var f = firstInvalid(r.errs); if (f) f.focus();
        return;
      }
      // The API drops submits faster than 3 s after page load as bot traffic: wait out the rest instead of losing a quick real one
      var wait = Math.max(0, MIN_MS + 250 - (Date.now() - t0));
      return new Promise(function (ok) { setTimeout(ok, wait); }).then(send);
    });
  });

  function send() {
    var fd = new FormData(form);
    if (!(F.cv.files && F.cv.files.length)) fd.delete('cv');
    fd.set('locale', lt() ? 'lt' : 'en');
    fd.set('elapsed_ms', String(Math.max(0, Math.round(Date.now() - t0))));
    var ctl = ('AbortController' in w) ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 30000) : null;
    var lang = lt() ? 'lt' : 'en', email = F.email.value.trim();
    var opts = { method: 'POST', body: fd, headers: { 'Accept': 'application/json', 'Accept-Language': lang } };
    if (ctl) opts.signal = ctl.signal;
    return fetch(ENDPOINT, opts).then(function (res) {
      if (timer) clearTimeout(timer);
      if (res.ok) { setBusy(false); setBanner(null); showDone(email); return; }
      if (res.status === 422) {
        return serverErrors(res).then(function (errs) {
          setBusy(false);
          Object.keys(errs).forEach(function (k) {
            if (!F[k]) return;
            showErr(k, k === 'cv' ? T.cvServer : (CHECK[k] && CHECK[k]()) || T.generic);
          });
          setBanner(T.fields);
          var f = firstInvalid(Object.keys(errs).reduce(function (o, k) { o[k] = 1; return o; }, {}));
          if (f) f.focus();
        });
      }
      setBusy(false);
      if (res.status === 413) { showErr('cv', T.cvSize); setBanner(T.fields); F.cv.focus(); }
      else if (res.status === 429) setBanner(T.tooMany);
      else setBanner(T.fail);
    }, function () {
      if (timer) clearTimeout(timer);
      setBusy(false); setBanner(T.fail);
    });
  }
})();
