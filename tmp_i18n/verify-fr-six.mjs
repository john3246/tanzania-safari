import fs from 'fs';
import path from 'path';

const files = [
  'best-time-to-visit-tanzania',
  'ngorongoro-crater',
  'zanzibar-guide',
  'dest-serengeti-national-park',
  'dest-ngorongoro-conservation-area',
  'dest-mount-kilimanjaro-national-park',
];

const protectedExisting = [
  'tanzania-safari.json',
  'tanzania-safari-cost.json',
  'great-wildebeest-migration.json',
  'serengeti-national-park.json',
  'arusha-national-park.json',
];

const frDir = 'public/locales/fr/guides';
const enDir = 'public/locales/en/guides';
const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

let allOk = true;
for (const f of files) {
  const frPath = path.join(frDir, `${f}.json`);
  const en = JSON.parse(fs.readFileSync(path.join(enDir, `${f}.json`), 'utf8'));
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const enKeys = Object.keys(en).sort().join(',');
  const frKeys = Object.keys(fr).sort().join(',');
  const issues = [];
  if (enKeys !== frKeys) issues.push(`keys mismatch en=${enKeys} fr=${frKeys}`);
  if (fr.slug !== en.slug) issues.push(`slug mismatch ${fr.slug} vs ${en.slug}`);
  if (fr.category_name && fr.category_name !== 'Guides safari') issues.push(`bad category ${fr.category_name}`);
  if ((fr.html || '').includes('${AUTHOR.whatsapp}')) issues.push('leftover AUTHOR.whatsapp');
  if ((fr.html || '').includes('Our Team')) issues.push('leftover Our Team');
  // spot-check href paths preserved: extract hrefs from en and fr
  const hrefRe = /href="([^"]+)"/g;
  const enHrefs = [...(en.html || '').matchAll(hrefRe)].map((m) => m[1]).sort();
  const frHrefs = [...(fr.html || '').matchAll(hrefRe)].map((m) => m[1]).sort();
  // Normalize WA hrefs for comparison
  const norm = (arr) =>
    arr
      .map((h) => (h.startsWith('https://wa.me/') ? WA : h))
      .sort()
      .join('|');
  if (norm(enHrefs) !== norm(frHrefs)) {
    issues.push(`href set differs (en ${enHrefs.length} fr ${frHrefs.length})`);
  }
  // img attrs spot check
  const imgRe = /<img\b[^>]*>/g;
  const enImgs = [...(en.html || '').matchAll(imgRe)].map((m) => m[0].replace(/\salt="[^"]*"/g, ' alt=""'));
  const frImgs = [...(fr.html || '').matchAll(imgRe)].map((m) => m[0].replace(/\salt="[^"]*"/g, ' alt=""'));
  if (enImgs.length !== frImgs.length) issues.push(`img count ${enImgs.length} vs ${frImgs.length}`);
  for (let i = 0; i < Math.min(enImgs.length, frImgs.length); i++) {
    if (enImgs[i] !== frImgs[i]) issues.push(`img ${i} attrs differ after alt strip`);
  }
  if ((fr.faqs || []).length !== (en.faqs || []).length) issues.push('faq count mismatch');
  console.log(f, issues.length ? 'FAIL ' + issues.join('; ') : 'OK', 'html', fr.html.length, 'faqs', (fr.faqs || []).length);
  if (issues.length) allOk = false;
}

console.log('protected still present:', protectedExisting.every((p) => fs.existsSync(path.join(frDir, p))));
console.log('ALL_OK', allOk);
console.log('total_fr_guides', fs.readdirSync(frDir).filter((x) => x.endsWith('.json')).length);
