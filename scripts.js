/* ══════════════════════════════════════════════════════════
   KONFÍO ZINC · Tarjeta digital — lógica e interactividad
══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Tracking de conversiones: GA4 + Firestore (panel de reporte) ── */
  var PROYECTO = 'konfio-zinc';
  var API_KEY = 'AIzaSyDbwAk9APwP2SeaEfWxeQG_bdL9eatciEA';
  var TARJETA = (location.pathname.split('/').filter(Boolean)[0] || 'kz');

  function kz(evento, etiqueta) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', evento, { event_category: 'lead', event_label: etiqueta || '', transport_type: 'beacon' });
      }
    } catch (e) {}
    try {
      var url = 'https://firestore.googleapis.com/v1/projects/' + PROYECTO + '/databases/(default)/documents/eventos?key=' + API_KEY;
      var body = {
        fields: {
          tarjeta: { stringValue: TARJETA },
          evento: { stringValue: evento },
          etiqueta: { stringValue: etiqueta || '' },
          pagina: { stringValue: location.href },
          ts: { timestampValue: new Date().toISOString() }
        }
      };
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(function () {});
    } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest
      ? e.target.closest('a[href*="wa.me"],a[href*="api.whatsapp.com"],a[href*="whatsapp.com/send"],[data-action="whatsapp"]')
      : null;
    if (!el) return;
    var lbl = el.id || (el.textContent || '').trim().slice(0, 40) || 'whatsapp';
    kz('click_whatsapp', lbl);
  }, true);
  window.kzTrack = kz;

  /* ── Carrusel (servicios y testimonios) ── */
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('[data-track]');
      var dotsWrap = root.querySelector('[data-dots]');
      var prev = root.querySelector('[data-prev]');
      var next = root.querySelector('[data-next]');
      if (!track) return;

      var slides = Array.prototype.slice.call(track.querySelectorAll('[data-slide]'));
      if (!slides.length) return;

      var dots = [];
      var current = 0;

      function goTo(i) {
        var n = slides.length;
        current = ((i % n) + n) % n;
        var slide = slides[current];
        if (slide && track.scrollTo) {
          var left = slide.offsetLeft - track.offsetLeft;
          track.scrollTo({ left: left, behavior: 'smooth' });
        }
        dots.forEach(function (d, idx) { d.classList.toggle('active', idx === current); });
      }

      // construir dots
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        slides.forEach(function (_, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'dot' + (idx === 0 ? ' active' : '');
          b.setAttribute('aria-label', 'Ir a la diapositiva ' + (idx + 1));
          b.addEventListener('click', function () { goTo(idx); });
          dotsWrap.appendChild(b);
          dots.push(b);
        });
      }

      if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
      if (next) next.addEventListener('click', function () { goTo(current + 1); });

      // sincronizar dot activo al hacer scroll manual (swipe)
      var syncTicking = false;
      track.addEventListener('scroll', function () {
        if (syncTicking) return;
        syncTicking = true;
        requestAnimationFrame(function () {
          var mid = track.scrollLeft + track.clientWidth / 2;
          var best = 0, bestDist = Infinity;
          slides.forEach(function (s, idx) {
            var center = s.offsetLeft - track.offsetLeft + s.clientWidth / 2;
            var d = Math.abs(center - mid);
            if (d < bestDist) { bestDist = d; best = idx; }
          });
          current = best;
          dots.forEach(function (d, idx) { d.classList.toggle('active', idx === best); });
          syncTicking = false;
        });
      }, { passive: true });
    });
  }

  /* ── Animaciones de aparición al hacer scroll ── */
  function initReveal() {
    var els = document.querySelectorAll('.section');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  /* ── Compartir (nativo con fallback a portapapeles) ── */
  function initShare() {
    var btn = document.getElementById('share-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = location.href;
      var data = {
        title: 'KONFÍO ZINC · Soluciones digitales para negocios',
        text: 'Tarjetas digitales, catálogos, menús, landing pages, QR y agentes IA.',
        url: url
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          toast('✅ Enlace copiado');
        }).catch(function () {
          toast('Enlace: ' + url);
        });
      } else {
        toast('Enlace: ' + url);
      }
    });
  }

  /* ── Toast minimalista ── */
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:#141414;color:#fff;padding:10px 16px;border:1px solid rgba(201,169,97,0.4);border-radius:12px;font-size:13px;z-index:200;font-family:Inter,system-ui,sans-serif;transition:opacity .3s;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.opacity = '0'; }, 2600);
  }

  /* ── Registro del service worker ── */
  function initSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCarousels();
    initReveal();
    initShare();
    initSW();
  });
})();
