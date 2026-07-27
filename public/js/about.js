// about.js - Dynamic about page

document.addEventListener('DOMContentLoaded', async () => {
    initLoadingScreen();
    initHeaderScroll();
    initBackToTop();
    initMobileMenu();
    setCurrentYear();
    loadPopularSafaris();
    await loadAboutContent();
    await loadTeamMembers();
    await loadBlogPosts();
    await loadSettings();
    initBookingButtons();
});

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

function initBookingButtons() {
    const quickBookBtn = document.getElementById('quickBookBtn');
    if (quickBookBtn) {
        quickBookBtn.addEventListener('click', () => {
            window.location.href = '/booking';
        });
    }
}

async function loadAboutContent() {
    const mainContent = document.getElementById('aboutContent');
    if (!mainContent) return;
    
    try {
        const result = await API.fetchJSON('/about-content');
        
        if (result && result.success) {
            const content = result.data;
            
            const html = `
                <section class="corp-section">
                    <div class="container">
                        <div class="corp-about-grid" style="margin-bottom:2.5rem">
                            <div class="corp-panel">
                                <span class="corp-eyebrow" style="color:var(--accent)">Our Story</span>
                                <h2 style="margin:0.35rem 0 1rem">Crafting private Tanzania safaris from Arusha</h2>
                                <p style="color:var(--text-secondary);line-height:1.8">${escapeHtml(content.about_company || 'Tanzania Safari Magic was founded in 2014 with a simple mission: to share the incredible beauty and wildlife of Tanzania with the world. What started as a small family business has grown into one of Tanzania\'s most trusted safari operators, serving thousands of satisfied travelers each year.')}</p>
                                <p style="color:var(--text-secondary);line-height:1.8">Our team of experienced guides and travel experts are passionate about creating unforgettable experiences that go beyond the typical tourist trail. We believe in responsible tourism that benefits local communities and preserves Tanzania\'s natural heritage for future generations.</p>
                            </div>
                            <div class="corp-panel" style="background:linear-gradient(160deg,#0f1a0e,#1f3a1c);color:#fff">
                                <h3 style="margin:0 0 1rem;color:#fff">Why travelers choose us</h3>
                                <ul style="list-style:none;padding:0;margin:0;display:grid;gap:0.85rem">
                                    <li><i class="fas fa-check-circle" style="color:var(--accent);margin-right:0.5rem"></i> Licensed Arusha-based operator</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--accent);margin-right:0.5rem"></i> TATO &amp; TripAdvisor trusted</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--accent);margin-right:0.5rem"></i> Private &amp; bespoke itineraries</li>
                                    <li><i class="fas fa-check-circle" style="color:var(--accent);margin-right:0.5rem"></i> 24-hour WhatsApp planning support</li>
                                </ul>
                                <div style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:0.75rem">
                                    <a href="/booking" class="btn btn-primary" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
                                    <a href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%27m%20interested%20in%20booking%20a%20custom%20safari%20package..." class="btn btn-outline" style="min-height:48px;color:#fff;border-color:rgba(255,255,255,0.4)" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                                </div>
                            </div>
                        </div>

                        <div class="corp-stat-row">
                            <div class="corp-stat"><strong>10+</strong><span>Years Experience</span></div>
                            <div class="corp-stat"><strong>5,000+</strong><span>Guests Hosted</span></div>
                            <div class="corp-stat"><strong>50+</strong><span>Expert Guides</span></div>
                            <div class="corp-stat"><strong>100%</strong><span>Satisfaction Focus</span></div>
                        </div>

                        <div class="corp-about-grid" style="margin-top:2.5rem">
                            <div class="corp-panel">
                                <i class="fas fa-bullseye" style="color:var(--primary);font-size:1.5rem;margin-bottom:0.75rem"></i>
                                <h3>Our Mission</h3>
                                <p style="color:var(--text-secondary);line-height:1.75">${escapeHtml(content.about_mission || 'To provide exceptional safari experiences that connect travelers with the authentic beauty of Tanzania while promoting sustainable tourism practices.')}</p>
                            </div>
                            <div class="corp-panel">
                                <i class="fas fa-eye" style="color:var(--accent);font-size:1.5rem;margin-bottom:0.75rem"></i>
                                <h3>Our Vision</h3>
                                <p style="color:var(--text-secondary);line-height:1.75">${escapeHtml(content.about_vision || 'To be East Africa\'s leading safari operator, known for excellence in service, conservation, and community development.')}</p>
                            </div>
                        </div>

                        <div style="margin-top:2.5rem">
                            <h2 style="margin-bottom:1.25rem">Our Values</h2>
                            <div class="corp-blog-grid">
                                <div class="corp-panel"><div class="value-icon" style="color:var(--primary);margin-bottom:0.75rem"><i class="fas fa-heart"></i></div><h3>Passion for Wildlife</h3><p style="color:var(--text-secondary)">We are driven by a genuine love for Tanzania's wildlife and landscapes.</p></div>
                                <div class="corp-panel"><div class="value-icon" style="color:var(--primary);margin-bottom:0.75rem"><i class="fas fa-handshake"></i></div><h3>Integrity</h3><p style="color:var(--text-secondary)">We operate with honesty, transparency, and respect for guests and partners.</p></div>
                                <div class="corp-panel"><div class="value-icon" style="color:var(--primary);margin-bottom:0.75rem"><i class="fas fa-leaf"></i></div><h3>Sustainability</h3><p style="color:var(--text-secondary)">We commit to eco-friendly practices that protect Tanzania's heritage.</p></div>
                                <div class="corp-panel"><div class="value-icon" style="color:var(--primary);margin-bottom:0.75rem"><i class="fas fa-users"></i></div><h3>Community</h3><p style="color:var(--text-secondary)">We support local communities through employment and partnerships.</p></div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
            mainContent.innerHTML = html;
        } else {
            throw new Error('Failed to load about content');
        }
    } catch (error) {
        console.error('Error loading about content:', error);
        mainContent.innerHTML = `
            <section class="corp-section">
                <div class="container">
                    <div class="corp-panel">
                        <h2>About Tanzania Safari Magic</h2>
                        <p>Tanzania Safari Magic was founded in 2014 with a simple mission: to share the incredible beauty and wildlife of Tanzania with the world. Our Arusha-based team crafts private safaris across Serengeti, Ngorongoro, Tarangire, and Zanzibar.</p>
                        <a href="/booking" class="btn btn-primary" style="margin-top:1rem;min-height:48px">Get a Free Quote</a>
                    </div>
                </div>
            </section>
        `;
    }
}

async function loadTeamMembers() {
    try {
        const result = await API.fetchJSON('/team-members');
        
        if (result && result.success && result.data && result.data.length > 0) {
            const teamHtml = `
                <div class="container">
                    <div class="team-section">
                        <h2>Meet Our Expert Team</h2>
                        <div class="team-grid">
                            ${result.data.map(member => {
                                const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Team Member';
                                const initials = (member.first_name?.charAt(0) || 'T') + (member.last_name?.charAt(0) || 'M');
                                const languages = member.languages_spoken || [];
                                
                                return `
                                    <div class="team-card">
                                        <div class="team-image">
                                            <i class="fas fa-user-circle"></i>
                                        </div>
                                        <div class="team-info">
                                            <h3>${escapeHtml(fullName)}</h3>
                                            <div class="team-title">${member.guide_id ? 'Safari Specialist' : 'Travel Consultant'}</div>
                                            ${member.years_experience ? `<div class="team-experience"><i class="fas fa-briefcase"></i> ${member.years_experience}+ Years Experience</div>` : ''}
                                            ${languages.length > 0 ? `
                                                <div class="team-languages">
                                                    ${languages.slice(0, 3).map(lang => `<span class="language-tag">${escapeHtml(lang)}</span>`).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Insert team section after existing content
            const mainContent = document.getElementById('aboutContent');
            if (mainContent) {
                mainContent.insertAdjacentHTML('beforeend', teamHtml);
            }
        }
    } catch (error) {
        console.error('Error loading team members:', error);
    }
}

async function loadBlogPosts() {
    try {
        const result = await API.fetchJSON('/blog-posts?limit=3');
        
        if (result && result.success && result.data && result.data.length > 0) {
            const blogHtml = `
                <div class="container">
                    <div class="blog-section">
                        <div class="section-header">
                            <span class="section-subtitle">From Our Blog</span>
                            <h2 class="section-title">Latest Stories & Updates</h2>
                        </div>
                        <div class="blog-grid">
                            ${result.data.map(post => `
                                <div class="blog-card" onclick="window.location.href='/blog/${post.post_slug}'">
                                    <div class="blog-image">
                                        <i class="fas fa-newspaper"></i>
                                    </div>
                                    <div class="blog-content">
                                        <span class="blog-category">${escapeHtml(post.category_name || 'News')}</span>
                                        <h3>${escapeHtml(post.post_title)}</h3>
                                        <p class="blog-excerpt">${escapeHtml(post.post_excerpt || post.post_content?.substring(0, 100) + '...' || 'Read more...')}</p>
                                        <div class="blog-meta">
                                            <span><i class="fas fa-calendar-alt"></i> ${new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                                            <span><i class="fas fa-eye"></i> ${post.views_count || 0} views</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            const mainContent = document.getElementById('aboutContent');
            if (mainContent) {
                mainContent.insertAdjacentHTML('beforeend', blogHtml);
            }
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

async function loadSettings() {
    try {
        const result = await API.fetchJSON('/settings');
        
        if (result && result.success) {
            const settings = result.data;
            
            // Update contact info in footer
            const contactInfo = document.getElementById('contactInfo');
            if (contactInfo) {
                contactInfo.innerHTML = `
                    <li><i class="fas fa-phone"></i> ${escapeHtml(settings.contact_phone || '+255 789 456 123')}</li>
                    <li><i class="fas fa-envelope"></i> ${escapeHtml(settings.contact_email || 'info@tanzaniasafari.com')}</li>
                    <li><i class="fas fa-map-marker-alt"></i> ${escapeHtml(settings.contact_address || 'Arusha, Tanzania')}</li>
                `;
            }
            
            // Update social links
            const socialLinks = document.getElementById('socialLinks');
            if (socialLinks) {
                socialLinks.innerHTML = `
                    ${settings.social_facebook ? `<a href="${escapeHtml(settings.social_facebook)}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
                    ${settings.social_instagram ? `<a href="${escapeHtml(settings.social_instagram)}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    ${settings.social_twitter ? `<a href="${escapeHtml(settings.social_twitter)}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                    ${settings.social_youtube ? `<a href="${escapeHtml(settings.social_youtube)}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
                `;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
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

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}