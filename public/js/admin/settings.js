// ── Profile & Settings ────────────────────────────────────────
async function loadProfile() {
    try {
        const res = await apiRequest('GET', '/verify');
        if (!res?.user) return;
        const u = res.user;
        if (document.getElementById('profFirst')) document.getElementById('profFirst').value = u.first_name || '';
        if (document.getElementById('profLast')) document.getElementById('profLast').value = u.last_name || '';
        if (document.getElementById('profEmail')) document.getElementById('profEmail').value = u.email || '';
        
        const avatarUrl = u.profile_image_url || 'https://ui-avatars.com/api/?name=Admin&background=263E22&color=D4AF37';
        
        const sImg = document.getElementById('sidebarAvatarImg');
        if (sImg) { sImg.src = avatarUrl; sImg.style.display = 'block'; }

        const hImg = document.getElementById('headerAvatarImg');
        if (hImg) { hImg.src = avatarUrl; hImg.style.display = 'block'; }

        if (u.profile_image_url) {
            const preview = document.getElementById('profileImagePreview');
            if (preview) preview.innerHTML = `<img src="${u.profile_image_url}" style="width:100%; height:100%; object-fit:cover">`;
        }
        if (document.getElementById('userName')) document.getElementById('userName').textContent = `${u.first_name} ${u.last_name || ''}`;
    } catch (e) {}
}

async function uploadProfilePhoto(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
        const res = await apiUpload(fd);
        await apiRequest('PUT', '/profile', { profile_image_url: res.data.path });
        showToast('Photo Updated');
        loadProfile();
    } catch (e) {}
}

async function loadSettings() {
    const sForm = document.getElementById('settingsForm');
    const pForm = document.getElementById('passwordForm');
    
    if (sForm) {
        try {
            const res = await apiRequest('GET', '/settings');
            sForm.innerHTML = `<div class="form-grid" style="grid-template-columns:1fr">${(res.data || []).map(s => `
                <div class="form-group">
                    <label>${s.setting_key.replace(/_/g, ' ').toUpperCase()}</label>
                    <input class="form-control" name="${s.setting_key}" value="${s.setting_value || ''}">
                </div>`).join('')}</div><button type="submit" class="btn btn-primary" style="width:100%">Save Configuration</button>`;
            
            sForm.onsubmit = async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(sForm));
                try {
                    await apiRequest('PUT', '/settings', data);
                    showToast('System configuration updated');
                    await loadSettings();
                } catch (e) {}
            };
        } catch (e) {}
    }

    if (pForm) {
        pForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(pForm));
            if (data.new_password !== data.confirm_password) {
                showToast('Passwords do not match', 'error');
                return;
            }
            try {
                await apiRequest('PUT', '/profile/password', { password: data.new_password });
                showToast('Password changed successfully');
                pForm.reset();
            } catch (e) {}
        };
    }
}
