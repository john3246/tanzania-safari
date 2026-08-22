const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dataPath = path.join(__dirname, '..', 'public', 'data', 'accommodations.json');
const outDir = path.join(__dirname, '..', 'public', 'images', 'accommodation');

const FALLBACKS = {
  'Mount Meru Hotel': 'https://www.mountmeruhotel.co.tz/images/banner.jpg',
  'Tarangire Safari Lodge':
    'https://images.squarespace-cdn.com/content/v1/54929084e4b074c56b326d39/1632894557134-63WJ93ODSDFWT6RQBHZE/View+river.jpg',
  'Bougainvillea Safari Lodge':
    'https://bougainvilleasafarilodge.com/wp-content/uploads/2019/10/Bougainvillea-Safari-Lodge-Tanzania-1290x630.jpg',
  'Marera Valley Lodge': 'https://mareravalley.com/wp-content/uploads/2021/05/DJI_0147-1500x630.jpeg',
  'Maramboi Tented Lodge':
    'https://twctanzania.com/wp-content/uploads/2023/10/Maramboi-Tented-Lodge_1-scaled.jpg',
  'Lake Burunge Tented Lodge':
    'https://twctanzania.com/wp-content/uploads/2023/10/Burunge-Tented-Lodge-Tarangire_1-1024x681.jpg',
  'Mawe Mawe Lodge': 'https://mawemawemanyaralodge.com/wp-content/uploads/2024/11/Mawe-mawe-1-.jpg',
  'Four Seasons Safari Lodge Serengeti':
    'https://www.fourseasons.com/alt/img-opt/~75.701.0,0000-401,5132-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/SBT/SBT_131_original.jpg',
  'Serengeti Serena Safari Lodge':
    'https://image-tc.galaxy.tf/wijpeg-7iqipjrhzh5zzf3z45eep3prr/serenaserengeti-53.jpg',
  'Ngorongoro Coffee Lodge':
    'https://www.bougainvilleagroup.com/wp-content/uploads/2019/08/Ngorongoro-coffee-lodge.jpg',
  'Tarangire Kuro Treetops Lodge':
    'https://wellworthcollection.co.tz/wp-content/uploads/2024/01/Group-939-2.jpg',
  'The Retreat at Ngorongoro':
    'https://theretreatatngorongoro.co.tz/assets/images/hero/main-building.jpg',
  'Ngorongoro Oldeani Mountain Lodge':
    'https://wellworthcollection.co.tz/wp-content/uploads/2024/01/Group-933.jpg'
};

function isJunk(url) {
  return /logo|icon|favicon|sprite|socialthumb|placeholder|tripadvisor|pixel|1x1|tracking|wp-includes|gravatar/i.test(
    url
  );
}

function absUrl(raw, pageUrl) {
  try {
    return new URL(String(raw).replace(/&amp;/g, '&').trim(), pageUrl).href;
  } catch (_) {
    return null;
  }
}

function scoreUrl(url) {
  const u = url.toLowerCase();
  if (isJunk(u)) return -50;
  let s = 0;
  if (/\.jpe?g(\?|$)/i.test(url)) s += 4;
  if (/\.webp(\?|$)/i.test(url)) s += 3;
  if (/\.png(\?|$)/i.test(url)) s += 1;
  if (/scaled|1920|1600|1500|1400|1290|1280|original|hero|banner/i.test(u)) s += 5;
  if (/-\d{2,3}x\d{2,3}\./.test(u)) s -= 5;
  return s;
}

function collectCandidates(html, pageUrl) {
  const found = [];
  const push = (raw) => {
    const abs = absUrl(raw, pageUrl);
    if (!abs || !/^https?:\/\//i.test(abs)) return;
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(abs.split('?')[0]) && !/wijpeg|img-opt|format=/i.test(abs)) {
      return;
    }
    found.push(abs);
  };

  const meta = [
    /property=["']og:image:url["'][^>]*content=["']([^"']+)["']/i,
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
  ];
  meta.forEach((re) => {
    const m = html.match(re);
    if (m) push(m[1]);
  });

  for (const m of html.matchAll(/(?:src|content|data-src|data-lazy-src)=["']([^"']+)["']/gi)) {
    push(m[1]);
  }
  for (const m of html.matchAll(/url\((['"]?)([^)"']+)\1\)/gi)) {
    push(m[2]);
  }
  for (const m of html.matchAll(/https?:\/\/[^"'\\s>]+\.(?:jpe?g|png|webp)/gi)) {
    push(m[0]);
  }

  const uniq = [...new Set(found)];
  uniq.sort((a, b) => scoreUrl(b) - scoreUrl(a));
  return uniq.filter((u) => scoreUrl(u) >= 2).slice(0, 8);
}

async function download(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*;q=0.8',
      Referer: new URL(url).origin + '/'
    }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return Buffer.from(await res.arrayBuffer());
}

function destAbsFor(p) {
  let rel = p.imageUrl || '';
  if (!rel.startsWith('/images/accommodation/') || !/\.webp$/i.test(rel)) {
    const slug = String(p.name || 'lodge')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    rel = '/images/accommodation/' + slug + '.webp';
    p.imageUrl = rel;
  }
  return path.join(__dirname, '..', 'public', rel.replace(/^\//, ''));
}

async function writeWebp(imgBuf, destAbs) {
  const tmp = destAbs + '.' + process.pid + '.tmp';
  await sharp(imgBuf)
    .rotate()
    .resize({ width: 1280, height: 800, fit: 'cover', position: 'centre', withoutEnlargement: false })
    .webp({ quality: 78 })
    .toFile(tmp);
  try {
    fs.renameSync(tmp, destAbs);
  } catch (_) {
    fs.copyFileSync(tmp, destAbs);
    try {
      fs.unlinkSync(tmp);
    } catch (_) {}
  }
}

async function trySave(imgUrl, destAbs) {
  const imgBuf = await download(imgUrl);
  await writeWebp(imgBuf, destAbs);
  const meta = await sharp(destAbs).metadata();
  if ((meta.width || 0) < 400) {
    try {
      fs.unlinkSync(destAbs);
    } catch (_) {}
    throw new Error('too small ' + meta.width);
  }
  return meta;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (const p of data.properties) {
    const destAbs = destAbsFor(p);
    process.stdout.write(p.name + ' ... ');
    if (fs.existsSync(destAbs) && fs.statSync(destAbs).size > 8000) {
      console.log('keep existing file');
      continue;
    }
    const tried = [];
    try {
      const htmlBuf = await download(p.officialWebsiteUrl);
      const html = htmlBuf.toString('utf8');
      tried.push(...collectCandidates(html, p.officialWebsiteUrl));
    } catch (e) {
      console.log('page', e.message);
    }
    if (FALLBACKS[p.name]) tried.push(FALLBACKS[p.name]);

    let saved = false;
    for (const imgUrl of [...new Set(tried)]) {
      try {
        const meta = await trySave(imgUrl, destAbs);
        console.log('ok', meta.width + 'x' + meta.height, fs.statSync(destAbs).size + 'b', 'from', imgUrl.slice(0, 90));
        saved = true;
        break;
      } catch (_) {}
    }
    if (!saved) {
      if (fs.existsSync(destAbs) && fs.statSync(destAbs).size > 2000) {
        console.log('keep existing file');
      } else {
        console.log('no usable official photo — listing stays');
        p.imageUrl = '';
      }
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
  console.log('updated', dataPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
