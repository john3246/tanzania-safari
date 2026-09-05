// Global UI interactions are handled in layout-loader.js

function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

// ── Back to top ────────────────────────────────────────────
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Year ───────────────────────────────────────────────────
const yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();

// ── Safari card builder ────────────────────────────────────
function buildSafariCard(p) {
    const rating = parseFloat(p.avg_rating || 0).toFixed(1);
    const dest = Array.isArray(p.destinations) ? p.destinations.map(d => d.park_name || d).join(', ') : '';
    const img = p.featured_image_url || (p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : `/images/safaris/${p.package_slug}/main.jpg`);
    return `
    <a href="/safaris/${p.package_slug}" class="safari-card fade-up">
      <div class="safari-card-img">
        <img src="${img}" alt="${p.package_name}" width="800" height="600" loading="lazy" decoding="async" onerror="this.src='/images/optimized/balloon.webp'">
        ${p.is_featured ? `<span class="safari-card-badge"><i class="fas fa-star"></i> ${t('safarisPage.featured')}</span>` : ''}
        <span class="safari-card-duration"><i class="fas fa-clock"></i> ${p.duration_days} ${t('common.days')}</span>
      </div>
      <div class="safari-card-body">
        <div class="safari-card-category">${p.category_name || 'Safari'}</div>
        <h3 class="safari-card-title">${p.package_name}</h3>
        ${dest ? `<div class="safari-card-location"><i class="fas fa-map-marker-alt"></i>${dest}</div>` : ''}
        <div class="safari-card-rating">
          <span class="stars">${stars(parseFloat(p.avg_rating || 0))}</span>
          <span>${rating} ${p.review_count > 0 ? `(${p.review_count})` : ''}</span>
        </div>
        <div class="safari-card-footer">
          <div class="safari-card-price">
            <div class="from">${t('common.from')}</div>
            <div class="amount">$${Number(p.base_price_usd).toLocaleString()}</div>
            <div class="per">${t('common.perPerson')}</div>
          </div>
          <span class="btn btn-primary btn-sm">View Details</span>
        </div>
      </div>
    </a>`;
}

// ── Destination card builder ───────────────────────────────
function buildDestCard(d) {
    const slug = d.park_slug || d.slug || '';
    const name = d.park_name || d.name || t('common.destination');
    const img = d.featured_image_url || d.image_url
        || (d.gallery_urls && d.gallery_urls[0])
        || (d.image_urls && d.image_urls[0])
        || (slug ? `/images/optimized/${slug}.webp` : '/images/optimized/balloon.webp');
    const fb = slug ? `/images/destinations/${slug}/main.jpg` : '/images/optimized/balloon.webp';
    const count = d.safari_count || d.tour_count || 0;
    const href = slug ? `/destinations/${slug}` : '/destinations';
    return `
    <a href="${href}" class="corp-dest-card fade-up">
      <div class="corp-dest-img">
        <img src="${typeof imgSrc === 'function' ? imgSrc(img) : img}" alt="${name}" loading="lazy" decoding="async"
             onerror="this.onerror=null;this.src='${fb}';this.onerror=function(){this.src='/images/optimized/balloon.webp'}">
        <div class="corp-dest-badge">${count > 0 ? `${count} ${t('common.tours')}` : t('common.customSafaris')}</div>
      </div>
      <div class="corp-dest-content">
        <h3 class="corp-dest-title">${name}</h3>
        <div class="corp-dest-footer">
          <span class="corp-dest-explore">Explore Region <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </a>`;
}

// ── Testimonial card builder ───────────────────────────────
function buildTestimonialCard(r) {
    const name = `${r.first_name || 'Traveler'} ${r.last_name || ''}`.trim();
    const initial = name.charAt(0).toUpperCase();
    return `
    <div class="testimonial-card">
      <div class="testimonial-stars">${stars(r.rating)}</div>
      <p class="testimonial-text">"${r.comment || r.review_comment || ''}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">
          ${r.user_image ? `<img src="${imgSrc(r.user_image)}" alt="${name}" loading="lazy" decoding="async">` : initial}
        </div>
        <div>
          <div class="testimonial-name">${name}</div>
          <div class="testimonial-meta">${r.country || ''} ${r.safari_name ? '· ' + r.safari_name : ''}</div>
        </div>
      </div>
    </div>`;
}

function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function buildPartnerLogo(p) {
    const name = p.name || 'Partner';
    const href = p.websiteUrl || '#';
    const webp = p.logoUrl || '';
    const fallback = webp.replace(/\.webp$/i, '.png');
    const w = Number(p.width) || 304;
    const h = Number(p.height) || 72;
    return `<a class="partner-logo" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">
      <picture>
        <source type="image/webp" srcset="${escapeAttr(webp)}">
        <img src="${escapeAttr(fallback)}" alt="${escapeAttr(name)}" width="${w}" height="${h}" loading="lazy" decoding="async">
      </picture>
    </a>`;
}

// ── Category card builder ──────────────────────────────────
const catIcons = {
    'wildlife': 'fa-paw', 'mountain': 'fa-mountain', 'beach': 'fa-umbrella-beach',
    'cultural': 'fa-landmark', 'birding': 'fa-dove', 'family': 'fa-users',
    'luxury': 'fa-gem', 'budget': 'fa-wallet', 'photography': 'fa-camera'
};
function getCatIcon(name, cls) {
    const key = (name || cls || '').toLowerCase();
    for (const [k, v] of Object.entries(catIcons)) { if (key.includes(k)) return v; }
    return 'fa-compass';
}

// ── Load data ──────────────────────────────────────────────
async function loadHomepage() {
    // Stats
    try {
        const { data } = await API.get('/stats');
        if (data) {
            const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val + '+'; };
            el('statPackages', data.total_packages || 50);
            el('statDestinations', data.total_destinations || 15);
            el('statGuides', data.total_guides || 30);
        }
    } catch {}

    // Destinations
    try {
        const { data } = await API.get('/destinations');
        const grid = document.getElementById('destinationsGrid');
        if (grid && data?.length) {
            grid.innerHTML = data.slice(0, 4).map(buildDestCard).join('');
        } else if (grid && !grid.querySelector('.ssr-card, a[href*="/destinations/"]')) {
            grid.innerHTML = `<p style="text-align:center;color:var(--text-muted);grid-column:1/-1">${t('home.noDestinations')}</p>`;
        }
    } catch (e) {
        const grid = document.getElementById('destinationsGrid');
        // Keep SSR cards if present so the page never looks empty after a transient API failure
        if (grid && !grid.querySelector('.ssr-card, a[href*="/destinations/"]')) {
            grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">${t('home.unableDestinations')}</p>`;
        }
    }

    // Categories — only those with packages; filter fetches that category from the API
    let featuredPackages = [];
    const viewAllLink = document.getElementById('viewAllSafaris');

    async function loadSafarisByCategory(slug) {
        const grid = document.getElementById('safarisGrid');
        if (grid) {
            grid.innerHTML = '<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton-body"><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div></div></div>'.repeat(4);
        }
        if (viewAllLink) {
            viewAllLink.href = (!slug || slug === 'all')
                ? '/safaris'
                : (slug === 'group-safaris' ? '/group-safaris' : `/safaris?category=${encodeURIComponent(slug)}`);
        }
        try {
            if (!slug || slug === 'all') {
                const { data } = await API.get('/packages?limit=24&sort=random');
                featuredPackages = shuffleList(data || []);
                renderSafaris(featuredPackages, 6);
                return;
            }
            const { data } = await API.get(`/packages?category=${encodeURIComponent(slug)}&limit=12&sort=random`);
            renderSafaris(shuffleList(data || []), 8);
        } catch {
            if (grid && !grid.querySelector('.ssr-card, a[href*="/safaris/"]')) {
                grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">${t('home.unablePackages')}</p>`;
            }
        }
    }

    try {
        const { data: cats } = await API.get('/categories');
        const filterBar = document.getElementById('categoryFilters');
        if (cats?.length && filterBar) {
            cats.forEach((c) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'filter-btn';
                btn.dataset.filter = c.category_slug;
                btn.textContent = c.category_name;
                filterBar.appendChild(btn);
            });
            filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');
                    loadSafarisByCategory(btn.dataset.filter);
                });
            });
        }
    } catch {}

    // Upcoming group departures teaser on homepage
    try {
        const teaser = document.getElementById('groupHomeTeaser');
        if (teaser) {
            const { data } = await API.get('/group-departures?limit=2');
            if (data?.length) {
                teaser.innerHTML = data.map(d => {
                    const start = new Date(d.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const img = d.featured_image_url || '/images/optimized/serengeti-national-park.webp';
                    const price = Number(d.sale_price_usd || d.price_usd || 0);
                    const seats = d.seats_left != null ? t('group.seatsLeft', { n: d.seats_left }) : 'Open';
                    return `<a href="/group-safaris/${encodeURIComponent(d.departure_slug)}" class="group-home-card">
                      <div class="group-home-card-media">
                        <img src="${img}" alt="${(d.title || t('common.groupSafari')).replace(/"/g, '&quot;')}" loading="lazy" decoding="async"
                             onerror="this.src='/images/optimized/serengeti-national-park.webp'">
                        <span class="group-home-card-badge">${d.duration_days || '—'} ${t('common.days')}</span>
                      </div>
                      <div class="group-home-card-body">
                        <div class="group-home-card-meta">
                          <span><i class="fas fa-calendar-alt"></i> ${start}</span>
                          <span><i class="fas fa-users"></i> ${seats}</span>
                        </div>
                        <h3>${d.title || t('common.groupSafari')}</h3>
                        <p>${(d.short_description || t('home.groupDefaultDesc')).slice(0, 120)}${(d.short_description || '').length > 120 ? '…' : ''}</p>
                        <div class="group-home-card-foot">
                          <div class="group-home-card-price">$${price.toLocaleString()}<small>${t('common.perPerson')}</small></div>
                          <span class="btn btn-primary btn-sm">${t('group.requestSeat')}</span>
                        </div>
                      </div>
                    </a>`;
                }).join('');
            } else {
                teaser.innerHTML = `<div class="group-home-empty" style="grid-column:1/-1">
                  <p style="margin:0 0 1rem;color:var(--text-secondary)">${t('home.noGroupTeaser')}</p>
                  <a href="/group-safaris" class="btn btn-primary">${t('home.viewAllGroupLink')}</a>
                </div>`;
            }
        }
    } catch {}

    // Safaris
    try {
        const { data } = await API.get('/packages?limit=24&sort=random');
        featuredPackages = shuffleList(data || []);
        renderSafaris(featuredPackages, 6);
        // Populate quick-book dropdown
        const sel = document.getElementById('quickBookPackage');
        if (sel && featuredPackages.length) {
            featuredPackages.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.package_id;
                opt.textContent = p.package_name;
                sel.appendChild(opt);
            });
        }
        // Footer safaris
        const footerSafaris = document.getElementById('footerSafaris');
        if (footerSafaris && data?.length) {
            footerSafaris.innerHTML = data.slice(0, 5).map(p =>
                `<li><a href="/safaris/${p.package_slug}">${p.package_name}</a></li>`
            ).join('');
        }
    } catch (e) {
        const grid = document.getElementById('safarisGrid');
        if (grid && !grid.querySelector('.ssr-card, a[href*="/safaris/"]')) {
            grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">${t('home.unablePackages')}</p>`;
        }
    }

    // Testimonials — hide the whole section if there are no real reviews
    try {
        const { data } = await API.get('/testimonials?limit=6');
        const grid = document.getElementById('testimonialsGrid');
        const section = document.getElementById('homeTestimonials');
        const real = (data || []).filter((r) => (r.comment || r.review_comment || '').trim());
        if (grid && real.length) {
            grid.innerHTML = real.map(buildTestimonialCard).join('');
            if (section) section.style.display = '';
        } else if (section) {
            section.style.display = 'none';
        } else if (grid) {
            grid.innerHTML = '';
        }
    } catch {
        const section = document.getElementById('homeTestimonials');
        if (section) section.style.display = 'none';
    }

    // Partners — data file so logos can be added without changing this renderer
    try {
        const grid = document.getElementById('partnersGrid');
        if (grid && !grid.querySelector('.partner-logo')) {
            const res = await fetch('/data/partners.json', { cache: 'no-cache' });
            const partners = await res.json();
            if (Array.isArray(partners) && partners.length) {
                grid.innerHTML = partners.map(buildPartnerLogo).join('');
            }
        }
    } catch {}
}

function shuffleList(list) {
    const a = Array.isArray(list) ? [...list] : [];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function renderSafaris(packages, limit = 6) {
    const grid = document.getElementById('safarisGrid');
    if (!grid) return;
    if (!packages?.length) {
        grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem">${t('home.noPackages')}</p>`;
        return;
    }
    grid.innerHTML = packages.slice(0, limit).map(buildSafariCard).join('');
}

// ── Quick Book Modal ───────────────────────────────────────
const modal = document.getElementById('quickBookModal');
document.querySelectorAll('[href="/booking"], .nav-cta').forEach(el => {
    if (el.classList.contains('nav-cta')) {
        el.addEventListener('click', e => { e.preventDefault(); modal?.classList.add('active'); });
    }
});
document.getElementById('closeQuickBook')?.addEventListener('click', () => modal?.classList.remove('active'));
modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

document.getElementById('quickBookForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('quickBookSubmit');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('common.sending')}`;
    btn.disabled = true;
    const formData = Object.fromEntries(new FormData(e.target));
    try {
        await API.post('/contact', { ...formData, enquiry_type: 'Quick Booking' });
        modal.classList.remove('active');
        toast(t('toast.inquirySuccess'), 'success');
        e.target.reset();
    } catch (err) {
        toast(err.message || t('toast.sendFail'), 'error');
    } finally {
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t('common.sendInquiry')}`;
        btn.disabled = false;
    }
});

// ── Newsletter ─────────────────────────────────────────────
document.getElementById('newsletterForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    try {
        await API.post('/newsletter', { email });
        toast(t('toast.subscribeSuccess'), 'success');
        e.target.reset();
    } catch {
        toast(t('toast.subscribeFail'), 'error');
    }
});

const TOUR_LABEL_BY_KEY = {
    'balloon': 'Hot Air Balloon',
    'boat zanzibar': 'Dhow Cruise',
    'chui hunting': 'Private Game Drive',
    'chui juu yamti': 'Big Cat Safari',
    'chui resting': 'Afternoon Game Drive',
    'chui stuning': 'Luxury Game Drive',
    'chui': 'Wilderness Safari',
    'climbing mountain': 'Kilimanjaro Trek',
    'faru attack': 'Crater Floor Drive',
    'faru': 'Conservation Safari',
    'flamingo': 'Lake Manyara',
    'kiboko': 'Hippo Pool Stop',
    'kifaru': 'Black Rhino Safari',
    'kundi simba': 'Pride Country Drive',
    'leopard wayowing': 'Evening Game Drive',
    'lion hunt': 'Predator Safari',
    'lion son': 'Family Safari',
    'mbugani': 'Ngorongoro Safari',
    'nyumbu 2': 'Calving Season',
    'nyumbu': 'Herd Migration',
    'on top on mount lion': 'Kopje Picnic',
    'punda mlia': 'Plains Game Drive',
    'scaterd nyumbu': 'Great Migration',
    'serengeti chui': 'Serengeti Wilderness',
    'simba on grass': 'Dawn Game Drive',
    'starting crossing the river': 'River Crossing',
    'swalaa': 'Savannah Drive',
    'tembo 2': 'Wildlife Safari',
    'tembo mkubwa': 'Elephant Country',
    'tembo sere': 'Serengeti Game Drive',
    'tembo': 'Waterhole Stop',
    'tour car': '4x4 Game Drive',
    'tumbili': 'Bush Walk',
    'twiga crossing road': 'Safari Transfer',
    'twiga eating': 'Tarangire Safari',
    'twiga': 'Acacia Country',
    'wamasai': 'Cultural Visit',
    'zanzibar sunset': 'Island Sunset',
    'zebra 2': 'Open Plains',
    'zebra serengeti': 'Grassland Drive',
    'ziwa': 'Lakeside Safari'
};

const TOUR_FALLBACKS = [
    'Game Drive',
    'Wildlife Safari',
    'Cultural Visit',
    'Bush Breakfast',
    'Walking Safari',
    'Scenic Transfer',
    'Island Excursion',
    'Mountain Trek'
];

function momentsFileKey(src) {
    try {
        return decodeURIComponent((src || '').split('/').pop() || '')
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    } catch {
        return '';
    }
}

function tagFromImageSrc(src) {
    const key = momentsFileKey(src);
    if (TOUR_LABEL_BY_KEY[key]) return TOUR_LABEL_BY_KEY[key];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i) * (i + 1)) % TOUR_FALLBACKS.length;
    return TOUR_FALLBACKS[hash] || 'Game Drive';
}

const FALLBACK_MOMENTS = [
    { src: '/images/experinces%20on%20ground/chui%20juu%20yamti.webp', tag: 'Big Cat Safari' },
    { src: '/images/experinces%20on%20ground/climbing%20mountain.webp', tag: 'Kilimanjaro Trek' },
    { src: '/images/experinces%20on%20ground/wamasai.webp', tag: 'Cultural Visit' },
    { src: '/images/experinces%20on%20ground/simba%20on%20grass.webp', tag: 'Dawn Game Drive' },
    { src: '/images/experinces%20on%20ground/lion%20hunt.webp', tag: 'Predator Safari' },
    { src: '/images/experinces%20on%20ground/boat%20zanzibar.webp', tag: 'Dhow Cruise' },
    { src: '/images/experinces%20on%20ground/starting%20crossing%20the%20river.webp', tag: 'River Crossing' },
    { src: '/images/experinces%20on%20ground/faru%20attack.webp', tag: 'Crater Floor Drive' }
];

function escapeMomentsText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function loadMomentsSlides() {
    const tryUrls = [
        '/api/experiences-on-ground',
        '/data/experiences-on-ground.json',
        '/images/experinces%20on%20ground/manifest.json'
    ];
    for (const url of tryUrls) {
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) continue;
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.slides || data.data);
            if (Array.isArray(list) && list.length) {
                return list.map((s) => {
                    const src = s.src || s.url || s.image || '';
                    return { src, tag: tagFromImageSrc(src) };
                }).filter((s) => s.src);
            }
        } catch {}
    }
    return FALLBACK_MOMENTS;
}

function initMomentsSlider(slides) {
    const root = document.getElementById('homeMoments');
    const track = document.getElementById('momentsSlides');
    const tagLabel = document.getElementById('momentsTag');
    if (!root || !track) return;
    if (!slides?.length) {
        root.hidden = true;
        return;
    }
    root.hidden = false;

    track.innerHTML = slides.map((s, i) => `
      <div class="moments-slide${i === 0 ? ' active' : ''}" data-index="${i}">
        <img src="${escapeMomentsText(s.src)}" alt="${escapeMomentsText(s.tag)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
      </div>`).join('');

    if (tagLabel) tagLabel.textContent = slides[0].tag;

    let index = 0;
    let timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = (n) => {
        index = (n + slides.length) % slides.length;
        track.querySelectorAll('.moments-slide').forEach((el, i) => el.classList.toggle('active', i === index));
        if (tagLabel) tagLabel.textContent = slides[index].tag;
    };
    const start = () => {
        stop();
        if (reduceMotion || slides.length < 2) return;
        timer = window.setInterval(() => show(index + 1), 5200);
    };
    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    document.getElementById('momentsPrev')?.addEventListener('click', () => { show(index - 1); start(); });
    document.getElementById('momentsNext')?.addEventListener('click', () => { show(index + 1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });
    start();
}

// ── Init ───────────────────────────────────────────────────
(async () => {
  try {
    if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
  } catch (_) {}
  loadHomepage();
  loadMomentsSlides().then(initMomentsSlider).catch(() => initMomentsSlider(FALLBACK_MOMENTS));
  fetch('/data/dar-es-salaam.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const el = document.getElementById('home-faq');
      if (el && d && d.src) {
        el.style.backgroundImage = "url('" + d.src + "')";
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    })
    .catch(() => {});
})();

// -- Reveal Animations --
const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); } }); }, { threshold: 0.1 });
document.querySelectorAll('section, .feature-card').forEach(el => { el.classList.add('reveal-item'); revealObserver.observe(el); });
