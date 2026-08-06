/**
 * Extract guide JSON by evaluating browser IIFEs in Node (vm),
 * resolving AUTHOR.whatsapp / IMG / FAQS templates into real HTML.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = 'C:/Users/john/tanzania_safari';
const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

const enDir = path.join(ROOT, 'public/locales/en/guides');
const slimDir = path.join(ROOT, 'tmp_i18n/guide-text-en');
fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(slimDir, { recursive: true });

function runGuide(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { window: {}, console, global: {} };
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window;
}

function finalizeHtml(html) {
  return String(html || '').replace(/\$\{AUTHOR\.whatsapp\}/g, WA);
}

function writeGuide(outName, obj) {
  const html = finalizeHtml(obj.html);
  const full = { ...obj, html };
  fs.writeFileSync(path.join(enDir, outName), JSON.stringify(full, null, 2));
  // slim copy for translation (same, already resolved, no giant assets)
  fs.writeFileSync(path.join(slimDir, outName), JSON.stringify(full, null, 2));
  console.log('wrote', outName, 'html=', html.length, 'faqs=', (obj.faqs || []).length);
}

// Blog guides
const blogDir = path.join(ROOT, 'public/js/blog-guides');
for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.js'))) {
  const win = runGuide(path.join(blogDir, f));
  const key = Object.keys(win).find((k) => /Guide$/.test(k));
  if (!key) {
    console.log('skip blog no export', f);
    continue;
  }
  const g = win[key];
  const meta = g.META || {};
  let html = typeof g.contentHtml === 'function' ? g.contentHtml() : '';
  // If AUTHOR.whatsapp still present as literal (shouldn't after eval), fix
  if (g.AUTHOR && g.AUTHOR.whatsapp) {
    // contentHtml already resolved AUTHOR via template; good
  }
  writeGuide(meta.slug + '.json', {
    slug: meta.slug,
    title: meta.title || '',
    meta_title: meta.meta_title || '',
    meta_description: meta.meta_description || '',
    excerpt: meta.excerpt || '',
    category_name: meta.category_name || 'Safari Guides',
    html,
    faqs: g.FAQS || [],
  });
}

// Destination guides → dest-*.json
const destMap = {
  'serengeti.js': 'dest-serengeti-national-park.json',
  'ngorongoro.js': 'dest-ngorongoro-conservation-area.json',
  'kilimanjaro.js': 'dest-mount-kilimanjaro-national-park.json',
};
const destDir = path.join(ROOT, 'public/js/destination-guides');
for (const [src, outName] of Object.entries(destMap)) {
  const win = runGuide(path.join(destDir, src));
  const key = Object.keys(win).find((k) => /Guide$/.test(k));
  if (!key) {
    console.log('skip dest no export', src);
    continue;
  }
  const g = win[key];
  const meta = g.META || {};
  const slug = (g.SLUGS && g.SLUGS[0]) || '';
  const html = typeof g.contentHtml === 'function' ? g.contentHtml() : '';
  writeGuide(outName, {
    slug,
    title: meta.title || '',
    h1: meta.h1 || '',
    meta_description: meta.meta_description || '',
    html,
    faqs: g.FAQS || [],
  });
}

// Also write non-dest copies for kilimanjaro/ngorongoro conservation if present in user list
// User asked for dest-* names for those three destinations.

console.log('Done. EN guides in', enDir);
