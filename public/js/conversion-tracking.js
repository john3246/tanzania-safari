/**
 * GA4 conversion events + UTM persistence for Tanzania Safari Magic.
 *
 * Events: whatsapp_click, generate_lead (booking/contact form), phone_click, trust_link_click
 *
 * UTM: first-touch params are stored in localStorage (tsm_utm) and sent with events.
 * Use on ads / social: ?utm_source=facebook&utm_medium=social&utm_campaign=serengeti_2026
 * Channels to tag: google / facebook / instagram / tripadvisor / email / partner
 */
(function () {
  const KEY = (window.TSM_SITE_CONFIG && window.TSM_SITE_CONFIG.utmStorageKey) || 'tsm_utm';
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

  function fire() {
    const g = window.gtag;
    if (typeof g === 'function') return g.apply(null, arguments);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function captureUtm() {
    try {
      const params = new URLSearchParams(window.location.search);
      const incoming = {};
      UTM_KEYS.forEach((k) => {
        const v = params.get(k);
        if (v) incoming[k] = v;
      });
      if (!Object.keys(incoming).length) return readUtm();
      const existing = readUtm();
      const merged = Object.assign({}, existing, incoming, {
        first_touch: existing.first_touch || new Date().toISOString(),
        last_touch: new Date().toISOString()
      });
      localStorage.setItem(KEY, JSON.stringify(merged));
      return merged;
    } catch (_) {
      return {};
    }
  }

  function readUtm() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function eventParams(extra) {
    const utm = readUtm();
    return Object.assign(
      {
        page_path: (window.location && window.location.pathname) || '/',
        utm_source: utm.utm_source || '(direct)',
        utm_medium: utm.utm_medium || '(none)',
        utm_campaign: utm.utm_campaign || ''
      },
      extra || {}
    );
  }

  function track(name, extra) {
    fire('event', name, eventParams(extra));
  }

  function isWhatsAppHref(href) {
    return /wa\.me\/|whatsapp\.com|api\.whatsapp/i.test(href || '');
  }

  function isPhoneHref(href) {
    return /^tel:/i.test(href || '');
  }

  function isTrustHref(href, el) {
    if (el && el.getAttribute('data-track') && String(el.getAttribute('data-track')).indexOf('trust') === 0) return true;
    return /tripadvisor\.com|tato\.or\.tz|safetravels\.wttc/i.test(href || '');
  }

  function bindClicks() {
    document.addEventListener(
      'click',
      (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (isWhatsAppHref(href)) {
          track('whatsapp_click', { link_url: href, event_category: 'conversion' });
          return;
        }
        if (isPhoneHref(href)) {
          track('phone_click', { link_url: href, event_category: 'conversion' });
          return;
        }
        if (isTrustHref(href, a)) {
          track('trust_link_click', {
            link_url: href,
            event_category: 'engagement',
            badge: a.getAttribute('data-track-label') || a.getAttribute('data-track') || ''
          });
        }
      },
      true
    );
  }

  function markFormSuccess(formType) {
    track('generate_lead', { form_type: formType, event_category: 'conversion' });
  }

  captureUtm();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindClicks);
  } else {
    bindClicks();
  }

  window.TSMAnalytics = {
    track,
    markFormSuccess,
    readUtm,
    captureUtm
  };
})();
