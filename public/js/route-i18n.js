/**
 * Route localization — loads /locales/{lang}/routes/{slug}.json when available.
 * Falls back to the English route object from kilimanjaro-routes-data.js.
 *
 * Mirrors the pattern in guide-i18n.js: an overlay JSON merges localized
 * title/summary/html/meta fields onto the English route (or hub) object.
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

  function fetchRouteLocale(slug, locale) {
    var key = locale + ':' + slug;
    if (cache[key]) return cache[key];
    cache[key] = fetch('/locales/' + locale + '/routes/' + encodeURIComponent(slug) + '.json?v=1')
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
   * Merge an English route object with its localized JSON overlay.
   * @param {object} route - an entry from TSM_KiliRoutes.ROUTES
   * @returns {Promise<object>} route-like object with localized fields
   */
  async function localizeRoute(route) {
    if (!route || !route.slug) return route;
    var locale = lang();
    if (locale === 'en') return route;

    var overlay = await fetchRouteLocale(route.slug, locale);
    if (!overlay) return route;

    return Object.assign({}, route, {
      name: overlay.name || overlay.title || route.name,
      title: overlay.title || overlay.name || route.name,
      days: overlay.days || route.days,
      difficulty: overlay.difficulty || route.difficulty,
      success: overlay.success || route.success,
      scenery: overlay.scenery || route.scenery,
      accommodation: overlay.accommodation || route.accommodation,
      summary: overlay.summary || route.summary,
      bestFor: overlay.bestFor || route.bestFor,
      highlights: overlay.highlights || route.highlights,
      meta_title: overlay.meta_title || route.meta_title,
      meta_description: overlay.meta_description || route.meta_description,
      keywords: overlay.keywords || route.keywords,
      html: overlay.html || route.html,
      distance: overlay.distance || route.distance,
      altitudeMax: overlay.altitudeMax || route.altitudeMax,
      crowdLevel: overlay.crowdLevel || route.crowdLevel,
      acclimatization: overlay.acclimatization || route.acclimatization,
      summitNight: overlay.summitNight || route.summitNight,
      pros: overlay.pros || route.pros,
      cons: overlay.cons || route.cons,
      dayByDay: overlay.dayByDay || route.dayByDay,
      faqs: overlay.faqs || route.faqs,
      included: overlay.included || route.included,
      excluded: overlay.excluded || route.excluded,
      bookingInterest: overlay.bookingInterest || route.bookingInterest
    });
  }

  /**
   * Merge the English hub meta with its localized JSON overlay
   * (/locales/{lang}/routes/_hub.json).
   * @param {object} hubMeta - TSM_KiliRoutes.hubMeta
   * @returns {Promise<object>} hub-like object with localized fields
   */
  async function localizeHub(hubMeta) {
    if (!hubMeta) return hubMeta;
    var locale = lang();
    if (locale === 'en') return hubMeta;

    var overlay = await fetchRouteLocale('_hub', locale);
    if (!overlay) return hubMeta;

    return Object.assign({}, hubMeta, {
      title: overlay.title || hubMeta.title,
      meta_title: overlay.meta_title || hubMeta.meta_title,
      meta_description: overlay.meta_description || hubMeta.meta_description,
      keywords: overlay.keywords || hubMeta.keywords,
      leadHtml: overlay.leadHtml || overlay.html || hubMeta.leadHtml
    });
  }

  global.TSM_routeI18n = {
    lang: lang,
    t: t,
    localizeRoute: localizeRoute,
    localizeHub: localizeHub,
    fetchRouteLocale: fetchRouteLocale
  };
})(typeof window !== 'undefined' ? window : this);
