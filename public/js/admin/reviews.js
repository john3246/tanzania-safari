// ── Reviews ───────────────────────────────────────────────────
async function loadReviews() {
    const body = document.getElementById('reviewBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/reviews');
        body.innerHTML = (res.data || []).map(r => `
            <tr>
                <td><strong>${r.full_name}</strong></td>
                <td>${r.rating} / 5</td>
                <td>${r.package_name || '—'}</td>
                <td><span class="status-badge status-${r.is_approved ? 'active' : 'pending'}">${r.is_approved ? 'Approved' : 'Pending'}</span></td>
                <td>
                    <button class="btn btn-icon" onclick="toggleReview('${r.review_id}')"><i class="fas fa-${r.is_approved ? 'times' : 'check'}"></i></button>
                    <button class="btn btn-icon" onclick="deleteReview('${r.review_id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('') || '<tr><td colspan="5">No reviews</td></tr>';
    } catch (e) {}
}

async function toggleReview(id) {
    try {
        await apiRequest('PUT', `/reviews/${id}/toggle`);
        showToast('Review Status Toggled');
        loadReviews();
    } catch (e) {}
}

async function deleteReview(id) {
    if (!confirm('Delete review?')) return;
    try {
        await apiRequest('DELETE', `/reviews/${id}`);
        showToast('Review deleted');
        loadReviews();
    } catch (e) {}
}
