/**
 * Seed two open-group safari itineraries (inspired by Altezza calendar styles)
 * plus upcoming departures for the public calendar / homepage cards.
 *
 * Usage: node seed_group_safaris.js
 */
const db = require('./config/db');
const crypto = require('crypto');

const tours = [
  {
    package_id: crypto.randomUUID(),
    package_name: 'Classic Parks Group Safari — Arusha, Tarangire & Ngorongoro',
    package_slug: 'group-arusha-tarangire-ngorongoro-5-days',
    short_description:
      '5-day shared safari with a walking experience near Arusha, elephants in Tarangire, and a full Ngorongoro Crater game drive — ideal for solo travelers and couples.',
    detailed_description:
      'Join a small open group for a classic northern-circuit safari. Day one introduces wildlife on foot near Arusha. Then explore Tarangire’s elephant herds and baobabs before descending into Ngorongoro Crater — one of Africa’s densest wildlife arenas. Fixed dates, shared Land Cruiser costs, and expert local guides from Arusha.',
    duration_days: 5,
    duration_nights: 4,
    base_price_usd: 1890,
    featured_image_url: '/images/optimized/balloon.webp',
    image_urls: [
      '/images/optimized/balloon.webp',
      '/images/optimized/tarangire.webp',
      '/images/optimized/arusha-national-park.webp'
    ],
    highlights: [
      'Walking safari near Arusha',
      'Tarangire elephant herds & baobabs',
      'Full-day Ngorongoro Crater drive',
      'Small groups (max 6 guests)',
      'Perfect for solo travelers & couples'
    ],
    included_features: [
      'Park & conservation fees',
      '4x4 safari Land Cruiser with pop-up roof',
      'Professional English-speaking safari guide',
      'Full-board lodging on safari days',
      'Airport / hotel transfers in Arusha',
      'Bottled water on game drives'
    ],
    excluded_features: [
      'International flights',
      'Tanzania visa',
      'Travel insurance',
      'Tips & personal expenses',
      'Optional balloon safari'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Arusha',
        description:
          'Met at Kilimanjaro International Airport (JRO) and transferred to your Arusha hotel. Evening briefing with your guide and fellow travelers.'
      },
      {
        day: 2,
        title: 'Arusha National Park — walking safari',
        description:
          'Morning walk with an armed ranger among giraffes, buffalo, and zebra. Afternoon at leisure or optional canoeing before overnight near Arusha.'
      },
      {
        day: 3,
        title: 'Tarangire National Park',
        description:
          'Full-day game drive among elephants, baobabs, and predators. Picnic lunch in the bush. Overnight near the park or Karatu highlands.'
      },
      {
        day: 4,
        title: 'Ngorongoro Crater',
        description:
          'Early descent into the crater floor for Big Five viewing — lions, rhino chance, flamingos on the soda lake. Ascend in the afternoon to your lodge.'
      },
      {
        day: 5,
        title: 'Return to Arusha / departure',
        description:
          'Breakfast and transfer to Arusha or JRO for onward flights. Optional late check-out available on request.'
      }
    ],
    physical_rating: 'Easy',
    min_age: 3,
    group_max_pax: 6,
    packing_list_html:
      '<ul><li>Neutral-colored clothing & sun hat</li><li>Comfortable closed shoes</li><li>Binoculars & camera</li><li>Light rain jacket</li><li>Malaria prophylaxis as advised by your doctor</li></ul>',
    visa_info_html:
      '<p>Most visitors need a Tanzania tourist visa (e-visa or on arrival). Passport must be valid 6+ months. Yellow fever certificate required if arriving from a risk country.</p>',
    departures: [
      { start: '2026-08-09', end: '2026-08-13', price: 1890, discount: 5, capacity: 6, seats: 2 },
      { start: '2026-09-06', end: '2026-09-10', price: 1890, discount: 0, capacity: 6, seats: 0 }
    ]
  },
  {
    package_id: crypto.randomUUID(),
    package_name: 'Northern Circuit Group Safari — Tarangire, Ngorongoro & Serengeti',
    package_slug: 'group-tarangire-ngorongoro-serengeti-6-days',
    short_description:
      '6-day shared safari covering Tarangire elephants, Ngorongoro Crater, and the Serengeti plains — Big Five focus with fixed join-in dates.',
    detailed_description:
      'Our flagship open-group northern circuit. Travel with a small shared group through Tarangire, into Ngorongoro, then deep into Serengeti for classic plains game and predator action. Fixed departure dates keep pricing clear while you still enjoy private-vehicle comfort in a Land Cruiser with an expert Arusha-based guide.',
    duration_days: 6,
    duration_nights: 5,
    base_price_usd: 2700,
    featured_image_url: '/images/optimized/serengeti-national-park.webp',
    image_urls: [
      '/images/optimized/serengeti-national-park.webp',
      '/images/optimized/balloon.webp',
      '/images/optimized/tarangire.webp'
    ],
    highlights: [
      'The Big Five',
      'Tarangire elephant families',
      'Ngorongoro Crater floor',
      'Serengeti predator country',
      'Shared costs on fixed dates'
    ],
    included_features: [
      'All park fees for Tarangire, Ngorongoro & Serengeti',
      '4x4 Land Cruiser with pop-up roof',
      'Professional safari guide / driver',
      'Full-board accommodation on safari',
      'Game drives as per itinerary',
      'Airport transfers (JRO / Arusha)'
    ],
    excluded_features: [
      'International flights',
      'Visa fees',
      'Travel / medical insurance',
      'Alcoholic drinks',
      'Gratuities',
      'Hot-air balloon (optional)'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival — Arusha',
        description: 'Airport meet-and-greet at JRO and transfer to Arusha. Safari briefing and overnight.'
      },
      {
        day: 2,
        title: 'Tarangire National Park',
        description:
          'Drive to Tarangire for game viewing among giant baobabs and large elephant herds. Overnight near the park.'
      },
      {
        day: 3,
        title: 'Ngorongoro Crater',
        description:
          'Full crater tour with picnic lunch on the floor. Excellent chances for lion, buffalo, elephant, and rhino. Overnight on the crater rim or Karatu.'
      },
      {
        day: 4,
        title: 'Into the Serengeti',
        description:
          'Enter Serengeti via the southern / central plains. Afternoon game drive toward Seronera. Overnight in / near Serengeti.'
      },
      {
        day: 5,
        title: 'Full day Serengeti',
        description:
          'Dawn and afternoon drives focusing on big cats, wildebeest / zebra herds, and scenic kopjes. Overnight in Serengeti.'
      },
      {
        day: 6,
        title: 'Serengeti to Arusha',
        description:
          'Morning game drive en route out of the park, then return to Arusha / airport for departure.'
      }
    ],
    physical_rating: 'Easy',
    min_age: 5,
    group_max_pax: 6,
    packing_list_html:
      '<ul><li>Layered safari clothing (khaki / earth tones)</li><li>Warm fleece for crater mornings</li><li>Sun protection & insect repellent</li><li>Power bank & spare camera batteries</li><li>Soft duffel preferred over hard suitcase</li></ul>',
    visa_info_html:
      '<p>Apply for a Tanzania e-visa before travel or obtain on arrival where eligible. Carry a printed or digital copy. Travel insurance covering medical evacuation is strongly recommended for safari travel.</p>',
    departures: [
      { start: '2026-08-17', end: '2026-08-22', price: 2700, discount: 0, capacity: 6, seats: 1 },
      { start: '2026-10-05', end: '2026-10-10', price: 2700, discount: 0, capacity: 6, seats: 0 }
    ]
  }
];

function slugFromDate(startDate, packageSlug) {
  const d = new Date(startDate + 'T00:00:00Z');
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mon = months[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  const base = packageSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40);
  return `join-${base}-${dd}${mon}${yyyy}`;
}

async function ensureCategory() {
  const r = await db.query(
    `INSERT INTO package_categories (category_name, category_slug, category_description, icon_class, display_order, is_active)
     VALUES ('Group Safaris', 'group-safaris', 'Fixed-date shared group safaris', 'fa-users', 5, true)
     ON CONFLICT (category_slug) DO UPDATE SET is_active = true
     RETURNING category_id`
  );
  return r.rows[0]?.category_id;
}

async function seed() {
  console.log('Seeding group safaris…');
  await db.query(`
    ALTER TABLE public.safari_packages
      ADD COLUMN IF NOT EXISTS is_group_tour boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS physical_rating varchar(40) DEFAULT 'Easy',
      ADD COLUMN IF NOT EXISTS min_age integer DEFAULT 3,
      ADD COLUMN IF NOT EXISTS group_max_pax integer DEFAULT 6,
      ADD COLUMN IF NOT EXISTS inclusions_html text,
      ADD COLUMN IF NOT EXISTS exclusions_html text,
      ADD COLUMN IF NOT EXISTS packing_list_html text,
      ADD COLUMN IF NOT EXISTS visa_info_html text;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS public.group_departures (
      departure_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      package_id uuid NOT NULL REFERENCES public.safari_packages(package_id) ON DELETE CASCADE,
      departure_slug varchar(160) NOT NULL,
      title_override varchar(200),
      start_date date NOT NULL,
      end_date date NOT NULL,
      capacity integer NOT NULL DEFAULT 6,
      seats_booked integer NOT NULL DEFAULT 0,
      price_usd numeric(12,2),
      discount_percent numeric(5,2) DEFAULT 0,
      status varchar(30) NOT NULL DEFAULT 'open',
      is_featured boolean DEFAULT false,
      is_active boolean DEFAULT true,
      admin_notes text,
      created_at timestamptz DEFAULT NOW(),
      updated_at timestamptz DEFAULT NOW(),
      CONSTRAINT group_departures_slug_key UNIQUE (departure_slug)
    );
  `);

  const categoryId = await ensureCategory();

  for (const t of tours) {
    const existing = await db.query(
      `SELECT package_id FROM safari_packages WHERE package_slug = $1 LIMIT 1`,
      [t.package_slug]
    );
    let packageId = existing.rows[0]?.package_id;
    if (packageId) {
      console.log(`Updating existing: ${t.package_slug}`);
      await db.query(
        `UPDATE safari_packages SET
          package_name = $1, short_description = $2, detailed_description = $3,
          duration_days = $4, duration_nights = $5, base_price_usd = $6,
          featured_image_url = $7, image_urls = $8, highlights = $9,
          included_features = $10, excluded_features = $11, itinerary = $12,
          is_group_tour = true, is_private = false, is_active = true, is_featured = true,
          physical_rating = $13, min_age = $14, group_max_pax = $15,
          maximum_pax = $15, minimum_pax = 1, difficulty_level = $13,
          inclusions_html = $16, exclusions_html = $17,
          packing_list_html = $18, visa_info_html = $19,
          category_id = COALESCE($20, category_id),
          updated_at = NOW()
        WHERE package_id = $21`,
        [
          t.package_name,
          t.short_description,
          t.detailed_description,
          t.duration_days,
          t.duration_nights,
          t.base_price_usd,
          t.featured_image_url,
          t.image_urls,
          t.highlights,
          t.included_features,
          t.excluded_features,
          JSON.stringify(t.itinerary),
          t.physical_rating,
          t.min_age,
          t.group_max_pax,
          `<ul>${t.included_features.map((i) => `<li>${i}</li>`).join('')}</ul>`,
          `<ul>${t.excluded_features.map((i) => `<li>${i}</li>`).join('')}</ul>`,
          t.packing_list_html,
          t.visa_info_html,
          categoryId,
          packageId
        ]
      );
    } else {
      packageId = t.package_id;
      console.log(`Inserting: ${t.package_slug}`);
      await db.query(
        `INSERT INTO safari_packages (
          package_id, package_name, package_slug, short_description, detailed_description,
          duration_days, duration_nights, base_price_usd, featured_image_url, image_urls,
          highlights, included_features, excluded_features, itinerary,
          is_group_tour, is_private, is_active, is_featured,
          physical_rating, min_age, group_max_pax, maximum_pax, minimum_pax, difficulty_level,
          inclusions_html, exclusions_html, packing_list_html, visa_info_html, category_id
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
          true,false,true,true,$15,$16,$17,$17,1,$15,$18,$19,$20,$21,$22
        )`,
        [
          packageId,
          t.package_name,
          t.package_slug,
          t.short_description,
          t.detailed_description,
          t.duration_days,
          t.duration_nights,
          t.base_price_usd,
          t.featured_image_url,
          t.image_urls,
          t.highlights,
          t.included_features,
          t.excluded_features,
          JSON.stringify(t.itinerary),
          t.physical_rating,
          t.min_age,
          t.group_max_pax,
          `<ul>${t.included_features.map((i) => `<li>${i}</li>`).join('')}</ul>`,
          `<ul>${t.excluded_features.map((i) => `<li>${i}</li>`).join('')}</ul>`,
          t.packing_list_html,
          t.visa_info_html,
          categoryId
        ]
      );
    }

    for (const dep of t.departures) {
      const slug = slugFromDate(dep.start, t.package_slug);
      const exists = await db.query(
        `SELECT departure_id FROM group_departures WHERE departure_slug = $1 LIMIT 1`,
        [slug]
      );
      if (exists.rowCount) {
        console.log(`  Departure exists: ${slug}`);
        continue;
      }
      await db.query(
        `INSERT INTO group_departures (
          package_id, departure_slug, start_date, end_date, capacity, seats_booked,
          price_usd, discount_percent, status, is_featured, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'open',true,true)`,
        [
          packageId,
          slug,
          dep.start,
          dep.end,
          dep.capacity,
          dep.seats,
          dep.price,
          dep.discount
        ]
      );
      console.log(`  Added departure: ${slug}`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
