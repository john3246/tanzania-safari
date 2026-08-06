import fs from 'fs';
import path from 'path';

const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';
const dir = 'C:/Users/john/tanzania_safari/public/locales/en/guides';
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

for (const f of files) {
  const p = path.join(dir, f);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const before = (j.html || '').includes('${AUTHOR.whatsapp}');
  j.html = (j.html || '').split('${AUTHOR.whatsapp}').join(WA);
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
  console.log(f, 'slug', j.slug, 'html', j.html.length, 'faqs', (j.faqs||[]).length, 'replaced', before);
  // write text-only extract for translation reference
  const text = j.html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  fs.writeFileSync(path.join('C:/Users/john/tanzania_safari/tmp_i18n', f.replace('.json', '.txt')), text);
}
