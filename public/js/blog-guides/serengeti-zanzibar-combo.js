(function (global) {
  const TEAM = {
    name: 'Our Team',
    role: 'Safari Specialists · Arusha',
    bio: 'We build bush-to-beach itineraries: Serengeti and Ngorongoro, then a scheduled flight to Zanzibar.',
    image: '/images/logo.png',
    whatsapp: 'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%20want%20a%20Serengeti%20and%20Zanzibar%20combo%20safari.'
  };
  const META = {
    slug: 'serengeti-zanzibar-combo',
    title: 'Serengeti and Zanzibar Combo Safari: How to Plan It',
    meta_title: 'Serengeti and Zanzibar Combo Safari | Bush to Beach',
    meta_description: 'Serengeti and Zanzibar combo safari: typical 8–12 day bush-to-beach itineraries, flights, costs, and how to book from Arusha.',
    excerpt: 'Plan a Serengeti safari plus Zanzibar beaches in one trip — pacing, flights, and a free combo quote.',
    featured_image_url: '/images/zanzibar/zanzibar%20(1).webp',
    published_at: '2026-08-21T10:00:00.000Z',
    updated_at: '2026-08-21T10:00:00.000Z',
    category_name: 'Itineraries',
    author_name: 'John Raphael Shayo',
    post_tags: ['serengeti zanzibar combo', 'bush to beach tanzania', 'safari and zanzibar'],
    keywords: 'serengeti and zanzibar combo safari, bush to beach tanzania, safari then zanzibar, serengeti zanzibar package'
  };
  function contentHtml() {
    return `
<p class="guide-lead"><strong>A Serengeti and Zanzibar combo safari is usually 8–12 days:</strong> a northern-circuit safari from Arusha (Tarangire, Ngorongoro, Serengeti), then a short scheduled flight to Zanzibar for white-sand recovery. Five to seven safari nights plus three to five beach nights is the pacing most couples choose.</p>
<p>Tanzania Safari Magic books both legs as one itinerary so transfers and lodge dates line up. Start with a <a href="/booking?interest=Serengeti%20Zanzibar%20combo">free combo quote</a> or browse <a href="/zanzibar">Zanzibar extensions</a> and <a href="/safaris">safari packages</a>.</p>
<figure class="guide-figure">
  <img src="/images/zanzibar/zanzibar%20(1).webp" alt="Zanzibar beach after a Serengeti safari, Tanzania bush-to-beach holiday" width="1200" height="750" loading="eager">
  <figcaption>Bush-to-beach: Serengeti game drives, then Zanzibar’s east or north coast.</figcaption>
</figure>
<div class="guide-cta-box">
  <h2>Price a safari + Zanzibar trip</h2>
  <p>No payment required to inquire — free custom quote within 24 hours.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking?interest=Serengeti%20Zanzibar%20combo" style="min-height:48px">Free Combo Quote</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/zanzibar" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Zanzibar stays</a>
  </div>
</div>
<h2>Sample 10-day combo</h2>
<ol>
  <li>Arrive JRO, overnight Arusha.</li>
  <li>Tarangire game drive.</li>
  <li>Ngorongoro Crater.</li>
  <li>Drive or fly into the Serengeti (3 nights).</li>
  <li>Flight Serengeti or Arusha → Zanzibar (3–4 nights).</li>
  <li>Depart from Zanzibar (ZNZ) or return via JRO.</li>
</ol>
<p>Migration travellers should place Serengeti nights using our <a href="/blog/mara-river-crossing-best-time">Mara River timing guide</a>. Cost context: <a href="/blog/8-day-tanzania-safari-cost">8-day safari cost</a> plus Zanzibar hotels (widely $80–$400+ per room depending on beach and season).</p>
<h2>Flights and logistics</h2>
<p>We typically use scheduled safari flights (e.g. Seronera or Kogatende to Zanzibar in season) rather than driving back to Arusha and flying commercial the long way. Luggage limits on bush flights are strict — we brief you before you pack.</p>
<div class="seo-faq-list">
  <details class="seo-faq-item" open><summary>How many days for a Serengeti and Zanzibar combo?</summary><div class="seo-faq-a">Plan 8–12 days total. Fewer than 5 safari nights feels rushed; fewer than 3 beach nights barely unpacks the suitcase.</div></details>
  <details class="seo-faq-item"><summary>Can I fly from the Serengeti straight to Zanzibar?</summary><div class="seo-faq-a">Often yes, on scheduled safari flights in season. We confirm the routing on your quote.</div></details>
  <details class="seo-faq-item"><summary>Do I book safari and beach separately?</summary><div class="seo-faq-a">You can, but one operator keeps dates and flights aligned. We quote both legs together.</div></details>
</div>
<div class="guide-cta-box">
  <h2>Talk to Our Team</h2>
  <p>WhatsApp +255 695 108 009 · Arusha</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking?interest=Serengeti%20Zanzibar%20combo" style="min-height:48px">Request Free Quote</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
  </div>
</div>`;
  }
  const FAQS = [
    { q: 'How many days for a Serengeti and Zanzibar combo safari?', a: 'Plan 8–12 days: typically 5–7 safari nights from Arusha plus 3–5 nights in Zanzibar.' },
    { q: 'Can I fly from the Serengeti straight to Zanzibar?', a: 'Often yes on scheduled safari flights in season. Tanzania Safari Magic confirms the routing on your quote.' },
    { q: 'Do I book the safari and beach separately?', a: 'You can, but one operator keeps lodge dates and flights aligned. We quote both legs together with no payment required to inquire.' }
  ];
  global.SerengetiZanzibarComboGuide = { TEAM, META, FAQS, contentHtml, AUTHOR: { ...TEAM, name: META.author_name, displayName: 'Our Team' } };
})(window);
