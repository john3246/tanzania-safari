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
    body.innerHTML = categoriesList.map(c => `
        <tr>
            <td><i class="${c.icon_class || 'fas fa-tag'}" style="margin-right:8px"></i> <strong>${c.category_name}</strong></td>
            <td>${c.category_slug}</td>
            <td>${c.package_count || 0}</td>
            <td>${c.display_order}</td>
            <td>
                <button class="btn btn-icon" onclick="openCatModal('${c.category_id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-icon" onclick="deleteCategory('${c.category_id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('') || '<tr><td colspan="5">No categories found</td></tr>';
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
