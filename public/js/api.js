// ── Shared API helper ──────────────────────────────────────
const API = {
    base: '/api',
    async get(path) {
        const r = await fetch(this.base + path);
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Request failed');
        return data;
    },
    async post(path, body) {
        const r = await fetch(this.base + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Request failed');
        return data;
    },
    async getPackages(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.get('/packages' + (query ? '?' + query : ''));
    },
    async getFeaturedPackages(limit = 6) {
        return this.get(`/packages/featured?limit=${limit}`);
    },
    async getPackageBySlug(slug) {
        return this.get(`/packages/${slug}`);
    },
    async getDestinations() {
        return this.get('/destinations');
    },
    async getDestinationBySlug(slug) {
        return this.get(`/destinations/${slug}`);
    },
    async getStats() {
        return this.get('/stats');
    },
    async getTestimonials(limit = 6) {
        return this.get(`/testimonials?limit=${limit}`);
    },
    async submitEnquiry(data) {
        return this.post('/enquiry', data);
    },
    async subscribeNewsletter(email) {
        return this.post('/newsletter', { email });
    },
    async submitReview(data) {
        return this.post('/reviews', data);
    }
};

// ── Image helper ───────────────────────────────────────────
function imgSrc(url, fallback = '/images/optimized/balloon.webp') {
    if (!url) return fallback;
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return '/' + url;
}

// ── Star rating HTML ───────────────────────────────────────
function stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < full) html += '<i class="fas fa-star"></i>';
        else if (i === full && half) html += '<i class="fas fa-star-half-alt"></i>';
        else html += '<i class="far fa-star"></i>';
    }
    return html;
}

// ── Toast notification ─────────────────────────────────────
function toast(msg, type = 'success', duration = 4000) {
    const container = document.getElementById('toastContainer') || (() => {
        const c = document.createElement('div');
        c.id = 'toastContainer';
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    container.appendChild(t);
    setTimeout(() => t.style.animation = 'toastIn .3s ease reverse', duration - 300);
    setTimeout(() => t.remove(), duration);
}
window.toast = toast;