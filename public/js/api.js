// ── Shared API helper ──────────────────────────────────────
const API = {
    base: '/api',

    async _fetchJson(path, options = {}, retries = 2) {
        let lastErr;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const r = await fetch(this.base + path, options);
                let data = {};
                try {
                    data = await r.json();
                } catch (_) {
                    data = {};
                }
                if (!r.ok) {
                    const err = new Error(data.message || `Request failed (${r.status})`);
                    err.status = r.status;
                    // Retry transient 5xx / rate limits
                    if ((r.status >= 500 || r.status === 429) && attempt < retries) {
                        await new Promise((res) => setTimeout(res, 300 * (attempt + 1)));
                        lastErr = err;
                        continue;
                    }
                    throw err;
                }
                return data;
            } catch (e) {
                lastErr = e;
                // Network failures
                if (attempt < retries && !e.status) {
                    await new Promise((res) => setTimeout(res, 300 * (attempt + 1)));
                    continue;
                }
                throw e;
            }
        }
        throw lastErr || new Error('Request failed');
    },

    async get(path) {
        return this._fetchJson(path);
    },
    async post(path, body) {
        return this._fetchJson(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
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

function imgAlt(name, suffix = 'Tanzania Safari Magic') {
    const base = String(name || 'Tanzania safari').trim();
    return `${base} - ${suffix}`;
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
window.imgAlt = imgAlt;
