// destination-detail.js - Dynamic destination details page

let currentDestination = null;
let currentSlug = null;

document.addEventListener('DOMContentLoaded', async () => {
    initLoadingScreen();
    initHeaderScroll();
    initBackToTop();
    initMobileMenu();
    setCurrentYear();
    loadPopularSafaris();
    
    // Get slug from URL
    currentSlug = getSlugFromUrl();
    console.log('Loading destination with slug:', currentSlug);
    
    if (currentSlug) {
        await loadDestinationDetails(currentSlug);
    } else {
        showError('No destination specified');
    }
});

function getSlugFromUrl() {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
}

function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.style.overflow = 'visible';
    }, 500);
}

function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (!mobileToggle || !navMenu || !overlay) return;
    
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    overlay.addEventListener('click', () => {
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

async function loadDestinationDetails(slug) {
    const mainContent = document.getElementById('destinationDetailContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 4rem;">
            <div class="loader-circle" style="margin: 0 auto 1rem;"></div>
            <p>Loading destination details...</p>
        </div>
    `;
    
    try {
        // Get destination details by slug
        const result = await API.getDestinationBySlug(slug);
        
        if (result && result.success && result.data) {
            currentDestination = result.data;
            
            renderDestinationDetails(currentDestination);
            const displayName = currentDestination.park_name || currentDestination.name;
            const slug = currentDestination.park_slug || currentDestination.slug || currentSlug;
            if (isNgorongoroDestination(slug, displayName)) {
                applyNgorongoroSeo(currentDestination);
                injectNgorongoroSchemas(currentDestination);
            } else {
                updatePageTitle(displayName);
                updateMetaDescription(currentDestination.park_description || currentDestination.description);
                applyDestinationSeo(currentDestination);
                injectDestinationSchema(currentDestination);
            }
            await loadSafariPackagesForDestination(displayName, slug);
            await loadRelatedDestinations(currentDestination.park_id || currentDestination.id, slug);
            if (isNgorongoroDestination(slug, displayName)) {
                await enhanceNgorongoroPackageSection();
            }
        } else {
            showError('Destination not found');
        }
    } catch (error) {
        console.error('Error loading destination details:', error);
        showError('Failed to load destination details. Please try again.');
    }
}

function renderDestinationDetails(destination) {
    const mainContent = document.getElementById('destinationDetailContent');
    if (!mainContent) return;
    
    const name = destination.park_name || destination.name;
    const description = destination.park_description || destination.description || `Experience the breathtaking beauty of ${name}. This amazing destination offers incredible wildlife viewing opportunities and stunning landscapes that will leave you in awe.`;
    const slug = destination.park_slug || destination.slug || '';
    
    const isNgorongoro = isNgorongoroDestination(slug, name);
    const guide = (isNgorongoro && window.NgorongoroDestinationGuide) ? window.NgorongoroDestinationGuide : null;
    
    // Determine destination type and features
    const isUnesco = destination.is_unesco_heritage || name.toLowerCase().includes('ngorongoro') || 
                     name.toLowerCase().includes('serengeti') ||
                     name.toLowerCase().includes('kilimanjaro');
    
    const heroTitle = guide ? guide.META.h1 : name;
    const eyebrow = isNgorongoro ? 'UNESCO World Heritage · Northern Circuit' : 'Safari Destination · Tanzania';
    
    // Get icon based on name
    let iconClass = 'fa-tree';
    if (name.toLowerCase().includes('serengeti')) iconClass = 'fa-paw';
    else if (name.toLowerCase().includes('kilimanjaro')) iconClass = 'fa-mountain';
    else if (name.toLowerCase().includes('ngorongoro')) iconClass = 'fa-volcano';
    else if (name.toLowerCase().includes('zanzibar')) iconClass = 'fa-umbrella-beach';
    else if (name.toLowerCase().includes('tarangire')) iconClass = 'fa-elephant';
    
    // Generate wildlife based on destination
    let wildlife = destination.wildlife_highlights ? destination.wildlife_highlights.split(',').map(n => ({ name: n.trim(), icon: 'fa-paw' })) : getWildlifeForDestination(name);
    
    // Generate best time to visit
    let bestMonths = getBestTimeForDestination(name, destination.best_season);
    
    // Generate quick facts
    let facts = isNgorongoro ? [
        { icon: 'fa-ruler', label: 'Crater Floor', value: '~260 sq km' },
        { icon: 'fa-mountain', label: 'Depth', value: '~600 m' },
        { icon: 'fa-paw', label: 'Large Mammals', value: '25,000+' },
        { icon: 'fa-award', label: 'Status', value: 'UNESCO Site' }
    ] : [
        { icon: 'fa-ruler', label: 'Size', value: destination.size_sq_km ? `${Number(destination.size_sq_km).toLocaleString()} sq km` : 'Varies' },
        { icon: 'fa-calendar', label: 'Established', value: destination.established_year || 'Various' },
        { icon: 'fa-users', label: 'Annual Visitors', value: '350,000+' },
        { icon: 'fa-star', label: 'Status', value: isUnesco ? 'UNESCO Site' : 'National Park' }
    ];
    
    const heroImg = imgSrc(
        destination.featured_image_url || destination.image_url || (destination.image_urls && destination.image_urls[0]) || (destination.gallery_urls && destination.gallery_urls[0]),
        isNgorongoro ? '/images/optimized/mbugani.webp' : (slug ? `/images/optimized/${slug}.webp` : '/images/optimized/serengeti-national-park.webp')
    );
    
    const html = `
        <section class="corp-page-hero">
            <div class="hero-slideshow">
                <div class="hero-slide active" style="background-image: url('${heroImg}');"></div>
                <div class="hero-slide" style="background-image: url('/images/optimized/balloon.webp');"></div>
                <div class="hero-slide" style="background-image: url('/images/optimized/mbugani.webp');"></div>
            </div>
            <div class="corp-page-hero-inner">
                <div class="container">
                    <div class="corp-breadcrumb">
                        <a href="/">Home</a><span>/</span><a href="/destinations">Destinations</a><span>/</span><span>${escapeHtml(name)}</span>
                    </div>
                    <span class="corp-eyebrow">${eyebrow}</span>
                    <h1 class="page-hero-title" style="color:#fff;margin:0">${escapeHtml(heroTitle)}</h1>
                    <div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:1rem">
                        <span class="badge" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:0.4rem 0.85rem;border-radius:999px;font-size:0.8rem;font-weight:600"><i class="fas fa-map-marker-alt"></i> East Africa</span>
                        ${isUnesco ? '<span class="badge" style="background:var(--accent);color:#fff;padding:0.4rem 0.85rem;border-radius:999px;font-size:0.8rem;font-weight:600"><i class="fas fa-award"></i> UNESCO Site</span>' : ''}
                        <span class="badge" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:0.4rem 0.85rem;border-radius:999px;font-size:0.8rem;font-weight:600"><i class="fas fa-binoculars"></i> ${(destination.safari_count || destination.tour_count || 0) > 0 ? `${destination.safari_count || destination.tour_count} Packages` : 'Custom Safaris'}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="corp-section">
            <div class="container">
                <div class="corp-detail-grid${isNgorongoro ? ' dest-layout-ngoro' : ''}">
                    <div class="dest-main-col">
                        ${!(isNgorongoro && guide) ? `
                        <div class="corp-panel content-section" style="margin-bottom:1.25rem">
                            <h2>About ${escapeHtml(name)}</h2>
                            <p style="font-size:1.05rem;line-height:1.8;color:var(--text-secondary);margin:0">${escapeHtml(description)}</p>
                        </div>` : ''}

                        <div class="corp-panel content-section" style="margin-bottom:1.25rem">
                            <h2>Photo Gallery</h2>
                            ${(() => {
                                const images = [];
                                if (Array.isArray(destination.gallery_urls)) images.push(...destination.gallery_urls);
                                if (Array.isArray(destination.image_urls)) {
                                    destination.image_urls.forEach(u => { if (u && !images.includes(u)) images.push(u); });
                                }
                                if (destination.featured_image_url && !images.includes(destination.featured_image_url)) images.unshift(destination.featured_image_url);
                                if (destination.image_url && !images.includes(destination.image_url)) images.unshift(destination.image_url);
                                if (!images.length && slug) images.push(`/images/destinations/${slug}/main.jpg`, `/images/optimized/${slug}.webp`);
                                if (!images.length) images.push(heroImg);
                                if (images.length > 0) {
                                    return `
                                        <div class="gallery corp-gallery">
                                            <div class="gallery-main" onclick="openLightbox('${imgSrc(images[0])}')">
                                                <img src="${imgSrc(images[0])}" alt="${escapeHtml(name)} safari landscape" width="1200" height="675" loading="eager" decoding="async">
                                            </div>
                                            ${images.length > 1 ? `
                                            <div class="gallery-thumbs" style="display:contents">
                                                ${images.slice(1, 5).map((url, i) => `
                                                    <div class="gallery-thumb" onclick="document.querySelector('.gallery-main img').src='${imgSrc(url)}'; document.querySelector('.gallery-main').setAttribute('onclick', 'openLightbox(\\'${imgSrc(url)}\\')')">
                                                        <img src="${imgSrc(url)}" alt="${escapeHtml(name)} gallery ${i+1}" width="400" height="300" loading="lazy" decoding="async">
                                                    </div>
                                                `).join('')}
                                            </div>` : ''}
                                        </div>`;
                                }
                                return '<p style="color:var(--text-muted)">Photos of this destination will be available soon.</p>';
                            })()}
                        </div>

                        <div id="lightbox" class="lightbox" onclick="closeLightbox()">
                            <button class="lightbox-close" type="button">&times;</button>
                            <img id="lightboxImg" src="" alt="Enlarged view">
                        </div>

                        <div class="corp-panel content-section" style="margin-bottom:1.25rem">
                            <h2>Quick Facts</h2>
                            <div class="corp-facts">
                                ${facts.map(fact => `
                                    <div class="corp-fact">
                                        <i class="fas ${fact.icon}"></i>
                                        <div>
                                            <h4 style="margin:0 0 0.25rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted)">${fact.label}</h4>
                                            <p style="margin:0;font-weight:700;color:var(--earth-dark)">${fact.value}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="corp-panel content-section" style="margin-bottom:1.25rem">
                            <h2>Wildlife Highlights</h2>
                            <div class="corp-wildlife">
                                ${wildlife.map(animal => `
                                    <div class="corp-wildlife-item">
                                        <i class="fas ${animal.icon}"></i>
                                        <span>${animal.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        ${!(isNgorongoro && guide) ? `
                        <div class="corp-panel content-section" style="margin-bottom:1.25rem">
                            <h2>Best Time to Visit</h2>
                            <div class="months-grid">
                                ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => `
                                    <div class="month ${bestMonths[index]}">${month}</div>
                                `).join('')}
                            </div>
                            <div class="legend">
                                <div class="legend-item"><div class="legend-color excellent"></div><span>Excellent</span></div>
                                <div class="legend-item"><div class="legend-color good"></div><span>Good</span></div>
                                <div class="legend-item"><div class="legend-color poor"></div><span>Poor</span></div>
                            </div>
                        </div>` : ''}

                        ${isNgorongoro && guide ? `
                        <div class="dest-guide-panel blog-prose content-section" id="ngorongoroGuide" style="margin-bottom:1.25rem">
                            ${guide.contentHtml()}
                        </div>` : ''}

                        <div class="corp-panel content-section" id="safariPackagesSection">
                            <h2 id="packages-heading">Safari Packages Featuring ${escapeHtml(name)}</h2>
                            <div class="packages-grid" id="packagesGrid">
                                <div class="loading-card">Loading packages...</div>
                            </div>
                        </div>
                    </div>

                    <aside class="corp-dest-sidebar">
                        <div class="corp-book-card desktop-only">
                            <h3 style="margin:0 0 1rem;font-size:1.15rem"><i class="fas fa-info-circle" style="color:var(--primary)"></i> At a Glance</h3>
                            <div class="corp-meta-list">
                                <div class="corp-meta-row"><span><i class="fas fa-map-pin"></i> Location</span><strong>Tanzania</strong></div>
                                <div class="corp-meta-row"><span><i class="fas fa-calendar"></i> Best Time</span><strong>${getBestTimeText(bestMonths)}</strong></div>
                                <div class="corp-meta-row"><span><i class="fas fa-clock"></i> Stay</span><strong>${getRecommendedStay(name)} days</strong></div>
                                <div class="corp-meta-row"><span><i class="fas fa-temperature-high"></i> Climate</span><strong>${getClimate(name)}</strong></div>
                            </div>
                            <button class="btn btn-primary btn-block" style="margin-bottom:0.75rem;min-height:48px" onclick="bookDestination('${escapeHtml(name)}')">
                                <i class="fas fa-calendar-alt"></i> Plan Your Visit
                            </button>
                            <a class="btn btn-outline btn-block" style="min-height:48px" target="_blank" rel="noopener"
                               href="https://wa.me/255695108009?text=${encodeURIComponent("Hi Tanzania Safari Magic team, I'm interested in booking a custom safari package to " + name + "...")}">
                                <i class="fab fa-whatsapp" style="color:#25D366"></i> WhatsApp Our Team
                            </a>
                            <div class="seo-trust-strip" style="justify-content:flex-start;margin-top:1rem">
                                <div class="seo-trust-item"><i class="fab fa-tripadvisor" style="color:#00af87"></i> TripAdvisor</div>
                                <div class="seo-trust-item"><i class="fas fa-certificate" style="color:#f59e0b"></i> TATO</div>
                                <div class="seo-trust-item"><i class="fas fa-shield-alt" style="color:var(--primary)"></i> Licensed</div>
                            </div>
                        </div>
                        ${isNgorongoro ? `<div id="ngoroSideTocMount"></div>
                        <div class="corp-panel" style="margin-bottom:1rem">
                            <h3 style="margin:0 0 0.75rem;font-size:1rem">Plan This Trip</h3>
                            <ul style="margin:0;padding-left:1.1rem;line-height:1.85;font-size:0.92rem">
                              <li><a href="/safaris">All safari packages</a></li>
                              <li><a href="/blog/tanzania-safari-cost">Safari cost guide</a></li>
                              <li><a href="/blog/tanzania-safari">Ultimate safari guide</a></li>
                              <li><a href="/destinations/serengeti-national-park">Combine with Serengeti</a></li>
                              <li><a href="/booking">Inquire / free quote</a></li>
                              <li><a href="/contact">Contact Us Now</a></li>
                            </ul>
                        </div>` : ''}
                        <div class="corp-panel">
                            <h3 style="margin:0 0 1rem;font-size:1.1rem"><i class="fas fa-lightbulb" style="color:var(--accent)"></i> Travel Tips</h3>
                            <ul id="travelTipsList" style="margin:0;padding-left:1.1rem;color:var(--text-secondary);line-height:1.7">${getTravelTips(name)}</ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <div class="mobile-sticky-booking" id="mobileStickyBooking">
            <div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Plan visit</div>
                <div class="price" style="font-size:1.05rem;font-weight:700">${escapeHtml(name)}</div>
            </div>
            <a href="/booking" class="btn btn-primary" style="min-height:48px">Inquire</a>
        </div>
    `;
    
    mainContent.innerHTML = html;
    document.body.classList.add('has-mobile-book-bar');
    if (isNgorongoro) mountNgorongoroSideToc();
}

function mountNgorongoroSideToc() {
    const toc = document.getElementById('ngoro-toc');
    const mount = document.getElementById('ngoroSideTocMount');
    if (!toc || !mount) return;
    const list = toc.querySelector('ol');
    if (!list) return;
    toc.classList.add('moved-to-sidebar');
    mount.innerHTML = `
      <div class="guide-toc-side">
        <h3><i class="fas fa-list" style="color:var(--accent);margin-right:0.35rem"></i> Guide Contents</h3>
        ${list.outerHTML}
      </div>`;
}

function isNgorongoroDestination(slug, name) {
    if (window.NgorongoroDestinationGuide?.matchesSlug?.(slug)) return true;
    const s = `${slug || ''} ${name || ''}`.toLowerCase();
    return s.includes('ngorongoro');
}

function applyNgorongoroSeo(destination) {
    const guide = window.NgorongoroDestinationGuide;
    const meta = guide?.META || {};
    const name = destination.park_name || destination.name || 'Ngorongoro Crater';
    const title = (meta.title || `${name} Safari Guide | Tanzania Safari Magic`).slice(0, 70);
    const description = (meta.meta_description || destination.park_description || '').slice(0, 160);
    const image = destination.featured_image_url || destination.image_urls?.[0] || meta.image;

    if (window.SafariSEO) {
        SafariSEO.applyPageSeo({ title, description, image, noindex: false });
        SafariSEO.setRobots?.('index, follow');
    } else {
        document.title = title;
        updateMetaDescription(description);
    }

    // Extra SEO metas
    ensureDestMeta('name', 'keywords', meta.keywords || 'ngorongoro crater safari, tanzania safari magic');
    ensureDestMeta('name', 'author', 'John Raphael Shayo');
    ensureDestMeta('property', 'og:type', 'article');
    const canonical = document.querySelector('link[rel="canonical"]') || (() => {
        const l = document.createElement('link');
        l.rel = 'canonical';
        document.head.appendChild(l);
        return l;
    })();
    canonical.href = `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'ngorongoro-conservation-area'}`;
}

function injectNgorongoroSchemas(destination) {
    const guide = window.NgorongoroDestinationGuide;
    const name = destination.park_name || destination.name || 'Ngorongoro Conservation Area';
    const desc = guide?.META?.meta_description || destination.park_description || destination.description || '';
    const image = destination.featured_image_url || destination.image_url || guide?.META?.image || '/images/optimized/mbugani.webp';
    const absImg = image.startsWith('http') ? image : `https://tanzaniasafarimagic.com${image}`;

    const tourist = {
        '@context': 'https://schema.org',
        '@type': ['TouristDestination', 'Place'],
        name,
        description: desc,
        image: absImg,
        url: `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'ngorongoro-conservation-area'}`,
        touristType: ['Safari', 'Wildlife', 'Nature'],
        isAccessibleForFree: false,
        publicAccess: true,
        address: {
            '@type': 'PostalAddress',
            addressRegion: 'Arusha Region',
            addressCountry: 'TZ'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -3.2095,
            longitude: 35.5655
        },
        containedInPlace: {
            '@type': 'Country',
            name: 'Tanzania'
        },
        provider: {
            '@type': 'TravelAgency',
            name: 'Tanzania Safari Magic',
            url: 'https://tanzaniasafarimagic.com',
            telephone: '+255695108009',
            email: 'info@tanzaniasafarimagic.com'
        }
    };

    const faq = guide?.FAQS || [];
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
    };

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tanzaniasafarimagic.com/' },
            { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://tanzaniasafarimagic.com/destinations' },
            { '@type': 'ListItem', position: 3, name: name, item: `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'ngorongoro-conservation-area'}` }
        ]
    };

    if (window.SafariSEO?.injectJsonLd) {
        SafariSEO.injectJsonLd('ngorongoro-destination-jsonld', tourist);
        SafariSEO.injectJsonLd('ngorongoro-faq-jsonld', faqSchema);
        SafariSEO.injectJsonLd('ngorongoro-breadcrumb-jsonld', breadcrumb);
    } else {
        [tourist, faqSchema, breadcrumb].forEach((obj, i) => {
            const el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = `ngorongoro-schema-${i}`;
            el.textContent = JSON.stringify(obj);
            document.head.appendChild(el);
        });
    }
}

function ensureDestMeta(attr, key, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

async function enhanceNgorongoroPackageSection() {
    const anchor = document.getElementById('packages-ngoro');
    const grid = document.getElementById('packagesGrid');
    if (!anchor || !grid) return;
    // Mirror packages into the in-guide anchor for SEO internal linking
    if (grid.innerHTML && !grid.innerHTML.includes('loading-card')) {
        anchor.innerHTML = `
          <h2>Our Ngorongoro Safari Packages</h2>
          <p>Live itineraries from Tanzania Safari Magic that include Ngorongoro Crater — open any package for full details, then request a custom quote.</p>
          <div class="guide-pkg-grid">${grid.innerHTML.replace(/package-card/g, 'guide-pkg-card').replace(/onclick="window.location.href='/g, 'href="').replace(/'"/g, '"')}</div>
          <p><a href="/safaris">Browse all safari packages →</a> · <a href="/booking">Get a free quote →</a></p>
        `;
        // Simpler: clone clean cards
    }
    try {
        const result = await API.getPackages({ limit: 12 });
        const pkgs = (result.data || []).filter(pkg => {
            const blob = JSON.stringify(pkg).toLowerCase();
            return blob.includes('ngorongoro') || (pkg.destinations || []).some(d =>
                String(d.park_name || d.name || d.park_slug || d.slug || '').toLowerCase().includes('ngorongoro')
            );
        });
        const list = (pkgs.length ? pkgs : (result.data || [])).slice(0, 6);
        if (!list.length) return;

        anchor.innerHTML = `
          <h2>Our Ngorongoro Safari Packages</h2>
          <p>Private itineraries featuring the crater — linked directly from this guide so you can compare days and pricing, then book with our Arusha team.</p>
          <div class="guide-pkg-grid">
            ${list.map(p => {
                const slug = p.package_slug || p.slug;
                const pname = p.package_name || p.name || 'Safari Package';
                const img = imgSrc(p.featured_image_url || p.image_url || p.image_urls?.[0], '/images/optimized/mbugani.webp');
                const days = p.duration_days ? `${p.duration_days} days` : '';
                const price = p.base_price_usd ? `From $${Number(p.base_price_usd).toLocaleString()}` : 'Request quote';
                return `<a class="guide-pkg-card" href="/safaris/${slug}">
                  <img src="${img}" alt="${escapeHtml(pname)}" width="480" height="300" loading="lazy" onerror="this.src='/images/optimized/balloon.webp'">
                  <div class="body"><div class="meta">${days}</div><h3>${escapeHtml(pname)}</h3><div class="price">${price}</div></div>
                </a>`;
            }).join('')}
          </div>
          <p><a href="/safaris">View all packages →</a> · <a href="/booking">Free Ngorongoro quote →</a> · <a href="/blog/tanzania-safari">Tanzania safari ultimate guide →</a> · <a href="/blog/tanzania-safari-cost">Safari cost guide →</a></p>
        `;
    } catch (e) {
        console.warn('Ngorongoro package enhance skipped', e);
    }
}

function injectDestinationSchema(destination) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        "name": destination.park_name || destination.name,
        "description": destination.park_description || destination.description,
        "image": destination.image_urls && destination.image_urls.length > 0 ? destination.image_urls[0] : (destination.featured_image_url || destination.image_url || 'https://tanzaniasafarimagic.com/images/hero.jpg'),
        "url": `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || ''}`,
        "provider": {
            "@type": "TravelAgency",
            "name": "Tanzania Safari Magic",
            "telephone": "+255695108009",
            "url": "https://tanzaniasafarimagic.com"
        }
    };
    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

async function loadSafariPackagesForDestination(destinationName, slug) {
    const packagesGrid = document.getElementById('packagesGrid');
    if (!packagesGrid) return;

    packagesGrid.innerHTML = '<div class="loading-card">Loading safari packages...</div>';

    try {
        // Get all packages and filter by destination
        const result = await API.getPackages({ limit: 12 });

        if (result && result.success && result.data && result.data.length > 0) {
            // Filter packages that include this destination
            const needle = (destinationName || slug || '').toLowerCase();
            const filteredPackages = result.data.filter(pkg => {
                if (pkg.destinations && pkg.destinations.some(dest => {
                    const label = `${dest.park_name || ''} ${dest.name || ''} ${dest.park_slug || ''} ${dest.slug || ''}`.toLowerCase();
                    return needle && label.includes(needle.split(' ')[0]);
                })) return true;
                return JSON.stringify(pkg).toLowerCase().includes(needle.split(' ')[0] || '___');
            });

            const packagesToShow = filteredPackages.length > 0 ? filteredPackages.slice(0, 6) : result.data.slice(0, 3);
            
            if (packagesToShow.length > 0) {
                packagesGrid.innerHTML = packagesToShow.map(pkg => {
                    const avgRating = parseFloat(pkg.avg_rating || 0).toFixed(1);
                    const pkgImg = imgSrc(pkg.featured_image_url || pkg.image_urls?.[0], '/images/optimized/balloon.webp');
                    return `
                        <div class="package-card" onclick="window.location.href='/safaris/${pkg.package_slug}'">
                            <div class="package-card-image">
                                <img src="${pkgImg}" alt="${escapeHtml(pkg.package_name)}" loading="lazy" decoding="async">
                                <div class="package-card-badge">${pkg.category_name || 'Safari'}</div>
                            </div>
                            <div class="package-card-header">
                                <h3>${escapeHtml(pkg.package_name)}</h3>
                                <p>${pkg.duration_days} Days Adventure</p>
                            </div>
                            <div class="package-card-body">
                                <div class="package-duration">
                                    <i class="fas fa-clock"></i>
                                    <span>${pkg.duration_days} days</span>
                                </div>
                                <div class="package-price">
                                    $${parseInt(pkg.base_price_usd || 0).toLocaleString()}
                                    <span style="font-size: 0.8rem;">/ person</span>
                                </div>
                                <div class="package-rating">
                                    <i class="fas fa-star" style="color: #ffc107;"></i>
                                    <span>${avgRating} (${pkg.review_count || 0} reviews)</span>
                                </div>
                                <button class="btn-view-package">View Details</button>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                packagesGrid.innerHTML = `
                  <div class="corp-empty-cta">
                    <h3 style="margin:0 0 0.5rem">No published packages for this park yet</h3>
                    <p style="margin:0;color:var(--text-secondary)">Our Arusha team can craft a private itinerary for this destination.</p>
                    <div class="actions">
                      <a href="/contact" class="btn btn-outline" style="min-height:48px">Contact Us</a>
                      <a href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27m%20interested%20in%20a%20safari%20to%20this%20destination." class="btn btn-primary" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
                    </div>
                  </div>`;
                if (window.SafariSEO) SafariSEO.setNoIndexFollow();
            }
        } else {
            packagesGrid.innerHTML = `
              <div class="corp-empty-cta">
                <h3 style="margin:0 0 0.5rem">Custom safaris available</h3>
                <p style="margin:0;color:var(--text-secondary)">Ask for a tailored itinerary — park fees, lodges, and pacing matched to your dates.</p>
                <div class="actions">
                  <a href="/contact" class="btn btn-outline" style="min-height:48px">Contact Us</a>
                  <a href="/booking" class="btn btn-primary" style="min-height:48px">Request Quote</a>
                </div>
              </div>`;
            if (window.SafariSEO) SafariSEO.setNoIndexFollow();
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        packagesGrid.innerHTML = '<p>Unable to load safari packages.</p>';
    }
}

async function loadRelatedDestinations(currentId, currentSlug) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;
    
    try {
        const result = await API.getDestinations();
        if (result && result.success && result.data) {
            const related = result.data.filter(dest => (dest.park_slug || dest.slug) !== currentSlug).slice(0, 3);
            
            if (related.length > 0) {
                const html = `
                    <section class="related-destinations">
                        <div class="container">
                            <div class="section-header">
                                <span class="section-subtitle">You Might Also Like</span>
                                <h2 class="section-title">Other Amazing Destinations</h2>
                            </div>
                            <div class="related-grid">
                                ${related.map(dest => {
                                    const rName = dest.park_name || dest.name || 'Destination';
                                    const rSlug = dest.park_slug || dest.slug || '';
                                    let iconClass = 'fa-tree';
                                    if (rName.toLowerCase().includes('serengeti')) iconClass = 'fa-paw';
                                    else if (rName.toLowerCase().includes('kilimanjaro')) iconClass = 'fa-mountain';
                                    else if (rName.toLowerCase().includes('zanzibar')) iconClass = 'fa-umbrella-beach';
                                    
                                    return `
                                        <a class="related-card" href="/destinations/${rSlug}" style="text-decoration:none;color:inherit">
                                            <div class="related-card-image">
                                                <i class="fas ${iconClass}"></i>
                                            </div>
                                            <div class="related-card-content">
                                                <h3>${escapeHtml(rName)}</h3>
                                                <p>${escapeHtml(dest.park_description || dest.description || dest.short_description || 'Discover this amazing destination')}</p>
                                                <div class="related-stats">
                                                    <span><i class="fas fa-binoculars"></i> ${dest.safari_count || dest.tour_count || 0} safaris</span>
                                                </div>
                                            </div>
                                        </a>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </section>
                `;
                
                // Insert after main content
                const mainContent = document.getElementById('destinationDetailContent');
                if (mainContent) {
                    mainContent.insertAdjacentHTML('afterend', html);
                }
            }
        }
    } catch (error) {
        console.error('Error loading related destinations:', error);
    }
}

function getWildlifeForDestination(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('serengeti')) {
        return [
            { name: 'Lions', icon: 'fa-paw' },
            { name: 'Leopards', icon: 'fa-paw' },
            { name: 'Elephants', icon: 'fa-elephant' },
            { name: 'Wildebeest', icon: 'fa-paw' },
            { name: 'Zebras', icon: 'fa-paw' },
            { name: 'Giraffes', icon: 'fa-paw' }
        ];
    } else if (lowerName.includes('ngorongoro')) {
        return [
            { name: 'Big Five', icon: 'fa-paw' },
            { name: 'Rhinos', icon: 'fa-paw' },
            { name: 'Hippos', icon: 'fa-paw' },
            { name: 'Flamingos', icon: 'fa-dove' },
            { name: 'Hyenas', icon: 'fa-paw' },
            { name: 'Buffalos', icon: 'fa-paw' }
        ];
    } else if (lowerName.includes('tarangire')) {
        return [
            { name: 'Elephants', icon: 'fa-elephant' },
            { name: 'Baobabs', icon: 'fa-tree' },
            { name: 'Lions', icon: 'fa-paw' },
            { name: 'Leopards', icon: 'fa-paw' },
            { name: 'Zebras', icon: 'fa-paw' },
            { name: 'Giraffes', icon: 'fa-paw' }
        ];
    } else if (lowerName.includes('kilimanjaro')) {
        return [
            { name: 'Colobus Monkeys', icon: 'fa-paw' },
            { name: 'Elephants', icon: 'fa-elephant' },
            { name: 'Birds', icon: 'fa-dove' },
            { name: 'Buffalos', icon: 'fa-paw' },
            { name: 'Duikers', icon: 'fa-paw' }
        ];
    } else {
        return [
            { name: 'Lions', icon: 'fa-paw' },
            { name: 'Elephants', icon: 'fa-elephant' },
            { name: 'Zebras', icon: 'fa-paw' },
            { name: 'Giraffes', icon: 'fa-paw' },
            { name: 'Birds', icon: 'fa-dove' },
            { name: 'Buffalos', icon: 'fa-paw' }
        ];
    }
}

function getBestTimeForDestination(name, bestSeasonString = null) {
    const lowerName = name.toLowerCase();
    
    // Default months mapping
    let months = ['good', 'good', 'good', 'poor', 'poor', 'excellent', 'excellent', 'excellent', 'excellent', 'good', 'good', 'good'];

    if (bestSeasonString) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const seasonLower = bestSeasonString.toLowerCase();
        
        // If string contains month names, use them
        let hasCustomMonths = false;
        const newMonths = Array(12).fill('good');
        
        monthNames.forEach((m, i) => {
            if (seasonLower.includes(m)) {
                newMonths[i] = 'excellent';
                hasCustomMonths = true;
            }
        });

        if (hasCustomMonths) return newMonths;
    }
    
    // Fallback to defaults
    if (lowerName.includes('serengeti')) {
        return ['good', 'good', 'good', 'poor', 'poor', 'excellent', 'excellent', 'excellent', 'excellent', 'good', 'good', 'good'];
    } else if (lowerName.includes('kilimanjaro')) {
        return ['good', 'good', 'good', 'poor', 'poor', 'excellent', 'excellent', 'excellent', 'excellent', 'good', 'good', 'good'];
    } else if (lowerName.includes('zanzibar')) {
        return ['excellent', 'excellent', 'excellent', 'good', 'good', 'good', 'good', 'good', 'good', 'excellent', 'excellent', 'excellent'];
    }
    return months;
}

function getBestTimeText(months) {
    const excellentMonths = months.reduce((acc, month, index) => {
        if (month === 'excellent') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            acc.push(monthNames[index]);
        }
        return acc;
    }, []);
    
    if (excellentMonths.length > 0) {
        return `${excellentMonths.slice(0, 3).join(', ')}${excellentMonths.length > 3 ? '...' : ''}`;
    }
    return 'Year-round';
}

function getQuickFacts(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('serengeti')) {
        return [
            { icon: 'fa-ruler', label: 'Size', value: '14,750 sq km' },
            { icon: 'fa-calendar', label: 'Established', value: '1951' },
            { icon: 'fa-users', label: 'Annual Visitors', value: '350,000+' },
            { icon: 'fa-star', label: 'Famous For', value: 'Great Migration' }
        ];
    } else if (lowerName.includes('ngorongoro')) {
        return [
            { icon: 'fa-ruler', label: 'Size', value: '260 sq km (crater)' },
            { icon: 'fa-calendar', label: 'Established', value: '1959' },
            { icon: 'fa-users', label: 'Annual Visitors', value: '500,000+' },
            { icon: 'fa-star', label: 'Famous For', value: 'Crater floor wildlife' }
        ];
    } else if (lowerName.includes('kilimanjaro')) {
        return [
            { icon: 'fa-ruler', label: 'Height', value: '5,895 m' },
            { icon: 'fa-calendar', label: 'First Ascent', value: '1889' },
            { icon: 'fa-users', label: 'Annual Climbers', value: '50,000+' },
            { icon: 'fa-star', label: 'Famous For', value: 'Africa\'s highest peak' }
        ];
    } else {
        return [
            { icon: 'fa-ruler', label: 'Size', value: 'Varies' },
            { icon: 'fa-calendar', label: 'Established', value: 'Various' },
            { icon: 'fa-users', label: 'Popularity', value: 'High' },
            { icon: 'fa-star', label: 'Highlights', value: 'Wildlife viewing' }
        ];
    }
}

function getRecommendedStay(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('serengeti')) return '3-4';
    if (lowerName.includes('ngorongoro')) return '1-2';
    if (lowerName.includes('kilimanjaro')) return '6-8';
    if (lowerName.includes('zanzibar')) return '4-5';
    return '2-3';
}

function getClimate(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('kilimanjaro')) return 'Alpine to Arctic';
    if (lowerName.includes('zanzibar')) return 'Tropical, warm year-round';
    return 'Tropical savanna, warm days, cool nights';
}

function updatePageTitle(title) {
    document.title = `${title} Safari Destination | Tanzania Safari Magic`;
}

function updateMetaDescription(description) {
    if (!description) return;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const truncated = description.length > 155 ? description.substring(0, 152) + '...' : description;
        metaDesc.setAttribute('content', truncated);
    }
}

function applyDestinationSeo(destination) {
    if (!window.SafariSEO || !destination) return;
    const name = destination.park_name || destination.name || 'Tanzania Destination';
    const slug = destination.park_slug || destination.slug || '';
    if (isNgorongoroDestination(slug, name)) {
        applyNgorongoroSeo(destination);
        return;
    }
    const count = Number(destination.safari_count || destination.tour_count || 0);
    const desc = destination.park_description || destination.description || destination.short_description ||
        `Explore ${name} with Tanzania Safari Magic — private safari itineraries from Arusha. Inquire for a free quote.`;
    SafariSEO.applyPageSeo({
        title: `${name} | Tanzania Safari Destination from Arusha`.slice(0, 70),
        description: String(desc).replace(/\s+/g, ' ').trim().slice(0, 160),
        image: destination.featured_image_url || destination.image_urls?.[0],
        noindex: count === 0
    });
}

function showError(message) {
    const mainContent = document.getElementById('destinationDetailContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>${escapeHtml(message)}</h2>
                <p style="margin-top: 1rem;">The destination you're looking for might not exist.</p>
                <a href="/destinations" class="btn btn-primary" style="margin-top: 2rem; display: inline-block;">
                    <i class="fas fa-arrow-left"></i> Browse All Destinations
                </a>
            </div>
        `;
    }
}

async function loadPopularSafaris() {
    const list = document.getElementById('popularSafarisList');
    if (!list) return;
    
    try {
        const result = await API.getFeaturedPackages(3);
        if (result && result.success && result.data && result.data.length > 0) {
            list.innerHTML = result.data.map(pkg => `
                <li><a href="/safaris/${pkg.package_slug}">${escapeHtml(pkg.package_name)}</a></li>
            `).join('');
        } else {
            list.innerHTML = '<li><a href="/safaris">View all safaris</a></li>';
        }
    } catch (error) {
        console.error('Error loading popular safaris:', error);
        list.innerHTML = '<li><a href="/safaris">View all safaris</a></li>';
    }
}

function setCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function bookDestination(destinationName) {
    // Redirect to contact page with pre-filled message
    window.location.href = `/contact?destination=${encodeURIComponent(destinationName)}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Make functions available globally
window.bookDestination = bookDestination;

function getTravelTips(name) {
    const lowerName = name.toLowerCase();
    let tips = [];
    if (lowerName.includes('serengeti')) {
        tips = [
            { icon: 'fa-camera', text: 'Incredible migration photography' },
            { icon: 'fa-sun', text: 'Very hot at midday, dress in layers' },
            { icon: 'fa-car', text: 'Expect long game drives' },
            { icon: 'fa-binoculars', text: 'Binoculars are essential for predators' }
        ];
    } else if (lowerName.includes('ngorongoro')) {
        tips = [
            { icon: 'fa-snowflake', text: 'Crater rim is very cold in mornings' },
            { icon: 'fa-camera', text: 'Incredible lighting at dawn' },
            { icon: 'fa-binoculars', text: 'Look out for the Black Rhino' },
            { icon: 'fa-car', text: 'Steep descent into the crater' }
        ];
    } else if (lowerName.includes('kilimanjaro')) {
        tips = [
            { icon: 'fa-hiking', text: 'Sturdy hiking boots required' },
            { icon: 'fa-temperature-low', text: 'Thermal gear is essential' },
            { icon: 'fa-tint', text: 'Drink 3-4 liters of water daily' },
            { icon: 'fa-walking', text: '\'Pole pole\' (slowly slowly) is key' }
        ];
    } else if (lowerName.includes('zanzibar')) {
        tips = [
            { icon: 'fa-swimmer', text: 'Reef shoes recommended for low tide' },
            { icon: 'fa-tshirt', text: 'Dress modestly in Stone Town' },
            { icon: 'fa-sun', text: 'Reef-safe sunscreen is a must' },
            { icon: 'fa-camera', text: 'Amazing sunset photography' }
        ];
    } else {
        tips = [
            { icon: 'fa-camera', text: 'Best for photography' },
            { icon: 'fa-binoculars', text: 'Guided tours available' },
            { icon: 'fa-car', text: '4x4 vehicles recommended' },
            { icon: 'fa-umbrella', text: 'Sun protection essential' }
        ];
    }
    return tips.map(t => '<li><i class="fas ' + t.icon + '"></i> ' + t.text + '</li>').join('');
}
