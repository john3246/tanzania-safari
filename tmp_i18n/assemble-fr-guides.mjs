import fs from 'fs';
import path from 'path';

const outDir = 'public/locales/fr/guides';
const srcDir = 'tmp_i18n/fr_parts';
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.json'));
let n = 0;
for (const f of files) {
  const obj = JSON.parse(fs.readFileSync(path.join(srcDir, f), 'utf8'));
  if (typeof obj.html === 'string') {
    obj.html = obj.html.replaceAll('${AUTHOR.whatsapp}', 'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.');
  }
  const name = f;
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(obj, null, 2) + '\n');
  n++;
  console.log('wrote', name);
}
console.log('total', n);
