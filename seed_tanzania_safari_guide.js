/**
 * Upsert SEO posts: tanzania-safari + tanzania-safari-cost
 * Run: node seed_tanzania_safari_guide.js
 */
require('dotenv').config();
const db = require('./config/db');

const posts = [
  {
    title: 'Tanzania Safari: The Ultimate Guide to Planning the Perfect Tour',
    slug: 'tanzania-safari',
    excerpt: 'Everything you need to plan a Tanzania safari — migration timing, park fees mindset, how many days to book, and private itineraries from Arusha.',
    metaTitle: 'Tanzania Safari Guide 2026 | Plan the Perfect Tour from Arusha',
    metaDesc: 'Plan a Tanzania safari with a local Arusha expert: best time to visit, Great Migration, safari costs, Serengeti & Ngorongoro parks, itineraries, and private packages.',
    image: '/images/optimized/serengeti-national-park.webp',
    tags: ['tanzania safari', 'serengeti', 'great migration', 'ngorongoro'],
    content: `<p>Ultimate Tanzania safari planning guide by Tanzania Safari Magic (Arusha). <a href="/blog/tanzania-safari">Open the full interactive guide</a> for TOC, destination links, and live packages.</p><p>Also read our <a href="/blog/tanzania-safari-cost">Tanzania safari cost 2026 guide</a>.</p>`
  },
  {
    title: 'Tanzania Safari Cost 2026: Everything You Need to Know',
    slug: 'tanzania-safari-cost',
    excerpt: 'Up-to-date Tanzania safari costs for 2026 — budget, mid-range, and luxury daily rates, what drives price, and how to get the best value with a local Arusha operator.',
    metaTitle: 'Tanzania Safari Cost 2026 | Budget to Luxury Prices from Arusha',
    metaDesc: 'Tanzania safari cost guide 2026: budget from ~$350 pp/day, mid-range, luxury, park fees, tipping, northern vs southern circuit. Free quote from Tanzania Safari Magic in Arusha.',
    image: '/images/optimized/balloon.webp',
    tags: ['tanzania safari cost', 'safari prices 2026', 'budget safari tanzania', 'luxury safari cost'],
    content: `<p>Comprehensive Tanzania safari cost guide for 2026. <a href="/blog/tanzania-safari-cost">Open the full cost guide</a> for budget vs luxury rates and package links.</p><p>Plan itineraries with our <a href="/blog/tanzania-safari">ultimate safari guide</a> and <a href="/safaris">live packages</a>.</p>`
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
  console.log('Done. /blog/tanzania-safari · /blog/tanzania-safari-cost');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
