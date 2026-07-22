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
        const statusClass = d.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500';
        const statusText = d.is_active ? 'Active' : 'Inactive';
        const featuredBadge = d.is_featured 
            ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><i class="fa-solid fa-star mr-1"></i> Featured</span>'
            : '<span class="text-slate-400">—</span>';
        
        const locString = [d.region, d.country].filter(Boolean).join(', ') || '—';
        
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
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusClass}">
                    ${statusText}
                </span>
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
    editForm.reset();
    mediaForm.reset();
    geoForm.reset();

    document.getElementById('editDestId').value = '';

    const id = window.currentEditDestId;
    document.getElementById('editDestTitle').textContent = id ? 'Edit Destination' : 'Create New Destination';

    if (id) {
        const d = destinationsList.find(x => x.id == id);
        if (d) {
            document.getElementById('editDestId').value = d.id;
            
            // Populate fields
            Object.entries(d).forEach(([k, v]) => {
                [editForm, mediaForm, geoForm].forEach(f => {
                    const el = f.querySelector(`[name="${k}"]`);
                    if (el) {
                        if (el.type === 'checkbox') el.checked = !!v;
                        else el.value = v || '';
                    }
                });
            });

            // Set checkboxes
            document.getElementById('editDestActive').checked = !!d.is_active;
            document.getElementById('editDestFeatured').checked = !!d.is_featured;

            // Populate CSV Gallery
            if (d.gallery_urls) {
                mediaForm.querySelector('[name="gallery_urls_csv"]').value = d.gallery_urls.join(', ');
            }
        }
    }
}

async function saveEditDest(btn) {
    const id = document.getElementById('editDestId').value;
    const editData = Object.fromEntries(new FormData(document.getElementById('editDestForm')));
    const mediaData = Object.fromEntries(new FormData(document.getElementById('editDestMediaForm')));
    const geoData = Object.fromEntries(new FormData(document.getElementById('editDestGeoForm')));

    const data = {
        ...editData,
        ...mediaData,
        ...geoData
    };

    // Parse status and boolean checkboxes
    data.is_active = !!document.getElementById('editDestActive').checked;
    data.is_featured = !!document.getElementById('editDestFeatured').checked;

    // Process Gallery CSV
    if (data.gallery_urls_csv) {
        data.gallery_urls = data.gallery_urls_csv.split(',').map(s => s.trim()).filter(Boolean);
        delete data.gallery_urls_csv;
    } else {
        data.gallery_urls = [];
    }

    // Clean empty values to make sure Zod optional schema parses them correctly
    Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
            delete data[key];
        }
    });

    setLoading(btn, true);
    try {
        if (id) {
            await apiRequest('PUT', `/destinations/${id}`, data);
            showToast('Destination updated successfully');
        } else {
            await apiRequest('POST', '/destinations', data);
            showToast('Destination created successfully');
        }
        navigate('destinations');
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Error saving destination', 'error');
    } finally {
        setLoading(btn, false);
    }
}

async function deleteDestination(id) {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
        await apiRequest('DELETE', `/destinations/${id}`);
        showToast('Destination deleted successfully');
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

window.openDestModal = openDestModal; 
window.deleteDestination = deleteDestination;
window.initEditDestPage = initEditDestPage;
window.saveEditDest = saveEditDest;
