// ── Enquiries ─────────────────────────────────────────────────
let enquiriesList = [];
async function loadEnquiries() {
    const body = document.getElementById('enqBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/enquiries');
        enquiriesList = res.data || [];
        body.innerHTML = enquiriesList.map(e => {
            const statusName = (e.enquiry_status || '').toLowerCase();
            const statusColor = statusName === 'responded' ? '#10b981' : '#f59e0b';
            const statusBg = statusName === 'responded' ? '#d1fae5' : '#fef3c7';
            return `
            <tr style="border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: #072F1D; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                            ${(e.full_name || 'G')[0].toUpperCase()}
                        </div>
                        <div>
                            <strong style="color: #111827; font-size: 14px; display: block;">${e.full_name}</strong>
                            <small style="color: #6b7280; font-size: 12px;">${e.email}</small>
                        </div>
                    </div>
                </td>
                <td style="padding: 1rem; color: #374151; font-weight: 500;">${e.enquiry_type || 'General'}</td>
                <td style="padding: 1rem; color: #6b7280; font-size: 14px;"><i class="far fa-clock" style="margin-right: 6px;"></i>${new Date(e.created_at).toLocaleDateString()}</td>
                <td style="padding: 1rem;">
                    <span style="padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                        ${e.enquiry_status || 'New'}
                    </span>
                </td>
                <td style="padding: 1rem;">
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;" onclick="openEnqModal('${e.enquiry_id}')">
                        <i class="fas fa-reply"></i> Respond
                    </button>
                </td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #6b7280;">No enquiries found.</td></tr>';
    } catch (e) {}
}

function openEnqModal(id) {
    const e = enquiriesList.find(x => x.enquiry_id == id);
    if (!e) return;
    document.getElementById('enqRespondId').value = id;
    document.getElementById('enqResponse').value = '';
    document.getElementById('enqDetails').innerHTML = `<strong>${e.full_name}</strong><br><small>${e.email}</small><br><p style="margin-top:0.5rem; background:var(--bg-secondary); padding:0.75rem; border-radius:var(--radius-sm)">"${e.enquiry_message}"</p>`;
    document.getElementById('enqModal').classList.add('active');
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
