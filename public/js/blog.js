function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

const DEFAULT_AUTHOR = 'John Raphael Shayo';

const PILLAR_ORDER = [
  'serengeti-safari-cost-2026',
  'tanzania-safari-zanzibar-combo',
  'kilimanjaro-route-comparison',
  'best-time-to-visit-tanzania',
  'serengeti-national-park',
  'ngorongoro-crater',
  'great-wildebeest-migration',
  'zanzibar-guide',
  'arusha-national-park',
  'tanzania-safari',
  'tanzania-safari-cost',
  'first-tanzania-safari',
  'tanzania-solo-travel',
  'things-to-do-in-arusha',
  'tanzania-visa-guide',
  'climbing-kilimanjaro-difficulty',
  'kilimanjaro-cost',
  'best-time-to-climb-kilimanjaro',
  'kilimanjaro-routes-guide',
  'kilimanjaro-packing-list',
  'train-for-kilimanjaro',
  'kilimanjaro-tipping-guide',
  'kilimanjaro-acclimatization'
];

function pillarFromWindow(slug) {
  const map = window.TSM_BLOG_PILLARS || {};
  return map[slug] || null;
}

async function loadPillarMeta() {
  if (window.TSM_BLOG_PILLARS) return window.TSM_BLOG_PILLARS;
  try {
    const res = await fetch('/data/blog-pillars.json', { cache: 'force-cache' });
    if (res.ok) {
      window.TSM_BLOG_PILLARS = await res.json();
      return window.TSM_BLOG_PILLARS;
    }
  } catch (_) {}
  window.TSM_BLOG_PILLARS = {};
  return window.TSM_BLOG_PILLARS;
}

function ensurePillars(posts) {
  let list = posts.slice();
  for (const slug of PILLAR_ORDER) {
    const meta = pillarFromWindow(slug);
    const has = list.some(p => (p.post_slug || p.slug) === slug);
    if (!has && meta) {
      list.unshift({
        post_title: meta.title,
        post_slug: meta.slug,
        post_excerpt: meta.excerpt,
        featured_image_url: meta.featured_image_url,
        published_at: meta.published_at,
        author_name: DEFAULT_AUTHOR,
        category_name: meta.category_name,
        _pillar: true
      });
    }
  }
  return list.slice().sort((a, b) => {
    const ai = PILLAR_ORDER.indexOf(a.post_slug);
    const bi = PILLAR_ORDER.indexOf(b.post_slug);
    const ap = ai === -1 ? 99 : ai;
    const bp = bi === -1 ? 99 : bi;
    if (ap !== bp) return ap - bp;
    return new Date(b.published_at || 0) - new Date(a.published_at || 0);
  });
}

function fmtDateShort(d) {
  if (!d) return '';
  const dt = new Date(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dd} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

function excerptText(post, max = 180) {
  const raw = String(post.post_excerpt || post.excerpt || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return '';
  return raw.length > max ? `${raw.slice(0, max).trim()}…` : raw;
}

function imgSrc(src, fallback = '/images/optimized/balloon.webp') {
  if (!src) return fallback;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return '/' + src;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cardHtml(post, index) {
  const slug = post.post_slug || post.slug;
  const title = post.post_title || 'Safari Guide';
  const img = imgSrc(post.featured_image_url, '/images/optimized/serengeti-national-park.webp');
  const date = fmtDateShort(post.published_at);
  const category = post.category_name || 'Adventure';
  const excerpt = excerptText(post);
  return `
    <article class="blog-ms-card">
      <a href="/blog/${escapeHtml(slug)}" class="blog-ms-link">
        <div class="blog-ms-media">
          <img src="${img}" alt="${escapeHtml(title)}" width="800" height="500" loading="${index < 4 ? 'eager' : 'lazy'}"
               onerror="this.src='/images/optimized/mbugani.webp'">
        </div>
        <div class="blog-ms-body">
          <div class="blog-ms-meta">
            <span class="blog-ms-cat">${escapeHtml(category)}</span>
            ${date ? `<time class="blog-ms-date" datetime="${escapeHtml(post.published_at || '')}">${date}</time>` : ''}
          </div>
          <h2 class="blog-ms-title">${escapeHtml(title)}</h2>
          ${excerpt ? `<p class="blog-ms-excerpt">${escapeHtml(excerpt)}</p>` : ''}
        </div>
      </a>
    </article>`;
}

async function loadBlog() {
  const container = document.getElementById('blogContainer');
  if (!container) return;

  await loadPillarMeta();

  let posts = [];
  try {
    const { data } = await API.get('/blog');
    posts = data || [];
  } catch (e) {
    posts = [];
  }

  posts = ensurePillars(posts);

  if (!posts.length) {
    container.innerHTML = `
      <p class="text-muted" style="text-align:center;padding:2rem">${t('blog.noPosts')}</p>
      ${ctaHtml()}`;
    return;
  }

  container.innerHTML = `
    <div class="blog-ms-grid">
      ${posts.map((p, i) => cardHtml(p, i)).join('')}
    </div>
    ${ctaHtml()}
  `;
}

function ctaHtml() {
  return `
    <aside class="blog-mag-cta">
      <div class="blog-mag-cta-copy">
        <h2>Let us create your tailor-made trip</h2>
        <p>Receive a free, no-obligation quote from Our Team in Arusha — Serengeti, Ngorongoro, Kilimanjaro &amp; Zanzibar.</p>
      </div>
      <div class="blog-mag-cta-actions">
        <a class="btn btn-primary" href="/booking" style="min-height:48px">Start planning</a>
        <a class="btn btn-outline" href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27d%20like%20a%20safari%20quote." target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
      </div>
    </aside>`;
}

loadBlog();
