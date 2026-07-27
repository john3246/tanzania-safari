// destinations.js - Corporate Revamp

const header = document.getElementById('header');
window.addEventListener('scroll', () => { 
    header?.classList.toggle('scrolled', window.scrollY > 50); 
    document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400); 
}, { passive: true });
document.getElementById('mobileToggle')?.addEventListener('click', () => { 
    document.getElementById('mainNav')?.classList.toggle('active'); 
    document.getElementById('menuOverlay')?.classList.toggle('active'); 
});
document.getElementById('menuOverlay')?.addEventListener('click', () => { 
    document.getElementById('mainNav')?.classList.remove('active'); 
    document.getElementById('menuOverlay')?.classList.remove('active'); 
});
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

function createCorporateCard(d) {
    const imgUrl = (d.image_urls && d.image_urls.length > 0) ? d.image_urls[0] : (d.image_url || '/images/optimized/balloon.webp');
    return `
    <a href="/destinations/${d.park_slug}" class="corp-dest-card">
        <div class="corp-dest-img">
            <img src="${imgUrl}" alt="${d.park_name}" loading="lazy" decoding="async">
            ${d.image_urls && d.image_urls.length > 1 ? `<div class="corp-img-badge"><i class="fas fa-camera"></i> ${d.image_urls.length}</div>` : ''}
        </div>
        <div class="corp-dest-content">
            <div class="corp-dest-header">
                <h3>${d.park_name}</h3>
                <span class="corp-dest-location"><i class="fas fa-map-marker-alt"></i> ${d.park_location || 'Tanzania'}</span>
            </div>
            <p class="corp-dest-desc">${d.park_description ? (d.park_description.substring(0, 80) + '...') : 'Experience the untamed wilderness of Tanzania.'}</p>
            <div class="corp-dest-footer">
                <span class="corp-dest-safaris"><i class="fas fa-binoculars"></i> <strong>${d.safari_count > 0 ? d.safari_count : '—'}</strong> ${d.safari_count > 0 ? 'Safaris' : 'Inquire'}</span>
                <span class="corp-dest-action">Explore <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>
    </a>`;
}

async function loadDestinations() {
    try {
        const { data } = await API.get('/destinations');
        if (!data?.length) return;

        // Filter by region (rough string matching for demo purposes if backend doesn't provide exact region enum)
        const northern = data.filter(d => ['serengeti', 'ngorongoro', 'tarangire', 'manyara', 'arusha', 'kilimanjaro'].some(r => d.park_name.toLowerCase().includes(r)));
        const zanzibar = data.filter(d => ['zanzibar', 'pemba', 'mafia'].some(r => d.park_name.toLowerCase().includes(r)));
        
        // Everything else goes to southern/western
        const southern = data.filter(d => !northern.includes(d) && !zanzibar.includes(d));

        const nGrid = document.getElementById('northernDestGrid');
        if (nGrid && northern.length > 0) nGrid.innerHTML = northern.map(createCorporateCard).join('');
        
        const sGrid = document.getElementById('southernDestGrid');
        if (sGrid && southern.length > 0) sGrid.innerHTML = southern.map(createCorporateCard).join('');
        
        const zGrid = document.getElementById('zanzibarDestGrid');
        if (zGrid && zanzibar.length > 0) zGrid.innerHTML = zanzibar.map(createCorporateCard).join('');

    } catch (e) {
        console.error('Failed to load destinations:', e);
    }
}
loadDestinations();