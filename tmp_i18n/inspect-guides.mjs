import fs from 'fs';
import path from 'path';

const files = [
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

const dir = 'C:/Users/john/tanzania_safari/public/locales/en/guides';
const outDir = 'C:/Users/john/tanzania_safari/tmp_i18n/guide-text-en';
fs.mkdirSync(outDir, { recursive: true });

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8'));
  const html = (j.html || '').replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '[B64]');
  console.log('===', f, '===');
  console.log('keys:', Object.keys(j).join(','));
  console.log('title:', j.title);
  console.log('meta_title:', j.meta_title);
  console.log('meta_description:', (j.meta_description || '').slice(0, 120));
  console.log('excerpt:', (j.excerpt || '').slice(0, 120));
  console.log('category_name:', j.category_name);
  console.log('h1:', j.h1);
  console.log('html stripped len:', html.length);
  console.log('faqs:', (j.faqs || []).length);
  console.log('has AUTHOR.whatsapp:', (j.html || '').includes('${AUTHOR.whatsapp}'));
  console.log('');

  // Write stripped version for translation reference
  const slim = {
    slug: j.slug,
    title: j.title,
    meta_title: j.meta_title,
    meta_description: j.meta_description,
    excerpt: j.excerpt,
    category_name: j.category_name,
    h1: j.h1,
    html: html,
    faqs: j.faqs,
  };
  fs.writeFileSync(path.join(outDir, f + '.json'), JSON.stringify(slim, null, 2));
}
console.log('Wrote slim files to', outDir);
