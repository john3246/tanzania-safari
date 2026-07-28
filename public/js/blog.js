const DEFAULT_AUTHOR = 'John Raphael Shayo';

const PILLAR_ORDER = ['tanzania-safari', 'tanzania-safari-cost'];

function pillarFromWindow(slug) {
  if (slug === 'tanzania-safari') return window.TanzaniaSafariGuide?.META;
  if (slug === 'tanzania-safari-cost') return window.TanzaniaSafariCostGuide?.META;
  return null;
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
  list = list.slice().sort((a, b) => {
    const ai = PILLAR_ORDER.indexOf(a.post_slug);
    const bi = PILLAR_ORDER.indexOf(b.post_slug);
    const ap = ai === -1 ? 99 : ai;
    const bp = bi === -1 ? 99 : bi;
    return ap - bp;
  });
  return list;
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
      <a class="blog-pillar-card" href="/blog/tanzania-safari">
        <img src="/images/optimized/serengeti-national-park.webp" alt="Tanzania safari guide" width="800" height="500">
        <div class="blog-pillar-body">
          <span class="badge">Ultimate Guide</span>
          <h2 style="margin:0 0 0.75rem;font-size:clamp(1.35rem,1.1rem + 1vw,1.85rem)">Tanzania Safari: The Ultimate Guide</h2>
          <p style="color:var(--text-secondary);margin:0 0 1rem">Plan parks, migration timing, costs, and private itineraries with Our Team in Arusha.</p>
          <span class="btn btn-primary" style="width:fit-content;min-height:48px">Read the Guide</span>
        </div>
      </a>
      <a class="blog-pillar-card" href="/blog/tanzania-safari-cost" style="margin-top:1.5rem">
        <img src="/images/optimized/balloon.webp" alt="Tanzania safari cost guide" width="800" height="500">
        <div class="blog-pillar-body">
          <span class="badge">Cost Guide 2026</span>
          <h2 style="margin:0 0 0.75rem;font-size:clamp(1.35rem,1.1rem + 1vw,1.85rem)">Tanzania Safari Cost: Everything You Need to Know</h2>
          <p style="color:var(--text-secondary);margin:0 0 1rem">Budget to luxury daily rates, park fees, and transparent quotes from Our Team.</p>
          <span class="btn btn-primary" style="width:fit-content;min-height:48px">Read Cost Guide</span>
        </div>
      </a>`;
    return;
  }

  const featured = posts[0];
  const rest = posts.slice(1);
  const featuredBadge =
    featured.post_slug === 'tanzania-safari'
      ? 'Ultimate Guide'
      : featured.post_slug === 'tanzania-safari-cost'
        ? 'Cost Guide 2026'
        : 'Featured';

  container.innerHTML = `
    <a class="blog-pillar-card" href="/blog/${featured.post_slug}">
      <img src="${imgSrc(featured.featured_image_url, '/images/optimized/serengeti-national-park.webp')}"
           alt="${escapeHtml(featured.post_title)}" width="900" height="560" loading="eager"
           onerror="this.src='/images/optimized/serengeti-national-park.webp'">
      <div class="blog-pillar-body">
        <span class="badge">${featuredBadge}</span>
        <h2 style="margin:0 0 0.75rem;font-size:clamp(1.35rem,1.1rem + 1vw,1.85rem);color:var(--earth-dark)">${escapeHtml(featured.post_title)}</h2>
        <p style="color:var(--text-secondary);margin:0 0 1rem;line-height:1.65">${escapeHtml(featured.post_excerpt || '')}</p>
        <div class="blog-card-meta" style="margin-bottom:1rem">
          <span><i class="far fa-user"></i> ${escapeHtml(featured.author_name || DEFAULT_AUTHOR)}</span>
          <span><i class="far fa-calendar"></i> ${fmtDate(featured.published_at)}</span>
        </div>
        <span class="btn btn-primary" style="width:fit-content;min-height:48px">Read Full Guide</span>
      </div>
    </a>

    ${rest.length ? `
    <div class="blog-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem">
      ${rest.map(post => {
        const isCost = post.post_slug === 'tanzania-safari-cost';
        const isUlt = post.post_slug === 'tanzania-safari';
        return `
        <article class="blog-card" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(38,62,34,0.08);box-shadow:0 8px 28px rgba(38,62,34,0.05);display:flex;flex-direction:column">
          <a href="/blog/${post.post_slug}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%">
            <div class="blog-card-img" style="aspect-ratio:16/9;overflow:hidden;background:#f0f0f0">
              <img src="${imgSrc(post.featured_image_url)}" alt="${escapeHtml(post.post_title)}" width="640" height="360" loading="lazy"
                   style="width:100%;height:100%;object-fit:cover" onerror="this.src='/images/optimized/mbugani.webp'">
            </div>
            <div class="blog-card-body" style="padding:1.35rem;flex:1;display:flex;flex-direction:column">
              ${isCost || isUlt ? `<span class="badge" style="margin-bottom:0.5rem;width:fit-content">${isCost ? 'Cost Guide' : 'Ultimate Guide'}</span>` : ''}
              <div class="blog-card-meta" style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.65rem;display:flex;gap:0.75rem;flex-wrap:wrap">
                <span>${fmtDate(post.published_at)}</span>
                <span>${escapeHtml(post.author_name || DEFAULT_AUTHOR)}</span>
              </div>
              <h3 class="blog-card-title" style="font-size:1.1rem;margin:0 0 0.65rem;line-height:1.35">${escapeHtml(post.post_title)}</h3>
              <p class="blog-card-excerpt" style="font-size:0.9rem;color:var(--text-secondary);flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(post.post_excerpt || '')}</p>
              <span class="blog-card-link" style="color:var(--primary);font-weight:600;margin-top:0.75rem;min-height:48px;display:inline-flex;align-items:center">Read More <i class="fas fa-arrow-right" style="margin-left:0.4rem"></i></span>
            </div>
          </a>
        </article>`;
      }).join('')}
    </div>
    <style>@media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:640px){.blog-grid{grid-template-columns:1fr!important}}</style>
    ` : ''}

    <div class="guide-cta-box" style="margin-top:2.5rem">
      <h2 style="color:#fff;margin:0 0 0.75rem">Talk to Our Team</h2>
      <p style="color:rgba(255,255,255,0.9)">Private itineraries from Arusha — Serengeti, Ngorongoro, Kilimanjaro &amp; Zanzibar.</p>
      <div class="guide-cta-actions">
        <a class="btn btn-primary" href="/booking" style="min-height:48px">Get a Free Quote</a>
        <a class="btn btn-outline" href="/safaris" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Browse Packages</a>
        <a class="btn btn-outline" href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27d%20like%20a%20safari%20quote." target="_blank" rel="noopener" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
      </div>
    </div>
  `;
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

loadBlog();
