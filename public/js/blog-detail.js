/**
 * Editorial blog detail — pillar guides + CMS posts
 * Author byline: John Raphael Shayo · CTAs: Our Team
 */
const DEFAULT_AUTHOR = 'John Raphael Shayo';
const TEAM_WHATSAPP =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27d%20like%20help%20planning%20a%20safari.';

const PILLAR_SLUGS = {
  'tanzania-safari': 'TanzaniaSafariGuide',
  'tanzania-safari-cost': 'TanzaniaSafariCostGuide'
};

function getGuide(slug) {
  const key = PILLAR_SLUGS[slug];
  return key ? window[key] : null;
}

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

  const guide = getGuide(slug);
  if (guide) {
    data = {
      ...(data || {}),
      post_title: guide.META.title,
      post_slug: guide.META.slug,
      post_excerpt: guide.META.excerpt,
      post_content: guide.contentHtml(),
      featured_image_url: (data && data.featured_image_url) || guide.META.featured_image_url,
      meta_title: guide.META.meta_title,
      meta_description: guide.META.meta_description,
      published_at: (data && data.published_at) || guide.META.published_at,
      updated_at: guide.META.updated_at,
      category_name: guide.META.category_name,
      author_name: guide.META.author_name || DEFAULT_AUTHOR,
      post_tags: guide.META.post_tags,
      keywords: guide.META.keywords,
      _isGuide: true,
      _guide: guide
    };
  }

  if (!data || !data.post_title) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem">
        <h1>Post not found</h1>
        <p><a href="/blog">Back to Blog</a> · <a href="/blog/tanzania-safari">Ultimate Guide</a> · <a href="/blog/tanzania-safari-cost">Safari Cost Guide</a></p>
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
  const gAuthor = data._guide?.AUTHOR || data._guide?.TEAM || {};
  const teamName = gAuthor.displayName || 'Our Team';
  const teamRole = gAuthor.role || 'Safari Specialists · Arusha';
  const teamBio =
    gAuthor.bio ||
    'Tanzania Safari Magic’s Arusha team designs private mid-range and luxury safaris across Serengeti, Ngorongoro, Tarangire, Kilimanjaro, and Zanzibar.';
  const teamWa = gAuthor.whatsapp || TEAM_WHATSAPP;
  const keywords =
    data.keywords ||
    (Array.isArray(data.post_tags) ? data.post_tags.join(', ') : '') ||
    'tanzania safari, serengeti, ngorongoro, safari packages';

  document.title = (data.meta_title || `${title} | Tanzania Safari Magic`).slice(0, 70);

  if (window.SafariSEO) {
    SafariSEO.applyPageSeo({
      title: (data.meta_title || `${title} | Tanzania Safari Magic`).slice(0, 70),
      description: desc,
      image
    });
    ensureMeta('name', 'author', author);
    ensureMeta('name', 'keywords', keywords);
    injectArticleSchema({
      title,
      description: desc,
      image,
      author,
      datePublished: data.published_at,
      dateModified: updated,
      url: location.href.split('?')[0]
    });
    if (data._guide?.FAQS?.length && SafariSEO.faqSchema) {
      SafariSEO.injectJsonLd('faq-jsonld', SafariSEO.faqSchema(data._guide.FAQS));
    }
  }

  const content = data._isGuide ? data.post_content : enrichInternalLinks(data.post_content || '');
  const relatedGuides =
    slug === 'tanzania-safari-cost'
      ? `<li><a href="/blog/tanzania-safari">Ultimate Safari Guide</a></li>`
      : `<li><a href="/blog/tanzania-safari-cost">Safari Cost 2026</a></li>`;

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
      <div class="author-card blog-team-card">
        <img src="${gAuthor.image || '/images/logo.png'}" alt="Tanzania Safari Magic Our Team" width="300" height="300" loading="lazy">
        <h3>${escapeHtml(teamName)}</h3>
        <div class="role">${escapeHtml(teamRole)}</div>
        <p>${escapeHtml(teamBio)}</p>
        <div class="author-social">
          <a class="btn btn-primary" href="${teamWa}" target="_blank" rel="noopener" style="min-height:48px;width:100%;justify-content:center"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
          <a class="btn btn-outline" href="/booking" style="min-height:48px;width:100%;justify-content:center">Free Safari Quote</a>
          <a class="btn btn-outline" href="/safaris" style="min-height:48px;width:100%;justify-content:center">All Packages</a>
        </div>
      </div>
      <div class="author-card" style="background:#fff">
        <h3 style="font-size:1rem;margin-bottom:0.75rem">Plan &amp; Explore</h3>
        <ul style="margin:0;padding-left:1.1rem;line-height:1.9;font-size:0.92rem">
          ${relatedGuides}
          <li><a href="/destinations/serengeti-national-park">Serengeti</a></li>
          <li><a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a></li>
          <li><a href="/destinations/tarangire-national-park">Tarangire</a></li>
          <li><a href="/destinations/zanzibar">Zanzibar</a></li>
          <li><a href="/safaris">All Safari Packages</a></li>
          <li><a href="/destinations">Tour Destinations</a></li>
          <li><a href="/booking">Inquire / Book</a></li>
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
    <p>These live itineraries from Tanzania Safari Magic pair well with this guide. Tap any package for full day-by-day details, then request a custom quote from Our Team.</p>
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
    about: ['Tanzania safari', 'Serengeti', 'Great Migration', 'Ngorongoro', 'safari cost', 'Zanzibar']
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

function boot() {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  const key = PILLAR_SLUGS[slug];
  if (key && !window[key]) {
    setTimeout(boot, 50);
    return;
  }
  loadPost();
}
boot();
