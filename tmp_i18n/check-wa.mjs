import fs from 'fs';
const files = [
  'best-time-to-visit-tanzania',
  'ngorongoro-crater',
  'zanzibar-guide',
  'dest-serengeti-national-park',
  'dest-ngorongoro-conservation-area',
  'dest-mount-kilimanjaro-national-park',
];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(`public/locales/en/guides/${f}.json`, 'utf8'));
  const h = j.html || '';
  console.log('===', f);
  console.log('has ${AUTHOR.whatsapp}:', h.includes('${AUTHOR.whatsapp}'));
  const matches = [...h.matchAll(/href="([^"]*wa\.me[^"]*|\$\{AUTHOR\.whatsapp\})"/g)].map((m) => m[1]);
  console.log('hrefs:', matches);
}
