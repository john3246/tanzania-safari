/**
 * Idempotent seed for Mount Meru trek packages from PDF itineraries.
 * Usage: node seed_meru_treks.js
 * Also invoked from run_migration.js on startup.
 */
const crypto = require('crypto');
const db = require('./config/db');
const { buildPackageImages } = require('./utils/localImages');

const KILI_IMGS = [
  '/images/kilimanjaro/kilimanjaro%20(1).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(2).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(3).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(4).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(5).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(6).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(7).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(8).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(9).jpeg',
  '/images/kilimanjaro/kilimanjaro%20(10).jpeg'
];

const TOURS = [
  {
    package_slug: '6-day-mount-meru-tarangire-ngorongoro',
    featured_image_url: '/images/optimized/4-day-mount-meru-trek.webp',
    gallery_lead: [
      '/images/optimized/4-day-mount-meru-trek.webp',
      '/images/optimized/arusha-national-park.webp',
      '/images/optimized/tarangire-national-park.webp',
      '/images/optimized/ngorongoro-conservation-area.webp'
    ],
    package_name: '6-Day Mount Meru Adventure, Tarangire & Ngorongoro Crater Safari',
    duration_days: 6,
    duration_nights: 5,
    base_price_usd: 2288,
    difficulty_level: 'Moderate',
    short_description:
      'Summit Mount Meru (4,566 m) over three trek days, then enjoy Tarangire elephants and a full Ngorongoro Crater game drive — guided from Arusha.',
    detailed_description:
      'This 6-day adventure pairs Tanzania’s second-highest peak with classic northern-circuit wildlife. Climb Mount Meru via Momella Gate with an armed ranger, overnight at Miriakamba and Saddle Huts, and aim for Socialist Peak at sunrise with Kilimanjaro views. After the descent, explore Tarangire National Park’s baobabs and elephants, then descend into UNESCO-listed Ngorongoro Crater for a Big Five–focused game drive before returning to Arusha or JRO.',
    highlights: [
      'Summit Mount Meru (Socialist Peak, 4,566 m)',
      'Guided trek through Arusha National Park rainforest',
      'Optional acclimatization hike to Little Meru',
      'Full-day Tarangire game drive',
      'Ngorongoro Crater picnic safari',
      'Private transfers from Arusha / JRO'
    ],
    included_features: [
      'Airport / hotel transfers in Arusha',
      'Mount Meru park fees, hut fees & armed ranger',
      'Mountain guide, cook & porters',
      'Meals as per itinerary on the mountain and safari',
      'Safari vehicle with pop-up roof for park days',
      'Tarangire & Ngorongoro park entry fees',
      'Bottled drinking water on game drives'
    ],
    excluded_features: [
      'International flights',
      'Travel insurance & personal equipment',
      'Tips for crew and guide',
      'Soft drinks & alcoholic beverages',
      'Optional activities not listed'
    ],
    park_slugs: [
      'arusha-national-park',
      'tarangire-national-park',
      'ngorongoro-conservation-area'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Arusha — Tour Briefing & Hiking Gear Check',
        description:
          'Meet at Kilimanjaro International Airport (JRO) or Arusha Airport (ARK) and transfer to your Arusha hotel. Later, your mountain guide briefs you on the Mount Meru route, safety, altitude awareness, and daily schedule, then inspects hiking gear (rentals available in Arusha if needed). Relax and prepare for the climb.'
      },
      {
        day: 2,
        title: 'Arusha to Miriakamba Hut (2,514 m)',
        description:
          'After breakfast, drive to Momella Gate in Arusha National Park for registration. Hike with an armed park ranger through lush rainforest — giraffes, buffalo, warthogs, monkeys, and birds are often seen — and continue to Miriakamba Hut for dinner and overnight.'
      },
      {
        day: 3,
        title: 'Miriakamba Hut to Saddle Hut (3,570 m)',
        description:
          'Climb through heath and moorland with views of Meru Crater and the Ash Cone. Arrive at Saddle Hut for lunch, then take an optional acclimatization hike to Little Meru (3,820 m) for panoramic sunset views. Return to Saddle Hut for dinner and overnight.'
      },
      {
        day: 4,
        title: 'Summit Mount Meru (4,566 m) — Return to Arusha',
        description:
          'Depart shortly after midnight for Socialist Peak (4,566 m). Reach the summit at sunrise for views of Mount Kilimanjaro, Meru Crater, and the Great Rift Valley. Descend via Saddle Hut to Momella Gate, then transfer back to Arusha for a well-earned rest.'
      },
      {
        day: 5,
        title: 'Arusha to Tarangire National Park',
        description:
          'Depart for Tarangire National Park — famous for elephants, baobabs, and rich birdlife. Enjoy a full-day game drive with picnic lunch in the park, searching for elephants, lions, leopards, giraffes, zebras, wildebeest, buffalo, and more. Overnight at your lodge.'
      },
      {
        day: 6,
        title: 'Ngorongoro Crater Safari — Return to Arusha',
        description:
          'Drive to the Ngorongoro Conservation Area and descend about 600 m into the crater for a memorable game drive. Spot lions, elephants, buffalo, hippos, hyenas, flamingos, and possibly black rhino. Picnic at the hippo pool, then ascend and return to Arusha or transfer to JRO for departure.'
      }
    ]
  },
  {
    package_slug: '9-day-mount-meru-northern-tanzania-safari',
    featured_image_url: '/images/kilimanjaro/kilimanjaro%20(6).jpeg',
    gallery_lead: [
      '/images/kilimanjaro/kilimanjaro%20(6).jpeg',
      '/images/optimized/serengeti-national-park.webp',
      '/images/kilimanjaro/kilimanjaro%20(3).jpeg',
      '/images/optimized/ngorongoro-conservation-area.webp',
      '/images/optimized/tarangire-national-park.webp'
    ],
    package_name: '9-Day Mount Meru Trek & Northern Tanzania Wildlife Safari',
    duration_days: 9,
    duration_nights: 8,
    base_price_usd: 3700,
    difficulty_level: 'Moderate',
    short_description:
      'Three-day Mount Meru summit trek plus a five-day northern safari through Tarangire, Serengeti, and Ngorongoro Crater — the perfect trek-and-wildlife combination from Arusha.',
    detailed_description:
      'Combine East Africa’s most scenic “practice peak” with Tanzania’s classic Northern Circuit. Summit Mount Meru (4,566 m) through rainforest, moorland, and alpine ridges inside Arusha National Park, then continue to Tarangire’s elephant country, the Serengeti plains (Big Five and seasonal Great Migration), the Ngorongoro Highlands, and a full crater game drive. Ideal for first-time Africa travellers, honeymoons, families, and adventure holidays seeking both altitude and wildlife.',
    highlights: [
      'Mount Meru summit (4,566 m) with Kilimanjaro views',
      'Arusha National Park wildlife on the trek approach',
      'Tarangire elephants & baobabs',
      'Serengeti full-day game drives',
      'Ngorongoro Highlands & Crater safari',
      'Balanced trek + safari itinerary from Arusha'
    ],
    included_features: [
      'Airport / hotel transfers in Arusha',
      'Mount Meru park fees, hut fees & armed ranger',
      'Mountain guide, cook & porters',
      'Meals as per itinerary',
      '4x4 safari vehicle with pop-up roof',
      'Park fees for Tarangire, Serengeti & Ngorongoro',
      'Bottled water on safari days'
    ],
    excluded_features: [
      'International flights',
      'Travel insurance & personal trekking gear',
      'Tips for mountain crew and safari guide',
      'Optional balloon safari in Serengeti',
      'Visas and personal expenses'
    ],
    park_slugs: [
      'arusha-national-park',
      'tarangire-national-park',
      'serengeti-national-park',
      'ngorongoro-conservation-area'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Arusha — Tour Briefing & Hiking Gear Check',
        description:
          'Welcome at JRO or ARK and transfer to your Arusha hotel. Meet your mountain guide for a full Mount Meru briefing covering the itinerary, safety, altitude, packing, and a gear inspection. Rent missing items in Arusha if needed. Evening at leisure.'
      },
      {
        day: 2,
        title: 'Arusha to Miriakamba Hut (Mount Meru)',
        description:
          'Transfer to Momella Gate for registration. Hike with an armed ranger through montane forest — giraffes, buffalo, monkeys, and birdlife are common — and continue to Miriakamba Hut for dinner and overnight.'
      },
      {
        day: 3,
        title: 'Miriakamba Hut to Saddle Hut',
        description:
          'Ascend through heathland and moorland with views of Meru Crater and Ash Cone. Lunch at Saddle Hut, then hike to Little Meru (3,820 m) for acclimatization and sunset views before overnight at the hut.'
      },
      {
        day: 4,
        title: 'Summit Mount Meru (4,566 m) — Return to Arusha',
        description:
          'Midnight start for Socialist Peak. Celebrate sunrise views of Kilimanjaro and Meru Crater, then descend via Saddle and Miriakamba Huts to Momella Gate. Transfer to your Arusha hotel.'
      },
      {
        day: 5,
        title: 'Arusha to Tarangire National Park',
        description:
          'Drive to Tarangire for game drives among baobabs and large elephant herds. Look for lions, giraffes, zebras, wildebeest, buffalo, and birds. Overnight at your lodge near or inside the park.'
      },
      {
        day: 6,
        title: 'Tarangire to Serengeti National Park',
        description:
          'Travel via the Ngorongoro Conservation Area toward Serengeti. Afternoon game drive across the plains — home to the Big Five and seasonal Great Migration herds.'
      },
      {
        day: 7,
        title: 'Full-Day Game Drive in Serengeti National Park',
        description:
          'Explore the Serengeti ecosystem all day. Search for lions, leopards, cheetahs, elephants, hyenas, giraffes, and vast herds of wildebeest and zebras. Picnic lunch in the bush.'
      },
      {
        day: 8,
        title: 'Serengeti to Ngorongoro Highlands',
        description:
          'Morning game drive in the Serengeti, then continue to the scenic Ngorongoro Highlands. Overnight at a lodge on or near the crater rim.'
      },
      {
        day: 9,
        title: 'Ngorongoro Crater Safari — Return to Arusha',
        description:
          'Descend into Ngorongoro Crater for a half-day game drive among high wildlife densities, including possible black rhino. Picnic near the hippo pool, then ascend and return to Arusha — end of your Mount Meru and northern Tanzania safari.'
      }
    ]
  }
];

async function ensureKilimanjaroCategory() {
  const found = await db.query(
    `SELECT category_id FROM package_categories WHERE category_slug = 'kilimanjaro' LIMIT 1`
  );
  if (found.rowCount) return found.rows[0].category_id;
  const inserted = await db.query(
    `INSERT INTO package_categories
       (category_name, category_slug, category_description, icon_class, display_order, is_active)
     VALUES ('Kilimanjaro', 'kilimanjaro', 'Kilimanjaro climbs and mountain treks', 'fa-mountain', 2, true)
     RETURNING category_id`
  );
  return inserted.rows[0].category_id;
}

async function loadParkIdMap() {
  const res = await db.query(`SELECT park_id, park_slug, park_name FROM national_parks`);
  const bySlug = {};
  for (const r of res.rows) bySlug[r.park_slug] = r.park_id;
  const aliases = {
    'arusha-national-park': ['arusha', 'arusha-np', 'mount-meru'],
    'tarangire-national-park': ['tarangire'],
    'serengeti-national-park': ['serengeti'],
    'ngorongoro-conservation-area': ['ngorongoro', 'ngorongoro-crater']
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
  for (const item of itinerary) {
    await db.query(
      `INSERT INTO package_itinerary (itinerary_id, package_id, day_number, day_title, day_description)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), packageId, item.day, item.title.slice(0, 200), item.description]
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

/** Keep each Meru tour on its own hero image even if park-folder padding repeats. */
function uniqueLeadGallery(featured, galleryUrls, fallback) {
  const rest = (galleryUrls?.length ? galleryUrls : fallback).filter((u) => u && u !== featured);
  return [featured, ...rest];
}

async function upsertTour(tour, categoryId, parkIdMap) {
  const slug = tour.package_slug;
  const featuredSeed = tour.featured_image_url || KILI_IMGS[0];
  const gallery = buildPackageImages({
    categorySlug: 'kilimanjaro',
    parkSlugs: tour.park_slugs,
    packageSlug: slug,
    featuredImageUrl: featuredSeed,
    imageUrls: [...(tour.gallery_lead || []), ...KILI_IMGS]
  });
  const featured = featuredSeed || gallery.featured_image_url || KILI_IMGS[0];
  const images = uniqueLeadGallery(featured, gallery.image_urls, KILI_IMGS);
  const inclusionsHtml = `<ul>${tour.included_features.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
  const exclusionsHtml = `<ul>${tour.excluded_features.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
  const metaTitle = `${tour.package_name} | Mount Meru Trek from Arusha`.slice(0, 70);
  const metaDescription = tour.short_description.slice(0, 160);
  const keywords = [
    'mount meru trek',
    'mount meru safari',
    'arusha national park',
    'tanzania mountain trek',
    ...tour.park_slugs.map((s) => s.replace(/-/g, ' '))
  ];

  const existing = await db.query(
    `SELECT package_id FROM safari_packages WHERE package_slug = $1 LIMIT 1`,
    [slug]
  );

  let packageId;
  if (existing.rowCount) {
    packageId = existing.rows[0].package_id;
    await db.query(
      `UPDATE safari_packages SET
        package_name = $1,
        category_id = $2,
        short_description = $3,
        detailed_description = $4,
        duration_days = $5,
        duration_nights = $6,
        base_price_usd = $7,
        featured_image_url = $8,
        image_urls = $9,
        highlights = $10,
        included_features = $11,
        excluded_features = $12,
        itinerary = $13::jsonb,
        inclusions_html = $14,
        exclusions_html = $15,
        is_group_tour = false,
        is_private = true,
        is_active = true,
        is_featured = true,
        difficulty_level = $16,
        minimum_pax = 1,
        maximum_pax = 6,
        meta_title = $17,
        meta_description = $18,
        meta_keywords = $19,
        updated_at = NOW()
      WHERE package_id = $20`,
      [
        tour.package_name.slice(0, 200),
        categoryId,
        tour.short_description,
        tour.detailed_description,
        tour.duration_days,
        tour.duration_nights,
        tour.base_price_usd,
        featured,
        images,
        tour.highlights,
        tour.included_features,
        tour.excluded_features,
        JSON.stringify(tour.itinerary),
        inclusionsHtml,
        exclusionsHtml,
        tour.difficulty_level,
        metaTitle,
        metaDescription,
        keywords,
        packageId
      ]
    );
    console.log(`  updated Meru package: ${slug}`);
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
        $16,$17,false,true,true,true,1,6,$18,$19,$20,$21
      )`,
      [
        packageId,
        tour.package_name.slice(0, 200),
        slug,
        categoryId,
        tour.short_description,
        tour.detailed_description,
        tour.duration_days,
        tour.duration_nights,
        tour.base_price_usd,
        featured,
        images,
        tour.highlights,
        tour.included_features,
        tour.excluded_features,
        JSON.stringify(tour.itinerary),
        inclusionsHtml,
        exclusionsHtml,
        tour.difficulty_level,
        metaTitle,
        metaDescription,
        keywords
      ]
    );
    console.log(`  inserted Meru package: ${slug}`);
  }

  await syncItinerary(packageId, tour.itinerary);
  await syncDestinations(packageId, tour.park_slugs, parkIdMap);
  return packageId;
}

async function seedMeruTreks() {
  console.log('Seeding Mount Meru trek packages…');
  const categoryId = await ensureKilimanjaroCategory();
  const parkIdMap = await loadParkIdMap();
  for (const tour of TOURS) {
    await upsertTour(tour, categoryId, parkIdMap);
  }
  console.log(`Meru seed done (${TOURS.length} packages).`);
  return { count: TOURS.length };
}

module.exports = seedMeruTreks;

if (require.main === module) {
  seedMeruTreks()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
