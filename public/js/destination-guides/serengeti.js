/**
 * Serengeti National Park — destination pillar guide
 * Brand: Tanzania Safari Magic (Arusha)
 * Key facts synthesized from public Serengeti / Great Migration knowledge;
 * CTAs and links point to tanzaniasafarimagic.com
 */
(function (global) {
  const SLUGS = ['serengeti-national-park', 'serengeti', 'serengeti-park'];

  const META = {
    title: 'Serengeti National Park Safari Guide | Great Migration | Tanzania Safari Magic',
    h1: 'Serengeti National Park Safari Guide',
    meta_description: 'Plan a Serengeti safari with Tanzania Safari Magic in Arusha. UNESCO plains, Great Wildebeest Migration, Big Cats, best time by region, costs, and private packages. Free quote +255 695 108 009.',
    keywords: 'serengeti national park, serengeti safari, great wildebeest migration, mara river crossing, seronera, ndutu calving, safari from arusha',
    image: '/images/optimized/serengeti-national-park.webp',
    canonicalPath: '/destinations/serengeti-national-park'
  };

  const FAQS = [
    {
      q: 'Where is Serengeti National Park?',
      a: 'Serengeti National Park sits in northern Tanzania, northwest of Ngorongoro. It covers roughly 14,763 km² of plains, woodland, and rivers, and borders Kenya’s Maasai Mara to the north.'
    },
    {
      q: 'Is Serengeti a UNESCO World Heritage Site?',
      a: 'Yes. Serengeti was inscribed as a UNESCO World Heritage Site in 1981 for its outstanding savannah landscapes and the Great Migration of wildebeest, zebra, and gazelle.'
    },
    {
      q: 'When is the best time to visit Serengeti for the Great Migration?',
      a: 'It depends what you want: calving (Jan–Mar) in southern Serengeti / Ndutu; Grumeti crossings (May–Jun) in the Western Corridor; Mara River crossings (Jul–Oct) in northern Serengeti. Central Seronera is strong for predators year-round.'
    },
    {
      q: 'How many days do I need in the Serengeti?',
      a: 'Most first-time guests stay 3–5 nights in Serengeti (often as part of a 6–8 day northern circuit with Ngorongoro). Migration-focused trips may add nights in the north or south to match the herds.'
    },
    {
      q: 'Can I combine Serengeti with Ngorongoro?',
      a: 'Yes — and we recommend it. Serengeti delivers scale and migration drama; Ngorongoro delivers dense crater wildlife including strong black-rhino odds. Ask us for a private combined itinerary from Arusha.'
    }
  ];

  const IMG = {
    plains: '/images/optimized/serengeti-national-park.webp',
    plains2: '/images/optimized/serengeti5.webp',
    zebra: '/images/optimized/zebra%20serengeti.webp',
    river: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    balloon: '/images/optimized/balloon.webp',
    chui: '/images/optimized/serengeti%20chui.webp',
    local1: '/images/destinations/serengeti-national-park/serengeti.jpg',
    local2: '/images/destinations/serengeti-national-park/serengeti2.jpeg',
    wikiHerd: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Wildebeest_Migration_Masai_Mara.jpg/1280px-Wildebeest_Migration_Masai_Mara.jpg',
    wikiPlains: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Serengeti_Landscape.jpg/1280px-Serengeti_Landscape.jpg'
  };

  function matchesSlug(slug) {
    if (!slug) return false;
    const s = String(slug).toLowerCase();
    return SLUGS.some((x) => s === x || s.includes('serengeti'));
  }

  function contentHtml() {
    return `
<div class="dest-guide">
  <p class="guide-lead"><strong>Serengeti National Park</strong> is the beating heart of Africa’s Great Migration — endless golden plains, legendary predators, and one of the last intact large-mammal migrations on Earth.</p>
  <p>Proclaimed a national park in the early 1950s and inscribed by UNESCO in 1981, Serengeti covers about <strong>14,763 km²</strong> of savannah. From Arusha, Tanzania Safari Magic designs private Serengeti safaris timed to calving, river crossings, or classic year-round game drives in Seronera — often combined with <a href="/destinations/ngorongoro-conservation-area">Ngorongoro Crater</a>.</p>

  <div class="guide-cta-box" id="book-serengeti">
    <h2>Book Your Serengeti Safari</h2>
    <p>Private 4x4 · Migration timing advice · Based in Arusha · WhatsApp +255 695 108 009</p>
    <div class="guide-cta-actions">
      <a class="btn btn-primary" href="/booking" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
      <a class="btn btn-outline" href="https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%27m%20interested%20in%20a%20Serengeti%20safari." target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
      <a class="btn btn-outline" href="/blog/great-wildebeest-migration" style="min-height:48px">Migration Guide</a>
    </div>
  </div>

  <nav class="guide-toc" id="serengeti-toc" aria-label="Serengeti guide contents">
    <h2>In This Serengeti Guide</h2>
    <ol>
      <li><a href="#overview">About Serengeti National Park</a></li>
      <li><a href="#regions">Park Regions</a></li>
      <li><a href="#migration">Great Wildebeest Migration</a></li>
      <li><a href="#wildlife">Wildlife &amp; Big Cats</a></li>
      <li><a href="#best-time">Best Time to Visit</a></li>
      <li><a href="#month-map">Month-by-Month Herd Map</a></li>
      <li><a href="#activities">Top Activities</a></li>
      <li><a href="#vs-ngoro">Serengeti vs Ngorongoro</a></li>
      <li><a href="#costs">Safari Costs &amp; Fees</a></li>
      <li><a href="#how-long">How Many Days You Need</a></li>
      <li><a href="#getting-there">Getting There from Arusha</a></li>
      <li><a href="#packages-serengeti">Our Serengeti Packages</a></li>
      <li><a href="#faq-serengeti">FAQs</a></li>
    </ol>
  </nav>

  <figure class="guide-figure">
    <img src="${IMG.plains}" alt="Serengeti National Park plains Tanzania safari" width="1200" height="750" loading="eager" onerror="this.src='${IMG.local1}'">
    <figcaption>Endless Serengeti plains — home of the Great Migration and year-round predator action.</figcaption>
  </figure>

  <h2 id="overview">About Serengeti National Park</h2>
  <p>The Maasai word <em>siringet</em> — often translated as “endless plains” — still fits. Serengeti is the core of a wider ecosystem that also includes Ngorongoro, Maswa, Grumeti / Ikorongo reserves, Loliondo, and Kenya’s Maasai Mara. Together they protect the circular trek of more than a million wildebeest plus hundreds of thousands of zebra and gazelle.</p>
  <p><strong>Quick facts visitors ask us most:</strong></p>
  <ul>
    <li><strong>Size:</strong> ~14,763 km² (about 5,700 sq mi)</li>
    <li><strong>Status:</strong> UNESCO World Heritage Site (1981)</li>
    <li><strong>Established as national park:</strong> early 1950s (park roots from the 1940s)</li>
    <li><strong>Famous for:</strong> Great Migration, lions, cheetahs, leopards, balloon safaris</li>
    <li><strong>Nearby:</strong> <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, Olduvai Gorge, Lake Victoria approaches to the west</li>
  </ul>

  <figure class="guide-figure">
    <img src="${IMG.wikiPlains}" alt="Serengeti landscape savannah Tanzania" width="1200" height="750" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${IMG.plains2}'">
    <figcaption>Classic Serengeti savannah — treeless grasslands dotted with kopjes and acacia woodland.</figcaption>
  </figure>

  <h2 id="regions">Serengeti Regions Explained</h2>
  <p>Where you sleep matters as much as when you travel. We match camps to the season and your priorities:</p>
  <div class="dest-table-wrap">
    <table class="dest-table">
      <thead><tr><th>Region</th><th>Character</th><th>Best for</th></tr></thead>
      <tbody>
        <tr><td><strong>Southern plains / Ndutu</strong></td><td>Short-grass plains, nutrient-rich soils</td><td>Calving season (Jan–Mar), predator action on newborns</td></tr>
        <tr><td><strong>Central (Seronera)</strong></td><td>Rivers, kopjes, varied habitats</td><td>Year-round game drives, big cats, first-time visitors</td></tr>
        <tr><td><strong>Western Corridor</strong></td><td>Grumeti River, woodland</td><td>May–Jun river crossings, quieter camps</td></tr>
        <tr><td><strong>Northern Serengeti</strong></td><td>Rolling hills to the Mara River</td><td>Jul–Oct Mara crossings, dramatic migration photos</td></tr>
      </tbody>
    </table>
  </div>
  <p>Guest reviews often praise Serengeti’s diversity — from vast herds to leopard and cheetah sightings in a single circuit. That variety is why multi-night stays outperform rushed day dashes.</p>

  <h2 id="migration">The Great Wildebeest Migration in Serengeti</h2>
  <p>Roughly <strong>1.5 million wildebeest</strong> — with zebra and gazelle in tow — follow rains on an ~800-mile (≈1,000 km) loop. About <strong>80%</strong> of the world’s wildebeest live in the Serengeti–Ngorongoro ecosystem. Highlights inside Tanzania include:</p>
  <ul>
    <li><strong>Calving on the Ndutu / southern plains</strong> — thousands of calves born daily in peak weeks (Jan–early Mar)</li>
    <li><strong>Grumeti River crossings</strong> — Western Corridor, typically May–June</li>
    <li><strong>Mara River crossings</strong> — Northern Serengeti, typically mid-July to October</li>
  </ul>
  <p>Rainfall always has the final say — herds can run early or late. We build flexible itineraries and update lodge zones as the season unfolds. Read the full planning article: <a href="/blog/great-wildebeest-migration">Great Wildebeest Migration safari guide</a>.</p>

  <figure class="guide-figure">
    <img src="${IMG.river}" alt="Northern Serengeti Mara River crossing wildebeest safari" width="1200" height="750" loading="lazy" onerror="this.src='${IMG.wikiHerd}'">
    <figcaption>Northern Serengeti — Mara River crossing season is the migration’s most dramatic chapter.</figcaption>
  </figure>

  <h2 id="wildlife">Wildlife &amp; Big Cats</h2>
  <p>Serengeti is legendary for <strong>lions</strong> (among the densest populations in Africa), plus cheetah on open plains, leopard along riverine woodland, elephant, buffalo, giraffe, hippo, and more than 500 bird species. Rhino are rare here compared with Ngorongoro.</p>
  <div class="dest-table-wrap">
    <table class="dest-table">
      <thead><tr><th>Animal</th><th>Notes</th><th>Often seen</th></tr></thead>
      <tbody>
        <tr><td>Lion</td><td>Excellent year-round odds</td><td>Seronera, kopjes, migration edges</td></tr>
        <tr><td>Cheetah</td><td>Open-plains hunters</td><td>Southern &amp; central grasslands</td></tr>
        <tr><td>Leopard</td><td>Elusive; riverside trees</td><td>Seronera riverine strips</td></tr>
        <tr><td>Elephant</td><td>Growing herds</td><td>Woodland &amp; north</td></tr>
        <tr><td>Wildebeest / zebra</td><td>Migration + resident pockets</td><td>Seasonal by region</td></tr>
      </tbody>
    </table>
  </div>

  <figure class="guide-figure">
    <img src="${IMG.chui}" alt="Big cat safari Serengeti Tanzania" width="1200" height="750" loading="lazy" onerror="this.src='${IMG.zebra}'">
    <figcaption>Big-cat country — Seronera and migration fringes reward patient game drives.</figcaption>
  </figure>

  <h2 id="best-time">Best Time to Visit Serengeti</h2>
  <div class="dest-table-wrap">
    <table class="dest-table">
      <thead><tr><th>Goal</th><th>Best months</th><th>Where to base</th></tr></thead>
      <tbody>
        <tr><td>Calving &amp; predator action</td><td>Jan–Mar</td><td>Southern plains / Ndutu</td></tr>
        <tr><td>Grumeti crossings</td><td>May–Jun</td><td>Western Corridor</td></tr>
        <tr><td>Mara River crossings</td><td>Jul–Oct</td><td>Northern Serengeti</td></tr>
        <tr><td>Classic dry-season plains</td><td>Jun–Oct</td><td>Central + follow herds</td></tr>
        <tr><td>Fewer crowds / greener scenes</td><td>Nov–May (esp. Apr–May)</td><td>Central Seronera still strong</td></tr>
      </tbody>
    </table>
  </div>
  <p>Dry months are easier for road travel; green season brings dramatic skies, birdlife, and often better lodge rates. Not sure which window fits your leave? <a href="/booking">Request a free quote</a>.</p>

  <h2 id="month-map">Month-by-Month Migration Snapshot (Serengeti Focus)</h2>
  <div class="dest-table-wrap">
    <table class="dest-table">
      <thead><tr><th>Months</th><th>Typical herd focus</th></tr></thead>
      <tbody>
        <tr><td>Dec–Mar</td><td>Southern Serengeti &amp; Ndutu — short grass, calving peak Jan–Feb</td></tr>
        <tr><td>Apr–May</td><td>Moving through central / western routes as long rains shift grazing</td></tr>
        <tr><td>May–Jun</td><td>Western Corridor — Grumeti crossings</td></tr>
        <tr><td>Jul–Oct</td><td>Northern Serengeti — Mara River crossings (also Kenya Mara)</td></tr>
        <tr><td>Nov</td><td>Herds push south again toward short-grass plains</td></tr>
      </tbody>
    </table>
  </div>
  <p>Treat this as a planning compass, not a GPS track. We monitor reports before you fly and adjust camp locations when needed.</p>

  <h2 id="activities">Top Activities</h2>
  <ul>
    <li><strong>Game drives</strong> — morning and afternoon in private 4x4s</li>
    <li><strong>Hot-air balloon safari</strong> — sunrise over the plains (seasonal availability)</li>
    <li><strong>Migration viewing</strong> — timed to calving or river crossings</li>
    <li><strong>Photographic safaris</strong> — kopje light, herd panoramas, big cats</li>
    <li><strong>Fly-in safari segments</strong> — save long drives on northern or short-stay trips</li>
  </ul>
  <figure class="guide-figure">
    <img src="${IMG.balloon}" alt="Hot air balloon safari over Serengeti plains" width="1200" height="750" loading="lazy">
    <figcaption>Balloon safari over Serengeti — a bucket-list morning when conditions allow.</figcaption>
  </figure>

  <h2 id="vs-ngoro">Serengeti vs Ngorongoro</h2>
  <div class="dest-table-wrap">
    <table class="dest-table">
      <thead><tr><th>Factor</th><th>Serengeti</th><th>Ngorongoro</th></tr></thead>
      <tbody>
        <tr><td>Landscape</td><td>Vast open plains</td><td>Enclosed volcanic caldera</td></tr>
        <tr><td>Migration</td><td>Main stage year-round path</td><td>Mostly resident wildlife</td></tr>
        <tr><td>Big Five ease</td><td>Excellent but spread out</td><td>Often best single-day odds</td></tr>
        <tr><td>Rhino</td><td>Rare</td><td>Among Tanzania’s best chances</td></tr>
        <tr><td>Space</td><td>Room to disperse</td><td>Can feel busy on the floor</td></tr>
      </tbody>
    </table>
  </div>
  <p>Most guests do <strong>both</strong>. Browse <a href="/safaris">combined safari packages</a> or ask for a custom northern circuit.</p>

  <h2 id="costs">How Much Does a Serengeti Safari Cost?</h2>
  <p>Price depends on season, lodge zone (north commands premiums in crossing season), vehicle type, and fly-in vs drive-in. Park fees are regulated and listed clearly on every quote.</p>
  <ul>
    <li><strong>3–4 day Serengeti focus:</strong> ideal add-on after Ngorongoro</li>
    <li><strong>5–8 day northern circuit:</strong> best overall value for first-timers</li>
    <li><strong>Migration specialty:</strong> extra nights in south or north to match herds</li>
  </ul>
  <p>See our <a href="/blog/tanzania-safari-cost">Tanzania safari cost 2026 guide</a> for budget vs luxury ranges, then request exact numbers for your dates.</p>

  <h2 id="how-long">How Many Days Do You Need?</h2>
  <div class="dest-table-wrap">
    <table class="dest-table">
      <thead><tr><th>Duration</th><th>Best for</th><th>Typical plan</th></tr></thead>
      <tbody>
        <tr><td>2–3 nights</td><td>Short add-on</td><td>Central Seronera highlights</td></tr>
        <tr><td>4–5 nights</td><td>First Serengeti safari</td><td>Central + seasonal zone</td></tr>
        <tr><td>6–8 days circuit</td><td>Classic Tanzania</td><td>Serengeti + Ngorongoro (+ Tarangire)</td></tr>
        <tr><td>10+ days</td><td>Bush to beach</td><td>Circuit + <a href="/destinations/zanzibar">Zanzibar</a></td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="getting-there">How to Get to Serengeti from Arusha</h2>
  <ul>
    <li><strong>By road:</strong> full-day drive via Ngorongoro / Naabi Hill gate (often with crater or picnic stops)</li>
    <li><strong>By air:</strong> scheduled light aircraft to Seronera, Kogatende, and other airstrips — fastest for northern camps</li>
  </ul>
  <p>We handle TANAPA entry logistics, picnic plans, and camp transfers so your focus stays on wildlife.</p>

  <div class="guide-cta-box compact">
    <p style="margin:0">Ready for a private Serengeti plan?</p>
    <a class="btn btn-primary" href="/booking" style="min-height:48px">Request Itinerary</a>
  </div>

  <div id="packages-serengeti" class="guide-packages-anchor"></div>

  <h2 id="faq-serengeti">Serengeti Safari FAQs</h2>
  <div class="seo-faq-list">
    ${FAQS.map((f, i) => `
      <details class="seo-faq-item" ${i === 0 ? 'open' : ''}>
        <summary>${f.q}</summary>
        <div class="seo-faq-a">${f.a}</div>
      </details>`).join('')}
  </div>

  <h2 id="tips">Travel Tips from Our Arusha Team</h2>
  <ul>
    <li>Pack layers — dawn game drives can be cool even in dry season</li>
    <li>Binoculars matter on open plains</li>
    <li>Book northern camps early for July–October crossings</li>
    <li>Allow buffer days; migration timing is rainfall-driven</li>
    <li>Pair with our <a href="/blog/serengeti-national-park">Serengeti National Park guide</a> and <a href="/blog/tanzania-safari">ultimate Tanzania safari guide</a> when building the full trip</li>
  </ul>

  <div class="guide-cta-box">
    <h2>Plan with Tanzania Safari Magic</h2>
    <p>Licensed local operator · Our Team · Arusha, Tanzania</p>
    <div class="guide-cta-actions">
      <a class="btn btn-primary" href="/booking" style="min-height:48px">Book / Free Quote</a>
      <a class="btn btn-outline" href="/contact" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Contact</a>
      <a class="btn btn-outline" href="/blog/great-wildebeest-migration" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Migration Guide</a>
    </div>
  </div>
</div>`;
  }

  global.SerengetiDestinationGuide = { SLUGS, META, FAQS, matchesSlug, contentHtml, IMG };
})(window);
