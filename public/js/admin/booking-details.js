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

    // Toggle Action Buttons based on status
    document.getElementById('btnApproveBooking').style.display = b.status_name === 'Confirmed' ? 'none' : 'flex';
    document.getElementById('btnRejectBooking').style.display = (b.status_name === 'Rejected' || b.status_name === 'Cancelled') ? 'none' : 'flex';
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

// Actions
document.addEventListener('DOMContentLoaded', () => {
    // Note vs Email Tabs
    document.body.addEventListener('click', (e) => {
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
    });

    const btnApprove = document.getElementById('btnApproveBooking');
    if (btnApprove) {
        btnApprove.onclick = async () => {
            if(!confirm('Are you sure you want to approve this booking? The customer will be notified.')) return;
            
            const btn = btnApprove;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Approving...';
            btn.disabled = true;

            const res = await apiRequest('PUT', `/bookings/${window.currentBookingId}/status`, { status: 'confirmed' });

            if(res.success) {
                showToast('Booking approved successfully', 'success');
                loadBookingDetails();
            } else {
                showToast(res.message || 'Failed to approve booking', 'error');
            }
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        };
    }

    const btnReject = document.getElementById('btnRejectBooking');
    if (btnReject) {
        btnReject.onclick = async () => {
            if(!confirm('Are you sure you want to reject this booking? The customer will be notified.')) return;
            
            const btn = btnReject;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rejecting...';
            btn.disabled = true;

            const res = await apiRequest('PUT', `/bookings/${window.currentBookingId}/status`, { status: 'rejected' });

            if(res.success) {
                showToast('Booking rejected successfully', 'success');
                loadBookingDetails();
            } else {
                showToast(res.message || 'Failed to reject booking', 'error');
            }
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        };
    }



    const btnSendReply = document.getElementById('btnSendReply');
    if (btnSendReply) {
        btnSendReply.onclick = async () => {
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
        };
    }

    const btnAddNote = document.getElementById('btnAddNote');
    if (btnAddNote) {
        btnAddNote.onclick = async () => {
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
        };
    }
});
