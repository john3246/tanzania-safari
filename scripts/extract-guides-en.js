const fs = require('fs');
const path = require('path');

const outRoot = 'public/locales';
['en', 'it', 'fr', 'es', 'de', 'nl'].forEach((l) => {
  fs.mkdirSync(path.join(outRoot, l, 'guides'), { recursive: true });
});

function unesc(s) {
  return String(s || '')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"');
}

function extractFaqs(src) {
  const faqBlock = src.match(/FAQS\s*=\s*\[([\s\S]*?)\];/);
  if (!faqBlock) return [];
  const pairs = [...faqBlock[1].matchAll(/q:\s*'((?:\\'|[^'])*)'[\s\S]*?a:\s*'((?:\\'|[^'])*)'/g)];
  return pairs.map((p) => ({ q: unesc(p[1]), a: unesc(p[2]) }));
}

function extractHtml(src) {
  const htmlM = src.match(/function contentHtml\(\)\s*\{[\s\S]*?return\s*`([\s\S]*?)`;\s*\}/);
  return htmlM ? htmlM[1] : null;
}

const blogDir = 'public/js/blog-guides';
for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(blogDir, f), 'utf8');
  const slugM = src.match(/slug:\s*'([^']+)'/);
  const html = extractHtml(src);
  if (!slugM || !html) {
    console.log('skip blog', f);
    continue;
  }
  const pick = (re) => {
    const m = src.match(re);
    return m ? unesc(m[1]) : '';
  };
  const obj = {
    slug: slugM[1],
    title: pick(/title:\s*'((?:\\'|[^'])*)'/),
    meta_title: pick(/meta_title:\s*'((?:\\'|[^'])*)'/),
    meta_description: pick(/meta_description:\s*'((?:\\'|[^'])*)'/),
    excerpt: pick(/excerpt:\s*'((?:\\'|[^'])*)'/),
    category_name: pick(/category_name:\s*'((?:\\'|[^'])*)'/) || 'Safari Guides',
    html,
    faqs: extractFaqs(src)
  };
  fs.writeFileSync(path.join(outRoot, 'en', 'guides', obj.slug + '.json'), JSON.stringify(obj, null, 2));
  console.log('en blog', obj.slug, obj.html.length);
}

const destDir = 'public/js/destination-guides';
for (const f of fs.readdirSync(destDir).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(destDir, f), 'utf8');
  const slugsM = src.match(/SLUGS\s*=\s*\[([^\]]+)\]/);
  const slugs = slugsM ? [...slugsM[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
  const html = extractHtml(src);
  if (!slugs.length || !html) {
    console.log('skip dest', f);
    continue;
  }
  const pick = (re) => {
    const m = src.match(re);
    return m ? unesc(m[1]) : '';
  };
  const primary = slugs[0];
  const obj = {
    slug: primary,
    title: pick(/title:\s*'((?:\\'|[^'])*)'/),
    h1: pick(/h1:\s*'((?:\\'|[^'])*)'/),
    meta_description: pick(/meta_description:\s*'((?:\\'|[^'])*)'/),
    html,
    faqs: extractFaqs(src)
  };
  // Prefix destination guides so they never overwrite blog pillar files
  const outName = 'dest-' + primary + '.json';
  fs.writeFileSync(path.join(outRoot, 'en', 'guides', outName), JSON.stringify(obj, null, 2));
  console.log('en dest', outName, obj.html.length);
}