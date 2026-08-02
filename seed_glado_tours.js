/**
 * Idempotent seed of Glad of Africa tour packages into safari_packages.
 * Skips any package_slug that already exists (safe for Render restarts).
 *
 * Usage:
 *   node seed_glado_tours.js
 * Also invoked from run_migration.js on server startup.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./config/db');

const DATA_PATH = path.join(__dirname, 'scripts', 'glado_tours_scraped.json');

const EXTRA_CATEGORIES = [
  {
    category_name: 'Day Trips',
    category_slug: 'day-trips',
    category_description: 'One-day safari and cultural experiences',
    icon_class: 'fa-sun',
    display_order: 6,
  },
  {
    category_name: 'Fly-In Safaris',
    category_slug: 'fly-in',
    category_description: 'Exclusive fly-in safari experiences',
    icon_class: 'fa-plane',
    display_order: 7,
  },
  {
    category_name: 'Budget Safaris',
    category_slug: 'budget',
    category_description: 'Affordable safari packages',
    icon_class: 'fa-wallet',
    display_order: 8,
  },
];

function resolveCategorySlug(tour) {
  const title = `${tour.package_name || ''} ${tour.package_slug || ''}`.toLowerCase();
  const scraped = (tour.category_name || '').toLowerCase();

  if (/day-trip|day trip/.test(title) || tour.duration_days === 1) return 'day-trips';
  if (/\bgroup\b/.test(title) || /joining group/.test(scraped)) return 'group-safaris';
  if (/fly-in|fly-out|fly in|fly out/.test(title)) return 'fly-in';
  if (
    /migration|ndutu|calving|mara.?river|wildebeest|western.?serengeti|central.?serengeti|northern.?serengeti|black.?rhino/.test(
      title
    )
  ) {
    return 'migrations';
  }
  if (
    /kilimanjaro|mount.?meru|ol.?don|lengai|machame|marangu|lemosho/.test(title) ||
    (/\btrek\b|\bhiking\b/.test(title) && /meru|lengai|kili/.test(title))
  ) {
    return 'kilimanjaro';
  }
  if (/budget/.test(scraped) || /budget/.test(title)) return 'budget';
  if (/migration/.test(scraped)) return 'migrations';
  return 'safaris';
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

async function ensureCategories() {
  await db.query(`
    INSERT INTO package_categories (category_name, category_slug, category_description, icon_class, display_order, is_active)
    VALUES
      ('Classic Safaris', 'safaris', 'Private and classic northern-circuit safari tours', 'fa-binoculars', 1, true),
      ('Kilimanjaro', 'kilimanjaro', 'Kilimanjaro climbs and trek packages', 'fa-mountain', 2, true),
      ('Migration Safaris', 'migrations', 'Great Wildebeest Migration seasonal safaris', 'fa-paw', 3, true),
      ('Zanzibar', 'zanzibar', 'Zanzibar beach and island extensions', 'fa-umbrella-beach', 4, true),
      ('Group Safaris', 'group-safaris', 'Fixed-date shared group safaris', 'fa-users', 5, true)
    ON CONFLICT (category_slug) DO UPDATE SET is_active = true
  `);

  for (const c of EXTRA_CATEGORIES) {
    await db.query(
      `INSERT INTO package_categories (category_name, category_slug, category_description, icon_class, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (category_slug) DO UPDATE SET is_active = true`,
      [c.category_name, c.category_slug, c.category_description, c.icon_class, c.display_order]
    );
  }

  const rows = await db.query(`SELECT category_id, category_slug FROM package_categories`);
  const map = {};
  for (const r of rows.rows) map[r.category_slug] = r.category_id;
  return map;
}

async function insertItinerary(packageId, itinerary) {
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

async function seedGladoTours() {
  const tours = loadTours();
  if (!tours.length) {
    console.log('No Glado tours to seed.');
    return { inserted: 0, skipped: 0 };
  }

  console.log(`Seeding Glado tours (${tours.length} in data file)…`);
  const categories = await ensureCategories();

  let inserted = 0;
  let skipped = 0;

  for (const tour of tours) {
    const slug = String(tour.package_slug).toLowerCase().trim();
    const existing = await db.query(
      `SELECT package_id FROM safari_packages WHERE package_slug = $1 LIMIT 1`,
      [slug]
    );

    if (existing.rowCount > 0) {
      skipped += 1;
      console.log(`  skip (exists): ${slug}`);
      continue;
    }

    const categorySlug = resolveCategorySlug(tour);
    const categoryId = categories[categorySlug] || categories.safaris || null;
    const isGroup = categorySlug === 'group-safaris';
    const durationDays = Math.max(1, parseInt(tour.duration_days, 10) || tour.itinerary?.length || 1);
    const durationNights = Math.max(0, parseInt(tour.duration_nights, 10) || durationDays - 1);
    const highlights = Array.isArray(tour.highlights) ? tour.highlights : [];
    const included = Array.isArray(tour.included_features) ? tour.included_features : [];
    const excluded = Array.isArray(tour.excluded_features) ? tour.excluded_features : [];
    const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
    const images = Array.isArray(tour.image_urls) ? tour.image_urls.filter(Boolean) : [];
    const packageId = crypto.randomUUID();
    const price = tour.base_price_usd != null ? Number(tour.base_price_usd) : null;

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
        $16,$17,
        $18,false,true,$19,
        1,6,'Easy',
        $20,$21,$22
      )`,
      [
        packageId,
        tour.package_name.slice(0, 200),
        slug,
        categoryId,
        tour.short_description || '',
        tour.detailed_description || tour.short_description || '',
        durationDays,
        durationNights,
        price,
        tour.featured_image_url || images[0] || null,
        images,
        highlights,
        included,
        excluded,
        JSON.stringify(itinerary),
        included.length
          ? `<ul>${included.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
          : null,
        excluded.length
          ? `<ul>${excluded.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
          : null,
        isGroup,
        /^(migrations|fly-in)$/.test(categorySlug) && durationDays >= 6,
        tour.package_name.slice(0, 200),
        (tour.short_description || '').slice(0, 300),
        ['glado-import', categorySlug, slug],
      ]
    );

    await insertItinerary(packageId, itinerary);
    inserted += 1;
    console.log(`  inserted: ${slug} (${itinerary.length} days)`);
  }

  console.log(`Glado seed done. inserted=${inserted} skipped=${skipped}`);
  return { inserted, skipped };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
