import fs from 'fs';

const files = fs.readdirSync('C:/Users/john/tanzania_safari/public/locales/en/guides').filter(f => f.endsWith('.json'));
for (const f of files) {
  const raw = fs.readFileSync('C:/Users/john/tanzania_safari/public/locales/en/guides/' + f, 'utf8');
  let ok = false;
  try { JSON.parse(raw); ok = true; } catch (e) { ok = e.message.slice(0, 80); }
  console.log(f, 'len', raw.length, 'start', JSON.stringify(raw.slice(0, 80)), 'parse', ok);
}
