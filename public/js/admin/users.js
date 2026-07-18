// ── Users ─────────────────────────────────────────────────────
let usersList = [];
async function loadUsers() {
    const body = document.getElementById('userBody');
    if (!body) return;
    try {
        const res = await apiRequest('GET', '/users');
        usersList = res.data || [];
        body.innerHTML = usersList.map(u => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-800">${escapeHtml(u.first_name)} ${escapeHtml(u.last_name || '')}</td>
                <td class="px-6 py-4 text-slate-500">${escapeHtml(u.email)}</td>
                <td class="px-6 py-4 text-slate-500">${escapeHtml(u.role_name || 'Staff')}</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}">
                        ${u.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                        <button class="text-slate-400 hover:text-primary-600 transition-colors" onclick="openUserModal('${u.user_id}')" title="Edit"><i class="ph ph-pencil-simple text-lg"></i></button>
                        <button class="text-slate-400 hover:text-red-600 transition-colors" onclick="deleteUser('${u.user_id}')" title="Delete"><i class="ph ph-trash text-lg"></i></button>
                    </div>
                </td>
            </tr>`).join('') || '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No users found.</td></tr>';
    } catch (e) {}
}

function openUserModal(id = null) {
    const form = document.getElementById('userForm');
    if (!form) return;
    form.reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = id ? 'Edit User' : 'New User';
    if (id) {
        const u = usersList.find(x => x.user_id == id);
        if (u) {
            document.getElementById('userId').value = u.user_id;
            Object.entries(u).forEach(([k, v]) => {
                const el = form.querySelector(`[name="${k}"]`);
                if (el) { 
                    if (el.tagName === 'SELECT') el.value = String(v);
                    else el.value = v || ''; 
                }
            });
        }
    }
    document.getElementById('userModal').classList.add('active');
}

async function saveUser() {
    const btn = event.target;
    const form = document.getElementById('userForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('userId').value;
    data.is_active = data.is_active === 'true';
    
    setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/users/${id}`, data);
        else await apiRequest('POST', '/users', data);
        closeModal('userModal');
        showToast('Team member updated');
        await loadUsers();
    } catch (e) {
    } finally {
        setLoading(btn, false);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
        await apiRequest('DELETE', `/users/${id}`);
        showToast('Team member deleted');
        await loadUsers();
    } catch (e) {}
}
