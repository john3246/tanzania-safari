// ── Enquiries ─────────────────────────────────────────────────
let enquiriesList = [];
async function loadEnquiries() {
    const body = document.getElementById('enqBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/enquiries');
        enquiriesList = res.data || [];
        body.innerHTML = enquiriesList.map(e => {
            const statusName = (e.enquiry_status || 'New').toLowerCase();
            let statusClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
            if (statusName === 'responded') statusClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
            
            return `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-xs">
                            ${(e.full_name || 'G')[0].toUpperCase()}
                        </div>
                        <div>
                            <span class="font-medium text-slate-900 block">${e.full_name}</span>
                            <span class="text-xs text-slate-500 block">${e.email}</span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-700">${e.enquiry_type || 'General'}</td>
                <td class="px-6 py-4 text-slate-600">${new Date(e.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusClass}">
                        ${e.enquiry_status || 'New'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button class="bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2" onclick="openEnqModal('${e.enquiry_id}')">
                        <i class="ph ph-arrow-u-up-left"></i> Respond
                    </button>
                </td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No enquiries found.</td></tr>';
    } catch (e) {}
}

function openEnqModal(id) {
    const e = enquiriesList.find(x => x.enquiry_id == id);
    if (!e) return;
    document.getElementById('enqRespondId').value = id;
    document.getElementById('enqResponse').value = '';
    document.getElementById('enqDetails').innerHTML = `<div class="font-medium text-slate-900">${e.full_name}</div><div class="text-xs text-slate-500 mb-3">${e.email}</div><div class="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 italic border border-slate-100">"${e.enquiry_message}"</div>`;
    
    // Show Modal
    const modal = document.getElementById('enqModal');
    if (modal) modal.classList.add('active');
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
