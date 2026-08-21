function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

const HUBS = {
  kilimanjaro: {
    category: 'kilimanjaro',
    titleKey: 'hub.kiliTitle',
    eyebrowKey: 'hub.kiliEyebrow',
    leadKey: 'hub.kiliLead',
    title: 'Kilimanjaro Climbs & Treks',
    eyebrow: 'Mount Kilimanjaro · 5,895 m',
    lead: 'Guided Kilimanjaro routes from Arusha — Machame, Lemosho &amp; Marangu. <a href="/kilimanjaro/routes">Compare all climbing routes</a>, read the <a href="/destinations/mount-kilimanjaro-national-park">Kilimanjaro National Park guide</a>, or ask about a <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">Mount Meru</a> warm-up trek.',
    image: '/images/optimized/mount-kilimanjaro-national-park.webp',
    path: '/kilimanjaro'
  },
  migrations: {
    category: 'migrations',
    titleKey: 'hub.migTitle',
    eyebrowKey: 'hub.migEyebrow',
    leadKey: 'hub.migLead',
    title: 'Great Migration Safaris',
    eyebrow: 'Wildebeest Migration',
    lead: 'Seasonal Serengeti &amp; Ndutu itineraries timed for calving, river crossings, and predator action. Explore the <a href="/destinations/serengeti-national-park">Serengeti</a> and <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>.',
    image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    path: '/migrations'
  },
  zanzibar: {
    category: 'zanzibar',
    titleKey: 'hub.zanTitle',
    eyebrowKey: 'hub.zanEyebrow',
    leadKey: 'hub.zanLead',
    title: 'Zanzibar Beach Extensions',
    eyebrow: 'Spice Island',
    lead: 'Bush-to-beach combinations and Zanzibar stays — white-sand beaches after your northern circuit safari. See the <a href="/destinations/zanzibar">Zanzibar destination guide</a>.',
    image: '/images/zanzibar/zanzibar%20(1).webp',
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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHtml(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

function packageCard(p) {
  const img =
    p.image_url ||
    p.featured_image_url ||
    (p.image_urls && p.image_urls[0]) ||
    '/images/optimized/serengeti-national-park.webp';
  const price = Number(p.base_price_usd || 0);
  const dest = Array.isArray(p.destinations)
    ? p.destinations
        .map((d) => d.park_name)
        .filter(Boolean)
        .slice(0, 3)
        .join(' · ')
    : '';
  return `
    <a href="/safaris/${encodeURIComponent(p.package_slug)}" class="corp-blog-card" style="display:flex;flex-direction:column">
      <div class="blog-card-img" style="aspect-ratio:16/10;overflow:hidden">
        <img src="${img}" alt="${escapeHtml(p.package_name)}" style="width:100%;height:100%;object-fit:cover" loading="lazy"
             onerror="this.src='/images/optimized/mbugani.webp'">
      </div>
      <div class="body">
        <div style="font-size:0.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(p.category_name || 'Safari')}</div>
        <h3 style="margin:0.35rem 0 0.5rem">${escapeHtml(p.package_name)}</h3>
        ${dest ? `<p style="margin:0 0 0.5rem;font-size:0.8rem;color:var(--text-muted)"><i class="fas fa-map-marker-alt" style="color:var(--primary)"></i> ${escapeHtml(dest)}</p>` : ''}
        <p class="excerpt" style="margin:0 0 0.75rem">${escapeHtml((p.short_description || '').slice(0, 140))}</p>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:0.75rem">
          <strong style="color:var(--primary)">${t('hub.from') || 'From'} $${price.toLocaleString()}</strong>
          <span class="blog-card-link">${t('hub.view') || 'View'} <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </a>`;
}

async function loadHub() {
  const key = hubKeyFromPath();
  const hub = key ? HUBS[key] : null;
  if (!hub) return;

  const title = t(hub.titleKey) !== hub.titleKey ? t(hub.titleKey) : hub.title;
  const eyebrow = t(hub.eyebrowKey) !== hub.eyebrowKey ? t(hub.eyebrowKey) : hub.eyebrow;
  const leadT = t(hub.leadKey);
  const lead = leadT !== hub.leadKey ? leadT : hub.lead;

  // SEO inject often strips id="hubPageTitle" from <title> — never crash on that.
  document.title = `${title} | Tanzania Safari Magic`;
  const titleEl =
    document.getElementById('hubPageTitle') ||
    document.getElementById('pageTitle') ||
    document.querySelector('title');
  if (titleEl) titleEl.textContent = document.title;

  const metaDesc =
    document.getElementById('hubMetaDesc') ||
    document.getElementById('metaDesc') ||
    document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      String(lead)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160)
    );
  }

  const canonical =
    document.getElementById('hubCanonical') ||
    document.getElementById('canonicalLink') ||
    document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://tanzaniasafarimagic.com${hub.path}`);

  setText('hubCrumb', title);
  setText('hubEyebrow', eyebrow);
  setText('hubTitle', title);
  setHtml('hubLead', lead);

  const slide = document.getElementById('hubHeroSlide');
  if (slide) slide.style.backgroundImage = `url('${hub.image}')`;

  const grid = document.getElementById('hubPackageGrid');
  if (!grid) return;

  grid.innerHTML =
    '<div class="skeleton-card" style="height:320px"></div><div class="skeleton-card" style="height:320px"></div><div class="skeleton-card" style="height:320px"></div>';

  try {
    const res = await API.get(`/packages?category=${encodeURIComponent(hub.category)}&limit=24&sort=featured`);
    const packages = Array.isArray(res?.data) ? res.data : res?.data?.packages || [];
    if (!packages.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--text-muted)">
          <p>${t('hub.empty')}</p>
          <a class="btn btn-primary" href="/safaris" style="min-height:48px;margin-top:0.75rem">${t('hub.allSafaris')}</a>
        </div>`;
      return;
    }
    grid.innerHTML = packages.map(packageCard).join('');
  } catch (e) {
    console.error('Hub load failed', e);
    grid.innerHTML =
      `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">${t('hub.loadError')} <a href="/safaris">${t('hub.allSafaris')}</a>.</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const run = async () => {
      try { if (window.TSM_i18n?.ready) await window.TSM_i18n.ready; } catch (_) {}
      loadHub();
    };
    run();
  });
} else {
  (async () => {
    try { if (window.TSM_i18n?.ready) await window.TSM_i18n.ready; } catch (_) {}
    loadHub();
  })();
}
