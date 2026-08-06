import fs from 'fs';

const p = 'C:/Users/john/tanzania_safari/public/locales/en/guides/tanzania-safari.json';
const raw = fs.readFileSync(p, 'utf8');
console.log('len', raw.length);
console.log('start', JSON.stringify(raw.slice(0, 300)));
console.log('end', JSON.stringify(raw.slice(-200)));
console.log('starts with brace', raw[0] === '{');
console.log('AUTHOR leftover', raw.includes('${AUTHOR.whatsapp}'));
console.log('wa.me count', (raw.match(/wa\.me/g) || []).length);
