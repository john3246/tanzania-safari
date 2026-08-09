/**
 * Local park/tour image catalogs + relevance filters for Glado remote URLs.
 * Prefer public/images/{park} folders; keep Glado links only when on-topic.
 */
const fs = require('fs');
const path = require('path');

const IMAGES_ROOT = path.join(__dirname, '..', 'public', 'images');
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

/** Local folder name → destination park_slug(s) */
const PARK_FOLDERS = {
  zanzibar: ['zanzibar'],
  serengeti: ['serengeti-national-park'],
  ngorongoro: ['ngorongoro-conservation-area'],
  manyara: ['lake-manyara-national-park'],
  kilimanjaro: ['mount-kilimanjaro-national-park'],
  'mount-meru': ['arusha-national-park'],
  'ol-doinyo-lengai': ['ol-doinyo-lengai'],
};

/** Detect trek mountain family from package slug / parks (not hub category alone). */
function detectMountainFamily({ packageSlug = '', parkSlugs = [], categorySlug = '' } = {}) {
  // Important: hub category "kilimanjaro" also hosts Meru & Lengai treks — never let
  // the category alone override a Meru/Lengai package slug.
  const slugBlob = `${packageSlug} ${parkSlugs.join(' ')}`.toLowerCase();
  const hasMeru = /meru|arusha-national/.test(slugBlob);
  const hasLengai = /lengai|oldoinyo|oldonyo|ol-don|natron/.test(slugBlob);
  const hasKili = /kilimanjaro|machame|marangu|lemosho|uhuru|kibo/.test(slugBlob);

  if (hasMeru && hasLengai) return 'meru_lengai';
  if (hasMeru) return 'meru';
  if (hasLengai) return 'lengai';
  if (hasKili) return 'kilimanjaro';
  if (categorySlug === 'kilimanjaro') return 'kilimanjaro';
  return null;
}

function isWrongMountainUrl(url, family) {
  if (!family || !url) return false;
  let hint = String(url || '').toLowerCase();
  try {
    hint = decodeURIComponent(hint.split('?')[0]);
  } catch (_) {
    /* keep raw */
  }
  if (family === 'meru') {
    return /\/kilimanjaro\/|kilimanjaro%20|kilimanjaro\s*\(|\/images\/kilimanjaro|lengai|oldoinyo|oldonyo/.test(hint);
  }
  if (family === 'lengai') {
    return /\/kilimanjaro\/|kilimanjaro%20|\/mount-meru\/|meru-trek|machame|marangu|lemosho/.test(hint) &&
      !/lengai|oldoinyo|oldonyo|natron/.test(hint);
  }
  if (family === 'kilimanjaro') {
    return /\/mount-meru\/|lengai|oldoinyo|oldonyo|meru-trek|3-day-mount-meru|4-day-mount-meru/.test(hint);
  }
  if (family === 'meru_lengai') {
    return /\/kilimanjaro\/|kilimanjaro%20|kilimanjaro\s*\(|\/images\/kilimanjaro/.test(hint);
  }
  return false;
}

/** Keywords that must appear in a Glado URL/filename for that park/category */
const RELEVANCE = {
  zanzibar: /zanzibar|nungwi|stone.?town|mnemba|spice.?island|paje|kendwa|matemwe|dhow|beach.?tour/i,
  'serengeti-national-park': /serengeti|migration|wildebeest|mara.?river|ndutu|seronera|leopard|lion|zebra|cheetah|savanna|savannah/i,
  'ngorongoro-conservation-area': /ngorongoro|crater|rhino/i,
  'tarangire-national-park': /tarangire|baobab|elephant/i,
  'lake-manyara-national-park': /manyara|flamingo|tree.?lion/i,
  'arusha-national-park': /arusha|meru|momella|miriakamba|saddle.?hut/i,
  'ol-doinyo-lengai': /lengai|oldoinyo|oldonyo|ol.?don|natron|eyasi/i,
  'mount-kilimanjaro-national-park': /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|alpine|summit|lava.?tower|barranco/i,
  safaris: /safari|serengeti|ngorongoro|tarangire|manyara|wildlife|lion|elephant|giraffe|zebra|cheetah|leopard|big.?five|game.?drive/i,
  migrations: /migration|wildebeest|serengeti|mara|ndutu|crossing|calving/i,
  kilimanjaro: /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|alpine|summit|lava.?tower|barranco/i,
  'group-safaris': /safari|serengeti|ngorongoro|wildlife|group|lion|elephant/i,
};

/** Stock Glado thumbs that appear on every product and are rarely place-specific */
const GENERIC_NOISE =
  /giraffes-6315586|pexels-dick-scholten|R-2-636x426|pexels-yg-pixel|pexels-droneafrica|248739_6488805c66a1d/i;

function toPublicUrl(absoluteFile) {
  const rel = path.relative(path.join(__dirname, '..', 'public'), absoluteFile).split(path.sep).join('/');
  return (
    '/' +
    rel
      .split('/')
      .map((seg) => encodeURIComponent(seg).replace(/'/g, '%27'))
      .join('/')
  );
}

function listImageFiles(dirAbs) {
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs)
    .filter((name) => IMAGE_EXT.test(name) && !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => toPublicUrl(path.join(dirAbs, name)));
}

function listRecursiveImages(dirAbs, limit = 40) {
  if (!fs.existsSync(dirAbs)) return [];
  const out = [];
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (out.length >= limit) return;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (IMAGE_EXT.test(ent.name)) out.push(toPublicUrl(full));
    }
  };
  walk(dirAbs);
  return out;
}

/** Cache folder listings once per process */
const _folderCache = new Map();
function imagesForParkSlug(parkSlug) {
  if (_folderCache.has(parkSlug)) return _folderCache.get(parkSlug);

  const urls = [];
  for (const [folder, slugs] of Object.entries(PARK_FOLDERS)) {
    if (!slugs.includes(parkSlug)) continue;
    urls.push(...listImageFiles(path.join(IMAGES_ROOT, folder)));
  }

  // destinations/{slug}/
  urls.push(...listImageFiles(path.join(IMAGES_ROOT, 'destinations', parkSlug)));
  // legacy short folder (e.g. destinations/zanzibar)
  if (parkSlug === 'zanzibar') {
    urls.push(...listImageFiles(path.join(IMAGES_ROOT, 'destinations', 'zanzibar')));
  }
  if (parkSlug === 'ngorongoro-conservation-area') {
    urls.push(...listImageFiles(path.join(IMAGES_ROOT, 'destinations', 'ngorongoro')));
  }

  // optimized webps whose filename matches the park
  const optDir = path.join(IMAGES_ROOT, 'optimized');
  if (fs.existsSync(optDir)) {
    const re =
      parkSlug === 'zanzibar'
        ? /zan/i
        : parkSlug === 'serengeti-national-park'
          ? /serengeti|migration|wildebeest|mara/i
          : parkSlug === 'ngorongoro-conservation-area'
            ? /ngorongoro/i
            : parkSlug === 'lake-manyara-national-park'
              ? /manyara/i
              : parkSlug === 'mount-kilimanjaro-national-park'
                ? /kilimanjaro|kili/i
                : parkSlug === 'tarangire-national-park'
                  ? /tarangire/i
                  : parkSlug === 'arusha-national-park'
                    ? /arusha|meru/i
                    : null;
    if (re) {
      for (const name of fs.readdirSync(optDir)) {
        if (IMAGE_EXT.test(name) && re.test(name)) {
          urls.push(toPublicUrl(path.join(optDir, name)));
        }
      }
    }
  }

  const unique = [...new Set(urls)];
  _folderCache.set(parkSlug, unique);
  return unique;
}

function imagesForPackageSlug(packageSlug) {
  if (!packageSlug) return [];
  const dir = path.join(IMAGES_ROOT, 'safaris', packageSlug);
  return listRecursiveImages(dir, 24);
}

function remoteFileHint(url) {
  try {
    const u = String(url || '');
    const base = u.split('?')[0];
    return decodeURIComponent(base).toLowerCase();
  } catch {
    return String(url || '').toLowerCase();
  }
}

/**
 * Keep Glado (or other remote) URLs only when relevant to category / parks.
 * Zanzibar is strict: filename/path must contain a Zanzibar keyword.
 */
function filterRelevantRemoteImages(urls, { categorySlug, parkSlugs = [] } = {}) {
  const list = (Array.isArray(urls) ? urls : []).filter(Boolean);
  const parks = parkSlugs.length
    ? parkSlugs
    : categorySlug === 'zanzibar'
      ? ['zanzibar']
      : categorySlug === 'kilimanjaro'
        ? ['mount-kilimanjaro-national-park']
        : categorySlug === 'migrations'
          ? ['serengeti-national-park']
          : [];

  return list.filter((url) => {
    const hint = remoteFileHint(url);
    if (!hint) return false;
    if (GENERIC_NOISE.test(hint)) return false;

    // Strict: never use a remote as “Zanzibar content” unless the URL mentions Zanzibar.
    // Combo bush-to-beach tours may still keep wildlife remotes that match other linked parks.
    if (categorySlug === 'zanzibar' && parks.length <= 1) {
      return RELEVANCE.zanzibar.test(hint);
    }
    if (parks.includes('zanzibar') && RELEVANCE.zanzibar.test(hint)) return true;

    const patterns = [];
    if (categorySlug && RELEVANCE[categorySlug]) patterns.push(RELEVANCE[categorySlug]);
    for (const p of parks) {
      if (p === 'zanzibar') continue; // Zanzibar remotes already handled above
      if (RELEVANCE[p]) patterns.push(RELEVANCE[p]);
    }
    // Pure Zanzibar category with only zanzibar park — already returned above
    if (categorySlug === 'zanzibar' && !patterns.length) {
      return RELEVANCE.zanzibar.test(hint);
    }
    if (!patterns.length) {
      return true;
    }
    return patterns.some((re) => re.test(hint));
  });
}

function uniqueUrls(list, max = 16) {
  const seen = new Set();
  const out = [];
  for (const u of list) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Build a full gallery for a tour: relevant Glado + local park/package folders.
 */
function buildPackageImages({
  categorySlug,
  parkSlugs = [],
  packageSlug,
  featuredImageUrl,
  imageUrls,
  minCount = 6,
  maxCount = 14,
} = {}) {
  const mountainFamily = detectMountainFamily({ packageSlug, parkSlugs, categorySlug });
  const remoteAll = [featuredImageUrl, ...(Array.isArray(imageUrls) ? imageUrls : [])].filter(Boolean);
  let remoteOk = filterRelevantRemoteImages(remoteAll, { categorySlug, parkSlugs });
  if (mountainFamily) {
    remoteOk = remoteOk.filter((u) => !isWrongMountainUrl(u, mountainFamily));
  }

  const local = [];
  let pkgLocal = imagesForPackageSlug(packageSlug);
  if (mountainFamily) {
    pkgLocal = pkgLocal.filter((u) => !isWrongMountainUrl(u, mountainFamily));
  }
  local.push(...pkgLocal);

  // Mountain-specific local pools (strict separation)
  if (mountainFamily === 'meru' || mountainFamily === 'meru_lengai') {
    local.push(...listImageFiles(path.join(IMAGES_ROOT, 'mount-meru')));
  }
  if (mountainFamily === 'lengai' || mountainFamily === 'meru_lengai') {
    local.push(...listImageFiles(path.join(IMAGES_ROOT, 'ol-doinyo-lengai')));
  }
  if (mountainFamily === 'kilimanjaro') {
    local.push(...listImageFiles(path.join(IMAGES_ROOT, 'kilimanjaro')));
  }

  // Prefer primary park images first
  const orderedParks = [...parkSlugs];
  if (categorySlug === 'zanzibar' && !orderedParks.includes('zanzibar')) orderedParks.unshift('zanzibar');
  if (
    (categorySlug === 'kilimanjaro' || mountainFamily === 'kilimanjaro') &&
    !orderedParks.includes('mount-kilimanjaro-national-park') &&
    mountainFamily !== 'meru' &&
    mountainFamily !== 'lengai' &&
    mountainFamily !== 'meru_lengai'
  ) {
    orderedParks.unshift('mount-kilimanjaro-national-park');
  }
  if ((mountainFamily === 'meru' || mountainFamily === 'meru_lengai') && !orderedParks.includes('arusha-national-park')) {
    orderedParks.unshift('arusha-national-park');
  }
  if (categorySlug === 'migrations' && !orderedParks.includes('serengeti-national-park')) {
    orderedParks.unshift('serengeti-national-park');
  }

  for (const slug of orderedParks) {
    // Never pull Kilimanjaro park folder into Meru/Lengai packages
    if (
      (mountainFamily === 'meru' || mountainFamily === 'lengai' || mountainFamily === 'meru_lengai') &&
      slug === 'mount-kilimanjaro-national-park'
    ) {
      continue;
    }
    // Never pull Meru folder into pure Kilimanjaro packages
    if (mountainFamily === 'kilimanjaro' && slug === 'arusha-national-park' && /meru|lengai/.test(packageSlug || '')) {
      continue;
    }
    local.push(...imagesForParkSlug(slug));
  }

  // Zanzibar: lead with local zanzibar folder, keep relevant Glado URLs, then other parks
  let ordered;
  if (categorySlug === 'zanzibar' || parkSlugs.includes('zanzibar')) {
    const zanLocal = imagesForParkSlug('zanzibar');
    const zanRemote = remoteOk.filter((u) => RELEVANCE.zanzibar.test(remoteFileHint(u)));
    const otherRemote = remoteOk.filter((u) => !RELEVANCE.zanzibar.test(remoteFileHint(u)));
    const otherLocal = local.filter((u) => !/\/images\/zanzibar\//i.test(u));
    ordered = [
      ...zanLocal.slice(0, 8),
      ...zanRemote,
      ...otherLocal.slice(0, 4),
      ...otherRemote.slice(0, 4),
      ...zanLocal.slice(8),
    ];
  } else if (mountainFamily === 'meru') {
    const meruPool = listImageFiles(path.join(IMAGES_ROOT, 'mount-meru'));
    ordered = [...pkgLocal, ...meruPool, ...remoteOk, ...local];
  } else if (mountainFamily === 'lengai') {
    const lengaiPool = listImageFiles(path.join(IMAGES_ROOT, 'ol-doinyo-lengai'));
    ordered = [...pkgLocal, ...lengaiPool, ...remoteOk, ...local];
  } else if (mountainFamily === 'meru_lengai') {
    const meruPool = listImageFiles(path.join(IMAGES_ROOT, 'mount-meru'));
    const lengaiPool = listImageFiles(path.join(IMAGES_ROOT, 'ol-doinyo-lengai'));
    ordered = [...pkgLocal, ...meruPool, ...lengaiPool, ...remoteOk, ...local];
  } else if (mountainFamily === 'kilimanjaro') {
    const kiliPool = listImageFiles(path.join(IMAGES_ROOT, 'kilimanjaro'));
    ordered = [...pkgLocal, ...kiliPool, ...remoteOk, ...local];
  } else {
    // Prefer relevant Glado, then package folder, then park folders
    ordered = [...remoteOk, ...pkgLocal, ...local.filter((u) => !pkgLocal.includes(u))];
  }

  if (mountainFamily) {
    ordered = ordered.filter((u) => !isWrongMountainUrl(u, mountainFamily));
  }

  let gallery = uniqueUrls(ordered, maxCount);

  // Pad from mountain-safe local parks until minCount
  if (gallery.length < minCount) {
    let fillers = [];
    if (mountainFamily === 'meru' || mountainFamily === 'meru_lengai') {
      fillers = listImageFiles(path.join(IMAGES_ROOT, 'mount-meru'));
    } else if (mountainFamily === 'lengai') {
      fillers = listImageFiles(path.join(IMAGES_ROOT, 'ol-doinyo-lengai'));
    } else if (mountainFamily === 'kilimanjaro') {
      fillers = listImageFiles(path.join(IMAGES_ROOT, 'kilimanjaro'));
    } else if (orderedParks.length) {
      fillers = orderedParks.flatMap((s) => imagesForParkSlug(s));
    } else {
      fillers = imagesForParkSlug('serengeti-national-park');
    }
    gallery = uniqueUrls([...gallery, ...fillers], Math.max(minCount, gallery.length));
  }

  // Last resort: classic safari optimized heroes (never for pure mountain packages)
  if (gallery.length < Math.min(3, minCount) && !mountainFamily) {
    const fallbacks = [
      '/images/optimized/serengeti-national-park.webp',
      '/images/optimized/ngorongoro-conservation-area.webp',
      '/images/optimized/balloon.webp',
    ].filter((u) => fs.existsSync(path.join(__dirname, '..', 'public', u.replace(/^\//, '').replace(/\//g, path.sep))));
    gallery = uniqueUrls([...gallery, ...fallbacks], minCount);
  }

  if (mountainFamily) {
    gallery = gallery.filter((u) => !isWrongMountainUrl(u, mountainFamily));
  }

  const featured = gallery[0] || null;
  return { featured_image_url: featured, image_urls: gallery };
}

/**
 * Destination gallery from local park folder (+ destinations/ + optimized).
 */
function buildDestinationImages(parkSlug, { minCount = 4, maxCount = 16 } = {}) {
  let gallery = uniqueUrls(imagesForParkSlug(parkSlug), maxCount);
  if (gallery.length < minCount) {
    const destMain = path.join(IMAGES_ROOT, 'destinations', parkSlug, 'main.jpg');
    if (fs.existsSync(destMain)) gallery = uniqueUrls([...gallery, toPublicUrl(destMain)], maxCount);
  }
  return gallery;
}

function allParkSlugsWithLocalImages() {
  const slugs = new Set();
  for (const list of Object.values(PARK_FOLDERS)) list.forEach((s) => slugs.add(s));
  const destRoot = path.join(IMAGES_ROOT, 'destinations');
  if (fs.existsSync(destRoot)) {
    for (const ent of fs.readdirSync(destRoot, { withFileTypes: true })) {
      if (ent.isDirectory()) slugs.add(ent.name);
    }
  }
  return [...slugs];
}

module.exports = {
  PARK_FOLDERS,
  RELEVANCE,
  imagesForParkSlug,
  imagesForPackageSlug,
  filterRelevantRemoteImages,
  buildPackageImages,
  buildDestinationImages,
  allParkSlugsWithLocalImages,
  detectMountainFamily,
  isWrongMountainUrl,
  toPublicUrl,
};
