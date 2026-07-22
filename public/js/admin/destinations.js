// ── Destinations ──────────────────────────────────────────────
let destinationsList = [];

async function loadDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
    if (destinationsList.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Loading Destinations...</td></tr>';
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
    
    body.innerHTML = destinationsList.map(d => {
        let statusClass = d.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';
        let statusText = d.is_active ? 'Active' : 'Inactive';
        
        let locString = [d.region, d.country].filter(Boolean).join(', ') || 'Unknown';
        
        return `
        <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100 dest-row">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <img src="${d.featured_image_url || '/images/optimized/balloon.webp'}" alt="${d.name}" class="w-10 h-10 rounded-lg object-cover bg-slate-100" onerror="this.src='/images/optimized/balloon.webp'">
                    <div>
                        <div class="font-medium text-slate-900">${d.name}</div>
                        <div class="text-xs text-slate-500">${d.slug}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600">${locString}</td>
            <td class="px-6 py-4 text-slate-600 font-medium">${d.tour_count || 0}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button class="bg-primary-50 hover:bg-primary-100 text-primary-700 p-1.5 rounded-lg transition-colors" onclick="openDestModal('${d.id}')" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors" onclick="deleteDestination('${d.id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No destinations found.</td></tr>';
}

function openDestModal(id = null) {
    const form = document.getElementById('destForm');
    if (!form) return;
    form.reset();
    document.getElementById('destId').value = '';
    document.getElementById('destModalTitle').textContent = id ? 'Edit Destination' : 'New Destination';
    
    if (id) {
        const d = destinationsList.find(x => x.id == id);
        if (d) {
            document.getElementById('destId').value = d.id;
            Object.entries(d).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { 
                    if (el.type === 'checkbox') el.checked = !!v; 
                    else el.value = v || ''; 
                }
            });
            if (d.gallery_urls) {
                form.querySelector('[name="gallery_urls_csv"]').value = d.gallery_urls.join(', ');
            }
        }
    }
    document.getElementById('destModal').classList.add('active');
}

async function saveDestination(event) {
    const btn = event?.target || document.querySelector('#destModal button.bg-primary-500');
    const form = document.getElementById('destForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('destId').value;
    
    data.is_active = !!form.querySelector('[name="is_active"]')?.checked;
    data.is_featured = !!form.querySelector('[name="is_featured"]')?.checked;
    
    // Parse numeric fields properly
    if (data.display_order) data.display_order = parseInt(data.display_order) || 0;
    if (data.latitude) data.latitude = parseFloat(data.latitude) || null;
    if (data.longitude) data.longitude = parseFloat(data.longitude) || null;
    
    // Parse CSV gallery urls
    if (data.gallery_urls_csv) {
        data.gallery_urls = data.gallery_urls_csv.split(',').map(s => s.trim()).filter(s => s);
        delete data.gallery_urls_csv;
    } else {
        data.gallery_urls = [];
    }
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/destinations/${id}`, data);
        else await apiRequest('POST', '/destinations', data);
        closeModal('destModal');
        showToast('Destination saved');
        await loadDestinations();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteDestination(id) {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
        await apiRequest('DELETE', `/destinations/${id}`);
        showToast('Destination deleted');
        await loadDestinations();
    } catch (e) {}
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
window.saveDestination = saveDestination;
