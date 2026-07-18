// ── Categories ────────────────────────────────────────────────
let categoriesList = [];
async function loadCategories() {
    const body = document.getElementById('catBody');
    if (!body) return;
    if (categoriesList.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Initializing Categories...</td></tr>';
    }
    try {
        const res = await apiRequest('GET', '/categories');
        categoriesList = res.data || [];
        renderCategories();
    } catch (e) {}
}

function renderCategories() {
    const body = document.getElementById('catBody');
    if (!body) return;
    
    body.innerHTML = categoriesList.map(c => {
        return `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                            <i class="${c.icon_class || 'ph ph-tag'} text-xl"></i>
                        </div>
                        <span class="font-medium text-slate-900">${c.category_name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-600">${c.category_slug}</td>
                <td class="px-6 py-4 font-medium text-slate-700">${c.package_count || 0}</td>
                <td class="px-6 py-4 text-slate-600">${c.display_order}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" onclick="openCatModal('${c.category_id}')" title="Edit">
                            <i class="ph ph-pencil-simple text-lg"></i>
                        </button>
                        <button class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onclick="deleteCategory('${c.category_id}')" title="Delete">
                            <i class="ph ph-trash text-lg"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('') || '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">No categories found</td></tr>';
}

function openCatModal(id = null) {
    const form = document.getElementById('catForm');
    if (!form) return;
    form.reset();
    document.getElementById('catId').value = '';
    document.getElementById('catModalTitle').textContent = id ? 'Edit Category' : 'New Category';
    if (id) {
        const c = categoriesList.find(x => x.category_id == id);
        if (c) {
            document.getElementById('catId').value = c.category_id;
            Object.entries(c).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { if (el.type === 'checkbox') el.checked = !!v; else el.value = v || ''; }
            });
        }
    }
    document.getElementById('catModal').classList.add('active');
}

async function saveCategory() {
    const btn = event.target;
    const form = document.getElementById('catForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('catId').value;
    data.is_active = !!form.querySelector('[name="is_active"]').checked;
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/categories/${id}`, data);
        else await apiRequest('POST', '/categories', data);
        closeModal('catModal');
        showToast('Category updated');
        await loadCategories();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteCategory(id) {
    if (!confirm('Delete category?')) return;
    try {
        await apiRequest('DELETE', `/categories/${id}`);
        showToast('Category deleted');
        loadCategories();
    } catch (e) {}
}
