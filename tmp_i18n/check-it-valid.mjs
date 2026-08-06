import fs from 'fs';
import path from 'path';

const IT = 'C:/Users/john/tanzania_safari/public/locales/it/guides';
const files = fs.readdirSync(IT).filter((x) => x.endsWith('.json'));
for (const f of files) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(IT, f), 'utf8'));
    console.log('OK', f, j.html?.length);
  } catch (e) {
    console.log('BAD', f, e.message.slice(0, 80));
  }
}
