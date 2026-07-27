// destinations.js - Corporate Revamp + resilient image/slug mapping

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

function destSlug(d) {
    return d.park_slug || d.slug || '';
}

function destName(d) {
    return d.park_name || d.name || 'Destination';
}

function destImage(d) {
    const slug = destSlug(d);
    const fromApi = d.featured_image_url || d.image_url
        || (Array.isArray(d.gallery_urls) && d.gallery_urls[0])
        || (Array.isArray(d.image_urls) && d.image_urls[0]);
    if (fromApi) return (typeof imgSrc === 'function' ? imgSrc(fromApi) : fromApi);
    if (slug) {
        // Prefer optimized webp, then destinations folder
        return `/images/optimized/${slug}.webp`;
    }
    return '/images/optimized/balloon.webp';
}

function destImageFallback(d) {
    const slug = destSlug(d);
    if (!slug) return '/images/optimized/balloon.webp';
    return `/images/destinations/${slug}/main.jpg`;
}

function createCorporateCard(d) {
    const slug = destSlug(d);
    const name = destName(d);
    const href = slug ? `/destinations/${slug}` : '/destinations';
    const img = destImage(d);
    const fb = destImageFallback(d);
    const count = d.safari_count || d.tour_count || 0;
    const desc = d.park_description || d.description || d.short_description || 'Experience the untamed wilderness of Tanzania.';

    return `
    <a href="${href}" class="corp-dest-card">
        <div class="corp-dest-img">
            <img src="${img}" alt="${name}" width="640" height="400" loading="lazy" decoding="async"
                 onerror="this.onerror=null;this.src='${fb}';this.onerror=function(){this.src='/images/optimized/balloon.webp'}">
            ${(Array.isArray(d.image_urls) && d.image_urls.length > 1) || (Array.isArray(d.gallery_urls) && d.gallery_urls.length > 1)
                ? `<div class="corp-img-badge"><i class="fas fa-camera"></i> ${(d.image_urls || d.gallery_urls).length}</div>` : ''}
        </div>
        <div class="corp-dest-content">
            <div class="corp-dest-header">
                <h3>${name}</h3>
                <span class="corp-dest-location"><i class="fas fa-map-marker-alt"></i> ${d.park_location || d.region || 'Tanzania'}</span>
            </div>
            <p class="corp-dest-desc">${desc.substring(0, 90)}${desc.length > 90 ? '…' : ''}</p>
            <div class="corp-dest-footer">
                <span class="corp-dest-safaris"><i class="fas fa-binoculars"></i> <strong>${count > 0 ? count : '—'}</strong> ${count > 0 ? 'Safaris' : 'Inquire'}</span>
                <span class="corp-dest-action">Explore <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>
    </a>`;
}

async function loadDestinations() {
    try {
        const { data } = await API.get('/destinations');
        if (!data?.length) return;

        const northern = data.filter(d => ['serengeti', 'ngorongoro', 'tarangire', 'manyara', 'arusha', 'kilimanjaro', 'meru'].some(r => destName(d).toLowerCase().includes(r) || destSlug(d).toLowerCase().includes(r)));
        const zanzibar = data.filter(d => ['zanzibar', 'pemba', 'mafia'].some(r => destName(d).toLowerCase().includes(r) || destSlug(d).toLowerCase().includes(r)));
        const southern = data.filter(d => !northern.includes(d) && !zanzibar.includes(d));

        const nGrid = document.getElementById('northernDestGrid');
        if (nGrid) nGrid.innerHTML = northern.length ? northern.map(createCorporateCard).join('') : '<p class="text-muted">No northern circuit parks listed yet.</p>';

        const sGrid = document.getElementById('southernDestGrid');
        if (sGrid) sGrid.innerHTML = southern.length ? southern.map(createCorporateCard).join('') : '<p class="text-muted">No southern circuit parks listed yet.</p>';

        const zGrid = document.getElementById('zanzibarDestGrid');
        if (zGrid) zGrid.innerHTML = zanzibar.length ? zanzibar.map(createCorporateCard).join('') : '<p class="text-muted">Coastal destinations coming soon — <a href="/contact">inquire for Zanzibar</a>.</p>';
    } catch (e) {
        console.error('Failed to load destinations:', e);
    }
}
loadDestinations();
