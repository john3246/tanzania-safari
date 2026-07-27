// safari-detail.js - Dynamic safari details page

let currentSafari = null;
let currentSlug = null;

document.addEventListener('DOMContentLoaded', async () => {
    initLoadingScreen();
    initHeaderScroll();
    initBackToTop();
    initMobileMenu();
    initQuickBookingModal();
    setCurrentYear();
    loadPopularSafaris();
    if (window.BookingHandler) {
        window.BookingHandler.initBookingButtons();
    }
    // Get slug from URL
    currentSlug = getSlugFromUrl();
    console.log('Loading safari with slug:', currentSlug);
    
    if (currentSlug) {
        await loadSafariDetails(currentSlug);
    } else {
        showError('No safari specified');
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
    }, 800);
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

function buildGallery(mediaItems) {
    if (!mediaItems || mediaItems.length === 0) {
        return '<div class="gallery-main"><img src="/images/optimized/balloon.webp" alt="Gallery"></div>';
    }
    const mainImg = mediaItems[0];
    const mainImgUrl = typeof mainImg === 'string' ? mainImg : mainImg.file_url;
    let html = `<div class="gallery-main" onclick="openLightbox('${mainImgUrl}')"><img src="${mainImgUrl}" alt="${mainImg.alt_text || 'Safari image'}" loading="lazy" decoding="async" onerror="this.src='/images/optimized/balloon.webp'"></div>`;
    if (mediaItems.length > 1) {
        html += '<div class="gallery-thumbs">';
        for (let i = 1; i < Math.min(mediaItems.length, 5); i++) {
            const thumbUrl = typeof mediaItems[i] === 'string' ? mediaItems[i] : mediaItems[i].file_url;
            html += `<div class="gallery-thumb" onclick="setGalleryMain('${thumbUrl}')"><img src="${thumbUrl}" alt="Thumbnail ${i}" loading="lazy" decoding="async" onerror="this.src='/images/optimized/balloon.webp'"></div>`;
        }
        html += '</div>';
    }
    return html;
}

window.setGalleryMain = function(url) {
    const mainImg = document.querySelector('.gallery-main img');
    if (mainImg) mainImg.src = url;
};



let pollingInterval = null;

async function loadSafariDetails(slug) {
    try {
        const result = await API.getPackageBySlug(slug);
        if (result && result.success && result.data) {
            currentSafari = result.data;
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('detailContent').style.display = 'block';
            renderSafariDetails(result.data);
            updatePageTitle(result.data.package_name);
            applySafariSeo(result.data);
            await loadRelatedSafaris(result.data.category_slug, result.data.package_id);
            
            // Setup polling for real-time updates
            if (!pollingInterval) {
                pollingInterval = setInterval(async () => {
                    try {
                        const updateRes = await API.getPackageBySlug(slug);
                        if (updateRes && updateRes.success && updateRes.data) {
                            if (JSON.stringify(currentSafari) !== JSON.stringify(updateRes.data)) {
                                currentSafari = updateRes.data;
                                renderSafariDetails(updateRes.data);
                            }
                        }
                    } catch (err) {
                        console.error('Polling error:', err);
                    }
                }, 30000);
            }
        } else {
            document.getElementById('loadingState').style.display = 'none';
            showError('Safari package not found');
        }
    } catch (error) {
        console.error('Error loading safari details:', error);
        document.getElementById('loadingState').innerHTML = '<p style="color:var(--error)">Failed to load details.</p>';
    }
}

function renderSafariDetails(safari) {
    const heroImg = document.getElementById('heroImg');
    if(heroImg) heroImg.src = imgSrc(safari.featured_image_url || safari.image_urls?.[0], '/images/optimized/balloon.webp');
    
    const heroTitle = document.getElementById('heroTitle');
    if(heroTitle) heroTitle.textContent = safari.package_name;
    
    const breadcrumbName = document.getElementById('breadcrumbName');
    if(breadcrumbName) breadcrumbName.textContent = safari.package_name;
    
    const heroBadge = document.getElementById('heroBadge');
    if(heroBadge) {
        let badges = [];
        if(safari.is_featured) badges.push('<span class="badge" style="background:var(--accent);color:#fff"><i class="fas fa-star"></i> Featured</span>');
        badges.push('<span class="badge" style="background:var(--primary);color:#fff"><i class="fas fa-tag"></i> ' + escapeHtml(safari.category_name || 'Safari') + '</span>');
        heroBadge.innerHTML = badges.join(' ');
    }
    
    const packageDesc = document.getElementById('packageDescription');
    if(packageDesc) packageDesc.innerHTML = '<h2 style="font-family:var(--font-heading);margin-bottom:1rem">About this Safari</h2><p style="color:var(--text-secondary);line-height:1.7">' + escapeHtml(safari.detailed_description || safari.short_description || '') + '</p>';
    
    const packageHighlights = document.getElementById('packageHighlights');
    if(packageHighlights && safari.highlights) {
        let hl = Array.isArray(safari.highlights) ? safari.highlights : safari.highlights.split('\n');
        packageHighlights.innerHTML = '<h3 style="font-family:var(--font-heading);margin:1.5rem 0 1rem 0;">Highlights</h3><ul style="list-style:none;padding:0">' + 
            hl.map(h => '<li style="margin-bottom:0.5rem;color:var(--earth-dark)"><i class="fas fa-check-circle" style="color:var(--primary);margin-right:0.5rem"></i>' + escapeHtml(h) + '</li>').join('') + '</ul>';
    }
    
    const packageDest = document.getElementById('packageDestinations');
    if(packageDest && safari.destinations && safari.destinations.length > 0) {
        packageDest.innerHTML = '<h3 style="font-family:var(--font-heading);margin-bottom:1rem;margin-top:2rem;">Destinations Visited</h3>' + 
            safari.destinations.map(d => {
                let name = d.park_name || d;
                let slug = d.slug || (typeof name === "string" ? name.toLowerCase().replace(/\s+/g, '-') : "");
                return '<a href="/destinations/' + escapeHtml(slug) + '" class="badge" style="background:var(--bg-secondary);color:var(--primary);padding:0.5rem 1rem;border-radius:20px;margin-right:0.5rem;font-size:0.9rem;display:inline-block;margin-bottom:0.5rem;text-decoration:none;transition:var(--transition)"><i class="fas fa-map-marker-alt" style="margin-right:0.5rem"></i>' + escapeHtml(name) + '</a>';
            }).join('');
    }
    
    const galleryEl = document.getElementById('gallery');
    if(galleryEl) {
        const imgs = safari.image_urls && safari.image_urls.length > 0 ? safari.image_urls : [safari.featured_image_url || '/images/optimized/balloon.webp'];
        galleryEl.innerHTML = buildGallery(imgs);
    }
    
    const itineraryList = document.getElementById('itineraryList');
    if(itineraryList) itineraryList.innerHTML = renderItinerary(safari.itinerary);
    
    const includesList = document.getElementById('includesList');
    if(includesList) includesList.innerHTML = (safari.included_features || safari.inclusions || []).map(i => '<li style="margin-bottom:0.75rem;display:flex;align-items:center;gap:0.75rem;color:var(--text-secondary)"><i class="fas fa-check" style="color:var(--success)"></i> ' + escapeHtml(i) + '</li>').join('');
    
    const excludesList = document.getElementById('excludesList');
    if(excludesList) excludesList.innerHTML = (safari.excluded_features || safari.exclusions || []).map(i => '<li style="margin-bottom:0.75rem;display:flex;align-items:center;gap:0.75rem;color:var(--text-secondary)"><i class="fas fa-times" style="color:var(--error)"></i> ' + escapeHtml(i) + '</li>').join('');
    
    const reviewsList = document.getElementById('reviewsList');
    if(reviewsList) {
        if(safari.reviews && safari.reviews.length > 0) {
            reviewsList.innerHTML = safari.reviews.map(r => '<div style="background:#fff;border:1px solid var(--border-light);padding:1.5rem;border-radius:12px;margin-bottom:1rem"><div style="color:var(--warning);margin-bottom:0.5rem">' + Array(5).fill().map((_,i)=>'<i class="fas fa-star' + (i<r.rating?'':'-o') + '"></i>').join('') + '</div><h4 style="margin:0 0 0.5rem 0;color:var(--earth-dark)">' + escapeHtml(r.review_title || 'Great Safari') + '</h4><p style="color:var(--text-secondary);font-size:0.95rem">' + escapeHtml(r.comment) + '</p><div style="font-size:0.85rem;color:var(--text-muted);margin-top:1rem">' + escapeHtml(r.first_name) + ' - ' + new Date(r.created_at).toLocaleDateString() + '</div></div>').join('');
        } else {
            reviewsList.innerHTML = '<p style="color:var(--text-muted)">No reviews yet.</p>';
        }
    }
    
    renderCard(safari);
    injectJSONLDSchema(safari);
    renderSafariFaq(safari);
    applySafariSeo(safari);
}

function applySafariSeo(safari) {
    if (!window.SafariSEO) return;
    const days = safari.duration_days ? `${safari.duration_days}-Day ` : '';
    const name = safari.package_name || 'Tanzania Safari';
    const lower = name.toLowerCase();
    let title = `${name} | Tanzania Safari Magic`;
    let description = safari.short_description || safari.detailed_description || '';

    // High-intent keyword overlays for known package themes
    if (/migration|serengeti/i.test(lower)) {
        title = `${name} | 9 Day Serengeti Migration Safari & Great Migration Tour`;
        if (!description || description.length < 80) {
            description = `Book a ${days || ''}Serengeti migration safari and great migration tour in Tanzania with private guides from Arusha. Inquire for a free quote.`;
        }
    } else if (/zanzibar|beach|bush.?to.?beach/i.test(lower)) {
        title = `${name} | Tanzania Safari and Zanzibar Package`;
        if (!description || description.length < 80) {
            description = `Bush-to-beach Tanzania tour combining safari game drives with Zanzibar beaches. Custom Tanzania safari and Zanzibar packages from Arusha.`;
        }
    } else {
        title = `${days}${name} | Private Tanzania Safari from Arusha`;
        if (!description || description.length < 80) {
            description = `Private ${name} with expert local guides. Mid-range to luxury Tanzania safari experiences from Arusha — WhatsApp for a free quote.`;
        }
    }

    SafariSEO.applyPageSeo({
        title: title.slice(0, 70),
        description: String(description).replace(/\s+/g, ' ').trim().slice(0, 160),
        image: safari.featured_image_url || safari.image_urls?.[0]
    });

    const wa = document.getElementById('waQuoteBtn');
    if (wa) {
        const msg = encodeURIComponent(`Hi Tanzania Safari Magic, I'm interested in booking "${name}". Please send me a free quote.`);
        wa.href = `https://wa.me/255695108009?text=${msg}`;
    }
}

function renderSafariFaq(safari) {
    const el = document.getElementById('safariFaqSection');
    if (!el || !window.SafariSEO) return;
    const faqs = SafariSEO.defaultSafariFaqs(safari);
    SafariSEO.renderFaqSection(el, faqs);
}

function injectJSONLDSchema(safari) {
    if (window.SafariSEO) {
        SafariSEO.injectJsonLd('touristtrip-jsonld', SafariSEO.touristTripSchema(safari));
        return;
    }
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": safari.package_name,
        "image": safari.image_urls && safari.image_urls.length > 0 ? safari.image_urls : [safari.featured_image_url || 'https://tanzaniasafarimagic.com/images/hero.jpg'],
        "description": safari.short_description || safari.detailed_description,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": safari.price || safari.base_price_usd,
            "availability": "https://schema.org/InStock"
        }
    };
    if (safari.avg_rating > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": safari.avg_rating,
            "reviewCount": safari.review_count || 1
        };
    }
    let script = document.getElementById('touristtrip-jsonld');
    if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'touristtrip-jsonld';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
}

function renderItinerary(items) {
    if (!items || items.length === 0) {
        return '<p>Detailed itinerary coming soon.</p>';
    }
    items.sort((a, b) => a.day_number - b.day_number);
    let html = '<div class="itinerary-timeline">';
    items.forEach(item => {
        html += `
        <div class="itinerary-item">
            <div class="itinerary-day">Day ${item.day_number}</div>
            <div class="itinerary-title">${escapeHtml(item.title)}</div>
            <div class="itinerary-desc">${escapeHtml(item.description).replace(/\n/g, '<br>')}</div>
            <div class="itinerary-meta">
        `;
        if (item.accommodation) {
            html += `<span><i class="fas fa-bed"></i> ${escapeHtml(item.accommodation)}</span>`;
        }
        if (item.meals_included) {
            html += `<span><i class="fas fa-utensils"></i> ${escapeHtml(item.meals_included)}</span>`;
        }
        html += `</div></div>`;
    });
    html += '</div>';
    return html;
}

async function loadRelatedSafaris(categorySlug, currentPackageId) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;
    
    try {
        const params = {
            category: categorySlug,
            limit: 3
        };
        
        const result = await API.getPackages(params);
        
        if (result && result.success && result.data && result.data.length > 0) {
            // Filter out current package
            const related = result.data.filter(pkg => pkg.package_id !== currentPackageId).slice(0, 3);
            
            if (related.length > 0) {
                relatedGrid.innerHTML = related.map(pkg => {
                    const avgRating = parseFloat(pkg.avg_rating || 0).toFixed(1);
                    const categoryIcon = getCategoryIcon(pkg.category_slug);
                    
                    return `
                        <div class="related-card" onclick="window.location.href='/safaris/${pkg.package_slug}'">
                            <div class="related-card-image">
                                <i class="fas ${categoryIcon}" style="font-size: 48px;"></i>
                            </div>
                            <div class="related-card-content">
                                <h3>${escapeHtml(pkg.package_name)}</h3>
                                <p>${escapeHtml(pkg.short_description || 'Experience Tanzania\'s wildlife')}</p>
                                <div class="related-card-meta">
                                    <span class="related-price">$${parseInt(pkg.base_price_usd || 0).toLocaleString()}</span>
                                    <span class="related-duration"><i class="fas fa-clock"></i> ${pkg.duration_days} days</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                relatedGrid.innerHTML = '<p>No related safaris found.</p>';
            }
        } else {
            relatedGrid.innerHTML = '<p>No related safaris found.</p>';
        }
    } catch (error) {
        console.error('Error loading related safaris:', error);
        relatedGrid.innerHTML = '<p>Unable to load related safaris.</p>';
    }
}

function getCategoryIcon(categorySlug) {
    const icons = {
        'wildlife-safari': 'fa-paw',
        'mountain-trekking': 'fa-mountain',
        'beach-holiday': 'fa-umbrella-beach',
        'cultural-tour': 'fa-landmark',
        'bird-watching': 'fa-dove',
        'photography-safari': 'fa-camera'
    };
    return icons[categorySlug] || 'fa-tree';
}

function updatePageTitle(title) {
    document.title = `${title} | Tanzania Safari Tours`;
}

function showError(message) {
    const mainContent = document.getElementById('safariDetailContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>${escapeHtml(message)}</h2>
                <p style="margin-top: 1rem;">The safari package you're looking for might have been removed or doesn't exist.</p>
                <a href="/safaris" class="btn btn-primary" style="margin-top: 2rem; display: inline-block;">
                    <i class="fas fa-arrow-left"></i> Browse All Safaris
                </a>
            </div>
        `;
    }
}

function initQuickBookingModal() {
    const quickBookBtn = document.getElementById('quickBookBtn');
    const modal = document.getElementById('quickBookingModal');
    const modalClose = document.querySelector('.modal-close');
    
    if (!quickBookBtn || !modal) return;
    
    quickBookBtn.addEventListener('click', () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        loadSafarisForDropdown();
    });
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    
    const form = document.getElementById('quickBookingForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('enquiryName');
            const email = document.getElementById('enquiryEmail');
            const message = document.getElementById('enquiryMessage');
            
            if (!name || !email || !message) return;
            
            if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(email.value)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                await API.submitEnquiry({
                    full_name: name.value,
                    email: email.value,
                    phone: document.getElementById('enquiryPhone')?.value || '',
                    message: message.value,
                    enquiry_type: 'Booking Inquiry',
                    package_id: document.getElementById('preferredSafari')?.value || null
                });
                
                showNotification('Enquiry sent successfully! We\'ll contact you within 24 hours.', 'success');
                form.reset();
                modal.classList.remove('show');
                document.body.style.overflow = '';
            } catch (error) {
                console.error('Error submitting enquiry:', error);
                showNotification(error.message || 'Failed to send enquiry. Please try again.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}
function renderItinerary(items) {
    if (!items || items.length === 0) {
        return '<p>Detailed itinerary coming soon.</p>';
    }
    if (typeof items === 'string') {
        try {
            items = JSON.parse(items);
        } catch (e) {
            console.error('Failed to parse itinerary', e);
            return '<p>Detailed itinerary coming soon.</p>';
        }
    }
    if (!Array.isArray(items)) {
        return '<p>Detailed itinerary coming soon.</p>';
    }
    items.sort((a, b) => a.day_number - b.day_number);
    let html = '<div class="itinerary-timeline">';
    items.forEach(item => {
        html += `
        <div class="itinerary-item">
            <div class="itinerary-day">Day ${item.day_number}</div>
            <div class="itinerary-title">${escapeHtml(item.day_title || item.title)}</div>
            <div class="itinerary-desc">${escapeHtml(item.day_description || item.description).replace(/\n/g, '<br>')}</div>
            <div class="itinerary-meta">
        `;
        if (item.accommodation_type || item.accommodation) {
            html += `<span><i class="fas fa-bed"></i> ${escapeHtml(item.accommodation_type || item.accommodation)}</span>`;
        }
        if (item.meals_included) {
            html += `<span><i class="fas fa-utensils"></i> ${escapeHtml(item.meals_included)}</span>`;
        }
        html += `</div></div>`;
    });
    html += '</div>';
    return html;
}

async function loadRelatedSafaris(categorySlug, currentPackageId) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;
    
    try {
        const params = {
            category: categorySlug,
            limit: 3
        };
        
        const result = await API.getPackages(params);
        
        if (result && result.success && result.data && result.data.length > 0) {
            // Filter out current package
            const related = result.data.filter(pkg => pkg.package_id !== currentPackageId).slice(0, 3);
            
            if (related.length > 0) {
                relatedGrid.innerHTML = related.map(pkg => {
                    const avgRating = parseFloat(pkg.avg_rating || 0).toFixed(1);
                    const categoryIcon = getCategoryIcon(pkg.category_slug);
                    
                    return `
                        <div class="related-card" onclick="window.location.href='/safaris/${pkg.package_slug}'">
                            <div class="related-card-image">
                                <i class="fas ${categoryIcon}" style="font-size: 48px;"></i>
                            </div>
                            <div class="related-card-content">
                                <h3>${escapeHtml(pkg.package_name)}</h3>
                                <p>${escapeHtml(pkg.short_description || 'Experience Tanzania\'s wildlife')}</p>
                                <div class="related-card-meta">
                                    <span class="related-price">$${parseInt(pkg.base_price_usd || 0).toLocaleString()}</span>
                                    <span class="related-duration"><i class="fas fa-clock"></i> ${pkg.duration_days} days</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                relatedGrid.innerHTML = '<p>No related safaris found.</p>';
            }
        } else {
            relatedGrid.innerHTML = '<p>No related safaris found.</p>';
        }
    } catch (error) {
        console.error('Error loading related safaris:', error);
        relatedGrid.innerHTML = '<p>Unable to load related safaris.</p>';
    }
}

function getCategoryIcon(categorySlug) {
    const icons = {
        'wildlife-safari': 'fa-paw',
        'mountain-trekking': 'fa-mountain',
        'beach-holiday': 'fa-umbrella-beach',
        'cultural-tour': 'fa-landmark',
        'bird-watching': 'fa-dove',
        'photography-safari': 'fa-camera'
    };
    return icons[categorySlug] || 'fa-tree';
}

function updatePageTitle(title) {
    document.title = `${title} | Tanzania Safari Tours`;
}

function showError(message) {
    const mainContent = document.getElementById('safariDetailContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>${escapeHtml(message)}</h2>
                <p style="margin-top: 1rem;">The safari package you're looking for might have been removed or doesn't exist.</p>
                <a href="/safaris" class="btn btn-primary" style="margin-top: 2rem; display: inline-block;">
                    <i class="fas fa-arrow-left"></i> Browse All Safaris
                </a>
            </div>
        `;
    }
}

function initQuickBookingModal() {
    const quickBookBtn = document.getElementById('quickBookBtn');
    const modal = document.getElementById('quickBookingModal');
    const modalClose = document.querySelector('.modal-close');
    
    if (!quickBookBtn || !modal) return;
    
    quickBookBtn.addEventListener('click', () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        loadSafarisForDropdown();
    });
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    
    const form = document.getElementById('quickBookingForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('enquiryName');
            const email = document.getElementById('enquiryEmail');
            const message = document.getElementById('enquiryMessage');
            
            if (!name || !email || !message) return;
            
            if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(email.value)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                await API.submitEnquiry({
                    full_name: name.value,
                    email: email.value,
                    phone: document.getElementById('enquiryPhone')?.value || '',
                    message: message.value,
                    enquiry_type: 'Booking Inquiry',
                    package_id: document.getElementById('preferredSafari')?.value || null
                });
                
                showNotification('Enquiry sent successfully! We\'ll contact you within 24 hours.', 'success');
                form.reset();
                modal.classList.remove('show');
                document.body.style.overflow = '';
            } catch (error) {
                console.error('Error submitting enquiry:', error);
                showNotification(error.message || 'Failed to send enquiry. Please try again.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

async function loadSafarisForDropdown() {
    const select = document.getElementById('preferredSafari');
    if (!select) return;
    
    try {
        const result = await API.getFeaturedPackages(10);
        if (result && result.success && result.data && result.data.length > 0) {
            select.innerHTML = '<option value="" disabled selected>Select a safari package</option>' +
                result.data.map(pkg => `<option value="${pkg.package_id}">${escapeHtml(pkg.package_name)}</option>`).join('');
        } else {
            select.innerHTML = '<option value="" disabled selected>No safaris available</option>';
        }
    } catch (error) {
        console.error('Error loading safaris for dropdown:', error);
        select.innerHTML = '<option value="" disabled selected>Unable to load safaris</option>';
    }
}

function renderCard(pkg) {
    const formattedPrice = '$' + Number(pkg.base_price_usd).toLocaleString();
    document.getElementById('cardPrice').textContent = formattedPrice;
    
    const mobilePriceEl = document.getElementById('mobilePrice');
    if (mobilePriceEl) mobilePriceEl.textContent = formattedPrice;
    const mobileBookBtn = document.getElementById('mobileBookBtn');
    if (mobileBookBtn) mobileBookBtn.href = `/booking?package=${pkg.package_slug}`;

    const meta = [
        { icon: 'fa-clock', label: 'Duration', value: `${pkg.duration_days} Days / ${pkg.duration_nights || pkg.duration_days - 1} Nights` },
        { icon: 'fa-tachometer-alt', label: 'Difficulty', value: pkg.difficulty_level || 'Easy' },
        { icon: 'fa-users', label: 'Group Size', value: `${pkg.minimum_pax || 1}–${pkg.maximum_pax || 12} People` },
        { icon: 'fa-star', label: 'Rating', value: `${parseFloat(pkg.avg_rating || 0).toFixed(1)} ★ (${pkg.review_count || 0} reviews)` },
    ];
    document.getElementById('cardMeta').innerHTML = meta.map(m => `
    <div class="detail-meta-row">
      <span class="detail-meta-label"><i class="fas ${m.icon}"></i>${m.label}</span>
      <span class="detail-meta-value">${m.value}</span>
    </div>`).join('');
    const bookBtn = document.getElementById('bookBtn');
    if (bookBtn) bookBtn.href = `/booking?package=${pkg.package_slug}`;
}

async function submitReview(event) {
    event.preventDefault();
    if (!currentSafari) return;
    const author = document.getElementById('reviewAuthor').value;
    const rating = document.getElementById('reviewRating').value;
    const content = document.getElementById('reviewContent').value;
    const btn = event.target.querySelector('button[type="submit"]');
    const oldText = btn.innerHTML;
    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;
        const res = await API.submitReview({
            package_id: currentSafari.package_id,
            first_name: author,
            rating: parseInt(rating),
            comment: content
        });
        toast(res.message || 'Review submitted successfully!', 'success');
        event.target.reset();
        document.getElementById('reviewFormContainer').style.display = 'none';
    } catch(err) {
        toast(err.message || 'Failed to submit review', 'error');
    } finally {
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
}

function openBookingModal(slug, name) {
    window.location.href = `/booking?package=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
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

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    const icon = icons[type] || 'fa-info-circle';
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${escapeHtml(message)}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) notification.remove();
                }, 300);
            }, 4000);
        }
    }, 10);
    
    setTimeout(() => notification.classList.add('show'), 10);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
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

window.openBookingModal = openBookingModal;
window.submitReview = submitReview;

// Tab interaction
document.addEventListener('click', e => {
    if (e.target.classList.contains('tab-btn')) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        e.target.classList.add('active');
        const tabId = 'tab-' + e.target.dataset.tab;
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');
    }
});
