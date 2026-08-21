function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

const DEFAULT_AUTHOR = 'John Raphael Shayo';

const PILLAR_ORDER = [
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
  'kilimanjaro-acclimatization',
  'private-serengeti-safari-price-2026',
  '8-day-tanzania-safari-cost',
  'mara-river-crossing-best-time',
  'machame-vs-lemosho',
  'tanzania-safari-from-arusha',
  'serengeti-zanzibar-combo',
  'tanzania-safari-cost-per-person-2026'
];

const PILLAR_META = {
  'tanzania-safari': { slug: 'tanzania-safari', title: 'Tanzania Safari: The Ultimate Guide to Planning the Perfect Tour', excerpt: 'Everything you need to plan a Tanzania safari — migration timing, park fees mindset, how many days to book, and private itineraries from Arusha.', featured_image_url: '/images/optimized/serengeti-national-park.webp', published_at: '2026-07-01T10:00:00.000Z', category_name: 'Safari Guides' },
  'tanzania-safari-cost': { slug: 'tanzania-safari-cost', title: 'Tanzania Safari Cost 2026: Everything You Need to Know', excerpt: 'Up-to-date Tanzania safari costs for 2026 — budget, mid-range, and luxury daily rates.', featured_image_url: '/images/optimized/balloon.webp', published_at: '2026-07-15T10:00:00.000Z', category_name: 'Safari Guides' },
  'great-wildebeest-migration': { slug: 'great-wildebeest-migration', title: 'Great Wildebeest Migration Safari Guide | Serengeti Tanzania', excerpt: 'Month-by-month herd map, river crossings, calving season, and how to book with a local Arusha operator.', featured_image_url: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp', published_at: '2026-07-28T10:00:00.000Z', category_name: 'Safari Guides' },
  'zanzibar-guide': { slug: 'zanzibar-guide', title: 'Zanzibar Guide 2026: Beaches, Spice Island & Safari Extensions', excerpt: 'Best beaches, Stone Town, spice tours, and how to add Zanzibar after Serengeti or Ngorongoro.', featured_image_url: '/images/optimized/zanzibar.webp', published_at: '2026-07-20T10:00:00.000Z', category_name: 'Safari Guides' },
  'ngorongoro-crater': { slug: 'ngorongoro-crater', title: 'Ngorongoro Crater Safari Guide 2026 | Wildlife & Day Visits', excerpt: 'Plan a Ngorongoro Crater day visit or rim stay — Big Five, climate, best months, and private itineraries from Arusha.', featured_image_url: '/images/optimized/ngororo%20%20righno.webp', published_at: '2026-07-20T10:00:00.000Z', category_name: 'Safari Guides' },
  'serengeti-national-park': { slug: 'serengeti-national-park', title: 'Serengeti National Park Guide 2026 | Wildlife & Migration Safari', excerpt: 'Migration timing by region, Big Five wildlife, how many nights to book, and where to stay by sector.', featured_image_url: '/images/optimized/serengeti-national-park.webp', published_at: '2026-07-22T10:00:00.000Z', category_name: 'Safari Guides' },
  'arusha-national-park': { slug: 'arusha-national-park', title: 'Arusha National Park Guide 2026 | Mount Meru, Lakes & Day Trips', excerpt: 'Mount Meru views, Momella Lakes, walking and canoe options, and how it fits before Serengeti.', featured_image_url: '/images/optimized/arusha-national-park.webp', published_at: '2026-07-18T10:00:00.000Z', category_name: 'Safari Guides' },
  'best-time-to-visit-tanzania': { slug: 'best-time-to-visit-tanzania', title: 'Best Time to Visit Tanzania 2026: Month-by-Month Safari Guide', excerpt: 'Dry vs green season, migration highlights, park picks, Kilimanjaro and Zanzibar timing.', featured_image_url: '/images/optimized/balloon.webp', published_at: '2026-07-22T10:00:00.000Z', category_name: 'Safari Guides' },
  'first-tanzania-safari': { slug: 'first-tanzania-safari', title: 'Your First Tanzania Safari: How to Prepare with Confidence', excerpt: 'Health mindset, packing, what game drives feel like, and private vs group departures from Arusha.', featured_image_url: '/images/optimized/serengeti-national-park.webp', published_at: '2026-08-01T10:00:00.000Z', category_name: 'Safari Guides' },
  'tanzania-solo-travel': { slug: 'tanzania-solo-travel', title: 'Solo Travel in Tanzania: Safaris That Work Alone', excerpt: 'Group departures, private vehicle options, and grounded safety habits with a local Arusha operator.', featured_image_url: '/images/optimized/tarangire-national-park.webp', published_at: '2026-08-02T10:00:00.000Z', category_name: 'Travel Tips' },
  'things-to-do-in-arusha': { slug: 'things-to-do-in-arusha', title: 'Things to Do in Arusha: Safari Gateway Ideas', excerpt: 'Park day trips, culture, markets, and how to rest before the northern circuit begins.', featured_image_url: '/images/optimized/wamasai.webp', published_at: '2026-08-02T12:00:00.000Z', category_name: 'Travel Tips' },
  'tanzania-visa-guide': { slug: 'tanzania-visa-guide', title: 'Tanzania Visa Guide: What Safari Travellers Should Know', excerpt: 'eVisa and arrival concepts, careful health notes, and who to contact for trip logistics.', featured_image_url: '/images/optimized/balloon.webp', published_at: '2026-08-03T10:00:00.000Z', category_name: 'Travel Tips' },
  'climbing-kilimanjaro-difficulty': { slug: 'climbing-kilimanjaro-difficulty', title: 'How Hard Is Climbing Kilimanjaro? Difficulty Explained Honestly', excerpt: 'Altitude is the real challenge, not ropes — fitness expectations and how to prepare for summit night.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(3).webp', published_at: '2026-08-01T09:00:00.000Z', category_name: 'Kilimanjaro Guides' },
  'kilimanjaro-cost': { slug: 'kilimanjaro-cost', title: 'Kilimanjaro Cost 2026: Climb Prices, Fees & Safari Combos', excerpt: 'Route days, park fees, inclusions, and how to budget a trek–safari combination from Arusha.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(6).webp', published_at: '2026-08-02T09:00:00.000Z', category_name: 'Kilimanjaro Guides' },
  'best-time-to-climb-kilimanjaro': { slug: 'best-time-to-climb-kilimanjaro', title: 'Best Time to Climb Kilimanjaro: Dry Windows & Safari Combos', excerpt: 'Preferred dry-leaning windows, wetter months to weigh carefully, and trek + safari sequencing.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(8).webp', published_at: '2026-08-03T09:00:00.000Z', category_name: 'Kilimanjaro Guides' },
  'kilimanjaro-routes-guide': { slug: 'kilimanjaro-routes-guide', title: 'Kilimanjaro Routes Guide: Machame, Lemosho, Marangu & More', excerpt: 'Who each route suits, how many days to plan, and how Tanzania Safari Magic helps you decide.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(1).webp', published_at: '2026-08-04T09:00:00.000Z', category_name: 'Kilimanjaro Guides' },
  'kilimanjaro-packing-list': { slug: 'kilimanjaro-packing-list', title: 'Kilimanjaro Packing List: Layers, Boots & What We Provide', excerpt: 'Layering system, footwear, daypack contents, and a clear split between your kit and crew-supplied gear.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(9).webp', published_at: '2026-08-05T09:00:00.000Z', category_name: 'Kilimanjaro Guides' },
  'train-for-kilimanjaro': { slug: 'train-for-kilimanjaro', title: 'How to Train for Kilimanjaro: Fitness Mindset That Works', excerpt: 'Trail time, cardio, downhill strength, and how fitness connects to route days.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(4).webp', published_at: '2026-08-06T09:00:00.000Z', category_name: 'Kilimanjaro Guides' },
  'kilimanjaro-tipping-guide': { slug: 'kilimanjaro-tipping-guide', title: 'Kilimanjaro & Safari Tipping Guide: Ethical Norms', excerpt: 'Typical planning ranges, crew roles, and fair habits from our Arusha team.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(5).webp', published_at: '2026-08-03T14:00:00.000Z', category_name: 'Travel Tips' },
  'kilimanjaro-acclimatization': { slug: 'kilimanjaro-acclimatization', title: 'Kilimanjaro Acclimatization: Pole Pole & Safer Pacing', excerpt: 'Slow pacing, route length, guide trust, and descent decisions. Educational, not medical advice.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(7).webp', published_at: '2026-08-04T10:00:00.000Z', category_name: 'Travel Tips' },
  'private-serengeti-safari-price-2026': { slug: 'private-serengeti-safari-price-2026', title: 'Private Serengeti Safari Price 2026: What You’ll Actually Pay', excerpt: 'Clear 2026 private Serengeti safari prices from a local Arusha operator.', featured_image_url: '/images/optimized/serengeti-national-park.webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Safari Costs' },
  '8-day-tanzania-safari-cost': { slug: '8-day-tanzania-safari-cost', title: '8 Day Tanzania Safari Cost 2026: Typical Totals from Arusha', excerpt: 'What an 8-day Tanzania safari costs in 2026 — sample itineraries and how group size changes the price.', featured_image_url: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Safari Costs' },
  'mara-river-crossing-best-time': { slug: 'mara-river-crossing-best-time', title: 'Best Time to See Wildebeest Migration Mara River Crossing', excerpt: 'When Mara River crossings happen and how to place yourself in the northern Serengeti.', featured_image_url: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Great Migration' },
  'machame-vs-lemosho': { slug: 'machame-vs-lemosho', title: 'Machame Route vs Lemosho Route: Which Is Better?', excerpt: 'Duration, acclimatization, crowds, and who should choose which trail.', featured_image_url: '/images/kilimanjaro/kilimanjaro%20(3).webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Kilimanjaro' },
  'tanzania-safari-from-arusha': { slug: 'tanzania-safari-from-arusha', title: 'Tanzania Safari from Arusha: How to Book a Private Trip', excerpt: 'JRO arrival, private vehicles, typical routes, and a free quote from Arusha.', featured_image_url: '/images/optimized/balloon.webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Planning' },
  'serengeti-zanzibar-combo': { slug: 'serengeti-zanzibar-combo', title: 'Serengeti and Zanzibar Combo Safari: How to Plan It', excerpt: 'Pacing, flights, and a free combo quote for bush-to-beach.', featured_image_url: '/images/zanzibar/zanzibar%20(1).webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Itineraries' },
  'tanzania-safari-cost-per-person-2026': { slug: 'tanzania-safari-cost-per-person-2026', title: 'Tanzania Safari Cost per Person 2026: Realistic Budgets', excerpt: 'Per-person Tanzania safari prices for 2026 — what couples vs families pay.', featured_image_url: '/images/optimized/balloon.webp', published_at: '2026-08-21T10:00:00.000Z', category_name: 'Safari Costs' }
};

function pillarFromWindow(slug) {
  return PILLAR_META[slug] || null;
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
        <span class="blog-mag-more">${t('blog.readMore')}</span>
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
      <p class="text-muted" style="text-align:center;padding:2rem">${t('blog.noPosts')}</p>
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
