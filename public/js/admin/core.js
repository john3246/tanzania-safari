// ── Configuration & State ─────────────────────────────────────
const token = localStorage.getItem('adminToken');
const API_BASE = '/api/admin';

if (!token) { window.location.href = '/admin/login'; }

// ── Application Initialization ───────────────────────────────
async function initAdminApp() {
    try {
        // Load layout partials
        const [sidebarRes, headerRes, modalsRes] = await Promise.all([
            fetch('/admin-partials/sidebar.html'),
            fetch('/admin-partials/header.html'),
            fetch('/admin-partials/modals.html')
        ]);
        
        const sidebarHtml = await sidebarRes.text();
        const headerHtml = await headerRes.text();
        const modalsHtml = await modalsRes.text();

        // Inject sidebar before adminMain
        const adminMain = document.getElementById('adminMain');
        adminMain.insertAdjacentHTML('beforebegin', sidebarHtml);
        
        // Inject header inside adminMain
        adminMain.insertAdjacentHTML('afterbegin', headerHtml);
        
        // Inject modals at the end of body
        document.body.insertAdjacentHTML('beforeend', modalsHtml);

        // Setup routing (load dashboard by default)
        const initialPage = window.location.hash.replace('#', '') || window.location.pathname.split('/').pop();
        const validPages = ['dashboard', 'analytics', 'packages', 'categories', 'bookings', 'booking-details', 'enquiries', 'settings', 'destinations', 'blog', 'reviews', 'users', 'images', 'communications', 'system-logs', 'edit-tour', 'edit-destination', 'customers', 'chat', 'group-safaris'];
        const pageToLoad = validPages.includes(initialPage) ? initialPage : 'dashboard';
        
        await navigate(pageToLoad, false); // pass false so we don't push state on initial load
        
        // Setup browser history
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                navigate(e.state.page, false);
            } else {
                navigate('dashboard', false);
            }
        });

        // Setup session timeout (5 minutes = 300000ms)
        let sessionTimeout;
        const resetSessionTimeout = () => {
            clearTimeout(sessionTimeout);
            sessionTimeout = setTimeout(() => {
                showToast('Session expired due to inactivity', 'warning');
                localStorage.clear();
                window.location.href = '/admin/login';
            }, 300000);
        };
        // Listen to activity to reset timeout
        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
            document.addEventListener(evt, resetSessionTimeout, { passive: true });
        });
        resetSessionTimeout(); // initial start
        
        // Setup global event listeners
        document.addEventListener('keydown', handleKeyboardShortcuts);
        setupAccessibility();
        restoreSidebarState();
        restoreDarkModeState();

    } catch (error) {
        console.error('Failed to initialize admin app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initAdminApp);

// ── UI Components ─────────────────────────────────────────────
function showToast(message, type = 'success', title = null) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    if (!title) title = type === 'success' ? 'Success' : 'Error';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(24px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function setLoading(btn, isLoading, originalHtml) {
    if (isLoading) {
        btn.setAttribute('data-original', btn.innerHTML);
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        btn.innerHTML = btn.getAttribute('data-original') || originalHtml;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

// ── Navigation Logic ──────────────────────────────────────────
async function navigate(page, pushState = true) {
    // Check if partial is already loaded
    let targetPage = document.getElementById(`page-${page}`);
    
    if (!targetPage) {
        try {
            const res = await fetch(`/admin-partials/pages/${page}.html?v=${new Date().getTime()}`);
            if (res.ok) {
                const html = await res.text();
                // Find where to inject it. We should inject it into the main container
                const container = document.querySelector('main');
                container.insertAdjacentHTML('beforeend', html);
                targetPage = document.getElementById(`page-${page}`);
            } else {
                console.error(`Failed to load page: ${page}`);
                showToast(`Failed to load ${page}`, 'error');
                return;
            }
        } catch (e) {
            console.error(e);
            return;
        }
    }
    
    if (pushState) {
        window.history.pushState({ page }, '', '/admin/' + page);
    }

    // UI Updates
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item, .nav-link[data-page]').forEach(n => n.classList.remove('active'));
    
    // Show target page
    if (targetPage) {
        targetPage.classList.add('active', 'animate-fade-in');
        // Remove animation class after it plays so it can play again
        setTimeout(() => targetPage.classList.remove('animate-fade-in'), 300);
    }
    
    const targetNav = document.querySelector(`.nav-item[data-page="${page}"], .nav-link[data-page="${page}"]`);
    if (targetNav) targetNav.classList.add('active');
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = targetNav?.querySelector('span')?.textContent || page;
    
    // Update breadcrumb
    updateBreadcrumb(page);
    
    // Close sidebar on mobile
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarBackdrop')?.classList.remove('active');

    // Data Loading
    switch(page) {
        case 'dashboard': loadDashboard(); break;
        case 'analytics': if (window.loadAnalytics) { window.loadAnalytics(); } else { setTimeout(() => window.loadAnalytics?.(), 100); } break;
        case 'packages': loadPackages(); break;
        case 'destinations': loadDestinations(); break;
        case 'bookings': loadBookings(); break;
        case 'booking-details': loadBookingDetails(); break;
        case 'enquiries': loadEnquiries(); break;
        case 'users': loadUsers(); break;
        case 'blog': loadBlogs(); break;
        case 'reviews': loadReviews(); break;
        case 'group-safaris': if (window.loadGroupSafaris) { window.loadGroupSafaris(); } else { setTimeout(() => window.loadGroupSafaris?.(), 100); } break;
        case 'categories': loadCategories(); break;
        case 'images': loadImages(); break;
        case 'settings': loadProfile(); loadSettings(); break;
        case 'customers': if (window.loadCustomers) { window.loadCustomers(); } else { setTimeout(() => window.loadCustomers?.(), 100); } break;
        case 'chat': if (window.initChatPage) { window.initChatPage(); } else { setTimeout(() => window.initChatPage?.(), 100); } break;
        case 'communications': if (window.loadCommunications) { window.loadCommunications(); } else { setTimeout(() => window.loadCommunications?.(), 100); } break;
        case 'system-logs': if (window.loadSystemLogs) { window.loadSystemLogs(); } else { setTimeout(() => window.loadSystemLogs?.(), 100); } break;
        case 'edit-tour': if (window.initEditTourPage) { window.initEditTourPage(); } else { setTimeout(() => window.initEditTourPage?.(), 100); } setTimeout(() => window.MediaPicker?.enhanceAll(), 200); break;
        case 'edit-destination': if (window.initEditDestPage) { window.initEditDestPage(); } else { setTimeout(() => window.initEditDestPage?.(), 100); } setTimeout(() => window.MediaPicker?.enhanceAll(), 200); break;
        case 'packages':
        case 'destinations':
        case 'blog':
            setTimeout(() => window.MediaPicker?.enhanceAll(), 300);
            break;
    }

    // Enhance any visible image URL fields (modals + pages)
    setTimeout(() => window.MediaPicker?.enhanceAll(), 150);
}

// ── Breadcrumb Logic ──────────────────────────────────────────
function updateBreadcrumb(page) {
    const breadcrumbContainer = document.getElementById('breadcrumbContainer');
    if (!breadcrumbContainer) return;
    
    const pageNames = {
        'dashboard': 'Dashboard',
        'analytics': 'Website Analytics',
        'packages': 'Safari Packages',
        'categories': 'Categories',
        'destinations': 'Destinations',
        'bookings': 'Bookings',
        'booking-details': 'Booking Details',
        'enquiries': 'Inquiries',
        'blog': 'Blog Posts',
        'reviews': 'Reviews',
        'group-safaris': 'Group Safaris',
        'images': 'Media Library',
        'users': 'Team Accounts',
        'settings': 'Settings',
        'customers': 'Customers',
        'chat': 'Live Chat',
        'communications': 'Email Campaigns',
        'system-logs': 'System Logs'
    };
    
    const categoryMap = {
        'dashboard': 'Overview',
        'analytics': 'Overview',
        'packages': 'Inventory',
        'group-safaris': 'Inventory',
        'categories': 'Inventory',
        'destinations': 'Inventory',
        'bookings': 'Overview',
        'booking-details': 'Overview',
        'enquiries': 'Overview',
        'customers': 'Overview',
        'chat': 'Overview',
        'communications': 'System',
        'system-logs': 'System',
        'blog': 'Content',
        'reviews': 'Content',
        'images': 'Content',
        'users': 'System',
        'settings': 'System'
    };
    
    const category = categoryMap[page] || 'System';
    const pageName = pageNames[page] || page;
    
    breadcrumbContainer.innerHTML = `
        <div class="breadcrumb">
            <div class="breadcrumb-item">
                <a href="#" onclick="navigate('dashboard')">Dashboard</a>
            </div>
            <div class="breadcrumb-item">
                <a href="#">${category}</a>
            </div>
            <div class="breadcrumb-item active">
                ${pageName}
            </div>
        </div>
    `;
}

// ── Sidebar Collapse Logic ────────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

function restoreSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebar = document.getElementById('sidebar');
    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
    }
}

// ── Dark Mode Logic ────────────────────────────────────────────
function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
}

function restoreDarkModeState() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    const html = document.documentElement;
    if (isDark) {
        html.classList.add('dark');
    }
}

// ── Advanced Search, Filters, and Bulk Actions Logic ─────────────
const moduleState = {
    packages: { page: 1, perPage: 10, search: '', filters: {}, selected: [], allData: [] },
    categories: { page: 1, perPage: 10, search: '', filters: {}, selected: [], allData: [] },
    destinations: { page: 1, perPage: 10, search: '', filters: {}, selected: [], allData: [] },
    bookings: { page: 1, perPage: 10, search: '', filters: {}, selected: [], allData: [] },
    users: { page: 1, perPage: 10, search: '', filters: {}, selected: [], allData: [] }
};

let searchTimeout = null;

function debounceSearch(module, value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        moduleState[module].search = value;
        moduleState[module].page = 1;
        applyFilters(module);
    }, 300);
}

function applyFilters(module) {
    const statusFilter = document.getElementById(`${module}StatusFilter`)?.value;
    const categoryFilter = document.getElementById(`${module}CategoryFilter`)?.value;
    
    moduleState[module].filters = {
        status: statusFilter,
        category: categoryFilter
    };
    
    renderFilteredData(module);
}

function renderFilteredData(module) {
    const state = moduleState[module];
    let filtered = [...state.allData];
    
    // Apply search
    if (state.search) {
        const searchLower = state.search.toLowerCase();
        filtered = filtered.filter(item => 
            item.name?.toLowerCase().includes(searchLower) ||
            item.title?.toLowerCase().includes(searchLower) ||
            item.package_name?.toLowerCase().includes(searchLower)
        );
    }
    
    // Apply filters
    if (state.filters.status) {
        filtered = filtered.filter(item => item.status === state.filters.status || item.is_active === (state.filters.status === 'active'));
    }
    
    if (state.filters.category) {
        filtered = filtered.filter(item => item.category_id === state.filters.category);
    }
    
    // Apply pagination
    const start = (state.page - 1) * state.perPage;
    const end = start + state.perPage;
    const paginated = filtered.slice(start, end);
    
    // Update UI
    updateModuleTable(module, paginated);
    updatePaginationInfo(module, filtered.length, start + 1, Math.min(end, filtered.length));
}

function toggleSelectAll(module) {
    const checkbox = document.getElementById(`${module}SelectAll`);
    const checkboxes = document.querySelectorAll(`.${module}-row-checkbox`);
    
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        const id = cb.value;
        if (checkbox.checked) {
            if (!moduleState[module].selected.includes(id)) {
                moduleState[module].selected.push(id);
            }
        } else {
            moduleState[module].selected = moduleState[module].selected.filter(item => item !== id);
        }
    });
    
    updateBulkActionsBar(module);
}

function updateBulkActionsBar(module) {
    const bar = document.getElementById(`${module}BulkActions`);
    const count = document.getElementById(`${module}SelectedCount`);
    
    if (moduleState[module].selected.length > 0) {
        bar.classList.remove('hidden');
        count.textContent = moduleState[module].selected.length;
    } else {
        bar.classList.add('hidden');
    }
}

async function bulkAction(module, action) {
    const selected = moduleState[module].selected;
    if (selected.length === 0) return;
    
    if (!confirm(`Are you sure you want to ${action} ${selected.length} items?`)) return;
    
    try {
        // For now, just show a toast - in production, this would call the API
        showToast(`${action} ${selected.length} items`, 'success');
        
        // Clear selection
        moduleState[module].selected = [];
        document.getElementById(`${module}SelectAll`).checked = false;
        updateBulkActionsBar(module);
        
        // Reload data
        if (module === 'packages') loadPackages();
        else if (module === 'categories') loadCategories();
        else if (module === 'destinations') loadDestinations();
        else if (module === 'users') loadUsers();
    } catch (e) {
        showToast('Bulk action failed', 'error');
    }
}

function changePage(module, direction) {
    const state = moduleState[module];
    if (direction === 'prev' && state.page > 1) {
        state.page--;
    } else if (direction === 'next') {
        state.page++;
    }
    renderFilteredData(module);
}

function updatePaginationInfo(module, total, start, end) {
    const info = document.getElementById(`${module}PaginationInfo`);
    if (info) {
        info.textContent = `Showing ${start}-${end} of ${total}`;
    }
}

function updateModuleTable(module, data) {
    const tbody = document.getElementById(`${module === 'packages' ? 'pkg' : module}Body`);
    if (!tbody) return;
    
    // This will be handled by the existing load functions
    // Just update the state for now
}

// ── Keyboard Shortcuts Logic ────────────────────────────────────
const keyboardShortcuts = {
    'g+d': () => navigate('dashboard'),
    'g+p': () => navigate('packages'),
    'g+b': () => navigate('bookings'),
    'g+u': () => navigate('users'),
    'g+s': () => navigate('settings'),
    'Escape': () => {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    },
    '/': (e) => {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
        if (searchInput) {
            searchInput.focus();
        }
    },
    'Cmd+k': (e) => {
        e.preventDefault();
        // Open command palette (placeholder for future implementation)
        showToast('Command palette coming soon!', 'success');
    },
    'Ctrl+k': (e) => {
        e.preventDefault();
        // Open command palette (placeholder for future implementation)
        showToast('Command palette coming soon!', 'success');
    }
};

function handleKeyboardShortcuts(e) {
    const key = e.key;
    const isModKey = e.metaKey || e.ctrlKey;
    
    // Handle modifier key combinations
    if (isModKey) {
        const combo = (e.metaKey ? 'Cmd+' : 'Ctrl+') + key.toLowerCase();
        if (keyboardShortcuts[combo]) {
            keyboardShortcuts[combo](e);
            return;
        }
    }
    
    // Handle single key shortcuts
    if (keyboardShortcuts[key]) {
        keyboardShortcuts[key](e);
    }
    
    // Handle g + key combinations
    if (key === 'g') {
        window.gKeyPressed = true;
        setTimeout(() => window.gKeyPressed = false, 500);
    }
    
    if (window.gKeyPressed && key !== 'g') {
        const combo = 'g+' + key.toLowerCase();
        if (keyboardShortcuts[combo]) {
            keyboardShortcuts[combo](e);
            window.gKeyPressed = false;
        }
    }
}

// ── Accessibility Improvements ────────────────────────────────────
function setupAccessibility() {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('button').forEach(btn => {
        if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
            const icon = btn.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                if (iconClass.includes('ph-x')) btn.setAttribute('aria-label', 'Close');
                else if (iconClass.includes('ph-list')) btn.setAttribute('aria-label', 'Menu');
                else if (iconClass.includes('ph-caret-left')) btn.setAttribute('aria-label', 'Collapse sidebar');
                else if (iconClass.includes('ph-moon')) btn.setAttribute('aria-label', 'Enable dark mode');
                else if (iconClass.includes('ph-sun')) btn.setAttribute('aria-label', 'Disable dark mode');
                else if (iconClass.includes('ph-plus')) btn.setAttribute('aria-label', 'Add');
                else if (iconClass.includes('ph-trash')) btn.setAttribute('aria-label', 'Delete');
                else if (iconClass.includes('ph-pencil')) btn.setAttribute('aria-label', 'Edit');
            }
        }
    });
    
    // Add role="button" to clickable divs
    document.querySelectorAll('[onclick]').forEach(el => {
        if (!el.getAttribute('role')) {
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        }
    });
    
    // Improve focus management for modals
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
            }
        });
    });
}

// ── Initialization ────────────────────────────────────────────
window.navigate = navigate;
window.closeModal = closeModal;
// End of assignments
window.toggleSidebar = toggleSidebar;
window.toggleDarkMode = toggleDarkMode;
window.debounceSearch = debounceSearch;
window.applyFilters = applyFilters;
window.toggleSelectAll = toggleSelectAll;
window.changePage = changePage;

document.addEventListener('DOMContentLoaded', () => {
    // Restore sidebar and dark mode states
    restoreSidebarState();
    restoreDarkModeState();
    
    // Setup accessibility improvements
    setupAccessibility();
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Navigation event listeners
    document.querySelectorAll('.nav-item[data-page], .nav-link[data-page]').forEach(item => {
        item.addEventListener('click', e => { e.preventDefault(); navigate(item.getAttribute('data-page')); });
    });
    
    // Mobile menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', () => { 
        document.getElementById('sidebar')?.classList.add('open'); 
        document.getElementById('sidebarBackdrop')?.classList.add('active');
    });
    
    const closeMobileMenu = () => {
        document.getElementById('sidebar')?.classList.remove('open'); 
        document.getElementById('sidebarBackdrop')?.classList.remove('active');
    };
    
    document.getElementById('sidebarClose')?.addEventListener('click', closeMobileMenu);
    document.getElementById('sidebarBackdrop')?.addEventListener('click', closeMobileMenu);
    
    // Sidebar collapse toggle
    document.getElementById('sidebarCollapse')?.addEventListener('click', toggleSidebar);
    
    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);

    // Close sidebar on mobile after navigation
    document.querySelectorAll('.nav-item[data-page], .nav-link[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar')?.classList.remove('open');
                document.getElementById('sidebarBackdrop')?.classList.remove('active');
            }
        });
    });
    
    // Set current date
    const d = new Date();
    const de = document.getElementById('headerDate');
    if (de) de.innerHTML = `<i class="far fa-calendar"></i> ${d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}`;
    
    // Logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); localStorage.clear(); window.location.href = '/admin/login'; });
});
