import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/john/tanzania_safari/public/locales/es/guides';
const needle = '${AUTHOR.whatsapp}';
let leftover = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const html = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).html || '';
  const has = html.includes(needle);
  if (has) leftover++;
  console.log(f, 'AUTHOR leftover:', has, 'std WA count:', (html.match(/I%20want%20help%20planning%20a%20Tanzania%20safari/g) || []).length);
}
console.log('files with leftover:', leftover);
