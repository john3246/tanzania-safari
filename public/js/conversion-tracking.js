/**
 * Lightweight conversion events for GA4 / GTM dataLayer.
 * Single delegated listeners — no MutationObserver, no loops.
 */
(function () {
  if (window.__TSM_CONV_TRACKING) return;
  window.__TSM_CONV_TRACKING = true;

  function fire(name, params) {
    const payload = Object.assign({ event_category: 'conversion' }, params || {});
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, payload);
    } catch (_) { /* ignore */ }
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, payload));
    } catch (_) { /* ignore */ }
  }

  document.addEventListener(
    'click',
    function (e) {
      const a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (/wa\.me\/|whatsapp\.com|api\.whatsapp/i.test(href)) {
        fire('whatsapp_click', { link_url: href.slice(0, 180) });
        return;
      }
      if (/^tel:/i.test(href)) {
        fire('phone_click', { link_url: href });
        return;
      }
      if (a.classList.contains('safari-card') || /\/safaris\/[^/?#]+/.test(href) && /view details/i.test(a.textContent || '')) {
        fire('view_item', { link_url: href.slice(0, 180), item_name: (a.textContent || '').trim().slice(0, 80) });
      }
    },
    true
  );

  document.addEventListener(
    'submit',
    function (e) {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      const id = form.id || form.getAttribute('name') || '';
      if (/contact|booking|quickBook|enquiry|newsletter/i.test(id) || /\/api\/(contact|enquiry|bookings|newsletter)/i.test(form.action || '')) {
        fire(id === 'newsletterForm' ? 'sign_up' : 'generate_lead', { form_id: id || 'form' });
      }
    },
    true
  );
})();
