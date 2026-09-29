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

  /* ── Animaciones de aparición al hacer scroll ── */
  function initReveal() {
    var els = document.querySelectorAll('.section, .service, .testimonial, .trust-bar');
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
    }, { threshold: 0.12 });
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
    initReveal();
    initShare();
    initSW();
  });
})();
