/**
 * Download hiking/trekking images from Glado Africa and assign them
 * systematically to Mount Meru, Kilimanjaro, and Ol Doinyo Lengai packages.
 *
 * Rules:
 * - Meru packages → Meru / Arusha NP images only (never Kilimanjaro folder)
 * - Kilimanjaro packages → Kilimanjaro folder + Glado Kili images only
 * - Lengai packages → Ol Doinyo Lengai / Natron images only
 * - Combo Meru+Lengai → Meru + Lengai pools (no Kilimanjaro)
 *
 * Usage: node scripts/sync_mountain_trek_images.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const BASE = 'https://gladofafricasafari.com';
const ROOT = path.join(__dirname, '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const SCRAPED = path.join(__dirname, 'glado_tours_scraped.json');

const GENERIC_NOISE =
  /giraffes-6315586|pexels-dick-scholten|\/R-2(?:-|\.|$)|R-2-636x426|pexels-yg-pixel|pexels-droneafrica|248739_6488805c66a1d|logo|icon|whatsapp|facebook|placeholder|woocommerce-placeholder|sprite|avatar|flag/i;

const MOUNTAIN = {
  meru: {
    folder: 'mount-meru',
    keep: /meru|arusha.?national|momella|miriakamba|saddle.?hut|socialist.?peak|arusha_national/i,
    reject:
      /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|lengai|oldoinyo|oldonyo|natron|eyasi|serengeti|mara.?river|lion-|zebra-|cheetah|wildebeest|elephant|buffalo|wildlife/i,
  },
  lengai: {
    folder: 'ol-doinyo-lengai',
    // Prefer volcano / Natron trek cues; do not rely on the pool folder name alone.
    keep: /lengai|oldoinyo|oldonyo|ol.?don|natron|eyasi|mount_oldonyo|sacred.?ol/i,
    reject:
      /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|meru|momella|miriakamba|serengeti|mara.?river|lion-|giraffe|elephant|buffalo|zebra|cheetah|wildebeest|tarangire|pexels-mn-str/i,
  },
  kilimanjaro: {
    folder: 'kilimanjaro',
    keep: /kilimanjaro|kibo|uhuru|machame|lemosho|marangu|lava.?tower|alpine|barranco|karanga|bora|mountain-|volcano-|nature-|summit|trek|glacier|shira|africa-\d/i,
    reject: /lengai|oldoinyo|oldonyo|natron|eyasi|meru|momella|miriakamba|serengeti|mara.?river|lion-|giraffe|wildebeest|elephant|buffalo|tarangire|gol.?kopjes|zebra|cheetah/i,
  },
};

/** Glado product slug → our package slug(s) + mountain family */
const PACKAGE_MAP = [
  {
    glado: '3-day-mount-meru-trek',
    ours: ['3-day-mount-meru-trek'],
    family: 'meru',
  },
  {
    glado: '4-day-mount-meru-trek',
    ours: ['4-day-mount-meru-trek'],
    family: 'meru',
  },
  {
    glado: '3-days-ol-donyo-lengai-trek-natron-lake-eyasi-culture',
    ours: ['3-days-ol-donyo-lengai-trek-natron-lake-eyasi-culture'],
    family: 'lengai',
  },
  {
    glado: '4-days-ol-doinyo-lengai-volcano-trek-great-wild-safari',
    ours: ['4-days-ol-doinyo-lengai-volcano-trek-great-wild-safari'],
    family: 'lengai',
  },
  {
    glado: '7-day-mount-meru-summit-sacred-ol-donyo-lengai-trek',
    ours: ['7-day-mount-meru-summit-sacred-ol-donyo-lengai-trek'],
    family: 'meru_lengai',
  },
  {
    glado: '6-day-mount-kilimanjaro-machame-route',
    ours: ['6-day-machame-route-kilimanjaro', '6-day-mount-kilimanjaro-machame-route'],
    family: 'kilimanjaro',
  },
  {
    glado: '6-day-mount-kilimanjaro-marangu-route',
    ours: ['6-day-marangu-route-kilimanjaro', '6-day-mount-kilimanjaro-marangu-route'],
    family: 'kilimanjaro',
  },
  {
    glado: '8-day-mount-kilimanjaro-lemosho-route-trek',
    ours: ['8-day-lemosho-route-kilimanjaro', '8-day-mount-kilimanjaro-lemosho-route-trek'],
    family: 'kilimanjaro',
  },
  {
    glado: '10-days-wildlife-tracking-kilimanjaro-day-hiking',
    ours: ['10-days-wildlife-tracking-kilimanjaro-day-hiking'],
    family: 'kilimanjaro',
  },
  {
    glado: '13-days-kilimanjaro-adventure-serengeti-wildebeest-migration-safari',
    ours: ['13-days-kilimanjaro-adventure-serengeti-wildebeest-migration-safari'],
    family: 'kilimanjaro',
  },
  {
    glado: 'kilimanjaro-national-park-day-trip',
    ours: ['kilimanjaro-national-park-day-trip'],
    family: 'kilimanjaro',
  },
];

/** Extra Meru packages that share the Meru pool (PDF/seeded combos) */
const EXTRA_MERU = [
  '6-day-mount-meru-tarangire-ngorongoro',
  '9-day-mount-meru-northern-tanzania-safari',
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,image/*,*/*',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : BASE + res.headers.location;
          return fetchUrl(next).then(resolve, reject);
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            buffer: Buffer.concat(chunks),
            contentType: res.headers['content-type'] || '',
          })
        );
      }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => {
      req.destroy();
      reject(new Error('timeout ' + url));
    });
  });
}

function preferLargestUrl(url) {
  // Prefer full-size over -636x426 thumbnails when possible
  return String(url || '')
    .split('?')[0]
    .replace(/-\d+x\d+(\.(jpe?g|png|webp))$/i, '$1');
}

function extractProductImages(html) {
  const imgs = [];
  const push = (src) => {
    if (!src || src.startsWith('data:')) return;
    if (GENERIC_NOISE.test(src)) return;
    let abs = src.trim().replace(/&amp;/g, '&');
    if (abs.startsWith('//')) abs = 'https:' + abs;
    else if (abs.startsWith('/')) abs = BASE + abs;
    abs = preferLargestUrl(abs);
    if (!/^https?:\/\//i.test(abs)) return;
    if (!/\.(jpe?g|png|webp)$/i.test(abs)) return;
    if (!imgs.includes(abs)) imgs.push(abs);
  };

  const og = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og) push(og[1]);

  const attrRe =
    /(?:data-large_image|data-src|data-lazy-src|href|src)=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/gi;
  let m;
  while ((m = attrRe.exec(html)) && imgs.length < 24) {
    push(m[1]);
  }
  return imgs.slice(0, 20);
}

function classifyUrl(url, family) {
  let hint = String(url || '').toLowerCase();
  try {
    hint = decodeURIComponent(hint.split('?')[0]);
  } catch (_) {
    /* keep */
  }
  if (GENERIC_NOISE.test(hint)) return false;
  if (/elementor\/thumbs|visa-|mastercard-|payment/i.test(hint)) return false;

  // For local /images/... URLs, classify on the basename so pool folder names
  // (e.g. ol-doinyo-lengai/) cannot make wildlife files look "on topic".
  const base = path.basename(hint.split('?')[0]);
  const scoreHint = hint.startsWith('/images/') || hint.includes('/images/') ? base : hint;

  if (family === 'meru_lengai') {
    return MOUNTAIN.meru.keep.test(scoreHint) || MOUNTAIN.lengai.keep.test(scoreHint);
  }

  const conf = MOUNTAIN[family];
  if (!conf) return false;
  if (conf.reject.test(scoreHint) || conf.reject.test(hint)) return false;
  // Strict: filename/path must positively match the mountain family
  return conf.keep.test(scoreHint) || conf.keep.test(hint);
}

function extFromUrl(url, contentType) {
  const m = String(url).match(/\.(jpe?g|png|webp)(?:$|\?)/i);
  if (m) return '.' + m[1].toLowerCase().replace('jpeg', 'jpg');
  if (/png/i.test(contentType)) return '.png';
  if (/webp/i.test(contentType)) return '.webp';
  return '.jpg';
}

function safeName(url, index, prefix) {
  const base = path
    .basename(preferLargestUrl(url))
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .toLowerCase();
  return `${prefix}-${String(index + 1).padStart(2, '0')}-${base || 'image'}`;
}

async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
    return destPath;
  }
  const { status, buffer, contentType } = await fetchUrl(url);
  if (status !== 200 || !buffer || buffer.length < 2000) {
    throw new Error(`bad download ${status} ${url}`);
  }
  if (!/image\//i.test(contentType) && !/\.(jpe?g|png|webp)$/i.test(url)) {
    throw new Error(`not an image ${contentType} ${url}`);
  }
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, buffer);
  return destPath;
}

function toPublicUrl(absFile) {
  const rel = path.relative(path.join(ROOT, 'public'), absFile).split(path.sep).join('/');
  return (
    '/' +
    rel
      .split('/')
      .map((seg) => encodeURIComponent(seg).replace(/'/g, '%27'))
      .join('/')
  );
}

function listLocalPool(folder) {
  const dir = path.join(IMAGES, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n) && !n.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((n) => toPublicUrl(path.join(dir, n)));
}

function mountainPoolUrls(family) {
  if (family === 'meru') return listLocalPool('mount-meru');
  if (family === 'lengai') return listLocalPool('ol-doinyo-lengai');
  if (family === 'kilimanjaro') return listLocalPool('kilimanjaro');
  if (family === 'meru_lengai') {
    return [...listLocalPool('mount-meru'), ...listLocalPool('ol-doinyo-lengai')];
  }
  return [];
}

async function gatherRemoteImages(entry, scrapedBySlug) {
  const urls = new Set();
  const scraped = scrapedBySlug.get(entry.glado);
  if (scraped) {
    if (scraped.featured_image_url) urls.add(preferLargestUrl(scraped.featured_image_url));
    for (const u of scraped.image_urls || []) urls.add(preferLargestUrl(u));
  }

  const productUrl = `${BASE}/product/${entry.glado}/`;
  try {
    const { status, buffer } = await fetchUrl(productUrl);
    if (status === 200) {
      for (const u of extractProductImages(buffer.toString('utf8'))) {
        urls.add(preferLargestUrl(u));
      }
      console.log(`  scraped ${entry.glado}: ${urls.size} candidate urls`);
    } else {
      console.warn(`  product page ${status}: ${productUrl}`);
    }
  } catch (err) {
    console.warn(`  product scrape failed ${entry.glado}:`, err.message);
  }

  return [...urls].filter((u) => classifyUrl(u, entry.family === 'meru_lengai' ? 'meru_lengai' : entry.family));
}

async function downloadFamilyPool(family, urls) {
  const folder =
    family === 'meru'
      ? 'mount-meru'
      : family === 'lengai'
        ? 'ol-doinyo-lengai'
        : family === 'kilimanjaro'
          ? 'kilimanjaro'
          : null;
  if (!folder) return;
  const destDir = path.join(IMAGES, folder);
  ensureDir(destDir);
  let i = 0;
  for (const url of urls) {
    const name = safeName(url, i, folder.replace(/[^a-z0-9]+/g, '-'));
    const ext = extFromUrl(url, '');
    const dest = path.join(destDir, name + ext);
    try {
      await downloadImage(url, dest);
      console.log(`    + ${folder}/${path.basename(dest)}`);
      i += 1;
    } catch (err) {
      console.warn(`    skip ${url}: ${err.message}`);
    }
  }
}

async function syncPackageFolder(ourSlug, family, preferredRemoteUrls) {
  const destDir = path.join(IMAGES, 'safaris', ourSlug);
  ensureDir(destDir);

  // Clear clearly-wrong mountain / wildlife images from package folder
  for (const name of fs.readdirSync(destDir)) {
    if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
    const hint = name.toLowerCase();
    // Animal stock photos only — avoid matching package slugs like "wildlife-tracking".
    const wildlife =
      /(?:^|[-_])(?:elephants?|water-buffalo|buffalo|zebras?|lions?|giraffes?|cheetahs?|wildebeests?)(?:[-_.]|$)/i.test(
        hint
      );
    const wrong =
      (family === 'meru' && (/kilimanjaro|lengai|oldo/.test(hint) || wildlife)) ||
      (family === 'lengai' &&
        (/kilimanjaro|meru|machame|marangu|lemosho|pexels-mn-str/.test(hint) || wildlife)) ||
      (family === 'kilimanjaro' && (/\/mount-meru|meru-trek|lengai|oldo/.test(hint) || wildlife)) ||
      (family === 'meru_lengai' && (/kilimanjaro/.test(hint) || wildlife));
    if (wrong) {
      fs.unlinkSync(path.join(destDir, name));
      console.log(`    removed mismatched ${ourSlug}/${name}`);
    }
  }

  let i = 0;
  for (const url of preferredRemoteUrls.slice(0, 8)) {
    const name = safeName(url, i, ourSlug.slice(0, 24));
    const ext = extFromUrl(url, '');
    const dest = path.join(destDir, name + ext);
    try {
      await downloadImage(url, dest);
      console.log(`    package ${ourSlug}/${path.basename(dest)}`);
      i += 1;
    } catch (err) {
      console.warn(`    package skip: ${err.message}`);
    }
  }

  // Copy a few verified pool images (already family-filtered) into the package folder
  const pool = mountainPoolUrls(family).filter((u) => {
    if (family === 'meru_lengai') return classifyUrl(u, 'meru') || classifyUrl(u, 'lengai');
    return classifyUrl(u, family);
  }).slice(0, 8);
  for (const pub of pool) {
    const decoded = decodeURIComponent(pub.replace(/^\//, ''));
    const abs = path.join(ROOT, 'public', decoded);
    if (!fs.existsSync(abs)) continue;
    const base = path.basename(abs);
    const dest = path.join(destDir, base);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(abs, dest);
    }
  }

  return fs
    .readdirSync(destDir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((n) => toPublicUrl(path.join(destDir, n)));
}

function buildGallery(family, packageUrls) {
  const pool = mountainPoolUrls(family);
  const ordered = [...packageUrls, ...pool.filter((u) => !packageUrls.includes(u))];
  // Hard filter: drop any URL that still looks like the wrong mountain
  const filtered = ordered.filter((u) => {
    const hint = decodeURIComponent(u.toLowerCase());
    if (family === 'meru') return !/\/kilimanjaro\/|kilimanjaro%20|lengai|oldoinyo|oldonyo/.test(hint);
    if (family === 'lengai') return !/\/kilimanjaro\/|kilimanjaro%20|\/mount-meru\/|meru-/.test(hint) || /lengai|oldo/.test(hint);
    if (family === 'kilimanjaro') return !/\/mount-meru\/|lengai|oldoinyo|oldonyo|meru-trek/.test(hint);
    if (family === 'meru_lengai') return !/\/kilimanjaro\/|kilimanjaro%20/.test(hint);
    return true;
  });
  const unique = [...new Set(filtered)].slice(0, 12);
  return {
    featured_image_url: unique[0] || null,
    image_urls: unique,
  };
}

async function updateDbPackage(slug, gallery) {
  if (!gallery.featured_image_url || !gallery.image_urls.length) {
    console.warn(`  DB skip ${slug}: empty gallery`);
    return false;
  }
  if (!process.env.DATABASE_URL) {
    console.log(`  DB skipped (no DATABASE_URL): ${slug} → ${gallery.image_urls.length} local images ready`);
    return false;
  }
  const db = require('../config/db');
  const res = await db.query(
    `UPDATE safari_packages
     SET featured_image_url = $1,
         image_urls = $2,
         updated_at = NOW()
     WHERE package_slug = $3
     RETURNING package_id, package_name`,
    [gallery.featured_image_url, gallery.image_urls, slug]
  );
  if (!res.rowCount) {
    console.warn(`  DB: no package row for ${slug}`);
    return false;
  }
  console.log(`  DB updated: ${slug} (${gallery.image_urls.length} images)`);
  return true;
}

async function main() {
  const scraped = JSON.parse(fs.readFileSync(SCRAPED, 'utf8'));
  const tours = Array.isArray(scraped) ? scraped : scraped.tours || [];
  const scrapedBySlug = new Map(tours.map((t) => [t.package_slug, t]));

  ensureDir(path.join(IMAGES, 'mount-meru'));
  ensureDir(path.join(IMAGES, 'ol-doinyo-lengai'));
  ensureDir(path.join(IMAGES, 'kilimanjaro'));

  const familyUrls = { meru: new Set(), lengai: new Set(), kilimanjaro: new Set() };

  for (const entry of PACKAGE_MAP) {
    console.log(`\n== ${entry.glado} (${entry.family}) ==`);
    const urls = await gatherRemoteImages(entry, scrapedBySlug);
    console.log(`  kept ${urls.length} relevant urls`);

    if (entry.family === 'meru_lengai') {
      for (const u of urls) {
        if (classifyUrl(u, 'meru')) familyUrls.meru.add(u);
        if (classifyUrl(u, 'lengai')) familyUrls.lengai.add(u);
      }
    } else {
      for (const u of urls) familyUrls[entry.family].add(u);
    }

    // Download into package folders after pools are filled — second pass below
    entry._urls = urls;
  }

  console.log('\n== Downloading mountain pools ==');
  await downloadFamilyPool('meru', [...familyUrls.meru]);
  await downloadFamilyPool('lengai', [...familyUrls.lengai]);
  await downloadFamilyPool('kilimanjaro', [...familyUrls.kilimanjaro]);

  console.log('\n== Syncing package folders + DB ==');
  for (const entry of PACKAGE_MAP) {
    for (const ourSlug of entry.ours) {
      console.log(`\n-- ${ourSlug}`);
      const packageUrls = await syncPackageFolder(ourSlug, entry.family, entry._urls || []);
      const gallery = buildGallery(entry.family, packageUrls);
      await updateDbPackage(ourSlug, gallery);
    }
  }

  // Extra Meru seeded packages share Meru pool only
  for (const slug of EXTRA_MERU) {
    console.log(`\n-- extra meru ${slug}`);
    const packageUrls = await syncPackageFolder(slug, 'meru', [...familyUrls.meru].slice(0, 6));
    const gallery = buildGallery('meru', packageUrls);
    await updateDbPackage(slug, gallery);
  }

  // Persist mapping for seeds / redeploys without re-scraping
  const manifest = {
    generated_at: new Date().toISOString(),
    pools: {
      meru: listLocalPool('mount-meru'),
      lengai: listLocalPool('ol-doinyo-lengai'),
      kilimanjaro: listLocalPool('kilimanjaro'),
    },
    packages: {},
  };
  for (const entry of PACKAGE_MAP) {
    for (const ourSlug of entry.ours) {
      const dir = path.join(IMAGES, 'safaris', ourSlug);
      if (!fs.existsSync(dir)) continue;
      const urls = fs
        .readdirSync(dir)
        .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((n) => toPublicUrl(path.join(dir, n)));
      manifest.packages[ourSlug] = {
        family: entry.family,
        featured_image_url: urls[0] || null,
        image_urls: urls,
      };
    }
  }
  for (const slug of EXTRA_MERU) {
    if (manifest.packages[slug]) continue;
    const gallery = buildGallery('meru', []);
    manifest.packages[slug] = { family: 'meru', ...gallery };
  }
  fs.writeFileSync(
    path.join(__dirname, 'mountain_trek_images_manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('\nWrote scripts/mountain_trek_images_manifest.json');

  console.log('\nDone. Mountain image pools:');
  for (const folder of ['mount-meru', 'ol-doinyo-lengai', 'kilimanjaro']) {
    console.log(`  ${folder}: ${listLocalPool(folder).length} files`);
  }

  try {
    const db = require('../config/db');
    await db.pool?.end?.();
  } catch (_) {}
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try {
    const db = require('../config/db');
    await db.pool?.end?.();
  } catch (_) {}
  process.exit(1);
});
