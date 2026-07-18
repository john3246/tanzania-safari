// ── Media Management ──────────────────────────────────────────
async function loadImages() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    try {
        const res = await fetch('/api/images', { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await res.json();
        grid.innerHTML = (result.data || []).map(img => `
            <div class="card media-card" style="position:relative; cursor:pointer" onclick="navigator.clipboard.writeText('${img.slug}'); showToast('Slug copied: ${img.slug}')">
                <img src="${img.path}" style="width:100%; aspect-ratio:1; object-fit:cover; display:block">
                <div class="media-info" style="padding:0.75rem; background:var(--bg-card)">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-overflow:ellipsis; overflow:hidden; white-space:nowrap">${img.slug}</div>
                </div>
                <div class="media-actions" style="position:absolute; top:0.5rem; right:0.5rem; display:none">
                    <button class="btn btn-icon" style="background:var(--error); color:#fff; width:30px; height:30px; border:none" onclick="event.stopPropagation(); deleteImage('${img.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('') || '<p style="grid-column:1/-1; text-align:center">No media found.</p>';
        
        // Add hover effect for actions via CSS or style injection
    } catch (e) {}
}

async function handleMediaUpload(files) {
    for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        try { await apiUpload(fd); } catch (e) {}
    }
    showToast('Upload Complete');
    loadImages();
}

async function deleteImage(id) {
    if (!confirm('Delete image?')) return;
    try {
        await fetch(`/api/images/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        showToast('Image Deleted');
        loadImages();
    } catch (e) {}
}
