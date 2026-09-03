/**
 * Upsert SEO pillar blog stubs for listing / sitemap.
 * Run: node seed_tanzania_safari_guide.js  (or npm run seed:guide)
 */
require('dotenv').config();
const db = require('../config/db');

const posts = [
  {
    title: 'Tanzania Safari: The Ultimate Guide to Planning the Perfect Tour',
    slug: 'tanzania-safari',
    excerpt: 'Everything you need to plan a Tanzania safari — migration timing, park fees mindset, how many days to book, and private itineraries from Arusha.',
    metaTitle: 'Tanzania Safari Guide 2026 | Plan the Perfect Tour from Arusha',
    metaDesc: 'Plan a Tanzania safari with a local Arusha expert: best time to visit, Great Migration, safari costs, Serengeti & Ngorongoro parks, itineraries, and private packages.',
    image: '/images/optimized/serengeti-national-park.webp',
    tags: ['tanzania safari', 'serengeti', 'great migration', 'ngorongoro'],
    content: `<p>Ultimate Tanzania safari planning guide by Tanzania Safari Magic (Arusha). <a href="/blog/tanzania-safari">Open the full interactive guide</a>.</p><p>Also read <a href="/blog/best-time-to-visit-tanzania">best time to visit Tanzania</a>, <a href="/blog/tanzania-safari-cost">safari costs 2026</a>, and park guides for <a href="/blog/serengeti-national-park">Serengeti</a>, <a href="/blog/ngorongoro-crater">Ngorongoro</a>, and <a href="/blog/zanzibar-guide">Zanzibar</a>.</p>`
  },
  {
    title: 'Tanzania Safari Cost 2026: Everything You Need to Know',
    slug: 'tanzania-safari-cost',
    excerpt: 'Up-to-date Tanzania safari costs for 2026 — budget, mid-range, and luxury daily rates, what drives price, and how to get the best value with a local Arusha operator.',
    metaTitle: 'Tanzania Safari Cost 2026 | Budget to Luxury Prices from Arusha',
    metaDesc: 'Tanzania safari cost guide 2026: budget from ~$350 pp/day, mid-range, luxury, park fees, tipping, northern vs southern circuit. Free quote from Tanzania Safari Magic in Arusha.',
    image: '/images/optimized/balloon.webp',
    tags: ['tanzania safari cost', 'safari prices 2026', 'budget safari tanzania', 'luxury safari cost'],
    content: `<p>Comprehensive Tanzania safari cost guide for 2026. <a href="/blog/tanzania-safari-cost">Open the full cost guide</a>.</p><p>Pair with our <a href="/blog/tanzania-safari">ultimate safari guide</a> and <a href="/blog/best-time-to-visit-tanzania">best time to visit</a>.</p>`
  },
  {
    title: 'Great Wildebeest Migration Safari Guide | Serengeti Tanzania',
    slug: 'great-wildebeest-migration',
    excerpt: 'Plan a Serengeti Great Migration safari — month-by-month herd map, calving, Grumeti & Mara River crossings, costs, and private itineraries from Arusha.',
    metaTitle: 'Great Wildebeest Migration Guide 2026 | Serengeti Safari from Arusha',
    metaDesc: 'Plan a Serengeti Great Wildebeest Migration safari: best months, calving, Grumeti & Mara River crossings, costs, and private itineraries from Tanzania Safari Magic in Arusha.',
    image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    tags: ['great wildebeest migration', 'serengeti migration', 'mara river crossing', 'ndutu calving'],
    content: `<p>Serengeti-focused Great Wildebeest Migration guide. <a href="/blog/great-wildebeest-migration">Open the full migration guide</a>.</p><p>Also read <a href="/blog/serengeti-national-park">Serengeti National Park</a> and <a href="/blog/best-time-to-visit-tanzania">best time to visit Tanzania</a>.</p>`
  },
  {
    title: 'Zanzibar Guide 2026: Beaches, Spice Island & Safari Extensions',
    slug: 'zanzibar-guide',
    excerpt: 'A practical Zanzibar guide for safari travellers — best beaches, Stone Town, spice tours, marine life, costs, and how to add the Spice Island after Serengeti or Ngorongoro.',
    metaTitle: 'Zanzibar Guide 2026 | Beaches, Spice Tours & Safari Extensions',
    metaDesc: 'Plan Zanzibar after your Tanzania safari: best beaches (Kendwa, Nungwi, Paje), Stone Town, spice tours, Jozani, costs, and how to combine with Serengeti from Arusha.',
    image: '/images/optimized/zanzibar.webp',
    tags: ['zanzibar guide', 'zanzibar beaches', 'spice island', 'safari and beach'],
    content: `<p>Zanzibar beach &amp; Spice Island guide by Tanzania Safari Magic. <a href="/blog/zanzibar-guide">Open the full Zanzibar guide</a>.</p><p>Combine with a <a href="/blog/serengeti-national-park">Serengeti safari</a> or check <a href="/blog/best-time-to-visit-tanzania">best months for beach weather</a>.</p>`
  },
  {
    title: 'Ngorongoro Crater Safari Guide 2026 | Wildlife & Day Visits',
    slug: 'ngorongoro-crater',
    excerpt: 'Plan a Ngorongoro Crater safari — Big Five & black rhino, best time, how many days, crater floor tips, and private itineraries from Arusha.',
    metaTitle: 'Ngorongoro Crater Guide 2026 | Big Five Safari from Arusha',
    metaDesc: 'Plan a Ngorongoro Crater safari: wildlife (Big Five & black rhino), best time, how many days, crater floor tips, fees mindset, and private itineraries from Tanzania Safari Magic.',
    image: '/images/optimized/ngororo%20%20righno.webp',
    tags: ['ngorongoro crater', 'ngorongoro safari', 'big five tanzania', 'black rhino'],
    content: `<p>Ngorongoro Crater safari guide. <a href="/blog/ngorongoro-crater">Open the full crater guide</a>.</p><p>Also explore <a href="/blog/serengeti-national-park">Serengeti</a>, <a href="/destinations/ngorongoro-conservation-area">destination page</a>, and <a href="/blog/tanzania-safari-cost">safari costs</a>.</p>`
  },
  {
    title: 'Serengeti National Park Guide 2026 | Wildlife & Migration Safari',
    slug: 'serengeti-national-park',
    excerpt: 'Plan a Serengeti safari from Arusha — migration timing by region, Big Five wildlife, how many nights to book, balloon options, costs, and where to stay by sector.',
    metaTitle: 'Serengeti National Park Guide 2026 | Migration & Big Five Safari',
    metaDesc: 'Complete Serengeti safari guide: Great Migration months, Seronera, Ndutu, western corridor, northern crossings, balloon safaris, costs, and private trips from Arusha.',
    image: '/images/optimized/serengeti-national-park.webp',
    tags: ['serengeti national park', 'serengeti safari', 'great migration', 'seronera'],
    content: `<p>Serengeti National Park guide. <a href="/blog/serengeti-national-park">Open the full Serengeti guide</a>.</p><p>Deep-dive timing in our <a href="/blog/great-wildebeest-migration">Great Migration guide</a> and <a href="/blog/best-time-to-visit-tanzania">best time to visit Tanzania</a>.</p>`
  },
  {
    title: 'Arusha National Park Guide 2026 | Mount Meru, Lakes & Day Trips',
    slug: 'arusha-national-park',
    excerpt: 'Visit Arusha National Park: Mount Meru views, Momella Lakes, walking safaris, canoeing, colobus monkeys, and easy day trips before a Serengeti safari.',
    metaTitle: 'Arusha National Park Guide 2026 | Meru, Momella Lakes & Day Safari',
    metaDesc: 'Visit Arusha National Park: Mount Meru views, Momella Lakes, walking safaris, canoeing, colobus monkeys, and easy day trips before a Serengeti safari with Tanzania Safari Magic.',
    image: '/images/optimized/arusha-national-park.webp',
    tags: ['arusha national park', 'mount meru', 'momella lakes', 'day trip arusha'],
    content: `<p>Arusha National Park day-trip guide. <a href="/blog/arusha-national-park">Open the full Arusha park guide</a>.</p><p>Start here before <a href="/blog/serengeti-national-park">Serengeti</a> or <a href="/blog/ngorongoro-crater">Ngorongoro</a> — see our <a href="/blog/tanzania-safari">ultimate safari guide</a>.</p>`
  },
  {
    title: 'Best Time to Visit Tanzania 2026: Month-by-Month Safari Guide',
    slug: 'best-time-to-visit-tanzania',
    excerpt: 'Month-by-month Tanzania safari timing — dry vs green season, migration highlights, park picks, crowds, costs, Kilimanjaro and Zanzibar — from Our Team in Arusha.',
    metaTitle: 'Best Time to Visit Tanzania 2026 | Dry Season, Migration & Beach',
    metaDesc: 'Best months for a Tanzania safari: dry season wildlife, Great Migration calendar, green season value, Kilimanjaro & Zanzibar timing. Plan with Tanzania Safari Magic in Arusha.',
    image: '/images/optimized/balloon.webp',
    tags: ['best time to visit tanzania', 'tanzania dry season', 'great migration calendar', 'green season safari'],
    content: `<p>Best time to visit Tanzania — month-by-month. <a href="/blog/best-time-to-visit-tanzania">Open the full seasonal guide</a>.</p><p>Then plan parks with <a href="/blog/serengeti-national-park">Serengeti</a>, <a href="/blog/ngorongoro-crater">Ngorongoro</a>, <a href="/blog/great-wildebeest-migration">migration</a>, and <a href="/blog/zanzibar-guide">Zanzibar</a>.</p>`
  }
];

async function upsert(p) {
  const existing = await db.query(`SELECT post_id FROM blog_posts WHERE post_slug = $1`, [p.slug]);
  if (existing.rows.length) {
    await db.query(
      `UPDATE blog_posts SET
         post_title=$1, post_excerpt=$2, post_content=$3, featured_image_url=$4,
         meta_title=$5, meta_description=$6, post_tags=$7, is_published=true,
         published_at=COALESCE(published_at,NOW()), updated_at=NOW()
       WHERE post_slug=$8`,
      [p.title, p.excerpt, p.content, p.image, p.metaTitle, p.metaDesc, p.tags, p.slug]
    );
    console.log('Updated:', p.slug);
  } else {
    await db.query(
      `INSERT INTO blog_posts (
         post_title, post_slug, post_excerpt, post_content, featured_image_url,
         meta_title, meta_description, post_tags, is_published, published_at, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,NOW(),NOW(),NOW())`,
      [p.title, p.slug, p.excerpt, p.content, p.image, p.metaTitle, p.metaDesc, p.tags]
    );
    console.log('Inserted:', p.slug);
  }
}

async function main() {
  for (const p of posts) await upsert(p);
  console.log('Done. Pillars:');
  posts.forEach(p => console.log('  /blog/' + p.slug));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
