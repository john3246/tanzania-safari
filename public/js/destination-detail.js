// destination-detail.js - Dynamic destination details page

function t(key, vars){ if(window.TSM_i18n&&typeof window.TSM_i18n.t==='function') return window.TSM_i18n.t(key,vars); return key; }

let currentDestination = null;
let currentSlug = null;
let currentGuide = null;

function monthLabels() {
    return [
        t('destDetail.monthJan'), t('destDetail.monthFeb'), t('destDetail.monthMar'),
        t('destDetail.monthApr'), t('destDetail.monthMay'), t('destDetail.monthJun'),
        t('destDetail.monthJul'), t('destDetail.monthAug'), t('destDetail.monthSep'),
        t('destDetail.monthOct'), t('destDetail.monthNov'), t('destDetail.monthDec')
    ];
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
    } catch (_) {}

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
        showError(t('destDetail.noDestination'));
    }
});

document.addEventListener('tsm:languagechange', () => {
    if (currentSlug) loadDestinationDetails(currentSlug);
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
        document.body.style.overflow = '';
        document.body.style.overflowX = '';
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
    /* Mobile nav is owned by layout-loader.js — do not bind a second handler. */
}

async function loadDestinationDetails(slug) {
    try {
        if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
    } catch (_) {}

    const mainContent = document.getElementById('destinationDetailContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 4rem;">
            <div class="loader-circle" style="margin: 0 auto 1rem;"></div>
            <p>${escapeHtml(t('destDetail.loading'))}</p>
        </div>
    `;
    
    try {
        // Get destination details by slug
        const result = await API.getDestinationBySlug(slug);
        
        if (result && result.success && result.data) {
            currentDestination = result.data;
            
            const displayName = currentDestination.park_name || currentDestination.name;
            const destSlug = currentDestination.park_slug || currentDestination.slug || currentSlug;

            let guide = null;
            if (isNgorongoroDestination(destSlug, displayName) && window.NgorongoroDestinationGuide) {
                guide = window.NgorongoroDestinationGuide;
            } else if (isSerengetiDestination(destSlug, displayName) && window.SerengetiDestinationGuide) {
                guide = window.SerengetiDestinationGuide;
            } else if (isKilimanjaroDestination(destSlug, displayName) && window.KilimanjaroDestinationGuide) {
                guide = window.KilimanjaroDestinationGuide;
            }

            if (guide && window.TSM_guideI18n && typeof window.TSM_guideI18n.localizeDestinationGuide === 'function') {
                currentGuide = await window.TSM_guideI18n.localizeDestinationGuide(guide, destSlug);
            } else {
                currentGuide = guide;
            }

            renderDestinationDetails(currentDestination);
            if (isNgorongoroDestination(destSlug, displayName)) {
                applyNgorongoroSeo(currentDestination);
                injectNgorongoroSchemas(currentDestination);
            } else if (isSerengetiDestination(destSlug, displayName)) {
                applySerengetiSeo(currentDestination);
                injectSerengetiSchemas(currentDestination);
            } else if (isKilimanjaroDestination(destSlug, displayName)) {
                applyKilimanjaroSeo(currentDestination);
                injectKilimanjaroSchemas(currentDestination);
            } else {
                updatePageTitle(displayName);
                updateMetaDescription(currentDestination.park_description || currentDestination.description);
                applyDestinationSeo(currentDestination);
                injectDestinationSchema(currentDestination);
            }
            await loadSafariPackagesForDestination(displayName, destSlug);
            await loadRelatedDestinations(currentDestination.park_id || currentDestination.id, destSlug);
            if (isNgorongoroDestination(destSlug, displayName)) {
                await enhanceNgorongoroPackageSection();
            } else if (isSerengetiDestination(destSlug, displayName)) {
                await enhanceSerengetiPackageSection();
            } else if (isKilimanjaroDestination(destSlug, displayName)) {
                await enhanceKilimanjaroPackageSection();
            }
        } else {
            showError(t('destDetail.notFound'));
        }
    } catch (error) {
        console.error('Error loading destination details:', error);
        showError(t('destDetail.loadFail'));
    }
}

function renderDestinationDetails(destination) {
    const mainContent = document.getElementById('destinationDetailContent');
    if (!mainContent) return;
    
    const name = destination.park_name || destination.name;
    const description = destination.park_description || destination.description || t('destDetail.defaultDesc', { name });
    const slug = destination.park_slug || destination.slug || '';
    
    const isNgorongoro = isNgorongoroDestination(slug, name);
    const isSerengeti = isSerengetiDestination(slug, name);
    const isKilimanjaro = isKilimanjaroDestination(slug, name);
    const isGuideDest = isNgorongoro || isSerengeti || isKilimanjaro;
    const guide = currentGuide;
    
    // Determine destination type and features
    const isUnesco = destination.is_unesco_heritage || name.toLowerCase().includes('ngorongoro') || 
                     name.toLowerCase().includes('serengeti') ||
                     name.toLowerCase().includes('kilimanjaro');
    
    const heroTitle = guide ? guide.META.h1 : name;
    const eyebrow = isKilimanjaro
        ? t('destDetail.eyebrowKili')
        : (isGuideDest ? t('destDetail.eyebrowUnesco') : t('destDetail.eyebrowDefault'));
    
    // Get icon based on name
    let iconClass = 'fa-tree';
    if (name.toLowerCase().includes('serengeti')) iconClass = 'fa-paw';
    else if (name.toLowerCase().includes('kilimanjaro')) iconClass = 'fa-mountain';
    else if (name.toLowerCase().includes('ngorongoro')) iconClass = 'fa-volcano';
    else if (name.toLowerCase().includes('zanzibar')) iconClass = 'fa-umbrella-beach';
    else if (name.toLowerCase().includes('tarangire')) iconClass = 'fa-elephant';
    
    // Generate best time to visit
    let bestMonths = getBestTimeForDestination(name, destination.best_season);
    
    // Generate quick facts
    let facts = isNgorongoro ? [
        { icon: 'fa-ruler', label: t('destDetail.factCraterFloor'), value: '~260 sq km' },
        { icon: 'fa-mountain', label: t('destDetail.factDepth'), value: '~600 m' },
        { icon: 'fa-paw', label: t('destDetail.factLargeMammals'), value: '25,000+' },
        { icon: 'fa-award', label: t('destDetail.factStatus'), value: t('destDetail.unescoSite') }
    ] : isSerengeti ? [
        { icon: 'fa-ruler', label: t('destDetail.factParkSize'), value: '~14,763 sq km' },
        { icon: 'fa-paw', label: t('destDetail.factWildebeest'), value: '1.5M+' },
        { icon: 'fa-calendar', label: t('destDetail.factUnesco'), value: '1981' },
        { icon: 'fa-star', label: t('destDetail.factFamousFor'), value: t('destDetail.famousMigration') }
    ] : isKilimanjaro ? [
        { icon: 'fa-mountain', label: t('destDetail.factUhuruPeak'), value: '5,895 m' },
        { icon: 'fa-ruler', label: t('destDetail.factParkArea'), value: '~1,688 sq km' },
        { icon: 'fa-calendar', label: t('destDetail.factUnesco'), value: '1987' },
        { icon: 'fa-star', label: t('destDetail.factFamousFor'), value: t('destDetail.famousRoof') }
    ] : [
        { icon: 'fa-ruler', label: t('destDetail.factSize'), value: destination.size_sq_km ? `${Number(destination.size_sq_km).toLocaleString()} sq km` : t('destDetail.factVaries') },
        { icon: 'fa-calendar', label: t('destDetail.factEstablished'), value: destination.established_year != null && destination.established_year !== '' ? String(destination.established_year) : t('destDetail.factVarious') },
        { icon: 'fa-users', label: t('destDetail.factAnnualVisitors'), value: '350,000+' },
        { icon: 'fa-star', label: t('destDetail.factStatus'), value: isUnesco ? t('destDetail.unescoSite') : t('destDetail.nationalPark') }
    ];
    
    const heroImg = imgSrc(
        destination.featured_image_url || destination.image_url || (destination.image_urls && destination.image_urls[0]) || (destination.gallery_urls && destination.gallery_urls[0]),
        isNgorongoro ? '/images/optimized/mbugani.webp'
            : (isSerengeti ? '/images/optimized/serengeti-national-park.webp'
                : (isKilimanjaro ? '/images/optimized/mount-kilimanjaro-national-park.webp'
                    : (slug ? `/images/optimized/${slug}.webp` : '/images/optimized/serengeti-national-park.webp')))
    );

    const months = monthLabels();
    const pkgCount = destination.safari_count || destination.tour_count || 0;
    const pkgBadge = pkgCount > 0
        ? t('destDetail.packagesCount', { n: pkgCount })
        : t('destDetail.customSafaris');

    const galleryImages = [];
    if (Array.isArray(destination.gallery_urls)) galleryImages.push(...destination.gallery_urls);
    if (Array.isArray(destination.image_urls)) {
        destination.image_urls.forEach(u => { if (u && !galleryImages.includes(u)) galleryImages.push(u); });
    }
    if (destination.featured_image_url && !galleryImages.includes(destination.featured_image_url)) galleryImages.unshift(destination.featured_image_url);
    if (destination.image_url && !galleryImages.includes(destination.image_url)) galleryImages.unshift(destination.image_url);
    if (isSerengeti) {
        ['/images/optimized/serengeti-national-park.webp', '/images/optimized/serengeti5.webp', '/images/optimized/zebra%20serengeti.webp', '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp'].forEach(u => { if (!galleryImages.includes(u)) galleryImages.push(u); });
    }
    if (isKilimanjaro) {
        ['/images/optimized/mount-kilimanjaro-national-park.webp', '/images/optimized/6-day-machame-route-kilimanjaro.webp'].forEach(u => { if (!galleryImages.includes(u)) galleryImages.push(u); });
    }
    if (!galleryImages.length) galleryImages.push(heroImg);
    const momentImgs = galleryImages.slice(0, 6);
    const mosaicImgs = [galleryImages[0] || heroImg, galleryImages[1] || '/images/optimized/balloon.webp', galleryImages[2] || '/images/optimized/mbugani.webp'];
    const descLead = String(description || '').replace(/\s+/g, ' ').trim().slice(0, 280);
    const planHref = `/booking?interest=${encodeURIComponent(name)}`;
    const waHref = `https://wa.me/255695108009?text=${encodeURIComponent("Hi Tanzania Safari Magic team, I'm interested in booking a custom safari package to " + name + "...")}`;
    
    const html = `
        <section class="y27-hero">
            <div class="y27-hero-bg" style="background-image:url('${heroImg}')"></div>
            <div class="container y27-hero-inner">
                <nav class="corp-breadcrumb" aria-label="Breadcrumb">
                    <a href="/">${escapeHtml(t('destDetail.home'))}</a><span>/</span><a href="/destinations">${escapeHtml(t('destDetail.destinations'))}</a><span>/</span><span>${escapeHtml(name)}</span>
                </nav>
                <p class="y27-eyebrow">${escapeHtml(eyebrow)}</p>
                <h1>${escapeHtml(heroTitle)}</h1>
                <p class="y27-hero-lead">${escapeHtml(descLead)}${description && description.length > 280 ? '…' : ''}</p>
                <div class="y27-chips">
                    <span class="y27-chip"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(t('destDetail.eastAfrica'))}</span>
                    ${isUnesco ? `<span class="y27-chip"><i class="fas fa-award"></i> ${escapeHtml(t('destDetail.unescoSite'))}</span>` : ''}
                    <span class="y27-chip"><i class="fas fa-binoculars"></i> ${escapeHtml(pkgBadge)}</span>
                    <span class="y27-chip"><i class="fas fa-clock"></i> ${escapeHtml(getRecommendedStay(name))} ${escapeHtml(t('destDetail.days'))}</span>
                </div>
                <div class="y27-hero-actions">
                    <a class="btn btn-primary" href="${planHref}" style="min-height:48px"><i class="fas fa-calendar-alt"></i> ${escapeHtml(t('destDetail.planVisit'))}</a>
                    <a class="btn btn-secondary" href="${waHref}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> ${escapeHtml(t('destDetail.whatsappTeam'))}</a>
                </div>
            </div>
        </section>

        <section class="y27-status">
            <div class="container y27-status-inner">
                <div>
                    <h2>${escapeHtml(name)}</h2>
                    <p>${escapeHtml(getBestTimeText(bestMonths))} · ${escapeHtml(getClimate(name))}</p>
                </div>
                <a class="btn btn-secondary" href="#overview" style="min-height:48px">${escapeHtml(t('destDetail.planVisit'))} ↓</a>
            </div>
        </section>

        <section class="y27-section" id="moments">
            <div class="container">
                <span class="y27-kicker">${escapeHtml(t('destDetail.photoGallery'))}</span>
                <h2 class="y27-h">${escapeHtml(t('destDetail.photoGallery'))}</h2>
                <div class="y27-moments">
                    ${momentImgs.map((url, i) => `
                        <article class="y27-moment">
                            <img src="${imgSrc(url)}" alt="${escapeHtml(t('destDetail.galleryN', { name, n: i + 1 }))}" width="800" height="500" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" onclick="openLightbox('${imgSrc(url)}')">
                            <div class="y27-moment-body">
                                <div class="y27-num">${String(i + 1).padStart(2, '0')}</div>
                                <h3>${escapeHtml(name)}</h3>
                                <span class="y27-pin"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(t('destDetail.tanzania'))}</span>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="y27-section alt" id="overview">
            <div class="container y27-story-grid">
                <div>
                    <span class="y27-kicker">${escapeHtml(t('destDetail.about', { name }))}</span>
                    ${!(isGuideDest && guide) ? `<h2 class="y27-h">${escapeHtml(t('destDetail.about', { name }))}</h2><p class="y27-intro">${escapeHtml(description)}</p>` : `<h2 class="y27-h">${escapeHtml(heroTitle)}</h2>`}
                    ${!(isGuideDest && guide) ? `
                    <h3 style="margin:0 0 0.75rem">${escapeHtml(t('destDetail.bestTime'))}</h3>
                    <div class="months-grid">
                        ${months.map((month, index) => `<div class="month ${bestMonths[index]}">${escapeHtml(month)}</div>`).join('')}
                    </div>
                    <div class="legend">
                        <div class="legend-item"><div class="legend-color excellent"></div><span>${escapeHtml(t('destDetail.excellent'))}</span></div>
                        <div class="legend-item"><div class="legend-color good"></div><span>${escapeHtml(t('destDetail.good'))}</span></div>
                        <div class="legend-item"><div class="legend-color poor"></div><span>${escapeHtml(t('destDetail.poor'))}</span></div>
                    </div>` : ''}
                </div>
                <aside class="y27-facts">
                    <h3>${escapeHtml(t('destDetail.atAGlance'))}</h3>
                    <div class="y27-fact"><span>${escapeHtml(t('destDetail.location'))}</span><strong>${escapeHtml(t('destDetail.tanzania'))}</strong></div>
                    <div class="y27-fact"><span>${escapeHtml(t('destDetail.bestTime'))}</span><strong>${escapeHtml(getBestTimeText(bestMonths))}</strong></div>
                    <div class="y27-fact"><span>${escapeHtml(t('destDetail.stay'))}</span><strong>${escapeHtml(getRecommendedStay(name))} ${escapeHtml(t('destDetail.days'))}</strong></div>
                    <div class="y27-fact"><span>${escapeHtml(t('destDetail.climate'))}</span><strong>${escapeHtml(getClimate(name))}</strong></div>
                    ${facts.map(fact => `<div class="y27-fact"><span>${escapeHtml(fact.label)}</span><strong>${escapeHtml(fact.value)}</strong></div>`).join('')}
                    <a class="btn btn-secondary" href="${planHref}" style="min-height:48px">${escapeHtml(t('destDetail.planVisit'))}</a>
                </aside>
            </div>
        </section>

        <section class="y27-section">
            <div class="container y27-why-grid">
                <div>
                    <span class="y27-kicker">${escapeHtml(t('destDetail.travelTips'))}</span>
                    <h2 class="y27-h">${escapeHtml(t('destDetail.travelTips'))}</h2>
                    <ul class="y27-why-list" id="travelTipsList">${getTravelTips(name)}</ul>
                    ${isGuideDest ? `
                    <div id="guideSideTocMount"></div>
                    <ul style="margin:1.25rem 0 0;padding-left:1.1rem;line-height:1.85;font-size:0.95rem">
                      <li><a href="/safaris">${escapeHtml(t('destDetail.allSafariPackages'))}</a></li>
                      <li><a href="/kilimanjaro">${escapeHtml(t('destDetail.kiliClimbPackages'))}</a></li>
                      <li><a href="/booking?interest=${encodeURIComponent(name)}">${escapeHtml(t('destDetail.inquireQuote'))}</a></li>
                    </ul>` : ''}
                </div>
                <div class="y27-mosaic" aria-hidden="true">
                    <img src="${imgSrc(mosaicImgs[0])}" alt="" width="700" height="500" loading="lazy">
                    <img src="${imgSrc(mosaicImgs[1])}" alt="" width="400" height="250" loading="lazy">
                    <img src="${imgSrc(mosaicImgs[2])}" alt="" width="400" height="250" loading="lazy">
                </div>
            </div>
        </section>

        ${isGuideDest && guide ? `
        <section class="y27-section alt">
            <div class="container">
                <div class="dest-guide-panel blog-prose content-section" id="destinationGuidePanel">
                    ${guide.contentHtml()}
                </div>
            </div>
        </section>` : ''}

        <section class="y27-section" id="safariPackagesSection">
            <div class="container">
                <span class="y27-kicker">${escapeHtml(t('destDetail.packagesFeaturing', { name }))}</span>
                <h2 class="y27-h" id="packages-heading">${escapeHtml(t('destDetail.packagesFeaturing', { name }))}</h2>
                <div class="packages-grid y27-related-grid" id="packagesGrid">
                    <div class="loading-card">${escapeHtml(t('destDetail.loadingPackages'))}</div>
                </div>
            </div>
        </section>

        <section class="y27-section alt">
            <div class="container">
                <div class="y27-cta">
                    <div>
                        <h2>${escapeHtml(t('destDetail.planVisit'))} ${escapeHtml(name)}</h2>
                        <p>${escapeHtml(t('destDetail.customSafarisDesc') || 'Tell us your dates and party size. Our team in Arusha replies, usually in under 60 seconds on WhatsApp.')}</p>
                    </div>
                    <div class="y27-cta-actions">
                        <a class="btn btn-primary" href="${planHref}" style="min-height:48px">${escapeHtml(t('destDetail.inquire'))}</a>
                        <a class="btn btn-outline" href="${waHref}" target="_blank" rel="noopener" style="min-height:48px;border-color:rgba(255,255,255,0.85);color:#fff">WhatsApp</a>
                    </div>
                </div>
            </div>
        </section>

        <div id="relatedDestinationsMount"></div>

        <div id="lightbox" class="lightbox" onclick="closeLightbox()">
            <button class="lightbox-close" type="button">&times;</button>
            <img id="lightboxImg" src="" alt="${escapeHtml(t('destDetail.enlargedView'))}">
        </div>

        <div class="y27-sticky" id="mobileStickyBooking">
            <a href="${planHref}">${escapeHtml(t('destDetail.inquire'))} · ${escapeHtml(name)}</a>
        </div>
    `;
    
    mainContent.innerHTML = html;
    document.body.classList.add('has-mobile-book-bar');
    if (typeof window.TSM_promoteMobileChrome === 'function') window.TSM_promoteMobileChrome();
    if (isGuideDest) {
        const tocId = isNgorongoro ? 'ngoro-toc' : (isSerengeti ? 'serengeti-toc' : 'kilimanjaro-toc');
        mountGuideSideToc(tocId);
    }
}

function mountGuideSideToc(tocId) {
    const toc = document.getElementById(tocId);
    const mount = document.getElementById('guideSideTocMount') || document.getElementById('ngoroSideTocMount');
    if (!toc || !mount) return;
    const list = toc.querySelector('ol');
    if (!list) return;
    toc.classList.add('moved-to-sidebar');
    mount.innerHTML = `
      <div class="guide-toc-side">
        <h3><i class="fas fa-list" style="color:var(--accent);margin-right:0.35rem"></i> ${escapeHtml(t('destDetail.guideContents'))}</h3>
        ${list.outerHTML}
      </div>`;
}

function mountNgorongoroSideToc() {
    mountGuideSideToc('ngoro-toc');
}

function isNgorongoroDestination(slug, name) {
    if (window.NgorongoroDestinationGuide?.matchesSlug?.(slug)) return true;
    const s = `${slug || ''} ${name || ''}`.toLowerCase();
    return s.includes('ngorongoro');
}

function isSerengetiDestination(slug, name) {
    if (window.SerengetiDestinationGuide?.matchesSlug?.(slug)) return true;
    const s = `${slug || ''} ${name || ''}`.toLowerCase();
    return s.includes('serengeti');
}

function isKilimanjaroDestination(slug, name) {
    if (window.KilimanjaroDestinationGuide?.matchesSlug?.(slug)) return true;
    const s = `${slug || ''} ${name || ''}`.toLowerCase();
    return s.includes('kilimanjaro');
}

function applyKilimanjaroSeo(destination) {
    const guide = currentGuide || window.KilimanjaroDestinationGuide;
    const meta = guide?.META || {};
    const name = destination.park_name || destination.name || 'Kilimanjaro National Park';
    const title = (meta.title || `${name} Climb Guide | Tanzania Safari Magic`).slice(0, 70);
    const description = (meta.meta_description || destination.park_description || '').slice(0, 160);
    const image = destination.featured_image_url || destination.image_urls?.[0] || meta.image;

    if (window.SafariSEO) {
        SafariSEO.applyPageSeo({ title, description, image, noindex: false });
        SafariSEO.setRobots?.('index, follow');
    } else {
        document.title = title;
        updateMetaDescription(description);
    }

    ensureDestMeta('name', 'keywords', meta.keywords || 'kilimanjaro national park, climb kilimanjaro, tanzania safari magic');
    ensureDestMeta('name', 'author', 'John Raphael Shayo');
    ensureDestMeta('property', 'og:type', 'article');
    const canonical = document.querySelector('link[rel="canonical"]') || (() => {
        const l = document.createElement('link');
        l.rel = 'canonical';
        document.head.appendChild(l);
        return l;
    })();
    canonical.href = `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'mount-kilimanjaro-national-park'}`;
}

function injectKilimanjaroSchemas(destination) {
    const guide = currentGuide || window.KilimanjaroDestinationGuide;
    const name = destination.park_name || destination.name || 'Kilimanjaro National Park';
    const description = (guide?.META?.meta_description || destination.park_description || '').slice(0, 300);
    const image = destination.featured_image_url || destination.image_urls?.[0] || guide?.META?.image || '/images/optimized/mount-kilimanjaro-national-park.webp';
    const url = `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'mount-kilimanjaro-national-park'}`;

    const tourist = {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name,
        alternateName: ['Mount Kilimanjaro', 'Kilimanjaro National Park', 'Uhuru Peak'],
        description,
        image: image.startsWith('http') ? image : `https://tanzaniasafarimagic.com${image}`,
        url,
        touristType: ['Trekking', 'Mountain Climbing', 'Nature', 'Safari Combo'],
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -3.067,
            longitude: 37.367
        },
        containedInPlace: { '@type': 'Country', name: 'Tanzania' },
        provider: {
            '@type': 'TravelAgency',
            name: 'Tanzania Safari Magic',
            telephone: '+255695108009',
            url: 'https://tanzaniasafarimagic.com'
        }
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (guide?.FAQS || []).map((f) => ({
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
            { '@type': 'ListItem', position: 3, name, item: url }
        ]
    };

    if (window.SafariSEO?.injectJsonLd) {
        SafariSEO.injectJsonLd('kilimanjaro-destination-jsonld', tourist);
        SafariSEO.injectJsonLd('kilimanjaro-faq-jsonld', faqSchema);
        SafariSEO.injectJsonLd('kilimanjaro-breadcrumb-jsonld', breadcrumb);
    } else {
        [tourist, faqSchema, breadcrumb].forEach((obj, i) => {
            const el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = `kilimanjaro-schema-${i}`;
            el.textContent = JSON.stringify(obj);
            document.head.appendChild(el);
        });
    }
}

async function enhanceKilimanjaroPackageSection() {
    const anchor = document.getElementById('packages-kilimanjaro');
    if (!anchor) return;
    try {
        const result = await API.getPackages({ limit: 24 });
        const pkgs = (result.data || []).filter((pkg) => {
            const blob = JSON.stringify(pkg).toLowerCase();
            return blob.includes('kilimanjaro') || blob.includes('machame') || blob.includes('lemosho') || blob.includes('marangu')
                || (pkg.destinations || []).some((d) =>
                    String(d.park_name || d.name || d.park_slug || d.slug || '').toLowerCase().includes('kilimanjaro')
                );
        });
        let list = pkgs.slice(0, 6);
        if (!list.length) {
            try {
                const hub = await API.get('/packages?category=kilimanjaro&limit=6');
                list = (hub.data || hub || []).slice(0, 6);
            } catch (_) { /* ignore */ }
        }
        if (!list.length) {
            anchor.innerHTML = `
              <h2>${escapeHtml(t('destDetail.ourKiliPackages'))}</h2>
              <p>${escapeHtml(t('destDetail.kiliPkgEmpty'))}</p>
              <p><a href="/kilimanjaro">${escapeHtml(t('destDetail.viewKiliPackages'))}</a> · <a href="/booking">${escapeHtml(t('destDetail.freeClimbQuote'))}</a> · <a href="/safaris">${escapeHtml(t('destDetail.allSafaris'))}</a></p>`;
            return;
        }

        anchor.innerHTML = `
          <h2>${escapeHtml(t('destDetail.ourKiliPackages'))}</h2>
          <p>${escapeHtml(t('destDetail.kiliPkgIntro'))}</p>
          <div class="guide-pkg-grid">
            ${list.map((p) => {
                const pkgSlug = p.package_slug || p.slug;
                const pname = p.package_name || p.name || t('destDetail.kilimanjaroTrek');
                const img = imgSrc(p.featured_image_url || p.image_url || p.image_urls?.[0], '/images/optimized/mount-kilimanjaro-national-park.webp');
                const days = p.duration_days ? t('destDetail.daysN', { n: p.duration_days }) : '';
                const price = p.base_price_usd ? t('destDetail.fromPrice', { amount: Number(p.base_price_usd).toLocaleString() }) : t('destDetail.requestQuote');
                return `<a class="guide-pkg-card" href="/safaris/${pkgSlug}">
                  <img src="${img}" alt="${escapeHtml(pname)}" width="480" height="300" loading="lazy" onerror="this.src='/images/optimized/6-day-machame-route-kilimanjaro.webp'">
                  <div class="body"><div class="meta">${escapeHtml(days)}</div><h3>${escapeHtml(pname)}</h3><div class="price">${escapeHtml(price)}</div></div>
                </a>`;
            }).join('')}
          </div>
          <p><a href="/kilimanjaro">${escapeHtml(t('destDetail.allKiliPackages'))}</a> · <a href="/booking">${escapeHtml(t('destDetail.freeClimbQuote'))}</a> · <a href="/destinations/serengeti-national-park">${escapeHtml(t('destDetail.addSerengetiArrow'))}</a> · <a href="/blog/tanzania-safari-cost">${escapeHtml(t('destDetail.costGuideArrow'))}</a></p>
        `;
    } catch (e) {
        console.warn('Kilimanjaro package enhance skipped', e);
    }
}

function applyNgorongoroSeo(destination) {
    const guide = currentGuide || window.NgorongoroDestinationGuide;
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
    const guide = currentGuide || window.NgorongoroDestinationGuide;
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
          <h2>${escapeHtml(t('destDetail.ourNgorongoroPackages'))}</h2>
          <p>${escapeHtml(t('destDetail.ngoroPkgIntro'))}</p>
          <div class="guide-pkg-grid">${grid.innerHTML.replace(/package-card/g, 'guide-pkg-card').replace(/onclick="window.location.href='/g, 'href="').replace(/'"/g, '"')}</div>
          <p><a href="/safaris">${escapeHtml(t('destDetail.browseAllPackages'))}</a> · <a href="/booking">${escapeHtml(t('destDetail.getFreeQuote'))}</a></p>
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
          <h2>${escapeHtml(t('destDetail.ourNgorongoroPackages'))}</h2>
          <p>${escapeHtml(t('destDetail.ngoroPkgIntro'))}</p>
          <div class="guide-pkg-grid">
            ${list.map(p => {
                const pkgSlug = p.package_slug || p.slug;
                const pname = p.package_name || p.name || t('destDetail.safariPackage');
                const img = imgSrc(p.featured_image_url || p.image_url || p.image_urls?.[0], '/images/optimized/mbugani.webp');
                const days = p.duration_days ? t('destDetail.daysN', { n: p.duration_days }) : '';
                const price = p.base_price_usd ? t('destDetail.fromPrice', { amount: Number(p.base_price_usd).toLocaleString() }) : t('destDetail.requestQuote');
                return `<a class="guide-pkg-card" href="/safaris/${pkgSlug}">
                  <img src="${img}" alt="${escapeHtml(pname)}" width="480" height="300" loading="lazy" onerror="this.src='/images/optimized/balloon.webp'">
                  <div class="body"><div class="meta">${escapeHtml(days)}</div><h3>${escapeHtml(pname)}</h3><div class="price">${escapeHtml(price)}</div></div>
                </a>`;
            }).join('')}
          </div>
          <p><a href="/safaris">${escapeHtml(t('destDetail.viewAllPackages'))}</a> · <a href="/booking">${escapeHtml(t('destDetail.freeNgorongoroQuote'))}</a> · <a href="/blog/tanzania-safari">${escapeHtml(t('destDetail.ultimateGuideArrow'))}</a> · <a href="/blog/tanzania-safari-cost">${escapeHtml(t('destDetail.costGuideArrow'))}</a></p>
        `;
    } catch (e) {
        console.warn('Ngorongoro package enhance skipped', e);
    }
}

function applySerengetiSeo(destination) {
    const guide = currentGuide || window.SerengetiDestinationGuide;
    const meta = guide?.META || {};
    const name = destination.park_name || destination.name || 'Serengeti National Park';
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

    ensureDestMeta('name', 'keywords', meta.keywords || 'serengeti national park safari, great migration, tanzania safari magic');
    ensureDestMeta('name', 'author', 'John Raphael Shayo');
    ensureDestMeta('property', 'og:type', 'article');
    const canonical = document.querySelector('link[rel="canonical"]') || (() => {
        const l = document.createElement('link');
        l.rel = 'canonical';
        document.head.appendChild(l);
        return l;
    })();
    canonical.href = `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'serengeti-national-park'}`;
}

function injectSerengetiSchemas(destination) {
    const guide = currentGuide || window.SerengetiDestinationGuide;
    const name = destination.park_name || destination.name || 'Serengeti National Park';
    const description = (guide?.META?.meta_description || destination.park_description || '').slice(0, 300);
    const image = destination.featured_image_url || destination.image_urls?.[0] || guide?.META?.image || '/images/optimized/serengeti-national-park.webp';
    const url = `https://tanzaniasafarimagic.com/destinations/${destination.park_slug || destination.slug || 'serengeti-national-park'}`;

    const tourist = {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name,
        description,
        image: image.startsWith('http') ? image : `https://tanzaniasafarimagic.com${image}`,
        url,
        touristType: ['Safari', 'Wildlife', 'Great Migration'],
        containedInPlace: { '@type': 'Country', name: 'Tanzania' },
        provider: {
            '@type': 'TravelAgency',
            name: 'Tanzania Safari Magic',
            telephone: '+255695108009',
            url: 'https://tanzaniasafarimagic.com'
        }
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (guide?.FAQS || []).map((f) => ({
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
            { '@type': 'ListItem', position: 3, name, item: url }
        ]
    };

    if (window.SafariSEO?.injectJsonLd) {
        SafariSEO.injectJsonLd('serengeti-destination-jsonld', tourist);
        SafariSEO.injectJsonLd('serengeti-faq-jsonld', faqSchema);
        SafariSEO.injectJsonLd('serengeti-breadcrumb-jsonld', breadcrumb);
    } else {
        [tourist, faqSchema, breadcrumb].forEach((obj, i) => {
            const el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = `serengeti-schema-${i}`;
            el.textContent = JSON.stringify(obj);
            document.head.appendChild(el);
        });
    }
}

async function enhanceSerengetiPackageSection() {
    const anchor = document.getElementById('packages-serengeti');
    if (!anchor) return;
    try {
        const result = await API.getPackages({ limit: 12 });
        const pkgs = (result.data || []).filter((pkg) => {
            const blob = JSON.stringify(pkg).toLowerCase();
            return blob.includes('serengeti') || blob.includes('migration') || (pkg.destinations || []).some((d) =>
                String(d.park_name || d.name || d.park_slug || d.slug || '').toLowerCase().includes('serengeti')
            );
        });
        const list = (pkgs.length ? pkgs : (result.data || [])).slice(0, 6);
        if (!list.length) return;

        anchor.innerHTML = `
          <h2>${escapeHtml(t('destDetail.ourSerengetiPackages'))}</h2>
          <p>${escapeHtml(t('destDetail.serengetiPkgIntro'))}</p>
          <div class="guide-pkg-grid">
            ${list.map((p) => {
                const pkgSlug = p.package_slug || p.slug;
                const pname = p.package_name || p.name || t('destDetail.safariPackage');
                const img = imgSrc(p.featured_image_url || p.image_url || p.image_urls?.[0], '/images/optimized/serengeti-national-park.webp');
                const days = p.duration_days ? t('destDetail.daysN', { n: p.duration_days }) : '';
                const price = p.base_price_usd ? t('destDetail.fromPrice', { amount: Number(p.base_price_usd).toLocaleString() }) : t('destDetail.requestQuote');
                return `<a class="guide-pkg-card" href="/safaris/${pkgSlug}">
                  <img src="${img}" alt="${escapeHtml(pname)}" width="480" height="300" loading="lazy" onerror="this.src='/images/optimized/balloon.webp'">
                  <div class="body"><div class="meta">${escapeHtml(days)}</div><h3>${escapeHtml(pname)}</h3><div class="price">${escapeHtml(price)}</div></div>
                </a>`;
            }).join('')}
          </div>
          <p><a href="/safaris">${escapeHtml(t('destDetail.viewAllPackages'))}</a> · <a href="/booking">${escapeHtml(t('destDetail.freeSerengetiQuote'))}</a> · <a href="/blog/great-wildebeest-migration">${escapeHtml(t('destDetail.migrationGuideArrow'))}</a> · <a href="/blog/tanzania-safari-cost">${escapeHtml(t('destDetail.costGuideArrow'))}</a></p>
        `;
    } catch (e) {
        console.warn('Serengeti package enhance skipped', e);
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

    packagesGrid.innerHTML = `<div class="loading-card">${escapeHtml(t('destDetail.loadingSafariPackages'))}</div>`;

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
                        <a class="y27-related-card" href="/safaris/${pkg.package_slug}">
                            <img src="${pkgImg}" alt="${escapeHtml(pkg.package_name)}" loading="lazy" decoding="async" onerror="this.src='/images/optimized/balloon.webp'">
                            <div class="y27-related-body">
                                <h3>${escapeHtml(pkg.package_name)}</h3>
                                <p style="margin:0 0 0.5rem;color:var(--text-secondary);font-size:0.9rem">${escapeHtml(t('destDetail.daysAdventure', { n: pkg.duration_days }))}</p>
                                <div style="display:flex;justify-content:space-between;gap:0.75rem;font-size:0.9rem;font-weight:700">
                                    <span>$${parseInt(pkg.base_price_usd || 0).toLocaleString()}</span>
                                    <span style="color:var(--text-muted);font-weight:600"><i class="fas fa-star" style="color:var(--accent)"></i> ${escapeHtml(avgRating)}</span>
                                </div>
                            </div>
                        </a>
                    `;
                }).join('');
            } else {
                packagesGrid.innerHTML = `
                  <div class="corp-empty-cta">
                    <h3 style="margin:0 0 0.5rem">${escapeHtml(t('destDetail.noPackagesTitle'))}</h3>
                    <p style="margin:0;color:var(--text-secondary)">${escapeHtml(t('destDetail.noPackagesDesc'))}</p>
                    <div class="actions">
                      <a href="/contact" class="btn btn-outline" style="min-height:48px">${escapeHtml(t('destDetail.contactUs'))}</a>
                      <a href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27m%20interested%20in%20a%20safari%20to%20this%20destination." class="btn btn-primary" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> ${escapeHtml(t('destDetail.whatsappTeam'))}</a>
                    </div>
                  </div>`;
                // Keep destination pages indexable even without related packages
            }
        } else {
            packagesGrid.innerHTML = `
              <div class="corp-empty-cta">
                <h3 style="margin:0 0 0.5rem">${escapeHtml(t('destDetail.customSafarisTitle'))}</h3>
                <p style="margin:0;color:var(--text-secondary)">${escapeHtml(t('destDetail.customSafarisDesc'))}</p>
                <div class="actions">
                  <a href="/contact" class="btn btn-outline" style="min-height:48px">${escapeHtml(t('destDetail.contactUs'))}</a>
                  <a href="/booking?interest=${encodeURIComponent(destinationName || '')}" class="btn btn-primary" style="min-height:48px">${escapeHtml(t('destDetail.requestQuoteBtn'))}</a>
                </div>
              </div>`;
            // Do not noindex destination pages — parks remain valuable landing pages
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        packagesGrid.innerHTML = `<p>${escapeHtml(t('destDetail.unableLoadPackages'))}</p>`;
    }
}

async function loadRelatedDestinations(currentId, currentSlug) {
    document.querySelectorAll('.related-destinations').forEach(el => el.remove());
    const mount = document.getElementById('relatedDestinationsMount');
    
    try {
        const result = await API.getDestinations();
        if (result && result.success && result.data) {
            const related = result.data.filter(dest => (dest.park_slug || dest.slug) !== currentSlug).slice(0, 6);
            
            if (related.length > 0) {
                const html = `
                    <section class="y27-section related-destinations">
                        <div class="container">
                            <span class="y27-kicker">${escapeHtml(t('destDetail.youMightLike'))}</span>
                            <h2 class="y27-h">${escapeHtml(t('destDetail.otherDestinations'))}</h2>
                            <div class="y27-related-grid">
                                ${related.map(dest => {
                                    const rName = dest.park_name || dest.name || t('destDetail.destinations');
                                    const rSlug = dest.park_slug || dest.slug || '';
                                    const rImg = imgSrc(dest.featured_image_url || dest.image_url || dest.gallery_urls?.[0], '/images/optimized/serengeti-national-park.webp');
                                    return `
                                        <a class="y27-related-card" href="/destinations/${rSlug}">
                                            <img src="${rImg}" alt="${escapeHtml(rName)}" loading="lazy" onerror="this.src='/images/optimized/balloon.webp'">
                                            <div class="y27-related-body">
                                                <h3>${escapeHtml(rName)}</h3>
                                                <p style="margin:0;color:var(--text-secondary);font-size:0.9rem;line-height:1.5">${escapeHtml((dest.park_description || dest.description || dest.short_description || t('destDetail.discoverAmazing')).slice(0, 140))}</p>
                                            </div>
                                        </a>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </section>
                `;
                if (mount) {
                    mount.innerHTML = html;
                } else {
                    const mainContent = document.getElementById('destinationDetailContent');
                    if (mainContent) mainContent.insertAdjacentHTML('beforeend', html);
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
    const labels = monthLabels();
    const excellentMonths = months.reduce((acc, month, index) => {
        if (month === 'excellent') {
            acc.push(labels[index]);
        }
        return acc;
    }, []);
    
    if (excellentMonths.length > 0) {
        return `${excellentMonths.slice(0, 3).join(', ')}${excellentMonths.length > 3 ? '...' : ''}`;
    }
    return t('destDetail.yearRound');
}

function getQuickFacts(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('serengeti')) {
        return [
            { icon: 'fa-ruler', label: t('destDetail.factSize'), value: '14,750 sq km' },
            { icon: 'fa-calendar', label: t('destDetail.factEstablished'), value: '1951' },
            { icon: 'fa-users', label: t('destDetail.factAnnualVisitors'), value: '350,000+' },
            { icon: 'fa-star', label: t('destDetail.factFamousFor'), value: t('destDetail.famousMigration') }
        ];
    } else if (lowerName.includes('ngorongoro')) {
        return [
            { icon: 'fa-ruler', label: t('destDetail.factSize'), value: '260 sq km (crater)' },
            { icon: 'fa-calendar', label: t('destDetail.factEstablished'), value: '1959' },
            { icon: 'fa-users', label: t('destDetail.factAnnualVisitors'), value: '500,000+' },
            { icon: 'fa-star', label: t('destDetail.factFamousFor'), value: 'Crater floor wildlife' }
        ];
    } else if (lowerName.includes('kilimanjaro')) {
        return [
            { icon: 'fa-ruler', label: 'Height', value: '5,895 m' },
            { icon: 'fa-calendar', label: 'First Ascent', value: '1889' },
            { icon: 'fa-users', label: 'Annual Climbers', value: '50,000+' },
            { icon: 'fa-star', label: t('destDetail.factFamousFor'), value: 'Africa\'s highest peak' }
        ];
    } else {
        return [
            { icon: 'fa-ruler', label: t('destDetail.factSize'), value: t('destDetail.factVaries') },
            { icon: 'fa-calendar', label: t('destDetail.factEstablished'), value: t('destDetail.factVarious') },
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
    if (lowerName.includes('kilimanjaro')) return t('destDetail.climateAlpine');
    if (lowerName.includes('zanzibar')) return t('destDetail.climateTropical');
    return t('destDetail.climateSavanna');
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
    if (isSerengetiDestination(slug, name)) {
        applySerengetiSeo(destination);
        return;
    }
    if (isKilimanjaroDestination(slug, name)) {
        applyKilimanjaroSeo(destination);
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
            <div style="text-align:center;padding:4rem 1.25rem;max-width:36rem;margin:0 auto">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2 style="overflow-wrap:anywhere">${escapeHtml(message)}</h2>
                <p style="margin-top: 1rem;">${escapeHtml(t('destDetail.mightNotExist'))}</p>
                <a href="/destinations" class="btn btn-primary" style="margin-top: 2rem; display: inline-flex;">
                    <i class="fas fa-arrow-left"></i> ${escapeHtml(t('destDetail.browseAll'))}
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
            list.innerHTML = `<li><a href="/safaris">${escapeHtml(t('destDetail.viewAllSafaris'))}</a></li>`;
        }
    } catch (error) {
        console.error('Error loading popular safaris:', error);
        list.innerHTML = `<li><a href="/safaris">${escapeHtml(t('destDetail.viewAllSafaris'))}</a></li>`;
    }
}

function setCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function bookDestination(destinationName) {
    // Prefill booking with destination interest so guests skip re-choosing
    window.location.href = `/booking?interest=${encodeURIComponent(destinationName)}&name=${encodeURIComponent(destinationName)}`;
}

function escapeHtml(str) {
    if (str == null || str === false) return '';
    return String(str)
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
            { icon: 'fa-camera', text: t('destDetail.tipSerengeti1') },
            { icon: 'fa-sun', text: t('destDetail.tipSerengeti2') },
            { icon: 'fa-car', text: t('destDetail.tipSerengeti3') },
            { icon: 'fa-binoculars', text: t('destDetail.tipSerengeti4') }
        ];
    } else if (lowerName.includes('ngorongoro')) {
        tips = [
            { icon: 'fa-snowflake', text: t('destDetail.tipNgoro1') },
            { icon: 'fa-camera', text: t('destDetail.tipNgoro2') },
            { icon: 'fa-binoculars', text: t('destDetail.tipNgoro3') },
            { icon: 'fa-car', text: t('destDetail.tipNgoro4') }
        ];
    } else if (lowerName.includes('kilimanjaro')) {
        tips = [
            { icon: 'fa-hiking', text: t('destDetail.tipKili1') },
            { icon: 'fa-temperature-low', text: t('destDetail.tipKili2') },
            { icon: 'fa-tint', text: t('destDetail.tipKili3') },
            { icon: 'fa-walking', text: t('destDetail.tipKili4') }
        ];
    } else if (lowerName.includes('zanzibar')) {
        tips = [
            { icon: 'fa-swimmer', text: t('destDetail.tipZan1') },
            { icon: 'fa-tshirt', text: t('destDetail.tipZan2') },
            { icon: 'fa-sun', text: t('destDetail.tipZan3') },
            { icon: 'fa-camera', text: t('destDetail.tipZan4') }
        ];
    } else {
        tips = [
            { icon: 'fa-camera', text: t('destDetail.tipDefault1') },
            { icon: 'fa-binoculars', text: t('destDetail.tipDefault2') },
            { icon: 'fa-car', text: t('destDetail.tipDefault3') },
            { icon: 'fa-umbrella', text: t('destDetail.tipDefault4') }
        ];
    }
    return tips.map(tip => '<li><i class="fas fa-check-circle"></i> ' + tip.text + '</li>').join('');
}

window.openLightbox = function(url) {
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (!box || !img) return;
    img.src = url;
    box.classList.add('active');
};
window.closeLightbox = function() {
    const box = document.getElementById('lightbox');
    if (box) box.classList.remove('active');
};
