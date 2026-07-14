// Global UI interactions handled in layout-loader.js

// Mobile filter toggle
document.getElementById('mobileFilterBtn')?.addEventListener('click', () => {
    document.getElementById('filterSidebar')?.classList.add('open');
});

function closeFilterSidebar() {
    document.getElementById('filterSidebar')?.classList.remove('open');
}
window.closeFilterSidebar = closeFilterSidebar;

let currentPage = 1;
const LIMIT = 9;

function buildSafariCard(p) {
    const img = `/images/safaris/${p.package_slug}/main.jpg`;
    const rating = parseFloat(p.avg_rating || 0).toFixed(1);
    const dest = Array.isArray(p.destinations) ? p.destinations.map(d => d.park_name || d).join(', ') : '';
    return `
    <a href="/safaris/${p.package_slug}" class="safari-card">
      <div class="safari-card-img">
        <img src="${img}" alt="${p.package_name}" loading="lazy" onerror="this.src='/images/placeholder.jpeg'">
        ${p.is_featured ? '<span class="safari-card-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
        <span class="safari-card-duration"><i class="fas fa-clock"></i> ${p.duration_days} Days</span>
      </div>
      <div class="safari-card-body">
        <div class="safari-card-category">${p.category_name || 'Safari'}</div>
        <h3 class="safari-card-title">${p.package_name}</h3>
        ${dest ? `<div class="safari-card-location"><i class="fas fa-map-marker-alt"></i>${dest}</div>` : ''}
        <div class="safari-card-rating"><span class="stars">${stars(parseFloat(p.avg_rating||0))}</span><span>${rating} ${p.review_count>0?'('+p.review_count+')':''}</span></div>
        <div class="safari-card-footer">
          <div class="safari-card-price"><div class="from">From</div><div class="amount">$${Number(p.base_price_usd).toLocaleString()}</div><div class="per">per person</div></div>
          <span class="btn btn-primary btn-sm">View Details</span>
        </div>
      </div>
    </a>`;
}

function getFilters() {
    return {
        search: document.getElementById('searchInput')?.value.trim() || '',
        category: document.querySelector('#categoryFilters input:checked')?.value || '',
        destination: document.querySelector('#destinationFilters input:checked')?.value || '',
        duration: document.querySelector('input[name="duration"]:checked')?.value || 'all',
        difficulty: document.querySelector('input[name="difficulty"]:checked')?.value || 'all',
        min_price: document.getElementById('minPrice')?.value || '',
        max_price: document.getElementById('maxPrice')?.value || '',
        sort: document.getElementById('sortSelect')?.value || 'featured',
        page: currentPage,
        limit: LIMIT
    };
}

async function applyFilters(page = 1) {
    currentPage = page;
    closeFilterSidebar(); // Close on mobile if open
    const grid = document.getElementById('safarisGrid');
    grid.innerHTML = '<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton-body"><div class="skeleton skeleton-line medium"></div></div></div>'.repeat(3);

    const filters = getFilters();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v); });
    params.set('page', page);
    params.set('limit', LIMIT);

    try {
        const { data, pagination } = await API.get('/packages?' + params);
        document.getElementById('resultCount').textContent = pagination?.total || 0;
        if (!data?.length) {
            grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem">No safaris found matching your filters.</p>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }
        grid.innerHTML = data.map(buildSafariCard).join('');
        renderPagination(pagination);
    } catch {
        grid.innerHTML = '<p style="color:var(--error);grid-column:1/-1;text-align:center;padding:3rem">Failed to load safaris. Please refresh.</p>';
    }
}

function renderPagination({ total, page, limit }) {
    const pages = Math.ceil(total / limit);
    const el = document.getElementById('pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    if (page > 1) html += `<button class="page-btn" onclick="applyFilters(${page-1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
            html += `<button class="page-btn ${i===page?'active':''}" onclick="applyFilters(${i})">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
            html += `<span style="padding:0 .5rem;color:var(--text-muted)">…</span>`;
        }
    }
    if (page < pages) html += `<button class="page-btn" onclick="applyFilters(${page+1})"><i class="fas fa-chevron-right"></i></button>`;
    el.innerHTML = html;
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('#categoryFilters input[type=radio]').forEach(r => { if (r.value === 'all') r.checked = true; });
    document.querySelectorAll('#destinationFilters input[type=radio]').forEach(r => { if (r.value === 'all') r.checked = true; });
    document.querySelector('input[name="duration"][value="all"]').checked = true;
    document.querySelector('input[name="difficulty"][value="all"]').checked = true;
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'featured';
    applyFilters();
}
window.clearFilters = clearFilters;
window.applyFilters = applyFilters;

// Load filter options
async function loadFilters() {
    try {
        const { data: cats } = await API.get('/categories');
        const catEl = document.getElementById('categoryFilters');
        if (catEl && cats?.length) {
            catEl.innerHTML = `<label><input type="radio" name="category" value="all" checked> All Categories</label>` +
                cats.map(c => `<label><input type="radio" name="category" value="${c.category_slug}" onchange="applyFilters()"> ${c.category_name} (${c.safari_count||0})</label>`).join('');
        }
    } catch {}
    try {
        const { data: dests } = await API.get('/destinations');
        const destEl = document.getElementById('destinationFilters');
        if (destEl && dests?.length) {
            destEl.innerHTML = `<label><input type="radio" name="destination" value="all" checked> All Destinations</label>` +
                dests.map(d => `<label><input type="radio" name="destination" value="${d.park_slug}" onchange="applyFilters()"> ${d.park_name}</label>`).join('');
        }
    } catch {}
    // Read URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) {
        const r = document.querySelector(`input[name="category"][value="${params.get('category')}"]`);
        if (r) r.checked = true;
    }
    applyFilters();
}

// Search on Enter
document.getElementById('searchInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') applyFilters(); });

loadFilters();