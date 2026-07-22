// ── Tours Management (Corporate CMS) ─────────────────────────
let packagesList = [];
let tourCategories = [];
let tourDestinations = [];

async function loadPackages() {
    const body = document.getElementById('pkgBody');
    if (!body) return;
    if (packagesList.length === 0) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Initializing Tours...</td></tr>';
    }
    try {
        // Fetch active categories & destinations first for labels/filters
        await Promise.all([
            loadFiltersData(),
            fetchToursList()
        ]);
    } catch (e) {
        console.error('Failed to load packages data:', e);
    }
}

async function loadFiltersData() {
    try {
        const [catsRes, destsRes] = await Promise.all([
            apiRequest('GET', '/tour-categories'),
            apiRequest('GET', '/destinations')
        ]);
        tourCategories = catsRes.data || [];
        tourDestinations = destsRes.data || [];

        // Populate filter dropdowns
        const filterCat = document.getElementById('filterCategory');
        if (filterCat) {
            filterCat.innerHTML = '<option value="">All Categories</option>' +
                tourCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }

        const filterDest = document.getElementById('filterDestination');
        if (filterDest) {
            filterDest.innerHTML = '<option value="">All Destinations</option>' +
                tourDestinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        }
    } catch (e) {
        console.error('Error loading filters data:', e);
    }
}

async function fetchToursList() {
    try {
        const queryParams = new URLSearchParams();
        const searchVal = document.getElementById('tourSearch')?.value || '';
        const catVal = document.getElementById('filterCategory')?.value || '';
        const destVal = document.getElementById('filterDestination')?.value || '';
        const statusVal = document.getElementById('filterStatus')?.value || '';

        if (searchVal) queryParams.append('search', searchVal);
        if (catVal) queryParams.append('categoryId', catVal);
        if (destVal) queryParams.append('destinationId', destVal);
        if (statusVal) queryParams.append('status', statusVal);

        const res = await apiRequest('GET', `/tours?${queryParams.toString()}`);
        packagesList = res.data || [];
        renderPackages();
    } catch (e) {
        console.error('Error fetching tours list:', e);
    }
}

function renderPackages() {
    const body = document.getElementById('pkgBody');
    if (!body) return;
    
    body.innerHTML = packagesList.map(t => {
        let statusClass = 'bg-gray-100 text-gray-600';
        if (t.status === 'published') statusClass = 'bg-emerald-100 text-emerald-700';
        else if (t.status === 'draft') statusClass = 'bg-amber-100 text-amber-700';
        else if (t.status === 'archived') statusClass = 'bg-rose-100 text-rose-700';

        const activeClass = t.is_active ? 'bg-emerald-500' : 'bg-gray-300';
        
        return `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${t.featured_image_url || '/images/optimized/balloon.webp'}" alt="Tour" class="w-12 h-12 rounded-lg object-cover bg-slate-100" onerror="this.src='/images/optimized/balloon.webp'">
                        <div>
                            <div class="font-semibold text-slate-900">${t.title}</div>
                            <div class="text-xs text-slate-400">${t.slug}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-700 font-medium">${t.category_name || '—'}</td>
                <td class="px-6 py-4 font-medium text-slate-700">$${Number(t.price_usd).toLocaleString()}</td>
                <td class="px-6 py-4 text-slate-600">${t.duration_days} Days / ${t.duration_nights || 0} Nights</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusClass}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-block w-2.5 h-2.5 rounded-full ${activeClass}"></span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center gap-2 justify-end">
                        <button class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onclick="openPackageModal('${t.id}')" title="Edit">
                            <i class="fa-solid fa-pen text-lg"></i>
                        </button>
                        <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onclick="deletePackage('${t.id}')" title="Delete">
                            <i class="fa-solid fa-trash text-lg"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('') || '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-500">No tours found</td></tr>';
}

function openPackageModal(id = null) {
    const form = document.getElementById('pkgForm');
    const seoForm = document.getElementById('seoForm');
    if (!form || !seoForm) return;

    form.reset();
    seoForm.reset();
    document.getElementById('pkgId').value = '';
    document.getElementById('pkgModalTitle').textContent = id ? 'Edit Tour' : 'New Tour';
    
    // Reset Tabs
    switchPkgTab('general');
    document.getElementById('itineraryContainer').innerHTML = '';
    document.getElementById('locationsContainer').innerHTML = '';

    // Populate category & destination selects inside modal
    const catSelect = document.getElementById('pkgCategorySelect');
    if (catSelect) {
        catSelect.innerHTML = '<option value="">Select Category</option>' +
            tourCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    const destSelect = document.getElementById('pkgDestinationSelect');
    if (destSelect) {
        destSelect.innerHTML = '<option value="">Select Destination</option>' +
            tourDestinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    if (id) {
        const t = packagesList.find(x => x.id == id);
        if (t) {
            document.getElementById('pkgId').value = t.id;
            
            // Populate General Form
            Object.entries(t).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) {
                    if (el.type === 'checkbox') el.checked = !!v;
                    else el.value = v || '';
                }
            });

            // Populate SEO Form
            Object.entries(t).forEach(([k, v]) => {
                const el = seoForm.querySelector(`[name="${k}"]`);
                if (el) {
                    el.value = v || '';
                }
            });
            
            if (t.gallery_urls) form.querySelector('[name="gallery_urls_csv"]').value = t.gallery_urls.join(', ');
            if (t.highlights) form.querySelector('[name="highlights_text"]').value = t.highlights.join('\n');
            if (t.travel_tips) form.querySelector('[name="travel_tips_text"]').value = t.travel_tips.join('\n');
            if (t.included) form.querySelector('[name="included_text"]').value = t.included.join('\n');
            if (t.excluded) form.querySelector('[name="excluded_text"]').value = t.excluded.join('\n');
            
            // Load itinerary & related tours if needed
            loadTourSubData(id);
        }
    }
    document.getElementById('pkgModal').classList.add('active');
}

async function loadTourSubData(id) {
    try {
        const res = await apiRequest('GET', `/tours/${id}`);
        if (res.data && res.data.itinerary) {
            res.data.itinerary.forEach(day => addItineraryDay(day));
        }
        // If there were locations in the tour details, load them
        // In the corporate schema, destination_id references a destination.
        if (res.data && res.data.destination_id) {
            addPkgLocation({ park_id: res.data.destination_id });
        }
    } catch (e) {
        console.error('Error loading sub-data:', e);
    }
}

function switchPkgTab(tab) {
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab.substring(0, 3)));
    });
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`pkg-tab-${tab}`).style.display = 'block';
}

function addItineraryDay(data = {}) {
    const container = document.getElementById('itineraryContainer');
    const dayNum = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'itinerary-day bg-gray-50 p-4 rounded-lg relative border border-gray-150 mb-3';
    div.innerHTML = `
        <i class="fas fa-trash remove-day absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer" onclick="this.parentElement.remove()"></i>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="space-y-1 md:col-span-1">
                <label class="text-xs font-semibold text-gray-500">Day Number</label>
                <input type="number" class="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm outline-none day-num" value="${data.day || dayNum}">
            </div>
            <div class="space-y-1 md:col-span-3">
                <label class="text-xs font-semibold text-gray-500">Day Title</label>
                <input type="text" class="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm outline-none day-title" value="${data.title || ''}" placeholder="e.g. Arrival in Arusha">
            </div>
        </div>
        <div class="space-y-1 mt-3">
            <label class="text-xs font-semibold text-gray-500">Description</label>
            <textarea class="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm outline-none day-desc" rows="2">${data.description || ''}</textarea>
        </div>
    `;
    container.appendChild(div);
}

function addPkgLocation(data = {}) {
    const container = document.getElementById('locationsContainer');
    const div = document.createElement('div');
    div.className = 'location-item bg-gray-50 p-4 rounded-lg relative border border-gray-150 mb-3';
    
    div.innerHTML = `
        <i class="fas fa-trash remove-location absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer" onclick="this.parentElement.remove()"></i>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-500">Destination</label>
                <select class="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm outline-none loc-park">
                    ${tourDestinations.map(d => `<option value="${d.id}" ${data.park_id == d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-500">Visit Day</label>
                <input type="number" class="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm outline-none loc-day" value="${data.visit_day || 1}">
            </div>
        </div>
    `;
    container.appendChild(div);
}

async function savePackage() {
    const btn = event.target;
    const form = document.getElementById('pkgForm');
    const seoForm = document.getElementById('seoForm');
    
    const formData = new FormData(form);
    const seoData = Object.fromEntries(new FormData(seoForm));
    const data = { ...Object.fromEntries(formData), ...seoData };
    const id = document.getElementById('pkgId').value;
    
    setLoading(btn, true);
    
    try {
        // Parse numbers
        if (data.price_usd) data.price_usd = parseFloat(data.price_usd);
        if (data.duration_days) data.duration_days = parseInt(data.duration_days);
        if (data.duration_nights) data.duration_nights = parseInt(data.duration_nights);
        if (data.category_id) data.category_id = parseInt(data.category_id);
        if (data.destination_id) data.destination_id = parseInt(data.destination_id);
        if (data.group_size_min) data.group_size_min = parseInt(data.group_size_min);
        if (data.group_size_max) data.group_size_max = parseInt(data.group_size_max);
        if (data.age_minimum) data.age_minimum = parseInt(data.age_minimum);

        // Process Checkboxes
        data.is_featured = !!form.querySelector('[name="is_featured"]').checked;
        data.is_active = !!form.querySelector('[name="is_active"]').checked;
        
        // Parse CSV/Text Areas
        if (data.gallery_urls_csv) data.gallery_urls = data.gallery_urls_csv.split(',').map(s => s.trim()).filter(s => s);
        else data.gallery_urls = [];
        
        if (data.highlights_text) data.highlights = data.highlights_text.split('\n').map(s => s.trim()).filter(s => s);
        else data.highlights = [];
        
        if (data.travel_tips_text) data.travel_tips = data.travel_tips_text.split('\n').map(s => s.trim()).filter(s => s);
        else data.travel_tips = [];

        if (data.included_text) data.included = data.included_text.split('\n').map(s => s.trim()).filter(s => s);
        else data.included = [];
        
        if (data.excluded_text) data.excluded = data.excluded_text.split('\n').map(s => s.trim()).filter(s => s);
        else data.excluded = [];

        // Itinerary Days
        data.itinerary = Array.from(document.querySelectorAll('.itinerary-day')).map(el => ({
            day: parseInt(el.querySelector('.day-num').value),
            title: el.querySelector('.day-title').value,
            description: el.querySelector('.day-desc').value
        }));

        // Cleanup temp CSV/text values
        delete data.gallery_urls_csv;
        delete data.highlights_text;
        delete data.travel_tips_text;
        delete data.included_text;
        delete data.excluded_text;

        if (id) {
            await apiRequest('PUT', `/tours/${id}`, data);
            showToast('Tour updated successfully');
        } else {
            await apiRequest('POST', '/tours', data);
            showToast('Tour created successfully');
        }

        closeModal('pkgModal');
        await fetchToursList();
    } catch (e) { 
        console.error(e);
        showToast(e.message || 'Error saving tour', 'error');
    } finally {
        setLoading(btn, false);
    }
}

async function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    try {
        await apiRequest('DELETE', `/tours/${id}`);
        showToast('Tour deleted successfully');
        await fetchToursList();
    } catch (e) {
        showToast(e.message || 'Error deleting tour', 'error');
    }
}

window.filterPackages = function() {
    fetchToursList();
};

window.openPackageModal = openPackageModal; 
