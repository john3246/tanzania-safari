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
  tarangire: ['tarangire-national-park'],
  arusha: ['arusha-national-park'],
};

/** Keywords that must appear in a Glado URL/filename for that park/category */
const RELEVANCE = {
  zanzibar: /zanzibar|nungwi|stone.?town|mnemba|spice.?island|paje|kendwa|matemwe|dhow|beach.?tour/i,
  'serengeti-national-park': /serengeti|migration|wildebeest|mara.?river|ndutu|seronera|leopard|lion|zebra|cheetah|savanna|savannah/i,
  'ngorongoro-conservation-area': /ngorongoro|crater|rhino/i,
  'tarangire-national-park': /tarangire|baobab|elephant/i,
  'lake-manyara-national-park': /manyara|flamingo|tree.?lion/i,
  'arusha-national-park': /arusha|meru|momella/i,
  'mount-kilimanjaro-national-park': /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|alpine|summit|trek|mountain/i,
  safaris: /safari|serengeti|ngorongoro|tarangire|manyara|wildlife|lion|elephant|giraffe|zebra|cheetah|leopard|big.?five|game.?drive/i,
  migrations: /migration|wildebeest|serengeti|mara|ndutu|crossing|calving/i,
  kilimanjaro: /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|alpine|summit|trek|mountain/i,
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
  const remoteAll = [featuredImageUrl, ...(Array.isArray(imageUrls) ? imageUrls : [])].filter(Boolean);
  const remoteOk = filterRelevantRemoteImages(remoteAll, { categorySlug, parkSlugs });

  const local = [];
  const pkgLocal = imagesForPackageSlug(packageSlug);
  local.push(...pkgLocal);

  // Prefer primary park images first
  const orderedParks = [...parkSlugs];
  if (categorySlug === 'zanzibar' && !orderedParks.includes('zanzibar')) orderedParks.unshift('zanzibar');
  if (categorySlug === 'kilimanjaro' && !orderedParks.includes('mount-kilimanjaro-national-park')) {
    orderedParks.unshift('mount-kilimanjaro-national-park');
  }
  if (categorySlug === 'migrations' && !orderedParks.includes('serengeti-national-park')) {
    orderedParks.unshift('serengeti-national-park');
  }

  for (const slug of orderedParks) {
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
  } else {
    // Prefer relevant Glado, then package folder, then park folders
    ordered = [...remoteOk, ...pkgLocal, ...local.filter((u) => !pkgLocal.includes(u))];
  }

  let gallery = uniqueUrls(ordered, maxCount);

  // Pad from local parks until minCount
  if (gallery.length < minCount) {
    const fillers = orderedParks.length
      ? orderedParks.flatMap((s) => imagesForParkSlug(s))
      : imagesForParkSlug('serengeti-national-park');
    gallery = uniqueUrls([...gallery, ...fillers], Math.max(minCount, gallery.length));
  }

  // Last resort: classic safari optimized heroes
  if (gallery.length < Math.min(3, minCount)) {
    const fallbacks = [
      '/images/optimized/serengeti-national-park.webp',
      '/images/optimized/ngorongoro-conservation-area.webp',
      '/images/optimized/balloon.webp',
    ].filter((u) => fs.existsSync(path.join(__dirname, '..', 'public', u.replace(/^\//, '').replace(/\//g, path.sep))));
    gallery = uniqueUrls([...gallery, ...fallbacks], minCount);
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
  toPublicUrl,
};
