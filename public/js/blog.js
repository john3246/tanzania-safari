const DEFAULT_AUTHOR = 'John Raphael Shayo';

const PILLAR_ORDER = [
  'best-time-to-visit-tanzania',
  'serengeti-national-park',
  'ngorongoro-crater',
  'great-wildebeest-migration',
  'zanzibar-guide',
  'arusha-national-park',
  'tanzania-safari',
  'tanzania-safari-cost'
];

function pillarFromWindow(slug) {
  const map = {
    'tanzania-safari': window.TanzaniaSafariGuide?.META,
    'tanzania-safari-cost': window.TanzaniaSafariCostGuide?.META,
    'great-wildebeest-migration': window.GreatWildebeestMigrationGuide?.META,
    'zanzibar-guide': window.ZanzibarGuide?.META,
    'ngorongoro-crater': window.NgorongoroCraterGuide?.META,
    'serengeti-national-park': window.SerengetiNationalParkGuide?.META,
    'arusha-national-park': window.ArushaNationalParkGuide?.META,
    'best-time-to-visit-tanzania': window.BestTimeToVisitTanzaniaGuide?.META
  };
  return map[slug] || null;
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
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yy = String(dt.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
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
  return `
    <article class="blog-mag-card">
      <a href="/blog/${escapeHtml(slug)}" class="blog-mag-link">
        <div class="blog-mag-media">
          <img src="${img}" alt="${escapeHtml(title)}" width="800" height="600" loading="${index < 4 ? 'eager' : 'lazy'}"
               onerror="this.src='/images/optimized/mbugani.webp'">
          ${date ? `<time class="blog-mag-date" datetime="${escapeHtml(post.published_at || '')}">${date}</time>` : ''}
        </div>
        <h2 class="blog-mag-title">${escapeHtml(title)}</h2>
      </a>
    </article>`;
}

async function loadBlog() {
  const container = document.getElementById('blogContainer');
  if (!container) return;

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
      <div class="blog-mag-grid">
        ${cardHtml({
          post_slug: 'great-wildebeest-migration',
          post_title: 'Great Wildebeest Migration Safari Guide | Serengeti Tanzania',
          featured_image_url: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
          published_at: '2026-07-28'
        }, 0)}
        ${cardHtml({
          post_slug: 'tanzania-safari',
          post_title: 'Tanzania Safari: The Ultimate Guide to Planning the Perfect Tour',
          featured_image_url: '/images/optimized/serengeti-national-park.webp',
          published_at: '2026-07-01'
        }, 1)}
        ${cardHtml({
          post_slug: 'tanzania-safari-cost',
          post_title: 'Tanzania Safari Cost 2026: Everything You Need to Know',
          featured_image_url: '/images/optimized/balloon.webp',
          published_at: '2026-07-15'
        }, 2)}
      </div>
      ${ctaHtml()}`;
    return;
  }

  container.innerHTML = `
    <div class="blog-mag-grid">
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
