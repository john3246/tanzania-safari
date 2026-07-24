let currentBookingData = null;

async function loadBookingDetails() {
    if (!window.currentBookingId) {
        navigate('bookings');
        return;
    }

    try {
        const res = await apiRequest('GET', `/bookings/${window.currentBookingId}`);
        if (res.success) {
            currentBookingData = res.data;
            renderBookingDetails();
        } else {
            showToast('Failed to load booking details', 'error');
            navigate('bookings');
        }
    } catch (error) {
        console.error('Error loading booking details:', error);
        showToast('Error loading details', 'error');
        navigate('bookings');
    }
}

function renderBookingDetails() {
    const b = currentBookingData;
    if (!b) return;

    // Header
    document.getElementById('detailBookingId').innerText = `#${(b.booking_id||'').substring(0,8).toUpperCase()}`;
    
    // Status Badge
    const badge = document.getElementById('detailStatusBadge');
    badge.className = 'px-3 py-1 rounded-full text-xs font-bold shadow-sm border ';
    if (b.status_name === 'Confirmed') badge.className += 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (b.status_name === 'Pending') badge.className += 'bg-amber-50 text-amber-700 border-amber-200';
    else badge.className += 'bg-gray-100 text-gray-700 border-gray-200';
    badge.innerText = b.status_name || 'Pending';

    // Left Panel: Customer Profile
    document.getElementById('detailCustomerInitials').innerText = b.full_name ? b.full_name.charAt(0).toUpperCase() : 'U';
    document.getElementById('detailCustomerName').innerText = b.full_name || 'Guest';
    document.getElementById('detailCustomerEmail').innerText = b.email || 'No email provided';
    document.getElementById('detailCustomerPhone').innerText = b.phone || 'N/A';
    document.getElementById('detailCustomerCountry').innerText = b.country || 'N/A';

    // Left Panel: Trip Info
    document.getElementById('detailPackageName').innerText = b.package_name || 'Custom Package';
    document.getElementById('detailStartDate').innerText = b.start_date ? new Date(b.start_date).toLocaleDateString() : 'N/A';
    document.getElementById('detailAdults').innerText = b.adults || '0';
    document.getElementById('detailChildren').innerText = b.children || '0';
    document.getElementById('detailSpecialRequests').innerText = b.special_requests || 'No special requests.';

    // Render Communications
    renderTimeline();
    
    // Render Financials
    renderFinancials();

    // Toggle Action Buttons based on status
    document.getElementById('btnApproveBooking').style.display = b.status_name === 'Confirmed' ? 'none' : 'flex';
    document.getElementById('btnRejectBooking').style.display = (b.status_name === 'Rejected' || b.status_name === 'Cancelled') ? 'none' : 'flex';
}

function formatMoney(amount) {
    return '$' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderFinancials() {
    const b = currentBookingData;
    if (!b) return;

    const total = parseFloat(b.total_amount || 0);
    const discount = parseFloat(b.discount_amount || 0);
    const paid = parseFloat(b.paid_amount || 0);
    const balance = Math.max(0, total - discount - paid);

    document.getElementById('detailTotalAmount').innerText = formatMoney(total);
    document.getElementById('detailDiscountAmount').innerText = '-' + formatMoney(discount);
    document.getElementById('detailPaidAmount').innerText = formatMoney(paid);
    document.getElementById('detailBalanceDue').innerText = formatMoney(balance);

    const payList = document.getElementById('paymentHistoryList');
    payList.innerHTML = '';
    
    const payments = b.payments || [];
    if (payments.length === 0) {
        payList.innerHTML = '<li class="p-5 text-center text-gray-400 text-sm italic">No payments recorded yet.</li>';
    } else {
        payments.forEach(p => {
            payList.innerHTML += `
                <li class="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                    <div>
                        <p class="text-sm font-bold text-gray-900">${formatMoney(p.amount)}</p>
                        <p class="text-xs text-gray-500">${new Date(p.payment_date).toLocaleDateString()} &middot; ${p.payment_method}</p>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">${p.payment_status}</span>
                </li>
            `;
        });
    }
}

function renderTimeline() {
    const feed = document.getElementById('timelineFeed');
    feed.innerHTML = '';

    const comms = currentBookingData.communications || [];
    
    // Always add a "Booking Created" event at the bottom
    comms.push({
        type: 'system',
        subject: 'Booking Created',
        content: 'Customer submitted the booking request online.',
        created_at: currentBookingData.created_at,
        direction: 'inbound'
    });

    // Sort descending
    comms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    comms.forEach(c => {
        let icon = 'fa-circle-info';
        let color = 'bg-gray-200 text-gray-600';
        let bgClass = 'bg-white border-gray-200';

        if (c.type === 'email') {
            icon = c.direction === 'inbound' ? 'fa-envelope-open-text' : 'fa-paper-plane';
            color = c.direction === 'inbound' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary-100 text-primary-600';
        } else if (c.type === 'note') {
            icon = 'fa-note-sticky';
            color = 'bg-amber-100 text-amber-600';
            bgClass = 'bg-amber-50/50 border-amber-200';
        } else if (c.type === 'status_change') {
            icon = 'fa-rotate';
            color = 'bg-emerald-100 text-emerald-600';
        }

        feed.innerHTML += `
            <div class="relative pl-6 pb-2 border-l-2 border-gray-200 last:border-0 last:pb-0">
                <div class="absolute -left-[17px] top-0 w-8 h-8 rounded-full ${color} flex items-center justify-center border-4 border-slate-50">
                    <i class="fa-solid ${icon} text-xs"></i>
                </div>
                <div class="${bgClass} border rounded-lg p-4 shadow-sm ml-2 relative">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-bold text-gray-800 text-sm">${c.subject}</span>
                        <span class="text-xs text-gray-400 whitespace-nowrap ml-2">${new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p class="text-sm text-gray-600 whitespace-pre-wrap">${c.content}</p>
                </div>
            </div>
        `;
    });
}

// Actions via Event Delegation
document.body.addEventListener('click', async (e) => {
    // Note vs Email Tabs
    const tab = e.target.closest('.comm-tab');
    if (tab) {
        document.querySelectorAll('.comm-tab').forEach(t => {
            t.className = 'comm-tab px-3 py-1 text-xs font-medium rounded text-gray-500 hover:text-gray-700 hover:bg-gray-50';
        });
        tab.className = 'comm-tab active px-3 py-1 text-xs font-medium rounded bg-white text-gray-900 shadow-sm';
        
        if (tab.dataset.type === 'email') {
            document.getElementById('commEmailBox').classList.remove('hidden');
            document.getElementById('commNoteBox').classList.add('hidden');
        } else {
            document.getElementById('commNoteBox').classList.remove('hidden');
            document.getElementById('commEmailBox').classList.add('hidden');
        }
    }

    // Approve Booking
    const btnApprove = e.target.closest('#btnApproveBooking');
    if (btnApprove) {
        if(!confirm('Are you sure you want to approve this booking? The customer will be notified.')) return;
        
        const originalText = btnApprove.innerHTML;
        btnApprove.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Approving...';
        btnApprove.disabled = true;

        const res = await apiRequest('PUT', `/bookings/${window.currentBookingId}/status`, { status: 'confirmed' });

        if(res.success) {
            showToast('Booking approved successfully', 'success');
            loadBookingDetails();
        } else {
            showToast(res.message || 'Failed to approve booking', 'error');
        }
        
        btnApprove.innerHTML = originalText;
        btnApprove.disabled = false;
    }

    // Reject Booking
    const btnReject = e.target.closest('#btnRejectBooking');
    if (btnReject) {
        if(!confirm('Are you sure you want to reject this booking? The customer will be notified.')) return;
        
        const originalText = btnReject.innerHTML;
        btnReject.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rejecting...';
        btnReject.disabled = true;

        const res = await apiRequest('PUT', `/bookings/${window.currentBookingId}/status`, { status: 'rejected' });

        if(res.success) {
            showToast('Booking rejected successfully', 'success');
            loadBookingDetails();
        } else {
            showToast(res.message || 'Failed to reject booking', 'error');
        }
        
        btnReject.innerHTML = originalText;
        btnReject.disabled = false;
    }

    // Send Reply
    const btnSendReply = e.target.closest('#btnSendReply');
    if (btnSendReply) {
        const subject = document.getElementById('commSubject').value;
        const message = document.getElementById('commMessage').value;

        if(!message) {
            showToast('Message cannot be empty', 'warning');
            return;
        }

        btnSendReply.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        btnSendReply.disabled = true;

        const res = await apiRequest('POST', `/bookings/${window.currentBookingId}/reply`, { subject, message });

        if(res.success) {
            showToast('Email sent successfully', 'success');
            document.getElementById('commSubject').value = '';
            document.getElementById('commMessage').value = '';
            loadBookingDetails();
        } else {
            showToast(res.message || 'Failed to send email', 'error');
        }

        btnSendReply.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Email';
        btnSendReply.disabled = false;
    }

    // Add Note
    const btnAddNote = e.target.closest('#btnAddNote');
    if (btnAddNote) {
        const note = document.getElementById('commNoteContent').value;

        if(!note) {
            showToast('Note cannot be empty', 'warning');
            return;
        }

        btnAddNote.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        btnAddNote.disabled = true;

        const res = await apiRequest('POST', `/bookings/${window.currentBookingId}/notes`, { note });

        if(res.success) {
            showToast('Note saved successfully', 'success');
            document.getElementById('commNoteContent').value = '';
            loadBookingDetails();
        } else {
            showToast(res.message || 'Failed to save note', 'error');
        }

        btnAddNote.innerHTML = '<i class="fa-solid fa-thumbtack"></i> Save Note';
        btnAddNote.disabled = false;
    }

    // Record Payment
    const btnRecordPayment = e.target.closest('#btnRecordPayment');
    if (btnRecordPayment) {
        const amountStr = prompt('Enter payment amount to record (e.g. 500.00):');
        if(!amountStr) return;
        const amount = parseFloat(amountStr);
        if(isNaN(amount) || amount <= 0) {
            showToast('Invalid amount', 'error');
            return;
        }

        const method = prompt('Enter payment method (e.g. credit_card, bank_transfer):', 'credit_card');
        if(!method) return;

        const res = await apiRequest('POST', `/bookings/${window.currentBookingId}/payments`, { amount, payment_method: method });

        if(res.success) {
            showToast('Payment recorded successfully', 'success');
            loadBookingDetails();
        } else {
            showToast(res.message || 'Failed to record payment', 'error');
        }
    }

    // Delete Booking
    const btnDeleteBooking = e.target.closest('#btnDeleteBooking');
    if (btnDeleteBooking) {
        if (confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
            const res = await apiRequest('DELETE', `/bookings/${window.currentBookingId}`);
            if (res.success) {
                showToast('Booking deleted', 'success');
                setTimeout(() => { navigate('bookings'); }, 1000);
            } else {
                showToast(res.message || 'Failed to delete booking', 'error');
            }
        }
    }
});

// --- Modal & Edit Logic ---
let packagesLoaded = false;

async function loadPackagesForEdit() {
    if (packagesLoaded) return;
    const res = await apiRequest('GET', '/packages');
    if (res.success && res.data) {
        const select = document.getElementById('editPackageId');
        res.data.forEach(pkg => {
            const opt = document.createElement('option');
            opt.value = pkg.package_id;
            opt.textContent = pkg.package_name;
            select.appendChild(opt);
        });
        packagesLoaded = true;
    }
}

window.openEditBookingModal = async function() {
    if (!currentBookingData) return;
    await loadPackagesForEdit();
    const b = currentBookingData;
    
    document.getElementById('editPackageId').value = b.package_id || '';
    document.getElementById('editStartDate').value = b.start_date ? b.start_date.split('T')[0] : '';
    document.getElementById('editEndDate').value = b.end_date ? b.end_date.split('T')[0] : '';
    document.getElementById('editAdults').value = b.number_of_adults || 1;
    document.getElementById('editChildren').value = b.number_of_children || 0;
    document.getElementById('editTotalAmount').value = b.total_amount || 0;
    document.getElementById('editDiscountAmount').value = b.discount_amount || 0;
    document.getElementById('editSpecialRequests').value = b.special_requests || '';
    
    const modal = document.getElementById('editBookingModal');
    modal.classList.remove('hidden');
    // slight delay for transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
};

window.closeEditBookingModal = function() {
    const modal = document.getElementById('editBookingModal');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

// Form submit (via event delegation)
document.body.addEventListener('submit', async (e) => {
    if (e.target.id === 'editBookingForm') {
        e.preventDefault();
        
        const formData = {
            package_id: document.getElementById('editPackageId').value,
            start_date: document.getElementById('editStartDate').value,
            end_date: document.getElementById('editEndDate').value,
            number_of_adults: parseInt(document.getElementById('editAdults').value),
            number_of_children: parseInt(document.getElementById('editChildren').value || 0),
            total_amount: parseFloat(document.getElementById('editTotalAmount').value),
            discount_amount: parseFloat(document.getElementById('editDiscountAmount').value || 0),
            special_requests: document.getElementById('editSpecialRequests').value
        };

        const res = await apiRequest('PUT', `/bookings/${window.currentBookingId}`, formData);
        if (res.success) {
            showToast('Booking updated successfully', 'success');
            closeEditBookingModal();
            loadBookingDetails(); // refresh details
        } else {
            showToast(res.message || 'Failed to update booking', 'error');
        }
    }
});
