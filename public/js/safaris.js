// Global UI interactions handled in layout-loader.js

function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

// Mobile filter toggle
document.getElementById('mobileFilterBtn')?.addEventListener('click', () => {
    document.getElementById('filterSidebar')?.classList.add('open'); document.getElementById('filterOverlay')?.classList.add('open');
});

function closeFilterSidebar() {
    document.getElementById('filterSidebar')?.classList.remove('open'); document.getElementById('filterOverlay')?.classList.remove('open');
}
window.closeFilterSidebar = closeFilterSidebar;

let currentPage = 1;
const LIMIT = 9;

function buildSafariCard(p) {
    const img = p.featured_image_url || (p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : `/images/safaris/${p.package_slug}/main.jpg`);
    const rating = parseFloat(p.avg_rating || 0).toFixed(1);
    const dest = Array.isArray(p.destinations) ? p.destinations.map(d => d.park_name || d).join(', ') : '';
    return `
    <a href="/safaris/${p.package_slug}" class="safari-card">
      <div class="safari-card-img">
        <img src="${img}" alt="${p.package_name}" loading="lazy" decoding="async" onerror="this.src='/images/optimized/balloon.webp'">
        ${p.is_featured ? `<span class="safari-card-badge"><i class="ph-fill ph-star"></i> ${t('safarisPage.featured')}</span>` : ''}
        <span class="safari-card-duration"><i class="ph ph-clock"></i> ${p.duration_days} ${t('common.days')}</span>
      </div>
      <div class="safari-card-body">
        <div class="safari-card-category">${p.category_name || 'Safari'}</div>
        <h3 class="safari-card-title">${p.package_name}</h3>
        ${dest ? `<div class="safari-card-location"><i class="ph ph-map-pin"></i>${dest}</div>` : ''}
        <div class="safari-card-rating"><span class="stars">${stars(parseFloat(p.avg_rating||0))}</span><span>${rating} ${p.review_count>0?'('+p.review_count+')':''}</span></div>
        <div class="safari-card-footer">
          <div class="safari-card-price"><div class="from">${t('common.from')}</div><div class="amount">$${Number(p.base_price_usd).toLocaleString()}</div><div class="per">${t('common.perPerson')}</div></div>
          <span class="btn btn-primary btn-sm">View Details</span>
        </div>
      </div>
    </a>`;
}

const DEST_ALIASES = {
    serengeti: 'serengeti-national-park',
    ngorongoro: 'ngorongoro-conservation-area',
    tarangire: 'tarangire-national-park',
    zanzibar: 'zanzibar',
    manyara: 'lake-manyara-national-park'
};
const DUR_ALIASES = { '4-7': '4-6', '8+': '7-9' };

function resolveDestParam(value) {
    if (!value) return value;
    const key = String(value).trim().toLowerCase();
    return DEST_ALIASES[key] || value;
}

function getFilters() {
    return {
        search: document.getElementById('searchInput')?.value.trim() || '',
        category: document.getElementById('categorySelect')?.value || '',
        destination: resolveDestParam(document.getElementById('destinationSelect')?.value || ''),
        duration: document.getElementById('durationSelect')?.value || 'all',
        difficulty: document.getElementById('difficultySelect')?.value || 'all',
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
            grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem">${t('safarisPage.noResults')}</p>`;
            document.getElementById('pagination').innerHTML = '';
            return;
        }
        grid.innerHTML = data.map(buildSafariCard).join('');
        renderPagination(pagination);
    } catch {
        grid.innerHTML = `<p style="color:var(--error);grid-column:1/-1;text-align:center;padding:3rem">${t('safarisPage.loadError')}</p>`;
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
    if(document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if(document.getElementById('categorySelect')) document.getElementById('categorySelect').value = 'all';
    if(document.getElementById('destinationSelect')) document.getElementById('destinationSelect').value = 'all';
    if(document.getElementById('durationSelect')) document.getElementById('durationSelect').value = 'all';
    if(document.getElementById('difficultySelect')) document.getElementById('difficultySelect').value = 'all';
    if(document.getElementById('minPrice')) document.getElementById('minPrice').value = '';
    if(document.getElementById('maxPrice')) document.getElementById('maxPrice').value = '';
    if(document.getElementById('sortSelect')) document.getElementById('sortSelect').value = 'featured';
    applyFilters();
}
window.clearFilters = clearFilters;
window.applyFilters = applyFilters;

// Load filter options
async function loadFilters() {
    try {
        const { data: cats } = await API.get('/categories');
        const catEl = document.getElementById('categorySelect');
        if (catEl && cats?.length) {
            const withTours = cats.filter((c) => Number(c.safari_count) > 0);
            catEl.innerHTML = `<option value="all">${t('safarisPage.allCategories')}</option>` +
                withTours.map(c => `<option value="${c.category_slug}">${c.category_name} (${c.safari_count||0})</option>`).join('');
        }
    } catch {}
    try {
        const { data: dests } = await API.get('/destinations');
        const destEl = document.getElementById('destinationSelect');
        if (destEl && dests?.length) {
            destEl.innerHTML = `<option value="all">${t('safarisPage.allDestinations')}</option>` +
                dests.map(d => `<option value="${d.park_slug || d.slug}">${d.park_name || d.name}</option>`).join('');
        }
    } catch {}
    // Read URL params (search aligns with SearchAction ?search=)
    const params = new URLSearchParams(window.location.search);
    const searchVal = params.get('search') || params.get('q') || '';
    if (searchVal && document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = searchVal;
    }
    if (params.get('category')) {
        const r = document.getElementById('categorySelect');
        if (r) r.value = params.get('category');
    }
    if (params.get('destination')) {
        const r = document.getElementById('destinationSelect');
        if (r) r.value = resolveDestParam(params.get('destination'));
    }
    if (params.get('duration')) {
        const r = document.getElementById('durationSelect');
        const dur = DUR_ALIASES[params.get('duration')] || params.get('duration');
        if (r) r.value = dur;
    }
    applyFilters();
}

// Search on Enter
document.getElementById('searchInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') applyFilters(); });

(async () => {
  try {
    if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
  } catch (_) {}
  loadFilters();
})();
