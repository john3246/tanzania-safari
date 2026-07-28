/**
 * Editorial blog detail — Ella-inspired layout
 * Default author: John Raphael Shayo
 */
const DEFAULT_AUTHOR = 'John Raphael Shayo';

async function loadPost() {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  const container = document.getElementById('postContainer');
  if (!container) return;

  let data = null;
  try {
    const res = await API.get('/blog/' + slug);
    data = res.data || res;
  } catch (e) {
    data = null;
  }

  // Pillar guide fallback / override for SEO landing page
  if (slug === 'tanzania-safari' && window.TanzaniaSafariGuide) {
    const g = window.TanzaniaSafariGuide;
    data = {
      ...(data || {}),
      post_title: g.META.title,
      post_slug: g.META.slug,
      post_excerpt: g.META.excerpt,
      post_content: g.contentHtml(),
      featured_image_url: (data && data.featured_image_url) || g.META.featured_image_url,
      meta_title: g.META.meta_title,
      meta_description: g.META.meta_description,
      published_at: (data && data.published_at) || g.META.published_at,
      updated_at: g.META.updated_at,
      category_name: g.META.category_name,
      author_name: DEFAULT_AUTHOR,
      post_tags: g.META.post_tags,
      _isGuide: true
    };
  }

  if (!data || !data.post_title) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem">
        <h1>Post not found</h1>
        <p><a href="/blog">Back to Blog</a> · <a href="/blog/tanzania-safari">Tanzania Safari Ultimate Guide</a></p>
      </div>`;
    return;
  }

  const author = data.author_name || DEFAULT_AUTHOR;
  const title = data.post_title;
  const desc = (data.meta_description || data.post_excerpt || data.post_content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const image = data.featured_image_url || '/images/optimized/serengeti-national-park.webp';
  const updated = data.updated_at || data.published_at;
  const guideAuthor = window.TanzaniaSafariGuide?.AUTHOR;

  document.title = (data.meta_title || `${title} | Tanzania Safari Magic`).slice(0, 70);

  if (window.SafariSEO) {
    SafariSEO.applyPageSeo({
      title: (data.meta_title || `${title} | Tanzania Safari Magic`).slice(0, 70),
      description: desc,
      image
    });
    ensureMeta('name', 'author', author);
    injectArticleSchema({
      title,
      description: desc,
      image,
      author,
      datePublished: data.published_at,
      dateModified: updated,
      url: location.href.split('?')[0]
    });
  }

  const content = data._isGuide
    ? data.post_content
    : enrichInternalLinks(data.post_content || '');

  container.innerHTML = `
    <article class="blog-article-main">
      <nav class="blog-crumb" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span><a href="/blog">Blog</a><span>/</span><span>${escapeHtml(title.slice(0, 42))}${title.length > 42 ? '…' : ''}</span>
      </nav>
      <h1 class="blog-h1">${escapeHtml(title)}</h1>
      <div class="blog-byline">
        <span>By <a href="/about">${escapeHtml(author)}</a></span>
        <span>Last updated: ${fmtDate(updated)}</span>
        ${data.category_name ? `<span>${escapeHtml(data.category_name)}</span>` : ''}
      </div>
      <p class="blog-disclaimer">Planning tips from Tanzania Safari Magic in Arusha. Package availability and park fees change seasonally — request a live quote for your dates.</p>

      ${!data._isGuide ? `
        <figure class="guide-figure">
          <img src="${imgSrc(image)}" alt="${escapeHtml(title)}" width="1200" height="675" loading="eager" decoding="async">
        </figure>` : ''}

      <div class="blog-prose" id="articleBody">${content}</div>

      <div class="blog-share-row">
        <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
        <a class="share-btn" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener" aria-label="Share on X"><i class="fab fa-twitter"></i></a>
        <a class="share-btn" href="https://wa.me/?text=${encodeURIComponent(title + ' ' + location.href)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
        <a class="btn btn-primary" href="/booking" style="min-height:48px;margin-left:auto"><i class="fas fa-calendar-check"></i> Get Free Quote</a>
      </div>
    </article>

    <aside class="blog-sidebar">
      <div class="author-card">
        <img src="${guideAuthor?.image || '/images/logo.png'}" alt="${escapeHtml(author)}" width="300" height="300" loading="lazy">
        <h3>${escapeHtml(author)}</h3>
        <div class="role">${escapeHtml(guideAuthor?.role || 'Safari Specialist · Arusha')}</div>
        <p>${escapeHtml(guideAuthor?.bio || 'Licensed Tanzania safari planning from Arusha — Serengeti, Ngorongoro, Tarangire, Kilimanjaro, and Zanzibar.')}</p>
        <div class="author-social">
          <a class="btn btn-primary" href="${guideAuthor?.whatsapp || 'https://wa.me/255695108009'}" target="_blank" rel="noopener" style="min-height:48px;width:100%;justify-content:center"><i class="fab fa-whatsapp"></i> WhatsApp</a>
          <a class="btn btn-outline" href="/booking" style="min-height:48px;width:100%;justify-content:center">Free Safari Quote</a>
          <a class="btn btn-ghost" href="/about" style="min-height:48px;width:100%;justify-content:center">About Us</a>
        </div>
      </div>
      <div class="author-card" style="background:#fff">
        <h3 style="font-size:1rem;margin-bottom:0.75rem">Popular Destinations</h3>
        <ul style="margin:0;padding-left:1.1rem;line-height:1.9;font-size:0.92rem">
          <li><a href="/destinations/serengeti-national-park">Serengeti</a></li>
          <li><a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a></li>
          <li><a href="/destinations/tarangire-national-park">Tarangire</a></li>
          <li><a href="/destinations/zanzibar">Zanzibar</a></li>
          <li><a href="/safaris">All Safari Packages</a></li>
        </ul>
      </div>
    </aside>
  `;

  await injectPackageCards();
}

async function injectPackageCards() {
  const anchor = document.getElementById('packages') || document.querySelector('.guide-packages-anchor');
  const prose = document.getElementById('articleBody');
  if (!prose) return;

  let packages = [];
  try {
    const res = await API.getFeaturedPackages(6);
    packages = res.data || res || [];
    if (!packages.length) {
      const all = await API.getPackages({ limit: 6 });
      packages = all.data || all || [];
    }
  } catch (e) {
    packages = [];
  }

  if (!packages.length) return;

  const section = `
    <h2 id="packages">Recommended Safari Packages</h2>
    <p>These live itineraries from Tanzania Safari Magic pair well with this guide. Tap any package for full day-by-day details, then request a custom quote.</p>
    <div class="guide-pkg-grid">
      ${packages.slice(0, 6).map(p => {
        const slug = p.package_slug || p.slug;
        const name = p.package_name || p.name || 'Safari Package';
        const img = imgSrc(p.featured_image_url || p.image_url || p.image_urls?.[0], '/images/optimized/balloon.webp');
        const days = p.duration_days ? `${p.duration_days} days` : '';
        const price = p.base_price_usd ? `From $${Number(p.base_price_usd).toLocaleString()}` : 'Request quote';
        return `
          <a class="guide-pkg-card" href="/safaris/${slug}">
            <img src="${img}" alt="${escapeHtml(name)}" width="480" height="300" loading="lazy" decoding="async"
                 onerror="this.src='/images/optimized/balloon.webp'">
            <div class="body">
              <div class="meta">${days}</div>
              <h3>${escapeHtml(name)}</h3>
              <div class="price">${price} <span style="font-weight:500;color:#888;font-size:0.8rem">pp</span></div>
            </div>
          </a>`;
      }).join('')}
    </div>
    <p><a href="/safaris">View all Tanzania safari packages →</a></p>
  `;

  if (anchor) {
    anchor.outerHTML = section;
  } else {
    prose.insertAdjacentHTML('beforeend', section);
  }
}

function enrichInternalLinks(html) {
  if (!html) return '';
  // Light enrichment for CMS posts: wrap bare destination names if not already linked
  return html;
}

function injectArticleSchema({ title, description, image, author, datePublished, dateModified, url }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image?.startsWith('http') ? image : `https://tanzaniasafarimagic.com${image}`,
    author: {
      '@type': 'Person',
      name: author,
      jobTitle: 'Safari Specialist',
      worksFor: {
        '@type': 'TravelAgency',
        name: 'Tanzania Safari Magic',
        url: 'https://tanzaniasafarimagic.com'
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tanzania Safari Magic',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tanzaniasafarimagic.com/images/logo.png'
      }
    },
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: ['Tanzania safari', 'Serengeti', 'Great Migration', 'Ngorongoro', 'Zanzibar']
  };
  if (window.SafariSEO?.injectJsonLd) {
    SafariSEO.injectJsonLd('article-jsonld', schema);
  } else {
    let el = document.getElementById('article-jsonld');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'article-jsonld';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  }
}

function ensureMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

// Wait for guide script if needed
function boot() {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  if (slug === 'tanzania-safari' && !window.TanzaniaSafariGuide) {
    setTimeout(boot, 50);
    return;
  }
  loadPost();
}
boot();
