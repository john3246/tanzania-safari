/**
 * Tanzania Safari - Admin Dashboard JS
 * Modular, Modern, and Reliable - FULLY INTERACTIVE
 */

// ── Configuration & State ─────────────────────────────────────
const token = localStorage.getItem('adminToken');
const API_BASE = '/api/admin';

if (!token) { window.location.href = '/admin/login'; }

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
function navigate(page) {
    // UI Updates
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${page}`);
    const targetNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    
    if (targetPage) targetPage.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = targetNav?.querySelector('span')?.textContent || page;
    
    // Close sidebar on mobile
    document.getElementById('sidebar')?.classList.remove('open');

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

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', e => { e.preventDefault(); navigate(item.getAttribute('data-page')); });
    });
    document.getElementById('menuToggle')?.addEventListener('click', () => { 
        document.getElementById('sidebar')?.classList.toggle('open'); 
    });
    document.getElementById('sidebarClose')?.addEventListener('click', () => { 
        document.getElementById('sidebar')?.classList.remove('open'); 
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar')?.classList.remove('open');
            }
        });
    });
    
    const d = new Date();
    const de = document.getElementById('headerDate');
    if (de) de.innerHTML = `<i class="far fa-calendar"></i> ${d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}`;
    
    loadProfile();
    const p = new URLSearchParams(window.location.search).get('page') || 'dashboard';
    navigate(p);
    
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); localStorage.clear(); window.location.href = '/admin/login'; });
});