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
const { ensureGtagInHtml } = require('./gtag');

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
  robots = 'index, follow, max-image-preview:large, max-snippet:-1',
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

  // Ensure indexable pages advertise rich preview directives to crawlers.
  let robotsDirective = String(robots || 'index, follow');
  const isIndexable = /index/i.test(robotsDirective) && !/noindex/i.test(robotsDirective);
  if (isIndexable) {
    if (!/max-image-preview/i.test(robotsDirective)) robotsDirective += ', max-image-preview:large';
    if (!/max-snippet/i.test(robotsDirective)) robotsDirective += ', max-snippet:-1';
    if (!/max-video-preview/i.test(robotsDirective)) robotsDirective += ', max-video-preview:-1';
  }
  const googlebotDirective = isIndexable
    ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    : robotsDirective;

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

  const googleTags = buildGoogleTags();

  return `
<!-- SSR SEO -->
${googleTags.head}
<title id="pageTitle">${t}</title>
<meta id="metaDesc" name="description" content="${d}">
<meta name="robots" content="${escapeHtml(robotsDirective)}">
<meta name="googlebot" content="${escapeHtml(googlebotDirective)}">
<meta name="theme-color" content="#2d5a27">
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

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (Array.isArray(faqs) ? faqs : []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
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
    description:
      'Plan and book private Tanzania safaris, Serengeti Great Migration tours, Mount Kilimanjaro climbs and Zanzibar beach holidays with a licensed Arusha-based operator.',
    publisher: { '@id': SITE.url + '/#organization' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: SITE.url + '/safaris?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * TouristTrip + Product + Offer JSON-LD for a safari package (SSR + client reuse).
 */
function touristTripSchema(safari) {
  if (!safari || !safari.package_name) return null;
  const images = [];
  if (safari.featured_image_url) images.push(absoluteUrl(safari.featured_image_url));
  if (Array.isArray(safari.image_urls)) {
    safari.image_urls.forEach((u) => {
      if (u) images.push(absoluteUrl(u));
    });
  }
  if (!images.length) images.push(SITE.defaultImage);

  const days = parseInt(safari.duration_days, 10);
  const itinerary = Array.isArray(safari.itinerary) ? safari.itinerary : [];
  const price = Number(safari.base_price_usd || safari.price || 0);
  const slug = safari.package_slug || '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['TouristTrip', 'Product'],
    '@id': SITE.url + '/safaris/' + slug + '#trip',
    name: safari.package_name,
    description: truncate(stripHtml(safari.short_description || safari.detailed_description || ''), 300),
    image: images,
    url: SITE.url + '/safaris/' + slug,
    brand: { '@id': SITE.url + '/#organization' },
    provider: { '@id': SITE.url + '/#organization' },
    touristType: ['Safari travelers', 'Wildlife enthusiasts', 'Adventure travelers'],
    offers: {
      '@type': 'Offer',
      '@id': SITE.url + '/safaris/' + slug + '#offer',
      url: SITE.url + '/booking?package=' + encodeURIComponent(slug),
      priceCurrency: 'USD',
      price: price > 0 ? price : undefined,
      availability: 'https://schema.org/InStock',
      eligibleRegion: 'Worldwide',
      seller: { '@id': SITE.url + '/#organization' }
    }
  };

  if (days > 0) schema.duration = `P${days}D`;

  if (itinerary.length) {
    schema.itinerary = {
      '@type': 'ItemList',
      numberOfItems: itinerary.length,
      itemListElement: itinerary.map((day, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: day.title || `Day ${day.day || day.day_number || i + 1}`,
        description: truncate(stripHtml(day.description || ''), 200)
      }))
    };
  }

  if (Number(safari.avg_rating) > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(safari.avg_rating).toFixed(1),
      reviewCount: Number(safari.review_count || safari.reviews?.length || 1),
      bestRating: 5,
      worstRating: 1
    };
  }

  return schema;
}

/**
 * ItemList of TouristDestination entries.
 */
function touristDestinationItemListSchema(items) {
  const list = (Array.isArray(items) ? items : []).filter((it) => it && it.name);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: Object.assign(
        {
          '@type': 'TouristDestination',
          name: it.name,
          url: absoluteUrl(it.url)
        },
        it.description ? { description: truncate(stripHtml(it.description), 200) } : {},
        it.image ? { image: absoluteUrl(it.image) } : {}
      )
    }))
  };
}

/**
 * Google Analytics 4 / Google Tag Manager snippets (env-driven).
 */
function buildGoogleTags() {
  const gtm = (process.env.GTM_ID || process.env.GOOGLE_TAG_MANAGER_ID || '').trim();
  // Default to the site GA4 property so Google's install check always finds a tag
  const ga4 = (process.env.GA4_MEASUREMENT_ID || process.env.GOOGLE_ANALYTICS_ID || 'G-ZNT5VEXJ8F').trim();
  const ads = (process.env.GOOGLE_ADS_ID || '').trim();
  const parts = { head: '', body: '' };

  if (gtm) {
    parts.head = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${escapeHtml(gtm)}');</script>
<!-- End Google Tag Manager -->`;
    parts.body = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeHtml(gtm)}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
  } else if (ga4) {
    const configIds = [ga4, ads].filter(Boolean);
    parts.head = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(ga4)}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

${configIds.map((id) => `  gtag('config', '${escapeHtml(id)}');`).join('\n')}
</script>`;
  }

  return parts;
}

/**
 * FAQPage JSON-LD from [{ q, a }, ...]
 */
function faqPageSchema(faqs) {
  const list = (Array.isArray(faqs) ? faqs : []).filter((f) => f && f.q && f.a);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: stripHtml(f.q),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(f.a)
      }
    }))
  };
}

/**
 * TouristDestination JSON-LD for national park / destination pages.
 */
function touristDestinationSchema({ name, description, url, image, geo }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: name || 'Tanzania Destination',
    description: truncate(stripHtml(description), 300),
    url: absoluteUrl(url),
    image: absoluteUrl(image || SITE.defaultImage),
    touristType: ['Wildlife enthusiasts', 'Adventure travelers', 'Safari tourists'],
    isPartOf: {
      '@type': 'Country',
      name: 'Tanzania'
    },
    provider: { '@id': SITE.url + '/#organization' }
  };
  if (geo && (geo.lat != null || geo.latitude != null)) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.lat != null ? geo.lat : geo.latitude,
      longitude: geo.lng != null ? geo.lng : geo.longitude
    };
  }
  return schema;
}

/**
 * ItemList of TouristTrip entries from [{ name, url, image, description }, ...]
 */
function touristTripItemListSchema(items) {
  const list = (Array.isArray(items) ? items : []).filter((it) => it && it.name);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: Object.assign(
        {
          '@type': 'TouristTrip',
          name: it.name,
          url: absoluteUrl(it.url)
        },
        it.description ? { description: stripHtml(it.description) } : {},
        it.image ? { image: absoluteUrl(it.image) } : {}
      )
    }))
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '18:00'
      }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        email: SITE.email,
        contactType: 'customer service',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Italian', 'French', 'Spanish', 'German', 'Dutch', 'Swahili']
      }
    ],
    areaServed: [
      { '@type': 'Country', name: 'Tanzania' },
      { '@type': 'Continent', name: 'Africa' },
      { '@type': 'Place', name: 'Serengeti National Park' },
      { '@type': 'Place', name: 'Ngorongoro Conservation Area' },
      { '@type': 'Place', name: 'Mount Kilimanjaro' },
      { '@type': 'Place', name: 'Mount Meru' },
      { '@type': 'Place', name: 'Tarangire National Park' },
      { '@type': 'Place', name: 'Lake Manyara National Park' },
      { '@type': 'Place', name: 'Arusha National Park' },
      { '@type': 'Place', name: 'Zanzibar' },
      { '@type': 'Place', name: 'Arusha' },
      { '@type': 'Place', name: 'Kilimanjaro' },
      { '@type': 'AdministrativeArea', name: 'East Africa' }
    ],
    sameAs: [
      'https://facebook.com/tanzaniasafarimagic',
      'https://instagram.com/tanzaniasafarimagic',
      'https://twitter.com/tanzaniasafarimagic',
      'https://youtube.com/tanzaniasafarimagic',
      'https://wa.me/255695108009',
      'https://www.tripadvisor.com/Attraction_Review-g297913-d28075837-Reviews-Tanzania_Safari_Magic-Arusha_Arusha_Region.html',
      'https://maps.app.goo.gl/36osoUgbeghcvwE89'
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '48',
      bestRating: '5',
      worstRating: '1'
    },
    knowsAbout: [
      'Tanzania safari',
      'visit Tanzania',
      'Tanzania holidays',
      'Tanzania tourism',
      'Africa safari',
      'Serengeti National Park',
      'Serengeti migration',
      'Ngorongoro Crater',
      'Great Wildebeest Migration',
      'Mount Kilimanjaro',
      'climb Kilimanjaro',
      'Mount Meru',
      'Zanzibar beach',
      'Zanzibar beach holidays',
      'private safari Tanzania',
      'group safari Tanzania',
      'Private safari from Arusha'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tanzania Safari & Trekking Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tanzania Safari Packages',
            url: SITE.url + '/safaris'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mount Kilimanjaro Climbs',
            url: SITE.url + '/kilimanjaro'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Great Migration Safaris',
            url: SITE.url + '/migrations'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Zanzibar Beach Extensions',
            url: SITE.url + '/zanzibar'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Group & Shared Safaris',
            url: SITE.url + '/group-safaris'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Visit Tanzania Travel Planning',
            url: SITE.url + '/visit-tanzania'
          }
        }
      ]
    }
  };
}

/**
 * Replace inner HTML of the first element with id=markerId (depth-aware).
 */
function replaceElementInnerById(html, markerId, innerHtml) {
  const openRe = new RegExp(`(<([a-zA-Z0-9]+)([^>]*\\bid=["']${markerId}["'][^>]*)>)`, 'i');
  const m = openRe.exec(html);
  if (!m) return html;
  const openTag = m[1];
  const tagName = m[2];
  const startInner = m.index + openTag.length;
  let depth = 1;
  let i = startInner;
  const openTagRe = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const closeTagRe = new RegExp(`</${tagName}\\s*>`, 'gi');
  while (i < html.length && depth > 0) {
    openTagRe.lastIndex = i;
    closeTagRe.lastIndex = i;
    const nextOpen = openTagRe.exec(html);
    const nextClose = closeTagRe.exec(html);
    if (!nextClose) break;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      i = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      if (depth === 0) {
        return html.slice(0, startInner) + innerHtml + html.slice(nextClose.index);
      }
      i = nextClose.index + nextClose[0].length;
    }
  }
  return html;
}

/**
 * Replace entire element with id=markerId.
 */
function replaceElementById(html, markerId, replacement) {
  const openRe = new RegExp(`<([a-zA-Z0-9]+)([^>]*\\bid=["']${markerId}["'][^>]*)>`, 'i');
  const m = openRe.exec(html);
  if (!m) return html;
  const tagName = m[1];
  const start = m.index;
  let depth = 1;
  let i = start + m[0].length;
  const openTagRe = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const closeTagRe = new RegExp(`</${tagName}\\s*>`, 'gi');
  while (i < html.length && depth > 0) {
    openTagRe.lastIndex = i;
    closeTagRe.lastIndex = i;
    const nextOpen = openTagRe.exec(html);
    const nextClose = closeTagRe.exec(html);
    if (!nextClose) break;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      i = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      if (depth === 0) {
        return html.slice(0, start) + replacement + html.slice(nextClose.index + nextClose[0].length);
      }
      i = nextClose.index + nextClose[0].length;
    }
  }
  return html;
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

  // Google installation check requires the tag in raw HTML <head>
  out = ensureGtagInHtml(out);

  if (seo.h1) {
    out = out.replace(/>Loading[.…]*</gi, `>${escapeHtml(seo.h1)}<`);
    out = out.replace(/>Loading departure[.…]*</gi, `>${escapeHtml(seo.h1)}<`);
    out = out.replace(
      /(<h1[^>]*id=["']hubTitle["'][^>]*>)([\s\S]*?)(<\/h1>)/i,
      `$1${escapeHtml(seo.h1)}$3`
    );
    out = out.replace(
      /(<h1[^>]*id=["']heroTitle["'][^>]*>)([\s\S]*?)(<\/h1>)/i,
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

  // Replace marker containers with crawlable SSR HTML (packages, destinations, detail)
  if (seo.replaceHtml && typeof seo.replaceHtml === 'object') {
    Object.entries(seo.replaceHtml).forEach(([markerId, html]) => {
      if (html == null) return;
      out = replaceElementInnerById(out, markerId, html);
    });
  }

  // Full-block replacement (e.g. destination detail main)
  if (seo.replaceBlock && typeof seo.replaceBlock === 'object') {
    Object.entries(seo.replaceBlock).forEach(([markerId, html]) => {
      if (!html) return;
      out = replaceElementById(out, markerId, html);
    });
  }

  // Google Tag Manager noscript immediately after <body>
  const gtags = buildGoogleTags();
  if (gtags.body) {
    out = out.replace(/<body([^>]*)>/i, `<body$1>\n${gtags.body}`);
  }

  // Strip query strings from any remaining canonical tags for safety
  out = out.replace(
    /(<link[^>]+rel=["']canonical["'][^>]+href=["'])([^"']+)(["'])/gi,
    (_, a, href, c) => `${a}${String(href).split('?')[0]}${c}`
  );

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
  home: 'tanzania safari, visit tanzania, travel to tanzania, tanzania holidays, private tanzania safari, serengeti safari, ngorongoro crater, great wildebeest migration, serengeti migration, climb kilimanjaro, mount kilimanjaro, zanzibar beach, tanzania safari from arusha, safari packages tanzania, tanzania tourism, africa safari packages, best time to visit tanzania',
  safaris: 'tanzania safari packages, private safari tours tanzania, serengeti safari package, serengeti migration safari, ngorongoro safari, kilimanjaro trek packages, climb kilimanjaro, machame route, bush to beach tanzania, africa safari packages, tanzania safari cost, luxury tanzania safari',
  destinations: 'tanzania national parks, serengeti national park, ngorongoro conservation area, kilimanjaro national park, mount kilimanjaro, mount meru, tarangire, lake manyara, arusha national park, zanzibar, tanzania tourism destinations, places to visit in tanzania',
  blog: 'tanzania safari guide, tanzania travel guide, best time to visit tanzania, tanzania safari cost, great wildebeest migration, kilimanjaro trek guide, kilimanjaro climb cost, tanzania visa, zanzibar guide, serengeti guide, when to visit tanzania',
  group: 'group safari tanzania, shared safari tours, open group departure tanzania, affordable group safari, budget tanzania safari, group kilimanjaro climb, join a safari group tanzania',
  booking: 'book tanzania safari, climb kilimanjaro quote, safari quote arusha, inquire tanzania tour, private safari booking, kilimanjaro trek booking, tanzania safari free quote',
  kilimanjaro: 'kilimanjaro national park, climb kilimanjaro, mount kilimanjaro, kilimanjaro trek, kilimanjaro climb cost, machame route, lemosho route, marangu route, uhuru peak, africa highest mountain, kilimanjaro from arusha, best time to climb kilimanjaro',
  visitTanzania: 'visit tanzania, travel to tanzania, tanzania holidays, tanzania tourism, tanzania travel guide, africa safari packages, serengeti safari cost, when to visit tanzania, best time to visit tanzania, kilimanjaro climb cost, tanzania visa, tanzania vacation, things to do in tanzania, tanzania itinerary, how to plan a tanzania safari'
};

module.exports = {
  SITE,
  escapeHtml,
  absoluteUrl,
  truncate,
  stripHtml,
  buildHeadTags,
  buildGoogleTags,
  breadcrumbSchema,
  faqSchema,
  websiteSchema,
  organizationSchema,
  faqPageSchema,
  touristTripSchema,
  touristTripItemListSchema,
  touristDestinationSchema,
  touristDestinationItemListSchema,
  injectSeoIntoHtml,
  sendSeoHtml,
  resolveSeo,
  parseLangFromRequest,
  getPageSeo,
  KEYWORD_HUB,
  LOCALES,
  OG_LOCALE
};
