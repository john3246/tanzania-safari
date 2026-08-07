/**
 * Kilimanjaro Routes Data — original branded content for Tanzania Safari Magic (Arusha)
 * Powers the /kilimanjaro/routes hub and individual route detail views.
 *
 * All copy here is original Tanzania Safari Magic content. Topics (Machame, Marangu,
 * Lemosho, Rongai, Northern Circuit, Umbwe) are shared industry knowledge, but the
 * wording, framing, and "how we run it from Arusha" notes are our own.
 */
(function (global) {
  'use strict';

  const IMG = (n) => `/images/kilimanjaro/kilimanjaro%20(${n}).jpeg`;

  const WA = 'https://wa.me/255695108009';
  const WA_ROUTE = (route) =>
    `${WA}?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%27d%20like%20a%20quote%20for%20the%20${encodeURIComponent(route)}.`;

  // Shared closing CTA block (kept identical in structure across routes for a consistent UI).
  const cta = (route, whatsappRoute) => `
<div class="guide-cta-box">
  <h2>Plan Your ${route} from Arusha</h2>
  <p>Tell us your dates and hiking background — Tanzania Safari Magic replies with a clear ${route} plan: crew, permits, transfers, and honest day counts. No pressure, no copied itineraries.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
    <a class="btn btn-outline" href="${whatsappRoute}" target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/kilimanjaro/routes" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Compare All Routes</a>
  </div>
</div>`;

  const fig = (src, alt, caption, eager) => `
<figure class="guide-figure">
  <img src="${src}" alt="${alt}" width="1200" height="750" loading="${eager ? 'eager' : 'lazy'}">
  <figcaption>${caption}</figcaption>
</figure>`;

  const ROUTES = [
    /* ---------------------------------------------------------------- MACHAME */
    {
      slug: 'machame-route',
      name: 'Machame Route',
      days: '6–7 days',
      difficulty: 'Challenging',
      success: 'High with 7 days',
      scenery: 'Excellent',
      accommodation: 'Camping',
      summary:
        'The scenic camping classic — rainforest, ridgelines, and the famous Barranco Wall. Best climbed over 7 days for a stronger summit chance.',
      meta_title: 'Machame Route Kilimanjaro | 6–7 Day Camping Climb | Tanzania Safari Magic',
      meta_description:
        'Climb the Machame Route on Kilimanjaro with Tanzania Safari Magic in Arusha. 6–7 day camping itinerary, day-by-day overview, difficulty, pros and cons, and free quotes.',
      keywords:
        'machame route, machame route kilimanjaro, 7 day machame, kilimanjaro camping route, barranco wall, whiskey route kilimanjaro',
      image: IMG(1),
      highlights: [
        'Iconic rainforest-to-glacier scenery',
        'Barranco Wall scramble',
        '"Climb high, sleep low" acclimatisation profile',
        'Best as a 7-day itinerary'
      ],
      bestFor: 'Fit hikers who want the classic Kilimanjaro photo story and are happy camping.',
      html: `
<p class="guide-lead"><strong>The Machame Route</strong> is Kilimanjaro's best-loved camping trail — nicknamed the "Whiskey Route" for its bolder character. It rises through dripping rainforest, crosses the Shira Plateau, and threads the dramatic Barranco Wall before the summit push to Uhuru Peak. Tanzania Safari Magic runs it from Arusha with our own guides and crew.</p>

${fig(IMG(1), 'Machame Route Kilimanjaro camping trail scenery', 'Machame trades hut comfort for camping under the biggest landscapes on the mountain.', true)}

<h2 id="machame-overview">Overview</h2>
<p>Machame approaches from the mountain's south-west and is prized for variety: you walk through five climate zones in a handful of days, from moss-hung forest to the lunar high desert below the summit. Because the trail dips and climbs — camping low at Barranco after touching higher altitudes earlier — it follows a natural "climb high, sleep low" rhythm that helps your body adjust. That is why we quietly steer most guests toward the <strong>7-day version</strong> rather than the compressed 6-day plan; the extra night meaningfully improves summit odds. For how altitude actually feels, read our <a href="/blog/climbing-kilimanjaro-difficulty">Kilimanjaro difficulty guide</a>.</p>

<h2 id="machame-who">Who It's For</h2>
<p>Machame suits reasonably fit hikers who can manage several consecutive days on their feet and don't mind sleeping in tents. It rewards climbers who want the "postcard" Kilimanjaro — the Barranco Wall scramble, Lava Tower, and glacier views — over the quieter, longer circuits. If you've done multi-day treks before and want the classic experience, this is usually our first suggestion. If you strongly prefer beds, look at the <a href="/kilimanjaro/routes">Marangu hut route</a> instead.</p>

<h2 id="machame-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Day 1</strong> — Machame Gate through rainforest to Machame Camp.</li>
  <li><strong>Day 2</strong> — Climb onto the moorland to Shira Camp on the plateau.</li>
  <li><strong>Day 3</strong> — Up to Lava Tower for acclimatisation, then descend to sleep at Barranco.</li>
  <li><strong>Day 4</strong> — Scramble the Barranco Wall to Karanga Camp (a rest-day insertion on the 7-day plan).</li>
  <li><strong>Day 5</strong> — Short push to Barafu, the summit base camp.</li>
  <li><strong>Day 6</strong> — Midnight start to Uhuru Peak, then a long descent to Mweka.</li>
  <li><strong>Day 7</strong> — Down through forest to Mweka Gate and back to Arusha.</li>
</ul>
<p>This is a planning outline, not your final itinerary — your confirmed schedule comes with your quote. Compare it against other trails on our <a href="/blog/kilimanjaro-routes-guide">Kilimanjaro routes guide</a>.</p>

${fig(IMG(7), 'Barranco Wall scramble on the Machame Route Kilimanjaro', 'The Barranco Wall looks intimidating but is a hands-on scramble, not technical climbing.')}

<h2 id="machame-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Outstanding, varied scenery</td><td>Popular — busier camps in peak season</td></tr>
      <tr><td>Good acclimatisation profile on 7 days</td><td>Steeper, more physical than Marangu</td></tr>
      <tr><td>Barranco Wall highlight</td><td>Camping only (no huts)</td></tr>
    </tbody>
  </table>
</div>

<div class="guide-cta-box compact">
  <p style="margin:0">Want the 7-day Machame for the best summit chance?</p>
  <a class="btn btn-primary" href="/booking" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="machame-arusha">How We Run It from Arusha</h2>
<p>Your climb is coordinated end-to-end by Tanzania Safari Magic. We collect you in Arusha, brief you the evening before, and handle Kilimanjaro National Park permits, mountain crew, and meals — see park context on our <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a> page. Guides carry pulse oximeters and check you twice daily. Many climbers pair Machame with a safari or a warm-up trek; ask us about our <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">6-Day Mount Meru, Tarangire &amp; Ngorongoro</a> package as pre-climb acclimatisation. When you're ready, plan the whole trip on <a href="/kilimanjaro">Kilimanjaro</a> and lock dates via <a href="/booking">booking</a>.</p>

${cta('Machame Route', WA_ROUTE('Machame Route'))}
`
    },

    /* ---------------------------------------------------------------- MARANGU */
    {
      slug: 'marangu-route',
      name: 'Marangu Route',
      days: '5–6 days',
      difficulty: 'Moderate to Challenging',
      success: 'Moderate (better on 6 days)',
      scenery: 'Good',
      accommodation: 'Mountain huts',
      summary:
        'The only hut route — dormitory sleeping and a gentler gradient. Comfortable, but the shorter schedule can rush acclimatisation.',
      meta_title: 'Marangu Route Kilimanjaro | Hut Climb, 5–6 Days | Tanzania Safari Magic',
      meta_description:
        'The Marangu "Coca-Cola" Route on Kilimanjaro — the only hut trail. 5–6 day itinerary, day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic in Arusha.',
      keywords:
        'marangu route, marangu route kilimanjaro, coca cola route, kilimanjaro hut route, 6 day marangu, easiest kilimanjaro route',
      image: IMG(2),
      highlights: [
        'Only route with sleeping huts',
        'Gentler, steadier gradient',
        'Same trail up and down',
        'Add a day for acclimatisation'
      ],
      bestFor: 'Travellers who prefer beds over tents, and hikers climbing in the wetter months.',
      html: `
<p class="guide-lead"><strong>The Marangu Route</strong> — often called the "Coca-Cola Route" — is the only trail on Kilimanjaro with permanent sleeping huts. Its steadier gradient and dormitory bunks make it the comfort choice, but the nickname can be misleading: altitude still rules, and the short schedule is the real challenge. Tanzania Safari Magic runs Marangu from Arusha with a strong nudge toward the extra acclimatisation day.</p>

${fig(IMG(2), 'Marangu Route Kilimanjaro hut trail', 'Marangu is the only Kilimanjaro route with A-frame sleeping huts instead of tents.', true)}

<h2 id="marangu-overview">Overview</h2>
<p>Marangu approaches from the south-east and is unique in two ways: you sleep in shared huts (with mattresses, dining halls, and even bottled drinks at some camps), and you descend by the same path you climbed. The gradient is gentler than Machame or Umbwe, which is why beginners are drawn to it. The catch is acclimatisation: the standard <strong>5-day</strong> plan gives your body very little time to adjust, so summit-night success rates are lower. We almost always recommend the <strong>6-day</strong> version with an extra night at Horombo. If you're weighing comfort against odds, our <a href="/blog/climbing-kilimanjaro-difficulty">difficulty guide</a> explains why more nights matter.</p>

<h2 id="marangu-who">Who It's For</h2>
<p>Marangu suits travellers who genuinely dislike camping, families who want the reassurance of huts, and anyone climbing in the wetter shoulder seasons when a solid roof is welcome. It's also popular with climbers on tighter budgets, since huts can simplify logistics. It is <em>not</em> the route for you if you want the biggest scenery or quiet camps — the shared same-way-down trail means you'll see plenty of other groups. For a scenic camping alternative, compare it with the <a href="/kilimanjaro/routes">Machame and Lemosho routes</a>.</p>

<h2 id="marangu-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Day 1</strong> — Marangu Gate through rainforest to Mandara Hut.</li>
  <li><strong>Day 2</strong> — Cross moorland to Horombo Hut with views of Mawenzi.</li>
  <li><strong>Day 3</strong> — Acclimatisation day around Horombo (this is the day we add on the 6-day plan).</li>
  <li><strong>Day 4</strong> — Across the "saddle" high desert to Kibo Hut.</li>
  <li><strong>Day 5</strong> — Midnight summit push to Uhuru Peak, then descend to Horombo.</li>
  <li><strong>Day 6</strong> — Final descent to Marangu Gate and transfer to Arusha.</li>
</ul>
<p>On the 5-day plan, the Horombo rest day is dropped — which is exactly why we discourage it when your calendar allows the extra night. See how it stacks up in our <a href="/blog/kilimanjaro-routes-guide">routes guide</a>.</p>

<h2 id="marangu-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Hut sleeping — no tents</td><td>Lower success rate on the short 5-day plan</td></tr>
      <tr><td>Gentler, steadier gradient</td><td>Less scenic variety; same trail down</td></tr>
      <tr><td>Good in wetter months</td><td>Busy, communal huts reduce privacy</td></tr>
    </tbody>
  </table>
</div>

${fig(IMG(8), 'Kilimanjaro summit sunrise near Uhuru Peak', 'Every route shares the same reward: sunrise from the roof of Africa at Uhuru Peak.')}

<h2 id="marangu-arusha">How We Run It from Arusha</h2>
<p>Tanzania Safari Magic collects you in Arusha, runs a full pre-climb briefing and kit check, and arranges permits, hut bookings, and mountain crew. Our guides monitor oxygen saturation and pace you deliberately slowly on summit night — the single biggest factor in reaching the top. Read park background on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, budget with our <a href="/blog/kilimanjaro-cost">Kilimanjaro cost guide</a>, and start planning on <a href="/kilimanjaro">Kilimanjaro</a>. Ready to hold a date? Head to <a href="/booking">booking</a>.</p>

${cta('Marangu Route', WA_ROUTE('Marangu Route'))}
`
    },

    /* ---------------------------------------------------------------- LEMOSHO */
    {
      slug: 'lemosho-route',
      name: 'Lemosho Route',
      days: '7–8 days',
      difficulty: 'Challenging',
      success: 'Very high',
      scenery: 'Superb',
      accommodation: 'Camping',
      summary:
        'A scenic western approach with quieter early days and excellent acclimatisation. Our top all-round recommendation when time allows.',
      meta_title: 'Lemosho Route Kilimanjaro | 7–8 Day Scenic Climb | Tanzania Safari Magic',
      meta_description:
        'Climb the Lemosho Route on Kilimanjaro — a scenic 7–8 day western approach with high success rates. Day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
      keywords:
        'lemosho route, lemosho route kilimanjaro, 8 day lemosho, best kilimanjaro route, scenic kilimanjaro route, shira plateau',
      image: IMG(3),
      highlights: [
        'Remote, quiet western start',
        'Crosses the Shira Plateau',
        'Excellent acclimatisation profile',
        'Highest success rates'
      ],
      bestFor: 'Climbers who can spare an extra day and want the best mix of scenery and summit odds.',
      html: `
<p class="guide-lead"><strong>The Lemosho Route</strong> is, for many climbers, the sweet spot on Kilimanjaro: a quiet, scenic western approach with enough days to acclimatise properly. It starts deep in the forest on the far side of the mountain, crosses the wide Shira Plateau, and then joins the Machame trail for the summit push. When guests ask us for our honest favourite, this is usually it.</p>

${fig(IMG(3), 'Lemosho Route Kilimanjaro Shira Plateau scenery', 'Lemosho opens with remote forest and the sweeping Shira Plateau before the summit stages.', true)}

<h2 id="lemosho-overview">Overview</h2>
<p>Lemosho's biggest advantages are time and space. The early days are genuinely quiet — you're often alone with your crew before merging with busier routes higher up — and the <strong>7 or 8-day</strong> length builds in extra acclimatisation nights. That combination pushes success rates to the top of the range. Like Machame, it follows a "climb high, sleep low" pattern over Lava Tower and Barranco. The trade-off is cost and calendar: more days means more park-fee nights, which we break down in our <a href="/blog/kilimanjaro-cost">Kilimanjaro cost guide</a>.</p>

<h2 id="lemosho-who">Who It's For</h2>
<p>Lemosho is ideal for climbers who can commit the extra day and want the strongest realistic shot at the summit without going to full Northern Circuit length. It suits first-time high-altitude trekkers who've trained well, photographers chasing varied light, and anyone who values quieter early camps. If your leave is tight and you can only manage six days, Machame may fit better; if you want even more acclimatisation, look at the <a href="/kilimanjaro/routes">Northern Circuit</a>.</p>

<h2 id="lemosho-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Day 1</strong> — Londorossi Gate and forest trek to Mti Mkubwa (Big Tree) Camp.</li>
  <li><strong>Day 2</strong> — Climb onto the moorland to Shira 1 Camp.</li>
  <li><strong>Day 3</strong> — Cross the Shira Plateau to Shira 2 Camp.</li>
  <li><strong>Day 4</strong> — Up to Lava Tower, then descend to sleep at Barranco.</li>
  <li><strong>Day 5</strong> — Barranco Wall scramble to Karanga Camp.</li>
  <li><strong>Day 6</strong> — Short climb to Barafu summit base camp.</li>
  <li><strong>Day 7</strong> — Midnight push to Uhuru Peak, then descend toward Mweka.</li>
  <li><strong>Day 8</strong> — Final forest descent to Mweka Gate and return to Arusha.</li>
</ul>
<p>The 7-day version trims one plateau night. Your exact plan is confirmed on your quote — see the full comparison in our <a href="/blog/kilimanjaro-routes-guide">routes guide</a>.</p>

${fig(IMG(9), 'Kilimanjaro glaciers and high desert on the Lemosho Route', 'Above the plateau, Lemosho enters glacier country and the high-alpine desert.')}

<h2 id="lemosho-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Highest success rates</td><td>More expensive (extra fee-nights)</td></tr>
      <tr><td>Quiet, scenic early days</td><td>Longer time commitment</td></tr>
      <tr><td>Excellent acclimatisation</td><td>Camping only</td></tr>
    </tbody>
  </table>
</div>

<div class="guide-cta-box compact">
  <p style="margin:0">Torn between Lemosho and Machame? We'll match one to your dates.</p>
  <a class="btn btn-primary" href="/booking" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="lemosho-arusha">How We Run It from Arusha</h2>
<p>The Londorossi trailhead is a longer drive, so Tanzania Safari Magic builds the transfer into your Lemosho package from Arusha and handles permits, camping crew, and meals throughout. We time your departure around the <a href="/blog/best-time-to-climb-kilimanjaro">best climbing months</a> and can combine the climb with a wildlife extension — browse our <a href="/safaris">safari packages</a> or read park detail on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>. Start on <a href="/kilimanjaro">Kilimanjaro</a> and request your plan via <a href="/booking">booking</a>.</p>

${cta('Lemosho Route', WA_ROUTE('Lemosho Route'))}
`
    },

    /* ---------------------------------------------------------------- RONGAI */
    {
      slug: 'rongai-route',
      name: 'Rongai Route',
      days: '6–7 days',
      difficulty: 'Moderate to Challenging',
      success: 'High with 7 days',
      scenery: 'Good (wilderness feel)',
      accommodation: 'Camping',
      summary:
        'The quiet northern approach from near the Kenyan border — drier terrain and a genuine wilderness feel, ideal in the rainy season.',
      meta_title: 'Rongai Route Kilimanjaro | Northern Approach, 6–7 Days | Tanzania Safari Magic',
      meta_description:
        'The Rongai Route climbs Kilimanjaro from the quiet northern side near Kenya. 6–7 day itinerary, day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
      keywords:
        'rongai route, rongai route kilimanjaro, northern kilimanjaro route, dry season kilimanjaro route, quiet kilimanjaro route, mawenzi tarn',
      image: IMG(4),
      highlights: [
        'Only route from the north',
        'Drier, rain-shadow terrain',
        'Quietest of the standard trails',
        'Wilderness and remote feel'
      ],
      bestFor: 'Climbers wanting solitude, and anyone climbing in the wetter months who wants drier trails.',
      html: `
<p class="guide-lead"><strong>The Rongai Route</strong> is the only trail that climbs Kilimanjaro from the north, starting near the Kenyan border and approaching Kibo across remote, gently rising country. It's the quietest of the standard routes and sits in a partial rain-shadow, which makes it a smart pick when the southern trails are wet. Tanzania Safari Magic runs Rongai from Arusha with the northern transfer built in.</p>

${fig(IMG(4), 'Rongai Route Kilimanjaro northern wilderness approach', 'Rongai crosses remote northern moorland with a genuine wilderness feel and few crowds.', true)}

<h2 id="rongai-overview">Overview</h2>
<p>Rongai's character is different from the busy south-western routes. The terrain is drier and more open, the crowds are thin, and there's a real sense of remoteness on the early days. Many itineraries include a detour to <strong>Mawenzi Tarn</strong>, a striking camp beneath Kilimanjaro's jagged second peak, which also adds a valuable acclimatisation night. The route joins the Marangu descent path near the top. As with every trail here, the <strong>7-day</strong> version climbs noticeably better than the compressed 6-day plan — our <a href="/blog/climbing-kilimanjaro-difficulty">difficulty guide</a> explains why.</p>

<h2 id="rongai-who">Who It's For</h2>
<p>Rongai is for climbers who value solitude and a wilderness feel over dramatic ridge scenery, and for anyone travelling in the wetter shoulder months who wants the driest realistic option. It's a good moderate-gradient choice for steady hikers. It's less ideal if you're chasing the most photogenic terrain — the southern approaches on <a href="/kilimanjaro/routes">Machame and Lemosho</a> win there — or if you want the shortest possible trip.</p>

<h2 id="rongai-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Day 1</strong> — Nalemuru trailhead in the north to Simba Camp.</li>
  <li><strong>Day 2</strong> — Climb to Kikelelwa Camp across open moorland.</li>
  <li><strong>Day 3</strong> — Short, steep leg to scenic Mawenzi Tarn (acclimatisation day option).</li>
  <li><strong>Day 4</strong> — Cross the high-desert saddle to Kibo Hut.</li>
  <li><strong>Day 5</strong> — Midnight summit push to Uhuru Peak, then descend to Horombo.</li>
  <li><strong>Day 6</strong> — Descend the Marangu path to the gate and transfer to Arusha.</li>
</ul>
<p>The 7-day plan adds a full acclimatisation day around Mawenzi Tarn. See how Rongai compares with the other trails in our <a href="/blog/kilimanjaro-routes-guide">routes guide</a>.</p>

${fig(IMG(10), 'Mawenzi peak seen from the Rongai Route Kilimanjaro', 'The jagged Mawenzi peak dominates the skyline on Rongai — a highlight camping spot.')}

<h2 id="rongai-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Quietest standard route</td><td>Less varied scenery than the south</td></tr>
      <tr><td>Drier rain-shadow terrain</td><td>Longer drive to the trailhead</td></tr>
      <tr><td>Good rainy-season option</td><td>Best done over 7 days for acclimatisation</td></tr>
    </tbody>
  </table>
</div>

<h2 id="rongai-arusha">How We Run It from Arusha</h2>
<p>The Nalemuru trailhead sits well to the north, so Tanzania Safari Magic includes the longer transfer from Arusha and manages permits, camping crew, and meals for the full climb. We often recommend Rongai for green-season departures — check timing in our <a href="/blog/best-time-to-climb-kilimanjaro">best time to climb guide</a> — and can bolt on a warm-up trek such as our <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">6-Day Mount Meru, Tarangire &amp; Ngorongoro</a> package. Read park background on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, then start on <a href="/kilimanjaro">Kilimanjaro</a> and book via <a href="/booking">booking</a>.</p>

${cta('Rongai Route', WA_ROUTE('Rongai Route'))}
`
    },

    /* --------------------------------------------------- NORTHERN CIRCUIT */
    {
      slug: 'northern-circuit-route',
      name: 'Northern Circuit Route',
      days: '8–9 days',
      difficulty: 'Challenging (long)',
      success: 'Highest of all routes',
      scenery: 'Superb, panoramic',
      accommodation: 'Camping',
      summary:
        'The longest trail on the mountain — a near-360° loop with the most acclimatisation days and the highest summit success rate.',
      meta_title: 'Northern Circuit Kilimanjaro | 8–9 Day Route | Tanzania Safari Magic',
      meta_description:
        'The Northern Circuit is Kilimanjaro\u2019s longest, quietest route with the highest success rate. 8–9 day day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
      keywords:
        'northern circuit route, northern circuit kilimanjaro, 9 day kilimanjaro, highest success rate kilimanjaro route, longest kilimanjaro route',
      image: IMG(5),
      highlights: [
        'Longest route — most acclimatisation',
        'Near 360° loop of the mountain',
        'Highest summit success rate',
        'Very quiet northern slopes'
      ],
      bestFor: 'Climbers who can invest the time and want the best possible summit odds and solitude.',
      html: `
<p class="guide-lead"><strong>The Northern Circuit</strong> is the newest and longest trail on Kilimanjaro — a sweeping loop that circles almost the entire mountain before the summit. All those extra days translate into the best acclimatisation and the <strong>highest success rate of any route</strong>. If reaching Uhuru Peak matters more to you than saving time, this is the one. Tanzania Safari Magic runs it from Arusha for climbers who want to give the mountain its due.</p>

${fig(IMG(5), 'Northern Circuit Route Kilimanjaro panoramic loop', 'The Northern Circuit loops the quiet northern slopes for panoramic, ever-changing views.', true)}

<h2 id="northern-overview">Overview</h2>
<p>The Northern Circuit shares Lemosho's scenic western start, then instead of pushing straight up it swings around the rarely visited northern slopes — country most climbers never see. Spread over <strong>8 to 9 days</strong>, it maximises "climb high, sleep low" opportunities and gives your body the most time to adjust of any Kilimanjaro trail. The result is both the best summit odds and remarkable solitude on the northern legs. The trade-off is straightforward: it's the biggest commitment in time and cost, which we detail in our <a href="/blog/kilimanjaro-cost">Kilimanjaro cost guide</a>.</p>

<h2 id="northern-who">Who It's For</h2>
<p>This route suits climbers who can free up nine or so days and want to stack the odds firmly in their favour — including those who've struggled with altitude before, or who simply want the calmest, most gradual ascent. It's also perfect for anyone who loves remote trekking and quiet camps. If your schedule is tight, Lemosho or Machame deliver much of the scenery in fewer days; compare them on our <a href="/kilimanjaro/routes">routes hub</a>.</p>

<h2 id="northern-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Days 1–3</strong> — Lemosho forest start across the Shira Plateau (Mti Mkubwa, Shira 1, Shira 2).</li>
  <li><strong>Day 4</strong> — Up to Lava Tower, then descend to Moir Hut on the quiet north side.</li>
  <li><strong>Days 5–6</strong> — Loop the northern slopes (Buffalo Camp, Third Cave) with wide panoramas.</li>
  <li><strong>Day 7</strong> — Traverse to School Hut / Kibo below the summit.</li>
  <li><strong>Day 8</strong> — Midnight push to Uhuru Peak, then long descent to Millennium Camp.</li>
  <li><strong>Day 9</strong> — Final descent to Mweka Gate and transfer to Arusha.</li>
</ul>
<p>Your confirmed schedule may shift camps slightly with conditions. See the full picture in our <a href="/blog/kilimanjaro-routes-guide">routes guide</a>.</p>

${fig(IMG(6), 'Kilimanjaro high camp at dusk on the Northern Circuit', 'Extra nights high on the Northern Circuit are the reason its summit success rate leads the mountain.')}

<h2 id="northern-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Highest success rate on the mountain</td><td>Most days — highest cost</td></tr>
      <tr><td>Very quiet northern slopes</td><td>Requires a longer holiday</td></tr>
      <tr><td>Best acclimatisation and views</td><td>Camping only</td></tr>
    </tbody>
  </table>
</div>

<div class="guide-cta-box compact">
  <p style="margin:0">Want the best possible summit odds? Ask us about the 9-day Northern Circuit.</p>
  <a class="btn btn-primary" href="/booking" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="northern-arusha">How We Run It from Arusha</h2>
<p>Tanzania Safari Magic organises the full Northern Circuit from Arusha — Londorossi permits, an experienced camping crew for the longer haul, and careful daily health checks that matter more the longer you're at altitude. Because you're already investing serious time, many guests extend the trip with a northern-Tanzania safari; ask about our <a href="/safaris/9-day-mount-meru-northern-tanzania-safari">9-Day Mount Meru &amp; Northern Tanzania Safari</a> or browse all <a href="/safaris">safari packages</a>. Read park detail on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, start on <a href="/kilimanjaro">Kilimanjaro</a>, and confirm dates via <a href="/booking">booking</a>.</p>

${cta('Northern Circuit', WA_ROUTE('Northern Circuit Route'))}
`
    },

    /* ---------------------------------------------------------------- UMBWE */
    {
      slug: 'umbwe-route',
      name: 'Umbwe Route',
      days: '6–7 days',
      difficulty: 'Very challenging',
      success: 'Lower (steep, fast ascent)',
      scenery: 'Dramatic',
      accommodation: 'Camping',
      summary:
        'The steepest, most direct trail — dramatic and quiet, but demanding. Best reserved for experienced, well-acclimatised climbers.',
      meta_title: 'Umbwe Route Kilimanjaro | Steep Direct Climb, 6–7 Days | Tanzania Safari Magic',
      meta_description:
        'The Umbwe Route is Kilimanjaro\u2019s steepest, most direct and challenging trail. 6–7 day day-by-day overview, who it suits, pros and cons, and free quotes from Tanzania Safari Magic.',
      keywords:
        'umbwe route, umbwe route kilimanjaro, hardest kilimanjaro route, steep kilimanjaro route, direct kilimanjaro route, experienced climbers',
      image: IMG(6),
      highlights: [
        'Steepest, most direct ascent',
        'Very quiet and dramatic',
        'Fast altitude gain — demanding',
        'For experienced trekkers only'
      ],
      bestFor: 'Experienced, well-conditioned climbers who have trekked at altitude before.',
      html: `
<p class="guide-lead"><strong>The Umbwe Route</strong> is Kilimanjaro's steepest and most direct trail — short in distance, big in effort, and beautifully quiet. It rewards strong, experienced climbers with dramatic scenery and few crowds, but its fast altitude gain leaves little margin for acclimatisation. Tanzania Safari Magic only recommends Umbwe to climbers we're confident are ready for it.</p>

${fig(IMG(6), 'Umbwe Route Kilimanjaro steep forest ridge', 'Umbwe climbs steep forest ridges directly toward Barranco — dramatic, demanding, and quiet.', true)}

<h2 id="umbwe-overview">Overview</h2>
<p>Umbwe shares the southern side with Machame but takes a far more aggressive line, gaining height quickly through steep forest and along exposed ridges before reaching Barranco. There's no gentle warm-up: you're high fast. That makes acclimatisation the central risk, and it's why success rates run lower than on the longer routes. We build in the maximum sensible days — usually a <strong>7-day</strong> plan that links into the Southern Circuit for an extra acclimatisation night — but even then, Umbwe demands real mountain fitness. If in doubt, our <a href="/blog/climbing-kilimanjaro-difficulty">difficulty guide</a> is honest about what this involves.</p>

<h2 id="umbwe-who">Who It's For</h2>
<p>Umbwe is for experienced, well-conditioned hikers who have spent time at altitude and want a quiet, steep, adventurous line. It is <strong>not</strong> a first Kilimanjaro route and not for anyone unsure about steep, exposed terrain. If you love the idea of a challenge but haven't climbed high before, we'll steer you to <a href="/kilimanjaro/routes">Lemosho or Machame</a> first — you'll enjoy the mountain far more with better acclimatisation behind you.</p>

<h2 id="umbwe-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Day 1</strong> — Umbwe Gate steeply up forest ridges to Umbwe Camp.</li>
  <li><strong>Day 2</strong> — Continue the steep climb to Barranco Camp.</li>
  <li><strong>Day 3</strong> — Acclimatisation via the Southern Circuit (Lava Tower area) back to Karanga.</li>
  <li><strong>Day 4</strong> — Short climb to Barafu summit base camp.</li>
  <li><strong>Day 5</strong> — Midnight summit push to Uhuru Peak, then descend to Mweka.</li>
  <li><strong>Day 6</strong> — Descend through forest to Mweka Gate and transfer to Arusha.</li>
</ul>
<p>We adjust the acclimatisation loop to your condition. Compare Umbwe with gentler options in our <a href="/blog/kilimanjaro-routes-guide">routes guide</a>.</p>

${fig(IMG(1), 'Kilimanjaro dramatic ridge scenery on the southern side', 'Umbwe\u2019s reward is dramatic southern-side scenery with almost none of the crowds.')}

<h2 id="umbwe-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Steep, direct and adventurous</td><td>Lower success rate (fast altitude gain)</td></tr>
      <tr><td>Very quiet and dramatic</td><td>For experienced climbers only</td></tr>
      <tr><td>Shares scenic southern high camps</td><td>Camping only; physically demanding</td></tr>
    </tbody>
  </table>
</div>

<h2 id="umbwe-arusha">How We Run It from Arusha</h2>
<p>Because Umbwe is demanding, Tanzania Safari Magic runs an extra-careful pre-climb assessment and briefing in Arusha, then supports you with an experienced camping crew and vigilant twice-daily health checks — pacing and acclimatisation are everything here. We'll happily suggest a warm-up such as our <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">6-Day Mount Meru, Tarangire &amp; Ngorongoro</a> package to prime your body first. Read park context on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, check kit with our <a href="/blog/kilimanjaro-packing-list">Kilimanjaro packing list</a>, start on <a href="/kilimanjaro">Kilimanjaro</a>, and book via <a href="/booking">booking</a>.</p>

${cta('Umbwe Route', WA_ROUTE('Umbwe Route'))}
`
    }
  ];

  /* --------------------------------------------------------------- HUB META */
  const hubMeta = {
    title: 'Kilimanjaro Routes',
    meta_title: 'Kilimanjaro Routes Compared 2026 | Machame, Lemosho, Marangu, Rongai & More',
    meta_description:
      'Compare all six Kilimanjaro climbing routes — Machame, Marangu, Lemosho, Rongai, Northern Circuit and Umbwe. Days, difficulty, success rates and honest advice from Tanzania Safari Magic in Arusha.',
    keywords:
      'kilimanjaro routes, kilimanjaro climbing routes, machame route, lemosho route, marangu route, rongai route, northern circuit, umbwe route, best kilimanjaro route',
    leadHtml: `
<p class="guide-lead"><strong>Every Kilimanjaro route ends at Uhuru Peak</strong> — but the trail you choose shapes your days, your scenery, your comfort, and your summit odds. Tanzania Safari Magic runs all six standard routes from Arusha, and this page compares them honestly so you can pick the right one.</p>
<p>There's no single "best" route — only the best route <em>for you</em>. It comes down to how many days you can give the mountain, whether you prefer tents or huts, how much you value quiet camps, and how your body handles altitude. As a rule of thumb, more days means better acclimatisation and higher success. For the deeper comparison, read our <a href="/blog/kilimanjaro-routes-guide">Kilimanjaro routes guide</a>; for honest expectations, our <a href="/blog/climbing-kilimanjaro-difficulty">difficulty guide</a>; and to plan timing, our <a href="/blog/best-time-to-climb-kilimanjaro">best time to climb guide</a>.</p>

<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Route</th><th>Typical days</th><th>Sleeping</th><th>In one line</th></tr></thead>
    <tbody>
      <tr><td>Machame</td><td>6–7</td><td>Camping</td><td>Scenic camping classic</td></tr>
      <tr><td>Marangu</td><td>5–6</td><td>Huts</td><td>The only hut route</td></tr>
      <tr><td>Lemosho</td><td>7–8</td><td>Camping</td><td>Scenic, high success — our favourite</td></tr>
      <tr><td>Rongai</td><td>6–7</td><td>Camping</td><td>Quiet northern approach</td></tr>
      <tr><td>Northern Circuit</td><td>8–9</td><td>Camping</td><td>Longest, highest success</td></tr>
      <tr><td>Umbwe</td><td>6–7</td><td>Camping</td><td>Steepest — experts only</td></tr>
    </tbody>
  </table>
</div>

<p>Whichever you choose, we handle permits, crew, meals, and transfers — see park background on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, budget with our <a href="/blog/kilimanjaro-cost">cost guide</a>, and start planning on <a href="/kilimanjaro">Kilimanjaro</a>.</p>

<div class="guide-cta-box">
  <h2>Not Sure Which Route Fits?</h2>
  <p>Tell Tanzania Safari Magic your dates and hiking background — we'll recommend the route that gives you the best experience and the best chance of standing on the roof of Africa.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
    <a class="btn btn-outline" href="${WA}?text=Hi%20Tanzania%20Safari%20Magic%2C%20please%20help%20me%20choose%20a%20Kilimanjaro%20route." target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/safaris" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Add a Safari</a>
  </div>
</div>`
  };

  global.TSM_KiliRoutes = { ROUTES: ROUTES, IMG: IMG, hubMeta: hubMeta };
})(window);
