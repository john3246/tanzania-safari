import fs from 'fs';
import path from 'path';

const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';
const IT = 'C:/Users/john/tanzania_safari/public/locales/it/guides';
const EN = 'C:/Users/john/tanzania_safari/tmp_i18n/en-guides-backup';
const FILES = [
  'tanzania-safari.json',
  'tanzania-safari-cost.json',
  'best-time-to-visit-tanzania.json',
  'great-wildebeest-migration.json',
  'serengeti-national-park.json',
  'ngorongoro-crater.json',
  'zanzibar-guide.json',
  'arusha-national-park.json',
  'dest-serengeti-national-park.json',
  'dest-ngorongoro-conservation-area.json',
  'dest-mount-kilimanjaro-national-park.json',
];

let ok = 0;
for (const f of FILES) {
  const it = JSON.parse(fs.readFileSync(path.join(IT, f), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(EN, f), 'utf8'));
  const leftovers = (it.html.match(/\$\{[^}]+\}/g) || []);
  const waOk = !it.html.includes('${AUTHOR.whatsapp}') && !it.html.includes('${TEAM.whatsapp}');
  const waCanon = it.html.includes(WA) || !it.html.includes('wa.me');
  const sameSlug = it.slug === en.slug;
  const faqsMatch = (it.faqs || []).length === (en.faqs || []).length;
  const hrefsEn = (en.html.match(/href="[^"]+"/g) || []).sort().join('|');
  const hrefsIt = (it.html.match(/href="[^"]+"/g) || []).sort().join('|');
  // wa hrefs may all be normalized — compare non-wa hrefs
  const norm = (s) =>
    (s.match(/href="[^"]+"/g) || [])
      .filter((h) => !h.includes('wa.me'))
      .sort()
      .join('|');
  const hrefsSame = norm(en.html) === norm(it.html);
  const classesSame =
    (en.html.match(/class="[^"]+"/g) || []).sort().join('|') ===
    (it.html.match(/class="[^"]+"/g) || []).sort().join('|');
  const titleIt = /[àèéìòù]|Safari|Guida|Tanzania|Zanzibar|Serengeti|Ngorongoro|Kilimanjaro|Kilimangiaro|Arusha|migrazione|costo|periodo/i.test(
    it.title || it.h1 || ''
  );
  console.log(
    f,
    'slug',
    sameSlug,
    'faqs',
    faqsMatch,
    (it.faqs || []).length,
    'leftover',
    leftovers.length,
    'wa',
    waOk,
    'hrefs',
    hrefsSame,
    'classes',
    classesSame,
    'titleIT?',
    titleIt,
    'html',
    it.html.length
  );
  if (sameSlug && faqsMatch && leftovers.length === 0 && waOk && hrefsSame && classesSame) ok++;
}
console.log('VALID', ok, '/', FILES.length);

// Also restore EN live from backup again
const enLive = 'C:/Users/john/tanzania_safari/public/locales/en/guides';
fs.mkdirSync(enLive, { recursive: true });
for (const f of FILES) {
  fs.copyFileSync(path.join(EN, f), path.join(enLive, f));
}
// remove corrupt non-requested duplicates if huge
for (const extra of ['mount-kilimanjaro-national-park.json', 'ngorongoro-conservation-area.json']) {
  const p = path.join(enLive, extra);
  if (fs.existsSync(p) && fs.statSync(p).size > 100000) {
    fs.unlinkSync(p);
    console.log('deleted corrupt', extra);
  }
}
console.log('EN restored');
