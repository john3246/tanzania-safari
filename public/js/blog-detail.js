/**
 * Editorial blog detail — pillar guides + CMS posts
 * Author byline: John Raphael Shayo · CTAs: Our Team
 * Requires: guide-i18n.js loaded BEFORE this file (from blog-detail.html)
 */
function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

function localeTag() {
  const lang = (window.TSM_i18n && window.TSM_i18n.getLanguage && window.TSM_i18n.getLanguage()) || 'en';
  const map = { en: 'en-GB', it: 'it-IT', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', nl: 'nl-NL' };
  return map[lang] || 'en-GB';
}

const DEFAULT_AUTHOR = 'John Raphael Shayo';
const TEAM_WHATSAPP =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27d%20like%20help%20planning%20a%20safari.';

const PILLAR_SLUGS = {
  'tanzania-safari': 'TanzaniaSafariGuide',
  'tanzania-safari-cost': 'TanzaniaSafariCostGuide',
  'great-wildebeest-migration': 'GreatWildebeestMigrationGuide',
  'zanzibar-guide': 'ZanzibarGuide',
  'ngorongoro-crater': 'NgorongoroCraterGuide',
  'serengeti-national-park': 'SerengetiNationalParkGuide',
  'arusha-national-park': 'ArushaNationalParkGuide',
  'best-time-to-visit-tanzania': 'BestTimeToVisitTanzaniaGuide',
  'first-tanzania-safari': 'FirstTanzaniaSafariGuide',
  'tanzania-solo-travel': 'TanzaniaSoloTravelGuide',
  'things-to-do-in-arusha': 'ThingsToDoInArushaGuide',
  'tanzania-visa-guide': 'TanzaniaVisaGuide',
  'climbing-kilimanjaro-difficulty': 'ClimbingKilimanjaroDifficultyGuide',
  'kilimanjaro-cost': 'KilimanjaroCostGuide',
  'best-time-to-climb-kilimanjaro': 'BestTimeClimbKilimanjaroGuide',
  'kilimanjaro-routes-guide': 'KilimanjaroRoutesGuide',
  'kilimanjaro-packing-list': 'KilimanjaroPackingListGuide',
  'train-for-kilimanjaro': 'TrainForKilimanjaroGuide',
  'kilimanjaro-tipping-guide': 'KilimanjaroTippingGuide',
  'kilimanjaro-acclimatization': 'KilimanjaroAcclimatizationGuide',
  'serengeti-safari-cost-2026': 'SerengetiSafariCost2026Guide',
  'tanzania-safari-zanzibar-combo': 'TanzaniaSafariZanzibarComboGuide',
  'kilimanjaro-route-comparison': 'KilimanjaroRouteComparisonGuide'
};

const RELATED_PILLAR_KEYS = [
  { slug: 'serengeti-safari-cost-2026', key: '' },
  { slug: 'tanzania-safari-zanzibar-combo', key: '' },
  { slug: 'kilimanjaro-route-comparison', key: '' },
  { slug: 'tanzania-safari', key: 'blogDetail.pillar.ultimateSafari' },
  { slug: 'best-time-to-visit-tanzania', key: 'blogDetail.pillar.bestTime' },
  { slug: 'tanzania-safari-cost', key: 'blogDetail.pillar.cost2026' },
  { slug: 'great-wildebeest-migration', key: 'blogDetail.pillar.migration' },
  { slug: 'serengeti-national-park', key: 'blogDetail.pillar.serengeti' },
  { slug: 'ngorongoro-crater', key: 'blogDetail.pillar.ngorongoro' },
  { slug: 'arusha-national-park', key: 'blogDetail.pillar.arusha' },
  { slug: 'zanzibar-guide', key: 'blogDetail.pillar.zanzibar' },
  { slug: 'first-tanzania-safari', key: 'blogDetail.pillar.firstSafari' },
  { slug: 'tanzania-solo-travel', key: 'blogDetail.pillar.soloTravel' },
  { slug: 'things-to-do-in-arusha', key: 'blogDetail.pillar.arushaThings' },
  { slug: 'tanzania-visa-guide', key: 'blogDetail.pillar.visa' },
  { slug: 'climbing-kilimanjaro-difficulty', key: 'blogDetail.pillar.kiliDifficulty' },
  { slug: 'kilimanjaro-cost', key: 'blogDetail.pillar.kiliCost' },
  { slug: 'best-time-to-climb-kilimanjaro', key: 'blogDetail.pillar.kiliBestTime' },
  { slug: 'kilimanjaro-routes-guide', key: 'blogDetail.pillar.kiliRoutes' },
  { slug: 'kilimanjaro-packing-list', key: 'blogDetail.pillar.kiliPacking' },
  { slug: 'train-for-kilimanjaro', key: 'blogDetail.pillar.kiliTrain' },
  { slug: 'kilimanjaro-tipping-guide', key: 'blogDetail.pillar.kiliTipping' },
  { slug: 'kilimanjaro-acclimatization', key: 'blogDetail.pillar.kiliAcclimatization' }
];

const KILI_SLUGS = new Set([
  'climbing-kilimanjaro-difficulty',
  'kilimanjaro-cost',
  'best-time-to-climb-kilimanjaro',
  'kilimanjaro-routes-guide',
  'kilimanjaro-packing-list',
  'train-for-kilimanjaro',
  'kilimanjaro-tipping-guide',
  'kilimanjaro-acclimatization',
  'kilimanjaro-route-comparison'
]);

function relatedLabel(p) {
  const translated = p.key ? t(p.key) : '';
  if (translated && translated !== p.key) return translated;
  const g = getGuide(p.slug);
  if (g && g.META && g.META.title) return g.META.title;
  return p.slug;
}

function relatedGuidesHtml(currentSlug) {
  const preferKili = KILI_SLUGS.has(currentSlug);
  const ranked = RELATED_PILLAR_KEYS
    .filter(p => p.slug !== currentSlug)
    .slice()
    .sort((a, b) => {
      const aw = preferKili ? (KILI_SLUGS.has(a.slug) ? 0 : 1) : (KILI_SLUGS.has(a.slug) ? 1 : 0);
      const bw = preferKili ? (KILI_SLUGS.has(b.slug) ? 0 : 1) : (KILI_SLUGS.has(b.slug) ? 1 : 0);
      return aw - bw;
    });
  return ranked
    .slice(0, 6)
    .map(p => `<li><a href="/blog/${p.slug}">${escapeHtml(relatedLabel(p))}</a></li>`)
    .join('');
}

function getGuide(slug) {
  const key = PILLAR_SLUGS[slug];
  return key ? window[key] : null;
}

function loadGuideScript(slug) {
  if (getGuide(slug)) return Promise.resolve(getGuide(slug));
  const file = slug && PILLAR_SLUGS[slug] ? `/js/blog-guides/${slug}.js` : '';
  if (!file) return Promise.resolve(null);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = file;
    s.onload = () => resolve(getGuide(slug));
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

async function loadPost() {
  try {
    if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
  } catch (_) {}

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

  let guide = getGuide(slug);
  if (!guide) guide = await loadGuideScript(slug);
  if (guide && window.TSM_guideI18n && typeof window.TSM_guideI18n.localizeGuide === 'function') {
    guide = await window.TSM_guideI18n.localizeGuide(guide);
  }

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
        <h1>${escapeHtml(t('blogDetail.postNotFound'))}</h1>
        <p><a href="/blog">${escapeHtml(t('blogDetail.backToBlog'))}</a> · <a href="/blog/tanzania-safari">${escapeHtml(t('blogDetail.ultimateGuide'))}</a> · <a href="/blog/best-time-to-visit-tanzania">${escapeHtml(t('blogDetail.bestTime'))}</a> · <a href="/blog/serengeti-national-park">${escapeHtml(t('blogDetail.serengeti'))}</a></p>
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
  const teamRole = gAuthor.role || t('blogDetail.defaultTeamRole');
  const teamBio = gAuthor.bio || t('blogDetail.defaultTeamBio');
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
  const relatedGuides = relatedGuidesHtml(slug);

  container.innerHTML = `
    <article class="blog-article-main">
      <nav class="blog-crumb" aria-label="Breadcrumb">
        <a href="/">${escapeHtml(t('blogDetail.home'))}</a><span>/</span><a href="/blog">${escapeHtml(t('blogDetail.blog'))}</a><span>/</span><span>${escapeHtml(title)}</span>
      </nav>
      <h1 class="blog-h1">${escapeHtml(title)}</h1>
      <div class="blog-byline">
        <span>${escapeHtml(t('blogDetail.by'))} <a href="/about">${escapeHtml(author)}</a></span>
        <span>${escapeHtml(t('blogDetail.lastUpdated'))} ${fmtDate(updated)}</span>
        ${data.category_name ? `<span>${escapeHtml(data.category_name)}</span>` : ''}
      </div>
      <p class="blog-disclaimer">${escapeHtml(t('blogDetail.disclaimer'))}</p>

      ${!data._isGuide ? `
        <figure class="guide-figure">
          <img src="${imgSrc(image)}" alt="${escapeHtml(title)}" width="1200" height="675" loading="eager" decoding="async">
        </figure>` : ''}

      <div class="blog-prose" id="articleBody">${content}</div>

      <div class="blog-share-row">
        <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener" aria-label="${escapeHtml(t('blogDetail.shareFacebook'))}"><i class="fab fa-facebook-f"></i></a>
        <a class="share-btn" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener" aria-label="${escapeHtml(t('blogDetail.shareX'))}"><i class="fab fa-twitter"></i></a>
        <a class="share-btn" href="https://wa.me/?text=${encodeURIComponent(title + ' ' + location.href)}" target="_blank" rel="noopener" aria-label="${escapeHtml(t('blogDetail.shareWhatsApp'))}"><i class="fab fa-whatsapp"></i></a>
        <a class="btn btn-primary" href="/booking" style="min-height:48px;margin-left:auto"><i class="fas fa-calendar-check"></i> ${escapeHtml(t('blogDetail.getFreeQuote'))}</a>
      </div>
    </article>

    <aside class="blog-sidebar">
      <div class="author-card blog-team-card">
        <img src="${gAuthor.image || '/images/logo.png'}" alt="${escapeHtml(t('blogDetail.teamAlt'))}" width="300" height="300" loading="lazy">
        <h3>${escapeHtml(teamName)}</h3>
        <div class="role">${escapeHtml(teamRole)}</div>
        <p>${escapeHtml(teamBio)}</p>
        <div class="author-social">
          <a class="btn btn-primary" href="${teamWa}" target="_blank" rel="noopener" style="min-height:48px;width:100%;justify-content:center"><i class="fab fa-whatsapp"></i> ${escapeHtml(t('blogDetail.whatsappTeam'))}</a>
          <a class="btn btn-outline" href="/booking" style="min-height:48px;width:100%;justify-content:center">${escapeHtml(t('blogDetail.freeSafariQuote'))}</a>
          <a class="btn btn-outline" href="/safaris" style="min-height:48px;width:100%;justify-content:center">${escapeHtml(t('blogDetail.allPackages'))}</a>
        </div>
      </div>
      <div class="author-card" style="background:#fff">
        <h3 style="font-size:1rem;margin-bottom:0.75rem">${escapeHtml(t('blogDetail.planExplore'))}</h3>
        <ul style="margin:0;padding-left:1.1rem;line-height:1.9;font-size:0.92rem">
          ${relatedGuides}
          <li><a href="/destinations/serengeti-national-park">${escapeHtml(t('blogDetail.serengeti'))}</a></li>
          <li><a href="/destinations/ngorongoro-conservation-area">${escapeHtml(t('blogDetail.ngorongoro'))}</a></li>
          <li><a href="/destinations/tarangire-national-park">${escapeHtml(t('blogDetail.tarangire'))}</a></li>
          <li><a href="/destinations/zanzibar">${escapeHtml(t('blogDetail.zanzibar'))}</a></li>
          <li><a href="/safaris">${escapeHtml(t('blogDetail.allSafariPackages'))}</a></li>
          <li><a href="/destinations">${escapeHtml(t('blogDetail.tourDestinations'))}</a></li>
          <li><a href="/booking">${escapeHtml(t('blogDetail.inquireBook'))}</a></li>
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
    <h2 id="packages">${escapeHtml(t('blogDetail.recommendedPackages'))}</h2>
    <p>${escapeHtml(t('blogDetail.recommendedIntro'))}</p>
    <div class="guide-pkg-grid">
      ${packages.slice(0, 6).map(p => {
        const slug = p.package_slug || p.slug;
        const name = p.package_name || p.name || t('blogDetail.safariPackage');
        const img = imgSrc(p.featured_image_url || p.image_url || p.image_urls?.[0], '/images/optimized/balloon.webp');
        const days = p.duration_days ? t('blogDetail.days', { n: p.duration_days }) : '';
        const price = p.base_price_usd
          ? t('blogDetail.fromPrice', { amount: Number(p.base_price_usd).toLocaleString() })
          : t('blogDetail.requestQuote');
        return `
          <a class="guide-pkg-card" href="/safaris/${slug}">
            <img src="${img}" alt="${escapeHtml(name)}" width="480" height="300" loading="lazy" decoding="async"
                 onerror="this.src='/images/optimized/balloon.webp'">
            <div class="body">
              <div class="meta">${escapeHtml(days)}</div>
              <h3>${escapeHtml(name)}</h3>
              <div class="price">${escapeHtml(price)} <span style="font-weight:500;color:#888;font-size:0.8rem">${escapeHtml(t('blogDetail.pp'))}</span></div>
            </div>
          </a>`;
      }).join('')}
    </div>
    <p><a href="/safaris">${escapeHtml(t('blogDetail.viewAllPackages'))}</a></p>
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
  return new Date(d).toLocaleDateString(localeTag(), { day: 'numeric', month: 'long', year: 'numeric' });
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
  loadPost();
}

document.addEventListener('tsm:languagechange', () => boot());
boot();
