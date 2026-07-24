// ── Unified Admin API Helpers ──────────────────────────────────────────────
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

        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        
        let result;
        if (contentType.includes('application/json') || (text.startsWith('{') || text.startsWith('['))) {
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
            }
        } else {
            throw new Error(`Server returned status ${response.status}: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            throw new Error(result.message || result.error || `Request failed with status ${response.status}`);
        }
        return result;
    } catch (error) {
        console.error(`apiRequest error [${method} ${path}]:`, error);
        if (typeof showToast === 'function') showToast(error.message || 'API request failed', 'error');
        throw error;
    }
}

async function apiUpload(formData) {
    try {
        const activeToken = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
        
        // Ensure both 'file' and 'image' keys exist if one is provided
        if (formData.has('file') && !formData.has('image')) {
            formData.append('image', formData.get('file'));
        } else if (formData.has('image') && !formData.has('file')) {
            formData.append('file', formData.get('image'));
        }

        // Try primary upload route /api/admin/media/upload
        let response = await fetch('/api/admin/media/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${activeToken}` },
            body: formData
        });

        // Fallback to /api/images/upload if 404
        if (response.status === 404) {
            response = await fetch('/api/images/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${activeToken}` },
                body: formData
            });
        }

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/admin/login';
            return;
        }

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error(`Upload returned invalid response: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }
        return result;
    } catch (error) {
        console.error('apiUpload error:', error);
        if (typeof showToast === 'function') showToast(error.message || 'Upload failed', 'error');
        throw error;
    }
}
