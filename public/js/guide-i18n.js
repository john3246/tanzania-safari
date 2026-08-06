/**
 * Guide localization — loads /locales/{lang}/guides/{slug}.json when available.
 * Falls back to English guide module META + contentHtml().
 */
(function (global) {
  'use strict';

  var cache = {};

  function lang() {
    if (global.TSM_i18n && typeof global.TSM_i18n.getLanguage === 'function') {
      return global.TSM_i18n.getLanguage() || 'en';
    }
    try {
      return localStorage.getItem('tsm_lang') || 'en';
    } catch (_) {
      return 'en';
    }
  }

  function t(key, vars) {
    if (global.TSM_i18n && typeof global.TSM_i18n.t === 'function') {
      return global.TSM_i18n.t(key, vars);
    }
    return key;
  }

  function fetchGuideLocale(slug, locale) {
    var key = locale + ':' + slug;
    if (cache[key]) return cache[key];
    cache[key] = fetch('/locales/' + locale + '/guides/' + encodeURIComponent(slug) + '.json?v=1')
      .then(function (res) {
        if (!res.ok) throw new Error('missing');
        return res.json();
      })
      .catch(function () {
        cache[key] = Promise.resolve(null);
        return null;
      });
    return cache[key];
  }

  /**
   * Merge English guide object with localized JSON overlay.
   * @param {object} guide - window.*Guide export
   * @returns {Promise<object>} guide-like object with localized META/contentHtml/FAQS
   */
  async function localizeGuide(guide) {
    if (!guide || !guide.META) return guide;
    var locale = lang();
    if (locale === 'en') return guide;

    var overlay = await fetchGuideLocale(guide.META.slug, locale);
    if (!overlay) return guide;

    var meta = Object.assign({}, guide.META, {
      title: overlay.title || guide.META.title,
      meta_title: overlay.meta_title || guide.META.meta_title,
      meta_description: overlay.meta_description || guide.META.meta_description,
      excerpt: overlay.excerpt || guide.META.excerpt,
      category_name: overlay.category_name || guide.META.category_name,
      keywords: overlay.keywords || guide.META.keywords
    });

    return {
      META: meta,
      AUTHOR: guide.AUTHOR || guide.TEAM,
      TEAM: guide.TEAM || guide.AUTHOR,
      FAQS: overlay.faqs || guide.FAQS || [],
      SLUGS: guide.SLUGS,
      matchesSlug: guide.matchesSlug,
      contentHtml: function () {
        return overlay.html || (typeof guide.contentHtml === 'function' ? guide.contentHtml() : '');
      }
    };
  }

  /**
   * Localize destination guide (same JSON shape, slug from META.canonicalPath or first SLUGS).
   */
  async function localizeDestinationGuide(guide, parkSlug) {
    if (!guide) return guide;
    var locale = lang();
    if (locale === 'en') return guide;

    var slug =
      (guide.META && guide.META.slug) ||
      parkSlug ||
      (guide.SLUGS && guide.SLUGS[0]) ||
      '';
    if (!slug) return guide;

    var candidates = ['dest-' + slug, slug].concat(guide.SLUGS || []);
    var overlay = null;
    for (var i = 0; i < candidates.length && !overlay; i++) {
      overlay = await fetchGuideLocale(candidates[i], locale);
    }
    if (!overlay) return guide;

    var meta = Object.assign({}, guide.META || {}, {
      title: overlay.title || (guide.META && guide.META.title),
      h1: overlay.h1 || overlay.title || (guide.META && guide.META.h1),
      meta_description: overlay.meta_description || (guide.META && guide.META.meta_description),
      keywords: overlay.keywords || (guide.META && guide.META.keywords)
    });

    return {
      META: meta,
      FAQS: overlay.faqs || guide.FAQS || [],
      SLUGS: guide.SLUGS,
      matchesSlug: guide.matchesSlug,
      contentHtml: function () {
        return overlay.html || (typeof guide.contentHtml === 'function' ? guide.contentHtml() : '');
      }
    };
  }

  global.TSM_guideI18n = {
    lang: lang,
    t: t,
    localizeGuide: localizeGuide,
    localizeDestinationGuide: localizeDestinationGuide,
    fetchGuideLocale: fetchGuideLocale
  };
})(typeof window !== 'undefined' ? window : this);
