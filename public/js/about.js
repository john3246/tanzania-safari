// about.js — content-rich About page for Tanzania Safari Magic

function t(key, vars) {
    if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
    return key;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Locale-owned HTML only (our JSON). Strip scripts; keep simple anchors/strong. */
function localeHtml(str) {
    return String(str || '')
        .replace(/<(?!\/?(?:a|strong)\b)[^>]*>/gi, '')
        .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
        .replace(/javascript:/gi, '');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
    } catch (_) {}
    await loadAboutContent();
    await loadTeamMembers();
    await loadBlogPosts();
});

async function loadAboutContent() {
    const mainContent = document.getElementById('aboutContent');
    if (!mainContent) return;

    let company = '';
    let mission = '';
    let vision = '';

    try {
        if (typeof API !== 'undefined' && typeof API.get === 'function') {
            const result = await API.get('/about-content');
            if (result && result.success && result.data) {
                company = result.data.about_company || '';
                mission = result.data.about_mission || '';
                vision = result.data.about_vision || '';
            }
        }
    } catch (_) {
        /* CMS optional — locale defaults below */
    }

    const storyLead = company || t('about.storyLead');
    const missionText = mission || t('about.defaultMission');
    const visionText = vision || t('about.defaultVision');

    const whyItems = [
        { icon: 'fa-map-marker-alt', title: t('about.why1Title'), desc: t('about.why1Desc') },
        { icon: 'fa-car', title: t('about.why2Title'), desc: t('about.why2Desc') },
        { icon: 'fa-binoculars', title: t('about.why3Title'), desc: t('about.why3Desc') },
        { icon: 'fa-comments', title: t('about.why4Title'), desc: t('about.why4Desc') },
        { icon: 'fa-hand-holding-heart', title: t('about.why5Title'), desc: t('about.why5Desc') }
    ];

    mainContent.innerHTML = `
    <section class="zara-about">
      <div class="container">
        <nav class="zara-crumb" aria-label="Breadcrumb">
          <a href="/">${escapeHtml(t('common.home'))}</a> <span>›</span> <span>${escapeHtml(t('about.crumbAbout'))}</span>
        </nav>

        <header class="about-who">
          <p class="about-kicker">${escapeHtml(t('about.whoEyebrow'))}</p>
          <h2 class="about-section-heading">${escapeHtml(t('about.whoTitle'))}</h2>
          <p class="zara-intro about-lead">${escapeHtml(storyLead)}</p>
          <div class="about-prose">
            <p>${localeHtml(t('about.storyP1'))}</p>
            <p>${localeHtml(t('about.storyP2'))}</p>
            <p>${localeHtml(t('about.storyP3'))}</p>
          </div>
        </header>

        <div class="zara-mv-grid" role="region" aria-label="Mission and vision">
          <article class="zara-mv-card" id="mission">
            <span class="zara-mv-label"><i class="fas fa-compass" aria-hidden="true"></i> ${escapeHtml(t('about.mission'))}</span>
            <h3 class="zara-mv-title">${escapeHtml(t('about.missionHeading'))}</h3>
            <p>${escapeHtml(missionText)}</p>
          </article>
          <article class="zara-mv-card vision" id="vision">
            <span class="zara-mv-label"><i class="fas fa-eye" aria-hidden="true"></i> ${escapeHtml(t('about.vision'))}</span>
            <h3 class="zara-mv-title">${escapeHtml(t('about.visionHeading'))}</h3>
            <p>${escapeHtml(visionText)}</p>
          </article>
        </div>

        <div class="zara-split">
          <div class="zara-gallery" aria-label="Safari photo gallery">
            <div class="zara-gallery-main">
              <img id="zaraMainImg" src="/images/optimized/balloon.webp" alt="Hot air balloon over the Serengeti" width="800" height="600" loading="eager">
            </div>
            <div class="zara-gallery-thumbs">
              <button type="button" class="zara-thumb active" data-src="/images/optimized/balloon.webp" aria-label="Balloon safari"><img src="/images/optimized/balloon.webp" alt=""></button>
              <button type="button" class="zara-thumb" data-src="/images/optimized/mbugani.webp" aria-label="Wildlife"><img src="/images/optimized/mbugani.webp" alt=""></button>
              <button type="button" class="zara-thumb" data-src="/images/optimized/wamasai.webp" aria-label="Culture"><img src="/images/optimized/wamasai.webp" alt=""></button>
              <button type="button" class="zara-thumb" data-src="/images/optimized/zanzibar.webp" aria-label="Zanzibar"><img src="/images/optimized/zanzibar.webp" alt="" onerror="this.parentElement.style.display='none'"></button>
              <button type="button" class="zara-thumb" data-src="/images/optimized/mount-kilimanjaro-national-park.webp" aria-label="Kilimanjaro"><img src="/images/optimized/mount-kilimanjaro-national-park.webp" alt=""></button>
            </div>
          </div>

          <div class="zara-services">
            <p class="about-kicker">${escapeHtml(t('about.offerEyebrow'))}</p>
            <h2 class="about-section-heading" style="text-align:left;margin-bottom:1.25rem">${escapeHtml(t('about.offerTitle'))}</h2>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-paw"></i></div>
              <div>
                <h3>${escapeHtml(t('about.wildlifeTitle'))}</h3>
                <p>${localeHtml(t('about.wildlifeDesc'))}</p>
              </div>
            </article>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-mountain"></i></div>
              <div>
                <h3>${escapeHtml(t('about.mountainTitle'))}</h3>
                <p>${localeHtml(t('about.mountainDesc'))}</p>
              </div>
            </article>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-users"></i></div>
              <div>
                <h3>${escapeHtml(t('about.culturalTitle'))}</h3>
                <p>${escapeHtml(t('about.culturalDesc'))}</p>
              </div>
            </article>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-umbrella-beach"></i></div>
              <div>
                <h3>${escapeHtml(t('about.beachTitle'))}</h3>
                <p>${localeHtml(t('about.beachDesc'))}</p>
              </div>
            </article>
          </div>
        </div>

        <section class="about-why" aria-labelledby="whyHeading">
          <p class="about-kicker">${escapeHtml(t('about.whyEyebrow'))}</p>
          <h2 class="about-section-heading" id="whyHeading">${escapeHtml(t('about.whyTitle'))}</h2>
          <p class="about-section-lead">${escapeHtml(t('about.whyLead'))}</p>
          <ol class="about-why-list">
            ${whyItems.map((item, i) => `
              <li>
                <span class="about-why-num" aria-hidden="true">${i + 1}</span>
                <div>
                  <h3><i class="fas ${item.icon}" aria-hidden="true"></i> ${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.desc)}</p>
                </div>
              </li>`).join('')}
          </ol>
        </section>

        <section class="about-promise" aria-labelledby="promiseHeading">
          <div class="about-promise-inner">
            <div>
              <p class="about-kicker">${escapeHtml(t('about.promiseEyebrow'))}</p>
              <h2 class="about-section-heading" id="promiseHeading" style="text-align:left">${escapeHtml(t('about.promiseTitle'))}</h2>
              <p>${escapeHtml(t('about.promiseP1'))}</p>
              <p>${escapeHtml(t('about.promiseP2'))}</p>
            </div>
            <ul class="about-promise-points">
              <li><i class="fas fa-check" aria-hidden="true"></i> ${escapeHtml(t('about.promisePoint1'))}</li>
              <li><i class="fas fa-check" aria-hidden="true"></i> ${escapeHtml(t('about.promisePoint2'))}</li>
              <li><i class="fas fa-check" aria-hidden="true"></i> ${escapeHtml(t('about.promisePoint3'))}</li>
              <li><i class="fas fa-check" aria-hidden="true"></i> ${escapeHtml(t('about.promisePoint4'))}</li>
            </ul>
          </div>
        </section>

        <div class="zara-sustain about-sustain-block">
          <h2 class="about-section-heading" style="text-align:left;margin-bottom:0.75rem">${escapeHtml(t('about.sustainableTitle'))}</h2>
          <p style="margin:0">${escapeHtml(t('about.sustainableDesc'))}</p>
          <p style="margin:0.85rem 0 0">${escapeHtml(t('about.sustainableExtra'))}</p>
        </div>

        <div class="zara-hotels">
          <h2>${escapeHtml(t('about.hotelsTitle'))}</h2>
          <p>${escapeHtml(t('about.hotelsDesc'))}</p>
          <p>${escapeHtml(t('about.hotelsExtra'))}</p>
          <div class="zara-cta-row">
            <a href="/booking" class="btn btn-primary" style="min-height:48px"><i class="fas fa-calendar-check"></i> ${escapeHtml(t('about.bookCta'))}</a>
            <a href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%27m%20interested%20in%20booking%20a%20custom%20safari%20package..." class="btn btn-outline" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> ${escapeHtml(t('about.contactCta'))}</a>
            <a href="/safaris" class="btn btn-outline" style="min-height:48px"><i class="fas fa-paw"></i> ${escapeHtml(t('about.browseSafaris'))}</a>
          </div>
        </div>

        <div class="zara-team-roles" id="teamRoles">
          <h2 class="zara-section-title">${escapeHtml(t('about.teamTitle'))}</h2>
          <p class="about-section-lead">${escapeHtml(t('about.teamLead'))}</p>
          <div class="zara-roles-grid">
            <div class="zara-role">
              <h3><i class="fas fa-plane-arrival"></i> ${escapeHtml(t('about.roleAirport'))}</h3>
              <p>${escapeHtml(t('about.roleAirportDesc'))}</p>
            </div>
            <div class="zara-role">
              <h3><i class="fas fa-concierge-bell"></i> ${escapeHtml(t('about.roleReception'))}</h3>
              <p>${escapeHtml(t('about.roleReceptionDesc'))}</p>
            </div>
            <div class="zara-role">
              <h3><i class="fas fa-map-marked-alt"></i> ${escapeHtml(t('about.roleConsultant'))}</h3>
              <p>${escapeHtml(t('about.roleConsultantDesc'))}</p>
            </div>
            <div class="zara-role">
              <h3><i class="fas fa-binoculars"></i> ${escapeHtml(t('about.roleGuides'))}</h3>
              <p>${escapeHtml(t('about.roleGuidesDesc'))}</p>
            </div>
          </div>
        </div>

        <div class="corp-stat-row" style="margin-top:2.5rem">
          <div class="corp-stat"><strong>10+</strong><span>${escapeHtml(t('about.yearsExp'))}</span></div>
          <div class="corp-stat"><strong>5,000+</strong><span>${escapeHtml(t('about.guestsHosted'))}</span></div>
          <div class="corp-stat"><strong>50+</strong><span>${escapeHtml(t('about.expertGuides'))}</span></div>
          <div class="corp-stat"><strong>Arusha</strong><span>${escapeHtml(t('about.basedOperator'))}</span></div>
        </div>

        <section class="about-final-cta" aria-labelledby="finalCtaHeading">
          <h2 id="finalCtaHeading">${escapeHtml(t('about.finalCtaTitle'))}</h2>
          <p>${escapeHtml(t('about.finalCtaDesc'))}</p>
          <div class="zara-cta-row" style="justify-content:center">
            <a href="/booking" class="btn btn-primary" style="min-height:48px">${escapeHtml(t('about.bookCta'))}</a>
            <a href="/contact" class="btn btn-outline" style="min-height:48px">${escapeHtml(t('about.talkExpert'))}</a>
          </div>
        </section>
      </div>
    </section>
    `;

    initZaraGallery();
}

function initZaraGallery() {
    const main = document.getElementById('zaraMainImg');
    const thumbs = document.querySelectorAll('.zara-thumb');
    if (!main || !thumbs.length) return;
    thumbs.forEach(btn => {
        btn.addEventListener('click', () => {
            const src = btn.getAttribute('data-src');
            if (!src) return;
            main.src = src;
            thumbs.forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

async function loadTeamMembers() {
    try {
        if (typeof API === 'undefined' || typeof API.get !== 'function') return;
        const result = await API.get('/team-members');
        if (!(result && result.success && result.data && result.data.length)) return;

        const wrap = document.createElement('div');
        wrap.className = 'container';
        wrap.style.paddingBottom = '3rem';
        wrap.innerHTML = `
          <h2 class="zara-section-title" style="margin-bottom:1.5rem">${escapeHtml(t('about.meetTeam'))}</h2>
          <div class="zara-people-grid">
            ${result.data.map(member => {
                const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || t('about.teamMember');
                return `
                  <div class="corp-panel zara-person">
                    <div class="zara-person-avatar"><i class="fas fa-user-circle"></i></div>
                    <h3>${escapeHtml(fullName)}</h3>
                    <p>${escapeHtml(member.guide_id ? t('about.safariSpecialist') : t('about.travelConsultant'))}</p>
                  </div>`;
            }).join('')}
          </div>`;
        document.getElementById('aboutContent')?.appendChild(wrap);
    } catch (error) {
        console.error('Error loading team members:', error);
    }
}

async function loadBlogPosts() {
    try {
        if (typeof API === 'undefined' || typeof API.get !== 'function') return;
        let result;
        try {
            result = await API.get('/blog?limit=3');
        } catch (_) {
            result = await API.get('/blog-posts?limit=3');
        }
        const posts = result?.data || [];
        if (!posts.length) return;
        const wrap = document.createElement('section');
        wrap.className = 'corp-section alt';
        wrap.innerHTML = `
          <div class="container">
            <h2 class="zara-section-title">${escapeHtml(t('about.fromBlog'))}</h2>
            <div class="corp-blog-grid" style="margin-top:1.5rem">
              ${posts.slice(0, 3).map(p => `
                <a class="corp-blog-card" href="/blog/${p.post_slug}">
                  <div class="blog-card-img">
                    <img src="${typeof imgSrc === 'function' ? imgSrc(p.featured_image_url) : (p.featured_image_url || '/images/optimized/mbugani.webp')}" alt="${escapeHtml(p.post_title)}" loading="lazy" width="640" height="360">
                  </div>
                  <div class="body">
                    <h3>${escapeHtml(p.post_title)}</h3>
                    <p class="excerpt">${escapeHtml(p.post_excerpt || '')}</p>
                    <span class="blog-card-link">${escapeHtml(t('about.readGuides'))} <i class="fas fa-arrow-right"></i></span>
                  </div>
                </a>`).join('')}
            </div>
          </div>`;
        document.getElementById('aboutContent')?.appendChild(wrap);
    } catch (_) {
        /* optional */
    }
}
