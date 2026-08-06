/**
 * Continue IT translation from EN backup (avoids corrupted locales/en/guides).
 * Skips files already present and valid in it/guides.
 */
import fs from 'fs';
import path from 'path';

const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

const EN_DIR = 'C:/Users/john/tanzania_safari/tmp_i18n/en-guides-backup';
const IT_DIR = 'C:/Users/john/tanzania_safari/public/locales/it/guides';
fs.mkdirSync(IT_DIR, { recursive: true });

const FILES = [
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

const cache = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isValidIt(file) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(IT_DIR, file), 'utf8'));
    return j && j.slug && typeof j.html === 'string' && j.html.length > 500 && !j.html.startsWith('{https');
  } catch {
    return false;
  }
}

async function gtx(text) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=it&dt=t&q=' +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return (data[0] || []).map((row) => row[0]).join('');
}

async function translateText(text) {
  const lead = text.match(/^\s*/)?.[0] || '';
  const trail = text.match(/\s*$/)?.[0] || '';
  const core = text.slice(lead.length, text.length - trail.length);
  if (!core) return text;
  if (!/[A-Za-z]/.test(core)) return text;
  if (cache.has(core)) return lead + cache.get(core) + trail;

  const chunks = [];
  let remaining = core;
  while (remaining.length > 1400) {
    let cut = remaining.lastIndexOf('. ', 1400);
    if (cut < 400) cut = remaining.lastIndexOf(' ', 1400);
    if (cut < 400) cut = 1400;
    chunks.push(remaining.slice(0, cut + 1));
    remaining = remaining.slice(cut + 1);
  }
  if (remaining) chunks.push(remaining);

  let translated = '';
  for (const chunk of chunks) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        translated += await gtx(chunk);
        await sleep(100);
        break;
      } catch (e) {
        await sleep(400 * (attempt + 1));
        if (attempt === 4) {
          console.warn('fail', chunk.slice(0, 40), e.message);
          translated += chunk;
        }
      }
    }
  }

  // Preserve proper names / brand phrases
  translated = translated
    .replace(/John Raffaello Shayo/g, 'John Raphael Shayo')
    .replace(/WhatsApp Il nostro team/g, 'WhatsApp al nostro team')
    .replace(/WhatsApp Our Team/gi, 'WhatsApp al nostro team');

  cache.set(core, translated);
  return lead + translated + trail;
}

async function replaceAttr(tag, attr) {
  const re = new RegExp(`(\\s${attr}\\s*=\\s*")([^"]*)(")`, 'i');
  const m = tag.match(re);
  if (!m || !m[2].trim() || !/[A-Za-z]/.test(m[2])) return tag;
  const translated = await translateText(m[2]);
  return tag.replace(re, `$1${translated.replace(/"/g, '&quot;')}$3`);
}

async function translateHtml(html) {
  const parts = html.split(/(<[^>]+>)/g);
  const out = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('<')) {
      let tag = part;
      tag = await replaceAttr(tag, 'alt');
      tag = await replaceAttr(tag, 'title');
      tag = await replaceAttr(tag, 'aria-label');
      out.push(tag);
    } else {
      out.push(await translateText(part));
    }
  }
  return out.join('');
}

async function translateGuide(file) {
  if (isValidIt(file)) {
    console.log('skip (exists)', file);
    return;
  }
  const enPath = path.join(EN_DIR, file);
  if (!fs.existsSync(enPath)) throw new Error('missing backup ' + file);
  const j = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  console.log('→', file);

  const it = { slug: j.slug };
  if (j.title != null) it.title = (await translateText(j.title)).trim();
  if (j.meta_title != null) it.meta_title = (await translateText(j.meta_title)).trim();
  if (j.meta_description != null) it.meta_description = (await translateText(j.meta_description)).trim();
  if (j.excerpt != null) it.excerpt = (await translateText(j.excerpt)).trim();
  if (j.category_name != null) it.category_name = (await translateText(j.category_name)).trim();
  if (j.h1 != null) it.h1 = (await translateText(j.h1)).trim();

  let html = await translateHtml(j.html);
  html = html
    .replace(/\$\{AUTHOR\.whatsapp\}/g, WA)
    .replace(/\$\{TEAM\.whatsapp\}/g, WA)
    .replace(/https:\/\/wa\.me\/255695108009\?text=[^"'\s]*/g, WA)
    .replace(/John Raffaello Shayo/g, 'John Raphael Shayo')
    .replace(/WhatsApp Il nostro team/g, 'WhatsApp al nostro team');
  it.html = html;

  it.faqs = [];
  for (const faq of j.faqs || []) {
    it.faqs.push({
      q: (await translateText(faq.q)).trim(),
      a: (await translateText(faq.a)).trim()
    });
  }

  fs.writeFileSync(path.join(IT_DIR, file), JSON.stringify(it, null, 2), 'utf8');
  console.log('  wrote', file);
}

for (const f of FILES) {
  await translateGuide(f);
}
console.log('DONE', FILES.length);

// Restore clean EN from backup
const enLive = 'C:/Users/john/tanzania_safari/public/locales/en/guides';
fs.mkdirSync(enLive, { recursive: true });
for (const f of FILES) {
  fs.copyFileSync(path.join(EN_DIR, f), path.join(enLive, f));
}
console.log('Restored EN from backup');
