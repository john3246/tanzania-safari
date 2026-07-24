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
                    <div class="flex items-center gap-2">
                        <button class="bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 btn-respond" data-id="${e.enquiry_id}">
                            <i class="fa-solid fa-reply"></i> Respond
                        </button>
                        <button class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors btn-edit" data-id="${e.enquiry_id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors btn-delete" data-id="${e.enquiry_id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No enquiries found.</td></tr>';
    } catch (e) {}
}

// Event Delegation
document.body.addEventListener('click', async (e) => {
    // Close Modal buttons
    const btnClose = e.target.closest('[data-close]');
    if (btnClose) {
        closeModal(btnClose.dataset.close);
    }

    // Respond Modal
    const btnRespond = e.target.closest('.btn-respond');
    if (btnRespond) {
        const id = btnRespond.dataset.id;
        const enq = enquiriesList.find(x => x.enquiry_id == id);
        if (enq) {
            document.getElementById('enqRespondId').value = id;
            document.getElementById('enqResponse').value = '';
            document.getElementById('enqDetails').innerHTML = `<div class="font-medium text-slate-900">${enq.full_name}</div><div class="text-xs text-slate-500 mb-3">${enq.email}</div><div class="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 italic border border-slate-100">"${enq.enquiry_message}"</div>`;
            const modal = document.getElementById('enqModal');
            if (modal) modal.classList.add('active');
        }
    }

    // Send Response
    const btnSendEnquiryResponse = e.target.closest('#btnSendEnquiryResponse');
    if (btnSendEnquiryResponse) {
        const id = document.getElementById('enqRespondId').value;
        const response = document.getElementById('enqResponse').value;
        if (!response.trim()) return;
        
        btnSendEnquiryResponse.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        btnSendEnquiryResponse.disabled = true;

        try {
            await apiRequest('PUT', `/enquiries/${id}/respond`, { response });
            showToast('Response Sent', 'success');
            closeModal('enqModal');
            loadEnquiries();
        } catch (err) {
            showToast('Error sending response', 'error');
        }

        btnSendEnquiryResponse.innerHTML = 'Send Response';
        btnSendEnquiryResponse.disabled = false;
    }

    // Edit Modal
    const btnEdit = e.target.closest('.btn-edit');
    if (btnEdit) {
        const id = btnEdit.dataset.id;
        const enq = enquiriesList.find(x => x.enquiry_id == id);
        if (enq) {
            document.getElementById('editEnqId').value = id;
            document.getElementById('editEnqStatus').value = enq.enquiry_status || 'New';
            const modal = document.getElementById('editEnqModal');
            if (modal) modal.classList.add('active');
        }
    }

    // Save Edit
    const btnSaveEnquiry = e.target.closest('#btnSaveEnquiry');
    if (btnSaveEnquiry) {
        const id = document.getElementById('editEnqId').value;
        const status = document.getElementById('editEnqStatus').value;
        
        btnSaveEnquiry.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        btnSaveEnquiry.disabled = true;

        try {
            await apiRequest('PUT', `/enquiries/${id}`, { enquiry_status: status });
            showToast('Enquiry updated successfully', 'success');
            closeModal('editEnqModal');
            loadEnquiries();
        } catch (err) {
            showToast('Error updating enquiry', 'error');
        }

        btnSaveEnquiry.innerHTML = 'Save Changes';
        btnSaveEnquiry.disabled = false;
    }

    // Delete
    const btnDelete = e.target.closest('.btn-delete');
    if (btnDelete) {
        if (confirm('Are you sure you want to permanently delete this inquiry?')) {
            const id = btnDelete.dataset.id;
            try {
                await apiRequest('DELETE', `/enquiries/${id}`);
                showToast('Inquiry deleted successfully', 'success');
                loadEnquiries();
            } catch (err) {
                showToast('Error deleting inquiry', 'error');
            }
        }
    }
});
