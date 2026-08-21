/**
 * Convert public/images JPEG/PNG to WebP and recompress oversized WebP.
 * Usage: node scripts/compress-to-webp.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'public', 'images');
const RAW = /\.(jpe?g|png)$/i;
const WEBP = /\.webp$/i;
const MAX_PHOTO = 1600;
const MAX_HERO = 1920;
const MAX_LOGO = 320;
const QUALITY = 80;
const LOGO_QUALITY = 86;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (RAW.test(ent.name) || WEBP.test(ent.name)) out.push(full);
  }
  return out;
}

function isLogo(file) {
  const base = path.basename(file).toLowerCase();
  return base.includes('logo');
}

function maxWidth(file) {
  const base = path.basename(file).toLowerCase();
  if (base.startsWith('hero.')) return MAX_HERO;
  if (isLogo(file)) return MAX_LOGO;
  return MAX_PHOTO;
}

async function toWebp(source, dest, { width, quality }) {
  const tmp = dest + '.tmp';
  await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(tmp);
  const srcSize = fs.statSync(source).size;
  const outSize = fs.statSync(tmp).size;
  if (outSize >= srcSize && WEBP.test(source) && path.resolve(source) === path.resolve(dest)) {
    fs.unlinkSync(tmp);
    return { skipped: true, srcSize, outSize: srcSize };
  }
  fs.renameSync(tmp, dest);
  return { skipped: false, srcSize, outSize };
}

async function compressPngLogo(file) {
  const buf = fs.readFileSync(file);
  const tmp = file + '.tmp';
  await sharp(buf)
    .rotate()
    .resize({ width: MAX_LOGO, height: MAX_LOGO, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(tmp);
  const srcSize = fs.statSync(file).size;
  const outSize = fs.statSync(tmp).size;
  if (outSize < srcSize) {
    fs.renameSync(tmp, file);
    return { srcSize, outSize };
  }
  fs.unlinkSync(tmp);
  return { srcSize, outSize: srcSize, skipped: true };
}

async function run() {
  const files = walk(ROOT);
  let saved = 0;
  let converted = 0;
  let recompressed = 0;

  for (const file of files) {
    const ext = path.extname(file);
    const width = maxWidth(file);
    const quality = isLogo(file) ? LOGO_QUALITY : QUALITY;

    if (RAW.test(ext)) {
      const dest = file.replace(RAW, '.webp');
      try {
        const r = await toWebp(file, dest, { width, quality });
        converted += 1;
        saved += Math.max(0, r.srcSize - r.outSize);
        console.log(
          `WEBP  ${path.relative(ROOT, dest)}  ${(r.srcSize / 1024).toFixed(0)}KB -> ${(r.outSize / 1024).toFixed(0)}KB`
        );
      } catch (e) {
        console.error('FAIL', file, e.message);
      }

      if (path.basename(file).toLowerCase() === 'logo.png') {
        try {
          const r = await compressPngLogo(file);
          if (!r.skipped) {
            saved += Math.max(0, r.srcSize - r.outSize);
            console.log(
              `PNG   logo.png  ${(r.srcSize / 1024).toFixed(0)}KB -> ${(r.outSize / 1024).toFixed(0)}KB`
            );
          }
        } catch (e) {
          console.error('FAIL logo png', e.message);
        }
      }
    } else if (WEBP.test(ext)) {
      const size = fs.statSync(file).size;
      if (size < 220 * 1024) continue;
      try {
        const r = await toWebp(file, file, { width, quality });
        if (!r.skipped && r.outSize < r.srcSize) {
          recompressed += 1;
          saved += r.srcSize - r.outSize;
          console.log(
            `REZIP ${path.relative(ROOT, file)}  ${(r.srcSize / 1024).toFixed(0)}KB -> ${(r.outSize / 1024).toFixed(0)}KB`
          );
        }
      } catch (e) {
        console.error('FAIL recompress', file, e.message);
      }
    }
  }

  console.log(
    `\nConverted ${converted} files, recompressed ${recompressed}, saved ~${(saved / 1024 / 1024).toFixed(2)} MB vs originals.`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
