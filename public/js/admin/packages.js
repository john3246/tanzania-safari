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
    
    body.innerHTML = packagesList.map(p => {
        let statusClass = p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600';
        let statusText = p.is_active ? 'Active' : 'Inactive';
        
        return `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${p.image_urls?.[0] || '/images/optimized/balloon.webp'}" alt="Tour" class="w-12 h-12 rounded-lg object-cover bg-slate-100" onerror="this.src='/images/optimized/balloon.webp'">
                        <div>
                            <div class="font-medium text-slate-900">${p.package_name}</div>
                            <div class="text-xs text-slate-500 line-clamp-1">${p.category_name || '—'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 font-medium text-slate-700">${Number(p.base_price_usd).toLocaleString()}</td>
                <td class="px-6 py-4 text-slate-600">${p.duration_days} Days</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" onclick="openPackageModal('${p.package_id}')" title="Edit">
                            <i class="fa-solid fa-pen text-lg"></i>
                        </button>
                        <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onclick="deletePackage('${p.package_id}')" title="Delete">
                            <i class="fa-solid fa-trash text-lg"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('') || '<tr><td colspan="6" class="px-6 py-12 text-center text-slate-500">No packages found</td></tr>';
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
window.filterPackages = function() { const term = document.getElementById('tourSearch').value.toLowerCase(); const rows = document.getElementById('pkgBody').querySelectorAll('tr'); rows.forEach(r => { const text = r.innerText.toLowerCase(); r.style.display = text.includes(term) ? '' : 'none'; }); };
window.openPackageModal = openPackageModal; 
