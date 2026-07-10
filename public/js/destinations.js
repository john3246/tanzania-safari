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
        <a href="/destinations/${d.park_slug}" class="dest-card">
          <img src="${imgSrc(d.image_url)}" alt="${d.park_name}" loading="lazy" onerror="this.src='/images/placeholder.jpeg'">
          <div class="dest-card-overlay"></div>
          <div class="dest-card-body">
            <div class="dest-card-name">${d.park_name}</div>
            <div class="dest-card-meta">
              <span class="dest-card-count"><i class="fas fa-binoculars"></i> ${d.safari_count || 0} Safaris</span>
              <div class="dest-card-arrow"><i class="fas fa-arrow-right"></i></div>
            </div>
          </div>
        </a>`).join('');
    } catch {
        document.getElementById('destinationsGrid').innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--error)">Failed to load destinations.</p>';
    }
}
loadDestinations();