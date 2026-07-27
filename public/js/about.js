// about.js - Zara-inspired About page for Tanzania Safari Magic

document.addEventListener('DOMContentLoaded', async () => {
    await loadAboutContent();
    await loadTeamMembers();
    await loadBlogPosts();
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function loadAboutContent() {
    const mainContent = document.getElementById('aboutContent');
    if (!mainContent) return;

    let company = '';
    let mission = '';
    let vision = '';

    try {
        const result = await API.fetchJSON('/about-content');
        if (result && result.success && result.data) {
            company = result.data.about_company || '';
            mission = result.data.about_mission || '';
            vision = result.data.about_vision || '';
        }
    } catch (e) {
        console.warn('About CMS content unavailable, using defaults');
    }

    const story = company || `Tanzania Safari Magic is an Arusha-based tour operator specializing in private safari experiences and adventure travel across Tanzania. Founded with a passion for wildlife and community tourism, we craft bespoke itineraries that create employment for local guides while sharing the natural beauty and cultural richness of East Africa.`;

    mainContent.innerHTML = `
    <section class="zara-about">
      <div class="container">
        <nav class="zara-crumb" aria-label="Breadcrumb">
          <a href="/">Home</a> <span>›</span> <span>About Tanzania Safari Magic</span>
        </nav>

        <p class="zara-intro">
          ${escapeHtml(story)}
          Tanzania Safari Magic offers a variety of
          <a href="/safaris">safari</a> and adventure experiences that allow visitors to explore the natural beauty and cultural richness of Tanzania.
          Here are some of the experiences we offer:
        </p>

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
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-paw"></i></div>
              <div>
                <h2>Wildlife Safaris</h2>
                <p>Private game drives across
                  <a href="/destinations/serengeti-national-park">Serengeti</a>,
                  <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>,
                  <a href="/destinations/tarangire-national-park">Tarangire</a>, and
                  <a href="/destinations/lake-manyara-national-park">Lake Manyara</a>.
                  Spot the Big Five plus giraffes, zebras, wildebeest, and hippos with expert local guides.</p>
              </div>
            </article>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-mountain"></i></div>
              <div>
                <h2>Mountain Climbing</h2>
                <p>Guided treks on
                  <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro</a>
                  — Africa’s highest peak — plus Mount Meru routes for acclimatization and adventure seekers.</p>
              </div>
            </article>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-users"></i></div>
              <div>
                <h2>Cultural Tours</h2>
                <p>Authentic visits with Maasai, Hadzabe, and Chaga communities — villages, markets, and living traditions woven into your safari.</p>
              </div>
            </article>
            <article class="zara-service">
              <div class="zara-service-icon"><i class="fas fa-umbrella-beach"></i></div>
              <div>
                <h2>Beach Holidays</h2>
                <p>Bush-to-beach extensions in
                  <a href="/destinations/zanzibar">Zanzibar</a>
                  and coastal Tanzania — white sand, turquoise water, snorkeling, and spice culture after your safari.</p>
              </div>
            </article>
            <p class="zara-sustain">
              <strong>Sustainable Tourism:</strong> We partner with locally owned lodges, employ Tanzanian guides, and support conservation where we operate — so your journey benefits communities and wildlife.
            </p>
          </div>
        </div>

        <div class="zara-mv-grid">
          <a href="/about#mission" class="zara-mv-card" id="mission">
            <span class="zara-mv-label">Mission</span>
            <p>“${escapeHtml(mission || 'Our mission is to provide quality sustainable safari services and support responsible tourism by ensuring local community development and environmental sustainability across Tanzania.')}”</p>
          </a>
          <a href="/about#vision" class="zara-mv-card vision" id="vision">
            <span class="zara-mv-label">Vision</span>
            <p>“${escapeHtml(vision || 'Our vision is to become East Africa’s most trusted private safari operator — delivering exceptional, safe, and unforgettable journeys from Arusha.')}”</p>
          </a>
        </div>

        <div class="zara-hotels">
          <h2>Hotel Accommodation &amp; Holiday Villas</h2>
          <p>We arrange quality mid-range to luxury lodges, boutique hotels, and beach resorts across Tanzania’s parks and coasts — always tailored to your interests, pacing, and budget.</p>
          <div class="zara-cta-row">
            <a href="/booking" class="btn btn-primary" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
            <a href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%27m%20interested%20in%20booking%20a%20custom%20safari%20package..." class="btn btn-outline" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Us</a>
          </div>
        </div>

        <div class="zara-team-roles" id="teamRoles">
          <h2 class="zara-section-title">Tanzania Safari Magic Team</h2>
          <div class="zara-roles-grid">
            <div class="zara-role">
              <h3><i class="fas fa-plane-arrival"></i> Airport</h3>
              <p>Arrival can be stressful in a new country. Our pickup and airport team greets you and transfers you smoothly to your lodge or hotel.</p>
            </div>
            <div class="zara-role">
              <h3><i class="fas fa-concierge-bell"></i> Reception</h3>
              <p>Friendly front-of-house support during your stay — ready for any inquiry, schedule change, or last-minute request.</p>
            </div>
            <div class="zara-role">
              <h3><i class="fas fa-map-marked-alt"></i> Travel Consultant</h3>
              <p>Experienced planners who know Tanzania’s parks season by season and craft itineraries matched to your dates and interests.</p>
            </div>
            <div class="zara-role">
              <h3><i class="fas fa-binoculars"></i> Guides</h3>
              <p>Licensed safari guides with strong English (and other languages), deep wildlife knowledge, and a passion for safe, memorable game drives.</p>
            </div>
          </div>
        </div>

        <div class="corp-stat-row" style="margin-top:2.5rem">
          <div class="corp-stat"><strong>10+</strong><span>Years Experience</span></div>
          <div class="corp-stat"><strong>5,000+</strong><span>Guests Hosted</span></div>
          <div class="corp-stat"><strong>50+</strong><span>Expert Guides</span></div>
          <div class="corp-stat"><strong>Arusha</strong><span>Based Operator</span></div>
        </div>
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
            thumbs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

async function loadTeamMembers() {
    try {
        const result = await API.fetchJSON('/team-members');
        if (!(result && result.success && result.data && result.data.length)) return;

        const wrap = document.createElement('div');
        wrap.className = 'container';
        wrap.style.paddingBottom = '3rem';
        wrap.innerHTML = `
          <h2 class="zara-section-title" style="margin-bottom:1.5rem">Meet Our Expert Team</h2>
          <div class="zara-people-grid">
            ${result.data.map(member => {
                const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Team Member';
                return `
                  <div class="corp-panel zara-person">
                    <div class="zara-person-avatar"><i class="fas fa-user-circle"></i></div>
                    <h3>${escapeHtml(fullName)}</h3>
                    <p>${member.guide_id ? 'Safari Specialist' : 'Travel Consultant'}</p>
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
        const result = await API.fetchJSON('/blog?limit=3') || await API.fetchJSON('/blog-posts?limit=3');
        const posts = result?.data || [];
        if (!posts.length) return;
        const wrap = document.createElement('section');
        wrap.className = 'corp-section alt';
        wrap.innerHTML = `
          <div class="container">
            <h2 class="zara-section-title">From Our Blog</h2>
            <div class="corp-blog-grid" style="margin-top:1.5rem">
              ${posts.slice(0, 3).map(p => `
                <a class="corp-blog-card" href="/blog/${p.post_slug}">
                  <div class="blog-card-img">
                    <img src="${typeof imgSrc === 'function' ? imgSrc(p.featured_image_url) : (p.featured_image_url || '/images/optimized/mbugani.webp')}" alt="${escapeHtml(p.post_title)}" loading="lazy" width="640" height="360">
                  </div>
                  <div class="body">
                    <h3>${escapeHtml(p.post_title)}</h3>
                    <p class="excerpt">${escapeHtml(p.post_excerpt || '')}</p>
                    <span class="blog-card-link">Read Articles <i class="fas fa-arrow-right"></i></span>
                  </div>
                </a>`).join('')}
            </div>
          </div>`;
        document.getElementById('aboutContent')?.appendChild(wrap);
    } catch (e) {
        /* optional */
    }
}
