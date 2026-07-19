// ── Bookings ──────────────────────────────────────────────────
let bookingsList = [];

async function loadBookings() {
    const body = document.getElementById('bookBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/bookings');
        bookingsList = res.data || [];
        renderBookings();
    } catch (e) {}
}

function renderBookings() {
    const body = document.getElementById('bookBody');
    if (!body) return;
    
    const searchTerm = document.getElementById('bookingSearch')?.value.toLowerCase() || '';
    
    const filtered = bookingsList.filter(b => 
        (b.booking_id && String(b.booking_id).toLowerCase().includes(searchTerm)) || 
        (b.full_name && b.full_name.toLowerCase().includes(searchTerm)) ||
        (b.package_name && b.package_name.toLowerCase().includes(searchTerm))
    );

    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-500">No bookings found matching your search.</td></tr>';
        return;
    }

    body.innerHTML = filtered.map(b => {
        const statusName = (b.status_name || 'Pending').toLowerCase();
        let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
        if (statusName === 'confirmed') statusClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (statusName === 'pending') statusClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (statusName === 'cancelled') statusClass = 'bg-red-100 text-red-700 border-red-200';
        
        return `
            <tr class="hover:bg-slate-50/50 transition-colors relative">
                <td class="px-6 py-4 font-bold text-primary-600 whitespace-nowrap">#${b.booking_id.substring(0,8).toUpperCase()}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-xs">
                            ${(b.full_name || 'G')[0].toUpperCase()}
                        </div>
                        <div>
                            <span class="font-medium text-slate-900 block">${b.full_name}</span>
                            <span class="text-xs text-slate-500 block">${b.email}</span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-700">${b.package_name || '-'}</td>
                <td class="px-6 py-4">${new Date(b.start_date).toLocaleDateString()}</td>
                <td class="px-6 py-4">${b.number_of_adults + b.number_of_children}</td>
                <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">$${Number(b.total_price_usd).toLocaleString()}</td>
                <td class="px-6 py-4 relative">
                    <select class="flex items-center justify-between min-w-[90px] gap-1 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider transition-colors outline-none cursor-pointer ${statusClass}" 
                        onchange="updateBookingStatus('${b.booking_id}', this.value)" style="appearance: none;">
                        <option value="pending" ${statusName === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${statusName === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="cancelled" ${statusName === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <button class="bg-primary-50 hover:bg-primary-100 text-primary-700 p-1.5 rounded-lg transition-colors" onclick="viewBookingDetails('${b.booking_id}')" title="View Details">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>
            </tr>`;
    }).join('');
}

window.filterBookings = function() {
    renderBookings();
};

async function updateBookingStatus(id, status) {
    if (!status) return;
    try {
        await apiRequest('PUT', `/bookings/${id}/status`, { status });
        showToast('Updated & Notification Sent');
        loadBookings();
    } catch (e) {}
}

window.viewBookingDetails = function(id) {
    window.currentBookingId = id;
    navigate('booking-details');
}

window.loadBookingDetails = async function() {
    const id = window.currentBookingId;
    if (!id) {
        navigate('bookings');
        return;
    }

    try {
        const res = await apiRequest('GET', `/bookings/${id}`);
        if (!res || !res.data) throw new Error('Booking not found');
        const b = res.data;

        document.getElementById('detailBookingId').textContent = '#' + b.booking_id.substring(0,8).toUpperCase();
        document.getElementById('detailCustomerName').textContent = b.full_name;
        document.getElementById('detailCustomerEmail').textContent = b.email;
        document.getElementById('detailCustomerPhone').textContent = b.phone || 'N/A';
        document.getElementById('detailPackageName').textContent = b.package_name || 'N/A';
        document.getElementById('detailStartDate').textContent = b.start_date ? new Date(b.start_date).toLocaleDateString() : 'N/A';
        document.getElementById('detailAdults').textContent = b.number_of_adults || 0;
        document.getElementById('detailChildren').textContent = b.number_of_children || 0;
        document.getElementById('detailPrice').textContent = '$' + Number(b.total_price_usd).toLocaleString();
        document.getElementById('detailSpecialRequests').textContent = b.special_requests || 'None';
        
        // Status Badge
        const statusBadge = document.getElementById('detailStatusBadge');
        if (statusBadge) {
            const statusName = (b.status_name || 'Pending').toLowerCase();
            let statusClass = 'bg-slate-100 text-slate-700';
            if (statusName === 'confirmed') statusClass = 'bg-emerald-100 text-emerald-700';
            if (statusName === 'pending') statusClass = 'bg-yellow-100 text-yellow-700';
            if (statusName === 'cancelled') statusClass = 'bg-red-100 text-red-700';
            statusBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass}`;
            statusBadge.textContent = statusName;
        }

        const btnApprove = document.getElementById('btnApproveBooking');
        const btnReject = document.getElementById('btnRejectBooking');
        const btnPending = document.getElementById('btnPendingBooking');
        
        if (btnApprove) btnApprove.onclick = () => updateBookingStatusFromPage(id, 'confirmed');
        if (btnReject) btnReject.onclick = () => updateBookingStatusFromPage(id, 'cancelled');
        if (btnPending) btnPending.onclick = () => updateBookingStatusFromPage(id, 'pending');

        const replyForm = document.getElementById('bookingReplyForm');
        if (replyForm) {
            replyForm.onsubmit = async (e) => {
                e.preventDefault();
                const btn = replyForm.querySelector('button[type="submit"]');
                setLoading(btn, true);
                
                try {
                    const message = document.getElementById('replyMessage').value;
                    const subject = document.getElementById('replySubject').value;
                    await apiRequest('POST', `/bookings/${id}/reply`, { message, subject });
                    showToast('Reply sent successfully', 'success');
                    replyForm.reset();
                } catch (err) {
                    showToast(err.message || 'Failed to send reply', 'error');
                } finally {
                    setLoading(btn, false, '<i class="fa-solid fa-paper-plane"></i> Send Reply');
                }
            };
        }
    } catch (e) {
        showToast('Failed to load booking details', 'error');
        navigate('bookings');
    }
}

async function updateBookingStatusFromPage(id, status) {
    await updateBookingStatus(id, status);
    // Reload details to update badge
    loadBookingDetails();
}
