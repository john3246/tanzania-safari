// Global UI interactions are handled in layout-loader.js

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
        <img src="${img}" alt="${p.package_name}" loading="lazy" onerror="this.src='/images/placeholder.jpeg'">
        ${p.is_featured ? '<span class="safari-card-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
        <span class="safari-card-duration"><i class="fas fa-clock"></i> ${p.duration_days} Days</span>
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
            <div class="from">From</div>
            <div class="amount">$${Number(p.base_price_usd).toLocaleString()}</div>
            <div class="per">per person</div>
          </div>
          <span class="btn btn-primary btn-sm">View Details</span>
        </div>
      </div>
    </a>`;
}

// ── Destination card builder ───────────────────────────────
function buildDestCard(d) {
    const img = d.featured_image_url || d.image_url || `/images/destinations/${d.park_slug}/main.jpg`;
    return `
    <a href="/destinations/${d.park_slug}" class="corp-dest-card fade-up">
      <div class="corp-dest-img">
        <img src="${img}" alt="${d.park_name}" loading="lazy" onerror="this.src='/images/placeholder.jpeg'">
        <div class="corp-dest-badge">${d.safari_count || 0} Tours</div>
      </div>
      <div class="corp-dest-content">
        <h3 class="corp-dest-title">${d.park_name}</h3>
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
          ${r.user_image ? `<img src="${imgSrc(r.user_image)}" alt="${name}">` : initial}
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
        } else if (grid) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1">No destinations found.</p>';
        }
    } catch (e) {
        const grid = document.getElementById('destinationsGrid');
        if (grid) grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">Unable to load destinations.</p>';
    }

    // Categories (filters + category cards)
    let allPackages = [];
    try {
        const { data: cats } = await API.get('/categories');
        const filterBar = document.getElementById('categoryFilters');
        const catGrid = document.getElementById('categoriesGrid');
        if (cats?.length && filterBar) {
            cats.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.filter = c.category_slug;
                btn.textContent = c.category_name;
                filterBar.appendChild(btn);
            });
            filterBar.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const f = btn.dataset.filter;
                    const filtered = f === 'all' ? allPackages : allPackages.filter(p => p.category_slug === f);
                    renderSafaris(filtered);
                });
            });
        }
        if (cats?.length && catGrid) {
            catGrid.innerHTML = cats.map(c => `
            <a href="/safaris?category=${c.category_slug}" class="cat-card">
              <div class="cat-icon"><i class="fas ${getCatIcon(c.category_name, c.icon_class)}"></i></div>
              <div class="cat-name">${c.category_name}</div>
              <div class="cat-count">${c.safari_count || 0} Safaris</div>
            </a>`).join('');
        }
    } catch {}

    // Safaris
    try {
        const { data } = await API.get('/packages/featured?limit=6');
        allPackages = data || [];
        renderSafaris(allPackages);
        // Populate quick-book dropdown
        const sel = document.getElementById('quickBookPackage');
        if (sel && allPackages.length) {
            allPackages.forEach(p => {
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
        if (grid) grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">Unable to load safari packages.</p>';
    }

    // Testimonials
    try {
        const { data } = await API.get('/testimonials?limit=6');
        const grid = document.getElementById('testimonialsGrid');
        if (grid && data?.length) {
            grid.innerHTML = data.map(buildTestimonialCard).join('');
        } else if (grid) {
            grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">No testimonials yet.</p>';
        }
    } catch {}
}

function renderSafaris(packages) {
    const grid = document.getElementById('safarisGrid');
    if (!grid) return;
    if (!packages?.length) {
        grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem">No safari packages found.</p>';
        return;
    }
    grid.innerHTML = packages.slice(0, 4).map(buildSafariCard).join('');
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
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    const formData = Object.fromEntries(new FormData(e.target));
    try {
        await API.post('/contact', { ...formData, enquiry_type: 'Quick Booking' });
        modal.classList.remove('active');
        toast('Your inquiry has been sent! We\'ll respond within 24 hours.', 'success');
        e.target.reset();
    } catch (err) {
        toast(err.message || 'Failed to send. Please try again.', 'error');
    } finally {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry';
        btn.disabled = false;
    }
});

// ── Newsletter ─────────────────────────────────────────────
document.getElementById('newsletterForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    try {
        await API.post('/newsletter', { email });
        toast('Thank you for subscribing!', 'success');
        e.target.reset();
    } catch {
        toast('Subscription failed. Please try again.', 'error');
    }
});

// ── Init ───────────────────────────────────────────────────
loadHomepage();

// -- Reveal Animations --
const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); } }); }, { threshold: 0.1 });
document.querySelectorAll('section, .feature-card').forEach(el => { el.classList.add('reveal-item'); revealObserver.observe(el); });

// ── WhatsApp Floating Button ───────────────────────────────
function initWhatsAppButton() {
    const waPhone = "+255123456789"; // Default phone number
    const waMessage = "Hello Tanzania Safari! I'm interested in booking a safari.";
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

    const waBtn = document.createElement('a');
    waBtn.href = waUrl;
    waBtn.target = "_blank";
    waBtn.className = "whatsapp-float fade-up";
    waBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    
    waBtn.style.position = 'fixed';
    waBtn.style.bottom = '25px';
    waBtn.style.left = '25px';
    waBtn.style.backgroundColor = '#25d366';
    waBtn.style.color = '#FFF';
    waBtn.style.borderRadius = '50%';
    waBtn.style.textAlign = 'center';
    waBtn.style.fontSize = '32px';
    waBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
    waBtn.style.zIndex = '9999';
    waBtn.style.width = '60px';
    waBtn.style.height = '60px';
    waBtn.style.display = 'flex';
    waBtn.style.alignItems = 'center';
    waBtn.style.justifyContent = 'center';
    waBtn.style.transition = 'all 0.3s ease';
    waBtn.style.textDecoration = 'none';

    waBtn.onmouseover = () => { waBtn.style.transform = 'scale(1.1)'; };
    waBtn.onmouseleave = () => { waBtn.style.transform = 'scale(1)'; };

    document.body.appendChild(waBtn);
}
initWhatsAppButton();
