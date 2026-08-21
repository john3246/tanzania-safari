/**
 * Great Wildebeest Migration — Serengeti-focused blog pillar
 * Brand: Tanzania Safari Magic (Arusha)
 * Planning facts synthesized from public migration knowledge; original copy & CTAs for this site.
 */
(function (global) {
  const TEAM = {
    name: 'Our Team',
    role: 'Safari Specialists · Arusha',
    bio: 'Tanzania Safari Magic’s Arusha team designs private Serengeti migration safaris — calving, Grumeti, and Mara River crossings — with transparent quotes.',
    image: '/images/logo.png',
    whatsapp: 'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27d%20like%20a%20Great%20Migration%20safari%20quote.'
  };

  const META = {
    slug: 'great-wildebeest-migration',
    title: 'Great Wildebeest Migration Safari Guide | Serengeti Tanzania',
    meta_title: 'Great Wildebeest Migration Guide 2026 | Serengeti Safari from Arusha',
    meta_description: 'Plan a Serengeti Great Wildebeest Migration safari: best months, calving, Grumeti & Mara River crossings, costs, and private itineraries from Tanzania Safari Magic in Arusha.',
    excerpt: 'Everything you need to witness the Great Migration in Serengeti — month-by-month herd map, river crossings, calving season, costs, and how to book with a local Arusha operator.',
    featured_image_url: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    published_at: '2026-07-28T10:00:00.000Z',
    updated_at: '2026-07-29T00:00:00.000Z',
    category_name: 'Safari Guides',
    author_name: 'John Raphael Shayo',
    post_tags: ['great wildebeest migration', 'serengeti migration', 'mara river crossing', 'ndutu calving', 'tanzania safari'],
    keywords: 'great wildebeest migration, serengeti migration safari, mara river crossing tanzania, wildebeest calving ndutu, grumeti crossing, best time serengeti migration'
  };

  const IMG = {
    hero: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    plains: '/images/optimized/serengeti-national-park.webp',
    plains2: '/images/optimized/serengeti5.webp',
    zebra: '/images/optimized/zebra%20serengeti.webp',
    balloon: '/images/optimized/balloon.webp',
    local: '/images/destinations/serengeti-national-park/serengeti.webp',
    wikiHerd: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Wildebeest_Migration_Masai_Mara.jpg/1280px-Wildebeest_Migration_Masai_Mara.jpg',
    wikiCrossing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Wildebeests_crossing_the_Mara_River.jpg/1280px-Wildebeests_crossing_the_Mara_River.jpg'
  };

  const FAQS = [
    {
      q: 'When is the best time to see the Great Migration in Serengeti?',
      a: 'July–October for Mara River crossings in northern Serengeti; January–March for calving in the south / Ndutu; May–June for Grumeti crossings in the Western Corridor. Rainfall can shift timing by weeks.'
    },
    {
      q: 'Is Tanzania or Kenya better for the migration?',
      a: 'Tanzania hosts herds for most of the year and exclusive events like Ndutu calving and Grumeti crossings. Mara crossings can be viewed from northern Serengeti or Kenya’s Maasai Mara — Serengeti often feels less vehicle-dense and pairs naturally with Ngorongoro.'
    },
    {
      q: 'How much does a migration safari cost?',
      a: 'Private mid-range northern safaris often land in the mid-hundreds of USD per person per day all-in; northern camps in peak crossing season cost more. Get a dated quote from our Arusha team for exact inclusions.'
    },
    {
      q: 'How many days should I book?',
      a: 'Plan at least 3–5 nights in Serengeti for migration focus (often inside a 6–8 day circuit). Crossing seasons benefit from extra buffer nights in the right region.'
    }
  ];

  function contentHtml() {
    return `
<p class="guide-lead">If you’re planning a <a href="/blog/tanzania-safari">Tanzania safari</a>, there’s a good chance you hope to witness one of the world’s last great wildlife migrations — the circular trek of more than <strong>1.5 million wildebeest</strong> (plus zebra and gazelle) across the <a href="/destinations/serengeti-national-park">Serengeti</a>–Maasai Mara ecosystem.</p>
<p>This guide from <strong>Tanzania Safari Magic</strong> in Arusha focuses on the <strong>Serengeti chapters</strong> of the Great Migration: where the herds move month by month, when to book for calving or river crossings, and how to build a private itinerary that actually puts you in the right place.</p>

<figure class="guide-figure">
  <img src="${IMG.hero}" alt="Great Wildebeest Migration Mara River crossing Northern Serengeti" width="1200" height="750" loading="eager" onerror="this.src='${IMG.wikiCrossing}'">
  <figcaption>Mara River crossings in northern Serengeti — typically mid-July to October — are the migration’s most dramatic spectacle.</figcaption>
</figure>

<div class="guide-cta-box" id="quote-migration">
  <h2>Plan Your Migration Safari</h2>
  <p>Tell <strong>Our Team</strong> your dates and whether you want calving, Grumeti, or Mara crossings — we match camps and vehicles within 24 hours.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px"><i class="fas fa-calendar-check"></i> Free Migration Quote</a>
    <a class="btn btn-outline" href="${TEAM.whatsapp}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/destinations/serengeti-national-park" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Serengeti Guide</a>
  </div>
</div>

<nav class="guide-toc" id="migration-toc" aria-label="Migration guide contents">
  <h2>In This Migration Guide</h2>
  <ol>
    <li><a href="#quick-facts">Quick Facts</a></li>
    <li><a href="#best-time">Best Time to See the Migration</a></li>
    <li><a href="#location">Where the Migration Happens</a></li>
    <li><a href="#highlights">Serengeti Highlights</a></li>
    <li><a href="#month-by-month">Month-by-Month Map</a></li>
    <li><a href="#tanzania-vs-kenya">Tanzania vs Kenya</a></li>
    <li><a href="#ecosystem">Why the Migration Matters</a></li>
    <li><a href="#how-to-book">How to Book</a></li>
    <li><a href="#cost">Migration Safari Costs</a></li>
    <li><a href="#packages-migration">Live Safari Packages</a></li>
    <li><a href="#faq-migration">FAQs</a></li>
  </ol>
</nav>

<h2 id="quick-facts">Wildebeest Migration Quick Facts</h2>
<ul>
  <li><strong>Herd size:</strong> ~1.5 million wildebeest, hundreds of thousands of zebra &amp; gazelle</li>
  <li><strong>Distance:</strong> roughly 800 miles / 1,000 km each year</li>
  <li><strong>Driver:</strong> seasonal rainfall and fresh grazing</li>
  <li><strong>Calving peak:</strong> ~8,000 calves per day in peak southern weeks (Jan–early Mar)</li>
  <li><strong>Signature moments:</strong> Ndutu calving, Grumeti crossings, Mara River crossings</li>
  <li><strong>Serengeti role:</strong> home stage for most of the annual loop; UNESCO World Heritage (1981)</li>
</ul>

<figure class="guide-figure">
  <img src="${IMG.plains}" alt="Serengeti plains wildebeest migration Tanzania" width="1200" height="750" loading="lazy" onerror="this.src='${IMG.local}'">
  <figcaption>Serengeti’s short-grass plains — stage for calving and vast herd panoramas.</figcaption>
</figure>

<h2 id="best-time">When Is the Best Time to See the Great Migration?</h2>
<p>The migration is a <strong>year-round</strong> phenomenon, but the “wow” moments need the right region and month. Patterns are fairly consistent — yet rains can push herds early or late. Book the <em>experience</em> you want, then stay flexible on exact camp nights.</p>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Experience</th><th>Typical months</th><th>Where in Serengeti</th></tr></thead>
    <tbody>
      <tr><td>Calving season</td><td>Jan–Mar</td><td>Southern plains / Ndutu</td></tr>
      <tr><td>Grumeti River crossings</td><td>May–Jun</td><td>Western Corridor</td></tr>
      <tr><td>Mara River crossings</td><td>Jul–Oct</td><td>Northern Serengeti</td></tr>
      <tr><td>Vast dry-season herds</td><td>Jun–Oct</td><td>Follow herds + central predators</td></tr>
    </tbody>
  </table>
</div>
<p>Many travellers call July–September the classic Tanzania window: dry roads, clear game viewing, and northern crossing odds. January–February is equally special if newborns and big-cat hunts are your priority.</p>

<figure class="guide-figure">
  <img src="${IMG.wikiHerd}" alt="Wildebeest herd migration East Africa" width="1200" height="750" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${IMG.plains2}'">
  <figcaption>Massed herds on the move — the migration’s defining visual.</figcaption>
</figure>

<h2 id="location">Where Does the Wildebeest Migration Happen?</h2>
<p>The loop runs clockwise through <strong>northern Tanzania</strong> and <strong>southern Kenya</strong>, always chasing rain. Inside Tanzania the main stage is <a href="/destinations/serengeti-national-park">Serengeti National Park</a> (~14,763 km²), contiguous with Ngorongoro’s short-grass calving grounds and bordered to the north by Kenya’s Maasai Mara.</p>
<p>Wildebeest detect distant rainfall and learn approximate routes in their first year — which is why the path shifts slightly each season even though the overall circle endures.</p>

<h2 id="highlights">Serengeti Migration Highlights</h2>
<h3>1. Calving on the Ndutu &amp; southern plains</h3>
<p>Nutrient-rich volcanic soils (linked to the ancient Ngorongoro eruptions) feed mineral-rich grass. Mothers produce rich milk; calves stand within minutes. Predators concentrate on the nursery — intense for photographers.</p>
<h3>2. Grumeti River crossings</h3>
<p>Western Corridor crossings (often May–June) bring crocodile drama with fewer vehicles than the Mara peak. A smart pick for guests who want action without peak-season northern rates.</p>
<h3>3. Mara River crossings</h3>
<p>The iconic leap: strong currents, Nile crocodiles, and tens of thousands of animals choosing when to cross. From the Tanzania side you base in northern Serengeti camps near the river — book early for July–October.</p>

<figure class="guide-figure">
  <img src="${IMG.zebra}" alt="Zebra on Serengeti migration plains Tanzania" width="1200" height="750" loading="lazy">
  <figcaption>Zebra travel with the wildebeest — striping the plains beside the herds.</figcaption>
</figure>

<h2 id="month-by-month">Month-by-Month Serengeti Migration Map</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Month</th><th>Where herds typically are</th><th>What you’ll notice</th></tr></thead>
    <tbody>
      <tr><td>Dec–Mar</td><td>South / Ndutu short-grass plains</td><td>Calving peak Jan–Feb; predator theatre</td></tr>
      <tr><td>Apr–May</td><td>Moving west &amp; through central routes</td><td>Long rains; lush landscapes</td></tr>
      <tr><td>May–Jun</td><td>Western Corridor / Grumeti</td><td>River crossings begin</td></tr>
      <tr><td>Jul–Oct</td><td>Northern Serengeti (↔ Mara)</td><td>Mara River crossings; dry-season clarity</td></tr>
      <tr><td>Nov</td><td>Pushing south again</td><td>Short rains; herds return toward Ndutu</td></tr>
    </tbody>
  </table>
</div>
<p>Central <strong>Seronera</strong> remains excellent for lions, leopards, and cheetahs even when mega-herds are elsewhere — a reliable backbone for any Serengeti safari.</p>

<h2 id="tanzania-vs-kenya">Is Tanzania or Kenya Better for the Great Migration?</h2>
<p>Both work. Tanzania usually has the edge for a full migration story:</p>
<ul>
  <li>Herds spend most of the year in Tanzania</li>
  <li>Calving and Grumeti crossings are Tanzania-only chapters</li>
  <li>Northern Serengeti Mara crossings often feel less congested than the Mara Reserve peak</li>
  <li>Easy combination with <a href="/destinations/ngorongoro-conservation-area">Ngorongoro Crater</a> on the same circuit from Arusha</li>
</ul>
<p>Kenya wins on shorter road access from Nairobi and a compact reserve. If your trip already centers on northern Tanzania parks, Serengeti is the natural migration base.</p>

<h2 id="ecosystem">The Migration’s Role in the Serengeti Ecosystem</h2>
<p>Wildebeest are the Serengeti’s gardeners — grazing, trampling, and fertilizing on a massive scale, reducing fuel for catastrophic fires and feeding an extraordinary predator community (lions, hyenas, cheetahs, crocodiles, and more). Tourism revenue funds anti-poaching and habitat protection that keep the route open for future generations.</p>

<figure class="guide-figure">
  <img src="${IMG.balloon}" alt="Balloon safari over Serengeti migration landscape" width="1200" height="750" loading="lazy">
  <figcaption>Balloon safaris add a sunrise perspective over plains that may hold migrating herds.</figcaption>
</figure>

<h2 id="how-to-book">How to Book a Wildebeest Migration Safari</h2>
<ol>
  <li><strong>Choose your highlight</strong> — calving, Grumeti, or Mara crossings</li>
  <li><strong>Lock the right region</strong> — south, west, or north Serengeti camps</li>
  <li><strong>Add buffer nights</strong> — herds don’t keep calendars</li>
  <li><strong>Decide drive-in vs fly-in</strong> — north is far by road; flights save time</li>
  <li><strong>Combine parks</strong> — Ngorongoro + Serengeti remains the classic pairing</li>
</ol>
<p>Share your dates on our <a href="/booking">booking form</a> or WhatsApp — we reply with lodge options and a clear inclusions list.</p>

<h2 id="cost">How Much Does a Migration Safari Cost?</h2>
<p>Expect private mid-range northern circuit rates often around the mid-hundreds of USD per person per day; luxury camps and peak northern crossing weeks cost more. Park fees, concession fees, and balloon flights are itemized on quotes. Full ranges: <a href="/blog/tanzania-safari-cost">Tanzania safari cost 2026</a>.</p>

<div id="packages-migration" class="guide-packages-anchor"></div>

<h2 id="faq-migration">Migration Safari FAQs</h2>
<div class="seo-faq-list">
  ${FAQS.map((f, i) => `
    <details class="seo-faq-item" ${i === 0 ? 'open' : ''}>
      <summary>${f.q}</summary>
      <div class="seo-faq-a">${f.a}</div>
    </details>`).join('')}
</div>

<div class="guide-cta-box">
  <h2>Ready for the Serengeti Migration?</h2>
  <p>Licensed local operator · Our Team · Arusha, Tanzania</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px">Book / Free Quote</a>
    <a class="btn btn-outline" href="/blog/serengeti-national-park" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Serengeti Guide</a>
    <a class="btn btn-outline" href="/blog/best-time-to-visit-tanzania" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Best Time</a>
    <a class="btn btn-outline" href="/safaris" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">All Packages</a>
  </div>
</div>
`;
  }

  global.GreatWildebeestMigrationGuide = { META, FAQS, TEAM, contentHtml };
})(window);
