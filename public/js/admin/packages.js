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
                        <button class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" onclick="openPackageModal('${t.id}')" title="Edit">
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
    window.currentEditTourId = id;
    navigate('edit-tour');
}

// ── Edit Tour Page Workspace ─────────────────────────────────
async function initEditTourPage() {
    const editForm = document.getElementById('editTourForm');
    const detailsForm = document.getElementById('editTourDetailsForm');
    const seoForm = document.getElementById('editTourSEOForm');
    const pricingForm = document.getElementById('editTourPricingForm');
    const classificationForm = document.getElementById('editTourClassificationForm');
    const mediaForm = document.getElementById('editTourMediaForm');

    if (!editForm) return;

    // Reset Forms
    editForm.reset();
    detailsForm.reset();
    seoForm.reset();
    pricingForm.reset();
    classificationForm.reset();
    mediaForm.reset();
    
    document.getElementById('editTourId').value = '';
    document.getElementById('itineraryContainer').innerHTML = '';
    document.getElementById('locationsContainer').innerHTML = '';

    // Load filter categories & destinations if not already loaded
    if (tourCategories.length === 0 || tourDestinations.length === 0) {
        const [catsRes, destsRes] = await Promise.all([
            apiRequest('GET', '/tour-categories'),
            apiRequest('GET', '/destinations')
        ]);
        tourCategories = catsRes.data || [];
        tourDestinations = destsRes.data || [];
    }

    // Populate category dropdown
    const catSelect = document.getElementById('editTourCategorySelect');
    if (catSelect) {
        catSelect.innerHTML = '<option value="">Select Category</option>' +
            tourCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Populate destination dropdown
    const destSelect = document.getElementById('editTourDestinationSelect');
    if (destSelect) {
        destSelect.innerHTML = '<option value="">Select Destination</option>' +
            tourDestinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    const id = window.currentEditTourId;
    document.getElementById('editTourTitle').textContent = id ? 'Edit Tour' : 'Create New Tour';

    if (id) {
        try {
            const res = await apiRequest('GET', `/tours/${id}`);
            const t = res.data;
            if (t) {
                document.getElementById('editTourId').value = t.id;

                // Populate form fields
                Object.entries(t).forEach(([k, v]) => {
                    [editForm, detailsForm, seoForm, pricingForm, classificationForm, mediaForm].forEach(f => {
                        const el = f.querySelector(`[name="${k}"]`);
                        if (el) {
                            if (el.type === 'checkbox') el.checked = !!v;
                            else el.value = v || '';
                        }
                    });
                });

                // Set status & switches
                document.getElementById('editTourStatus').value = t.status || 'draft';
                document.getElementById('editTourActive').checked = !!t.is_active;
                document.getElementById('editTourFeatured').checked = !!t.is_featured;

                // Populate CSV/Text fields
                if (t.gallery_urls) mediaForm.querySelector('[name="gallery_urls_csv"]').value = t.gallery_urls.join(', ');
                if (t.highlights) detailsForm.querySelector('[name="highlights_text"]').value = t.highlights.join('\n');
                if (t.travel_tips) detailsForm.querySelector('[name="travel_tips_text"]').value = t.travel_tips.join('\n');
                if (t.included) detailsForm.querySelector('[name="included_text"]').value = t.included.join('\n');
                if (t.excluded) detailsForm.querySelector('[name="excluded_text"]').value = t.excluded.join('\n');

                // Load itinerary
                if (t.itinerary) {
                    t.itinerary.forEach(day => addItineraryDay(day));
                }
                // Load destinations/parks
                if (t.destination_id) {
                    addPkgLocation({ park_id: t.destination_id });
                }
            }
        } catch (e) {
            console.error('Error fetching tour sub-data:', e);
            showToast('Failed to load tour details', 'error');
        }
    }
}

async function saveEditTour(btn) {
    const id = document.getElementById('editTourId').value;
    
    // Gather and structure form payloads
    const editData = Object.fromEntries(new FormData(document.getElementById('editTourForm')));
    const detailsData = Object.fromEntries(new FormData(document.getElementById('editTourDetailsForm')));
    const seoData = Object.fromEntries(new FormData(document.getElementById('editTourSEOForm')));
    const pricingData = Object.fromEntries(new FormData(document.getElementById('editTourPricingForm')));
    const classificationData = Object.fromEntries(new FormData(document.getElementById('editTourClassificationForm')));
    const mediaData = Object.fromEntries(new FormData(document.getElementById('editTourMediaForm')));

    const data = {
        ...editData,
        ...detailsData,
        ...seoData,
        ...pricingData,
        ...classificationData,
        ...mediaData
    };

    // Parse status and boolean checkboxes
    data.status = document.getElementById('editTourStatus').value;
    data.is_active = !!document.getElementById('editTourActive').checked;
    data.is_featured = !!document.getElementById('editTourFeatured').checked;

    // Parse numeric fields
    if (data.price_usd) data.price_usd = parseFloat(data.price_usd);
    if (data.duration_days) data.duration_days = parseInt(data.duration_days);
    if (data.duration_nights) data.duration_nights = parseInt(data.duration_nights);
    if (data.category_id) data.category_id = parseInt(data.category_id);
    if (data.destination_id) data.destination_id = parseInt(data.destination_id);
    if (data.group_size_min) data.group_size_min = parseInt(data.group_size_min);
    if (data.group_size_max) data.group_size_max = parseInt(data.group_size_max);
    if (data.age_minimum) data.age_minimum = parseInt(data.age_minimum);

    // Process lists and arrays
    if (data.gallery_urls_csv) data.gallery_urls = data.gallery_urls_csv.split(',').map(s => s.trim()).filter(Boolean);
    else data.gallery_urls = [];

    if (data.highlights_text) data.highlights = data.highlights_text.split('\n').map(s => s.trim()).filter(Boolean);
    else data.highlights = [];

    if (data.travel_tips_text) data.travel_tips = data.travel_tips_text.split('\n').map(s => s.trim()).filter(Boolean);
    else data.travel_tips = [];

    if (data.included_text) data.included = data.included_text.split('\n').map(s => s.trim()).filter(Boolean);
    else data.included = [];

    if (data.excluded_text) data.excluded = data.excluded_text.split('\n').map(s => s.trim()).filter(Boolean);
    else data.excluded = [];

    // Parse daily itinerary items
    data.itinerary = Array.from(document.querySelectorAll('.itinerary-day')).map(el => ({
        day: parseInt(el.querySelector('.day-num').value),
        title: el.querySelector('.day-title').value,
        description: el.querySelector('.day-desc').value
    }));

    // Prune temp form values
    delete data.gallery_urls_csv;
    delete data.highlights_text;
    delete data.travel_tips_text;
    delete data.included_text;
    delete data.excluded_text;

    // Clean empty values, empty strings, and NaN values so they match Zod optional schema
    Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined || (typeof data[key] === 'number' && isNaN(data[key]))) {
            delete data[key];
        }
    });

    setLoading(btn, true);
    try {
        if (id) {
            await apiRequest('PUT', `/tours/${id}`, data);
            showToast('Tour updated successfully');
        } else {
            await apiRequest('POST', '/tours', data);
            showToast('Tour created successfully');
        }
        navigate('packages');
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Failed to save tour details', 'error');
    } finally {
        setLoading(btn, false);
    }
}

function addItineraryDay(data = {}) {
    const container = document.getElementById('itineraryContainer');
    if (!container) return;
    const dayNum = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'itinerary-day bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row mb-4 transition-all hover:shadow-md hover:border-slate-350';
    div.innerHTML = `
        <div class="bg-slate-50 px-4 py-3 md:py-0 md:w-16 flex md:flex-col items-center justify-between md:justify-center gap-2 border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest md:my-2">Day</span>
            <span class="text-xl font-extrabold text-amber-600 day-badge">${data.day || dayNum}</span>
            <div class="flex md:flex-col gap-1">
                <button type="button" onclick="moveItineraryDay(this, -1)" class="p-1 text-slate-400 hover:text-amber-600 transition-colors" title="Move Up"><i class="fa-solid fa-chevron-up"></i></button>
                <button type="button" onclick="moveItineraryDay(this, 1)" class="p-1 text-slate-400 hover:text-amber-600 transition-colors" title="Move Down"><i class="fa-solid fa-chevron-down"></i></button>
            </div>
        </div>
        <div class="flex-1 p-5 space-y-4">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1 space-y-1">
                    <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Day Title</label>
                    <input type="text" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 day-title" value="${data.title || ''}" placeholder="e.g. Arrival & Safari Briefing">
                </div>
                <input type="hidden" class="day-num" value="${data.day || dayNum}">
                <button type="button" onclick="this.closest('.itinerary-day').remove(); reindexItineraryDays();" class="mt-7 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Day">
                    <i class="fa-solid fa-trash-can text-base"></i>
                </button>
            </div>
            <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Activity & Route Description</label>
                <textarea class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 day-desc" rows="3" placeholder="Describe the activities, routes, scenic views, and schedule for this day...">${data.description || ''}</textarea>
            </div>
        </div>
    `;
    container.appendChild(div);
}

function moveItineraryDay(btn, direction) {
    const item = btn.closest('.itinerary-day');
    if (!item) return;
    if (direction === -1) {
        const prev = item.previousElementSibling;
        if (prev) item.parentNode.insertBefore(item, prev);
    } else {
        const next = item.nextElementSibling;
        if (next) item.parentNode.insertBefore(next, item);
    }
    reindexItineraryDays();
}

function reindexItineraryDays() {
    const items = document.querySelectorAll('#itineraryContainer .itinerary-day');
    items.forEach((item, index) => {
        const dayVal = index + 1;
        item.querySelector('.day-badge').textContent = dayVal;
        item.querySelector('.day-num').value = dayVal;
    });
}

function addPkgLocation(data = {}) {
    const container = document.getElementById('locationsContainer');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'location-item bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4 mb-4 transition-all hover:shadow-md hover:border-slate-350';
    
    div.innerHTML = `
        <div class="p-2.5 bg-amber-50 rounded-lg text-amber-600 shrink-0">
            <i class="fa-solid fa-location-dot text-lg"></i>
        </div>
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Destination Park</label>
                <select class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 loc-park">
                    ${tourDestinations.map(d => `<option value="${d.id}" ${data.park_id == d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-slate-400">Visit Day</label>
                <input type="number" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 loc-day" value="${data.visit_day || 1}">
            </div>
        </div>
        <button type="button" onclick="this.closest('.location-item').remove()" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Remove Location">
            <i class="fa-solid fa-trash-can text-base"></i>
        </button>
    `;
    container.appendChild(div);
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
window.initEditTourPage = initEditTourPage;
window.saveEditTour = saveEditTour;
window.addItineraryDay = addItineraryDay;
window.addPkgLocation = addPkgLocation;
window.moveItineraryDay = moveItineraryDay;
window.reindexItineraryDays = reindexItineraryDays;
