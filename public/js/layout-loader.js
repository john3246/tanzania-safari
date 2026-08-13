/**
 * Layout Loader - Dynamically injects shared components (Header, Footer)
 * and handles global UI interactions like navbar scrolling and social float.
 */

let __safariMegaMenuLoaded = false;

function tsmT(key, vars) {
    if (typeof window.t === 'function') return window.t(key, vars);
    if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
    return key;
}

function escapeNavHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function ensureI18nLoaded() {
    if (window.TSM_i18n && window.TSM_i18n.ready) return window.TSM_i18n.ready;
    return new Promise((resolve) => {
        if (document.querySelector('script[src*="/js/i18n.js"]')) {
            const wait = () => {
                if (window.TSM_i18n && window.TSM_i18n.ready) window.TSM_i18n.ready.then(resolve);
                else setTimeout(wait, 30);
            };
            wait();
            return;
        }
        const s = document.createElement('script');
        s.src = '/js/i18n.js?v=4';
        s.onload = () => {
            if (window.TSM_i18n && window.TSM_i18n.ready) window.TSM_i18n.ready.then(resolve);
            else resolve();
        };
        s.onerror = () => resolve();
        (document.head || document.documentElement).appendChild(s);
    });
}

function applyPageI18n(root) {
    if (window.TSM_i18n && typeof window.TSM_i18n.applyTranslations === 'function') {
        window.TSM_i18n.applyTranslations(root || document);
    }
}

async function loadSafariMegaMenuTours() {
    if (__safariMegaMenuLoaded) return;
    const nodes = document.querySelectorAll('.nav-mega-tours[data-category]');
    if (!nodes.length) return;
    __safariMegaMenuLoaded = true;

    const categories = [...new Set([...nodes].map((n) => n.getAttribute('data-category')).filter(Boolean))];
    const daysLabel = tsmT('common.days');
    const fromLabel = tsmT('common.from');
    const updating = tsmT('common.packagesUpdating');
    const viewCol = tsmT('common.viewCollection');

    await Promise.all(
        categories.map(async (category) => {
            const targets = document.querySelectorAll(`.nav-mega-tours[data-category="${category}"]`);
            try {
                const res = await fetch(`/api/packages?category=${encodeURIComponent(category)}&limit=4&sort=featured`);
                const json = await res.json();
                const packages = Array.isArray(json?.data) ? json.data : json?.data?.packages || [];
                const html = packages.length
                    ? packages
                          .slice(0, 4)
                          .map((p) => {
                              const days = p.duration_days ? `${p.duration_days} ${daysLabel}` : '';
                              const price = p.base_price_usd
                                  ? `${fromLabel} $${Number(p.base_price_usd).toLocaleString()}`
                                  : '';
                              const meta = [days, price].filter(Boolean).join(' · ');
                              return `<a class="nav-mega-tour" role="menuitem" href="/safaris/${encodeURIComponent(p.package_slug)}">${escapeNavHtml(p.package_name)}${meta ? `<span>${escapeNavHtml(meta)}</span>` : ''}</a>`;
                          })
                          .join('')
                    : `<span class="nav-mega-empty">${escapeNavHtml(updating)}</span>`;
                targets.forEach((el) => {
                    el.innerHTML = html;
                });
            } catch (err) {
                targets.forEach((el) => {
                    el.innerHTML = `<span class="nav-mega-empty">${escapeNavHtml(viewCol)}</span>`;
                });
            }
        })
    );
}

/* Inject Google Analytics (gtag) on all public pages — skip if already SSR-injected */
(function injectGoogleTag() {
    if (typeof document === 'undefined') return;
    try {
        const path = (window.location && window.location.pathname) || '';
        if (path.startsWith('/admin')) return;
        if (window.__TSM_GTAG_LOADED || typeof window.gtag === 'function') return;
        if (document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-ZNT5VEXJ8F"]')) {
            window.__TSM_GTAG_LOADED = true;
            return;
        }
        window.__TSM_GTAG_LOADED = true;
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-ZNT5VEXJ8F');
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZNT5VEXJ8F';
        const head = document.head || document.getElementsByTagName('head')[0];
        if (head) head.appendChild(s);
    } catch (_) { /* never block UX */ }
})();

/* Inject fluid responsive CSS immediately (all public pages) */
(function injectFluidCss() {
    if (typeof document === 'undefined') return;
    if (document.querySelector('link[href*="fluid-responsive.css"]')) return;
    const fluid = document.createElement('link');
    fluid.rel = 'stylesheet';
    fluid.href = '/css/fluid-responsive.css?v=5';
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) head.appendChild(fluid);
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(fluid));
})();

/* Zara-style header layout (all public pages) */
(function injectHeaderCss() {
    if (typeof document === 'undefined') return;
    if (document.querySelector('link[href*="/css/header.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/header.css?v=3';
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) head.appendChild(link);
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(link));
})();

/* Start loading i18n as early as possible */
ensureI18nLoaded();

document.addEventListener('DOMContentLoaded', async () => {
    const cb = '?v=' + Date.now();
    await ensureI18nLoaded();

    // Load shared SEO helpers early
    if (!document.querySelector('script[src^="/js/seo.js"]')) {
        const seo = document.createElement('script');
        seo.src = '/js/seo.js' + cb;
        seo.onload = () => { if (typeof initSEO === 'function') initSEO(); };
        document.head.appendChild(seo);
    }

    applyPageI18n(document);

    loadComponent('header', '/includes/header.html' + cb, () => {
        initHeader();
        if (window.TSM_i18n && typeof window.TSM_i18n.initSwitcher === 'function') {
            window.TSM_i18n.initSwitcher();
        }
        applyPageI18n(document.getElementById('header') || document);
    });
    loadComponent('footer', '/includes/footer.html' + cb, () => {
        initFooter();
        applyPageI18n(document.getElementById('footer') || document);
        loadChatScripts();
        initCookieNotice();
    });
    initSEO();
    trackPageView();
});

/**
 * Simple first-visit cookie / analytics notice (Privacy Policy link).
 */
function initCookieNotice() {
    try {
        if (typeof document === 'undefined') return;
        if (localStorage.getItem('tsm_cookie_ok') === '1') return;
        if (document.getElementById('tsmCookieNotice')) return;
        const path = window.location.pathname || '/';
        if (path.startsWith('/admin')) return;

        const bar = document.createElement('div');
        bar.id = 'tsmCookieNotice';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', tsmT('cookie.aria'));
        bar.style.cssText = [
            'position:fixed', 'left:1rem', 'right:1rem', 'bottom:1rem', 'z-index:9998',
            'max-width:32rem', 'margin:0 auto', 'padding:1rem 1.15rem',
            'background:#1a2a17', 'color:#f5f5f0', 'border-radius:12px',
            'box-shadow:0 8px 28px rgba(0,0,0,.25)', 'font-size:0.875rem', 'line-height:1.5',
            'display:flex', 'flex-wrap:wrap', 'gap:0.75rem', 'align-items:center', 'justify-content:space-between'
        ].join(';');
        bar.innerHTML = `
          <p style="margin:0;flex:1 1 12rem">${tsmT('cookie.html')}</p>
          <button type="button" id="tsmCookieAccept" style="flex:0 0 auto;border:0;cursor:pointer;background:#c45c26;color:#fff;font-weight:700;padding:0.55rem 1rem;border-radius:8px">${tsmT('common.ok')}</button>
        `;
        document.body.appendChild(bar);
        document.getElementById('tsmCookieAccept')?.addEventListener('click', () => {
            localStorage.setItem('tsm_cookie_ok', '1');
            bar.remove();
        });
    } catch (_) { /* non-blocking */ }
}
/**
 * First-party visitor analytics (admin CMS dashboard)
 */
function trackPageView() {
    try {
        const path = window.location.pathname || '/';
        if (path.startsWith('/admin') || path.startsWith('/api')) return;

        let sessionId = localStorage.getItem('tsm_vid');
        if (!sessionId) {
            sessionId = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem('tsm_vid', sessionId);
        }

        // Debounce duplicate hits on same path within 30s (refresh/back)
        const key = 'tsm_last_pv_' + path;
        const last = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - last < 30000) return;
        sessionStorage.setItem(key, String(Date.now()));

        const params = new URLSearchParams(window.location.search);
        const payload = {
            path,
            title: document.title || '',
            referrer: document.referrer || '',
            session_id: sessionId,
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_term: params.get('utm_term') || params.get('q') || params.get('query') || ''
        };

        const body = JSON.stringify(payload);
        fetch('/api/analytics/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
            credentials: 'same-origin'
        }).catch(() => {});
    } catch (_) { /* never block UX */ }
}

function loadChatScripts() {
    if (typeof io === 'undefined') {
        const ioScript = document.createElement('script');
        ioScript.src = '/socket.io/socket.io.js';
        
        const loadChat = () => {
            if (!document.querySelector('script[src^="/js/chat.js"]')) {
                const chatScript = document.createElement('script');
                chatScript.src = '/js/chat.js?v=' + Date.now();
                document.body.appendChild(chatScript);
            }
        };
        
        ioScript.onload = loadChat;
        ioScript.onerror = () => {
            console.error('Socket.io failed to load. Chat will run in offline mode.');
            loadChat();
        };
        
        document.body.appendChild(ioScript);
    } else {
        const chatScript = document.createElement('script');
        chatScript.src = '/js/chat.js?v=' + Date.now();
        document.body.appendChild(chatScript);
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
    // Prefer the real <header.header> — views wrap includes in <div id="header">,
    // so getElementById('header') can hit the wrapper and break .header.menu-open stacking.
    const header =
        document.getElementById('siteHeader') ||
        document.querySelector('#header header.header') ||
        document.querySelector('header.header') ||
        document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    const menuOverlay = document.getElementById('menuOverlay');
    const navLinks = mainNav
        ? mainNav.querySelectorAll('.nav-link, .nav-cta')
        : document.querySelectorAll('.nav-link');

    // Set active link based on current path
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href === currentPath || (currentPath === '/' && href === '/') || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile menu toggle
    const drawerClose = document.getElementById('drawerClose');
    
    function closeDrawer() {
        if (!mainNav) return;
        mainNav.classList.remove('active');
        menuOverlay?.classList.remove('active');
        header?.classList.remove('menu-open');
        document.body.classList.remove('nav-drawer-open');
        document.body.style.overflow = '';
        mobileToggle?.setAttribute('aria-expanded', 'false');
    }

    function openDrawer() {
        if (!mainNav) return;
        mainNav.classList.add('active');
        menuOverlay?.classList.add('active');
        header?.classList.add('menu-open');
        document.body.classList.add('nav-drawer-open');
        document.body.style.overflow = 'hidden';
        mobileToggle?.setAttribute('aria-expanded', 'true');
    }

    function toggleDrawer() {
        if (mainNav?.classList.contains('active')) closeDrawer();
        else openDrawer();
    }

    if (mobileToggle && mainNav && menuOverlay) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.setAttribute('aria-controls', 'mainNav');
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDrawer();
        });
        menuOverlay.addEventListener('click', (e) => {
            e.preventDefault();
            closeDrawer();
        });
        if (drawerClose) drawerClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
        });

        // Close when a nav link / CTA / mega tour link is tapped
        mainNav.querySelectorAll('a.nav-link, a.nav-cta, a.nav-dropdown-item, a.nav-mega-heading, a.nav-mega-tour, a.nav-mega-all').forEach((link) => {
            link.addEventListener('click', () => closeDrawer());
        });

        // Safaris accordion (mobile) / click toggle (desktop)
        mainNav.querySelectorAll('.nav-dropdown-toggle').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = btn.closest('.nav-dropdown');
                const open = parent?.classList.contains('open');
                document.querySelectorAll('.nav-dropdown').forEach((d) => {
                    d.classList.remove('open');
                    d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                });
                if (!open) {
                    parent?.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                    document.getElementById('header')?.classList.add('mega-open');
                    document.getElementById('siteHeader')?.classList.add('mega-open');
                    loadSafariMegaMenuTours();
                } else {
                    document.getElementById('header')?.classList.remove('mega-open');
                    document.getElementById('siteHeader')?.classList.remove('mega-open');
                }
            });
        });

        // Prefetch mega-menu tours on desktop hover intent; solidify header for contrast
        const safarisDropdown = document.getElementById('safarisNavDropdown');
        if (safarisDropdown) {
            safarisDropdown.addEventListener('mouseenter', () => {
                document.getElementById('header')?.classList.add('mega-open');
                document.getElementById('siteHeader')?.classList.add('mega-open');
                loadSafariMegaMenuTours();
            });
            safarisDropdown.addEventListener('mouseleave', () => {
                if (!safarisDropdown.classList.contains('open')) {
                    document.getElementById('header')?.classList.remove('mega-open');
                    document.getElementById('siteHeader')?.classList.remove('mega-open');
                }
            });
        }
        loadSafariMegaMenuTours();

        // Keep submenu closed unless hovered/toggled — same on every page
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-dropdown')) return;
            document.querySelectorAll('.nav-dropdown.open').forEach((d) => {
                d.classList.remove('open');
                d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            });
            document.getElementById('header')?.classList.remove('mega-open');
            document.getElementById('siteHeader')?.classList.remove('mega-open');
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.nav-dropdown.open').forEach((d) => {
                    d.classList.remove('open');
                    d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                });
                if (mainNav.classList.contains('active')) closeDrawer();
            }
        });

        // If resized to desktop, force-close drawer + dropdowns
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeDrawer();
                mainNav.querySelectorAll('.nav-dropdown').forEach((d) => {
                    d.classList.remove('open');
                    d.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    // Scroll effect - Navbar color change
    const handleScroll = () => {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    const searchToggle = document.getElementById('headerSearchToggle');
    const searchPanel = document.getElementById('headerSearchPanel');
    const searchInput = document.getElementById('headerSearchInput');
    if (searchToggle && searchPanel) {
        searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const open = searchPanel.hasAttribute('hidden');
            if (open) {
                searchPanel.removeAttribute('hidden');
                searchToggle.setAttribute('aria-expanded', 'true');
                searchInput?.focus();
            } else {
                searchPanel.setAttribute('hidden', '');
                searchToggle.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !searchPanel.hasAttribute('hidden')) {
                searchPanel.setAttribute('hidden', '');
                searchToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
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

    // Apply CMS site settings to header/footer/WhatsApp
    applySiteSettings();

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
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + tsmT('common.subscribing');
                
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast(tsmT('toast.newsletterSuccessTitle'), tsmT('toast.newsletterSuccessBody'), 'success');
                    newsletterForm.reset();
                } else {
                    showToast(tsmT('toast.errorTitle'), result.message || tsmT('toast.newsletterFail'), 'error');
                }
            } catch (error) {
                showToast(tsmT('toast.errorTitle'), tsmT('toast.genericError'), 'error');
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
 * Loads public CMS settings and applies them to contact/social/WhatsApp UI.
 */
async function applySiteSettings() {
    try {
        const response = await fetch('/api/public/settings');
        if (!response.ok) return;
        const { data } = await response.json();
        if (!data) return;

        const get = (...keys) => {
            for (const k of keys) {
                if (data[k] != null && data[k] !== '') return data[k];
            }
            return null;
        };

        const email = get('contact.email', 'contact_email', 'email');
        const phone = get('contact.phone', 'contact.whatsapp', 'contact_phone', 'phone');
        const address = get('contact.address', 'company.address', 'address');
        const company = get('company.name', 'company_name');
        const facebook = get('social.facebook', 'facebook');
        const instagram = get('social.instagram', 'instagram');
        const twitter = get('social.twitter', 'twitter');
        const youtube = get('social.youtube', 'youtube');

        const digits = phone ? String(phone).replace(/[^\d]/g, '') : null;

        // Footer / header mailto & tel
        document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
            if (email) {
                a.href = `mailto:${email}`;
                if (a.textContent.includes('@') || a.closest('.footer-contact-item')) a.textContent = email;
            }
        });

        const headerPhone = document.getElementById('headerPhoneDisplay');
        if (headerPhone && phone) headerPhone.textContent = phone;

        document.querySelectorAll('a[href*="wa.me"], a.social-float-whatsapp').forEach(a => {
            if (digits) {
                const existingText = (() => {
                    try {
                        const u = new URL(a.href);
                        return u.searchParams.get('text') || '';
                    } catch { return ''; }
                })();
                const defaultMsg = existingText || "Hi Tanzania Safari Magic, I'm interested in booking a custom safari. Please send me a free quote.";
                a.href = `https://wa.me/${digits}?text=${encodeURIComponent(defaultMsg)}`;
                if (a.closest('.footer-contact-item') && phone) a.textContent = phone;
            }
        });

        if (address) {
            document.querySelectorAll('.footer-contact-item').forEach(item => {
                if (item.querySelector('.fa-map-marker-alt, .fa-location-dot')) {
                    const span = item.querySelector('span');
                    if (span) span.textContent = address;
                }
            });
        }

        if (company) {
            document.querySelectorAll('.footer-logo img, .logo img').forEach(img => {
                img.alt = company;
            });
        }

        const setSocial = (network, url) => {
            if (!url) return;
            document.querySelectorAll(`.social-link .fa-${network}, .social-link .fab.fa-${network}`).forEach(icon => {
                const a = icon.closest('a');
                if (a) a.href = url;
            });
        };
        setSocial('facebook-f', facebook);
        setSocial('facebook', facebook);
        setSocial('instagram', instagram);
        setSocial('twitter', twitter);
        setSocial('youtube', youtube);

        window.__siteSettings = data;
    } catch (err) {
        console.warn('Could not apply site settings:', err.message);
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
 * Initializes and injects Open Graph and Twitter SEO tags dynamically based on the page content.
 */
function initSEO() {
    // Ensure SEO + corporate UI stylesheets are present
    ['/css/seo.css', '/css/corporate-ui.css'].forEach((href) => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });

    if (window.SafariSEO) {
        SafariSEO.initGlobalSchemas();
        SafariSEO.setCanonical();
        SafariSEO.setOgImage(document.querySelector('meta[property="og:image"]')?.content);
        return;
    }

    // Fallback OG Tags when seo.js is not loaded
    const ensure = (attr, key, content) => {
        if (!content) return;
        if (document.querySelector(`meta[${attr}="${key}"]`)) return;
        const el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('content', content);
        document.head.appendChild(el);
    };

    const descMeta = document.querySelector('meta[name="description"]');
    ensure('property', 'og:title', document.title);
    ensure('property', 'og:description', descMeta ? descMeta.getAttribute('content') : 'Experience authentic Tanzania safari tours with expert local guides.');
    ensure('property', 'og:url', window.location.href.split('?')[0]);
    ensure('property', 'og:type', 'website');
    ensure('property', 'og:image', 'https://tanzaniasafarimagic.com/images/hero.jpg');
    ensure('property', 'og:site_name', 'Tanzania Safari Magic');
    ensure('name', 'twitter:card', 'summary_large_image');
    ensure('name', 'twitter:title', document.title);
    ensure('name', 'twitter:description', descMeta ? descMeta.getAttribute('content') : 'Experience authentic Tanzania safari tours.');
    ensure('name', 'twitter:image', 'https://tanzaniasafarimagic.com/images/hero.jpg');
}
