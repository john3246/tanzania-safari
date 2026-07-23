/**
 * Layout Loader - Dynamically injects shared components (Header, Footer)
 * and handles global UI interactions like navbar scrolling and social float.
 */

document.addEventListener('DOMContentLoaded', () => {
    const cb = '?v=' + Date.now();
    loadComponent('header', '/includes/header.html' + cb, initHeader);
    loadComponent('footer', '/includes/footer.html' + cb, () => {
        initFooter();
        loadChatScripts();
    });
    initSEO();
});

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
 * Initializes and injects Open Graph and Twitter SEO tags dynamically based on the page content.
 */
function initSEO() {
    // Basic OG Tags
    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', document.title);
    
    const ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    const descMeta = document.querySelector('meta[name="description"]');
    ogDesc.setAttribute('content', descMeta ? descMeta.getAttribute('content') : 'Experience authentic Tanzania safari tours with expert local guides.');

    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.setAttribute('content', window.location.href);

    const ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.setAttribute('content', 'website');

    // Twitter Card Tags
    const twCard = document.createElement('meta');
    twCard.setAttribute('name', 'twitter:card');
    twCard.setAttribute('content', 'summary_large_image');

    const twTitle = document.createElement('meta');
    twTitle.setAttribute('name', 'twitter:title');
    twTitle.setAttribute('content', document.title);

    const twDesc = document.createElement('meta');
    twDesc.setAttribute('name', 'twitter:description');
    twDesc.setAttribute('content', descMeta ? descMeta.getAttribute('content') : 'Experience authentic Tanzania safari tours.');

    document.head.append(ogTitle, ogDesc, ogUrl, ogType, twCard, twTitle, twDesc);
}
