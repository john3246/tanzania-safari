import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/john/tanzania_safari/public/locales/es/guides';
const expected = [
  'tanzania-safari',
  'tanzania-safari-cost',
  'best-time-to-visit-tanzania',
  'great-wildebeest-migration',
  'serengeti-national-park',
  'ngorongoro-crater',
  'zanzibar-guide',
  'arusha-national-park',
  'dest-serengeti-national-park',
  'dest-ngorongoro-conservation-area',
  'dest-mount-kilimanjaro-national-park',
];

const WA = 'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';
let ok = 0;
const issues = [];

for (const slug of expected) {
  const p = path.join(dir, slug + '.json');
  if (!fs.existsSync(p)) {
    issues.push('MISSING ' + slug);
    continue;
  }
  let j;
  try {
    j = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    issues.push('INVALID JSON ' + slug + ': ' + e.message);
    continue;
  }
  const checks = [];
  if (j.slug !== (slug.startsWith('dest-') ? slug.replace(/^dest-/, '') : slug) && j.slug !== slug.replace(/^dest-/, '')) {
    // dest files keep primary slug without dest- prefix
    if (!(slug.startsWith('dest-') && j.slug === slug.slice(5))) {
      checks.push('slug mismatch: ' + j.slug);
    }
  }
  if (!j.title) checks.push('no title');
  if (!j.html || j.html.length < 1000) checks.push('html too short: ' + (j.html || '').length);
  if (j.html && j.html.includes('${AUTHOR.whatsapp}')) checks.push('leftover AUTHOR.whatsapp');
  if (j.html && /[A-Za-z]{4,}/.test(j.html)) {
    // spot-check English leftovers in common UI
    const engHints = [
      'Get a Free Quote',
      'In This Guide',
      'WhatsApp Our Team',
      'Final Thoughts',
      'How Much Does',
      'Best Time to Visit',
      'Table of contents',
    ];
    for (const h of engHints) {
      if (j.html.includes(h)) checks.push('EN leftover: ' + h);
    }
  }
  // FAQs
  if (Array.isArray(j.faqs)) {
    for (const f of j.faqs) {
      if (!f.q || !f.a) checks.push('empty faq');
      if (/How much does|When is the best|Is Tanzania/.test(f.q || '')) checks.push('EN faq q: ' + (f.q || '').slice(0, 40));
    }
  }
  if (checks.length) {
    issues.push(slug + ': ' + checks.join('; '));
  } else {
    ok++;
    console.log('OK', slug, 'html=', j.html.length, 'faqs=', (j.faqs || []).length, 'title=', j.title.slice(0, 60));
  }
}

console.log('\nOK count:', ok, '/', expected.length);
if (issues.length) {
  console.log('ISSUES:');
  issues.forEach((i) => console.log(' -', i));
}
console.log('files on disk:', fs.readdirSync(dir).filter((f) => f.endsWith('.json')).length);
