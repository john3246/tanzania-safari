/**
 * Kilimanjaro routes hub — renders the route cards grid from window.TSM_KiliRoutes.
 * Localizes the hub meta + each route via window.TSM_routeI18n when present.
 */
(function () {
  'use strict';

  function t(key, vars) {
    if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
    return key;
  }

  function tf(key, fallback, vars) {
    var v = t(key, vars);
    return v && v !== key ? v : fallback;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function routeCard(r) {
    var meta = [];
    if (r.days) meta.push('<span><i class="fas fa-clock"></i> ' + escapeHtml(r.days) + '</span>');
    if (r.difficulty) meta.push('<span><i class="fas fa-mountain"></i> ' + escapeHtml(r.difficulty) + '</span>');
    if (r.success) meta.push('<span><i class="fas fa-flag-checkered"></i> ' + escapeHtml(r.success) + '</span>');

    return (
      '<a href="/kilimanjaro/routes/' + encodeURIComponent(r.slug) + '" class="kili-route-card">' +
      '<div class="kri-img">' +
      (r.accommodation ? '<span class="kri-badge">' + escapeHtml(r.accommodation) + '</span>' : '') +
      '<img src="' + escapeHtml(r.image) + '" alt="' + escapeHtml(r.name) + '" loading="lazy" ' +
      'onerror="this.src=\'/images/optimized/mount-kilimanjaro-national-park.webp\'"></div>' +
      '<div class="kri-body">' +
      '<h3>' + escapeHtml(r.name) + '</h3>' +
      '<div class="kri-meta">' + meta.join('') + '</div>' +
      '<p class="kri-sum">' + escapeHtml(r.summary || '') + '</p>' +
      '<span class="kri-link">' + tf('kiliRoutes.viewRoute', 'View route') + ' <i class="fas fa-arrow-right"></i></span>' +
      '</div></a>'
    );
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  async function localizeHubMeta() {
    var data = window.TSM_KiliRoutes || {};
    var hub = data.hubMeta || null;
    if (!hub) return;

    if (window.TSM_routeI18n && typeof window.TSM_routeI18n.localizeHub === 'function') {
      try { hub = await window.TSM_routeI18n.localizeHub(hub); } catch (_) { /* keep en */ }
    }

    // Update SEO title/description from the localized hub meta.
    var title = (hub.meta_title || hub.title || 'Kilimanjaro Routes');
    if (window.SafariSEO && typeof window.SafariSEO.applyPageSeo === 'function') {
      window.SafariSEO.applyPageSeo({
        title: title,
        description: hub.meta_description || '',
        image: (data.IMG ? data.IMG(1) : '/images/kilimanjaro/kilimanjaro%20(1).jpeg'),
        type: 'website',
        keywords: hub.keywords || '',
        canonical: 'https://tanzaniasafarimagic.com/kilimanjaro/routes'
      });
    }
    if (hub.title) setText('hubTitle', hub.title);
  }

  async function render() {
    var grid = document.getElementById('routesGrid');
    if (!grid) return;

    var data = window.TSM_KiliRoutes && Array.isArray(window.TSM_KiliRoutes.ROUTES)
      ? window.TSM_KiliRoutes.ROUTES
      : [];

    if (!data.length) {
      grid.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">' +
        tf('kiliRoutes.empty', 'Routes are being updated.') +
        ' <a href="/kilimanjaro">' + tf('kiliRoutes.ctaKili', 'Kilimanjaro climbs') + '</a></p>';
      return;
    }

    var routes = data;
    if (window.TSM_routeI18n && typeof window.TSM_routeI18n.localizeRoute === 'function') {
      try {
        routes = await Promise.all(data.map(function (r) { return window.TSM_routeI18n.localizeRoute(r); }));
      } catch (_) {
        routes = data;
      }
    }

    grid.innerHTML = routes.map(routeCard).join('');
  }

  async function init() {
    try { if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready; } catch (_) {}
    if (window.TSM_i18n && typeof window.TSM_i18n.applyTranslations === 'function') {
      window.TSM_i18n.applyTranslations(document);
    }
    await localizeHubMeta();
    await render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
