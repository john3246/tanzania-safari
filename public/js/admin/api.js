// ── API Helpers ──────────────────────────────────────────────
async function apiRequest(method, path, body = null) {
    const activeToken = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const url = path.startsWith('/api') ? path : (typeof API_BASE !== 'undefined' ? API_BASE : '/api/admin') + path;
        const response = await fetch(url, options);
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/admin/login';
            return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'API request failed');
        return result;
    } catch (error) {
        if (typeof showToast === 'function') showToast(error.message, 'error');
        throw error;
    }
}

async function apiUpload(formData) {
    try {
        const activeToken = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${activeToken}` },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Upload failed');
        return result;
    } catch (error) {
        if (typeof showToast === 'function') showToast(error.message, 'error');
        throw error;
    }
}
