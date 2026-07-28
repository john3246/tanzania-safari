/**
 * Upsert SEO pillar blog post: /blog/tanzania-safari
 * Author attributed to John Raphael Shayo
 * Run: node seed_tanzania_safari_guide.js
 */
require('dotenv').config();
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function main() {
  // Load HTML body from the client guide (strip to content only via duplicate excerpt for DB)
  const guidePath = path.join(__dirname, 'public/js/blog-guides/tanzania-safari.js');
  const raw = fs.readFileSync(guidePath, 'utf8');

  // Prefer storing a concise CMS-friendly body + note that full guide is served client-side;
  // still seed rich excerpt/meta for sitemap & admin visibility.
  const title = 'Tanzania Safari: The Ultimate Guide to Planning the Perfect Tour';
  const slug = 'tanzania-safari';
  const excerpt = 'Everything you need to plan a Tanzania safari — migration timing, park fees mindset, how many days to book, and private itineraries from Arusha.';
  const metaTitle = 'Tanzania Safari Guide 2026 | Plan the Perfect Tour from Arusha';
  const metaDesc = 'Plan a Tanzania safari with a local Arusha expert: best time to visit, Great Migration, safari costs, Serengeti & Ngorongoro parks, itineraries, and private packages. Free quote from John Raphael Shayo.';
  const image = '/images/optimized/serengeti-national-park.webp';

  // Minimal published body so API returns the post; full editorial HTML is rendered by blog-detail for this slug
  const content = `
<p><strong>Home to the Great Wildebeest Migration and some of Africa’s densest predator populations, Tanzania is one of the world’s premier safari destinations.</strong></p>
<p>This ultimate guide by <strong>John Raphael Shayo</strong> of Tanzania Safari Magic (Arusha) covers when to visit, how costs work, northern parks, migration timing, and recommended private packages.</p>
<p><a href="/blog/tanzania-safari">Continue reading the full interactive guide</a> for table of contents, destination links, and live package recommendations.</p>
<p>Explore <a href="/destinations/serengeti-national-park">Serengeti</a>, <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, <a href="/destinations/tarangire-national-park">Tarangire</a>, and <a href="/safaris">safari packages</a> — or <a href="/booking">request a free quote</a>.</p>
`.trim();

  const existing = await db.query(`SELECT post_id FROM blog_posts WHERE post_slug = $1`, [slug]);

  if (existing.rows.length) {
    await db.query(
      `UPDATE blog_posts SET
         post_title = $1,
         post_excerpt = $2,
         post_content = $3,
         featured_image_url = $4,
         meta_title = $5,
         meta_description = $6,
         post_tags = $7,
         is_published = true,
         published_at = COALESCE(published_at, NOW()),
         updated_at = NOW()
       WHERE post_slug = $8`,
      [title, excerpt, content, image, metaTitle, metaDesc, ['tanzania safari', 'serengeti', 'great migration', 'ngorongoro'], slug]
    );
    console.log('Updated existing post:', slug);
  } else {
    await db.query(
      `INSERT INTO blog_posts (
         post_title, post_slug, post_excerpt, post_content,
         featured_image_url, meta_title, meta_description, post_tags,
         is_published, published_at, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,NOW(),NOW(),NOW())`,
      [title, slug, excerpt, content, image, metaTitle, metaDesc, ['tanzania safari', 'serengeti', 'great migration', 'ngorongoro']]
    );
    console.log('Inserted new post:', slug);
  }

  console.log('Guide available at https://tanzaniasafarimagic.com/blog/tanzania-safari');
  console.log('Guide file bytes:', raw.length);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
