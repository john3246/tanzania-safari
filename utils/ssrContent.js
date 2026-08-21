/**
 * Server-side crawlable content for packages & destinations.
 * Fetches from DB safely and returns HTML fragments + schema-ready items
 * so Googlebot sees real links/copy before client JS hydrates.
 */
const { escapeHtml, absoluteUrl, truncate, stripHtml, SITE } = require('./seoRender');

function safeImg(url, fallback = '/images/optimized/balloon.webp') {
  if (!url) return fallback;
  const s = String(url);
  if (s.startsWith('http') || s.startsWith('/')) return s;
  return '/' + s;
}

function altFor(name, suffix = 'Tanzania Safari Magic') {
  const base = stripHtml(name || 'Tanzania safari').trim();
  return `${base} - ${suffix}`;
}

async function withDb(fn, fallback) {
  try {
    const db = require('../config/db');
    return await fn(db);
  } catch (err) {
    console.warn('[ssrContent]', err.message);
    return fallback;
  }
}

async function fetchFeaturedPackages(limit = 6) {
  return withDb(async (db) => {
    const r = await db.query(
      `SELECT sp.package_id, sp.package_name, sp.package_slug, sp.short_description,
              sp.featured_image_url, sp.duration_days, sp.base_price_usd,
              COALESCE(AVG(r.rating), 0) AS avg_rating,
              COUNT(DISTINCT r.review_id) AS review_count
       FROM safari_packages sp
       LEFT JOIN reviews r ON r.package_id = sp.package_id AND r.is_approved = true
       WHERE sp.is_active = true
       GROUP BY sp.package_id
       ORDER BY RANDOM()
       LIMIT $1`,
      [limit]
    );
    return r.rows || [];
  }, []);
}

async function fetchPackages(limit = 24) {
  return withDb(async (db) => {
    const r = await db.query(
      `SELECT sp.package_id, sp.package_name, sp.package_slug, sp.short_description,
              sp.featured_image_url, sp.duration_days, sp.base_price_usd,
              COALESCE(AVG(r.rating), 0) AS avg_rating,
              COUNT(DISTINCT r.review_id) AS review_count
       FROM safari_packages sp
       LEFT JOIN reviews r ON r.package_id = sp.package_id AND r.is_approved = true
       WHERE sp.is_active = true
       GROUP BY sp.package_id
       ORDER BY sp.is_featured DESC NULLS LAST, sp.package_name ASC
       LIMIT $1`,
      [limit]
    );
    return r.rows || [];
  }, []);
}

async function fetchDestinations(limit = 24) {
  return withDb(async (db) => {
    const r = await db.query(
      `SELECT park_id, park_name, park_slug, short_description, featured_image_url
       FROM national_parks
       ORDER BY park_name ASC
       LIMIT $1`,
      [limit]
    );
    return r.rows || [];
  }, []);
}

async function fetchPackageBySlug(slug) {
  return withDb(async (db) => {
    let r;
    try {
      r = await db.query(
        `SELECT sp.package_id, sp.package_name, sp.package_slug, sp.short_description, sp.detailed_description,
                sp.featured_image_url, sp.duration_days, sp.base_price_usd, sp.meta_title, sp.meta_description,
                sp.difficulty_level, sp.max_group_size, sp.included_features, sp.excluded_features,
                COALESCE(AVG(rev.rating), 0) AS avg_rating,
                COUNT(DISTINCT rev.review_id) AS review_count
         FROM safari_packages sp
         LEFT JOIN reviews rev ON rev.package_id = sp.package_id AND rev.is_approved = true
         WHERE sp.package_slug = $1 AND sp.is_active = true
         GROUP BY sp.package_id
         LIMIT 1`,
        [slug]
      );
    } catch (_) {
      r = await db.query(
        `SELECT sp.package_id, sp.package_name, sp.package_slug, sp.short_description, sp.detailed_description,
                sp.featured_image_url, sp.duration_days, sp.base_price_usd, sp.meta_title, sp.meta_description,
                sp.difficulty_level, sp.max_group_size,
                COALESCE(AVG(rev.rating), 0) AS avg_rating,
                COUNT(DISTINCT rev.review_id) AS review_count
         FROM safari_packages sp
         LEFT JOIN reviews rev ON rev.package_id = sp.package_id AND rev.is_approved = true
         WHERE sp.package_slug = $1 AND sp.is_active = true
         GROUP BY sp.package_id
         LIMIT 1`,
        [slug]
      );
    }
    const pkg = r.rows[0];
    if (!pkg) return null;
    const [itin, dests] = await Promise.all([
      db.query(
        `SELECT day_number AS day, day_title AS title, day_description AS description
         FROM package_itinerary WHERE package_id = $1 ORDER BY day_number ASC`,
        [pkg.package_id]
      ),
      db.query(
        `SELECT np.park_name, np.park_slug
         FROM package_destinations pd
         JOIN national_parks np ON np.park_id = pd.park_id
         WHERE pd.package_id = $1`,
        [pkg.package_id]
      ).catch(() => ({ rows: [] }))
    ]);
    return {
      ...pkg,
      itinerary: itin.rows || [],
      destinations: dests.rows || []
    };
  }, null);
}

async function fetchDestinationBySlug(slug) {
  return withDb(async (db) => {
    const r = await db.query(
      `SELECT park_id, park_name, park_slug, short_description, detailed_description,
              featured_image_url, meta_title, meta_description
       FROM national_parks
       WHERE park_slug = $1
       LIMIT 1`,
      [slug]
    );
    return r.rows[0] || null;
  }, null);
}

function packageCardHtml(p) {
  const name = p.package_name || 'Tanzania Safari';
  const slug = p.package_slug || '';
  const img = safeImg(p.featured_image_url, '/images/optimized/serengeti-national-park.webp');
  const days = p.duration_days ? `${p.duration_days} days` : '';
  const price = p.base_price_usd != null ? `From $${Number(p.base_price_usd).toLocaleString()}` : 'Request quote';
  const desc = truncate(stripHtml(p.short_description || ''), 110);
  return `<article class="ssr-card safari-card">
  <a href="/safaris/${escapeHtml(slug)}" class="ssr-card-link">
    <img src="${escapeHtml(img)}" alt="${escapeHtml(altFor(name))}" width="640" height="400" loading="lazy" decoding="async">
    <div class="ssr-card-body">
      <h3>${escapeHtml(name)}</h3>
      ${days ? `<p class="ssr-meta">${escapeHtml(days)}</p>` : ''}
      ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
      <p class="ssr-price">${escapeHtml(price)} <span>per person</span></p>
    </div>
  </a>
</article>`;
}

function destinationCardHtml(d) {
  const name = d.park_name || d.name || 'Tanzania Destination';
  const slug = d.park_slug || d.slug || '';
  const img = safeImg(d.featured_image_url, '/images/optimized/balloon.webp');
  const desc = truncate(stripHtml(d.short_description || ''), 100);
  return `<article class="ssr-card dest-card">
  <a href="/destinations/${escapeHtml(slug)}" class="ssr-card-link">
    <img src="${escapeHtml(img)}" alt="${escapeHtml(altFor(name, 'Tanzania destination'))}" width="640" height="400" loading="lazy" decoding="async">
    <div class="ssr-card-body">
      <h3>${escapeHtml(name)}</h3>
      ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
    </div>
  </a>
</article>`;
}

function packageListHtml(packages) {
  if (!packages.length) {
    return `<p class="ssr-empty">Browse our <a href="/booking">booking form</a> for a custom Tanzania safari quote from Arusha.</p>`;
  }
  return packages.map(packageCardHtml).join('\n');
}

function destinationListHtml(destinations) {
  if (!destinations.length) {
    return `<p class="ssr-empty">Explore Tanzania parks with <a href="/contact">Our Team in Arusha</a>.</p>`;
  }
  return destinations.map(destinationCardHtml).join('\n');
}

function safariDetailSsrHtml(pkg) {
  if (!pkg) return '';
  const name = pkg.package_name || 'Tanzania Safari';
  const desc = stripHtml(pkg.short_description || pkg.detailed_description || '');
  const img = safeImg(pkg.featured_image_url, '/images/optimized/serengeti-national-park.webp');
  const days = pkg.duration_days ? `${pkg.duration_days}-day` : '';
  const price = pkg.base_price_usd != null ? `$${Number(pkg.base_price_usd).toLocaleString()} USD` : 'Custom quote';
  const itin = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const dests = Array.isArray(pkg.destinations) ? pkg.destinations : [];

  const itinHtml = itin.length
    ? `<ol class="ssr-itinerary">${itin
        .map(
          (d) =>
            `<li><h3>Day ${escapeHtml(d.day || '')}: ${escapeHtml(d.title || '')}</h3><p>${escapeHtml(truncate(stripHtml(d.description || ''), 220))}</p></li>`
        )
        .join('')}</ol>`
    : '';

  const destLinks = dests.length
    ? `<p><strong>Destinations:</strong> ${dests
        .map((d) => `<a href="/destinations/${escapeHtml(d.park_slug)}">${escapeHtml(d.park_name)}</a>`)
        .join(' · ')}</p>`
    : '';

  const included = Array.isArray(pkg.included_features) ? pkg.included_features.filter(Boolean) : [];
  const excluded = Array.isArray(pkg.excluded_features) ? pkg.excluded_features.filter(Boolean) : [];
  const includedHtml = included.length
    ? `<h2>What's included</h2><ul>${included.map((item) => `<li>${escapeHtml(stripHtml(item))}</li>`).join('')}</ul>`
    : '';
  const excludedHtml = excluded.length
    ? `<h2>What's not included</h2><ul>${excluded.map((item) => `<li>${escapeHtml(stripHtml(item))}</li>`).join('')}</ul>`
    : '';

  return `<div class="ssr-detail corp-panel" id="ssrPackageDetail" data-ssr="1">
  <img src="${escapeHtml(img)}" alt="${escapeHtml(altFor(name))}" width="1200" height="675" loading="eager" decoding="async" style="width:100%;max-height:380px;object-fit:cover;border-radius:4px;margin-bottom:1.25rem">
  <p class="ssr-lead">${escapeHtml(truncate(desc, 320))}</p>
  <p class="ssr-meta"><strong>${escapeHtml(days)}</strong> Tanzania safari · From <strong>${escapeHtml(price)}</strong> per person</p>
  ${destLinks}
  ${includedHtml}
  ${excludedHtml}
  ${itinHtml ? `<h2>Itinerary</h2>${itinHtml}` : ''}
  <p style="margin-top:1.5rem">
    <a class="btn btn-primary" href="/booking?package=${encodeURIComponent(pkg.package_slug || '')}" style="min-height:48px">Get a free quote</a>
    <a class="btn btn-outline" href="/safaris" style="min-height:48px;margin-left:0.5rem">All safari packages</a>
  </p>
  <p style="margin-top:1rem;font-size:0.92rem">Planning help: <a href="/blog/serengeti-safari-cost-2026">Serengeti safari cost 2026</a> · <a href="/blog/tanzania-safari-zanzibar-combo">Safari + Zanzibar combo</a> · <a href="/blog/great-wildebeest-migration">Great Migration months</a></p>
</div>`;
}

function destinationDetailSsrHtml(dest) {
  if (!dest) return '';
  const name = dest.park_name || 'Tanzania Destination';
  const desc = stripHtml(dest.short_description || dest.detailed_description || '');
  const img = safeImg(dest.featured_image_url, '/images/optimized/balloon.webp');
  // Keep id=destinationDetailContent so client JS can hydrate over this block
  return `<main id="destinationDetailContent" class="ssr-detail" data-ssr="1">
  <header class="corp-page-hero" style="min-height:280px;position:relative;margin-bottom:1.5rem">
    <div class="hero-slideshow"><div class="hero-slide active" style="background-image:url('${escapeHtml(img)}')" role="img" aria-label="${escapeHtml(altFor(name, 'Tanzania destination'))}"></div></div>
    <div class="corp-page-hero-inner"><div class="container">
      <div class="corp-breadcrumb"><a href="/">Home</a><span>/</span><a href="/destinations">Destinations</a><span>/</span><span>${escapeHtml(name)}</span></div>
      <h1 class="page-hero-title" style="color:#fff;margin:0">${escapeHtml(name)}</h1>
      <p style="max-width:40rem;margin:0.75rem 0 0;color:rgba(255,255,255,0.92)">${escapeHtml(truncate(desc, 180))}</p>
    </div></div>
  </header>
  <div class="container" style="padding-bottom:2rem">
    <div class="corp-panel">
      <h2>About ${escapeHtml(name)}</h2>
      <p>${escapeHtml(truncate(desc, 600))}</p>
      <p style="margin-top:1.25rem">
        <a class="btn btn-primary" href="/booking?interest=${encodeURIComponent(name)}" style="min-height:48px">Plan a safari here</a>
        <a class="btn btn-outline" href="/safaris" style="min-height:48px;margin-left:0.5rem">Browse safari packages</a>
      </p>
    </div>
  </div>
</main>`;
}

function toTripListItems(packages) {
  return (packages || []).map((p) => ({
    name: p.package_name,
    url: `/safaris/${p.package_slug}`,
    image: p.featured_image_url,
    description: p.short_description
  }));
}

function toDestinationListItems(destinations) {
  return (destinations || []).map((d) => ({
    name: d.park_name,
    url: `/destinations/${d.park_slug}`,
    image: d.featured_image_url,
    description: d.short_description
  }));
}

async function fetchReviewStats() {
  return withDb(async (db) => {
    const r = await db.query(
      `SELECT COUNT(*)::int AS "reviewCount",
              ROUND(AVG(rating)::numeric, 1) AS "ratingValue"
       FROM reviews
       WHERE is_approved = true AND rating BETWEEN 1 AND 5`
    );
    const row = r.rows[0] || {};
    return {
      reviewCount: Number(row.reviewCount || 0),
      ratingValue: Number(row.ratingValue || 0)
    };
  }, { reviewCount: 0, ratingValue: 0 });
}

async function fetchApprovedReviews(limit = 6) {
  return withDb(async (db) => {
    const r = await db.query(
      `SELECT first_name, last_name, rating, comment, review_comment, country
       FROM reviews
       WHERE is_approved = true
         AND rating BETWEEN 1 AND 5
         AND COALESCE(NULLIF(comment, ''), NULLIF(review_comment, '')) IS NOT NULL
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return r.rows || [];
  }, []);
}

module.exports = {
  fetchFeaturedPackages,
  fetchPackages,
  fetchDestinations,
  fetchPackageBySlug,
  fetchDestinationBySlug,
  fetchReviewStats,
  fetchApprovedReviews,
  packageListHtml,
  destinationListHtml,
  safariDetailSsrHtml,
  destinationDetailSsrHtml,
  toTripListItems,
  toDestinationListItems,
  altFor,
  SITE
};
