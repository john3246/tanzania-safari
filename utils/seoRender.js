/**
 * Server-side SEO helpers — inject meta/JSON-LD into HTML before send
 * so Googlebot sees keywords without waiting for client JS.
 */
const fs = require('fs');
const path = require('path');

const SITE = {
  name: 'Tanzania Safari Magic',
  url: (process.env.SITE_URL || 'https://tanzaniasafarimagic.com').replace(/\/$/, ''),
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
  jsonLd = []
}) {
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

  const ld = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean)
    .map((obj, i) => `<script type="application/ld+json" id="ssr-jsonld-${i}">${JSON.stringify(obj)}</script>`)
    .join('\n');

  return `
<!-- SSR SEO -->
<title>${t}</title>
<meta name="description" content="${d}">
<meta name="robots" content="${escapeHtml(robots)}">
${kw ? `<meta name="keywords" content="${kw}">` : ''}
<link rel="canonical" href="${canon}">
<meta property="og:type" content="${escapeHtml(type)}">
<meta property="og:site_name" content="${escapeHtml(SITE.name)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${img}">
<meta property="og:locale" content="en_US">
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

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: SITE.url + '/safaris?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Inject SEO tags into an HTML file string.
 * Replaces existing <title>, description, canonical when present;
 * otherwise inserts before </head>.
 */
function injectSeoIntoHtml(html, seo) {
  const block = buildHeadTags(seo);
  let out = html;

  // Remove conflicting static tags so SSR wins for crawlers
  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/i, '');
  out = out.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+name=["']robots["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '');
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  out = out.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${block}\n</head>`);
  } else {
    out = block + out;
  }

  // Prefer meaningful H1 fallback for crawlers (replace Loading…)
  if (seo.h1) {
    out = out.replace(/>Loading[.…]*</gi, `>${escapeHtml(seo.h1)}<`);
    out = out.replace(/>Loading departure[.…]*</gi, `>${escapeHtml(seo.h1)}<`);
  }

  return out;
}

function sendSeoHtml(res, viewRelativePath, seo, status = 200) {
  const filePath = path.join(__dirname, '..', 'views', viewRelativePath);
  let html = fs.readFileSync(filePath, 'utf8');
  html = injectSeoIntoHtml(html, seo);
  res.status(status).type('html').set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600').send(html);
}

const KEYWORD_HUB = {
  home: 'tanzania safari, private tanzania safari, serengeti safari, ngorongoro crater, wildebeest migration, tanzania safari from arusha, safari packages tanzania',
  safaris: 'tanzania safari packages, private safari tours tanzania, serengeti safari package, ngorongoro safari, kilimanjaro trek packages, bush to beach tanzania',
  destinations: 'tanzania national parks, serengeti national park, ngorongoro conservation area, tarangire, lake manyara, arusha national park, zanzibar',
  blog: 'tanzania safari guide, best time to visit tanzania, tanzania safari cost, great wildebeest migration, zanzibar guide, serengeti guide',
  group: 'group safari tanzania, shared safari tours, open group departure tanzania, affordable group safari',
  booking: 'book tanzania safari, safari quote arusha, inquire tanzania tour, private safari booking'
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
  injectSeoIntoHtml,
  sendSeoHtml,
  KEYWORD_HUB
};
