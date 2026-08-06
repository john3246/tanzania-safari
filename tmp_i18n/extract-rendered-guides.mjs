/**
 * Extract fully-rendered guide JSON (evaluates contentHtml so ${TEAM}/${IMG}/${FAQS} resolve).
 * Writes EN + prepares text for translation; replaces all wa.me links with the canonical CTA URL.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = 'C:/Users/john/tanzania_safari';
const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

function runGuide(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { console };
  sandbox.global = sandbox;
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: filePath });
  return sandbox;
}

function normalizeWhatsapp(html) {
  return html
    .replace(/\$\{AUTHOR\.whatsapp\}/g, WA)
    .replace(/\$\{TEAM\.whatsapp\}/g, WA)
    .replace(/https:\/\/wa\.me\/255695108009\?text=[^"'\s]*/g, WA);
}

function blogExport(sandbox) {
  const keys = Object.keys(sandbox).filter(
    (k) => sandbox[k] && typeof sandbox[k] === 'object' && sandbox[k].META && typeof sandbox[k].contentHtml === 'function'
  );
  if (!keys.length) throw new Error('no blog export');
  return sandbox[keys[0]];
}

function destExport(sandbox) {
  const keys = Object.keys(sandbox).filter(
    (k) => sandbox[k] && typeof sandbox[k] === 'object' && sandbox[k].META && typeof sandbox[k].contentHtml === 'function' && sandbox[k].SLUGS
  );
  if (!keys.length) throw new Error('no dest export');
  return sandbox[keys[0]];
}

const outDir = path.join(ROOT, 'public/locales/en/guides');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/locales/it/guides'), { recursive: true });

const blogDir = path.join(ROOT, 'public/js/blog-guides');
for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.js'))) {
  const g = blogExport(runGuide(path.join(blogDir, f)));
  const html = normalizeWhatsapp(g.contentHtml());
  if (html.includes('${')) {
    console.warn('WARN leftover template in', f, html.match(/\$\{[^}]+\}/g));
  }
  const obj = {
    slug: g.META.slug,
    title: g.META.title,
    meta_title: g.META.meta_title || '',
    meta_description: g.META.meta_description || '',
    excerpt: g.META.excerpt || '',
    category_name: g.META.category_name || 'Safari Guides',
    html,
    faqs: (g.FAQS || []).map((x) => ({ q: x.q, a: x.a }))
  };
  fs.writeFileSync(path.join(outDir, obj.slug + '.json'), JSON.stringify(obj, null, 2));
  console.log('blog', obj.slug, 'html', html.length, 'faqs', obj.faqs.length);
}

const destDir = path.join(ROOT, 'public/js/destination-guides');
for (const f of fs.readdirSync(destDir).filter((x) => x.endsWith('.js'))) {
  const g = destExport(runGuide(path.join(destDir, f)));
  const html = normalizeWhatsapp(g.contentHtml());
  if (html.includes('${')) {
    console.warn('WARN leftover template in', f, html.match(/\$\{[^}]+\}/g));
  }
  const primary = g.SLUGS[0];
  const obj = {
    slug: primary,
    title: g.META.title,
    h1: g.META.h1 || '',
    meta_description: g.META.meta_description || '',
    html,
    faqs: (g.FAQS || []).map((x) => ({ q: x.q, a: x.a }))
  };
  const outName = 'dest-' + primary + '.json';
  fs.writeFileSync(path.join(outDir, outName), JSON.stringify(obj, null, 2));
  console.log('dest', outName, 'html', html.length, 'faqs', obj.faqs.length);
}
