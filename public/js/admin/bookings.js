// ── Bookings ──────────────────────────────────────────────────
async function loadBookings() {
    const body = document.getElementById('bookBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/bookings');
        body.innerHTML = (res.data || []).map(b => {
            const statusName = (b.status_name || '').toLowerCase();
            const statusColor = statusName === 'confirmed' ? '#10b981' : statusName === 'pending' ? '#f59e0b' : '#ef4444';
            const statusBg = statusName === 'confirmed' ? '#d1fae5' : statusName === 'pending' ? '#fef3c7' : '#fee2e2';
            return `
            <tr style="border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                <td data-label="Guest" style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: #072F1D; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                            ${(b.full_name || 'G')[0].toUpperCase()}
                        </div>
                        <div>
                            <strong style="color: #111827; font-size: 14px; display: block;">${b.full_name}</strong>
                            <small style="color: #6b7280; font-size: 12px;">${b.email}</small>
                        </div>
                    </div>
                </td>
                <td data-label="Package" style="padding: 1rem; color: #374151; font-weight: 500;">${b.package_name || '-'}</td>
                <td data-label="Date" style="padding: 1rem; color: #6b7280; font-size: 14px;"><i class="far fa-calendar-alt" style="margin-right: 6px;"></i>${new Date(b.start_date).toLocaleDateString()}</td>
                <td data-label="Total" style="padding: 1rem; font-weight: 600; color: #111827;">$${Number(b.total_price_usd).toLocaleString()}</td>
                <td data-label="Status" style="padding: 1rem;">
                    <span style="padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                        ${b.status_name || 'Pending'}
                    </span>
                </td>
                <td data-label="Actions" style="padding: 1rem;">
                    <select class="form-control" style="padding: 6px 12px; font-size: 12px; width: 110px; border-radius: 6px; border: 1px solid #d1d5db; cursor: pointer; outline: none;" onchange="updateBookingStatus('${b.booking_id}', this.value); this.value=''">
                        <option value="">Update...</option>
                        <option value="confirmed">Confirm</option>
                        <option value="cancelled">Cancel</option>
                    </select>
                </td>
            </tr>`;
        }).join('') || '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #6b7280;">No bookings found.</td></tr>';
    } catch (e) {}
}

async function updateBookingStatus(id, status) {
    if (!status) return;
    try {
        await apiRequest('PUT', `/bookings/${id}/status`, { status });
        showToast('Updated & Notification Sent');
        loadBookings();
    } catch (e) {}
}
