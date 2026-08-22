/**
 * Match itinerary days to lodges that have an official hotel website.
 * Data: /data/accommodations.json — properties without a formal site are omitted.
 */
(function (global) {
  'use strict';

  var data = { regions: [], properties: [] };
  var ready = fetch('/data/accommodations.json')
    .then(function (res) {
      if (!res.ok) throw new Error('accommodations.json');
      return res.json();
    })
    .then(function (json) {
      data = json || data;
      return data;
    })
    .catch(function () {
      return data;
    });

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function haystack(item) {
    return [item.title, item.description, item.accommodation, item.accommodation_type]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  function matchRegionId(item) {
    var text = haystack(item);
    var regions = data.regions || [];
    var i;
    var r;
    var k;
    for (i = 0; i < regions.length; i++) {
      r = regions[i];
      if (r.id === 'serengeti-central') continue;
      for (k = 0; k < (r.keywords || []).length; k++) {
        if (text.indexOf(r.keywords[k]) !== -1) return r.id;
      }
    }
    for (i = 0; i < regions.length; i++) {
      if (regions[i].id === 'serengeti-central' && text.indexOf('serengeti') !== -1) {
        return 'serengeti-central';
      }
    }
    return null;
  }

  function propertiesFor(regionId, limit) {
    var n = limit || 2;
    return (data.properties || [])
      .filter(function (p) {
        return p.region === regionId && p.officialWebsiteUrl;
      })
      .sort(function (a, b) {
        var ai = a.imageUrl ? 0 : 1;
        var bi = b.imageUrl ? 0 : 1;
        return ai - bi;
      })
      .slice(0, n);
  }

  function cardHtml(p) {
    var img = p.imageUrl
      ? '<div class="accom-card-media"><img src="' +
        escapeHtml(p.imageUrl) +
        '" alt="' +
        escapeHtml(p.name) +
        '" width="640" height="400" loading="lazy" decoding="async"></div>'
      : '';
    return (
      '<article class="accom-card">' +
      img +
      '<div class="accom-card-body">' +
      '<h4 class="accom-card-title">' +
      escapeHtml(p.name) +
      '</h4>' +
      (p.description ? '<p class="accom-card-desc">' + escapeHtml(p.description) + '</p>' : '') +
      '<a class="accom-card-link" href="' +
      escapeHtml(p.officialWebsiteUrl) +
      '" target="_blank" rel="noopener noreferrer">Visit ' +
      escapeHtml(p.name) +
      ' <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>' +
      '</div></article>'
    );
  }

  function cardsHtml(item) {
    var regionId = matchRegionId(item);
    if (!regionId) return '';
    var list = propertiesFor(regionId, 2);
    if (!list.length) return '';
    return (
      '<div class="accom-day-block" aria-label="Sample accommodation">' +
      '<p class="accom-day-label">Accommodation in this area</p>' +
      '<div class="accom-card-row">' +
      list.map(cardHtml).join('') +
      '</div></div>'
    );
  }

  global.TSM_ACCOM = {
    ready: ready,
    matchRegionId: matchRegionId,
    cardsHtml: cardsHtml
  };
})(typeof window !== 'undefined' ? window : global);
