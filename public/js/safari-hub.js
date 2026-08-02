const HUBS = {
  kilimanjaro: {
    category: 'kilimanjaro',
    title: 'Kilimanjaro Climbs & Treks',
    eyebrow: 'Mount Kilimanjaro · 5,895 m',
    lead: 'Guided Kilimanjaro routes from Arusha — Machame, Lemosho & Marangu. Read the full <a href="/destinations/mount-kilimanjaro-national-park">Kilimanjaro National Park guide</a>, then book a private climb or climb + safari combo.',
    image: '/images/optimized/mount-kilimanjaro-national-park.webp',
    path: '/kilimanjaro'
  },
  migrations: {
    category: 'migrations',
    title: 'Great Migration Safaris',
    eyebrow: 'Wildebeest Migration',
    lead: 'Seasonal Serengeti &amp; Ndutu itineraries timed for calving, river crossings, and predator action.',
    image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    path: '/migrations'
  },
  zanzibar: {
    category: 'zanzibar',
    title: 'Zanzibar Beach Extensions',
    eyebrow: 'Spice Island',
    lead: 'Bush-to-beach combinations and Zanzibar stays — white-sand beaches after your northern circuit safari.',
    image: '/images/optimized/boat%20zanzibar.webp',
    path: '/zanzibar'
  }
};

function hubKeyFromPath() {
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  return HUBS[seg] ? seg : null;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function packageCard(p) {
  const img = p.image_url || p.featured_image_url || '/images/optimized/serengeti-national-park.webp';
  const price = Number(p.base_price_usd || 0);
  return `
    <a href="/safaris/${encodeURIComponent(p.package_slug)}" class="corp-blog-card" style="display:flex;flex-direction:column">
      <div class="blog-card-img" style="aspect-ratio:16/10;overflow:hidden">
        <img src="${img}" alt="${escapeHtml(p.package_name)}" style="width:100%;height:100%;object-fit:cover" loading="lazy"
             onerror="this.src='/images/optimized/mbugani.webp'">
      </div>
      <div class="body">
        <div style="font-size:0.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(p.category_name || 'Safari')}</div>
        <h3 style="margin:0.35rem 0 0.5rem">${escapeHtml(p.package_name)}</h3>
        <p class="excerpt" style="margin:0 0 0.75rem">${escapeHtml(p.short_description || '')}</p>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:0.75rem">
          <strong style="color:var(--primary)">From $${price.toLocaleString()}</strong>
          <span class="blog-card-link">View <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </a>`;
}

async function loadHub() {
  const key = hubKeyFromPath();
  const hub = key ? HUBS[key] : null;
  if (!hub) return;

  document.getElementById('hubPageTitle').textContent = `${hub.title} | Tanzania Safari Magic`;
  document.getElementById('hubMetaDesc').setAttribute('content', hub.lead.replace(/&amp;/g, '&'));
  document.getElementById('hubCanonical').href = `https://tanzaniasafarimagic.com${hub.path}`;
  document.getElementById('hubCrumb').textContent = hub.title;
  document.getElementById('hubEyebrow').textContent = hub.eyebrow;
  document.getElementById('hubTitle').textContent = hub.title;
  document.getElementById('hubLead').innerHTML = hub.lead;
  document.getElementById('hubHeroSlide').style.backgroundImage = `url('${hub.image}')`;

  const grid = document.getElementById('hubPackageGrid');
  try {
    const { data } = await API.get(`/packages?category=${encodeURIComponent(hub.category)}&limit=24`);
    if (!data?.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--text-muted)">
          <p>Packages for this collection are being updated. Browse all safaris or request a custom itinerary.</p>
          <a class="btn btn-primary" href="/safaris" style="min-height:48px;margin-top:0.75rem">All safaris</a>
        </div>`;
      return;
    }
    grid.innerHTML = data.map(packageCard).join('');
  } catch (e) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">Unable to load packages.</p>';
  }
}

loadHub();
