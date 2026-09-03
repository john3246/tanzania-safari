/**
 * Kilimanjaro route detail — safari-detail-style layout
 * Hero + gallery + tabs + sticky booking sidebar
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
    var exact = all.filter(function (r) { return r.slug === slug; })[0];
    if (exact) return exact;
    var withSuffix = all.filter(function (r) { return r.slug === slug + '-route'; })[0];
    if (withSuffix) return withSuffix;
    return all.filter(function (r) {
      return r.slug.replace(/-route$/, '') === slug.replace(/-route$/, '');
    })[0] || null;
  }

  function bookingUrl(route) {
    var interest = route.bookingInterest || ('Kilimanjaro ' + route.name + ' Climb');
    return (
      '/booking?route=' +
      encodeURIComponent(route.slug) +
      '&interest=' +
      encodeURIComponent(interest) +
      '&name=' +
      encodeURIComponent(interest)
    );
  }

  function waUrl(route) {
    return (
      'https://wa.me/255695108009?text=' +
      encodeURIComponent("Hi Tanzania Safari Magic, I'd like a quote for the " + (route.bookingInterest || route.name) + '.')
    );
  }

  function galleryImages(route) {
    var imgs = [];
    if (route.image) imgs.push(route.image);
    var n = 1;
    while (imgs.length < 4 && n <= 10) {
      var candidate = '/images/kilimanjaro/kilimanjaro%20(' + n + ').jpeg';
      if (imgs.indexOf(candidate) === -1) imgs.push(candidate);
      n += 1;
    }
    return imgs;
  }

  function applySeo(route) {
    var title = (route.meta_title || route.name) + '';
    if (title.indexOf('Tanzania Safari Magic') === -1) title += ' | Tanzania Safari Magic';
    document.title = title;
    var titleEl = document.getElementById('routePageTitle') || document.querySelector('title');
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

    if (window.SafariSEO && window.SafariSEO.injectJsonLd && window.SafariSEO.breadcrumbSchema) {
      window.SafariSEO.injectJsonLd(
        'route-breadcrumb-jsonld',
        window.SafariSEO.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Kilimanjaro', url: '/kilimanjaro' },
          { name: tf('kiliRoutes.crumbRoutes', 'Routes'), url: '/kilimanjaro/routes' },
          { name: route.name, url: '/kilimanjaro/routes/' + route.slug }
        ])
      );
      if (Array.isArray(route.faqs) && route.faqs.length && window.SafariSEO.faqPageSchema) {
        window.SafariSEO.injectJsonLd('route-faq-jsonld', window.SafariSEO.faqPageSchema(route.faqs));
      }
    }
  }

  function bindTabs(root) {
    root.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        root.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        root.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = document.getElementById('tab-' + tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  function bindGallery(imgs) {
    var main = document.querySelector('#gallery .gallery-main img');
    var thumbs = document.querySelectorAll('#gallery .gallery-thumb');
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (tEl) { tEl.classList.remove('active'); });
        thumb.classList.add('active');
        if (main) main.src = imgs[i];
      });
    });
  }

  function metaRow(icon, label, value) {
    if (!value) return '';
    return (
      '<div class="detail-meta-row">' +
      '<span class="detail-meta-label"><i class="fas ' + icon + '"></i> ' + escapeHtml(label) + '</span>' +
      '<span class="detail-meta-value">' + escapeHtml(value) + '</span></div>'
    );
  }

  function renderGallery(imgs, name) {
    var main = imgs[0];
    var thumbs = imgs
      .map(function (src, i) {
        return (
          '<div class="gallery-thumb' + (i === 0 ? ' active' : '') + '">' +
          '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(name) + ' photo ' + (i + 1) + '" loading="lazy" ' +
          'onerror="this.src=\'/images/optimized/mount-kilimanjaro-national-park.webp\'"></div>'
        );
      })
      .join('');
    document.getElementById('gallery').innerHTML =
      '<div class="gallery-main"><img src="' +
      escapeHtml(main) +
      '" alt="' +
      escapeHtml(name) +
      '" onerror="this.src=\'/images/optimized/mount-kilimanjaro-national-park.webp\'"></div>' +
      '<div class="gallery-thumbs">' +
      thumbs +
      '</div>';
    bindGallery(imgs);
  }

  function renderItinerary(days) {
    var el = document.getElementById('itineraryList');
    if (!el) return;
    if (!Array.isArray(days) || !days.length) {
      el.innerHTML = '<p style="color:var(--text-muted)">' + tf('kiliRoutes.emptyItinerary', 'Day-by-day details coming soon.') + '</p>';
      return;
    }
    el.innerHTML = days
      .map(function (d) {
        return (
          '<div class="itinerary-item">' +
          '<div class="itinerary-day">' + tf('detail.day', 'Day') + ' ' + escapeHtml(d.day) + '</div>' +
          '<div class="itinerary-title">' + escapeHtml(d.title || '') + '</div>' +
          '<div class="itinerary-desc">' + escapeHtml(d.description || '') + '</div>' +
          '<div class="itinerary-meta">' +
          (d.altitude ? '<span><i class="fas fa-mountain"></i> ' + escapeHtml(d.altitude) + '</span>' : '') +
          (d.hiking ? '<span><i class="fas fa-hiking"></i> ' + escapeHtml(d.hiking) + '</span>' : '') +
          '</div></div>'
        );
      })
      .join('');
  }

  function renderList(ulId, items, icon, empty) {
    var ul = document.getElementById(ulId);
    if (!ul) return;
    if (!Array.isArray(items) || !items.length) {
      ul.innerHTML = '<li><i class="fas ' + icon + '"></i> ' + escapeHtml(empty) + '</li>';
      return;
    }
    ul.innerHTML = items
      .map(function (item) {
        return '<li><i class="fas ' + icon + '"></i> ' + escapeHtml(item) + '</li>';
      })
      .join('');
  }

  function renderFaqs(faqs) {
    var el = document.getElementById('faqList');
    if (!el) return;
    if (!Array.isArray(faqs) || !faqs.length) {
      el.innerHTML = '<p style="color:var(--text-muted)">' + tf('kiliRoutes.emptyFaqs', 'FAQs coming soon.') + '</p>';
      return;
    }
    el.innerHTML = faqs
      .map(function (f) {
        return (
          '<div class="faq-item"><h4>' +
          escapeHtml(f.q) +
          '</h4><p>' +
          escapeHtml(f.a) +
          '</p></div>'
        );
      })
      .join('');
  }

  function renderRelated(all, current) {
    var related = all.filter(function (r) { return r.slug !== current.slug; });
    var section = document.getElementById('relatedSection');
    var grid = document.getElementById('relatedGrid');
    if (!section || !grid || !related.length) return;
    section.hidden = false;
    grid.innerHTML = related
      .map(function (r) {
        return (
          '<a href="/kilimanjaro/routes/' +
          encodeURIComponent(r.slug) +
          '" class="route-related-row">' +
          '<img src="' +
          escapeHtml(r.image) +
          '" alt="' +
          escapeHtml(r.name) +
          '" loading="lazy" onerror="this.src=\'/images/optimized/mount-kilimanjaro-national-park.webp\'">' +
          '<div class="b"><h4>' +
          escapeHtml(r.name) +
          '</h4><div class="meta">' +
          escapeHtml(r.days || '') +
          (r.difficulty ? ' · ' + escapeHtml(r.difficulty) : '') +
          '</div></div></a>'
        );
      })
      .join('');
  }

  function renderRoute(route, all) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('detailContent').style.display = 'block';

    document.getElementById('breadcrumbName').textContent = route.name;
    document.getElementById('heroTitle').textContent = route.name;
    document.getElementById('heroSummary').textContent = route.summary || '';
    var slide = document.getElementById('heroSlide');
    if (slide && route.image) slide.style.backgroundImage = "url('" + route.image + "')";

    var imgs = galleryImages(route);
    renderGallery(imgs, route.name);

    var chips = document.getElementById('routeHighlights');
    if (chips) {
      chips.innerHTML = (route.highlights || [])
        .map(function (h) {
          return '<span><i class="fas fa-check" style="color:var(--primary);margin-right:0.35rem"></i>' + escapeHtml(h) + '</span>';
        })
        .join('');
    }

    var pc = document.getElementById('prosCons');
    if (pc) {
      var pros = Array.isArray(route.pros) ? route.pros : [];
      var cons = Array.isArray(route.cons) ? route.cons : [];
      pc.innerHTML =
        (pros.length
          ? '<div class="pros-box"><h3><i class="fas fa-thumbs-up"></i> ' +
            tf('kiliRoutes.pros', 'Pros') +
            '</h3><ul>' +
            pros.map(function (p) { return '<li>' + escapeHtml(p) + '</li>'; }).join('') +
            '</ul></div>'
          : '') +
        (cons.length
          ? '<div class="cons-box"><h3><i class="fas fa-thumbs-down"></i> ' +
            tf('kiliRoutes.cons', 'Cons') +
            '</h3><ul>' +
            cons.map(function (c) { return '<li>' + escapeHtml(c) + '</li>'; }).join('') +
            '</ul></div>'
          : '');
    }

    document.getElementById('routeOverviewHtml').innerHTML = route.html || route.bodyHtml || '';

    renderItinerary(route.dayByDay);
    renderList('includesList', route.included, 'fa-check', tf('kiliRoutes.askIncludes', 'Ask Our Team for a full inclusion list'));
    renderList('excludesList', route.excluded, 'fa-times', tf('kiliRoutes.askExcludes', 'International flights & personal gear typically excluded'));
    renderFaqs(route.faqs);

    document.getElementById('sidebarTitle').textContent = route.name;
    document.getElementById('sidebarDays').textContent = (route.days || '') + (route.accommodation ? ' · ' + route.accommodation : '');
    // Keep sidebar facts short so related routes fit beside the content
    document.getElementById('sidebarMeta').innerHTML =
      metaRow('fa-calendar-alt', tf('kiliRoutes.statDays', 'Duration'), route.days) +
      metaRow('fa-mountain', tf('kiliRoutes.statDifficulty', 'Difficulty'), route.difficulty) +
      metaRow('fa-chart-line', tf('kiliRoutes.statSuccess', 'Success rate'), route.success) +
      metaRow('fa-eye', tf('kiliRoutes.statScenery', 'Scenery'), route.scenery) +
      metaRow('fa-campground', tf('kiliRoutes.statAccommodation', 'Sleeping'), route.accommodation) +
      metaRow('fa-route', tf('kiliRoutes.statDistance', 'Distance'), route.distance) +
      metaRow('fa-users', tf('kiliRoutes.statCrowd', 'Crowds'), route.crowdLevel) +
      metaRow('fa-lungs', tf('kiliRoutes.statAcclimatization', 'Acclimatization'), route.acclimatization);

    var book = bookingUrl(route);
    var wa = waUrl(route);
    var bookBtn = document.getElementById('bookBtn');
    var mobileBookBtn = document.getElementById('mobileBookBtn');
    var waBtn = document.getElementById('waBtn');
    if (bookBtn) bookBtn.href = book;
    if (mobileBookBtn) mobileBookBtn.href = book;
    if (typeof window.TSM_promoteMobileChrome === 'function') window.TSM_promoteMobileChrome();
    if (waBtn) waBtn.href = wa;
    document.getElementById('mobilePriceLabel').textContent = route.name + (route.days ? ' · ' + route.days : '');

    renderRelated(all, route);
    bindTabs(document.getElementById('detailContent'));
  }

  async function init() {
    try {
      if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
    } catch (_) {}

    var all =
      window.TSM_KiliRoutes && Array.isArray(window.TSM_KiliRoutes.ROUTES)
        ? window.TSM_KiliRoutes.ROUTES
        : [];
    var slug = slugFromPath();
    var route = findRoute(all, slug);

    if (!route) {
      document.getElementById('loadingState').style.display = 'none';
      document.getElementById('notFoundState').style.display = 'block';
      return;
    }

    var localized = route;
    if (window.TSM_routeI18n && typeof window.TSM_routeI18n.localizeRoute === 'function') {
      try {
        localized = await window.TSM_routeI18n.localizeRoute(route);
      } catch (_) {
        localized = route;
      }
    }
    // Keep structured arrays from English source if locale overlay omitted them
    ['dayByDay', 'faqs', 'pros', 'cons', 'included', 'excluded', 'highlights'].forEach(function (key) {
      if (!localized[key] && route[key]) localized[key] = route[key];
    });
    ['distance', 'altitudeMax', 'crowdLevel', 'acclimatization', 'summitNight', 'bookingInterest'].forEach(function (key) {
      if (!localized[key] && route[key]) localized[key] = route[key];
    });

    applySeo(localized);
    renderRoute(localized, all);

    if (window.TSM_i18n && typeof window.TSM_i18n.applyTranslations === 'function') {
      window.TSM_i18n.applyTranslations(document);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
