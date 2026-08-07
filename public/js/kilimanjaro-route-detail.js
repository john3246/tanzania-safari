/**
 * Kilimanjaro route detail — parses the slug from /kilimanjaro/routes/:slug,
 * finds the route in window.TSM_KiliRoutes, localizes it, and renders the page.
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

  function slugFromPath() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    var idx = parts.indexOf('routes');
    var raw = idx !== -1 && parts[idx + 1] ? parts[idx + 1] : parts[parts.length - 1];
    return decodeURIComponent(raw || '').toLowerCase();
  }

  function findRoute(all, slug) {
    // Exact match first, then tolerate the "-route" suffix in either direction.
    var exact = all.filter(function (r) { return r.slug === slug; })[0];
    if (exact) return exact;
    var withSuffix = all.filter(function (r) { return r.slug === slug + '-route'; })[0];
    if (withSuffix) return withSuffix;
    return all.filter(function (r) { return r.slug.replace(/-route$/, '') === slug.replace(/-route$/, ''); })[0] || null;
  }

  function applySeo(route) {
    var title = (route.meta_title || route.name) + '';
    if (title.indexOf('Tanzania Safari Magic') === -1) title = title + ' | Tanzania Safari Magic';
    document.title = title;

    var titleEl = document.getElementById('routePageTitle') || document.getElementById('pageTitle') || document.querySelector('title');
    if (titleEl) titleEl.textContent = title;

    var desc = route.meta_description || route.summary || '';
    if (window.SafariSEO && typeof window.SafariSEO.applyPageSeo === 'function') {
      window.SafariSEO.applyPageSeo({
        title: title,
        description: desc,
        image: route.image,
        type: 'article',
        keywords: route.keywords || '',
        canonical: 'https://tanzaniasafarimagic.com/kilimanjaro/routes/' + route.slug
      });
    } else {
      var metaDesc = document.getElementById('routeMetaDesc') || document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', String(desc).slice(0, 160));
      var canon = document.getElementById('routeCanonical') || document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', 'https://tanzaniasafarimagic.com/kilimanjaro/routes/' + route.slug);
    }

    if (window.SafariSEO && typeof window.SafariSEO.injectJsonLd === 'function' && typeof window.SafariSEO.breadcrumbSchema === 'function') {
      window.SafariSEO.injectJsonLd('route-breadcrumb-jsonld', window.SafariSEO.breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Kilimanjaro', url: '/kilimanjaro' },
        { name: tf('kiliRoutes.crumbRoutes', 'Routes'), url: '/kilimanjaro/routes' },
        { name: route.name, url: '/kilimanjaro/routes/' + route.slug }
      ]));
    }
  }

  function statBlock(labelKey, labelFallback, value) {
    if (!value) return '';
    return '<div class="krd-stat"><span class="k">' + tf(labelKey, labelFallback) + '</span><span class="v">' + escapeHtml(value) + '</span></div>';
  }

  function relatedCard(r) {
    return (
      '<a href="/kilimanjaro/routes/' + encodeURIComponent(r.slug) + '" class="krd-related-card">' +
      '<img src="' + escapeHtml(r.image) + '" alt="' + escapeHtml(r.name) + '" loading="lazy" ' +
      'onerror="this.src=\'/images/optimized/mount-kilimanjaro-national-park.webp\'">' +
      '<div class="b"><h4>' + escapeHtml(r.name) + '</h4>' +
      '<span style="font-size:0.8rem;color:var(--primary);font-weight:700">' + tf('kiliRoutes.viewRoute', 'View route') + ' <i class="fas fa-arrow-right"></i></span>' +
      '</div></a>'
    );
  }

  function renderNotFound(container) {
    container.innerHTML =
      '<div class="container" style="text-align:center;padding:3rem 0">' +
      '<h1 style="font-family:var(--font-heading)">' + tf('kiliRoutes.notFoundTitle', 'Route not found') + '</h1>' +
      '<p style="color:var(--text-muted);margin:1rem 0 1.5rem">' + tf('kiliRoutes.notFoundDesc', 'We couldn\'t find that Kilimanjaro route.') + '</p>' +
      '<a class="btn btn-primary" href="/kilimanjaro/routes" style="min-height:48px">' + tf('kiliRoutes.allRoutes', 'View all routes') + '</a>' +
      '</div>';
  }

  function renderRoute(container, route, all) {
    var related = all.filter(function (r) { return r.slug !== route.slug; }).slice(0, 3);

    var highlights = Array.isArray(route.highlights) && route.highlights.length
      ? '<div class="krd-highlights">' + route.highlights.map(function (h) { return '<span><i class="fas fa-map-pin"></i> ' + escapeHtml(h) + '</span>'; }).join('') + '</div>'
      : '';

    var stats =
      statBlock('kiliRoutes.statDays', 'Duration', route.days) +
      statBlock('kiliRoutes.statDifficulty', 'Difficulty', route.difficulty) +
      statBlock('kiliRoutes.statSuccess', 'Success rate', route.success) +
      statBlock('kiliRoutes.statScenery', 'Scenery', route.scenery) +
      statBlock('kiliRoutes.statAccommodation', 'Sleeping', route.accommodation) +
      statBlock('kiliRoutes.statBestFor', 'Best for', route.bestFor);

    container.innerHTML =
      '<div class="container" style="max-width:56rem">' +
      '<div class="corp-breadcrumb" style="margin-bottom:1rem">' +
      '<a href="/">' + tf('nav.home', 'Home') + '</a><span>/</span>' +
      '<a href="/kilimanjaro">' + tf('kiliRoutes.crumbKili', 'Kilimanjaro') + '</a><span>/</span>' +
      '<a href="/kilimanjaro/routes">' + tf('kiliRoutes.crumbRoutes', 'Routes') + '</a><span>/</span>' +
      '<span>' + escapeHtml(route.name) + '</span></div>' +

      '<h1 style="font-family:var(--font-heading);color:var(--earth-dark);margin:0 0 0.75rem">' + escapeHtml(route.name) + '</h1>' +
      '<p style="font-size:1.1rem;color:var(--text-secondary);line-height:1.7;margin:0 0 1.25rem">' + escapeHtml(route.summary || '') + '</p>' +

      '<div class="krd-hero"><img src="' + escapeHtml(route.image) + '" alt="' + escapeHtml(route.name) + '" ' +
      'onerror="this.src=\'/images/optimized/mount-kilimanjaro-national-park.webp\'"></div>' +

      (stats ? '<div class="krd-meta-grid">' + stats + '</div>' : '') +
      highlights +

      '<div class="krd-body">' + (route.html || route.bodyHtml || '') + '</div>' +

      '<div class="krd-cta">' +
      '<h3 style="font-family:var(--font-heading);margin:0 0 0.5rem">' + tf('kiliRoutes.ctaTitle', 'Ready to climb?') + '</h3>' +
      '<p style="color:var(--text-muted);margin:0 0 1.25rem">' + tf('kiliRoutes.ctaDesc', 'Get a free, private climb quote from our Arusha team.') + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center">' +
      '<a class="btn btn-primary" href="/booking" style="min-height:48px">' + tf('kiliRoutes.ctaBook', 'Get a climb quote') + '</a>' +
      '<a class="btn btn-outline" href="/kilimanjaro" style="min-height:48px">' + tf('kiliRoutes.ctaKili', 'Kilimanjaro packages') + '</a>' +
      '<a class="btn btn-outline" href="/safaris/9-day-mount-meru-northern-tanzania-safari" style="min-height:48px">' + tf('kiliRoutes.ctaMeruSafari', 'Meru + safari combo') + '</a>' +
      '</div></div>' +

      (related.length
        ? '<h2 style="font-family:var(--font-heading);color:var(--earth-dark);margin:2.75rem 0 0.5rem">' + tf('kiliRoutes.relatedTitle', 'Other Kilimanjaro routes') + '</h2>' +
          '<div class="krd-related-grid">' + related.map(relatedCard).join('') + '</div>'
        : '') +
      '</div>';
  }

  async function init() {
    var container = document.getElementById('routeContainer');
    if (!container) return;

    try { if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready; } catch (_) {}

    var all = window.TSM_KiliRoutes && Array.isArray(window.TSM_KiliRoutes.ROUTES)
      ? window.TSM_KiliRoutes.ROUTES
      : [];

    var slug = slugFromPath();
    var route = findRoute(all, slug);

    if (!route) {
      renderNotFound(container);
      return;
    }

    var localized = route;
    if (window.TSM_routeI18n && typeof window.TSM_routeI18n.localizeRoute === 'function') {
      try { localized = await window.TSM_routeI18n.localizeRoute(route); } catch (_) { localized = route; }
    }

    applySeo(localized);
    renderRoute(container, localized, all);

    if (window.TSM_i18n && typeof window.TSM_i18n.applyTranslations === 'function') {
      window.TSM_i18n.applyTranslations(container);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
