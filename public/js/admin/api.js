// ── API Helpers ──────────────────────────────────────────────
async function apiRequest(method, path, body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const response = await fetch(API_BASE + path, options);
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/admin/login';
            return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'API request failed');
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

async function apiUpload(formData) {
    try {
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Upload failed');
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}
