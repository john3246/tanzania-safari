import fs from 'fs';
import path from 'path';

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
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const leftovers = (j.html.match(/\$\{[^}]+\}/g) || []);
  const wa = (j.html.match(/wa\.me\/[^"'\s]+/g) || []);
  const uniqueWa = [...new Set(wa)];
  console.log(f, 'ok', leftovers.length ? leftovers : 'clean', 'wa variants', uniqueWa.length, uniqueWa[0]?.slice(0, 60));
}
