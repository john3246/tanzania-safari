/**
 * Tanzania Visa Guide — Tanzania Safari Magic (original copy)
 * Author: John Raphael Shayo · Arusha
 * Educational overview only — always verify official government sources.
 */
(function (global) {
  const TEAM = {
    name: 'Our Team',
    role: 'Safari Specialists · Arusha',
    bio: 'Tanzania Safari Magic helps guests plan safari logistics from Arusha. Visa and health entry rules must be confirmed on official government channels.',
    image: '/images/logo.png',
    whatsapp: 'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20need%20help%20with%20trip%20logistics%20around%20my%20Tanzania%20visa%20and%20safari%20dates.'
  };

  const META = {
    slug: 'tanzania-visa-guide',
    title: 'Tanzania Visa Guide: What Safari Travellers Should Know',
    meta_title: 'Tanzania Visa Guide 2026 | eVisa, Arrival Basics & Safari Logistics',
    meta_description: 'Tanzania visa overview for safari travellers: eVisa and visa-on-arrival concepts, yellow fever notes, and how Tanzania Safari Magic helps with trip logistics from Arusha.',
    excerpt: 'A practical visa overview for Tanzania safari guests — eVisa and arrival concepts, careful health notes, and who to contact for trip logistics. Always verify official sources.',
    featured_image_url: '/images/optimized/balloon.webp',
    published_at: '2026-08-03T10:00:00.000Z',
    updated_at: '2026-08-06T10:00:00.000Z',
    category_name: 'Travel Tips',
    author_name: 'John Raphael Shayo',
    post_tags: ['tanzania visa', 'evisa tanzania', 'visa on arrival', 'safari planning', 'yellow fever', 'travel tips'],
    keywords: 'tanzania visa guide, tanzania evisa, visa on arrival tanzania, safari visa tanzania, yellow fever tanzania entry, arusha safari logistics'
  };

  const FAQS = [
    {
      q: 'Do I need a visa for Tanzania?',
      a: 'Most leisure visitors need a visa or other authorised entry permission, but rules vary by nationality. Check the official Tanzania immigration / eVisa portals for your passport before you book non-refundable flights.'
    },
    {
      q: 'Should I apply for an eVisa or get a visa on arrival?',
      a: 'Both concepts exist for many travellers, but availability and processing change. Many guests prefer applying online ahead of time to reduce airport uncertainty. Confirm the current options for your nationality on official sites only.'
    },
    {
      q: 'Does Tanzania Safari Magic issue visas?',
      a: 'No. We are a safari operator. We help with itineraries, lodges, park fees, and transfers. Visa applications remain your responsibility through official channels.'
    },
    {
      q: 'What about yellow fever certificates?',
      a: 'Yellow fever documentation may be requested depending on your travel history and routing. This is a health-entry topic — ask a travel clinic and verify official requirements; do not rely on blogs alone.'
    }
  ];

  function contentHtml() {
    return `
<p class="guide-lead"><strong>Visa rules change.</strong> This page is a planning overview for safari travellers booking with Tanzania Safari Magic — not legal advice and not a substitute for official immigration websites. Always confirm requirements for <em>your</em> passport before you fly.</p>
<p>I’m <strong>John Raphael Shayo</strong> in Arusha. Our Team designs the safari; you (or your embassy guidance) handle entry paperwork. When logistics around flights and pickup feel confusing, <a href="/contact">contact us</a> and we will coordinate the ground side.</p>

<figure class="guide-figure">
  <img src="/images/optimized/balloon.webp" alt="Tanzania safari travel planning visa logistics" width="1200" height="750" loading="eager">
  <figcaption>Lock visa research early so your safari dates and park bookings stay stress-free.</figcaption>
</figure>

<div class="guide-cta-box" id="quote-visa">
  <h2>Need Help with Safari Logistics?</h2>
  <p>We do not process visas — we do arrange itineraries, airport pickup, and park bookings once your dates are clear.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px"><i class="fas fa-calendar-check"></i> Book Safari Dates</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/contact" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Contact</a>
  </div>
</div>

<nav class="guide-toc" id="visa-toc" aria-label="Tanzania visa guide contents">
  <h2>In This Guide</h2>
  <ol>
    <li><a href="#overview">Visa Overview for Safari Guests</a></li>
    <li><a href="#evisa">eVisa Concept</a></li>
    <li><a href="#arrival">Visa on Arrival Concept</a></li>
    <li><a href="#yellow-fever">Yellow Fever — Careful Notes</a></li>
    <li><a href="#logistics">How Our Team Helps with Logistics</a></li>
    <li><a href="#faq-visa">FAQs</a></li>
  </ol>
</nav>

<h2 id="overview">Visa Overview for Safari Guests</h2>
<p>Most visitors coming for wildlife tourism need formal entry permission. Categories, fees, and processing times depend on nationality and can be updated without much public notice.</p>
<ul>
  <li>Start with your government’s travel advice page <em>and</em> Tanzania’s official immigration / eVisa sites</li>
  <li>Allow buffer time before departure — do not leave applications to the airport week if you can avoid it</li>
  <li>Keep passport validity well beyond your return date (many travellers aim for 6+ months)</li>
  <li>Match the name on tickets, lodge lists, and visa documents exactly</li>
</ul>
<p>Once entry is sorted, focus on trip design — our <a href="/blog/first-tanzania-safari">first Tanzania safari guide</a> covers packing and game-drive expectations.</p>

<figure class="guide-figure">
  <img src="/images/optimized/serengeti-national-park.webp" alt="Serengeti safari after Tanzania entry formalities" width="1200" height="750" loading="lazy">
  <figcaption>After arrival formalities, northern-circuit parks like the Serengeti become the focus.</figcaption>
</figure>

<h2 id="evisa">eVisa Concept</h2>
<p>An <strong>eVisa</strong> generally means you apply online through an official portal, receive approval digitally, and present it with your passport on arrival. Exact steps, photo specs, and payment methods belong on the government site — not on a tour operator blog.</p>
<p>Why many safari guests prefer applying early:</p>
<ul>
  <li>Less uncertainty after a long-haul flight</li>
  <li>Time to fix document errors before travel day</li>
  <li>Clearer planning for connecting flights into Kilimanjaro (JRO) or Dar es Salaam</li>
</ul>
<p>If a website asks for unusual fees or looks unofficial, stop and re-check the government domain.</p>

<h2 id="arrival">Visa on Arrival Concept</h2>
<p><strong>Visa on arrival</strong> (where available for your nationality) means you complete formalities at the port of entry. Queues, payment methods, and eligibility change — which is why we never promise a specific process in a quote.</p>
<p>Practical tips guests find useful:</p>
<ul>
  <li>Carry passport photos and a card that works for official payments if required</li>
  <li>Keep printed and digital copies of hotel / safari confirmations</li>
  <li>Allow extra time if you land late and still need a road transfer to Arusha</li>
</ul>

<div class="guide-cta-box compact">
  <p style="margin:0">Visa sorted? Send us flight times and we will lock pickup and safari briefing.</p>
  <a class="btn btn-primary" href="/booking" style="min-height:48px">Share Dates &amp; Book</a>
</div>

<h2 id="yellow-fever">Yellow Fever — Careful Notes</h2>
<p>Yellow fever vaccination and certificate rules are <strong>health-entry requirements</strong>, not safari “nice to haves.” Whether you need proof can depend on countries you have recently visited or transited.</p>
<ul>
  <li>Discuss vaccination with a qualified travel clinic — we do not give medical advice</li>
  <li>Verify current certificate requirements on official health / immigration guidance</li>
  <li>Carry the certificate in your hand luggage if one applies to you</li>
</ul>
<p>When in doubt, ask a clinic and cross-check government sources. Blogs (including this one) can lag behind policy updates.</p>

<figure class="guide-figure">
  <img src="/images/optimized/mbugani.webp" alt="Arusha safari briefing after arrival Tanzania" width="1200" height="750" loading="lazy">
  <figcaption>Our Team focuses on ground logistics once you clear arrival formalities.</figcaption>
</figure>

<h2 id="logistics">How Our Team Helps with Logistics</h2>
<p>Tanzania Safari Magic handles what a local operator should:</p>
<ol>
  <li>Safari itinerary, lodges, and park fee planning</li>
  <li>Airport or hotel pickup around your confirmed flights</li>
  <li>Briefings in Arusha before the circuit starts</li>
  <li>Day-of WhatsApp support for delays or changes</li>
</ol>
<p>We do <strong>not</strong> fill visa forms or stamp passports. For trip questions beyond paperwork, use <a href="/contact">contact</a>, <a href="/booking">booking</a>, or WhatsApp Our Team. New to safari life? Read <a href="/blog/first-tanzania-safari">preparing for your first Tanzania safari</a>.</p>

<h2 id="faq-visa">Visa FAQs</h2>
<div class="seo-faq-list">
  ${FAQS.map((f, i) => `
    <details class="seo-faq-item" ${i === 0 ? 'open' : ''}>
      <summary>${f.q}</summary>
      <div class="seo-faq-a">${f.a}</div>
    </details>`).join('')}
</div>

<div class="guide-cta-box">
  <h2>Plan the Safari — Confirm the Visa Officially</h2>
  <p>John Raphael Shayo &amp; team · Arusha · WhatsApp +255 695 108 009</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px">Book / Free Quote</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/contact" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Contact</a>
  </div>
</div>
`;
  }

  global.TanzaniaVisaGuide = {
    TEAM,
    META,
    FAQS,
    contentHtml,
    AUTHOR: { ...TEAM, name: META.author_name, displayName: 'Our Team' }
  };
})(window);
