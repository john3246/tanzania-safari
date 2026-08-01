// ── Users ─────────────────────────────────────────────────────
let usersList = [];

async function loadUserRolesIntoSelect() {
    const select = document.querySelector('#userForm select[name="role_id"]');
    if (!select) return;
    try {
        const res = await apiRequest('GET', '/users/roles');
        const roles = res.data || [];
        if (!roles.length) return;
        const current = select.value;
        select.innerHTML = roles.map(r =>
            `<option value="${r.role_id}">${escapeHtml(r.role_name)}</option>`
        ).join('');
        if (current) select.value = current;
    } catch (_) {}
}

async function loadUsers() {
    const body = document.getElementById('userBody');
    if (!body) return;
    await loadUserRolesIntoSelect();
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
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center space-x-3 justify-end">
                        <button class="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg" onclick="openUserModal('${u.user_id}')" title="Edit"><i class="fa-solid fa-pencil text-sm"></i></button>
                        <button class="text-slate-400 hover:text-amber-600 transition-colors p-2 hover:bg-amber-50 rounded-lg" onclick="sendPasswordReset('${u.email}')" title="Send password reset"><i class="fa-solid fa-key text-sm"></i></button>
                        <button class="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg" onclick="deleteUser('${u.user_id}')" title="Delete"><i class="fa-solid fa-trash text-sm"></i></button>
                    </div>
                </td>
            </tr>`).join('') || '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No users found.</td></tr>';
    } catch (e) {}
}

function openUserModal(id = null) {
    const form = document.getElementById('userForm');
    if (!form) return;
    loadUserRolesIntoSelect();
    form.reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = id ? 'Edit User' : 'New User';
    const pwd = form.querySelector('[name="password"]');
    if (pwd) pwd.required = !id;
    if (id) {
        const u = usersList.find(x => String(x.user_id) === String(id));
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
    const btn = event?.target;
    const form = document.getElementById('userForm');
    const data = Object.fromEntries(new FormData(form));
    const id = document.getElementById('userId').value;
    data.is_active = data.is_active === 'true';
    if (data.role_id) data.role_id = Number(data.role_id);
    if (!data.password) delete data.password;

    if (btn) setLoading(btn, true);
    try {
        if (id) await apiRequest('PUT', `/users/${id}`, data);
        else await apiRequest('POST', '/users', data);
        closeModal('userModal');
        showToast(id ? 'Team member updated' : 'Team member created');
        await loadUsers();
    } catch (e) {
    } finally {
        if (btn) setLoading(btn, false);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to deactivate this team member?')) return;
    try {
        await apiRequest('DELETE', `/users/${id}`);
        showToast('Team member deactivated');
        await loadUsers();
    } catch (e) {}
}

async function sendPasswordReset(email) {
    if (!email || !confirm(`Send password reset email to ${email}?`)) return;
    try {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Reset email sent if the account exists', 'success');
    } catch (e) {
        showToast('Could not send reset email', 'error');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.loadUsers = loadUsers;
window.openUserModal = openUserModal;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.sendPasswordReset = sendPasswordReset;
