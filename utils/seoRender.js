/**
 * Server-side SEO helpers — inject meta/JSON-LD into HTML before send
 * so Googlebot sees keywords without waiting for client JS.
 */
const fs = require('fs');
const path = require('path');
const {
  LOCALES,
  OG_LOCALE,
  getPageSeo,
  parseLangFromRequest,
  buildHreflangLinks,
  normalizeLang
} = require('./seoMeta');

/** Normalize SITE_URL — strip trailing slash and accidental markdown link wrappers */
function normalizeSiteUrl(raw) {
  let url = String(raw || 'https://tanzaniasafarimagic.com').trim();
  const md = url.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i);
  if (md) url = md[2];
  else {
    const bare = url.match(/https?:\/\/[^\s\]\)]+/i);
    if (bare && (url.includes('](') || url.startsWith('['))) url = bare[0];
  }
  return url.replace(/\/$/, '');
}

const SITE = {
  name: 'Tanzania Safari Magic',
  url: normalizeSiteUrl(process.env.SITE_URL),
  phone: '+255695108009',
  email: 'info@tanzaniasafarimagic.com',
  logo: 'https://tanzaniasafarimagic.com/images/logo.png',
  defaultImage: 'https://tanzaniasafarimagic.com/images/hero.jpg'
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(url) {
  if (!url) return SITE.defaultImage;
  if (String(url).startsWith('http')) return url;
  return SITE.url + (String(url).startsWith('/') ? url : '/' + url);
}

function truncate(str, n = 160) {
  return String(str || '').replace(/\s+/g, ' ').trim().slice(0, n);
}

function stripHtml(str) {
  return String(str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Build <head> injection block (title + metas + optional JSON-LD)
 */
function buildHeadTags({
  title,
  description,
  canonical,
  image,
  keywords,
  type = 'website',
  robots = 'index, follow',
  jsonLd = [],
  lang = 'en',
  hreflangPath,
  geoRegion = 'TZ',
  geoPlacename = 'Arusha, Tanzania'
}) {
  const locale = normalizeLang(lang);
  const t = escapeHtml((title || SITE.name).slice(0, 70));
  const d = escapeHtml(truncate(description, 160));
  const canon = escapeHtml(canonical || SITE.url);
  const img = escapeHtml(absoluteUrl(image));
  const kw = escapeHtml(keywords || '');
  const verification = [];
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    verification.push(`<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}">`);
  }
  if (process.env.BING_SITE_VERIFICATION) {
    verification.push(`<meta name="msvalidate.01" content="${escapeHtml(process.env.BING_SITE_VERIFICATION)}">`);
  }

  const pathForHref =
    hreflangPath != null
      ? hreflangPath
      : String(canonical || '')
          .replace(SITE.url, '')
          .split('?')[0] || '/';

  const hreflangs = buildHreflangLinks(pathForHref === '' ? '/' : pathForHref, SITE.url)
    .map((h) => `<link rel="alternate" hreflang="${escapeHtml(h.hreflang)}" href="${escapeHtml(h.href)}">`)
    .join('\n');

  const ogAlternates = LOCALES.filter((l) => l !== locale)
    .map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`)
    .join('\n');

  const ldObjects = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean).map((obj) => {
    if (obj && typeof obj === 'object' && !obj.inLanguage) {
      return Object.assign({}, obj, { inLanguage: locale });
    }
    return obj;
  });

  const ld = ldObjects
    .map((obj, i) => `<script type="application/ld+json" id="ssr-jsonld-${i}">${JSON.stringify(obj)}</script>`)
    .join('\n');

  return `
<!-- SSR SEO -->
<title id="pageTitle">${t}</title>
<meta id="metaDesc" name="description" content="${d}">
<meta name="robots" content="${escapeHtml(robots)}">
<meta name="language" content="${escapeHtml(locale)}">
<meta name="geo.region" content="${escapeHtml(geoRegion)}">
<meta name="geo.placename" content="${escapeHtml(geoPlacename)}">
<meta name="geo.position" content="-3.3869;36.6830">
<meta name="ICBM" content="-3.3869, 36.6830">
<meta name="author" content="Tanzania Safari Magic">
${kw ? `<meta name="keywords" content="${kw}">` : ''}
<link id="canonicalLink" rel="canonical" href="${canon}">
${hreflangs}
<meta property="og:type" content="${escapeHtml(type)}">
<meta property="og:site_name" content="${escapeHtml(SITE.name)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${OG_LOCALE[locale] || 'en_US'}">
${ogAlternates}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
${verification.join('\n')}
${ld}
<!-- /SSR SEO -->
`.trim();
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url)
    }))
  };
}

function websiteSchema(lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: normalizeLang(lang),
    potentialAction: {
      '@type': 'SearchAction',
      target: SITE.url + '/safaris?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'TouristInformationCenter', 'LocalBusiness'],
    '@id': SITE.url + '/#organization',
    name: SITE.name,
    url: SITE.url,
    logo: SITE.logo,
    image: SITE.defaultImage,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '$$-$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Arusha',
      addressLocality: 'Arusha',
      addressRegion: 'Arusha Region',
      addressCountry: 'TZ'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -3.3869,
      longitude: 36.6830
    },
    areaServed: [
      { '@type': 'Country', name: 'Tanzania' },
      { '@type': 'Place', name: 'Serengeti National Park' },
      { '@type': 'Place', name: 'Ngorongoro Conservation Area' },
      { '@type': 'Place', name: 'Mount Kilimanjaro' },
      { '@type': 'Place', name: 'Zanzibar' },
      { '@type': 'Place', name: 'Arusha' }
    ],
    sameAs: [
      'https://facebook.com/tanzaniasafarimagic',
      'https://instagram.com/tanzaniasafarimagic',
      'https://twitter.com/tanzaniasafarimagic',
      'https://youtube.com/tanzaniasafarimagic'
    ],
    knowsAbout: [
      'Tanzania safari',
      'Serengeti National Park',
      'Ngorongoro Crater',
      'Great Wildebeest Migration',
      'Mount Kilimanjaro',
      'Zanzibar beach holidays',
      'Private safari from Arusha'
    ]
  };
}

/**
 * Inject SEO tags into an HTML file string.
 */
function injectSeoIntoHtml(html, seo) {
  const block = buildHeadTags(seo);
  let out = html;
  const lang = normalizeLang(seo.lang || 'en');

  out = out.replace(/<html([^>]*)lang=["'][^"']*["']/i, `<html$1lang="${lang}"`);
  if (!/<html[^>]*lang=/i.test(out)) {
    out = out.replace(/<html/i, `<html lang="${lang}"`);
  }

  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/i, '');
  out = out.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+name=["']robots["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '');
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  out = out.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*>/gi, '');
  out = out.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${block}\n</head>`);
  } else {
    out = block + out;
  }

  if (seo.h1) {
    out = out.replace(/>Loading[.…]*</gi, `>${escapeHtml(seo.h1)}<`);
    out = out.replace(/>Loading departure[.…]*</gi, `>${escapeHtml(seo.h1)}<`);
    out = out.replace(
      /(<h1[^>]*id=["']hubTitle["'][^>]*>)([\s\S]*?)(<\/h1>)/i,
      `$1${escapeHtml(seo.h1)}$3`
    );
  }
  if (seo.eyebrow) {
    out = out.replace(
      /(<span[^>]*id=["']hubEyebrow["'][^>]*>)([\s\S]*?)(<\/span>)/i,
      `$1${escapeHtml(seo.eyebrow)}$3`
    );
  }
  if (seo.crumb) {
    out = out.replace(
      /(<span[^>]*id=["']hubCrumb["'][^>]*>)([\s\S]*?)(<\/span>)/i,
      `$1${escapeHtml(seo.crumb)}$3`
    );
  }

  return out;
}

function resolveSeo(seo = {}, req) {
  const lang = seo.lang || parseLangFromRequest(req);
  const pageKey = seo.pageKey;
  const localized = pageKey ? getPageSeo(pageKey, lang) : null;
  const pathOnly = (seo.canonical || SITE.url).replace(SITE.url, '').split('?')[0] || '/';

  return Object.assign({}, seo, {
    lang,
    title: seo.title || (localized && localized.title) || SITE.name,
    description: seo.description || (localized && localized.description) || '',
    keywords: seo.keywords || (localized && localized.keywords) || '',
    hreflangPath: seo.hreflangPath != null ? seo.hreflangPath : pathOnly
  });
}

function sendSeoHtml(res, viewRelativePath, seo, status = 200) {
  const req = res.req;
  const resolved = resolveSeo(seo, req);
  const filePath = path.join(__dirname, '..', 'views', viewRelativePath);
  let html = fs.readFileSync(filePath, 'utf8');
  html = injectSeoIntoHtml(html, resolved);

  if (resolved.lang && resolved.lang !== 'en') {
    res.setHeader('Set-Cookie', `tsm_lang=${resolved.lang}; Path=/; Max-Age=31536000; SameSite=Lax`);
  }

  res.status(status).type('html').set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600').send(html);
}

const KEYWORD_HUB = {
  home: 'tanzania safari, private tanzania safari, serengeti safari, ngorongoro crater, wildebeest migration, kilimanjaro climb, mount kilimanjaro, tanzania safari from arusha, safari packages tanzania, tanzania tourism, africa safari',
  safaris: 'tanzania safari packages, private safari tours tanzania, serengeti safari package, ngorongoro safari, kilimanjaro trek packages, climb kilimanjaro, machame route, bush to beach tanzania',
  destinations: 'tanzania national parks, serengeti national park, ngorongoro conservation area, kilimanjaro national park, mount kilimanjaro, tarangire, lake manyara, arusha national park, zanzibar, tanzania tourism destinations',
  blog: 'tanzania safari guide, best time to visit tanzania, tanzania safari cost, great wildebeest migration, kilimanjaro trek guide, zanzibar guide, serengeti guide',
  group: 'group safari tanzania, shared safari tours, open group departure tanzania, affordable group safari, group kilimanjaro climb',
  booking: 'book tanzania safari, climb kilimanjaro quote, safari quote arusha, inquire tanzania tour, private safari booking, kilimanjaro trek booking',
  kilimanjaro: 'kilimanjaro national park, climb kilimanjaro, mount kilimanjaro, kilimanjaro trek, machame route, lemosho route, marangu route, uhuru peak, africa highest mountain, kilimanjaro from arusha'
};

module.exports = {
  SITE,
  escapeHtml,
  absoluteUrl,
  truncate,
  stripHtml,
  buildHeadTags,
  breadcrumbSchema,
  websiteSchema,
  organizationSchema,
  injectSeoIntoHtml,
  sendSeoHtml,
  resolveSeo,
  parseLangFromRequest,
  getPageSeo,
  KEYWORD_HUB,
  LOCALES,
  OG_LOCALE
};
