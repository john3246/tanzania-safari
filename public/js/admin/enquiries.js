// ── Enquiries Solid Corporate WhatsApp Controller ─────────────────────────────────────
window.enquiriesList = [];
window.currentEnquiryId = null;
window.currentEnqFilter = 'all';

async function loadEnquiries() {
    const listContainer = document.getElementById('enqSidebarList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div class="p-8 text-center text-slate-500 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-2xl text-[#075e54]"></i><p class="text-xs mt-2">Loading customer inquiries...</p></div>';
    
    try {
        const res = await apiRequest('GET', '/enquiries');
        window.enquiriesList = res.data || [];
        
        const countBadge = document.getElementById('enqCount');
        if (countBadge) countBadge.textContent = `${window.enquiriesList.length} INQUIRIES`;
        
        filterEnquiriesList();

        // Auto-select first item if none selected
        if (!window.currentEnquiryId && window.enquiriesList.length > 0) {
            selectEnquiry(window.enquiriesList[0].enquiry_id);
        } else if (window.currentEnquiryId) {
            selectEnquiry(window.currentEnquiryId);
        }

    } catch (err) {
        console.error('loadEnquiries error:', err);
        listContainer.innerHTML = `<div class="p-8 text-center text-red-600 text-xs font-black">Failed to load inquiries.</div>`;
    }
}

function setEnqFilter(filter) {
    window.currentEnqFilter = filter;
    document.querySelectorAll('.enq-filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.className = 'enq-filter-btn active text-xs font-extrabold px-3 py-1.5 rounded-lg bg-[#075e54] text-white border border-[#075e54] transition-all shadow-sm';
        } else {
            btn.className = 'enq-filter-btn text-xs font-extrabold px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300 transition-all';
        }
    });
    filterEnquiriesList();
}

function filterEnquiriesList() {
    const listContainer = document.getElementById('enqSidebarList');
    if (!listContainer) return;

    const searchTerm = (document.getElementById('enqSearchInput')?.value || '').toLowerCase();
    
    let filtered = window.enquiriesList.filter(e => {
        const matchSearch = (e.full_name || '').toLowerCase().includes(searchTerm) ||
                            (e.email || '').toLowerCase().includes(searchTerm) ||
                            (e.enquiry_message || '').toLowerCase().includes(searchTerm);
        
        if (!matchSearch) return false;
        
        if (window.currentEnqFilter === 'all') return true;
        const status = (e.enquiry_status || 'New').toLowerCase();
        return status === window.currentEnqFilter;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs font-bold">No inquiries found matching search.</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(e => {
        const statusName = (e.enquiry_status || 'New');
        const isActive = window.currentEnquiryId == e.enquiry_id;
        
        let statusBadgeClass = 'bg-yellow-500 text-white';
        if (statusName.toLowerCase() === 'responded') statusBadgeClass = 'bg-emerald-600 text-white';
        else if (statusName.toLowerCase() === 'closed') statusBadgeClass = 'bg-slate-600 text-white';
        else if (statusName.toLowerCase() === 'in progress') statusBadgeClass = 'bg-blue-600 text-white';

        const lastMsg = e.response_notes ? `REPLIED: ${e.response_notes}` : (e.enquiry_message || 'New inquiry');
        const dateStr = new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        return `
        <div class="p-4 cursor-pointer transition-all hover:bg-slate-200/80 enquiry-item ${isActive ? 'bg-emerald-100/90 border-l-8 border-[#075e54]' : 'bg-white border-l-8 border-transparent'}" data-id="${e.enquiry_id}">
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 shrink-0 rounded-xl bg-[#075e54] text-white flex items-center justify-center font-black text-sm uppercase shadow-sm">
                    ${(e.full_name || 'G')[0]}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1 mb-1">
                        <h4 class="font-black text-slate-900 text-sm truncate" title="${e.full_name}">${e.full_name}</h4>
                        <span class="text-[10px] font-extrabold text-slate-500 shrink-0 ml-1">${dateStr}</span>
                    </div>
                    <p class="text-xs text-slate-700 font-semibold truncate mb-2" title="${lastMsg}">${lastMsg}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black text-slate-600 uppercase tracking-wider truncate">${e.enquiry_type || 'GENERAL'}</span>
                        <span class="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${statusBadgeClass}">
                            ${statusName}
                        </span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function selectEnquiry(id) {
    const enq = window.enquiriesList.find(x => x.enquiry_id == id);
    if (!enq) return;

    window.currentEnquiryId = id;
    
    // Update sidebar UI selection state
    document.querySelectorAll('.enquiry-item').forEach(el => {
        if (el.dataset.id == id) {
            el.classList.add('bg-emerald-100/90', 'border-[#075e54]');
            el.classList.remove('bg-white', 'border-transparent');
        } else {
            el.classList.remove('bg-emerald-100/90', 'border-[#075e54]');
            el.classList.add('bg-white', 'border-transparent');
        }
    });

    // Toggle views
    const emptyState = document.getElementById('enqEmptyState');
    const detailView = document.getElementById('enqDetailView');
    if (emptyState) emptyState.classList.add('hidden');
    if (detailView) detailView.classList.remove('hidden');

    // Populate Details Header
    const avatarEl = document.getElementById('enqDetailAvatar');
    if (avatarEl) avatarEl.textContent = (enq.full_name || 'G')[0].toUpperCase();

    const nameEl = document.getElementById('enqDetailName');
    if (nameEl) nameEl.textContent = enq.full_name;

    const emailEl = document.getElementById('enqDetailEmail');
    if (emailEl) {
        emailEl.textContent = enq.email;
        emailEl.href = `mailto:${enq.email}`;
    }

    const phoneEl = document.getElementById('enqDetailPhone');
    if (phoneEl) {
        phoneEl.innerHTML = `<i class="fa-solid fa-phone"></i> ${enq.phone || 'N/A'}`;
    }

    const typeEl = document.getElementById('enqDetailType');
    if (typeEl) typeEl.textContent = (enq.enquiry_type || 'GENERAL INQUIRY').toUpperCase();

    const metaEl = document.getElementById('enqDetailMeta');
    if (metaEl) {
        const travelers = enq.number_of_travelers ? `${enq.number_of_travelers} Travelers` : 'Standard group';
        const dateStr = enq.preferred_travel_date ? new Date(enq.preferred_travel_date).toLocaleDateString() : 'Flexible Date';
        const countryStr = enq.country ? ` | ${enq.country}` : '';
        metaEl.textContent = `${travelers} | ${dateStr}${countryStr}`;
    }

    const dateEl = document.getElementById('enqDetailDate');
    if (dateEl) dateEl.textContent = new Date(enq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageEl = document.getElementById('enqDetailMessage');
    if (messageEl) messageEl.textContent = enq.enquiry_message || 'No details provided.';
    
    // Status Badge
    const statusName = (enq.enquiry_status || 'New');
    const statusBadge = document.getElementById('enqDetailStatus');
    if (statusBadge) {
        statusBadge.textContent = statusName;
        statusBadge.className = 'px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ';
        if (statusName.toLowerCase() === 'responded') statusBadge.className += 'bg-emerald-600 text-white';
        else if (statusName.toLowerCase() === 'closed') statusBadge.className += 'bg-slate-700 text-white';
        else if (statusName.toLowerCase() === 'in progress') statusBadge.className += 'bg-blue-600 text-white';
        else statusBadge.className += 'bg-yellow-500 text-white';
    }

    // Status Dropdown
    const statusDropdown = document.getElementById('enqUpdateStatus');
    if (statusDropdown) statusDropdown.value = statusName;

    // Date divider
    const dateDivider = document.getElementById('enqDateDivider');
    if (dateDivider) dateDivider.textContent = new Date(enq.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    // Render Outgoing Response Thread
    renderResponseThread(enq);

    // Scroll canvas to bottom
    const canvas = document.getElementById('enqMessagesCanvas');
    if (canvas) {
        setTimeout(() => { canvas.scrollTop = canvas.scrollHeight; }, 100);
    }
}

function renderResponseThread(enq) {
    const threadContainer = document.getElementById('enqResponseThread');
    if (!threadContainer) return;

    let responses = [];
    try {
        responses = typeof enq.responses === 'string' ? JSON.parse(enq.responses) : (enq.responses || []);
    } catch (e) { responses = []; }

    // Fallback if legacy response_notes exists but responses array is empty
    if (responses.length === 0 && enq.response_notes) {
        responses = [{
            id: 'legacy-1',
            sender: 'Admin',
            text: enq.response_notes,
            created_at: enq.responded_at || enq.updated_at || new Date().toISOString()
        }];
    }

    if (responses.length === 0) {
        threadContainer.innerHTML = '';
        return;
    }

    threadContainer.innerHTML = responses.map(r => {
        const timeStr = r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return `
        <div class="flex justify-end">
            <div class="bg-[#075e54] text-white rounded-2xl p-5 shadow-md border-2 border-emerald-800 max-w-[85%] sm:max-w-[75%] space-y-2">
                <div class="flex items-center justify-between gap-4 pb-1 mb-2 border-b border-emerald-600">
                    <span class="text-xs font-black text-[#25d366] uppercase tracking-wider flex items-center gap-1">
                        <i class="fa-solid fa-paper-plane"></i> SENT VIA EMAIL
                    </span>
                    <span class="text-xs font-bold text-slate-200">${timeStr}</span>
                </div>
                <p class="text-white text-sm font-semibold leading-relaxed whitespace-pre-wrap">${r.text}</p>
                <div class="flex items-center justify-end gap-1.5 mt-2 text-xs font-black text-[#25d366]">
                    <span>DELIVERED TO CUSTOMER</span>
                    <i class="fa-solid fa-check-double text-sm"></i>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function handleSendEnquiryReply() {
    if (!window.currentEnquiryId) return;

    const textarea = document.getElementById('enqResponseText');
    const responseText = textarea ? textarea.value.trim() : '';

    if (!responseText) {
        if (typeof showToast === 'function') showToast('Please type a response before sending.', 'error');
        return;
    }

    const btnSend = document.getElementById('btnSendEnquiryResponse');
    const originalHtml = btnSend ? btnSend.innerHTML : '';
    if (btnSend) {
        btnSend.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-base"></i> SENDING...';
        btnSend.disabled = true;
    }

    try {
        const res = await apiRequest('PUT', `/enquiries/${window.currentEnquiryId}/respond`, { response: responseText });
        
        if (typeof showToast === 'function') {
            showToast('Email reply sent successfully!', 'success');
        }
        
        if (textarea) textarea.value = '';

        // Reload inquiries to update list and active thread
        await loadEnquiries();

    } catch (err) {
        console.error('handleSendEnquiryReply error:', err);
        if (typeof showToast === 'function') showToast(err.message || 'Failed to send response email.', 'error');
    } finally {
        if (btnSend) {
            btnSend.innerHTML = originalHtml;
            btnSend.disabled = false;
        }
    }
}

// Global Event Listeners
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
            if (typeof showToast === 'function') showToast('Inquiry deleted successfully', 'success');
            window.currentEnquiryId = null;
            document.getElementById('enqEmptyState')?.classList.remove('hidden');
            document.getElementById('enqDetailView')?.classList.add('hidden');
            loadEnquiries();
        } catch (err) {
            if (typeof showToast === 'function') showToast('Failed to delete inquiry', 'error');
        }
    }
});

document.body.addEventListener('change', async (e) => {
    // Update Status Dropdown
    if (e.target.id === 'enqUpdateStatus' && window.currentEnquiryId) {
        const newStatus = e.target.value;
        try {
            await apiRequest('PUT', `/enquiries/${window.currentEnquiryId}`, { enquiry_status: newStatus });
            if (typeof showToast === 'function') showToast(`Status updated to ${newStatus}`, 'success');
            loadEnquiries();
        } catch (err) {
            if (typeof showToast === 'function') showToast('Failed to update status', 'error');
        }
    }
});

window.loadEnquiries = loadEnquiries;
