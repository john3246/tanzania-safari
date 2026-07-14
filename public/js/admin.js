/**
 * Tanzania Safari - Admin Dashboard JS
 * Modular, Modern, and Reliable - FULLY INTERACTIVE
 */

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
        const initialPage = window.location.pathname.split('/').pop();
        const validPages = ['dashboard', 'packages', 'categories', 'bookings', 'enquiries', 'settings', 'destinations', 'blog', 'reviews', 'users', 'images', 'communications'];
        const pageToLoad = validPages.includes(initialPage) ? initialPage : 'dashboard';
        
        await navigate(pageToLoad);
        
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

// ── API Helpers ──────────────────────────────────────────────
async function apiRequest(method, path, body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const response = await fetch(API_BASE + path, options);
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/admin/login';
            return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'API request failed');
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

async function apiUpload(formData) {
    try {
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Upload failed');
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

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
    }, 2000);
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
async function navigate(page) {
    // Check if partial is already loaded
    let targetPage = document.getElementById(`page-${page}`);
    
    if (!targetPage) {
        try {
            const res = await fetch(`/admin-partials/pages/${page}.html`);
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

    // UI Updates
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Show target page
    if (targetPage) {
        targetPage.classList.add('active', 'animate-fade-in');
        // Remove animation class after it plays so it can play again
        setTimeout(() => targetPage.classList.remove('animate-fade-in'), 300);
    }
    
    const targetNav = document.querySelector(`.nav-item[data-page="${page}"]`);
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
        case 'packages': loadPackages(); break;
        case 'destinations': loadDestinations(); break;
        case 'bookings': loadBookings(); break;
        case 'enquiries': loadEnquiries(); break;
        case 'users': loadUsers(); break;
        case 'blog': loadBlogs(); break;
        case 'reviews': loadReviews(); break;
        case 'categories': loadCategories(); break;
        case 'images': loadImages(); break;
        case 'settings': loadSettings(); loadProfile(); break;
    }
}

// ── Breadcrumb Logic ──────────────────────────────────────────
function updateBreadcrumb(page) {
    const breadcrumbContainer = document.getElementById('breadcrumbContainer');
    if (!breadcrumbContainer) return;
    
    const pageNames = {
        'dashboard': 'Dashboard',
        'packages': 'Safari Packages',
        'categories': 'Categories',
        'destinations': 'Destinations',
        'bookings': 'Bookings',
        'enquiries': 'Inquiries',
        'blog': 'Blog Posts',
        'reviews': 'Reviews',
        'images': 'Media Library',
        'users': 'Team Accounts',
        'settings': 'Settings'
    };
    
    const categoryMap = {
        'dashboard': 'Overview',
        'packages': 'Inventory',
        'categories': 'Inventory',
        'destinations': 'Inventory',
        'bookings': 'Overview',
        'enquiries': 'Overview',
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

// ── Revenue Chart Logic ────────────────────────────────────────
function renderRevenueChart() {
    const chartContainer = document.getElementById('revenueChart');
    const labelsContainer = document.getElementById('revenueChartLabels');
    if (!chartContainer || !labelsContainer) return;

    // Sample data - in production, this would come from the API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const revenueData = [12000, 15000, 18000, 22000, 19000, 25000, 28000, 32000, 29000, 35000, 38000, 42000];
    const bookingData = [8, 12, 15, 18, 14, 20, 22, 25, 21, 28, 30, 35];

    // Get last 6 months
    const last6Months = [];
    const last6Revenue = [];
    const last6Bookings = [];

    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        last6Months.push(months[monthIndex]);
        last6Revenue.push(revenueData[monthIndex]);
        last6Bookings.push(bookingData[monthIndex]);
    }

    const maxRevenue = Math.max(...last6Revenue);
    const maxBookings = Math.max(...last6Bookings);

    // Render bars
    chartContainer.innerHTML = last6Months.map((month, i) => {
        const revenueHeight = (last6Revenue[i] / maxRevenue) * 100;
        const bookingsHeight = (last6Bookings[i] / maxBookings) * 100;
        
        return `
            <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full flex items-end gap-1 h-full">
                    <div class="flex-1 bg-primary-500 rounded-t transition-all duration-500" style="height: ${revenueHeight}%"></div>
                    <div class="flex-1 bg-slate-300 rounded-t transition-all duration-500" style="height: ${bookingsHeight}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // Render labels
    labelsContainer.innerHTML = last6Months.map(month => `<span class="flex-1 text-center">${month}</span>`).join('');
}

// ── Dashboard ─────────────────────────────────────────────────
async function loadDashboard() {
    try {
        const res = await apiRequest('GET', '/stats');
        if (!res || !res.data) return;
        const stats = res.data;
        if (document.getElementById('s-packages')) document.getElementById('s-packages').textContent = stats.total_packages || 0;
        if (document.getElementById('s-destinations')) document.getElementById('s-destinations').textContent = stats.total_destinations || 0;
        if (document.getElementById('s-bookings')) document.getElementById('s-bookings').textContent = stats.total_bookings || 0;
        if (document.getElementById('s-enquiries')) document.getElementById('s-enquiries').textContent = stats.total_enquiries || 0;

        // Render revenue chart
        renderRevenueChart();

        // Load Activity
        loadRecentActivity();
    } catch (e) {}
}

async function loadRecentActivity() {
    try {
        // Bookings
        const bRes = await apiRequest('GET', '/bookings');
        const bBody = document.getElementById('dashBookings');
        if (bBody) bBody.innerHTML = (bRes.data || []).slice(0, 5).map(b => `
            <tr>
                <td>${b.full_name}</td>
                <td><span class="status-badge status-${(b.status_name || 'pending').toLowerCase()}">${b.status_name || 'Pending'}</span></td>
                <td>$${Number(b.total_price_usd).toLocaleString()}</td>
            </tr>`).join('') || '<tr><td colspan="3">No bookings</td></tr>';

        // Enquiries
        const eRes = await apiRequest('GET', '/enquiries');
        const eBody = document.getElementById('dashEnquiries');
        if (eBody) eBody.innerHTML = (eRes.data || []).slice(0, 5).map(e => `
            <tr>
                <td>${e.full_name}</td>
                <td>${e.enquiry_type || 'General'}</td>
                <td>${new Date(e.created_at).toLocaleDateString()}</td>
            </tr>`).join('') || '<tr><td colspan="3">No enquiries</td></tr>';

        // Reviews
        const rRes = await apiRequest('GET', '/reviews');
        const rBody = document.getElementById('dashReviews');
        if (rBody) rBody.innerHTML = (rRes.data || []).slice(0, 5).map(r => `
            <tr>
                <td>${r.full_name}</td>
                <td>${r.rating} / 5</td>
                <td><span class="status-badge status-${r.is_approved ? 'active' : 'pending'}">${r.is_approved ? 'Appr.' : 'Pend.'}</span></td>
            </tr>`).join('') || '<tr><td colspan="3">No reviews</td></tr>';

        // Media
        const mRes = await fetch('/api/images', { headers: { 'Authorization': `Bearer ${token}` } });
        const mData = await mRes.json();
        const mGrid = document.getElementById('dashMedia');
        if (mGrid) mGrid.innerHTML = (mData.data || []).slice(0, 4).map(img => `
            <img src="${img.path}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:4px">`).join('') || 'No media';

    } catch (e) {}
}

// ── Packages ──────────────────────────────────────────────────
let packagesList = [];
async function loadPackages() {
    const body = document.getElementById('pkgBody');
    if (!body) return;
    if (packagesList.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Initializing Packages...</td></tr>';
    }
    try {
        const res = await apiRequest('GET', '/packages');
        packagesList = res.data || [];
        renderPackages();
    } catch (e) {}
}

function renderPackages() {
    const body = document.getElementById('pkgBody');
    if (!body) return;
    body.innerHTML = packagesList.map(p => `
        <tr>
            <td data-label="Package"><strong>${p.package_name}</strong></td>
            <td data-label="Category">${p.category_name || '—'}</td>
            <td data-label="Price">$${Number(p.base_price_usd).toLocaleString()}</td>
            <td data-label="Duration">${p.duration_days} Days</td>
            <td data-label="Status"><span class="status-badge status-${p.is_active ? 'active' : 'inactive'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
            <td data-label="Actions">
                <div style="display:flex; gap:6px">
                    <button class="btn btn-icon" onclick="openPackageModal('${p.package_id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-icon" onclick="deletePackage('${p.package_id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center">No packages found.</td></tr>';
}

function openPackageModal(id = null) {
    const form = document.getElementById('pkgForm');
    if (!form) return;
    form.reset();
    document.getElementById('pkgId').value = '';
    document.getElementById('pkgModalTitle').textContent = id ? 'Edit Package' : 'New Package';
    
    // Reset Tabs
    switchPkgTab('general');
    document.getElementById('itineraryContainer').innerHTML = '';
    document.getElementById('locationsContainer').innerHTML = '';

    if (id) {
        const p = packagesList.find(x => x.package_id == id);
        if (p) {
            document.getElementById('pkgId').value = p.package_id;
            Object.entries(p).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) {
                    if (el.type === 'checkbox') el.checked = !!v;
                    else el.value = v || '';
                }
            });
            if (p.image_urls) form.querySelector('[name="image_urls_csv"]').value = p.image_urls.join(', ');
            if (p.included_features) form.querySelector('[name="included_features_text"]').value = p.included_features.join('\n');
            if (p.excluded_features) form.querySelector('[name="excluded_features_text"]').value = p.excluded_features.join('\n');
            
            // Load sub-data
            loadPackageSubData(id);
        }
    }
    loadCategorySelect(id);
    document.getElementById('pkgModal').classList.add('active');
}

async function loadCategorySelect(packageId) {
    try {
        const res = await apiRequest('GET', '/categories');
        const select = document.getElementById('pkgCategorySelect');
        if (select && res.data) {
            select.innerHTML = '<option value="">Select Category</option>' + 
                res.data.map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join('');
            if (packageId) {
                const p = packagesList.find(x => x.package_id == packageId);
                if (p?.category_id) select.value = p.category_id;
            }
        }
    } catch (e) {}
}

async function loadPackageSubData(id) {
    try {
        const [itin, dests] = await Promise.all([
            apiRequest('GET', `/packages/${id}/itinerary`),
            apiRequest('GET', `/packages/${id}/destinations`)
        ]);
        
        if (itin.data) itin.data.forEach(day => addItineraryDay(day));
        if (dests.data) dests.data.forEach(d => addPkgLocation(d));
    } catch (e) { console.error('Error loading sub-data:', e); }
}

function switchPkgTab(tab) {
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab));
    });
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`pkg-tab-${tab}`).style.display = 'block';
}

function addItineraryDay(data = {}) {
    const container = document.getElementById('itineraryContainer');
    const dayNum = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'itinerary-day';
    div.innerHTML = `
        <i class="fas fa-trash remove-day" onclick="this.parentElement.remove()"></i>
        <div class="form-grid">
            <div class="form-group"><label>Day Number</label><input type="number" class="form-control day-num" value="${data.day_number || dayNum}"></div>
            <div class="form-group"><label>Day Title</label><input type="text" class="form-control day-title" value="${data.day_title || ''}" placeholder="e.g. Arrival in Arusha"></div>
        </div>
        <div class="form-group"><label>Description</label><textarea class="form-control day-desc" rows="3">${data.day_description || ''}</textarea></div>
        <div class="form-grid">
            <div class="form-group"><label>Accommodation</label><input type="text" class="form-control day-acc" value="${data.accommodation_type || ''}"></div>
            <div class="form-group"><label>Meals</label><input type="text" class="form-control day-meals" value="${data.meals_included || ''}" placeholder="B, L, D"></div>
        </div>
    `;
    container.appendChild(div);
}

async function addPkgLocation(data = {}) {
    const container = document.getElementById('locationsContainer');
    const div = document.createElement('div');
    div.className = 'location-item';
    
    // Fetch destinations if not already loaded globally (optimistically assuming destinationsList is available)
    if (destinationsList.length === 0) await loadDestinations();

    div.innerHTML = `
        <i class="fas fa-trash remove-location" onclick="this.parentElement.remove()"></i>
        <div class="form-grid">
            <div class="form-group">
                <label>National Park</label>
                <select class="form-control loc-park">
                    ${destinationsList.map(d => `<option value="${d.park_id}" ${data.park_id == d.park_id ? 'selected' : ''}>${d.park_name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Visit Day</label><input type="number" class="form-control loc-day" value="${data.visit_day || 1}"></div>
        </div>
        <div class="form-group"><label>Activities (CSV)</label><input type="text" class="form-control loc-act" value="${(data.activities || []).join(', ')}" placeholder="Game Drive, Walking Safari..."></div>
    `;
    container.appendChild(div);
}

async function savePackage() {
    const btn = event.target;
    const form = document.getElementById('pkgForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const id = document.getElementById('pkgId').value;
    
    setLoading(btn, true);
    
    try {
        // Process Arrays & Booleans
        data.is_featured = !!form.querySelector('[name="is_featured"]').checked;
        data.is_active = !!form.querySelector('[name="is_active"]').checked;
        data.is_private = !!form.querySelector('[name="is_private"]').checked;
        data.is_customizable = !!form.querySelector('[name="is_customizable"]').checked;
        
        if (data.image_urls_csv) data.image_urls = data.image_urls_csv.split(',').map(s => s.trim()).filter(s => s);
        else data.image_urls = [];
        
        if (data.included_features_text) data.included_features = data.included_features_text.split('\n').map(s => s.trim()).filter(s => s);
        else data.included_features = [];
        
        if (data.excluded_features_text) data.excluded_features = data.excluded_features_text.split('\n').map(s => s.trim()).filter(s => s);
        else data.excluded_features = [];

        delete data.image_urls_csv;
        delete data.included_features_text;
        delete data.excluded_features_text;

        let pkgId = id;
        if (id) await apiRequest('PUT', `/packages/${id}`, data);
        else {
            const res = await apiRequest('POST', '/packages', data);
            pkgId = res.data.package_id;
        }

        // Save Itinerary
        const itinerary = Array.from(document.querySelectorAll('.itinerary-day')).map(el => ({
            day_number: el.querySelector('.day-num').value,
            day_title: el.querySelector('.day-title').value,
            day_description: el.querySelector('.day-desc').value,
            accommodation_type: el.querySelector('.day-acc').value,
            meals_included: el.querySelector('.day-meals').value
        }));
        await apiRequest('POST', `/packages/${pkgId}/itinerary`, { itinerary });

        // Save Locations
        const destinations = Array.from(document.querySelectorAll('.location-item')).map(el => ({
            park_id: el.querySelector('.loc-park').value,
            visit_day: el.querySelector('.loc-day').value,
            activities: el.querySelector('.loc-act').value.split(',').map(s => s.trim()).filter(s => s)
        }));
        await apiRequest('POST', `/packages/${pkgId}/destinations`, { destinations });

        closeModal('pkgModal');
        showToast('Package fully synchronized');
        await loadPackages();
    } catch (e) { 
        console.error(e);
    } finally {
        setLoading(btn, false);
    }
}

async function deletePackage(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await apiRequest('DELETE', `/packages/${id}`);
        showToast('Package deleted');
        loadPackages();
    } catch (e) {}
}

// ── Bookings ──────────────────────────────────────────────────
async function loadBookings() {
    const body = document.getElementById('bookBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/bookings');
        body.innerHTML = (res.data || []).map(b => `
            <tr>
                <td data-label="Guest"><strong>${b.full_name}</strong><br><small>${b.email}</small></td>
                <td data-label="Package">${b.package_name || '—'}</td>
                <td data-label="Date">${new Date(b.start_date).toLocaleDateString()}</td>
                <td data-label="Total">$${Number(b.total_price_usd).toLocaleString()}</td>
                <td data-label="Status"><span class="status-badge status-${(b.status_name || 'pending').toLowerCase()}">${b.status_name || 'Pending'}</span></td>
                <td data-label="Actions">
                    <select class="form-control" style="padding: 4px; font-size: 11px; width: 120px" onchange="updateBookingStatus('${b.booking_id}', this.value)">
                        <option value="">Update</option>
                        <option value="confirmed">Confirm</option>
                        <option value="cancelled">Cancel</option>
                    </select>
                </td>
            </tr>`).join('') || '<tr><td colspan="6">No bookings found.</td></tr>';
    } catch (e) {}
}

async function updateBookingStatus(id, status) {
    if (!status) return;
    try {
        await apiRequest('PUT', `/bookings/${id}/status`, { status });
        showToast('Updated & Notification Sent');
        loadBookings();
    } catch (e) {}
}

// ── Enquiries ─────────────────────────────────────────────────
let enquiriesList = [];
async function loadEnquiries() {
    const body = document.getElementById('enqBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/enquiries');
        enquiriesList = res.data || [];
        body.innerHTML = enquiriesList.map(e => `
            <tr>
                <td><strong>${e.full_name}</strong></td>
                <td>${e.enquiry_type || 'General'}</td>
                <td>${new Date(e.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge status-${(e.enquiry_status || 'new').toLowerCase()}">${e.enquiry_status || 'New'}</span></td>
                <td><button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px" onclick="openEnqModal('${e.enquiry_id}')">Respond</button></td>
            </tr>`).join('') || '<tr><td colspan="5">No enquiries found.</td></tr>';
    } catch (e) {}
}

function openEnqModal(id) {
    const e = enquiriesList.find(x => x.enquiry_id == id);
    if (!e) return;
    document.getElementById('enqRespondId').value = id;
    document.getElementById('enqResponse').value = '';
    document.getElementById('enqDetails').innerHTML = `<strong>${e.full_name}</strong><br><small>${e.email}</small><br><p style="margin-top:0.5rem; background:var(--bg-secondary); padding:0.75rem; border-radius:var(--radius-sm)">"${e.enquiry_message}"</p>`;
    document.getElementById('enqModal').classList.add('active');
}

async function sendEnquiryResponse() {
    const id = document.getElementById('enqRespondId').value;
    const response = document.getElementById('enqResponse').value;
    if (!response.trim()) return;
    try {
        await apiRequest('PUT', `/enquiries/${id}/respond`, { response });
        showToast('Response Sent');
        closeModal('enqModal');
        loadEnquiries();
    } catch (e) {}
}

// ── Media Management ──────────────────────────────────────────
async function loadImages() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    try {
        const res = await fetch('/api/images', { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await res.json();
        grid.innerHTML = (result.data || []).map(img => `
            <div class="card media-card" style="position:relative; cursor:pointer" onclick="navigator.clipboard.writeText('${img.slug}'); showToast('Slug copied: ${img.slug}')">
                <img src="${img.path}" style="width:100%; aspect-ratio:1; object-fit:cover; display:block">
                <div class="media-info" style="padding:0.75rem; background:var(--bg-card)">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-overflow:ellipsis; overflow:hidden; white-space:nowrap">${img.slug}</div>
                </div>
                <div class="media-actions" style="position:absolute; top:0.5rem; right:0.5rem; display:none">
                    <button class="btn btn-icon" style="background:var(--error); color:#fff; width:30px; height:30px; border:none" onclick="event.stopPropagation(); deleteImage('${img.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('') || '<p style="grid-column:1/-1; text-align:center">No media found.</p>';
        
        // Add hover effect for actions via CSS or style injection
    } catch (e) {}
}

async function handleMediaUpload(files) {
    for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        try { await apiUpload(fd); } catch (e) {}
    }
    showToast('Upload Complete');
    loadImages();
}

async function deleteImage(id) {
    if (!confirm('Delete image?')) return;
    try {
        await fetch(`/api/images/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        showToast('Image Deleted');
        loadImages();
    } catch (e) {}
}

// ── Profile & Settings ────────────────────────────────────────
async function loadProfile() {
    try {
        const res = await apiRequest('GET', '/verify');
        if (!res?.user) return;
        const u = res.user;
        if (document.getElementById('profFirst')) document.getElementById('profFirst').value = u.first_name || '';
        if (document.getElementById('profLast')) document.getElementById('profLast').value = u.last_name || '';
        if (document.getElementById('profEmail')) document.getElementById('profEmail').value = u.email || '';
        
        const avatarUrl = u.profile_image_url || '/images/avatar-placeholder.png';
        
        const sImg = document.getElementById('sidebarAvatarImg');
        if (sImg) { sImg.src = avatarUrl; sImg.style.display = 'block'; }

        const hImg = document.getElementById('headerAvatarImg');
        if (hImg) { hImg.src = avatarUrl; hImg.style.display = 'block'; }

        if (u.profile_image_url) {
            const preview = document.getElementById('profileImagePreview');
            if (preview) preview.innerHTML = `<img src="${u.profile_image_url}" style="width:100%; height:100%; object-fit:cover">`;
        }
        if (document.getElementById('userName')) document.getElementById('userName').textContent = `${u.first_name} ${u.last_name || ''}`;
    } catch (e) {}
}

async function uploadProfilePhoto(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
        const res = await apiUpload(fd);
        await apiRequest('PUT', '/profile', { profile_image_url: res.data.path });
        showToast('Photo Updated');
        loadProfile();
    } catch (e) {}
}

async function loadSettings() {
    const sForm = document.getElementById('settingsForm');
    const pForm = document.getElementById('passwordForm');
    
    if (sForm) {
        try {
            const res = await apiRequest('GET', '/settings');
            sForm.innerHTML = `<div class="form-grid" style="grid-template-columns:1fr">${(res.data || []).map(s => `
                <div class="form-group">
                    <label>${s.setting_key.replace(/_/g, ' ').toUpperCase()}</label>
                    <input class="form-control" name="${s.setting_key}" value="${s.setting_value || ''}">
                </div>`).join('')}</div><button type="submit" class="btn btn-primary" style="width:100%">Save Configuration</button>`;
            
            sForm.onsubmit = async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(sForm));
                try {
                    await apiRequest('PUT', '/settings', data);
                    showToast('System configuration updated');
                    await loadSettings();
                } catch (e) {}
            };
        } catch (e) {}
    }

    if (pForm) {
        pForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(pForm));
            if (data.new_password !== data.confirm_password) {
                showToast('Passwords do not match', 'error');
                return;
            }
            try {
                await apiRequest('PUT', '/profile/password', { password: data.new_password });
                showToast('Password changed successfully');
                pForm.reset();
            } catch (e) {}
        };
    }
}

// ── Destinations ──────────────────────────────────────────────
let destinationsList = [];
async function loadDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
    if (destinationsList.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Initializing Destinations...</td></tr>';
    }
    try {
        const res = await apiRequest('GET', '/destinations');
        destinationsList = res.data || [];
        renderDestinations();
    } catch (e) {}
}

function renderDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
    body.innerHTML = destinationsList.map(d => `
        <tr>
            <td data-label="Destination"><strong>${d.park_name}</strong></td>
            <td data-label="Location">${d.park_location || '—'}</td>
            <td data-label="Packages">${d.safari_count || 0}</td>
            <td data-label="Status"><span class="status-badge status-${d.is_active ? 'active' : 'inactive'}">${d.is_active ? 'Active' : 'Inactive'}</span></td>
            <td data-label="Actions"><button class="btn btn-icon" onclick="openDestModal('${d.park_id}')"><i class="fas fa-edit"></i></button></td>
        </tr>`).join('') || '<tr><td colspan="5">No destinations found</td></tr>';
}

function openDestModal(id = null) {
    const form = document.getElementById('destForm');
    if (!form) return;
    form.reset();
    document.getElementById('destId').value = '';
    document.getElementById('destModalTitle').textContent = id ? 'Edit Destination' : 'New Destination';
    if (id) {
        const d = destinationsList.find(x => x.park_id == id);
        if (d) {
            document.getElementById('destId').value = d.park_id;
            Object.entries(d).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { if (el.type === 'checkbox') el.checked = !!v; else el.value = v || ''; }
            });
        }
    }
    document.getElementById('destModal').classList.add('active');
}

async function saveDestination() {
    const btn = event.target;
    const form = document.getElementById('destForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('destId').value;
    data.is_active = !!form.querySelector('[name="is_active"]').checked;
    data.is_unesco_heritage = !!form.querySelector('[name="is_unesco_heritage"]').checked;
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/destinations/${id}`, data);
        else await apiRequest('POST', '/destinations', data);
        closeModal('destModal');
        showToast('Destination updated');
        await loadDestinations();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

// ── Categories ────────────────────────────────────────────────
let categoriesList = [];
async function loadCategories() {
    const body = document.getElementById('catBody');
    if (!body) return;
    if (categoriesList.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Initializing Categories...</td></tr>';
    }
    try {
        const res = await apiRequest('GET', '/categories');
        categoriesList = res.data || [];
        renderCategories();
    } catch (e) {}
}

function renderCategories() {
    const body = document.getElementById('catBody');
    if (!body) return;
    body.innerHTML = categoriesList.map(c => `
        <tr>
            <td><i class="${c.icon_class || 'fas fa-tag'}" style="margin-right:8px"></i> <strong>${c.category_name}</strong></td>
            <td>${c.category_slug}</td>
            <td>${c.package_count || 0}</td>
            <td>${c.display_order}</td>
            <td>
                <button class="btn btn-icon" onclick="openCatModal('${c.category_id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-icon" onclick="deleteCategory('${c.category_id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('') || '<tr><td colspan="5">No categories found</td></tr>';
}

function openCatModal(id = null) {
    const form = document.getElementById('catForm');
    if (!form) return;
    form.reset();
    document.getElementById('catId').value = '';
    document.getElementById('catModalTitle').textContent = id ? 'Edit Category' : 'New Category';
    if (id) {
        const c = categoriesList.find(x => x.category_id == id);
        if (c) {
            document.getElementById('catId').value = c.category_id;
            Object.entries(c).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { if (el.type === 'checkbox') el.checked = !!v; else el.value = v || ''; }
            });
        }
    }
    document.getElementById('catModal').classList.add('active');
}

async function saveCategory() {
    const btn = event.target;
    const form = document.getElementById('catForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('catId').value;
    data.is_active = !!form.querySelector('[name="is_active"]').checked;
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/categories/${id}`, data);
        else await apiRequest('POST', '/categories', data);
        closeModal('catModal');
        showToast('Category updated');
        await loadCategories();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteCategory(id) {
    if (!confirm('Delete category?')) return;
    try {
        await apiRequest('DELETE', `/categories/${id}`);
        showToast('Category deleted');
        loadCategories();
    } catch (e) {}
}

// ── Users ─────────────────────────────────────────────────────
let usersList = [];
async function loadUsers() {
    const body = document.getElementById('userBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/users');
        usersList = res.data || [];
        body.innerHTML = usersList.map(u => `
            <tr>
                <td><strong>${u.first_name} ${u.last_name || ''}</strong></td>
                <td>${u.email}</td>
                <td>${u.role_name || 'Staff'}</td>
                <td><span class="status-badge status-${u.is_active ? 'active' : 'inactive'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div style="display:flex; gap:6px">
                        <button class="btn btn-icon" onclick="openUserModal('${u.user_id}')"><i class="fas fa-user-gear"></i></button>
                        <button class="btn btn-icon" onclick="deleteUser('${u.user_id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || '<tr><td colspan="5">No users</td></tr>';
    } catch (e) {}
}

function openUserModal(id = null) {
    const form = document.getElementById('userForm');
    if (!form) return;
    form.reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = id ? 'Edit User' : 'New User';
    if (id) {
        const u = usersList.find(x => x.user_id == id);
        if (u) {
            document.getElementById('userId').value = u.user_id;
            Object.entries(u).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { 
                    if (el.tagName === 'SELECT') el.value = String(v);
                    else el.value = v || ''; 
                }
            });
        }
    }
    document.getElementById('userModal').classList.add('active');
}

async function saveUser() {
    const btn = event.target;
    const form = document.getElementById('userForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('userId').value;
    data.is_active = data.is_active === 'true';
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/users/${id}`, data);
        else await apiRequest('POST', '/users', data);
        closeModal('userModal');
        showToast('Team member updated');
        await loadUsers();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
        await apiRequest('DELETE', `/users/${id}`);
        showToast('Team member deleted');
        await loadUsers();
    } catch (e) {}
}

// ── Reviews ───────────────────────────────────────────────────
async function loadReviews() {
    const body = document.getElementById('reviewBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/reviews');
        body.innerHTML = (res.data || []).map(r => `
            <tr>
                <td><strong>${r.full_name}</strong></td>
                <td>${r.rating} / 5</td>
                <td>${r.package_name || '—'}</td>
                <td><span class="status-badge status-${r.is_approved ? 'active' : 'pending'}">${r.is_approved ? 'Approved' : 'Pending'}</span></td>
                <td>
                    <button class="btn btn-icon" onclick="toggleReview('${r.review_id}')"><i class="fas fa-${r.is_approved ? 'times' : 'check'}"></i></button>
                    <button class="btn btn-icon" onclick="deleteReview('${r.review_id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('') || '<tr><td colspan="5">No reviews</td></tr>';
    } catch (e) {}
}

async function toggleReview(id) {
    try {
        await apiRequest('PUT', `/reviews/${id}/toggle`);
        showToast('Review Status Toggled');
        loadReviews();
    } catch (e) {}
}

async function deleteReview(id) {
    if (!confirm('Delete review?')) return;
    try {
        await apiRequest('DELETE', `/reviews/${id}`);
        showToast('Review deleted');
        loadReviews();
    } catch (e) {}
}

// ── Blog ──────────────────────────────────────────────────────
let blogsList = [];
async function loadBlogs() {
    const body = document.getElementById('blogBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/blog');
        blogsList = res.data || [];
        body.innerHTML = blogsList.map(p => `
            <tr>
                <td><strong>${p.post_title}</strong></td>
                <td>${p.author_name || 'Admin'}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge status-${p.is_published ? 'active' : 'inactive'}">${p.is_published ? 'Published' : 'Draft'}</span></td>
                <td>
                    <div style="display:flex; gap:6px">
                        <button class="btn btn-icon" onclick="openBlogModal('${p.post_id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" onclick="deleteBlog('${p.post_id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || '<tr><td colspan="5">No blog posts</td></tr>';
    } catch (e) {}
}

function openBlogModal(id = null) {
    const form = document.getElementById('blogForm');
    if (!form) return;
    form.reset();
    document.getElementById('blogId').value = '';
    document.getElementById('blogModalTitle').textContent = id ? 'Edit Post' : 'New Post';
    if (id) {
        const p = blogsList.find(x => x.post_id == id);
        if (p) {
            document.getElementById('blogId').value = p.post_id;
            Object.entries(p).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { if (el.type === 'checkbox') el.checked = !!v; else el.value = v || ''; }
            });
            if (p.post_tags) form.querySelector('[name="post_tags_csv"]').value = p.post_tags.join(', ');
        }
    }
    document.getElementById('blogModal').classList.add('active');
}

async function saveBlog() {
    const btn = event.target;
    const form = document.getElementById('blogForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('blogId').value;
    data.is_published = !!form.querySelector('[name="is_published"]').checked;
    if (data.post_tags_csv) {
        data.post_tags = data.post_tags_csv.split(',').map(s => s.trim()).filter(s => s);
        delete data.post_tags_csv;
    }
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/blog/${id}`, data);
        else await apiRequest('POST', '/blog', data);
        closeModal('blogModal');
        showToast('Article published/updated');
        await loadBlogs();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
        await apiRequest('DELETE', `/blog/${id}`);
        showToast('Blog post deleted');
        await loadBlogs();
    } catch (e) {}
}

// ── Initialization ────────────────────────────────────────────
window.navigate = navigate;
window.closeModal = closeModal;
window.openPackageModal = openPackageModal;
window.savePackage = savePackage;
window.deletePackage = deletePackage;
window.switchPkgTab = switchPkgTab;
window.addItineraryDay = addItineraryDay;
window.addPkgLocation = addPkgLocation;
window.updateBookingStatus = updateBookingStatus;
window.openEnqModal = openEnqModal;
window.sendEnquiryResponse = sendEnquiryResponse;
window.uploadProfilePhoto = uploadProfilePhoto;
window.handleMediaUpload = handleMediaUpload;
window.deleteImage = deleteImage;
window.toggleReview = toggleReview;
window.deleteReview = deleteReview;
window.openDestModal = openDestModal;
window.saveDestination = saveDestination;
window.openCatModal = openCatModal;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;
window.openUserModal = openUserModal;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.openBlogModal = openBlogModal;
window.saveBlog = saveBlog;
window.deleteBlog = deleteBlog;
window.toggleSidebar = toggleSidebar;
window.toggleDarkMode = toggleDarkMode;
window.debounceSearch = debounceSearch;
window.applyFilters = applyFilters;
window.toggleSelectAll = toggleSelectAll;
window.bulkAction = bulkAction;
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
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
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
    document.querySelectorAll('.nav-item').forEach(item => {
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

// ── Communications Module ────────────────────────────────────
function toggleCustomEmailInput() {
    const type = document.querySelector('input[name="recipientType"]:checked').value;
    const customContainer = document.getElementById('customEmailInputContainer');
    const customEmail = document.getElementById('customEmailAddress');
    
    if (type === 'custom') {
        customContainer.classList.remove('hidden');
        customEmail.required = true;
    } else {
        customContainer.classList.add('hidden');
        customEmail.required = false;
    }
}

async function sendBroadcastEmail() {
    const btn = document.getElementById('sendEmailBtn');
    setLoading(btn, true);
    
    try {
        const type = document.querySelector('input[name="recipientType"]:checked').value;
        const customEmail = document.getElementById('customEmailAddress').value;
        const subject = document.getElementById('emailSubject').value;
        const bodyHtml = document.getElementById('emailBody').value;
        
        const payload = {
            recipientType: type,
            subject,
            bodyHtml
        };
        
        if (type === 'custom') {
            payload.email = customEmail;
        }
        
        const res = await apiRequest('POST', '/communications/send', payload);
        
        showToast('Email sent successfully!', 'success');
        document.getElementById('communicationsForm').reset();
        toggleCustomEmailInput(); // Reset UI
    } catch (e) {
        showToast('Failed to send email', 'error');
    } finally {
        setLoading(btn, false);
    }
}