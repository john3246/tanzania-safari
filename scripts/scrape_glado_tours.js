/**
 * Scrape all WooCommerce tour products from gladofafricasafari.com
 * Usage: node scripts/scrape_glado_tours.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE = 'https://gladofafricasafari.com';
const CATEGORIES = [
  { slug: 'exclusive-fly-in-safaris', name: 'Exclusive Fly-In Safaris', category_slug: 'safaris' },
  { slug: 'joining-group-safaris', name: 'Joining Group Safaris', category_slug: 'group-safaris' },
  { slug: 'migration-safaris', name: 'Migration Safaris', category_slug: 'migrations' },
  { slug: 'budget-safaris', name: 'Budget Safaris', category_slug: 'safaris' },
  { slug: 'hiking-trekking', name: 'Hiking & Trekking', category_slug: 'kilimanjaro' },
  { slug: 'day-trip-experience', name: 'Day Trip Experience', category_slug: 'safaris' },
  { slug: 'product-category/exclusive-fly-in-safaris', name: 'Exclusive Fly-In Safaris', category_slug: 'safaris' },
  { slug: 'product-category/joining-group-safaris', name: 'Joining Group Safaris', category_slug: 'group-safaris' },
  { slug: 'product-category/migration-safaris', name: 'Migration Safaris', category_slug: 'migrations' },
  { slug: 'product-category/budget-safaris', name: 'Budget Safaris', category_slug: 'safaris' },
  { slug: 'product-category/hiking-trekking', name: 'Hiking & Trekking', category_slug: 'kilimanjaro' },
  { slug: 'product-category/day-trip-experience', name: 'Day Trip Experience', category_slug: 'safaris' },
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : BASE + res.headers.location;
          return fetch(next).then(resolve, reject);
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, html: data, url }));
      }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => {
      req.destroy();
      reject(new Error('timeout ' + url));
    });
  });
}

function textClean(s) {
  return (s || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function productSlug(url) {
  const m = url.match(/\/product\/([^/#?]+)/i);
  return m ? m[1].replace(/\/$/, '') : '';
}

function parseDuration(title, text, itineraryLen) {
  const m = (title + ' ' + text).match(/(\d+)\s*[- ]?\s*Days?/i);
  if (m) return parseInt(m[1], 10);
  if (itineraryLen > 0) return itineraryLen;
  return 1;
}

function parsePrice($) {
  const texts = [];
  $(
    '.summary .price .woocommerce-Price-amount bdi, .summary .price .amount, .summary p.price, .ovabrw-product-price, .product_meta + .price, p.price'
  ).each((_, el) => texts.push(textClean($(el).text())));
  // data attributes sometimes hold raw price
  $('[data-product_price], [content]').each((_, el) => {
    const v = $(el).attr('data-product_price') || '';
    if (v) texts.push(v);
  });
  $('meta[property="product:price:amount"], meta[itemprop="price"]').each((_, el) => {
    texts.push($(el).attr('content') || '');
  });
  for (const t of texts) {
    const m = t.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    if (!m) continue;
    const n = parseFloat(m[1]);
    if (n >= 20 && n <= 50000) return n;
  }
  return null;
}

function extractOverview($) {
  const paragraphs = [];
  $('h2,h3').each((_, el) => {
    const t = textClean($(el).text());
    if (!/overview/i.test(t)) return;
    let sib = $(el).next();
    let g = 0;
    while (sib.length && g < 20) {
      g++;
      const tag = (sib.prop('tagName') || '').toLowerCase();
      const st = textClean(sib.text());
      if (/^h[1-6]$/.test(tag)) break;
      if (tag === 'ul' || tag === 'ol') break;
      if (tag === 'p' && st.length > 40) paragraphs.push(st);
      sib = sib.next();
    }
    return false;
  });

  // Many products put overview as paragraphs under title before Tour Highlights
  if (!paragraphs.length) {
    const $title = $('h2.ovabrw_title, .ovabrw_product_title, h1.product_title').first();
    let sib = $title.length ? $title.parent().next() : null;
    if (!sib || !sib.length) sib = $title.next();
    // Also check content area near top of product description
    $('.content-product-item, .ovabrw-product-content, .summary').find('p').each((_, p) => {
      const pt = textClean($(p).text());
      if (pt.length > 80 && pt.length < 2000 && !/cookie|subscribe|whatsapp|full name/i.test(pt)) {
        paragraphs.push(pt);
      }
    });
  }

  if (!paragraphs.length) {
    const meta = textClean($('meta[property="og:description"], meta[name="description"]').attr('content') || '');
    if (meta.length > 40) paragraphs.push(meta);
  }

  const short = textClean($('.woocommerce-product-details__short-description').text());
  if (short && short.length > 40) paragraphs.unshift(short);

  // Prefer longest unique overview paragraphs near top
  const uniq = [...new Set(paragraphs)].filter((p) => p.length > 40).slice(0, 4);
  return {
    overview: (uniq[0] || '').slice(0, 1200),
    detailed: uniq.join('\n\n').slice(0, 12000),
  };
}

function extractHighlights($) {
  const items = [];
  $('h2,h3').each((_, el) => {
    const t = textClean($(el).text());
    if (!/highlight/i.test(t)) return;
    const $ul = $(el).nextAll('ul').first().length
      ? $(el).nextAll('ul').first()
      : $(el).parent().find('ul').first();
    $ul.find('li').each((__, li) => {
      const it = textClean($(li).text());
      if (it && it.length > 2 && it.length < 400) items.push(it);
    });
    return false;
  });
  return [...new Set(items)].slice(0, 15);
}

function extractItinerary($) {
  const days = [];
  $('.item-tour-plan').each((_, el) => {
    const $el = $(el);
    const dayRaw = textClean($el.find('.tour-plan-day').first().text());
    const m = dayRaw.match(/(\d+)/);
    if (!m) return;
    const day = parseInt(m[1], 10);
    const title = textClean($el.find('.tour-plan-label').first().text()) || `Day ${day}`;
    const description = textClean($el.find('.tour-plan-description').first().text());
    if (!days.find((d) => d.day === day)) {
      days.push({
        day,
        title: title.slice(0, 200),
        description: description.slice(0, 4000),
      });
    }
  });

  if (!days.length) {
    $('h2,h3,h4,h5').each((_, el) => {
      const raw = textClean($(el).text());
      const m = raw.match(/^Day\s+(\d+)\s*[:.\-)–—]?\s*(.*)$/i);
      if (!m) return;
      const day = parseInt(m[1], 10);
      const title = textClean(m[2]) || `Day ${day}`;
      const parts = [];
      let sib = $(el).next();
      let g = 0;
      while (sib.length && g < 20) {
        g++;
        const tag = (sib.prop('tagName') || '').toLowerCase();
        const st = textClean(sib.text());
        if (/^h[1-6]$/.test(tag) && /^Day\s+\d+/i.test(st)) break;
        if (tag === 'p' && st.length > 15) parts.push(st);
        sib = sib.next();
      }
      if (!days.find((d) => d.day === day)) {
        days.push({ day, title: title.slice(0, 200), description: parts.join(' ').slice(0, 4000) });
      }
    });
  }

  days.sort((a, b) => a.day - b.day);
  return days;
}

function extractIncludedExcluded($) {
  const included = [];
  const excluded = [];

  $('.tour-included li, .item-tour-included').each((_, el) => {
    const t = textClean($(el).text());
    if (t && t.length > 2 && t.length < 400) included.push(t);
  });
  $('.tour-excluded li, .item-tour-excluded').each((_, el) => {
    const t = textClean($(el).text());
    if (t && t.length > 2 && t.length < 400) excluded.push(t);
  });

  return {
    included: [...new Set(included)].slice(0, 40),
    excluded: [...new Set(excluded)].slice(0, 40),
  };
}

function extractImages($) {
  const imgs = [];
  const push = (src) => {
    if (!src || src.startsWith('data:')) return;
    if (/logo|icon|avatar|flag|whatsapp|facebook|sprite|placeholder|woocommerce-placeholder/i.test(src)) return;
    let abs = src;
    if (src.startsWith('//')) abs = 'https:' + src;
    else if (src.startsWith('/')) abs = BASE + src;
    abs = abs.split('?')[0];
    if (!/\.(jpe?g|png|webp)/i.test(abs)) return;
    if (!imgs.includes(abs)) imgs.push(abs);
  };
  $('.woocommerce-product-gallery img, .wp-post-image').each((_, el) => {
    push($(el).attr('data-large_image') || $(el).attr('data-src') || $(el).attr('src'));
  });
  $('meta[property="og:image"]').each((_, el) => push($(el).attr('content')));
  $('img').each((_, el) => {
    push($(el).attr('data-src') || $(el).attr('src'));
  });
  return imgs.slice(0, 8);
}

function extractTitle($) {
  const candidates = [
    textClean($('h2.ovabrw_title, .ovabrw_product_title h2, h1.product_title, h1.entry-title, h1').first().text()),
    textClean($('meta[property="og:title"]').attr('content') || '').replace(/\s*[-|].*$/, ''),
    textClean($('title').text()).replace(/\s*[-|].*$/, ''),
  ];
  return candidates.find((t) => t && t.length > 3) || 'Untitled Tour';
}

function detectCategoryFromBreadcrumb($, fallback) {
  const crumbs = [];
  $('.woocommerce-breadcrumb a, .breadcrumb a, nav.breadcrumb a').each((_, a) => {
    crumbs.push(textClean($(a).text()).toLowerCase());
  });
  const joined = crumbs.join(' ');
  if (/migration/.test(joined)) return { name: 'Migration Safaris', category_slug: 'migrations' };
  if (/group|joining/.test(joined)) return { name: 'Joining Group Safaris', category_slug: 'group-safaris' };
  if (/fly.?in|exclusive/.test(joined)) return { name: 'Exclusive Fly-In Safaris', category_slug: 'safaris' };
  if (/budget/.test(joined)) return { name: 'Budget Safaris', category_slug: 'safaris' };
  if (/hiking|trekking|kilimanjaro|climb/.test(joined)) return { name: 'Hiking & Trekking', category_slug: 'kilimanjaro' };
  if (/day.?trip/.test(joined)) return { name: 'Day Trip Experience', category_slug: 'safaris' };
  return fallback;
}

async function collectProductLinks() {
  const found = new Map();
  for (const cat of CATEGORIES) {
    const url = `${BASE}/${cat.slug}/`;
    console.log('Category:', url);
    try {
      const { status, html } = await fetch(url);
      console.log('  status', status);
      if (status !== 200) continue;
      const $ = cheerio.load(html);
      $('a[href*="/product/"]').each((_, a) => {
        let href = ($(a).attr('href') || '').split('#')[0].split('?')[0];
        if (!href) return;
        if (href.startsWith('/')) href = BASE + href;
        if (!href.includes('/product/')) return;
        if (!href.endsWith('/')) href += '/';
        const slug = productSlug(href);
        if (!slug || slug === 'product') return;
        if (!found.has(href)) found.set(href, { ...cat });
      });
      console.log('  products so far:', found.size);
    } catch (e) {
      console.log('  error', e.message);
    }
  }

  // Also try shop / products sitemap-ish pages
  for (const extra of ['shop', 'products', 'tour', 'safari']) {
    try {
      const { status, html } = await fetch(`${BASE}/${extra}/`);
      if (status !== 200) continue;
      const $ = cheerio.load(html);
      $('a[href*="/product/"]').each((_, a) => {
        let href = ($(a).attr('href') || '').split('#')[0].split('?')[0];
        if (href.startsWith('/')) href = BASE + href;
        if (!href.includes('/product/')) return;
        if (!href.endsWith('/')) href += '/';
        if (!found.has(href)) {
          found.set(href, { name: 'Safaris', category_slug: 'safaris' });
        }
      });
    } catch (_) {}
  }

  return found;
}

async function scrapeTour(url, meta) {
  console.log('Tour:', url);
  const { status, html } = await fetch(url);
  if (status !== 200) {
    console.log('  fail', status);
    return null;
  }
  const $ = cheerio.load(html);
  const title = extractTitle($);
  const cat = detectCategoryFromBreadcrumb($, meta);
  const { overview, detailed } = extractOverview($);
  const highlights = extractHighlights($);
  const { included, excluded } = extractIncludedExcluded($);
  const itinerary = extractItinerary($);
  const images = extractImages($);
  const duration_days = parseDuration(title, overview + detailed, itinerary.length);
  const price = parsePrice($);
  const package_slug = productSlug(url);

  const result = {
    source_url: url,
    package_name: title,
    package_slug,
    category_name: cat.name,
    category_slug: cat.category_slug,
    short_description: overview,
    detailed_description: detailed || overview,
    duration_days,
    duration_nights: Math.max(0, duration_days - 1),
    base_price_usd: price,
    featured_image_url: images[0] || null,
    image_urls: images,
    highlights,
    included_features: included,
    excluded_features: excluded,
    itinerary,
    is_group_tour: cat.category_slug === 'group-safaris',
  };

  console.log(
    `  ok: days=${itinerary.length} high=${highlights.length} inc=${included.length} exc=${excluded.length} price=${price}`
  );
  return result;
}

async function main() {
  const links = await collectProductLinks();
  console.log('\nTotal unique products:', links.size);
  [...links.keys()].forEach((u) => console.log(' -', u));

  const tours = [];
  for (const [url, meta] of links) {
    try {
      const t = await scrapeTour(url, meta);
      if (t && t.package_name && t.package_slug) tours.push(t);
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      console.log('  scrape error', e.message);
    }
  }

  const out = path.join(__dirname, 'glado_tours_scraped.json');
  fs.writeFileSync(out, JSON.stringify(tours, null, 2), 'utf8');
  console.log('\nWrote', tours.length, 'tours to', out);
  const withItin = tours.filter((t) => t.itinerary.length).length;
  const withInc = tours.filter((t) => t.included_features.length).length;
  const withHigh = tours.filter((t) => t.highlights.length).length;
  const withOverview = tours.filter((t) => t.short_description.length > 40).length;
  console.log({ total: tours.length, withItin, withInc, withHigh, withOverview });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
