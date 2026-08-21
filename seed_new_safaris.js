/**
 * Idempotent seed for new Tanzania Safari Magic itineraries (PDFs in Tanzaniasafarimagic/).
 * Usage: node seed_new_safaris.js
 * Also invoked from run_migration.js on startup.
 */
const crypto = require('crypto');
const db = require('./config/db');

const EXP = '/images/experience';

const COMMON_INCLUDED = [
  'Airport pick-up and drop-off (JRO / ARK)',
  'Professional English-speaking safari guide',
  'Private 4x4 safari vehicle with pop-up roof',
  'Park and conservation fees as per itinerary',
  'Accommodation as listed (or similar)',
  'Meals as indicated on each day',
  'Bottled drinking water on game drives'
];

const COMMON_EXCLUDED = [
  'International and domestic flights',
  'Tanzania visa and travel insurance',
  'Tips and gratuities',
  'Alcoholic drinks and personal expenses',
  'Optional activities not listed'
];

const TOURS = [
  {
    package_slug: '6-day-tanzania-safari-cultural-tour',
    package_name: '6-Day Tanzania Safari & Cultural Tour',
    category_slug: 'safaris',
    is_featured: true,
    duration_days: 6,
    duration_nights: 5,
    base_price_usd: 2100,
    featured_image_url: `${EXP}/glad-of-africa-guides.webp`,
    image_urls: [
      `${EXP}/glad-of-africa-guides.webp`,
      `${EXP}/glad-of-africa-fleet.webp`,
      '/images/optimized/tarangire-national-park.webp',
      '/images/optimized/serengeti-national-park.webp',
      '/images/optimized/ngorongoro-conservation-area.webp'
    ],
    park_slugs: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-conservation-area', 'arusha-national-park'],
    short_description:
      'Six days combining Materuni waterfall and Chagga culture with Tarangire, Serengeti and Ngorongoro Crater — finishing with an Arusha city tour.',
    detailed_description:
      'Experience the best of northern Tanzania on a 6-day adventure combining culture, nature and wildlife. Discover Chagga culture and Materuni Waterfall, then explore Tarangire National Park, the Serengeti plains and Ngorongoro Crater. Finish with an Arusha city tour before your departure. Lodges are matched to each night’s location — mid-range and luxury options are confirmed on your quote.',
    highlights: [
      'Materuni Waterfall and Chagga coffee culture',
      'Tarangire elephants and baobabs',
      'Full-day Serengeti game drives',
      'Ngorongoro Crater Big Five safari',
      'Arusha city tour before departure'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Materuni Waterfalls & Chagga Cultural Tour to Arusha',
        accommodation: 'Overnight in Arusha',
        description:
          'Morning pick-up from your hotel in Arusha or Moshi, then drive to Materuni Village on the slopes of Kilimanjaro. Walk through coffee and banana plantations to Materuni Waterfall, enjoy a traditional Chagga lunch, and learn how local farmers roast and brew coffee. Continue to Arusha for dinner and overnight.'
      },
      {
        day: 2,
        title: 'Arusha to Tarangire National Park',
        accommodation: 'Overnight in the Tarangire / Karatu area',
        description:
          'After breakfast, drive to Tarangire National Park for game drives among elephant herds, baobabs, lions, giraffes, zebras and birdlife. Picnic lunch in the park, afternoon along the Tarangire River, then continue to your lodge or camp for dinner.'
      },
      {
        day: 3,
        title: 'Tarangire to Serengeti National Park',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Scenic transfer into Serengeti National Park with an afternoon game drive toward your lodge or tented camp. Look for lions, cheetahs, leopards, elephants and plains game as you enter the Seronera area.'
      },
      {
        day: 4,
        title: 'Full-Day Serengeti National Park Safari',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Full-day safari with picnic lunch. Early hours are excellent for predators; your guide searches different habitats and, in season, migrating herds. Return to camp for dinner.'
      },
      {
        day: 5,
        title: 'Ngorongoro Crater and Arusha',
        accommodation: 'Overnight in Arusha',
        description:
          'Drive to the Ngorongoro Conservation Area and descend into the crater for a game drive with a chance of black rhino. Picnic lunch on the crater floor, then ascend and continue to Arusha for dinner and overnight.'
      },
      {
        day: 6,
        title: 'Arusha City Tour and Departure',
        accommodation: 'Departure day',
        description:
          'Relaxed Arusha city tour — market, arts and crafts, optional Cultural Heritage Centre — then transfer to Kilimanjaro International Airport or Arusha Airport. End of safari.'
      }
    ]
  },
  {
    package_slug: '10-day-tanzania-lifetime-safari',
    package_name: '10-Day Tanzania Lifetime Safari',
    category_slug: 'safaris',
    is_featured: true,
    duration_days: 10,
    duration_nights: 9,
    base_price_usd: 4850,
    featured_image_url: `${EXP}/ol-doinyo-lengai-volcano.webp`,
    image_urls: [
      `${EXP}/ol-doinyo-lengai-volcano.webp`,
      `${EXP}/ol-doinyo-lengai-summit.webp`,
      `${EXP}/glad-of-africa-fleet.webp`,
      '/images/optimized/serengeti-national-park.webp',
      '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
      '/images/optimized/ngorongoro-conservation-area.webp'
    ],
    park_slugs: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-conservation-area'],
    short_description:
      'A 10-day northern-circuit adventure: horse riding in Arusha, Tarangire, Lake Eyasi culture, Lake Natron, Northern and Central Serengeti, and Ngorongoro Crater.',
    detailed_description:
      'Discover the best of northern Tanzania on an unforgettable 10-day safari combining wildlife, culture and landscapes. Begin in Arusha, explore Tarangire, meet Hadzabe and Datoga communities around Lake Eyasi, continue to Lake Natron and Ol Doinyo Lengai country, then spend several nights in Northern and Central Serengeti before a Ngorongoro Crater finale. Hotels and camps are selected by night and location — luxury and mid-range combos confirmed when you book.',
    highlights: [
      'Horse riding on arrival in Arusha',
      'Hadzabe and Datoga cultural day at Lake Eyasi',
      'Lake Natron and Rift Valley scenery',
      'Northern Serengeti and Mara River area',
      'Central Serengeti Seronera wildlife',
      'Ngorongoro Crater game drive'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Horse Riding in Arusha',
        accommodation: 'Overnight in Arusha',
        description:
          'Welcome at the airport and transfer to Arusha. After settling in, enjoy a horse-riding experience through countryside around Arusha, tailored to your level. Dinner and overnight at your Arusha hotel.'
      },
      {
        day: 2,
        title: 'Arusha to Tarangire National Park',
        accommodation: 'Overnight in Mto wa Mbu',
        description:
          'Game drive in Tarangire among baobabs, elephants and the riverine woodland. Picnic lunch, afternoon safari, then drive to Mto wa Mbu near Lake Manyara for overnight.'
      },
      {
        day: 3,
        title: 'Lake Eyasi',
        accommodation: 'Overnight at Lake Eyasi',
        description:
          'Visit a Hadzabe community to learn about hunter-gatherer life, then meet the Datoga people and their crafts. Relax at your lodge or camp on the Rift Valley floor.'
      },
      {
        day: 4,
        title: 'Lake Eyasi to Lake Natron',
        accommodation: 'Overnight at Lake Natron',
        description:
          'Travel through rural landscapes to Lake Natron. Guided walk around the alkaline lake and birdlife (flamingos when conditions suit), optional waterfall visit, dinner under the African sky.'
      },
      {
        day: 5,
        title: 'Lake Natron to Northern Serengeti',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Remote transfer from the Rift Valley into Northern Serengeti. Afternoon game drive toward the Mara River area — wildebeest and zebra in season, plus resident lions, elephants and giraffe.'
      },
      {
        day: 6,
        title: 'Full-Day Northern Serengeti Safari',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Full-day game drive with picnic lunch around the northern plains and Mara River. Crossings are seasonal and never guaranteed; your guide follows the latest wildlife movements.'
      },
      {
        day: 7,
        title: 'Northern Serengeti to Central Serengeti',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Game-drive transfer south toward the Seronera Valley. Afternoon wildlife in Central Serengeti before arriving at your lodge or camp.'
      },
      {
        day: 8,
        title: 'Full-Day Central Serengeti Safari',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Seronera is one of Tanzania’s best year-round wildlife areas. Search for lion, leopard, cheetah, elephant and plains game. Picnic lunch; return for dinner.'
      },
      {
        day: 9,
        title: 'Central Serengeti to Ngorongoro Highlands',
        accommodation: 'Overnight in the Ngorongoro Highlands',
        description:
          'Final morning game drive leaving the Serengeti, then highland scenery into the Ngorongoro Conservation Area. Overnight at a crater-rim or Karatu-area lodge.'
      },
      {
        day: 10,
        title: 'Ngorongoro Crater & Departure',
        accommodation: 'Departure day',
        description:
          'Early descent into Ngorongoro Crater for a final game drive and picnic lunch. Chance of black rhino. Ascend and transfer to JRO or Arusha Airport.'
      }
    ]
  },
  {
    package_slug: '10-day-tanzania-ultimate-safari',
    package_name: '10-Day Tanzania Ultimate Safari',
    category_slug: 'migrations',
    is_featured: true,
    duration_days: 10,
    duration_nights: 9,
    base_price_usd: 5780,
    featured_image_url: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    image_urls: [
      '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
      `${EXP}/glad-of-africa-safari-vehicle.webp`,
      `${EXP}/ol-doinyo-lengai-mountain.webp`,
      '/images/optimized/ngorongoro-conservation-area.webp',
      '/images/optimized/serengeti-national-park.webp',
      '/images/zanzibar/zanzibar%20(1).webp'
    ],
    park_slugs: ['tarangire-national-park', 'ngorongoro-conservation-area', 'serengeti-national-park', 'zanzibar'],
    short_description:
      'Ultimate 10-day safari: Serval Wildlife, Tarangire, Ngorongoro Crater, Empakaai hike, Central and Northern Serengeti Mara River days, then a flight to Zanzibar or Arusha.',
    detailed_description:
      'An unforgettable 10-day Tanzania safari combining wildlife, adventure and culture. Begin with a Serval Wildlife day, then Tarangire, a full Ngorongoro Crater safari and Empakaai Crater hike with a Maasai village visit. Continue into Central and Northern Serengeti for Mara River game drives and possible Great Migration crossings, finishing with a scenic flight to Zanzibar or Arusha. Lodge nights follow the route — rim, Seronera and Kogatende camps confirmed on booking.',
    highlights: [
      'Serval Wildlife conservation visit',
      'Full-day Ngorongoro Crater safari',
      'Empakaai Crater hike and Maasai village',
      'Two full days at the Mara River',
      'Optional flight to Zanzibar'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Serval Wildlife Day Trip',
        accommodation: 'Overnight in Arusha',
        description:
          'Airport welcome and guided visit to Serval Wildlife — rescued and protected animals, supervised feeding where offered, and an introduction to conservation. Transfer to your Arusha hotel for dinner.'
      },
      {
        day: 2,
        title: 'Tarangire National Park',
        accommodation: 'Overnight in the Ngorongoro Highlands',
        description:
          'Game drive in Tarangire among baobabs and elephant herds. Picnic lunch, afternoon safari, then drive up into the cooler Ngorongoro Highlands for overnight.'
      },
      {
        day: 3,
        title: 'Full-Day Ngorongoro Crater Safari',
        accommodation: 'Overnight on the Ngorongoro Crater Rim',
        description:
          'Descend for a full crater day: lions, elephants, buffalo, hippos, zebras and possible black rhino. Picnic on the floor, then overnight on the crater rim.'
      },
      {
        day: 4,
        title: 'Empakaai Crater Hike & Maasai Village',
        accommodation: 'Overnight on the Ngorongoro Crater Rim',
        description:
          'Highland hike to Empakaai Crater for forest and rim views, then a respectful Maasai village visit. Return to your rim lodge for dinner.'
      },
      {
        day: 5,
        title: 'Ngorongoro Highlands to Central Serengeti',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Enter the Serengeti plains and game-drive toward Seronera. Evening at your Central Serengeti lodge or camp.'
      },
      {
        day: 6,
        title: 'Full-Day Central Serengeti Safari',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Full day in the Seronera Valley — predators, elephants and year-round plains game. Picnic lunch in the park.'
      },
      {
        day: 7,
        title: 'Central Serengeti to Northern Serengeti',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Game-drive transfer north toward the Mara River. Remote scenery and, in season, approaching migration herds.'
      },
      {
        day: 8,
        title: 'Full-Day Northern Serengeti & Mara River',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Focus on the Mara River region. Wildebeest crossings are natural events and cannot be guaranteed. Crocodiles, hippos and resident predators throughout.'
      },
      {
        day: 9,
        title: 'Full-Day Mara River Safari',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'A second dedicated Mara River day so you are not rushed. Picnic lunch; final evening in Northern Serengeti.'
      },
      {
        day: 10,
        title: 'Flight from Northern Serengeti to Zanzibar or Arusha',
        accommodation: 'Fly to Zanzibar or Arusha',
        description:
          'Optional short morning game drive, then transfer to the airstrip. Fly to Zanzibar for a beach extension or to Arusha for your onward journey.'
      }
    ]
  },
  {
    package_slug: '10-day-tanzania-safari-cultural-tour',
    package_name: '10-Day Tanzania Safari & Cultural Tour',
    category_slug: 'safaris',
    is_featured: true,
    duration_days: 10,
    duration_nights: 9,
    base_price_usd: 4350,
    featured_image_url: `${EXP}/glad-of-africa-cars.webp`,
    image_urls: [
      `${EXP}/glad-of-africa-cars.webp`,
      `${EXP}/ol-doinyo-lengai.webp`,
      `${EXP}/glad-of-africa-guides.webp`,
      '/images/optimized/tarangire-national-park.webp',
      '/images/optimized/serengeti-national-park.webp',
      '/images/optimized/ngorongoro-conservation-area.webp'
    ],
    park_slugs: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-conservation-area'],
    short_description:
      'Ten days of culture and wildlife: Materuni Waterfall, Tarangire, Lake Natron, Northern and Central Serengeti, Ngorongoro Crater, and an Arusha city tour.',
    detailed_description:
      'The ultimate northern Tanzania mix of authentic culture, landscapes and wildlife. Begin with Materuni Waterfall and Chagga coffee, continue to Tarangire and Lake Natron, then several days in Northern Serengeti around the Mara River and Central Serengeti before Ngorongoro Crater and an Arusha city tour. Overnight hotels follow the route and are linked from each itinerary day.',
    highlights: [
      'Materuni Waterfall and Chagga culture',
      'Tarangire National Park',
      'Lake Natron landscapes',
      'Mara River Northern Serengeti days',
      'Central Serengeti and Ngorongoro Crater',
      'Arusha city tour'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Materuni Waterfall',
        accommodation: 'Overnight in Arusha',
        description:
          'Guided walk through coffee and banana plantations to Materuni Waterfall, traditional lunch and Chagga coffee experience. Continue to Arusha for hotel check-in and dinner.'
      },
      {
        day: 2,
        title: 'Arusha to Tarangire National Park',
        accommodation: 'Overnight in Mto wa Mbu',
        description:
          'Morning and afternoon game drives in Tarangire. Leave the park for overnight in Mto wa Mbu near Lake Manyara.'
      },
      {
        day: 3,
        title: 'Lake Natron',
        accommodation: 'Overnight at Lake Natron',
        description:
          'Scenic drive to Lake Natron. Nature walk around the alkaline lake or nearby waterfalls depending on conditions. Overnight in the Rift Valley.'
      },
      {
        day: 4,
        title: 'Lake Natron to Northern Serengeti',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Enter Northern Serengeti for a first game drive toward the Mara River region. Dinner at camp.'
      },
      {
        day: 5,
        title: 'Full Day Northern Serengeti Safari',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Full-day game drive with picnic lunch across plains, kopjes and river country. Seasonal migration possible.'
      },
      {
        day: 6,
        title: 'Full Day at Mara River',
        accommodation: 'Overnight in Northern Serengeti',
        description:
          'Dedicated Mara River day. Crossings cannot be guaranteed; hippos, crocodiles and predators are present year-round.'
      },
      {
        day: 7,
        title: 'Northern Serengeti to Central Serengeti',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Game-drive south to the Seronera Valley. Afternoon safari around Central Serengeti.'
      },
      {
        day: 8,
        title: 'Full-Day Central Serengeti Safari',
        accommodation: 'Overnight in Central Serengeti',
        description:
          'Seronera predator country and year-round wildlife. Picnic lunch; evening at camp.'
      },
      {
        day: 9,
        title: 'Ngorongoro Crater',
        accommodation: 'Overnight in Arusha',
        description:
          'Drive to Ngorongoro, descend for a crater game drive and picnic, then continue to Arusha for overnight.'
      },
      {
        day: 10,
        title: 'Arusha City Tour & Departure',
        accommodation: 'Departure day',
        description:
          'City tour, market and crafts, then transfer to JRO or Arusha Airport. End of safari.'
      }
    ]
  }
];

async function ensureCategory(slug, name) {
  const found = await db.query(`SELECT category_id FROM package_categories WHERE category_slug = $1 LIMIT 1`, [slug]);
  if (found.rowCount) return found.rows[0].category_id;
  const inserted = await db.query(
    `INSERT INTO package_categories
       (category_name, category_slug, category_description, icon_class, display_order, is_active)
     VALUES ($1, $2, $3, 'fa-binoculars', 1, true)
     RETURNING category_id`,
    [name, slug, name]
  );
  return inserted.rows[0].category_id;
}

async function loadParkIdMap() {
  const res = await db.query(`SELECT park_id, park_slug, park_name FROM national_parks`);
  const bySlug = {};
  for (const r of res.rows) bySlug[r.park_slug] = r.park_id;
  return bySlug;
}

async function syncDestinations(packageId, parkSlugs, parkIdMap) {
  await db.query(`DELETE FROM package_destinations WHERE package_id = $1`, [packageId]);
  let day = 1;
  for (const slug of parkSlugs) {
    const parkId = parkIdMap[slug];
    if (!parkId) continue;
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
      `INSERT INTO package_itinerary (itinerary_id, package_id, day_number, day_title, day_description, accommodation_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        crypto.randomUUID(),
        packageId,
        item.day,
        item.title.slice(0, 200),
        item.description,
        item.accommodation || null
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

async function upsertTourSafe(tour, categoryId, parkIdMap) {
  const slug = tour.package_slug;
  const inclusionsHtml = `<ul>${COMMON_INCLUDED.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
  const exclusionsHtml = `<ul>${COMMON_EXCLUDED.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
  const metaTitle = `${tour.package_name} | Tanzania Safari Magic`.slice(0, 70);
  const metaDescription = tour.short_description.slice(0, 160);
  const keywords = ['tanzania safari', 'arusha safari', ...tour.park_slugs.map((s) => s.replace(/-/g, ' '))];

  const existing = await db.query(`SELECT package_id FROM safari_packages WHERE package_slug = $1 LIMIT 1`, [slug]);
  let packageId;
  if (existing.rowCount) {
    packageId = existing.rows[0].package_id;
    await db.query(
      `UPDATE safari_packages SET
        package_name = $1, category_id = $2, short_description = $3, detailed_description = $4,
        duration_days = $5, duration_nights = $6, base_price_usd = $7, featured_image_url = $8,
        image_urls = $9, highlights = $10, included_features = $11, excluded_features = $12,
        itinerary = $13::jsonb, inclusions_html = $14, exclusions_html = $15,
        is_group_tour = false, is_private = true, is_active = true, is_featured = $16,
        difficulty_level = 'Easy', minimum_pax = 1, maximum_pax = 6,
        meta_title = $17, meta_description = $18, meta_keywords = $19, updated_at = NOW()
      WHERE package_id = $20`,
      [
        tour.package_name.slice(0, 200),
        categoryId,
        tour.short_description,
        tour.detailed_description,
        tour.duration_days,
        tour.duration_nights,
        tour.base_price_usd,
        tour.featured_image_url,
        tour.image_urls,
        tour.highlights,
        COMMON_INCLUDED,
        COMMON_EXCLUDED,
        JSON.stringify(tour.itinerary),
        inclusionsHtml,
        exclusionsHtml,
        tour.is_featured,
        metaTitle,
        metaDescription,
        keywords,
        packageId
      ]
    );
    console.log(`  updated: ${slug}`);
  } else {
    packageId = crypto.randomUUID();
    await db.query(
      `INSERT INTO safari_packages (
        package_id, package_name, package_slug, category_id,
        short_description, detailed_description, duration_days, duration_nights,
        base_price_usd, featured_image_url, image_urls, highlights, included_features,
        excluded_features, itinerary, inclusions_html, exclusions_html,
        is_group_tour, is_private, is_active, is_featured, minimum_pax, maximum_pax,
        difficulty_level, meta_title, meta_description, meta_keywords
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17,false,true,true,$18,1,6,'Easy',$19,$20,$21
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
        tour.featured_image_url,
        tour.image_urls,
        tour.highlights,
        COMMON_INCLUDED,
        COMMON_EXCLUDED,
        JSON.stringify(tour.itinerary),
        inclusionsHtml,
        exclusionsHtml,
        tour.is_featured,
        metaTitle,
        metaDescription,
        keywords
      ]
    );
    console.log(`  inserted: ${slug}`);
  }

  await syncItinerary(packageId, tour.itinerary);
  await syncDestinations(packageId, tour.park_slugs, parkIdMap);
  return packageId;
}

async function seedNewSafaris() {
  console.log('Seeding new Tanzania Safari Magic tours…');
  const safariCat = await ensureCategory('safaris', 'Safaris');
  const migCat = await ensureCategory('migrations', 'Migrations');
  const parkIdMap = await loadParkIdMap();
  for (const tour of TOURS) {
    const catId = tour.category_slug === 'migrations' ? migCat : safariCat;
    await upsertTourSafe(tour, catId, parkIdMap);
  }
  console.log(`New safari seed done (${TOURS.length} packages).`);
  return { count: TOURS.length };
}

module.exports = seedNewSafaris;

if (require.main === module) {
  seedNewSafaris()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
