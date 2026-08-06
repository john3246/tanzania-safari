/**
 * Writes Spanish locale guide JSON files.
 * Loads EN structure, applies per-slug Spanish overlays (meta + html + faqs).
 */
import fs from 'fs';
import path from 'path';

const ROOT = 'C:/Users/john/tanzania_safari';
const enDir = path.join(ROOT, 'tmp_i18n/guide-text-en');
const outDir = path.join(ROOT, 'public/locales/es/guides');
fs.mkdirSync(outDir, { recursive: true });

const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

function fixWa(html) {
  return String(html || '')
    .replace(/\$\{AUTHOR\.whatsapp\}/g, WA)
    .replace(/href="https:\/\/wa\.me\/255695108009\?text=[^"]*"/g, `href="${WA}"`);
}

function writeEs(slug, data) {
  const en = JSON.parse(fs.readFileSync(path.join(enDir, slug + '.json'), 'utf8'));
  const out = {
    slug: en.slug,
    title: data.title,
    meta_title: data.meta_title ?? en.meta_title,
    meta_description: data.meta_description,
    excerpt: data.excerpt ?? en.excerpt,
    category_name: data.category_name ?? 'Guías de safari',
    h1: data.h1,
    html: fixWa(data.html),
    faqs: data.faqs ?? [],
  };
  // Drop undefined keys
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  // Destination guides may not have excerpt/category/meta_title
  if (!('excerpt' in en)) delete out.excerpt;
  if (!('category_name' in en)) delete out.category_name;
  if (!('meta_title' in en)) delete out.meta_title;
  if (!('h1' in en) && !data.h1) delete out.h1;
  fs.writeFileSync(path.join(outDir, slug + '.json'), JSON.stringify(out, null, 2));
  console.log('ES', slug, 'html', out.html.length);
}

// Import translation modules
const modules = [
  './es-parts/tanzania-safari.mjs',
  './es-parts/tanzania-safari-cost.mjs',
  './es-parts/best-time-to-visit-tanzania.mjs',
  './es-parts/great-wildebeest-migration.mjs',
  './es-parts/serengeti-national-park.mjs',
  './es-parts/ngorongoro-crater.mjs',
  './es-parts/zanzibar-guide.mjs',
  './es-parts/arusha-national-park.mjs',
  './es-parts/dest-serengeti-national-park.mjs',
  './es-parts/dest-ngorongoro-conservation-area.mjs',
  './es-parts/dest-mount-kilimanjaro-national-park.mjs',
];

for (const m of modules) {
  const { slug, data } = await import(m);
  writeEs(slug, data);
}

console.log('Wrote', modules.length, 'Spanish guide files');
