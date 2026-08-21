function t(key) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key);
  return key;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRegions(filterId) {
  const root = document.getElementById('accomRegions');
  const data = window.TSM_ACCOM && window.TSM_ACCOM.REGIONS;
  if (!root || !data) return;
  const regions = filterId && filterId !== 'all' ? data.filter((r) => r.id === filterId) : data;
  root.innerHTML = regions
    .map((region) => {
      const cards = (region.lodges || [])
        .map((lodge) => {
          const levelKey = lodge.level === 'luxury' ? 'accom.luxury' : 'accom.midrange';
          const badgeClass = lodge.level === 'luxury' ? 'luxury' : '';
          const img =
            (window.TSM_ACCOM.lodgeImage && window.TSM_ACCOM.lodgeImage(lodge, region)) ||
            lodge.image ||
            region.image;
          const desc = lodge.description
            ? `<p class="accom-card-desc">${escapeHtml(lodge.description)}</p>`
            : '';
          return `<a class="accom-card" href="${escapeHtml(lodge.website)}" target="_blank" rel="noopener noreferrer">
            <div class="accom-card-media">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(lodge.name)}" loading="lazy" width="640" height="400">
              <span class="accom-badge ${badgeClass}">${escapeHtml(t(levelKey))}</span>
            </div>
            <div class="accom-card-body">
              <h3>${escapeHtml(lodge.name)}</h3>
              <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(region.name)}</span>
              ${desc}
              <em class="accom-card-link">${escapeHtml(t('accom.visitSite'))}</em>
            </div>
          </a>`;
        })
        .join('');
      const dir = region.directory
        ? `<a href="${escapeHtml(region.directory)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="min-height:44px">${escapeHtml(t('accom.regionGuide'))}</a>`
        : '';
      return `<section class="accom-region" id="${escapeHtml(region.id)}">
        <div class="accom-region-head">
          <div>
            <h2>${escapeHtml(region.name)}</h2>
            <p>${escapeHtml(region.blurb)}</p>
          </div>
          ${dir}
        </div>
        <div class="accom-cards">${cards}</div>
      </section>`;
    })
    .join('');
}

function renderFilters() {
  const el = document.getElementById('accomFilters');
  const data = window.TSM_ACCOM && window.TSM_ACCOM.REGIONS;
  if (!el || !data) return;
  const buttons = [{ id: 'all', name: t('accom.allRegions') }].concat(data.map((r) => ({ id: r.id, name: r.name })));
  el.innerHTML = buttons
    .map(
      (b, i) =>
        `<button type="button" class="accom-filter${i === 0 ? ' active' : ''}" data-region="${escapeHtml(b.id)}">${escapeHtml(b.name)}</button>`
    )
    .join('');
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.accom-filter');
    if (!btn) return;
    el.querySelectorAll('.accom-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderRegions(btn.getAttribute('data-region'));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
  renderFilters();
  const hash = (location.hash || '').replace('#', '');
  renderRegions(hash || 'all');
  if (hash) {
    document.querySelectorAll('.accom-filter').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-region') === hash);
    });
    const target = document.getElementById(hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }
});
