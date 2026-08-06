const fs = require('fs');
const dir = 'C:/Users/john/tanzania_safari/public/locales/fr/guides/';
const enDir = 'C:/Users/john/tanzania_safari/public/locales/en/guides/';
const needed = [
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
  'dest-mount-kilimanjaro-national-park'
];
const authorMarker = '${AUTHOR.whatsapp}';
const enHints = [
  'How much does',
  'Best Time to Visit',
  'In This Guide',
  'Get a Free Quote',
  'WhatsApp Our Team',
  'Request a Free Quote',
  'Book Your'
];
let ok = 0;
for (const f of needed) {
  const p = dir + f + '.json';
  if (!fs.existsSync(p)) {
    console.log('MISSING', f);
    continue;
  }
  let j;
  try {
    j = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.log('INVALID', f, e.message);
    continue;
  }
  const en = JSON.parse(fs.readFileSync(enDir + f + '.json', 'utf8'));
  const issues = [];
  if (j.slug !== en.slug) issues.push('slug mismatch');
  if (!j.html || j.html.length < 500) issues.push('html short ' + ((j.html || '').length));
  if ((j.faqs || []).length !== (en.faqs || []).length) {
    issues.push('faq count ' + (j.faqs || []).length + ' vs ' + (en.faqs || []).length);
  }
  if (j.html.includes(authorMarker)) issues.push('AUTHOR leftover');
  const found = enHints.filter((h) => j.html.includes(h));
  if (found.length) issues.push('EN leftovers: ' + found.join('|'));
  if (j.title === en.title) issues.push('title still EN');
  const size = fs.statSync(p).size;
  console.log(
    f +
      ': bytes=' +
      size +
      ' html=' +
      j.html.length +
      ' faqs=' +
      (j.faqs || []).length +
      (issues.length ? ' ISSUES: ' + issues.join('; ') : ' OK')
  );
  if (!issues.length) ok++;
}
console.log('OK_COUNT', ok, '/', needed.length);
console.log(
  'DIR_FILES',
  fs.readdirSync(dir).filter((x) => x.endsWith('.json')).length
);
