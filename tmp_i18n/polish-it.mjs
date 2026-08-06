import fs from 'fs';
import path from 'path';

const IT = 'C:/Users/john/tanzania_safari/public/locales/it/guides';
const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

function polishString(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/John Raffaello Shayo/g, 'John Raphael Shayo')
    .replace(/WhatsApp Il nostro team/g, 'WhatsApp al nostro team')
    .replace(/\$\{AUTHOR\.whatsapp\}/g, WA)
    .replace(/\$\{TEAM\.whatsapp\}/g, WA)
    .replace(/https:\/\/wa\.me\/255695108009\?text=[^"'\s\\]*/g, WA);
}

let n = 0;
for (const f of fs.readdirSync(IT).filter((x) => x.endsWith('.json'))) {
  const p = path.join(IT, f);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const before = JSON.stringify(j);
  for (const k of Object.keys(j)) {
    if (typeof j[k] === 'string') j[k] = polishString(j[k]);
  }
  if (Array.isArray(j.faqs)) {
    j.faqs = j.faqs.map((faq) => ({
      q: polishString(faq.q),
      a: polishString(faq.a)
    }));
  }
  const after = JSON.stringify(j);
  if (after !== before) {
    fs.writeFileSync(p, JSON.stringify(j, null, 2));
    n++;
    console.log('polished', f);
  } else {
    console.log('unchanged', f);
  }
}
console.log('done', n);

// final count
const files = [
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
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(IT, f), 'utf8'));
  if (j.slug && j.html && j.html.length > 500) ok++;
}
console.log('FILES_WRITTEN', ok);
