/**
 * Trust + conversion config for Tanzania Safari Magic.
 * Fill in real reviews, guide bios, and verification URLs here.
 * Items with published:false (or empty url for badges) never render as live claims.
 */
(function (global) {
  if (global.__TSM_TRUST_SCRIPT) return;
  global.__TSM_TRUST_SCRIPT = true;

  const TSM_SITE_CONFIG = {
    quoteResponseHours: 24,
    whatsappE164: '255695108009',
    phoneDisplay: '+255 695 108 009',
    email: 'info@tanzaniasafarimagic.com',
    bookingPath: '/booking',
    utmStorageKey: 'tsm_utm'
  };

  function quoteReassurance(hours) {
    const h = hours || TSM_SITE_CONFIG.quoteResponseHours;
    return `No payment required to inquire — free custom quote within ${h} hours.`;
  }

  /**
   * Trust badges. Only badges with a real https URL become links.
   * Leave url: '' until you have the verifying page — a 404 link is worse than no link.
   */
  const TSM_TRUST_BADGES = [
    {
      id: 'tripadvisor',
      label: 'TripAdvisor',
      sublabel: '',
      icon: 'fab fa-tripadvisor',
      iconColor: '#00af87',
      url: 'https://www.tripadvisor.com/Attraction_Review-g297913-d28075837-Reviews-Tanzania_Safari_Magic-Arusha_Arusha_Region.html',
      track: 'trust_tripadvisor'
    },
    {
      id: 'tato',
      label: 'TATO Member',
      sublabel: 'Licensed operator',
      icon: 'fas fa-certificate',
      iconColor: '#f59e0b',
      // TODO: replace with real TATO member registry URL
      url: '',
      track: 'trust_tato'
    },
    {
      id: 'safe-travels',
      label: 'Safe Travels',
      sublabel: 'Certified',
      icon: 'fas fa-shield-alt',
      iconColor: 'var(--primary)',
      // TODO: replace with real Safe Travels certificate URL
      url: '',
      track: 'trust_safe_travels'
    }
  ];

  /**
   * Guest reviews shown on the homepage.
   * TODO: replace with real content — name, country, 1–2 sentence quote, star rating (1–5).
   * Example (keep published:false until the quote is real):
   * {
   *   published: false,
   *   first_name: 'TODO',
   *   last_name: '',
   *   country: 'United Kingdom',
   *   country_code: 'GB',
   *   rating: 5,
   *   comment: 'TODO: replace with real guest quote',
   *   safari_name: 'Serengeti safari'
   * }
   */
  const TSM_REVIEWS = [];

  /**
   * Meet the team / guides.
   * TODO: replace with real names, photos, years of experience, and short bios.
   * Only entries with published:true AND a real name + bio are rendered.
   * Example:
   * {
   *   published: false,
   *   name: 'TODO: replace with real name',
   *   role: 'Safari Guide',
   *   yearsExperience: 0,
   *   photo: '/images/experience/glad-of-africa-guides.webp',
   *   bio: 'TODO: replace with real bio'
   * }
   */
  const TSM_TEAM = [];

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function publishedReviews(extra) {
    const fromConfig = (TSM_REVIEWS || []).filter(
      (r) => r && r.published && r.comment && r.first_name && Number(r.rating) > 0
    );
    const fromApi = (Array.isArray(extra) ? extra : []).filter((r) => {
      const comment = String(r.comment || r.review_comment || '').trim();
      const name = String(r.first_name || '').trim();
      if (!comment || !name) return false;
      if (/wonderful safari experience/i.test(comment)) return false;
      return Number(r.rating) > 0;
    });
    const seen = new Set();
    const out = [];
    [...fromConfig, ...fromApi].forEach((r) => {
      const key = `${(r.first_name || '').toLowerCase()}|${(r.comment || r.review_comment || '').slice(0, 40)}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(r);
    });
    return out;
  }

  function publishedTeam() {
    return (TSM_TEAM || []).filter((m) => m && m.published && m.name && m.bio && !/^TODO/i.test(m.name));
  }

  function stars(n) {
    const r = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  function flagEmoji(code) {
    const cc = String(code || '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc)) return '';
    return String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)));
  }

  function badgeHtml(badge, variant) {
    const inner = `
      <i class="${escapeHtml(badge.icon)}" style="color:${escapeHtml(badge.iconColor || 'var(--primary)')}" aria-hidden="true"></i>
      <span class="tsm-badge-copy">
        <span class="tsm-badge-label">${escapeHtml(badge.label)}</span>
        ${badge.sublabel ? `<span class="tsm-badge-sub">${escapeHtml(badge.sublabel)}</span>` : ''}
      </span>`;
    if (badge.url) {
      return `<a class="tsm-trust-badge tsm-trust-badge--${variant || 'default'}" href="${escapeHtml(badge.url)}" target="_blank" rel="noopener noreferrer" data-track="${escapeHtml(badge.track || 'trust_link')}" data-track-label="${escapeHtml(badge.id)}">${inner}</a>`;
    }
    return `<span class="tsm-trust-badge tsm-trust-badge--${variant || 'default'} tsm-trust-badge--unlinked">${inner}</span>`;
  }

  function renderBadges(root, variant) {
    const host = typeof root === 'string' ? document.querySelector(root) : root;
    if (!host) return;
    if (host.querySelector('.tsm-trust-badge')) return;
    host.innerHTML = TSM_TRUST_BADGES.map((b) => badgeHtml(b, variant || host.getAttribute('data-trust-variant') || 'default')).join('');
  }

  function testimonialCard(r) {
    const name = `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Guest';
    const initial = name.charAt(0).toUpperCase();
    const country = r.country || '';
    const flag = flagEmoji(r.country_code);
    const comment = r.comment || r.review_comment || '';
    return `
      <article class="testimonial-card">
        <div class="testimonial-stars" aria-label="${escapeHtml(String(r.rating))} out of 5 stars">${stars(r.rating)}</div>
        <p class="testimonial-text">“${escapeHtml(comment)}”</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${r.user_image ? `<img src="${escapeHtml(r.user_image)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" width="48" height="48">` : escapeHtml(initial)}</div>
          <div>
            <div class="testimonial-name">${escapeHtml(name)}</div>
            <div class="testimonial-meta">${flag ? `${flag} ` : ''}${escapeHtml(country)}${r.safari_name ? ` · ${escapeHtml(r.safari_name)}` : ''}</div>
          </div>
        </div>
      </article>`;
  }

  function renderTestimonials(grid, reviews) {
    const el = typeof grid === 'string' ? document.querySelector(grid) : grid;
    if (!el) return 0;
    const list = publishedReviews(reviews);
    const section = el.closest('section') || document.getElementById('testimonialsSection');
    if (!list.length) {
      if (section) section.hidden = true;
      el.innerHTML = '';
      return 0;
    }
    if (section) section.hidden = false;
    el.innerHTML = list.slice(0, 6).map(testimonialCard).join('');
    return list.length;
  }

  function teamCard(m) {
    const years = Number(m.yearsExperience) > 0 ? `${m.yearsExperience}+ years` : '';
    const photo = m.photo || '/images/experience/glad-of-africa-guides.webp';
    return `
      <article class="tsm-team-card">
        <div class="tsm-team-photo">
          <img src="${escapeHtml(photo)}" alt="${escapeHtml(m.name)}, ${escapeHtml(m.role || 'safari guide')} in Tanzania" width="400" height="400" loading="lazy" decoding="async">
        </div>
        <div class="tsm-team-body">
          <h3>${escapeHtml(m.name)}</h3>
          <p class="tsm-team-role">${escapeHtml(m.role || 'Safari Guide')}${years ? ` · ${escapeHtml(years)}` : ''}</p>
          <p class="tsm-team-bio">${escapeHtml(m.bio)}</p>
        </div>
      </article>`;
  }

  function renderTeam(root) {
    const el = typeof root === 'string' ? document.querySelector(root) : root;
    if (!el) return 0;
    const list = publishedTeam();
    const section = el.closest('section') || document.getElementById('teamSection');
    if (!list.length) {
      if (section && section.hasAttribute('data-hide-when-empty')) section.hidden = true;
      else {
        el.innerHTML = `<p class="tsm-team-empty">Guide profiles are being added. WhatsApp us to meet your driver-guide before you travel. <span class="tsm-todo-note">TODO: replace with real content in public/js/site-trust.js (TSM_TEAM)</span></p>`;
      }
      return 0;
    }
    if (section) section.hidden = false;
    el.innerHTML = list.map(teamCard).join('');
    return list.length;
  }

  function injectCtaMicrocopy() {
    const text = quoteReassurance();
    document.querySelectorAll('[data-cta-reassure], .js-cta-reassure').forEach((el) => {
      el.textContent = text;
    });

    const targets = document.querySelectorAll(
      '#stickyWhatsAppCta, #headerWhatsApp, #waQuoteBtn, #submitBtn, a[href*="wa.me/255695108009"], a[href="/booking"], a.btn-book-now'
    );
    targets.forEach((el) => {
      if (el.closest('.tsm-cta-wrap')) return;
      if (el.id === 'stickyWhatsAppCta') return;
      const parent = el.parentElement;
      if (!parent) return;
      if (parent.querySelector('.tsm-cta-note')) return;
      if (el.closest('nav, .header, .footer, .nav-mega-menu')) return;
      const note = document.createElement('p');
      note.className = 'tsm-cta-note';
      note.textContent = text;
      el.insertAdjacentElement('afterend', note);
    });
  }

  function reviewJsonLd() {
    const list = publishedReviews();
    if (list.length < 1) return null;
    const avg = list.reduce((s, r) => s + Number(r.rating || 0), 0) / list.length;
    return {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': 'https://tanzaniasafarimagic.com/#organization',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avg.toFixed(1),
        reviewCount: String(list.length),
        bestRating: '5',
        worstRating: '1'
      },
      review: list.slice(0, 10).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: `${r.first_name || ''} ${r.last_name || ''}`.trim() },
        reviewBody: r.comment || r.review_comment,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(r.rating),
          bestRating: '5',
          worstRating: '1'
        }
      }))
    };
  }

  var trustBusy = false;
  var ctaDone = false;
  function initTrustUi() {
    if (trustBusy) return;
    trustBusy = true;
    try {
      document.querySelectorAll('[data-trust-badges]').forEach((el) => renderBadges(el));
      if (!ctaDone) {
        ctaDone = true;
        injectCtaMicrocopy();
      }
      const teamGrid = document.getElementById('teamGrid');
      if (teamGrid && !teamGrid.getAttribute('data-trust-team-done')) {
        teamGrid.setAttribute('data-trust-team-done', '1');
        renderTeam(teamGrid);
      }
      if (document.getElementById('testimonialsGrid') && !window.__TSM_TESTIMONIALS_API) {
        renderTestimonials('#testimonialsGrid', []);
      }
      const ld = reviewJsonLd();
      if (ld && !document.getElementById('tsm-review-jsonld')) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.id = 'tsm-review-jsonld';
        s.textContent = JSON.stringify(ld);
        document.head.appendChild(s);
      }
    } finally {
      trustBusy = false;
    }
  }

  function bootTrustUi() {
    if (global.__TSM_TRUST_BOOTED) return;
    global.__TSM_TRUST_BOOTED = true;
    initTrustUi();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTrustUi);
  } else {
    bootTrustUi();
  }

  global.TSM_SITE_CONFIG = TSM_SITE_CONFIG;
  global.TSM_TRUST_BADGES = TSM_TRUST_BADGES;
  global.TSM_REVIEWS = TSM_REVIEWS;
  global.TSM_TEAM = TSM_TEAM;
  global.TSMTrust = {
    quoteReassurance,
    publishedReviews,
    publishedTeam,
    renderBadges,
    renderTestimonials,
    renderTeam,
    reviewJsonLd,
    initTrustUi
  };
})(window);
