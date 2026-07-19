const header = document.getElementById('header');
window.addEventListener('scroll', () => { header?.classList.toggle('scrolled', window.scrollY > 50); document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
document.getElementById('mobileToggle')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.toggle('active'); document.getElementById('menuOverlay')?.classList.toggle('active'); });
document.getElementById('menuOverlay')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.remove('active'); document.getElementById('menuOverlay')?.classList.remove('active'); });
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

async function loadDestinations() {
    try {
        const { data } = await API.get('/destinations');
        const grid = document.getElementById('destinationsGrid');
        if (!data?.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">No destinations found.</p>'; return; }
        grid.innerHTML = data.map(d => `
        <a href="/destinations/${d.park_slug}" class="dest-card group">
          <div class="dest-card-img-wrapper">
              <img src="${(d.image_urls && d.image_urls.length > 0) ? d.image_urls[0] : (d.image_url || '/images/placeholder.jpeg')}" alt="${d.park_name}" loading="lazy" class="group-hover:scale-110 transition-transform duration-700">
              ${d.image_urls && d.image_urls.length > 1 ? `<div class="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md"><i class="ph ph-images"></i> ${d.image_urls.length} Photos</div>` : ''}
          </div>
          <div class="dest-card-overlay"></div>
          <div class="dest-card-body">
            <h3 class="dest-card-name">${d.park_name}</h3>
            <p class="dest-card-location text-sm text-white/80 mb-3"><i class="ph ph-map-pin"></i> ${d.park_location || 'Tanzania'}</p>
            <div class="dest-card-meta">
              <span class="dest-card-count"><i class="ph ph-binoculars"></i> ${d.safari_count || 0} Safaris</span>
              <div class="dest-card-arrow"><i class="ph ph-arrow-right"></i></div>
            </div>
          </div>
        </a>`).join('');
    } catch {
        document.getElementById('destinationsGrid').innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--error)">Failed to load destinations.</p>';
    }
}
loadDestinations();