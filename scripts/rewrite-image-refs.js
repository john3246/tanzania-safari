/**
 * Point local /images/*.jpg|jpeg|png references at .webp when the file exists.
 * Skips logo.png (favicon / email). Usage: node scripts/rewrite-image-refs.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const TARGETS = [
  path.join(ROOT, 'views'),
  path.join(ROOT, 'public', 'js'),
  path.join(ROOT, 'public', 'includes'),
  path.join(ROOT, 'public', 'locales'),
  path.join(ROOT, 'routes'),
  path.join(ROOT, 'utils')
];
const SKIP_DIRS = new Set(['node_modules', 'tmp_i18n', '.git']);
const TEXT = /\.(html|js|json|css)$/i;
const RE = /\/images\/([^"'?\s]+)\.(jpe?g|png)/gi;

function webpExists(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const abs = path.join(IMAGES, decoded.split('/').join(path.sep));
  return fs.existsSync(abs);
}

function rewriteContent(text) {
  return text.replace(RE, (match, rel, ext) => {
    const lower = match.toLowerCase();
    if (lower.endsWith('/images/logo.png')) return match;
    const webpRel = rel + '.webp';
    if (!webpExists(webpRel)) return match;
    const encoded = rel.includes('%') ? rel : rel.split('/').map(encodeURIComponent).join('/').replace(/%20/g, '%20');
    // Keep original encoding style
    return `/images/${rel}.webp`;
  });
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, files);
    else if (TEXT.test(ent.name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const dir of TARGETS) {
  for (const file of walk(dir)) {
    const before = fs.readFileSync(file, 'utf8');
    const after = rewriteContent(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed += 1;
      console.log('updated', path.relative(ROOT, file));
    }
  }
}
console.log('rewrote', changed, 'files');
