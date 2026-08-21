// Global UI interactions are handled in layout-loader.js

function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

// ── Mobile nav ─────────────────────────────────────────────
const toggle = document.getElementById('mobileToggle');
const nav = document.getElementById('mainNav');
const overlay = document.getElementById('menuOverlay');
function closeNav() { nav?.classList.remove('active'); overlay?.classList.remove('active'); }
toggle?.addEventListener('click', () => { nav.classList.toggle('active'); overlay.classList.toggle('active'); });
overlay?.addEventListener('click', closeNav);

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
                renderSafaris(featuredPackages, 4);
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
        renderSafaris(featuredPackages, 4);
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
}

function shuffleList(list) {
    const a = Array.isArray(list) ? [...list] : [];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function renderSafaris(packages, limit = 4) {
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

// ── Init ───────────────────────────────────────────────────
(async () => {
  try {
    if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
  } catch (_) {}
  loadHomepage();
})();

// -- Reveal Animations --
const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); } }); }, { threshold: 0.1 });
document.querySelectorAll('section, .feature-card').forEach(el => { el.classList.add('reveal-item'); revealObserver.observe(el); });
