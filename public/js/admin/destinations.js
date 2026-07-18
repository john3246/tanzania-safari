// ── Destinations ──────────────────────────────────────────────
let destinationsList = [];

async function loadDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
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
        return `
        <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <img src="${d.image_url || '/images/placeholder.jpg'}" alt="${d.park_name}" class="w-10 h-10 rounded-lg object-cover bg-slate-100">
                    <div>
                        <div class="font-medium text-slate-900">${d.park_name}</div>
                        <div class="text-xs text-slate-500">${d.location || 'Unknown'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600">${d.size_sq_km ? d.size_sq_km.toLocaleString() + ' km²' : '-'}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${d.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">
                    ${d.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button class="bg-primary-50 hover:bg-primary-100 text-primary-700 p-1.5 rounded-lg transition-colors" onclick="openDestModal('${d.park_id}')" title="Edit">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="4" class="px-6 py-12 text-center text-slate-500">No destinations found.</td></tr>';
}

function openDestModal(id = null) {
    const form = document.getElementById('destForm');
    form.reset();
    document.getElementById('destId').value = '';
    document.getElementById('destModalTitle').textContent = id ? 'Edit Destination' : 'New Destination';
    
    if (id) {
        const d = destinationsList.find(x => x.park_id == id);
        if (d) {
            document.getElementById('destId').value = d.park_id;
            Object.entries(d).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { 
                    if (el.type === 'checkbox') el.checked = !!v; 
                    else el.value = v || ''; 
                }
            });
        }
    }
    document.getElementById('destModal').classList.add('active');
}

async function saveDestination(event) {
    const btn = event.target;
    const form = document.getElementById('destForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('destId').value;
    
    data.is_active = !!form.querySelector('[name="is_active"]')?.checked;
    data.is_unesco_heritage = !!form.querySelector('[name="is_unesco_heritage"]')?.checked;
    
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
