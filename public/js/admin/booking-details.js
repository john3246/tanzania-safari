window.closeBookingDetails = function() {
    window.currentBookingId = null;
    navigate('bookings', false);
}

window.loadBookingDetails = async function() {
    const id = window.currentBookingId;
    if (!id) {
        return;
    }

    try {
        const res = await apiRequest('GET', `/bookings/${id}`);
        if (!res || !res.data) throw new Error('Booking not found');
        const b = res.data;

        document.getElementById('detailBookingId').textContent = '#' + String(b.booking_id || '').substring(0,8).toUpperCase();
        document.getElementById('detailCustomerName').textContent = b.full_name || 'Guest';
        
        const emailEl = document.getElementById('detailCustomerEmail');
        if(emailEl) {
            emailEl.textContent = b.email || 'N/A';
            emailEl.href = b.email ? `mailto:${b.email}` : '#';
        }
        
        document.getElementById('detailCustomerPhone').textContent = b.phone || 'N/A';
        document.getElementById('detailPackageName').textContent = b.package_name || 'N/A';
        document.getElementById('detailStartDate').textContent = b.start_date ? new Date(b.start_date).toLocaleDateString() : 'N/A';
        document.getElementById('detailAdults').textContent = b.number_of_adults || 0;
        document.getElementById('detailChildren').textContent = b.number_of_children || 0;
        document.getElementById('detailPrice').textContent = '$' + Number(b.total_price_usd || 0).toLocaleString();
        document.getElementById('detailSpecialRequests').textContent = b.special_requests || 'None';
        
        // Status Badge
        const statusBadge = document.getElementById('detailStatusBadge');
        if (statusBadge) {
            const statusName = (b.status_name || b.current_status || 'Pending').toLowerCase();
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
    }
}

async function updateBookingStatusFromPage(id, status) {
    // Note: updateBookingStatus is in bookings.js and should be available globally.
    // If not, we might need to duplicate it or ensure it's in the global scope.
    // Let's assume it's global as it's defined in bookings.js without 'const' or 'let' scope block that hides it,
    // actually wait, updateBookingStatus is defined as `async function updateBookingStatus(id, status)` in bookings.js
    // Function declarations at top level in a normal script tag are global.
    await updateBookingStatus(id, status);
    // Reload details to update badge
    loadBookingDetails();
}
