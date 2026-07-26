/**
 * Layout Loader - Dynamically injects shared components (Header, Footer)
 * and handles global UI interactions like navbar scrolling and social float.
 */

const ASSET_VERSION = '4';

document.addEventListener('DOMContentLoaded', () => {
    ensureStylesheet('/css/whatsapp.css?v=' + ASSET_VERSION);
    ensureStylesheet('/css/chat.css?v=' + ASSET_VERSION);

    loadComponent('header', '/includes/header.html?v=' + ASSET_VERSION, initHeader);
    loadComponent('footer', '/includes/footer.html?v=' + ASSET_VERSION, () => {
        initFooter();
        // Defer chat until after first paint for better LCP on Render
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => loadChatScripts(), { timeout: 2500 });
        } else {
            setTimeout(loadChatScripts, 1200);
        }
    });

    loadSeoScript().then(() => initSEO());
});

function ensureStylesheet(href) {
    const bare = href.split('?')[0];
    if (document.querySelector(`link[href*="${bare}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function loadSeoScript() {
    return new Promise((resolve) => {
        if (window.SafariSEO) return resolve();
        if (document.querySelector('script[src^="/js/seo.js"]')) {
            const check = setInterval(() => {
                if (window.SafariSEO) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
            setTimeout(() => { clearInterval(check); resolve(); }, 2000);
            return;
        }
        const script = document.createElement('script');
        script.src = '/js/seo.js?v=' + ASSET_VERSION;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
}

function loadChatScripts() {
    if (window.liveChat || document.querySelector('script[data-chat-loader="1"]')) return;

    const loadChat = () => {
        if (document.querySelector('script[src^="/js/chat.js"]')) return;
        const chatScript = document.createElement('script');
        chatScript.src = '/js/chat.js?v=' + ASSET_VERSION;
        chatScript.defer = true;
        document.body.appendChild(chatScript);
    };

    if (typeof io === 'undefined') {
        const ioScript = document.createElement('script');
        ioScript.src = '/socket.io/socket.io.js';
        ioScript.setAttribute('data-chat-loader', '1');
        ioScript.onload = loadChat;
        ioScript.onerror = () => {
            console.error('Socket.io failed to load. Chat will run in offline mode.');
            loadChat();
        };
        document.body.appendChild(ioScript);
    } else {
        loadChat();
    }
}

/**
 * Fetches and injects an HTML component into a container by ID
 */
async function loadComponent(id, url, callback) {
    try {
        const container = document.getElementById(id);
        if (!container) return;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        
        const html = await response.text();
        container.innerHTML = html;
        
        if (callback) callback();
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

/**
 * Initializes header functionality after injection
 */
function initHeader() {
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    const menuOverlay = document.getElementById('menuOverlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Set active link based on current path
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/') || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile menu toggle
    const drawerClose = document.getElementById('drawerClose');
    
    function toggleDrawer() {
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileToggle && mainNav && menuOverlay) {
        mobileToggle.addEventListener('click', toggleDrawer);
        menuOverlay.addEventListener('click', toggleDrawer);
        if (drawerClose) drawerClose.addEventListener('click', toggleDrawer);
    }

    // Scroll effect - Navbar color change
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
}

/**
 * Initializes footer functionality after injection
 */
function initFooter() {
    // Update current year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Social Float Button
    const socialFloatBtn = document.getElementById('socialFloatBtn');
    const socialFloat = document.querySelector('.social-float');
    if (socialFloatBtn && socialFloat) {
        socialFloatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            socialFloat.classList.toggle('active');
            socialFloatBtn.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            socialFloat.classList.remove('active');
            socialFloatBtn.classList.remove('active');
        });
    }

    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // Social float
        const floatBtn = document.getElementById('socialFloatBtn');
        const floatWrap = document.querySelector('.social-float');
        if (floatBtn && floatWrap) {
            floatBtn.addEventListener('click', () => {
                floatWrap.classList.toggle('active');
                floatBtn.classList.toggle('active');
            });
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!floatWrap.contains(e.target)) {
                    floatWrap.classList.remove('active');
                    floatBtn.classList.remove('active');
                }
            });
        }

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Hero Slideshow (inner pages)
        const heroBg = document.querySelector('.page-hero .hero-bg img');
        if (heroBg) {
            const slides = [
                heroBg.src,
                '/images/serengeti-national-park.jpg',
                '/images/ngorongoro-conservation-area.jpg',
                '/images/mount-kilimanjaro-national-park.jpg'
            ];
            let currentSlide = 0;
            setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                heroBg.style.opacity = '0.3';
                setTimeout(() => {
                    heroBg.src = slides[currentSlide];
                    heroBg.style.opacity = '1';
                }, 500);
            }, 6000);
        }
    }

    // Popular Safaris in Footer
    loadFooterSafaris();

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            const btn = newsletterForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast('Success!', 'Thank you for subscribing to our newsletter.', 'success');
                    newsletterForm.reset();
                } else {
                    showToast('Error', result.message || 'Failed to subscribe.', 'error');
                }
            } catch (error) {
                showToast('Error', 'An error occurred. Please try again later.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // Quick Booking Modal
    const closeQuickBook = document.getElementById('closeQuickBook');
    const quickBookModal = document.getElementById('quickBookModal');
    if (closeQuickBook && quickBookModal) {
        closeQuickBook.addEventListener('click', () => {
            quickBookModal.classList.remove('active');
        });
        
        quickBookModal.addEventListener('click', (e) => {
            if (e.target === quickBookModal) {
                quickBookModal.classList.remove('active');
            }
        });
    }
}

/**
 * Fetches and displays popular safaris in the footer
 */
async function loadFooterSafaris() {
    const footerSafaris = document.getElementById('footerSafaris');
    if (!footerSafaris) return;

    try {
        const response = await fetch('/api/packages/featured?limit=5');
        const { data } = await response.json();
        
        if (data && data.length > 0) {
            footerSafaris.innerHTML = data.map(pkg => `
                <li><a href="/safaris/${pkg.package_slug}">${pkg.package_name}</a></li>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading footer safaris:', error);
    }
}

/**
 * Utility: Shows a toast notification
 */
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
                 
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    const timer = setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
    
    toast.querySelector('.toast-close').onclick = () => {
        clearTimeout(timer);
        toast.remove();
    };
}

/**
 * Initializes SEO tags, canonical URL, Open Graph, Twitter cards, and JSON-LD.
 */
function initSEO() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const pageMap = {
        '/': {
            title: 'Tanzania Safari Magic | Authentic African Safari Tours',
            description: 'Book authentic Tanzania safari tours with local experts. Great Migration, Kilimanjaro, Ngorongoro Crater, and Zanzibar beach escapes.',
            keywords: 'Tanzania safari, Serengeti safari, Kilimanjaro trek, Ngorongoro crater, Zanzibar holiday, African wildlife tours'
        },
        '/safaris': {
            title: 'Safari Packages & Tours in Tanzania | Tanzania Safari Magic',
            description: 'Browse Tanzania safari packages by destination, duration, and budget. Custom wildlife adventures across Serengeti, Tarangire, and more.'
        },
        '/destinations': {
            title: 'Tanzania Destinations & National Parks | Tanzania Safari Magic',
            description: 'Explore Tanzania iconic destinations — Serengeti, Ngorongoro, Kilimanjaro, Tarangire, and Zanzibar — with expert local guides.'
        },
        '/about': {
            title: 'About Us | Tanzania Safari Magic',
            description: 'Meet the local Tanzania safari specialists crafting eco-conscious, luxury wildlife adventures from Arusha.'
        },
        '/contact': {
            title: 'Contact & Book a Safari | Tanzania Safari Magic',
            description: 'Talk to our safari experts in Arusha. Call, WhatsApp, or email to plan your Tanzania adventure.'
        },
        '/blog': {
            title: 'Safari Travel Blog & Wildlife Guides | Tanzania Safari Magic',
            description: 'Tanzania safari guides, migration updates, packing tips, and travel advice from local experts.'
        },
        '/booking': {
            title: 'Book Your Tanzania Safari Online | Tanzania Safari Magic',
            description: 'Secure your Tanzania safari booking online with expert guidance and flexible itineraries.'
        }
    };

    const defaults = pageMap[path] || {};
    const descMeta = document.querySelector('meta[name="description"]');

    if (window.SafariSEO) {
        window.SafariSEO.apply({
            title: defaults.title || document.title,
            description: defaults.description || (descMeta && descMeta.content) || window.SafariSEO.DEFAULT_DESC,
            keywords: defaults.keywords,
            image: '/images/hero.jpg',
            type: 'website'
        });
        window.SafariSEO.injectOrganizationSchema();
    } else {
        // Fallback if seo.js failed to load
        if (defaults.title) document.title = defaults.title;
        if (defaults.description && descMeta) descMeta.setAttribute('content', defaults.description);
    }
}
