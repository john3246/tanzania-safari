const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'js', 'blog-guides');
const out = {};

function pick(src, key) {
  const re = new RegExp(key + ':\\s*[\'"]([^\'"]+)[\'"]');
  const m = src.match(re);
  return m ? m[1] : '';
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  const slug = pick(src, 'slug') || f.replace(/\.js$/, '');
  out[slug] = {
    slug,
    title: pick(src, 'title') || pick(src, 'meta_title'),
    excerpt: pick(src, 'excerpt'),
    featured_image_url: pick(src, 'featured_image_url'),
    published_at: pick(src, 'published_at'),
    category_name: pick(src, 'category_name')
  };
}

const dest = path.join(__dirname, '..', 'scratch', 'blog-meta.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2), 'utf8');
console.log('wrote', dest, Object.keys(out).length, 'guides');
