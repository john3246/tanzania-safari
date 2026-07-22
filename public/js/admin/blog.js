// ── Blog ──────────────────────────────────────────────────────
let blogsList = [];
async function loadBlogs() {
    const body = document.getElementById('blogBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/blog');
        blogsList = res.data || [];
        body.innerHTML = blogsList.map(p => `
        <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
            <td class="px-6 py-4">
                <div class="font-medium text-slate-900">${p.post_title}</div>
            </td>
            <td class="px-6 py-4 text-slate-600">${p.author_name || 'Admin'}</td>
            <td class="px-6 py-4 text-slate-500">${new Date(p.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${p.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">
                    ${p.is_published ? 'Published' : 'Draft'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" onclick="openBlogModal('${p.post_id}')" title="Edit">
                        <i class="fa-solid fa-pencil text-sm"></i>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onclick="deleteBlog('${p.post_id}')" title="Delete">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('') || '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No blog posts found.</td></tr>';
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

async function saveBlog(event) {
    if (event) event.preventDefault();
    const btn = document.querySelector('#blogModal button.bg-emerald-600');
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
window.openBlogModal = openBlogModal; 
