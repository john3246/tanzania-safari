/**
 * First Tanzania Safari Guide — Tanzania Safari Magic (original copy)
 * Author: John Raphael Shayo · Arusha
 */
(function (global) {
  const TEAM = {
    name: 'Our Team',
    role: 'Safari Specialists · Arusha',
    bio: 'Tanzania Safari Magic’s Arusha team helps first-time guests prepare for private and group safaris across Serengeti, Ngorongoro, Tarangire, and beyond.',
    image: '/images/logo.png',
    whatsapp: 'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20am%20planning%20my%20first%20Tanzania%20safari%20and%20need%20advice.'
  };

  const META = {
    slug: 'first-tanzania-safari',
    title: 'Your First Tanzania Safari: How to Prepare with Confidence',
    meta_title: 'First Tanzania Safari Guide 2026 | Packing, Vaccines & What to Expect',
    meta_description: 'Preparing for your first Tanzania safari? Vaccines mindset, packing list, game-drive expectations, private vs group options — from Tanzania Safari Magic in Arusha.',
    excerpt: 'A practical first-safari guide: health mindset, packing, what game drives feel like, and when to choose private vs group departures from Arusha.',
    featured_image_url: '/images/optimized/serengeti-national-park.webp',
    published_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-06T10:00:00.000Z',
    category_name: 'Safari Guides',
    author_name: 'John Raphael Shayo',
    post_tags: ['first tanzania safari', 'safari packing', 'safari vaccines', 'game drives', 'private safari', 'group safari'],
    keywords: 'first tanzania safari, prepare for safari tanzania, safari packing list, what to expect on safari, private vs group safari tanzania, arusha safari tips'
  };

  const FAQS = [
    {
      q: 'Do I need vaccines for a Tanzania safari?',
      a: 'Requirements depend on your home country and recent travel. Yellow fever proof may be asked if you arrive from certain countries. Speak with a travel clinic well before departure — we share logistics tips, not medical advice. Confirm official entry rules closer to your trip.'
    },
    {
      q: 'Should I book a private safari or join a group?',
      a: 'Private safaris suit couples, families, and anyone who wants flexible timing and photography stops. Group departures lower the per-person cost and work well for solo travellers. Compare both on our safaris and group-safaris pages, or ask Our Team which fits your dates.'
    },
    {
      q: 'What should I pack for my first safari?',
      a: 'Neutral layers, a warm fleece for early mornings, sun hat, closed shoes, binoculars, soft duffel (not hard suitcase for light flights), and any personal medications. We send a tailored checklist with your confirmation.'
    },
    {
      q: 'How long should a first Tanzania safari be?',
      a: 'Most first-timers do well with 6–9 days on the northern circuit so you see Tarangire, Serengeti, and Ngorongoro without rushing. Shorter trips work; longer ones add migration focus or Zanzibar.'
    },
    {
      q: 'Is a first safari suitable for children?',
      a: 'Yes with the right pacing — private vehicles make snack, rest, and photo stops easier. Tell us ages when you enquire so we recommend lodges and drive lengths that fit families.'
    }
  ];

  function contentHtml() {
    return `
<p class="guide-lead"><strong>Your first Tanzania safari</strong> should feel exciting — not overwhelming. With a clear plan for health checks, packing, and how game drives actually work, you arrive ready to enjoy the wildlife instead of second-guessing logistics.</p>
<p>I’m <strong>John Raphael Shayo</strong> with <strong>Tanzania Safari Magic</strong> in Arusha. This guide walks first-time guests through preparation mindset, packing, private vs group choices, and what a typical day in the bush looks like. For the bigger picture, read our <a href="/blog/tanzania-safari">Tanzania safari guide</a> and <a href="/blog/tanzania-safari-cost">safari cost guide</a>.</p>

<figure class="guide-figure">
  <img src="/images/optimized/serengeti-national-park.webp" alt="First Tanzania safari Serengeti plains game drive" width="1200" height="750" loading="eager">
  <figcaption>Serengeti open plains — the classic setting for a first northern-circuit safari.</figcaption>
</figure>

<div class="guide-cta-box" id="quote-first-safari">
  <h2>Plan Your First Safari with Our Team</h2>
  <p>Tell us your dates, group size, and comfort level — we reply with a clear private or group option, usually within 24 hours.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px"><i class="fas fa-calendar-check"></i> Free First-Safari Quote</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/safaris" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Browse Safaris</a>
  </div>
</div>

<nav class="guide-toc" id="first-safari-toc" aria-label="First Tanzania safari guide contents">
  <h2>In This Guide</h2>
  <ol>
    <li><a href="#mindset">Health &amp; Vaccines Mindset</a></li>
    <li><a href="#packing">What to Pack</a></li>
    <li><a href="#game-drives">What to Expect on Game Drives</a></li>
    <li><a href="#private-vs-group">Private vs Group Safari</a></li>
    <li><a href="#before-you-fly">Checklist Before You Fly</a></li>
    <li><a href="#faq-first-safari">FAQs</a></li>
  </ol>
</nav>

<h2 id="mindset">Health &amp; Vaccines Mindset</h2>
<p>Treat medical preparation as a personal conversation with a qualified travel clinic — not something to copy from a blog. Rules change, and yellow fever or other requirements can depend on where you live and which countries you transit.</p>
<ul>
  <li>Book a clinic visit several weeks before departure</li>
  <li>Ask about malaria prevention options suitable for your itinerary</li>
  <li>Carry prescriptions in original packaging and a simple first-aid kit</li>
  <li>Buy travel insurance that covers safari activities and medical evacuation</li>
</ul>
<p>Our Team handles park bookings, lodges, and transfers. For visa and entry paperwork overview, see our <a href="/blog/tanzania-visa-guide">Tanzania visa guide</a> and always verify current rules on official government sources.</p>

<figure class="guide-figure">
  <img src="/images/optimized/mbugani.webp" alt="Safari vehicle Tanzania first-time game drive" width="1200" height="750" loading="lazy">
  <figcaption>Pop-up 4x4 vehicles are the standard for northern Tanzania game drives.</figcaption>
</figure>

<h2 id="packing">What to Pack for Your First Safari</h2>
<p>You do not need a military wardrobe. Comfort, sun protection, and soft luggage matter most.</p>
<ul>
  <li><strong>Clothing:</strong> Neutral greens, khaki, or beige layers; long sleeves for sun and insects; one warmer layer for dawn drives</li>
  <li><strong>Footwear:</strong> Closed walking shoes or trainers; sandals for lodge evenings</li>
  <li><strong>Sun &amp; insects:</strong> Wide-brim hat, high-SPF sunscreen, sunglasses, insect repellent</li>
  <li><strong>Optics:</strong> Binoculars (8× or 10×) transform distant sightings</li>
  <li><strong>Bags:</strong> Soft duffel preferred — hard cases are awkward on light aircraft and lodge transfers</li>
  <li><strong>Power:</strong> Camera batteries, power bank, universal adapter</li>
</ul>
<p>Leave bright whites and heavy perfume at home; both can work against comfortable wildlife viewing. We include a packing PDF with every confirmed booking.</p>

<div class="guide-cta-box compact">
  <p style="margin:0">Unsure whether to go private or shared? We’ll match the format to your budget and travel style.</p>
  <a class="btn btn-primary" href="/booking" style="min-height:48px">Get Advice &amp; Quote</a>
</div>

<h2 id="game-drives">What to Expect on Game Drives</h2>
<p>A typical safari day starts early. Cool morning air brings animals into the open; midday often means lodge rest or a slower loop; late afternoon drives pick up again toward sunset.</p>
<ul>
  <li>Vehicles use pop-up roofs so you can stand for photos when safe</li>
  <li>Guides communicate with other drivers about recent sightings — patience pays</li>
  <li>You will not see every species every day; variety builds across parks</li>
  <li>Dust, bumps, and long sits are normal — stretch at designated stops</li>
</ul>
<p>Browse park ideas on our <a href="/destinations">destinations hub</a>, then lock dates via <a href="/booking">booking</a>.</p>

<figure class="guide-figure">
  <img src="/images/optimized/balloon.webp" alt="Optional balloon safari Tanzania first trip" width="1200" height="750" loading="lazy">
  <figcaption>Optional balloon flights over the Serengeti — ask us to add one if it fits your budget.</figcaption>
</figure>

<h2 id="private-vs-group">Private vs Group Safari</h2>
<p><strong>Private safaris</strong> give you your own guide and 4x4. You set the pace, pause for photography, and adjust for kids or seniors. See current <a href="/safaris">private safari packages</a>.</p>
<p><strong>Group departures</strong> share a vehicle with other travellers on fixed dates — usually the more economical path, and a natural fit if you are travelling alone. Explore <a href="/group-safaris">group safari options</a>.</p>
<p>Many first-timers start private for flexibility; solo guests often prefer a scheduled group. Either way, you still get licensed local guiding from an Arusha base.</p>

<h2 id="before-you-fly">Checklist Before You Fly</h2>
<ol>
  <li>Confirm passport validity and entry/visa steps (official sources + our visa overview)</li>
  <li>Complete travel-clinic advice and insurance</li>
  <li>Share flight arrival times so airport pickup is timed correctly</li>
  <li>Pack soft bags and keep essential meds in hand luggage</li>
  <li>Save Our Team’s WhatsApp for day-of questions</li>
</ol>
<p>When you are ready, <a href="/booking">request a free quote</a> or message us — we will shape a first itinerary that feels achievable, not rushed.</p>

<h2 id="faq-first-safari">First Safari FAQs</h2>
<div class="seo-faq-list">
  ${FAQS.map((f, i) => `
    <details class="seo-faq-item" ${i === 0 ? 'open' : ''}>
      <summary>${f.q}</summary>
      <div class="seo-faq-a">${f.a}</div>
    </details>`).join('')}
</div>

<div class="guide-cta-box">
  <h2>Ready for Your First Tanzania Safari?</h2>
  <p>John Raphael Shayo &amp; team · Arusha · WhatsApp +255 695 108 009</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px">Book / Free Quote</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/group-safaris" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Group Departures</a>
  </div>
</div>
`;
  }

  global.FirstTanzaniaSafariGuide = {
    TEAM,
    META,
    FAQS,
    contentHtml,
    AUTHOR: { ...TEAM, name: META.author_name, displayName: 'Our Team' }
  };
})(window);
