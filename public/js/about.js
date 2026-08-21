// about.js — content-rich About page for Tanzania Safari Magic

const ABOUT_FALLBACKS = {
    'common.home': 'Home',
    'about.crumbAbout': 'About Tanzania Safari Magic',
    'about.whoEyebrow': 'Who we are',
    'about.whoTitle': 'An Arusha-based team dedicated to Tanzania',
    'about.storyLead':
        'Tanzania Safari Magic is a licensed local tour operator based in Arusha — the gateway to Serengeti, Ngorongoro, Tarangire, and Kilimanjaro. We design private safaris and adventure journeys for travellers who want expert guiding, flexible pacing, and honest advice from people who live here year-round.',
    'about.storyP1':
        'Our story began with a simple belief: a Tanzania holiday should feel personal, safe, and unforgettable — not like a catalogue tour passed from one middleman to another. From our Arusha base we plan and run trips ourselves: private game drives, <a href="/kilimanjaro/routes">Kilimanjaro routes</a>, cultural visits, and bush-to-beach extensions to <a href="/destinations/zanzibar">Zanzibar</a>.',
    'about.storyP2':
        'Most of our consultants and guides work in Tanzania throughout the year. That local presence means up-to-date park knowledge, reliable lodge relationships, and real-time adjustments when wildlife moves, weather shifts, or you simply want a slower morning at camp.',
    'about.storyP3':
        'Whether you are dreaming of the Great Migration, a family-friendly northern circuit, a summit attempt on Kilimanjaro, or quiet days on the Indian Ocean, we start with your ideas — then handle the logistics, vehicles, guiding, and accommodation so you can focus on the experience.',
    'about.offerEyebrow': 'What we do',
    'about.offerTitle': 'Safaris, treks, culture & coast',
    'about.wildlifeTitle': 'Wildlife Safaris',
    'about.wildlifeDesc':
        'Private game drives across <a href="/destinations/serengeti-national-park">Serengeti</a>, <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, <a href="/destinations/tarangire-national-park">Tarangire</a>, and <a href="/destinations/lake-manyara-national-park">Lake Manyara</a>. Spot the Big Five plus giraffes, zebras, wildebeest, and hippos with expert local guides.',
    'about.mountainTitle': 'Mountain Climbing',
    'about.mountainDesc':
        'Guided treks on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro</a> — Africa’s highest peak — plus Mount Meru routes for acclimatization and adventure seekers.',
    'about.culturalTitle': 'Cultural Tours',
    'about.culturalDesc':
        'Authentic visits with Maasai, Hadzabe, and Chaga communities — villages, markets, and living traditions woven into your safari.',
    'about.beachTitle': 'Beach Holidays',
    'about.beachDesc':
        'Bush-to-beach extensions in <a href="/destinations/zanzibar">Zanzibar</a> and coastal Tanzania — white sand, turquoise water, snorkeling, and spice culture after your safari.',
    'about.whyEyebrow': 'Why travel with us',
    'about.whyTitle': 'Why choose Tanzania Safari Magic?',
    'about.whyLead':
        'For a once-in-a-lifetime trip, it helps to deal directly with a licensed local operator — not a reseller. Here is what sets our Arusha team apart.',
    'about.why1Title': 'We are a local tour operator',
    'about.why1Desc':
        'With our own Arusha base, experienced planners, and safari vehicles, we oversee your holiday from arrival to departure — so logistics stay coordinated on the ground.',
    'about.why2Title': 'Private safaris at your pace',
    'about.why2Desc':
        'Your guide and vehicle are yours. Start earlier for predator action, linger at a sighting, or return for sunset — itineraries flex around how you want to travel.',
    'about.why3Title': 'World-class local guides',
    'about.why3Desc':
        'We select licensed guides for wildlife knowledge, safety, and clear communication. Only guides who meet our standards lead guests into the parks.',
    'about.why4Title': 'Expert, honest advice',
    'about.why4Desc':
        'Our consultants specialise in Tanzania: migration timing, Kilimanjaro routes, lodge styles, and family pacing. We help you choose what is worth it for your dates and budget.',
    'about.why5Title': 'Clear value without the middleman',
    'about.why5Desc':
        'By operating locally we reduce layers of commission. You get transparent quotes and quality mid-range to luxury experiences matched to what you actually need.',
    'about.promiseEyebrow': 'How we work',
    'about.promiseTitle': 'Your ideas first — we handle the rest',
    'about.promiseP1':
        'Use our sample itineraries for inspiration, or tell us your dates, group size, and must-sees. We build a clear proposal with lodges, park fees, and day-by-day pacing — then refine until it feels right.',
    'about.promiseP2':
        'Prefer guidance? Our Arusha specialists are happy to recommend seasons, routes, and lodge styles so you are not deciding alone. The goal is simple: a Tanzania trip that exceeds expectations.',
    'about.promisePoint1': 'Free custom quotes — no obligation',
    'about.promisePoint2': 'Licensed Tanzanian guides & 4x4 safari vehicles',
    'about.promisePoint3': 'Lodge partners assessed for comfort, location & value',
    'about.promisePoint4': 'WhatsApp & email support before and during travel',
    'about.sustainableTitle': 'Responsible & sustainable tourism',
    'about.sustainableDesc':
        'We partner with locally owned lodges, employ Tanzanian guides and drivers, and favour practices that protect wildlife habitats and respect community land.',
    'about.sustainableExtra':
        'Your journey should leave a positive footprint — fair work for our teams, support for conservation fees that fund the parks, and cultural visits that are dignified and mutually beneficial.',
    'about.mission': 'Mission',
    'about.vision': 'Vision',
    'about.missionHeading': 'What drives every journey we plan',
    'about.visionHeading': 'Where we are headed',
    'about.defaultMission':
        'To give every traveller the best Tanzania experience we can — private itineraries crafted with care, safe guiding, quality lodges, and responsible practices that support local communities and the wild places we visit.',
    'about.defaultVision':
        'To be East Africa’s most trusted private safari operator — the team travellers recommend when friends ask who to book with for Serengeti, Kilimanjaro, and Zanzibar.',
    'about.defaultStory':
        'Tanzania Safari Magic is an Arusha-based tour operator specializing in private safari experiences and adventure travel across Tanzania.',
    'about.meetTeam': 'Meet Our Expert Team',
    'about.readGuides': 'Read Articles',
    'about.bookCta': 'Get a Free Quote',
    'about.contactCta': 'WhatsApp Us',
    'about.browseSafaris': 'Browse Safaris',
    'about.talkExpert': 'Talk to an Expert',
    'about.hotelsTitle': 'Lodges, hotels & beach resorts',
    'about.hotelsDesc':
        'We arrange quality mid-range to luxury lodges, tented camps, boutique hotels, and beach resorts across Tanzania’s parks and coasts — matched to your interests, pacing, and budget.',
    'about.hotelsExtra':
        'Our on-site team personally knows many of the properties we recommend, so we can advise on location, family suitability, and which camps work best for migration or crater viewing.',
    'about.teamTitle': 'The people behind your trip',
    'about.teamLead':
        'From airport meet-and-greet to the guide in your vehicle, every role is staffed to keep your journey smooth and personal.',
    'about.roleAirport': 'Airport',
    'about.roleAirportDesc':
        'Arrival can be stressful in a new country. Our pickup and airport team greets you and transfers you smoothly to your lodge or hotel.',
    'about.roleReception': 'Reception',
    'about.roleReceptionDesc':
        'Friendly front-of-house support during your stay — ready for any inquiry, schedule change, or last-minute request.',
    'about.roleConsultant': 'Travel Consultant',
    'about.roleConsultantDesc':
        'Experienced planners who know Tanzania’s parks season by season and craft itineraries matched to your dates and interests.',
    'about.roleGuides': 'Guides',
    'about.roleGuidesDesc':
        'Licensed safari guides with strong English (and other languages), deep wildlife knowledge, and a passion for safe, memorable game drives.',
    'about.yearsExp': 'Years Experience',
    'about.guestsHosted': 'Guests Hosted',
    'about.expertGuides': 'Expert Guides',
    'about.basedOperator': 'Based in Arusha',
    'about.finalCtaTitle': 'Ready to start your Tanzania adventure?',
    'about.finalCtaDesc':
        'Share your travel dates and ideas — we will reply with a tailored itinerary and clear pricing from our Arusha team.',
    'about.fromBlog': 'From Our Blog',
    'about.teamMember': 'Team Member',
    'about.safariSpecialist': 'Safari Specialist',
    'about.travelConsultant': 'Travel Consultant'
};

function t(key, vars) {
    let val;
    if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') {
        val = window.TSM_i18n.t(key, vars);
    }
    if (val == null || val === key) val = ABOUT_FALLBACKS[key];
    if (val == null) return key;
    if (vars && typeof val === 'string') {
        return val.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
    }
    return val;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Locale-owned HTML only (our JSON / fallbacks). Keep simple anchors/strong. */
function localeHtml(str) {
    return String(str || '')
        .replace(/<(?!\/?(?:a|strong)\b)[^>]*>/gi, '')
        .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
        .replace(/javascript:/gi, '');
}

async function waitForI18n(timeoutMs = 4000) {
    try {
        if (typeof ensureI18nLoaded === 'function') {
            await Promise.race([
                ensureI18nLoaded(),
                new Promise((resolve) => setTimeout(resolve, timeoutMs))
            ]);
            return;
        }
        if (window.TSM_i18n && window.TSM_i18n.ready) {
            await Promise.race([
                window.TSM_i18n.ready,
                new Promise((resolve) => setTimeout(resolve, timeoutMs))
            ]);
            return;
        }
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if (window.TSM_i18n && window.TSM_i18n.ready) {
                await Promise.race([
                    window.TSM_i18n.ready,
                    new Promise((resolve) => setTimeout(resolve, Math.max(0, timeoutMs - (Date.now() - start))))
                ]);
                return;
            }
            await new Promise((r) => setTimeout(r, 40));
        }
    } catch (_) {
        /* render with English fallbacks */
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await waitForI18n();
    try {
        loadAboutContent();
    } catch (err) {
        console.error('About page render failed:', err);
        const main = document.getElementById('aboutContent');
        if (main) {
            main.innerHTML =
                '<section class="zara-about"><div class="container"><p class="zara-intro">' +
                escapeHtml(t('about.storyLead')) +
                '</p><div class="zara-cta-row" style="justify-content:center"><a class="btn btn-primary" href="/booking">' +
                escapeHtml(t('about.bookCta')) +
                '</a></div></div></section>';
        }
    }
    // Optional extras — never block the page
    loadTeamMembers().catch(() => {});
    loadBlogPosts().catch(() => {});
});

function loadAboutContent() {
    const mainContent = document.getElementById('aboutContent');
    if (!mainContent) return;

    const storyLead = t('about.storyLead');
    const missionText = t('about.defaultMission');
    const visionText = t('about.defaultVision');

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
            ${whyItems
                .map(
                    (item, i) => `
              <li>
                <span class="about-why-num" aria-hidden="true">${i + 1}</span>
                <div>
                  <h3><i class="fas ${item.icon}" aria-hidden="true"></i> ${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.desc)}</p>
                </div>
              </li>`
                )
                .join('')}
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
    thumbs.forEach((btn) => {
        btn.addEventListener('click', () => {
            const src = btn.getAttribute('data-src');
            if (!src) return;
            main.src = src;
            thumbs.forEach((el) => el.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

async function loadTeamMembers() {
    if (typeof API === 'undefined' || typeof API.get !== 'function') return;
    let result;
    try {
        result = await API.get('/team-members');
    } catch (_) {
        return;
    }
    if (!(result && result.success && result.data && result.data.length)) return;

    const wrap = document.createElement('div');
    wrap.className = 'container';
    wrap.style.paddingBottom = '3rem';
    wrap.innerHTML = `
          <h2 class="zara-section-title" style="margin-bottom:1.5rem">${escapeHtml(t('about.meetTeam'))}</h2>
          <div class="zara-people-grid">
            ${result.data
                .map((member) => {
                    const fullName =
                        `${member.first_name || ''} ${member.last_name || ''}`.trim() || t('about.teamMember');
                    return `
                  <div class="corp-panel zara-person">
                    <div class="zara-person-avatar"><i class="fas fa-user-circle"></i></div>
                    <h3>${escapeHtml(fullName)}</h3>
                    <p>${escapeHtml(member.guide_id ? t('about.safariSpecialist') : t('about.travelConsultant'))}</p>
                  </div>`;
                })
                .join('')}
          </div>`;
    document.getElementById('aboutContent')?.appendChild(wrap);
}

async function loadBlogPosts() {
    if (typeof API === 'undefined' || typeof API.get !== 'function') return;
    let result;
    try {
        result = await API.get('/blog?limit=3');
    } catch (_) {
        try {
            result = await API.get('/blog-posts?limit=3');
        } catch (_) {
            return;
        }
    }
    const posts = result?.data || [];
    if (!posts.length) return;
    const wrap = document.createElement('section');
    wrap.className = 'corp-section alt';
    wrap.innerHTML = `
          <div class="container">
            <h2 class="zara-section-title">${escapeHtml(t('about.fromBlog'))}</h2>
            <div class="corp-blog-grid" style="margin-top:1.5rem">
              ${posts
                  .slice(0, 3)
                  .map(
                      (p) => `
                <a class="corp-blog-card" href="/blog/${escapeHtml(p.post_slug)}">
                  <div class="blog-card-img">
                    <img src="${typeof imgSrc === 'function' ? imgSrc(p.featured_image_url) : p.featured_image_url || '/images/optimized/mbugani.webp'}" alt="${escapeHtml(p.post_title)}" loading="lazy" width="640" height="360">
                  </div>
                  <div class="body">
                    <h3>${escapeHtml(p.post_title)}</h3>
                    <p class="excerpt">${escapeHtml(p.post_excerpt || '')}</p>
                    <span class="blog-card-link">${escapeHtml(t('about.readGuides'))} <i class="fas fa-arrow-right"></i></span>
                  </div>
                </a>`
                  )
                  .join('')}
            </div>
          </div>`;
    document.getElementById('aboutContent')?.appendChild(wrap);
}
