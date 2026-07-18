// ── Destinations ──────────────────────────────────────────────
let destinationsList = [];
async function loadDestinations() {
    const body = document.getElementById('destBody');
    if (!body) return;
    if (destinationsList.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Initializing Destinations...</td></tr>';
    }
    try {
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
