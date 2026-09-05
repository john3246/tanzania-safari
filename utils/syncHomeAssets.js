/**
 * Locate "experinces photos" images and the Dar es Salaam FAQ background,
 * then write public/data JSON for the homepage.
 */
const fs = require('fs');
const path = require('path');
const { tagFromExperienceFile } = require('./experienceTags');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const SKIP = new Set([
  'node_modules',
  '.git',
  'logs',
  '.cursor',
  '.cursor-server',
  '.npm',
  '.cache',
  'dist',
  'snap',
  '.pm2',
  '.local',
  '.config'
]);
const SEARCH_ROOTS = [
  '/var/www/tanzania_safari',
  '/var/www',
  '/root',
  '/home'
];

function walkDirs(dir, depth, acc, maxDepth) {
  if (depth > maxDepth) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith('.') || SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    acc.push(full);
    walkDirs(full, depth + 1, acc, maxDepth);
  }
}

function toPublicUrl(absFile) {
  if (!absFile) return null;
  if (absFile.startsWith(PUBLIC + path.sep) || absFile === PUBLIC) {
    const rel = path.relative(PUBLIC, absFile).split(path.sep).join('/');
    return '/' + rel.split('/').map(encodeURIComponent).join('/');
  }
  const uploads = path.join(ROOT, 'uploads');
  if (absFile.startsWith(uploads + path.sep)) {
    const rel = path.relative(uploads, absFile).split(path.sep).join('/');
    return '/uploads/' + rel.split('/').map(encodeURIComponent).join('/');
  }
  return null;
}

function tagFromName(filename) {
  return tagFromExperienceFile(filename);
}

function listImages(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((name) => IMAGE_EXT.test(name) && !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((name) => {
        const abs = path.join(dir, name);
        return { src: toPublicUrl(abs), tag: tagFromName(name), file: name, abs };
      });
  } catch {
    return [];
  }
}

function isExperienceDirName(name) {
  const n = String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return (n.includes('experin') || n.includes('experienc')) && n.includes('photo');
}

function copyExperienceImages(sourceDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const imgs = listImages(sourceDir);
  const copied = [];
  for (const s of imgs) {
    const dest = path.join(destDir, s.file);
    try {
      fs.copyFileSync(s.abs, dest);
      copied.push(s.file);
    } catch {}
  }
  return copied;
}

function findNamedImages(dirs, nameRe) {
  const hits = [];
  for (const dir of dirs) {
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of files) {
      if (nameRe.test(name) && IMAGE_EXT.test(name)) {
        const abs = path.join(dir, name);
        hits.push({ file: name, abs, src: toPublicUrl(abs) });
      }
    }
  }
  return hits;
}

function syncHomeAssets() {
  const dirs = [];
  for (const root of SEARCH_ROOTS) {
    if (fs.existsSync(root)) walkDirs(root, 0, dirs, root === ROOT || root === '/var/www/tanzania_safari' ? 6 : 4);
  }

  const destExpDir = path.join(PUBLIC, 'images', 'experinces photos');
  if (!fs.existsSync(destExpDir)) fs.mkdirSync(destExpDir, { recursive: true });
  const destExpDirTwoSpaces = path.join(PUBLIC, 'images', 'experinces  photos');
  if (!fs.existsSync(destExpDirTwoSpaces)) fs.mkdirSync(destExpDirTwoSpaces, { recursive: true });

  const experienceDirs = dirs.filter((d) => isExperienceDirName(path.basename(d)));
  const assetDirs = dirs.filter((d) => /^assets$/i.test(path.basename(d)));

  const candidateDirs = [
    destExpDirTwoSpaces,
    destExpDir,
    ...experienceDirs
  ].filter((d, i, arr) => d && arr.findIndex((x) => path.resolve(x) === path.resolve(d)) === i);

  let usedDir = null;
  for (const dir of candidateDirs) {
    const imgs = listImages(dir);
    if (imgs.length) {
      usedDir = dir;
      break;
    }
  }

  const destImages = usedDir ? listImages(usedDir) : [];
  const folderName = usedDir ? path.basename(usedDir) : 'experinces photos';
  const slides = destImages
    .filter((s) => s.src)
    .map((s) => ({
      src: s.src || ('/images/' + encodeURIComponent(folderName) + '/' + encodeURIComponent(s.file)),
      tag: s.tag,
      file: s.file
    }));

  const darSearch = [
    ...assetDirs,
    path.join(PUBLIC, 'images'),
    path.join(PUBLIC, 'images', 'optimized'),
    path.join(PUBLIC, 'images', 'assets'),
    ...experienceDirs
  ];
  const darHits = findNamedImages(darSearch, /dar\s*es\s*sala[a]?m/i);

  const optDir = path.join(PUBLIC, 'images', 'optimized');
  if (!fs.existsSync(optDir)) fs.mkdirSync(optDir, { recursive: true });
  const hyphenWebp = path.join(optDir, 'dar-es-salaam.webp');
  let darSource = darHits[0] ? darHits[0].abs : null;
  let darPublic = null;
  if (darSource) {
    try {
      fs.copyFileSync(darSource, hyphenWebp);
      darPublic = '/images/optimized/dar-es-salaam.webp';
    } catch {
      darPublic = darHits[0].src;
    }
  } else if (fs.existsSync(hyphenWebp)) {
    darPublic = '/images/optimized/dar-es-salaam.webp';
    darSource = hyphenWebp;
  }

  const imageRoot = path.join(PUBLIC, 'images');
  let imageRootEntries = [];
  try {
    imageRootEntries = fs.readdirSync(imageRoot);
  } catch {}

  const report = {
    scannedAt: new Date().toISOString(),
    searchRoots: SEARCH_ROOTS,
    skipped: Array.from(SKIP),
    experienceFolder: {
      found: Boolean(usedDir),
      sourcePath: usedDir,
      destinationPath: destExpDirTwoSpaces,
      dirsFound: experienceDirs,
      fileList: destImages.map((s) => s.file)
    },
    darEsSalaamImage: {
      found: Boolean(darSource),
      sourcePath: darSource,
      destinationPath: fs.existsSync(hyphenWebp) ? hyphenWebp : null,
      publicUrl: darPublic,
      hits: darHits
    },
    assetDirs,
    slideCount: slides.length,
    imageRootEntries
  };

  const dataDir = path.join(PUBLIC, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, '_asset-scan.json'), JSON.stringify(report, null, 2) + '\n');
  const slidesJson = JSON.stringify({ slides: slides.map(({ src, tag }) => ({ src, tag })) }, null, 2) + '\n';
  fs.writeFileSync(path.join(dataDir, 'experiences-photos.json'), slidesJson);
  const onGroundDir = path.join(PUBLIC, 'images', 'experinces on ground');
  const onGroundSlides = listImages(onGroundDir)
    .filter((s) => s.src)
    .map((s) => ({ src: s.src, tag: s.tag }));
  fs.writeFileSync(
    path.join(dataDir, 'experiences-on-ground.json'),
    JSON.stringify({ slides: onGroundSlides.length ? onGroundSlides : slides.map(({ src, tag }) => ({ src, tag })) }, null, 2) + '\n'
  );
  if (darPublic) {
    fs.writeFileSync(path.join(dataDir, 'dar-es-salaam.json'), JSON.stringify({ src: darPublic }, null, 2) + '\n');
  }

  return report;
}

module.exports = { syncHomeAssets };

if (require.main === module) {
  console.log(JSON.stringify(syncHomeAssets(), null, 2));
}
