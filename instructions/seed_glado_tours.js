/**
 * Idempotent seed/enrichment of Glad of Africa tour packages.
 * - Maps every tour to a Safaris-nav hub category
 * - Links national parks via package_destinations (SEO internal links)
 * - Upserts content (insert new OR update existing by package_slug)
 *
 * Usage: node seed_glado_tours.js
 * Also invoked from run_migration.js on server startup.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/db');
const {
  buildPackageImages,
  buildDestinationImages,
  allParkSlugsWithLocalImages,
  imagesForParkSlug,
  uniqueLeadGallery,
} = require('../utils/localImages');

const DATA_PATH = path.join(__dirname, '..', 'scripts', 'glado_tours_scraped.json');

/** Nav-aligned hubs only (matches header Safaris dropdown). */
const NAV_CATEGORIES = [
  {
    category_name: 'Classic Safaris',
    category_slug: 'safaris',
    category_description: 'Private Tanzania safari packages from Arusha',
    icon_class: 'fa-binoculars',
    display_order: 1,
    hub_path: '/safaris',
  },
  {
    category_name: 'Kilimanjaro',
    category_slug: 'kilimanjaro',
    category_description: 'Kilimanjaro climbs and mountain treks',
    icon_class: 'fa-mountain',
    display_order: 2,
    hub_path: '/kilimanjaro',
  },
  {
    category_name: 'Migration Safaris',
    category_slug: 'migrations',
    category_description: 'Great Wildebeest Migration safaris',
    icon_class: 'fa-paw',
    display_order: 3,
    hub_path: '/migrations',
  },
  {
    category_name: 'Zanzibar',
    category_slug: 'zanzibar',
    category_description: 'Zanzibar beach holidays and bush-to-beach packages',
    icon_class: 'fa-umbrella-beach',
    display_order: 4,
    hub_path: '/zanzibar',
  },
  {
    category_name: 'Group Safaris',
    category_slug: 'group-safaris',
    category_description: 'Fixed-date shared group safaris',
    icon_class: 'fa-users',
    display_order: 5,
    hub_path: '/group-safaris',
  },
];

const HUB_PATH = Object.fromEntries(NAV_CATEGORIES.map((c) => [c.category_slug, c.hub_path]));

/** Canonical park slugs used on /destinations/:slug */
const PARK_RULES = [
  { re: /serengeti|mara.?river|ndutu|seronera|wildebeest/i, slug: 'serengeti-national-park' },
  { re: /ngorongoro|crater/i, slug: 'ngorongoro-conservation-area' },
  { re: /tarangire/i, slug: 'tarangire-national-park' },
  { re: /manyara/i, slug: 'lake-manyara-national-park' },
  { re: /arusha.?national|mount.?meru|meru.?trek|meru.?summit/i, slug: 'arusha-national-park' },
  {
    re: /kilimanjaro|machame|marangu|lemosho|materuni|chemka|uhuru/i,
    slug: 'mount-kilimanjaro-national-park',
  },
  { re: /zanzibar|nungwi|stone.?town|mnemba|mafia|chumbe|chole/i, slug: 'zanzibar' },
];

function resolveCategorySlug(tour) {
  const title = `${tour.package_name || ''} ${tour.package_slug || ''}`.toLowerCase();
  const days = Number(tour.duration_days) || 0;

  if (/\bgroup\b/.test(title)) return 'group-safaris';
  if (/fly-?in|fly.?out|charter/.test(title)) return 'fly-in';
  if (/\bbudget\b/.test(title)) return 'budget';
  if (days === 1 || /\bday.?trips?\b|\bone.?day\b|(^|[^0-9])1-day/.test(title)) return 'day-trips';
  if (/\bfamily\b/.test(title)) return 'family-safaris';
  if (/photo/.test(title)) return 'photography-tours';
  if (/cultural|maasai|hadzabe|datoga/.test(title)) return 'cultural-tours';

  if (
    /kilimanjaro|machame|marangu|lemosho|mount.?meru|ol.?don|lengai|uhuru/.test(title) &&
    !/wildebeest.?migration.?safari/.test(title)
  ) {
    // Pure mountain products → Kilimanjaro hub; combo with migration stays migrations below
    if (/serengeti|migration|ngorongoro|safari/.test(title) && /kilimanjaro|kili/.test(title)) {
      if (/migration|wildebeest/.test(title)) return 'migrations';
      return 'safaris';
    }
    return 'kilimanjaro';
  }

  if (/zanzibar/.test(title)) return 'zanzibar';

  if (
    /migration|ndutu|calving|mara.?river|wildebeest|western.?serengeti|central.?serengeti|northern.?serengeti|black.?rhino/.test(
      title
    )
  ) {
    return 'migrations';
  }

  if (/\bluxury\b/.test(title)) return 'luxury-safaris';

  return 'safaris';
}

function detectParkSlugs(tour) {
  const blob = [
    tour.package_name,
    tour.package_slug,
    tour.short_description,
    tour.detailed_description,
    ...(tour.highlights || []),
    ...(tour.itinerary || []).map((d) => `${d.title || ''} ${d.description || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  const found = [];
  for (const rule of PARK_RULES) {
    if (rule.re.test(blob) && !found.includes(rule.slug)) found.push(rule.slug);
  }
  return found;
}

function buildSeo(tour, categorySlug) {
  const name = tour.package_name || 'Tanzania Safari';
  const days = tour.duration_days ? `${tour.duration_days}-Day ` : '';
  const hub = HUB_PATH[categorySlug] || '/safaris';
  const parks = detectParkSlugs(tour);
  const parkLabels = parks
    .map((s) =>
      s
        .replace(/-national-park|-conservation-area/g, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .slice(0, 3);

  let metaTitle;
  if (categorySlug === 'migrations') {
    metaTitle = `${name} | Serengeti Migration Safari Tanzania`;
  } else if (categorySlug === 'kilimanjaro') {
    metaTitle = `${name} | Kilimanjaro Trek from Arusha`;
  } else if (categorySlug === 'zanzibar') {
    metaTitle = `${name} | Tanzania Safari & Zanzibar`;
  } else if (categorySlug === 'group-safaris') {
    metaTitle = `${name} | Group Safari Tanzania`;
  } else {
    metaTitle = `${days}${name} | Private Tanzania Safari`;
  }
  metaTitle = metaTitle.slice(0, 70);

  const overview = (tour.short_description || tour.detailed_description || '').replace(/\s+/g, ' ').trim();
  let metaDescription = overview.slice(0, 155);
  if (metaDescription.length < 80) {
    const where = parkLabels.length ? ` Visiting ${parkLabels.join(', ')}.` : '';
    metaDescription = `${days}${name} with expert guides from Arusha.${where} Free quote from Tanzania Safari Magic.`.slice(
      0,
      160
    );
  }

  const keywords = [
    'tanzania safari',
    name.toLowerCase(),
    categorySlug,
    ...parkLabels.map((p) => p.toLowerCase()),
    'arusha',
    'private safari',
    hub.replace('/', ''),
  ].filter(Boolean);

  return { metaTitle, metaDescription, keywords: [...new Set(keywords)].slice(0, 12), hub, parks };
}

function loadTours() {
  if (!fs.existsSync(DATA_PATH)) {
    console.warn('Glado tours data not found at', DATA_PATH);
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  if (!Array.isArray(raw)) return [];
  return raw.filter((t) => t && t.package_slug && t.package_name);
}

async function ensureCategory(c) {
  const found = await db.query(
    `SELECT category_id, category_slug FROM package_categories
     WHERE category_slug = $1 OR LOWER(category_name) = LOWER($2)
     LIMIT 1`,
    [c.category_slug, c.category_name]
  );

  if (found.rowCount > 0) {
    const row = found.rows[0];
    const slugTaken = await db.query(
      `SELECT category_id FROM package_categories
       WHERE category_slug = $1 AND category_id <> $2 LIMIT 1`,
      [c.category_slug, row.category_id]
    );
    const nextSlug = slugTaken.rowCount ? row.category_slug : c.category_slug;
    await db.query(
      `UPDATE package_categories SET
         category_description = COALESCE($1, category_description),
         icon_class = COALESCE($2, icon_class),
         display_order = COALESCE($3, display_order),
         category_slug = $4,
         is_active = true
       WHERE category_id = $5`,
      [c.category_description || null, c.icon_class || null, c.display_order ?? null, nextSlug, row.category_id]
    );
    return { category_id: row.category_id, category_slug: nextSlug };
  }

  try {
    const inserted = await db.query(
      `INSERT INTO package_categories
         (category_name, category_slug, category_description, icon_class, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING category_id, category_slug`,
      [c.category_name, c.category_slug, c.category_description, c.icon_class, c.display_order]
    );
    return inserted.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const again = await db.query(
        `SELECT category_id, category_slug FROM package_categories
         WHERE category_slug = $1 OR LOWER(category_name) = LOWER($2) LIMIT 1`,
        [c.category_slug, c.category_name]
      );
      if (again.rowCount) return again.rows[0];
    }
    throw err;
  }
}

async function ensureCategories() {
  const map = {};
  for (const c of NAV_CATEGORIES) {
    const row = await ensureCategory(c);
    map[c.category_slug] = row.category_id;
    map[row.category_slug] = row.category_id;
  }
  const rows = await db.query(`SELECT category_id, category_slug FROM package_categories`);
  for (const r of rows.rows) map[r.category_slug] = r.category_id;
  return map;
}

async function loadParkIdMap() {
  const res = await db.query(`SELECT park_id, park_slug, park_name FROM national_parks`);
  const bySlug = {};
  for (const r of res.rows) bySlug[r.park_slug] = r.park_id;

  // Fuzzy aliases if DB uses slightly different slugs
  const aliases = {
    'serengeti-national-park': ['serengeti', 'serengeti-np'],
    'ngorongoro-conservation-area': ['ngorongoro', 'ngorongoro-crater', 'ngorongoro-national-park'],
    'tarangire-national-park': ['tarangire', 'tarangire-np'],
    'lake-manyara-national-park': ['lake-manyara', 'manyara', 'manyara-national-park'],
    'arusha-national-park': ['arusha', 'arusha-np', 'mount-meru'],
    'mount-kilimanjaro-national-park': ['kilimanjaro', 'kilimanjaro-national-park', 'mt-kilimanjaro'],
    zanzibar: ['zanzibar-island', 'zanzibar-beaches'],
  };

  for (const r of res.rows) {
    const slug = (r.park_slug || '').toLowerCase();
    const name = (r.park_name || '').toLowerCase();
    for (const [canonical, alts] of Object.entries(aliases)) {
      if (slug === canonical || alts.includes(slug) || alts.some((a) => name.includes(a.replace(/-/g, ' ')))) {
        if (!bySlug[canonical]) bySlug[canonical] = r.park_id;
      }
    }
  }
  return bySlug;
}

async function syncDestinations(packageId, parkSlugs, parkIdMap) {
  await db.query(`DELETE FROM package_destinations WHERE package_id = $1`, [packageId]);
  let day = 1;
  for (const slug of parkSlugs) {
    const parkId = parkIdMap[slug];
    if (!parkId) {
      console.log(`    warn: park not in DB: ${slug}`);
      continue;
    }
    await db.query(
      `INSERT INTO package_destinations (mapping_id, package_id, park_id, visit_day, is_highlight)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), packageId, parkId, day, day === 1]
    );
    day += 1;
  }
}

async function syncItinerary(packageId, itinerary) {
  await db.query(`DELETE FROM package_itinerary WHERE package_id = $1`, [packageId]);
  if (!Array.isArray(itinerary) || !itinerary.length) return;
  for (let i = 0; i < itinerary.length; i++) {
    const item = itinerary[i];
    await db.query(
      `INSERT INTO package_itinerary (itinerary_id, package_id, day_number, day_title, day_description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        crypto.randomUUID(),
        packageId,
        item.day || item.day_number || i + 1,
        (item.title || `Day ${i + 1}`).slice(0, 200),
        item.description || '',
      ]
    );
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function packagePayload(tour, categoryId, categorySlug) {
  const durationDays = Math.max(1, parseInt(tour.duration_days, 10) || tour.itinerary?.length || 1);
  const durationNights = Math.max(0, parseInt(tour.duration_nights, 10) || durationDays - 1);
  const highlights = Array.isArray(tour.highlights) ? tour.highlights : [];
  const included = Array.isArray(tour.included_features) ? tour.included_features : [];
  const excluded = Array.isArray(tour.excluded_features) ? tour.excluded_features : [];
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const price = tour.base_price_usd != null ? Number(tour.base_price_usd) : null;
  const seo = buildSeo(tour, categorySlug);
  const isGroup = categorySlug === 'group-safaris';
  const gallery = buildPackageImages({
    categorySlug,
    parkSlugs: seo.parks,
    packageSlug: tour.package_slug,
    featuredImageUrl: tour.featured_image_url,
    imageUrls: tour.image_urls,
  });

  return {
    durationDays,
    durationNights,
    highlights,
    included,
    excluded,
    itinerary,
    images: gallery.image_urls,
    featuredImage: gallery.featured_image_url,
    price,
    seo,
    isGroup,
    isFeatured: categorySlug === 'migrations' || (categorySlug === 'kilimanjaro' && durationDays >= 6),
    categoryId,
    categorySlug,
    inclusionsHtml: included.length
      ? `<ul>${included.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
      : null,
    exclusionsHtml: excluded.length
      ? `<ul>${excluded.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
      : null,
  };
}

/** Fill national_parks.image_urls from public/images/{park} (+ destinations/optimized). */
async function seedDestinationImages(parkIdMap) {
  const slugs = allParkSlugsWithLocalImages();
  let updated = 0;
  for (const slug of slugs) {
    const gallery = buildDestinationImages(slug);
    if (!gallery.length) continue;
    const parkId = parkIdMap[slug];
    if (!parkId) {
      // Try direct slug match in DB even if not in alias map
      const res = await db.query(
        `UPDATE national_parks
         SET image_urls = $1
         WHERE park_slug = $2
         RETURNING park_id`,
        [gallery, slug]
      );
      if (res.rowCount) {
        updated += 1;
        console.log(`  destination images: ${slug} (${gallery.length})`);
      }
      continue;
    }
    await db.query(
      `UPDATE national_parks
       SET image_urls = $1
       WHERE park_id = $2`,
      [gallery, parkId]
    );
    updated += 1;
    console.log(`  destination images: ${slug} (${gallery.length})`);
  }
  return updated;
}

async function seedGladoTours() {
  const tours = loadTours();
  if (!tours.length) {
    console.log('No Glado tours to seed.');
    return { inserted: 0, updated: 0, skipped: 0 };
  }

  console.log(`Enriching Glado tours (${tours.length}) with nav categories + park links + local images…`);
  const categories = await ensureCategories();
  const parkIdMap = await loadParkIdMap();
  console.log(`  parks available: ${Object.keys(parkIdMap).length}`);

  try {
    const destImgCount = await seedDestinationImages(parkIdMap);
    console.log(`  destination galleries updated: ${destImgCount}`);
  } catch (e) {
    console.error('  destination image seed failed:', e.message);
  }

  let inserted = 0;
  let updated = 0;
  const zanCovers = imagesForParkSlug('zanzibar');
  let zanLead = 0;

  for (const tour of tours) {
    const slug = String(tour.package_slug).toLowerCase().trim();
    const categorySlug = resolveCategorySlug(tour);
    const categoryId = categories[categorySlug] || categories.safaris || null;
    const p = packagePayload(tour, categoryId, categorySlug);
    const parkSlugs = p.seo.parks;
    const isZanzibarTour =
      categorySlug === 'zanzibar' || /zanzibar/i.test(`${tour.package_name || ''} ${slug}`);
    if (isZanzibarTour && zanCovers.length) {
      const featuredSeed = zanCovers[zanLead++ % zanCovers.length];
      p.featuredImage = featuredSeed;
      p.images = uniqueLeadGallery(featuredSeed, p.images, zanCovers);
    }

    const existing = await db.query(
      `SELECT package_id FROM safari_packages WHERE package_slug = $1 LIMIT 1`,
      [slug]
    );

    let packageId;
    if (existing.rowCount > 0) {
      packageId = existing.rows[0].package_id;
      await db.query(
        `UPDATE safari_packages SET
          package_name = $1,
          category_id = $2,
          short_description = $3,
          detailed_description = $4,
          duration_days = $5,
          duration_nights = $6,
          base_price_usd = COALESCE($7, base_price_usd),
          featured_image_url = $8,
          image_urls = $9,
          highlights = $10,
          included_features = $11,
          excluded_features = $12,
          itinerary = $13::jsonb,
          inclusions_html = $14,
          exclusions_html = $15,
          is_group_tour = $16,
          is_private = false,
          is_active = true,
          is_featured = $17,
          minimum_pax = 1,
          maximum_pax = 6,
          meta_title = $18,
          meta_description = $19,
          meta_keywords = $20,
          updated_at = NOW()
        WHERE package_id = $21`,
        [
          tour.package_name.slice(0, 200),
          p.categoryId,
          tour.short_description || '',
          tour.detailed_description || tour.short_description || '',
          p.durationDays,
          p.durationNights,
          p.price,
          p.featuredImage,
          p.images,
          p.highlights,
          p.included,
          p.excluded,
          JSON.stringify(p.itinerary),
          p.inclusionsHtml,
          p.exclusionsHtml,
          p.isGroup,
          p.isFeatured,
          p.seo.metaTitle,
          p.seo.metaDescription,
          p.seo.keywords,
          packageId,
        ]
      );
      updated += 1;
      console.log(`  updated: ${slug} → ${categorySlug} parks=[${parkSlugs.join(',')}]`);
    } else {
      packageId = crypto.randomUUID();
      await db.query(
        `INSERT INTO safari_packages (
          package_id, package_name, package_slug, category_id,
          short_description, detailed_description,
          duration_days, duration_nights,
          base_price_usd, featured_image_url, image_urls,
          highlights, included_features, excluded_features, itinerary,
          inclusions_html, exclusions_html,
          is_group_tour, is_private, is_active, is_featured,
          minimum_pax, maximum_pax, difficulty_level,
          meta_title, meta_description, meta_keywords
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,
          $16,$17,$18,false,true,$19,1,6,'Easy',$20,$21,$22
        )`,
        [
          packageId,
          tour.package_name.slice(0, 200),
          slug,
          p.categoryId,
          tour.short_description || '',
          tour.detailed_description || tour.short_description || '',
          p.durationDays,
          p.durationNights,
          p.price,
          p.featuredImage,
          p.images,
          p.highlights,
          p.included,
          p.excluded,
          JSON.stringify(p.itinerary),
          p.inclusionsHtml,
          p.exclusionsHtml,
          p.isGroup,
          p.isFeatured,
          p.seo.metaTitle,
          p.seo.metaDescription,
          p.seo.keywords,
        ]
      );
      inserted += 1;
      console.log(`  inserted: ${slug} → ${categorySlug}`);
    }

    await syncItinerary(packageId, p.itinerary);
    await syncDestinations(packageId, parkSlugs, parkIdMap);
  }

  console.log(`Glado enrich done. inserted=${inserted} updated=${updated}`);
  return { inserted, updated, skipped: 0 };
}

module.exports = seedGladoTours;

if (require.main === module) {
  seedGladoTours()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
