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
            updatePageTitle(currentDestination.park_name);
            updateMetaDescription(currentDestination.park_description);
            applyDestinationSeo(currentDestination);
            injectDestinationSchema(currentDestination);
            await loadSafariPackagesForDestination(currentDestination.park_name);
            await loadRelatedDestinations(currentDestination.park_id, currentDestination.park_slug);
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
    
    const name = destination.park_name;
    const description = destination.park_description || `Experience the breathtaking beauty of ${name}. This amazing destination offers incredible wildlife viewing opportunities and stunning landscapes that will leave you in awe.`;
    
    // Determine destination type and features
    const isUnesco = name.toLowerCase().includes('ngorongoro') || 
                     name.toLowerCase().includes('serengeti') ||
                     name.toLowerCase().includes('kilimanjaro');
    
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
    let facts = [
        { icon: 'fa-ruler', label: 'Size', value: destination.size_sq_km ? `${Number(destination.size_sq_km).toLocaleString()} sq km` : 'Varies' },
        { icon: 'fa-calendar', label: 'Established', value: destination.established_year || 'Various' },
        { icon: 'fa-users', label: 'Annual Visitors', value: '350,000+' },
        { icon: 'fa-star', label: 'Status', value: destination.is_unesco_heritage ? 'UNESCO Site' : 'National Park' }
    ];
    
    const heroImg = imgSrc(destination.image_url || (destination.image_urls && destination.image_urls[0]), '/images/hero.jpg');
    
    const html = `
        <!-- Hero Section -->
        <section class="destination-hero relative overflow-hidden page-hero" style="position: relative; z-index: 1;">
            <div class="hero-slideshow">
                <div class="hero-slide active" style="background-image: url('/images/optimized/mount-kilimanjaro-national-park.webp');">
                  <span class="hero-hook-word">Kilimanjaro</span>
                </div>
                <div class="hero-slide" style="background-image: url('/images/optimized/wamasai.webp');">
                  <span class="hero-hook-word">Culture</span>
                </div>
                <div class="hero-slide" style="background-image: url('/images/optimized/balloon.webp');">
                  <span class="hero-hook-word">Adventure</span>
                </div>
                <div class="hero-slide" style="background-image: url('/images/optimized/mbugani.webp');">
                  <span class="hero-hook-word">Wildlife</span>
                </div>
            </div>
            <div class="container" style="position: relative; z-index: 10; display: flex; align-items: center; height: 100%; min-height: 500px;">
                <div class="corp-hero-box" style="background: rgba(255, 255, 255, 0.95); padding: 3.5rem; border-radius: 4px; max-width: 650px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); border-left: 6px solid var(--accent); text-align: left;">
                    <div class="breadcrumb" style="color: #666; margin-bottom: 1rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        <a href="/" style="color: var(--accent); text-decoration: none;">Home</a>
                        <i class="fas fa-chevron-right" style="margin: 0 0.5rem; font-size: 0.75rem;"></i>
                        <a href="/destinations" style="color: var(--accent); text-decoration: none;">Destinations</a>
                        <i class="fas fa-chevron-right" style="margin: 0 0.5rem; font-size: 0.75rem;"></i>
                        <span style="color: #333;">${escapeHtml(name)}</span>
                    </div>
                    <h1 class="destination-title" style="color: #1a1a1a; text-shadow: none; font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1; margin-bottom: 1.5rem; margin-top: 0; text-align: left;">${escapeHtml(name)}</h1>
                    <div class="destination-badges" style="justify-content: flex-start; gap: 0.75rem; flex-wrap: wrap; margin-top: 0;">
                        <div class="badge" style="background: var(--bg-secondary); border: 1px solid #e0e0e0; color: #333; text-shadow: none;">
                            <i class="fas fa-map-marker-alt" style="color: var(--accent);"></i>
                            <span>Tanzania, East Africa</span>
                        </div>
                        ${isUnesco ? '<div class="badge unesco" style="background: var(--accent); border-color: var(--accent); color: #fff; text-shadow: none;"><i class="fas fa-flag-checkered"></i> UNESCO Site</div>' : ''}
                        <div class="badge" style="background: var(--bg-secondary); border: 1px solid #e0e0e0; color: #333; text-shadow: none;">
                            <i class="fas fa-safari" style="color: var(--accent);"></i>
                            <span>${destination.safari_count > 0 ? `${destination.safari_count} Safari Packages` : 'Inquire for Safaris'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Main Content -->
        <div class="destination-main">
            <div class="container">
                <div class="detail-layout">
                    <!-- Left Column -->
                    <div class="layout-main">
                        <!-- Description -->
                        <div class="content-section">
                            <h2>About ${escapeHtml(name)}</h2>
                            <p>${escapeHtml(description)}</p>
                        </div>
                        
                        <!-- Photo Gallery -->
                        <div class="content-section">
                            <h2>Photo Gallery</h2>
                            ${(() => {
                                const images = [];
                                if (Array.isArray(destination.image_urls)) images.push(...destination.image_urls);
                                if (destination.image_url && !images.includes(destination.image_url)) images.unshift(destination.image_url);
                                
                                if (images.length > 0) {
                                    return `
                                        <div class="gallery">
                                            <div class="gallery-main group" onclick="openLightbox('${imgSrc(images[0])}')">
                                                <img src="${imgSrc(images[0])}" alt="${escapeHtml(name)} main view" class="group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async">
                                            </div>
                                            ${images.length > 1 ? `
                                            <div class="gallery-thumbs">
                                                ${images.slice(1, 5).map((url, i) => `
                                                    <div class="gallery-thumb group" onclick="document.querySelector('.gallery-main img').src='${imgSrc(url)}'; document.querySelector('.gallery-main').setAttribute('onclick', 'openLightbox(\\'${imgSrc(url)}\\')')">
                                                        <img src="${imgSrc(url)}" alt="${escapeHtml(name)} thumbnail ${i+1}" class="group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async">
                                                    </div>
                                                `).join('')}
                                            </div>
                                            ` : ''}
                                        </div>
                                    `;
                                } else {
                                    return '<p style="color: var(--text-muted);"><i class="ph ph-image text-4xl mb-2 block"></i>Photos of this destination will be available soon.</p>';
                                }
                            })()}
                        </div>

                        <!-- Lightbox -->
                        <div id="lightbox" class="lightbox" onclick="closeLightbox()">
                            <button class="lightbox-close">&times;</button>
                            <img id="lightboxImg" src="" alt="Enlarged view">
                        </div>
                        
                        <!-- Quick Facts -->
                        <div class="content-section">
                            <h2>Quick Facts</h2>
                            <div class="facts-grid">
                                ${facts.map(fact => `
                                    <div class="fact-item">
                                        <div class="fact-icon">
                                            <i class="fas ${fact.icon}"></i>
                                        </div>
                                        <div class="fact-content">
                                            <h4>${fact.label}</h4>
                                            <p>${fact.value}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Wildlife -->
                        <div class="content-section">
                            <h2>Wildlife Highlights</h2>
                            <div class="wildlife-grid">
                                ${wildlife.map(animal => `
                                    <div class="wildlife-card">
                                        <i class="fas ${animal.icon}"></i>
                                        <span>${animal.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Best Time to Visit -->
                        <div class="content-section">
                            <h2>Best Time to Visit</h2>
                            <div class="best-time">
                                <div class="months-grid">
                                    ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => `
                                        <div class="month ${bestMonths[index]}">${month}</div>
                                    `).join('')}
                                </div>
                                <div class="legend">
                                    <div class="legend-item">
                                        <div class="legend-color excellent"></div>
                                        <span>Excellent</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color good"></div>
                                        <span>Good</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color poor"></div>
                                        <span>Poor</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Safari Packages -->
                        <div class="content-section" id="safariPackagesSection">
                            <h2>Safari Packages in ${escapeHtml(name)}</h2>
                            <div class="packages-grid" id="packagesGrid">
                                <div class="loading-card">Loading packages...</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column - Sidebar -->
                    <div class="layout-sidebar">
                        <div class="detail-card">
                            <h3><i class="fas fa-info-circle"></i> At a Glance</h3>
                            <ul>
                                <li><i class="fas fa-map-pin"></i> Location: Tanzania</li>
                                <li><i class="fas fa-calendar"></i> Best Time: ${getBestTimeText(bestMonths)}</li>
                                <li><i class="fas fa-clock"></i> Recommended Stay: ${getRecommendedStay(name)} days</li>
                                <li><i class="fas fa-temperature-high"></i> Climate: ${getClimate(name)}</li>
                            </ul>
                            <button class="btn btn-primary btn-block" style="margin-top: 1.5rem;" onclick="bookDestination('${escapeHtml(name)}')">
                                <i class="fas fa-calendar-alt"></i> Plan Your Visit
                            </button>
                        </div>
                        
                        <div class="detail-card">
                            <h3><i class="fas fa-lightbulb"></i> Travel Tips</h3>
                            <ul id="travelTipsList">${getTravelTips(name)}</ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    injectDestinationSchema(destination);
}

function injectDestinationSchema(destination) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        "name": destination.park_name,
        "description": destination.park_description,
        "image": destination.image_urls && destination.image_urls.length > 0 ? destination.image_urls[0] : (destination.image_url || 'https://tanzaniasafarimagic.com/images/hero.jpg')
    };
    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

async function loadSafariPackagesForDestination(destinationName) {
    const packagesGrid = document.getElementById('packagesGrid');
    if (!packagesGrid) return;
    
    packagesGrid.innerHTML = '<div class="loading-card">Loading safari packages...</div>';
    
    try {
        // Get all packages and filter by destination
        const result = await API.getPackages({ limit: 6 });
        
        if (result && result.success && result.data && result.data.length > 0) {
            // Filter packages that include this destination
            const filteredPackages = result.data.filter(pkg => {
                return pkg.destinations && pkg.destinations.some(dest => 
                    dest.park_name && dest.park_name.toLowerCase().includes(destinationName.toLowerCase())
                );
            });
            
            const packagesToShow = filteredPackages.length > 0 ? filteredPackages.slice(0, 3) : result.data.slice(0, 3);
            
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
                packagesGrid.innerHTML = '<p>No safari packages listed for this destination yet. <a href="/contact">Contact us</a> or <a href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%27m%20interested%20in%20a%20safari%20to%20this%20destination." target="_blank" rel="noopener">WhatsApp</a> for a custom itinerary.</p>';
                if (window.SafariSEO) SafariSEO.setNoIndexFollow();
            }
        } else {
            packagesGrid.innerHTML = '<p>No safari packages listed for this destination yet. <a href="/contact">Contact us</a> for a custom itinerary.</p>';
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
            const related = result.data.filter(dest => dest.park_slug !== currentSlug).slice(0, 3);
            
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
                                    let iconClass = 'fa-tree';
                                    if (dest.park_name.toLowerCase().includes('serengeti')) iconClass = 'fa-paw';
                                    else if (dest.park_name.toLowerCase().includes('kilimanjaro')) iconClass = 'fa-mountain';
                                    else if (dest.park_name.toLowerCase().includes('zanzibar')) iconClass = 'fa-umbrella-beach';
                                    
                                    return `
                                        <div class="related-card" onclick="window.location.href='/destinations/${dest.park_slug}'">
                                            <div class="related-card-image">
                                                <i class="fas ${iconClass}"></i>
                                            </div>
                                            <div class="related-card-content">
                                                <h3>${escapeHtml(dest.park_name)}</h3>
                                                <p>${escapeHtml(dest.park_description || 'Discover this amazing destination')}</p>
                                                <div class="related-stats">
                                                    <span><i class="fas fa-safari"></i> ${dest.safari_count || 0} safaris</span>
                                                </div>
                                            </div>
                                        </div>
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
    const name = destination.park_name || 'Tanzania Destination';
    const count = Number(destination.safari_count || 0);
    const desc = destination.park_description || destination.short_description ||
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
