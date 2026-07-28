// ── Destinations Management (Corporate CMS) ──────────────────
let destinationsList = [];

async function loadDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
    if (destinationsList.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Loading Destinations...</td></tr>';
    }
    try {
        const res = await apiRequest('GET', '/destinations');
        destinationsList = res.data || [];
        renderDestinations();
    } catch (e) {
        console.error('Error fetching destinations:', e);
        showToast('Failed to load destinations', 'error');
    }
}

function renderDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
    
    body.innerHTML = destinationsList.map(d => {
        const statusClass = d.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200';
        const statusText = d.is_active ? 'Published' : 'Draft';
        const featuredBadge = d.is_featured 
            ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><i class="fa-solid fa-star mr-1"></i> Featured</span>'
            : '<span class="text-slate-400">—</span>';
        
        const locString = [d.region, d.country].filter(Boolean).join(', ') || 'Tanzania';
        
        return `
        <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100 dest-row">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <img src="${d.featured_image_url || '/images/optimized/balloon.webp'}" alt="${d.name}" class="w-10 h-10 rounded-lg object-cover bg-slate-100" onerror="this.src='/images/optimized/balloon.webp'">
                    <div>
                        <div class="font-semibold text-slate-900">${d.name}</div>
                        <div class="text-xs text-slate-400">${d.slug}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600 font-medium">${locString}</td>
            <td class="px-6 py-4 text-slate-600 font-semibold">${d.tour_count || 0}</td>
            <td class="px-6 py-4">${featuredBadge}</td>
            <td class="px-6 py-4">
                <button onclick="toggleDestPublish('${d.id}', ${!!d.is_active})" title="Click to toggle publish status" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${statusClass}">
                    <i class="fa-solid ${d.is_active ? 'fa-check-circle' : 'fa-circle-dot'} mr-1.5"></i> ${statusText}
                </button>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex gap-2 justify-end">
                    <button class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onclick="openDestModal('${d.id}')" title="Edit">
                        <i class="fa-solid fa-pen text-base"></i>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onclick="deleteDestination('${d.id}')" title="Delete">
                        <i class="fa-solid fa-trash text-base"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="6" class="px-6 py-12 text-center text-slate-500">No destinations found.</td></tr>';
}

function openDestModal(id = null) {
    window.currentEditDestId = id;
    navigate('edit-destination');
}

// ── Edit Destination Page Workspace ──────────────────────────
async function initEditDestPage() {
    const editForm = document.getElementById('editDestForm');
    const mediaForm = document.getElementById('editDestMediaForm');
    const geoForm = document.getElementById('editDestGeoForm');

    if (!editForm) return;

    // Reset Forms
    if (editForm) editForm.reset();
    if (mediaForm) mediaForm.reset();
    if (geoForm) geoForm.reset();

    const idEl = document.getElementById('editDestId');
    if (idEl) idEl.value = '';

    const id = window.currentEditDestId;
    const titleEl = document.getElementById('editDestTitle');
    if (titleEl) titleEl.textContent = id ? 'Edit Destination' : 'Create New Destination';

    if (id) {
        let d = destinationsList.find(x => String(x.id) === String(id));
        try {
            const res = await apiRequest('GET', `/destinations/${id}`);
            if (res.data) d = res.data;
        } catch (e) {
            console.warn('Could not fetch destination by id, using list cache', e);
        }

        if (d) {
            if (idEl) idEl.value = d.id;

            Object.entries(d).forEach(([k, v]) => {
                [editForm, mediaForm, geoForm].filter(Boolean).forEach(f => {
                    const el = f.querySelector(`[name="${k}"]`);
                    if (el) {
                        if (el.type === 'checkbox') el.checked = !!v;
                        else if (Array.isArray(v)) el.value = v.join(', ');
                        else el.value = v ?? '';
                    }
                });
            });

            const activeEl = document.getElementById('editDestActive');
            const featuredEl = document.getElementById('editDestFeatured');
            if (activeEl) activeEl.checked = !!d.is_active;
            if (featuredEl) featuredEl.checked = !!d.is_featured;

            if (mediaForm) {
                const featuredInput = mediaForm.querySelector('[name="featured_image_url"]');
                const csvEl = mediaForm.querySelector('[name="gallery_urls_csv"]');
                const cover = d.featured_image_url || (d.gallery_urls && d.gallery_urls[0]) || '';
                if (featuredInput) featuredInput.value = cover || '';
                if (csvEl) {
                    const gallery = Array.isArray(d.gallery_urls) ? d.gallery_urls : [];
                    csvEl.value = gallery.filter(u => u && u !== cover).join(', ');
                }
            }
        }
    }

    setTimeout(() => window.MediaPicker?.enhanceAll(document.getElementById('page-edit-destination') || document), 50);
}

async function saveEditDest(btn) {
    const idEl = document.getElementById('editDestId');
    const id = idEl ? idEl.value : null;

    const getFormData = (formId) => {
        const el = document.getElementById(formId);
        return el ? Object.fromEntries(new FormData(el)) : {};
    };

    const data = {
        ...getFormData('editDestForm'),
        ...getFormData('editDestMediaForm'),
        ...getFormData('editDestGeoForm')
    };

    const activeEl = document.getElementById('editDestActive');
    const featuredEl = document.getElementById('editDestFeatured');

    if (activeEl) data.is_active = !!activeEl.checked;
    if (featuredEl) data.is_featured = !!featuredEl.checked;

    const featured = String(data.featured_image_url || '').trim();
    let gallery = [];
    if (data.gallery_urls_csv) {
        gallery = data.gallery_urls_csv.split(',').map(s => s.trim()).filter(Boolean);
    }
    delete data.gallery_urls_csv;

    // Cover first, then gallery (no duplicates) — never drop cover when gallery is empty
    if (featured) {
        gallery = [featured, ...gallery.filter(u => u !== featured)];
    }
    data.featured_image_url = featured || undefined;
    data.gallery_urls = gallery;

    // Auto generate slug if missing
    if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Clean empty values (keep arrays and booleans)
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key]) || typeof data[key] === 'boolean') return;
        if (data[key] === '' || data[key] === null || data[key] === undefined || (typeof data[key] === 'number' && isNaN(data[key]))) {
            delete data[key];
        }
    });

    if (btn && typeof setLoading === 'function') setLoading(btn, true);
    try {
        if (id) {
            await apiRequest('PUT', `/destinations/${id}`, data);
            if (typeof showToast === 'function') showToast('Destination updated successfully');
        } else {
            await apiRequest('POST', '/destinations', data);
            if (typeof showToast === 'function') showToast('Destination created successfully');
        }
        destinationsList = [];
        if (typeof navigate === 'function') navigate('destinations');
    } catch (e) {
        console.error('Error saving destination:', e);
        if (typeof showToast === 'function') showToast(e.message || 'Error saving destination', 'error');
    } finally {
        if (btn && typeof setLoading === 'function') setLoading(btn, false);
    }
}

async function toggleDestPublish(id, currentState) {
    const newState = !currentState;
    try {
        await apiRequest('PATCH', `/destinations/${id}/publish`, { is_active: newState });
        showToast(`Destination ${newState ? 'published' : 'unpublished'} successfully`);
        await loadDestinations();
    } catch (e) {
        showToast(e.message || 'Failed to toggle destination status', 'error');
    }
}

async function deleteDestination(id) {
    if (!confirm('Are you sure you want to delete this destination? This action is permanent.')) return;
    try {
        await apiRequest('DELETE', `/destinations/${id}`);
        showToast('Destination permanently deleted');
        await loadDestinations();
    } catch (e) {
        showToast(e.message || 'Error deleting destination', 'error');
    }
}

window.filterDestinations = function() { 
    const term = document.getElementById('destSearch').value.toLowerCase(); 
    const rows = document.getElementById('destBody').querySelectorAll('tr.dest-row'); 
    rows.forEach(r => { 
        const text = r.innerText.toLowerCase(); 
        r.style.display = text.includes(term) ? '' : 'none'; 
    }); 
};

window.loadDestinations = loadDestinations;
window.openDestModal = openDestModal; 
window.toggleDestPublish = toggleDestPublish;
window.deleteDestination = deleteDestination;
window.initEditDestPage = initEditDestPage;
window.saveEditDest = saveEditDest;
