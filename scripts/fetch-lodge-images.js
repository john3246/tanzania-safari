/**
 * Fetch og:image (or first large image) from lodge websites and save locally.
 * Usage: node scripts/fetch-lodge-images.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'public', 'images', 'accommodation');
fs.mkdirSync(OUT, { recursive: true });

const EXTRA_URLS = {
  'gran-melia-arusha':
    'https://dam.melia.com/melia/file/MvT7m4syueLdZVosT13D.jpg?im=RegionOfInterestCrop=(1200,750),regionOfInterest=(2150.0,1433.5)',
  'four-points-by-sheraton-arusha':
    'https://cache.marriott.com/content/dam/marriott-renditions/JROFP/jrofp-exterior-0005-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1920px:*',
  'tarangire-sopa-lodge':
    'https://www.sopalodges.com/images/com_osgallery/gal-14/original/view-of-the-lodgeA3920FC6-D437-808C-4E42-D467F7367D1D.jpg',
  'four-seasons-safari-lodge-serengeti':
    'https://www.fourseasons.com/alt/img-opt/~70.1530/publish/content/dam/fourseasons/images/web/SBT/SBT_1021_original.jpg',
  'serengeti-serena-safari-lodge':
    'https://www.serenahotels.com/sites/default/files/styles/gallery_full/public/2022-08/serengeti-serena-safari-lodge-exterior.jpg',
  'ngorongoro-serena-safari-lodge':
    'https://www.serenahotels.com/sites/default/files/styles/gallery_full/public/2022-08/ngorongoro-serena-safari-lodge.jpg',
  'ndutu-safari-lodge':
    'https://www.ndutu.com/wp-content/uploads/2020/01/ndutu-safari-lodge-main.jpg'
};

async function wikimediaImage(name) {
  const api =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original|thumbnail&pithumbsize=1400&redirects=1&titles=' +
    encodeURIComponent(name);
  try {
    const res = await fetchBuffer(api);
    const json = JSON.parse(res.body.toString('utf8'));
    const pages = json.query && json.query.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    if (!page || page.missing) return null;
    if (page.original && page.original.source) return page.original.source;
    if (page.thumbnail && page.thumbnail.source) return page.thumbnail.source;
  } catch (_) {}
  return null;
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fetchBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || url.includes('google.com/search')) return reject(new Error('skip search'));
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,image/avif,image/webp,image/*,*/*;q=0.8'
        },
        timeout: 25000
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return fetchBuffer(next, redirects + 1).then(resolve, reject);
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), url, type: res.headers['content-type'] || '' }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

function pickOgImage(html, base) {
  const s = html.toString('utf8');
  const patterns = [
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m && m[1] && !m[1].includes('logo') && m[1].length > 12) {
      try {
        return new URL(m[1].replace(/&amp;/g, '&'), base).href;
      } catch (_) {}
    }
  }
  const imgs = [...s.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const src of imgs) {
    if (/\.(jpe?g|png|webp)/i.test(src) && !/logo|icon|sprite|svg|1x1|pixel/i.test(src)) {
      try {
        return new URL(src.replace(/&amp;/g, '&'), base).href;
      } catch (_) {}
    }
  }
  return null;
}

async function saveImage(slug, imageUrl) {
  const res = await fetchBuffer(imageUrl);
  if (res.status >= 400 || res.body.length < 4000) throw new Error('bad image ' + res.status);
  const dest = path.join(OUT, slug + '.webp');
  await sharp(res.body)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(dest);
  return '/images/accommodation/' + slug + '.webp';
}

async function processLodge(lodge) {
  const slug = slugify(lodge.name);
  const existing = ['.webp', '.jpg', '.jpeg', '.png']
    .map((e) => path.join(OUT, slug + e))
    .find((p) => fs.existsSync(p) && fs.statSync(p).size > 4000);
  if (existing) {
    return { slug, local: '/images/accommodation/' + path.basename(existing), ok: true, skipped: true };
  }
  const candidates = [];
  if (EXTRA_URLS[slug]) candidates.push(EXTRA_URLS[slug]);
  try {
    if (lodge.website && !lodge.website.includes('google.com/search')) {
      const page = await fetchBuffer(lodge.website);
      const og = pickOgImage(page.body, page.url || lodge.website);
      if (og) candidates.push(og);
    }
  } catch (e) {
    /* continue */
  }
  try {
    const wiki = await wikimediaImage(lodge.name);
    if (wiki) candidates.push(wiki);
  } catch (_) {}
  for (const img of candidates) {
    try {
      const local = await saveImage(slug, img);
      return { slug, local, ok: true };
    } catch (_) {}
  }
  return { slug, local: null, ok: false };
}

async function main() {
  const accomPath = path.join(__dirname, '..', 'public', 'js', 'accommodation-data.js');
  require(accomPath);
  const regions = global.TSM_ACCOM.REGIONS;
  const lodges = [];
  regions.forEach((r) => r.lodges.forEach((l) => lodges.push(l)));
  const results = [];
  for (const lodge of lodges) {
    try {
      const r = await processLodge(lodge);
      results.push({ name: lodge.name, ...r });
      console.log((r.ok ? 'OK' : 'FAIL') + (r.skipped ? ' skip' : ''), lodge.name, r.local || '');
    } catch (e) {
      results.push({ name: lodge.name, ok: false, error: e.message });
      console.log('FAIL', lodge.name, e.message);
    }
  }
  fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(results, null, 2));
  console.log('done', results.filter((r) => r.ok).length + '/' + results.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
