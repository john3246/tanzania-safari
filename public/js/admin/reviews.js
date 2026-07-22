// ── Guest Feedback & Reviews (Corporate CMS) ──────────────────
let reviewsList = [];

async function loadReviews() {
    const body = document.getElementById('reviewBody');
    if (!body) return;
    if (reviewsList.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Loading Reviews...</td></tr>';
    }
    try {
        const res = await apiRequest('GET', '/reviews');
        reviewsList = res.data || [];
        renderReviews();
    } catch (e) {
        console.error('Error fetching reviews:', e);
        showToast('Failed to load guest reviews', 'error');
    }
}

function renderReviews() {
    const body = document.getElementById('reviewBody');
    if (!body) return;

    body.innerHTML = reviewsList.map(r => {
        const statusClass = r.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
        const statusText = r.is_approved ? 'Approved' : 'Pending';
        
        // Stars generator
        const stars = Array.from({ length: 5 }, (_, i) => {
            const starClass = i < r.rating ? 'fa-solid fa-star text-amber-500' : 'fa-regular fa-star text-slate-300';
            return `<i class="${starClass} text-xs"></i>`;
        }).join(' ');

        return `
        <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
            <td class="px-6 py-4">
                <div>
                    <div class="font-semibold text-slate-900">${r.full_name || 'Guest'}</div>
                    <div class="text-xs text-slate-400 truncate max-w-xs" title="${r.review_comment}">${r.review_comment}</div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-1.5">
                    <span class="text-sm font-bold text-slate-700">${r.rating}.0</span>
                    <div class="flex items-center">${stars}</div>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600 font-medium">${r.package_name || 'General Safari'}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex gap-2 justify-end">
                    <button class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onclick="toggleReview('${r.review_id}')" title="${r.is_approved ? 'Unapprove' : 'Approve'}">
                        <i class="fa-solid fa-${r.is_approved ? 'xmark' : 'check'} text-base"></i>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onclick="deleteReview('${r.review_id}')" title="Delete">
                        <i class="fa-solid fa-trash text-base"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No reviews found.</td></tr>';
}

async function toggleReview(id) {
    try {
        await apiRequest('PUT', `/reviews/${id}/toggle`);
        showToast('Review status updated');
        await loadReviews();
    } catch (e) {
        console.error(e);
        showToast('Failed to update review status', 'error');
    }
}

async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this guest review permanently?')) return;
    try {
        await apiRequest('DELETE', `/reviews/${id}`);
        showToast('Review deleted successfully');
        await loadReviews();
    } catch (e) {
        console.error(e);
        showToast('Failed to delete review', 'error');
    }
}

window.toggleReview = toggleReview;
window.deleteReview = deleteReview;
