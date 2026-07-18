// ── Blog ──────────────────────────────────────────────────────
let blogsList = [];
async function loadBlogs() {
    const body = document.getElementById('blogBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/blog');
        blogsList = res.data || [];
        body.innerHTML = blogsList.map(p => `
            <tr>
                <td><strong>${p.post_title}</strong></td>
                <td>${p.author_name || 'Admin'}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge status-${p.is_published ? 'active' : 'inactive'}">${p.is_published ? 'Published' : 'Draft'}</span></td>
                <td>
                    <div style="display:flex; gap:6px">
                        <button class="btn btn-icon" onclick="openBlogModal('${p.post_id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-icon" onclick="deleteBlog('${p.post_id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('') || '<tr><td colspan="5">No blog posts</td></tr>';
    } catch (e) {}
}

function openBlogModal(id = null) {
    const form = document.getElementById('blogForm');
    if (!form) return;
    form.reset();
    document.getElementById('blogId').value = '';
    document.getElementById('blogModalTitle').textContent = id ? 'Edit Post' : 'New Post';
    if (id) {
        const p = blogsList.find(x => x.post_id == id);
        if (p) {
            document.getElementById('blogId').value = p.post_id;
            Object.entries(p).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { if (el.type === 'checkbox') el.checked = !!v; else el.value = v || ''; }
            });
            if (p.post_tags) form.querySelector('[name="post_tags_csv"]').value = p.post_tags.join(', ');
        }
    }
    document.getElementById('blogModal').classList.add('active');
}

async function saveBlog() {
    const btn = event.target;
    const form = document.getElementById('blogForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('blogId').value;
    data.is_published = !!form.querySelector('[name="is_published"]').checked;
    if (data.post_tags_csv) {
        data.post_tags = data.post_tags_csv.split(',').map(s => s.trim()).filter(s => s);
        delete data.post_tags_csv;
    }
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/blog/${id}`, data);
        else await apiRequest('POST', '/blog', data);
        closeModal('blogModal');
        showToast('Article published/updated');
        await loadBlogs();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
        await apiRequest('DELETE', `/blog/${id}`);
        showToast('Blog post deleted');
        await loadBlogs();
    } catch (e) {}
}
