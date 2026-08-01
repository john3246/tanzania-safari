// ── Profile & Settings ────────────────────────────────────────
async function loadProfile() {
    try {
        const res = await apiRequest('GET', '/verify');
        if (!res?.user) return;
        const u = res.user;
        if (document.getElementById('profFirst')) document.getElementById('profFirst').value = u.first_name || '';
        if (document.getElementById('profLast')) document.getElementById('profLast').value = u.last_name || '';
        if (document.getElementById('profEmail')) document.getElementById('profEmail').value = u.email || '';

        const displayName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Admin';
        const avatarUrl = u.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=263E22&color=D4AF37`;

        const sImg = document.getElementById('sidebarAvatarImg');
        if (sImg) { sImg.src = avatarUrl; sImg.style.display = 'block'; }

        const hImg = document.getElementById('headerAvatarImg');
        if (hImg) { hImg.src = avatarUrl; hImg.style.display = 'block'; }

        document.querySelectorAll('#headerUserName, #userName, .admin-user-name').forEach(el => {
            el.textContent = displayName;
        });

        if (u.profile_image_url) {
            const preview = document.getElementById('profileImagePreview');
            if (preview) preview.innerHTML = `<img src="${u.profile_image_url}" alt="" style="width:100%; height:100%; object-fit:cover">`;
        }
    } catch (e) {
        console.warn('loadProfile', e);
    }
}

async function uploadProfilePhoto(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
        const res = await apiUpload(fd);
        const path = res.data?.path || res.data?.url || res.path;
        await apiRequest('PUT', '/profile', { profile_image_url: path });
        showToast('Photo updated');
        await loadProfile();
    } catch (e) {}
}

async function loadSettings() {
    const sForm = document.getElementById('settingsForm');
    const pForm = document.getElementById('passwordForm');
    const profileForm = document.getElementById('profileForm');

    if (profileForm && !profileForm.dataset.bound) {
        profileForm.dataset.bound = '1';
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(profileForm));
            try {
                await apiRequest('PUT', '/profile', {
                    first_name: data.first_name,
                    last_name: data.last_name
                });
                showToast('Profile details updated');
                await loadProfile();
            } catch (err) {
                showToast(err.message || 'Failed to update profile', 'error');
            }
        };
    }

    if (sForm) {
        try {
            const res = await apiRequest('GET', '/settings');
            sForm.innerHTML = `<div class="space-y-4">${(res.data || []).map(s => `
                <div class="space-y-1">
                    <label class="text-xs font-medium text-slate-500">${String(s.setting_key || '').replace(/_/g, ' ').toUpperCase()}</label>
                    <input class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" name="${s.setting_key}" value="${(s.setting_value || '').replace(/"/g, '&quot;')}">
                </div>`).join('') || '<p class="text-sm text-slate-400">No system_settings rows yet.</p>'}</div>
                <div class="mt-6 flex justify-end"><button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Save Configuration</button></div>`;

            sForm.onsubmit = async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(sForm));
                try {
                    await apiRequest('PUT', '/settings', data);
                    showToast('System configuration updated');
                    await loadSettings();
                } catch (err) {}
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
                await apiRequest('PUT', '/profile/password', {
                    current_password: data.current_password || undefined,
                    password: data.new_password
                });
                showToast('Password changed successfully');
                pForm.reset();
            } catch (err) {
                showToast(err.message || 'Password update failed', 'error');
            }
        };
    }

    await loadSiteContactSettings();
    await loadSmtpSettings();
    await loadSeoSettings();
}

function pickSetting(rows, key) {
    if (!rows) return '';
    if (Array.isArray(rows)) {
        const found = rows.find(r => r.key === key || r.key === key.replace('.', '_') || r.key?.endsWith('.' + key.split('.').pop()));
        return found?.value || '';
    }
    return rows[key] || rows[key.replace(/\./g, '_')] || '';
}

async function loadSiteContactSettings() {
    const form = document.getElementById('siteContactForm');
    if (!form) return;
    try {
        const [contactRes, socialRes, companyRes] = await Promise.all([
            apiRequest('GET', '/site-settings/contact').catch(() => ({ data: [] })),
            apiRequest('GET', '/site-settings/social').catch(() => ({ data: [] })),
            apiRequest('GET', '/site-settings/company').catch(() => ({ data: [] }))
        ]);
        const contact = contactRes.data || [];
        const social = socialRes.data || [];
        const company = companyRes.data || [];

        const set = (name, val) => { if (form.elements[name]) form.elements[name].value = val || ''; };
        set('company_name', pickSetting(company, 'company.name') || pickSetting(company, 'name'));
        set('email', pickSetting(contact, 'contact.email') || pickSetting(contact, 'email'));
        set('phone', pickSetting(contact, 'contact.phone') || pickSetting(contact, 'phone') || pickSetting(contact, 'contact.whatsapp'));
        set('address', pickSetting(contact, 'contact.address') || pickSetting(contact, 'address'));
        set('facebook', pickSetting(social, 'social.facebook') || pickSetting(social, 'facebook'));
        set('instagram', pickSetting(social, 'social.instagram') || pickSetting(social, 'instagram'));
        set('twitter', pickSetting(social, 'social.twitter') || pickSetting(social, 'twitter'));
        set('youtube', pickSetting(social, 'social.youtube') || pickSetting(social, 'youtube'));
    } catch (e) {
        console.warn('Site contact settings load failed', e);
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        try {
            await apiRequest('PUT', '/site-settings/company', { name: data.company_name });
            await apiRequest('PUT', '/site-settings/contact', {
                email: data.email,
                phone: data.phone,
                whatsapp: data.phone,
                address: data.address
            });
            await apiRequest('PUT', '/site-settings/social', {
                facebook: data.facebook,
                instagram: data.instagram,
                twitter: data.twitter,
                youtube: data.youtube
            });
            showToast('Site contact settings saved — live on the public site');
        } catch (err) {
            showToast(err.message || 'Failed to save site settings', 'error');
        }
    };
}

async function loadSmtpSettings() {
    const form = document.getElementById('smtpForm');
    if (!form) return;
    try {
        const res = await apiRequest('GET', '/site-settings/smtp');
        const rows = res.data || [];
        const set = (name, key) => {
            if (form.elements[name]) form.elements[name].value = pickSetting(rows, key) || pickSetting(rows, key.replace('smtp.', '')) || '';
        };
        set('host', 'smtp.host');
        set('port', 'smtp.port');
        set('secure', 'smtp.secure');
        set('user', 'smtp.user');
        set('from', 'smtp.from');
        set('admin_email', 'smtp.admin_email');
    } catch (e) {
        console.warn('SMTP settings load failed', e);
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        try {
            const payload = {
                host: data.host,
                port: data.port,
                secure: data.secure,
                user: data.user,
                from: data.from,
                admin_email: data.admin_email
            };
            if (data.pass) payload.pass = data.pass;
            await apiRequest('PUT', '/site-settings/smtp', payload);
            showToast('SMTP settings saved');
        } catch (err) {
            showToast(err.message || 'Failed to save SMTP settings', 'error');
        }
    };
}

async function loadSeoSettings() {
    const form = document.getElementById('seoSettingsForm');
    if (!form) return;
    try {
        const res = await apiRequest('GET', '/site-settings/seo').catch(() => ({ data: [] }));
        const rows = res.data || [];
        const set = (name, key) => {
            if (form.elements[name]) form.elements[name].value = pickSetting(rows, key) || pickSetting(rows, key.replace('seo.', '')) || '';
        };
        set('default_title', 'seo.default_title');
        set('default_description', 'seo.default_description');
        set('og_image', 'seo.og_image');
    } catch (e) {}

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        try {
            await apiRequest('PUT', '/site-settings/seo', {
                default_title: data.default_title,
                default_description: data.default_description,
                og_image: data.og_image
            });
            showToast('SEO defaults saved');
        } catch (err) {
            showToast(err.message || 'Failed to save SEO', 'error');
        }
    };
}

window.loadProfile = loadProfile;
window.loadSettings = loadSettings;
window.uploadProfilePhoto = uploadProfilePhoto;
