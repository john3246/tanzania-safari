// ── Enquiries Split-Pane Controller ─────────────────────────────────────
window.enquiriesList = [];
window.currentEnquiryId = null;

async function loadEnquiries() {
    const listContainer = document.getElementById('enqSidebarList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div class="p-8 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>';
    
    try {
        const res = await apiRequest('GET', '/enquiries');
        window.enquiriesList = res.data || [];
        
        document.getElementById('enqCount').textContent = window.enquiriesList.length;
        
        if (window.enquiriesList.length === 0) {
            listContainer.innerHTML = '<div class="p-8 text-center text-slate-500 font-medium">No inquiries found.</div>';
            return;
        }

        listContainer.innerHTML = window.enquiriesList.map(e => {
            const statusName = (e.enquiry_status || 'New');
            const isActive = window.currentEnquiryId == e.enquiry_id;
            
            let statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
            if (statusName.toLowerCase() === 'responded') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (statusName.toLowerCase() === 'closed') statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
            if (statusName.toLowerCase() === 'in progress') statusColor = 'bg-blue-50 text-blue-700 border-blue-200';

            return `
            <div class="p-4 cursor-pointer transition-all hover:bg-slate-50 enquiry-item ${isActive ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}" data-id="${e.enquiry_id}">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <div class="w-8 h-8 shrink-0 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                            ${(e.full_name || 'G')[0]}
                        </div>
                        <div class="truncate">
                            <h4 class="font-bold text-slate-900 text-sm truncate" title="${e.full_name}">${e.full_name}</h4>
                            <p class="text-xs text-slate-500 truncate" title="${e.email}">${e.email}</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0 ml-2">
                        ${new Date(e.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </span>
                </div>
                <div class="flex items-center justify-between mt-3">
                    <span class="text-xs text-slate-600 font-medium truncate">${e.enquiry_type || 'General'}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor} uppercase tracking-wide">
                        ${statusName}
                    </span>
                </div>
            </div>`;
        }).join('');
        
        // Auto-select first item if none selected
        if (!window.currentEnquiryId && window.enquiriesList.length > 0) {
            selectEnquiry(window.enquiriesList[0].enquiry_id);
        } else if (window.currentEnquiryId) {
            selectEnquiry(window.currentEnquiryId); // re-render details
        }

    } catch (err) {
        listContainer.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load inquiries.</div>`;
    }
}

function selectEnquiry(id) {
    const enq = window.enquiriesList.find(x => x.enquiry_id == id);
    if (!enq) return;

    window.currentEnquiryId = id;
    
    // Update sidebar UI selection state
    document.querySelectorAll('.enquiry-item').forEach(el => {
        if (el.dataset.id == id) {
            el.classList.add('bg-blue-50/50', 'border-blue-500');
            el.classList.remove('border-transparent');
        } else {
            el.classList.remove('bg-blue-50/50', 'border-blue-500');
            el.classList.add('border-transparent');
        }
    });

    // Toggle views
    document.getElementById('enqEmptyState').classList.add('hidden');
    document.getElementById('enqDetailView').classList.remove('hidden');

    // Populate Details
    document.getElementById('enqDetailAvatar').textContent = (enq.full_name || 'G')[0].toUpperCase();
    document.getElementById('enqDetailName').textContent = enq.full_name;
    document.getElementById('enqDetailEmail').textContent = enq.email;
    document.getElementById('enqDetailEmail').href = `mailto:${enq.email}`;
    document.getElementById('enqDetailType').textContent = enq.enquiry_type || 'General';
    document.getElementById('enqDetailDate').textContent = new Date(enq.created_at).toLocaleString();
    document.getElementById('enqDetailMessage').textContent = enq.enquiry_message || 'No message provided.';
    
    // Status Badge
    const statusName = (enq.enquiry_status || 'New');
    const statusBadge = document.getElementById('enqDetailStatus');
    statusBadge.textContent = statusName;
    
    statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ';
    if (statusName.toLowerCase() === 'responded') statusBadge.className += 'bg-emerald-100 text-emerald-700';
    else if (statusName.toLowerCase() === 'closed') statusBadge.className += 'bg-slate-200 text-slate-700';
    else if (statusName.toLowerCase() === 'in progress') statusBadge.className += 'bg-blue-100 text-blue-700';
    else statusBadge.className += 'bg-yellow-100 text-yellow-700';

    // Status Dropdown
    const statusDropdown = document.getElementById('enqUpdateStatus');
    statusDropdown.value = statusName;

    // Reset Form
    document.getElementById('enqResponseText').value = '';
}

// ── Event Delegation ──────────────────────────────────────────────────
document.body.addEventListener('click', async (e) => {
    
    // Select Inquiry from Sidebar
    const enqItem = e.target.closest('.enquiry-item');
    if (enqItem) {
        selectEnquiry(enqItem.dataset.id);
    }

    // Delete Inquiry
    const btnDelete = e.target.closest('#btnDeleteEnquiry');
    if (btnDelete && window.currentEnquiryId) {
        if (!confirm('Are you sure you want to permanently delete this inquiry?')) return;
        try {
            await apiRequest('DELETE', `/enquiries/${window.currentEnquiryId}`);
            showToast('Inquiry deleted successfully', 'success');
            window.currentEnquiryId = null;
            document.getElementById('enqEmptyState').classList.remove('hidden');
            document.getElementById('enqDetailView').classList.add('hidden');
            loadEnquiries();
        } catch (err) {
            showToast('Failed to delete inquiry', 'error');
        }
    }

    // Send Response
    const btnSend = e.target.closest('#btnSendEnquiryResponse');
    if (btnSend && window.currentEnquiryId) {
        const responseText = document.getElementById('enqResponseText').value;
        if (!responseText.trim()) {
            showToast('Please type a response before sending.', 'error');
            return;
        }

        const originalHtml = btnSend.innerHTML;
        btnSend.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        btnSend.disabled = true;

        try {
            await apiRequest('PUT', `/enquiries/${window.currentEnquiryId}/respond`, { response: responseText });
            showToast('Response sent successfully', 'success');
            document.getElementById('enqResponseText').value = '';
            loadEnquiries(); // Will auto-reselect and refresh details
        } catch (err) {
            showToast('Failed to send response', 'error');
        }

        btnSend.innerHTML = originalHtml;
        btnSend.disabled = false;
    }
});

document.body.addEventListener('change', async (e) => {
    // Update Status Dropdown
    if (e.target.id === 'enqUpdateStatus' && window.currentEnquiryId) {
        const newStatus = e.target.value;
        try {
            await apiRequest('PUT', `/enquiries/${window.currentEnquiryId}`, { enquiry_status: newStatus });
            showToast(`Status updated to ${newStatus}`, 'success');
            loadEnquiries();
        } catch (err) {
            showToast('Failed to update status', 'error');
            // Revert dropdown if possible
            if(window.enquiriesList) {
                const enq = window.enquiriesList.find(x => x.enquiry_id == window.currentEnquiryId);
                if(enq) e.target.value = enq.enquiry_status || 'New';
            }
        }
    }
});
