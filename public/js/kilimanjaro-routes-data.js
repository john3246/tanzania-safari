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

  const IMG = (n) => `/images/kilimanjaro/kilimanjaro%20(${n}).webp`;

  const WA = 'https://wa.me/255695108009';
  const WA_ROUTE = (route) =>
    `${WA}?text=Hi%20Tanzania%20Safari%20Magic%2C%20I%27d%20like%20a%20quote%20for%20the%20${encodeURIComponent(route)}.`;

  // Shared closing CTA block (kept identical in structure across routes for a consistent UI).
  // The booking link is deep-linked with the route slug and a human-readable interest label
  // so the booking form can pre-select the correct climb.
  const cta = (route, whatsappRoute, slug, bookingInterest) => `
<div class="guide-cta-box">
  <h2>Plan Your ${route} from Arusha</h2>
  <p>Tell us your dates and hiking background — Tanzania Safari Magic replies with a clear ${route} plan: crew, permits, transfers, and honest day counts. No pressure, no copied itineraries.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking?route=${slug}&interest=${encodeURIComponent(bookingInterest)}" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
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
      distance: '~62 km / 37 mi',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Busy',
      acclimatization: 'Good',
      summitNight: 'Leave Barafu (4,673 m) around midnight; reach the crater rim at Stella Point, then roughly one more hour along the rim to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Machame Route 7-Day Climb',
      pros: [
        'Outstanding, ever-changing scenery through five climate zones',
        'Natural "climb high, sleep low" profile on the 7-day plan',
        'The Barranco Wall scramble — a genuine trip highlight',
        'Solid summit success when climbed over seven days'
      ],
      cons: [
        'One of the busiest trails, so camps fill up in high season',
        'Steeper and more physical than Marangu',
        'Camping only — no huts or beds on the mountain',
        'The 6-day version rushes acclimatisation and lowers your odds'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Machame Gate to Machame Camp',
          altitude: '1,640 m → 2,835 m',
          hiking: '5–7 hours',
          description:
            'After registration and a kit check at Machame Gate, you set off through dense montane rainforest that drips with moss and birdsong. The trail climbs steadily on a wide, well-worn path, muddy in the wetter months, until the trees begin to thin. You reach Machame Camp on the forest edge in time for dinner and your first night under canvas.'
        },
        {
          day: 2,
          title: 'Machame Camp to Shira 2 Camp',
          altitude: '2,835 m → 3,850 m',
          hiking: '4–6 hours',
          description:
            'The forest gives way to giant heather and open moorland as you climb a rockier ridge with your first clear views of Kibo. The gradient is honest but manageable, and the air noticeably thinner by the top. You cross onto the western edge of the Shira Plateau to camp at Shira 2, where sunset over the plateau is a first taste of the high mountain.'
        },
        {
          day: 3,
          title: 'Shira 2 to Lava Tower, down to Barranco Camp',
          altitude: '3,850 m → 4,600 m → 3,960 m',
          hiking: '6–8 hours',
          description:
            'This is the key acclimatisation day. You climb steadily east to the base of the 4,600 m Lava Tower for lunch, giving your body a valuable spell at altitude. From there the trail descends into the surreal Barranco Valley past groves of giant senecio plants. Sleeping lower than your daytime high point is exactly the "climb high, sleep low" tactic that helps you adjust.'
        },
        {
          day: 4,
          title: 'Barranco Camp to Karanga Camp',
          altitude: '3,960 m → 3,995 m',
          hiking: '4–5 hours',
          description:
            'The day opens with the Barranco Wall, a hands-on scramble that looks daunting but is well within reach of a fit hiker with a steady head. From the top you are rewarded with sweeping views before dropping and climbing through a series of valleys to Karanga Camp. This shorter day is the extra night we build into the 7-day plan, and it pays real dividends on summit night.'
        },
        {
          day: 5,
          title: 'Karanga Camp to Barafu Camp',
          altitude: '3,995 m → 4,673 m',
          hiking: '4–5 hours',
          description:
            'A steady climb across the alpine desert brings you to Barafu, the summit base camp perched on an exposed rocky ridge. You arrive in the early afternoon for an early dinner and a final gear check. The rest of the day is for sleep — you will be woken close to midnight for the summit push.'
        },
        {
          day: 6,
          title: 'Summit day: Barafu to Uhuru Peak, down to Mweka Camp',
          altitude: '4,673 m → 5,895 m → 3,100 m',
          hiking: '11–15 hours',
          description:
            'You set off around midnight into the cold and dark, climbing slowly by headlamp toward the crater rim at Stella Point. As the sun rises you make the final gentle hour along the rim to Uhuru Peak, the highest point in Africa. After photos and celebrations you descend all the way to Barafu for a rest and lunch, then continue down into the moorland to camp at Mweka.'
        },
        {
          day: 7,
          title: 'Mweka Camp to Mweka Gate, transfer to Arusha',
          altitude: '3,100 m → 1,640 m',
          hiking: '3–4 hours',
          description:
            'A relaxed final descent through the rainforest brings you back to Mweka Gate, where you collect your summit certificate. Your Tanzania Safari Magic vehicle is waiting to drive you back to Arusha for a hot shower and a well-earned bed. It is customary to thank and tip your crew at the gate.'
        }
      ],
      faqs: [
        {
          q: 'Should I choose the 6-day or 7-day Machame?',
          a: 'We almost always recommend the 7-day version. The extra night at Karanga gives your body more time to adjust and meaningfully improves your summit chances. The 6-day plan is only worth considering if you are already well acclimatised or genuinely short on time.'
        },
        {
          q: 'How hard is the Barranco Wall?',
          a: 'It looks intimidating from below but it is a scramble, not technical rock climbing. You use your hands in a few spots and there is one short exposed step, but our guides talk you through it and porters help with any awkward moves. Most climbers finish it grinning.'
        },
        {
          q: 'Do I sleep in huts on Machame?',
          a: 'No. Machame is a camping route throughout. Tanzania Safari Magic provides quality four-season tents, sleeping mats, a dining tent, and a private toilet tent, so you are comfortable even though there are no permanent huts.'
        },
        {
          q: 'How busy is the Machame Route?',
          a: 'It is the most popular route on the mountain, so expect company at the camps, especially in the July–September and January–February peaks. The trail is wide enough that it rarely feels crowded while walking, and the shared energy at camp can be part of the fun.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, camping and rescue fees',
        'Professional licensed guides, cook and porters',
        'All mountain meals and safe drinking water',
        'Quality tents, sleeping mats, dining and toilet tents',
        'Return transfers between Arusha and the trailheads',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
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
  <a class="btn btn-primary" href="/booking?route=machame-route&interest=${encodeURIComponent('Kilimanjaro Machame Route 7-Day Climb')}" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="machame-arusha">How We Run It from Arusha</h2>
<p>Your climb is coordinated end-to-end by Tanzania Safari Magic. We collect you in Arusha, brief you the evening before, and handle Kilimanjaro National Park permits, mountain crew, and meals — see park context on our <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a> page. Guides carry pulse oximeters and check you twice daily. Many climbers pair Machame with a safari or a warm-up trek; ask us about our <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">6-Day Mount Meru, Tarangire &amp; Ngorongoro</a> package as pre-climb acclimatisation. When you're ready, plan the whole trip on <a href="/kilimanjaro">Kilimanjaro</a> and lock dates via <a href="/booking?route=machame-route&interest=${encodeURIComponent('Kilimanjaro Machame Route 7-Day Climb')}">booking</a>.</p>

${cta('Machame Route', WA_ROUTE('Machame Route'), 'machame-route', 'Kilimanjaro Machame Route 7-Day Climb')}
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
      distance: '~72 km / 45 mi (round trip, same trail up and down)',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Busy',
      acclimatization: 'Fair',
      summitNight: 'Leave Kibo Hut (4,703 m) around midnight; ascend the scree to Gilman\u2019s Point on the rim, then continue along the crater edge to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Marangu Route 6-Day Hut Climb',
      pros: [
        'The only route with permanent sleeping huts and real beds',
        'Gentler, steadier gradient underfoot',
        'A good choice in the wetter shoulder months',
        'Simple logistics and often the most budget-friendly'
      ],
      cons: [
        'Lower success rate on the rushed 5-day schedule',
        'Least scenic variety — you descend the same trail you climbed',
        'Shared dormitory huts offer little privacy',
        'Popular, so huts can be full and busy in peak season'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Marangu Gate to Mandara Hut',
          altitude: '1,860 m → 2,700 m',
          hiking: '4–5 hours',
          description:
            'From Marangu Gate you follow a broad, well-graded path through lush rainforest alive with colobus monkeys and birdsong. The walking is gentle and shaded, a pleasant introduction to the mountain. You reach the cluster of A-frame huts at Mandara in the early afternoon, with time for a short walk to the nearby Maundi Crater for your first views.'
        },
        {
          day: 2,
          title: 'Mandara Hut to Horombo Hut',
          altitude: '2,700 m → 3,720 m',
          hiking: '5–6 hours',
          description:
            'The forest quickly opens into rolling moorland dotted with giant lobelia and groundsel. As you gain height the twin summits of Kibo and the jagged Mawenzi come into view. It is a long but steady day on a clear path, finishing at the large hut complex of Horombo, which sits on a hillside with wide views back across the plains.'
        },
        {
          day: 3,
          title: 'Acclimatisation day at Horombo',
          altitude: '3,720 m (day walk to ~4,300 m)',
          hiking: '3–4 hours',
          description:
            'This extra night is the whole point of the 6-day plan. Rather than resting flat, you take a gentle acclimatisation walk up toward the Zebra Rocks or the Mawenzi saddle, climbing high before returning to sleep low at Horombo. It is the single biggest thing you can do on Marangu to improve your summit chances.'
        },
        {
          day: 4,
          title: 'Horombo Hut to Kibo Hut',
          altitude: '3,720 m → 4,703 m',
          hiking: '5–6 hours',
          description:
            'You cross the stark, wind-scoured expanse known as the saddle, a high-altitude desert between Mawenzi and Kibo where little grows. The landscape is lunar and the air thin, so the pace is deliberately slow. You reach Kibo Hut, a stone bunkhouse at the foot of the summit cone, in the afternoon for an early dinner and rest before the midnight start.'
        },
        {
          day: 5,
          title: 'Summit day: Kibo to Uhuru Peak, down to Horombo',
          altitude: '4,703 m → 5,895 m → 3,720 m',
          hiking: '11–14 hours',
          description:
            'Waking near midnight, you begin the long switchback climb up loose volcanic scree toward Gilman\u2019s Point on the crater rim. From there the trail continues around the rim, past Stella Point, to Uhuru Peak for sunrise over the roof of Africa. After celebrating you retrace your steps all the way down to Kibo and continue to Horombo for a deep, well-earned sleep.'
        },
        {
          day: 6,
          title: 'Horombo Hut to Marangu Gate, transfer to Arusha',
          altitude: '3,720 m → 1,860 m',
          hiking: '5–6 hours',
          description:
            'A long but easy descent retraces the moorland and forest path back to Marangu Gate, where you receive your summit certificate. Your Tanzania Safari Magic vehicle drives you back to Arusha to rest and celebrate. Tips for the crew are handed over at the gate.'
        }
      ],
      faqs: [
        {
          q: 'Is Marangu really the easiest Kilimanjaro route?',
          a: 'It has the gentlest gradient and the comfort of huts, so it feels easier day to day. But the standard schedule is short, which actually makes summiting harder because you acclimatise less. Comfortable underfoot does not mean high success — the 6-day version with an acclimatisation day is far more sensible.'
        },
        {
          q: 'What are the huts like?',
          a: 'They are simple A-frame bunkhouses with mattresses and shared dining halls. You sleep in communal dormitory rooms, so bring earplugs and a good sleeping bag. There are basic long-drop toilets, and some lower huts sell bottled drinks and snacks.'
        },
        {
          q: 'Why is it nicknamed the Coca-Cola Route?',
          a: 'The name comes from the huts historically selling soft drinks and the perception that it is the "soft" option next to the camping "Whiskey Route" of Machame. It is a friendly nickname, but do not let it fool you into underestimating the altitude.'
        },
        {
          q: 'Should I add the extra acclimatisation day?',
          a: 'Yes, whenever your schedule allows. The extra night at Horombo dramatically improves how you feel on summit night and how likely you are to reach the top. We only recommend the bare 5-day plan for climbers who are genuinely time-limited.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, hut and rescue fees',
        'Professional licensed guides, cook and porters',
        'Hut bookings at Mandara, Horombo and Kibo',
        'All mountain meals and safe drinking water',
        'Return transfers between Arusha and Marangu Gate',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
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
<p>Tanzania Safari Magic collects you in Arusha, runs a full pre-climb briefing and kit check, and arranges permits, hut bookings, and mountain crew. Our guides monitor oxygen saturation and pace you deliberately slowly on summit night — the single biggest factor in reaching the top. Read park background on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, budget with our <a href="/blog/kilimanjaro-cost">Kilimanjaro cost guide</a>, and start planning on <a href="/kilimanjaro">Kilimanjaro</a>. Ready to hold a date? Head to <a href="/booking?route=marangu-route&interest=${encodeURIComponent('Kilimanjaro Marangu Route 6-Day Hut Climb')}">booking</a>.</p>

${cta('Marangu Route', WA_ROUTE('Marangu Route'), 'marangu-route', 'Kilimanjaro Marangu Route 6-Day Hut Climb')}
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
      distance: '~70 km / 42 mi',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Moderate',
      acclimatization: 'Excellent',
      summitNight: 'Leave Barafu (4,673 m) around midnight; reach the rim at Stella Point, then roughly one more hour along the rim to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Lemosho Route 8-Day Climb',
      pros: [
        'Among the highest summit success rates on the mountain',
        'Quiet, remote forest and plateau on the early days',
        'Excellent acclimatisation from the generous day count',
        'Superb, varied scenery from rainforest to glacier country'
      ],
      cons: [
        'More expensive because of the extra park-fee nights',
        'A longer holiday commitment than Machame',
        'Camping only — no huts on the route',
        'Long drive to the remote Londorossi trailhead'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Londorossi Gate to Mti Mkubwa (Big Tree) Camp',
          altitude: '2,100 m → 2,750 m',
          hiking: '3–4 hours',
          description:
            'After the scenic drive to the far western Londorossi Gate and park registration, a short transfer takes you to the trailhead. You walk a gentle forest path into pristine, rarely busy rainforest where colobus monkeys move through the canopy. Big Tree Camp, named for the towering trees around it, is a peaceful first night deep in the woods.'
        },
        {
          day: 2,
          title: 'Mti Mkubwa to Shira 1 Camp',
          altitude: '2,750 m → 3,505 m',
          hiking: '5–6 hours',
          description:
            'The forest thins into heather and then open moorland as you climb onto the western rim of the Shira Plateau, an ancient collapsed caldera. The views open up dramatically and Kibo appears ahead. Shira 1 Camp sits out on the plateau with big skies and, on clear nights, superb stargazing.'
        },
        {
          day: 3,
          title: 'Shira 1 to Shira 2 Camp',
          altitude: '3,505 m → 3,850 m',
          hiking: '4–5 hours',
          description:
            'A gentler day crossing the wide, wild expanse of the Shira Plateau with Kibo growing steadily closer. The modest altitude gain is deliberate, giving your body time to adjust while you enjoy some of the most spacious scenery on the mountain. There is often time for a short acclimatisation stroll from Shira 2 before dinner.'
        },
        {
          day: 4,
          title: 'Shira 2 to Lava Tower, down to Barranco Camp',
          altitude: '3,850 m → 4,600 m → 3,960 m',
          hiking: '6–7 hours',
          description:
            'Here Lemosho joins the Machame trail for the classic acclimatisation day. You climb east to the 4,600 m Lava Tower for lunch, then descend into the beautiful Barranco Valley among giant senecio plants. Reaching a high point and sleeping lower is the proven "climb high, sleep low" tactic behind the route\u2019s strong success rate.'
        },
        {
          day: 5,
          title: 'Barranco Camp to Karanga Camp',
          altitude: '3,960 m → 3,995 m',
          hiking: '4–5 hours',
          description:
            'The day begins with the Barranco Wall, an enjoyable scramble that rewards you with panoramic views from the top. From there you cross a series of ridges and valleys to Karanga Camp. It is a shorter day by design, banking rest and acclimatisation ahead of the summit push.'
        },
        {
          day: 6,
          title: 'Karanga Camp to Barafu Camp',
          altitude: '3,995 m → 4,673 m',
          hiking: '4–5 hours',
          description:
            'A steady climb across increasingly barren alpine desert brings you to Barafu, the exposed summit base camp on a rocky ridge. You arrive by early afternoon for an early dinner, a final kit check, and as much sleep as the altitude allows before your midnight start.'
        },
        {
          day: 7,
          title: 'Summit day: Barafu to Uhuru Peak, down to Mweka Camp',
          altitude: '4,673 m → 5,895 m → 3,100 m',
          hiking: '11–15 hours',
          description:
            'Starting around midnight, you climb slowly by headlamp up to the crater rim at Stella Point as the temperature drops. Dawn breaks as you make the final hour along the rim to Uhuru Peak, the summit of Africa. After savouring the moment you descend to Barafu for a break, then continue down to the greener Mweka Camp for the night.'
        },
        {
          day: 8,
          title: 'Mweka Camp to Mweka Gate, transfer to Arusha',
          altitude: '3,100 m → 1,640 m',
          hiking: '3–4 hours',
          description:
            'A pleasant final descent through the rainforest returns you to Mweka Gate and your summit certificate. Your Tanzania Safari Magic driver takes you back to Arusha to shower, rest and celebrate. Crew tips are shared at the gate before you say goodbye.'
        }
      ],
      faqs: [
        {
          q: 'Why is Lemosho considered the best Kilimanjaro route?',
          a: 'It combines quiet, scenic early days with enough nights to acclimatise well, which pushes summit success rates to the top of the range. When guests ask for our honest all-round favourite, Lemosho is usually the answer, especially over eight days.'
        },
        {
          q: 'What is the difference between 7-day and 8-day Lemosho?',
          a: 'The 8-day version adds an extra night on the Shira Plateau, giving even better acclimatisation and a more relaxed pace. The 7-day version is still excellent; we suggest eight days if your schedule and budget allow it.'
        },
        {
          q: 'Is Lemosho very crowded?',
          a: 'The first two or three days on the western side are genuinely quiet. Once the route merges with Machame near Barranco you share camps with more climbers, but the peaceful start is one of Lemosho\u2019s biggest draws.'
        },
        {
          q: 'How does Lemosho compare to the Northern Circuit?',
          a: 'They share the same beautiful western approach. The Northern Circuit then loops the quiet north for even more acclimatisation and the highest success rate, but it needs a day or two more. Lemosho is the sweet spot if you want top-tier odds without the longest commitment.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, camping and rescue fees',
        'Professional licensed guides, cook and porters',
        'All mountain meals and safe drinking water',
        'Quality tents, sleeping mats, dining and toilet tents',
        'Return transfers between Arusha and the Londorossi/Mweka trailheads',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
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
  <a class="btn btn-primary" href="/booking?route=lemosho-route&interest=${encodeURIComponent('Kilimanjaro Lemosho Route 8-Day Climb')}" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="lemosho-arusha">How We Run It from Arusha</h2>
<p>The Londorossi trailhead is a longer drive, so Tanzania Safari Magic builds the transfer into your Lemosho package from Arusha and handles permits, camping crew, and meals throughout. We time your departure around the <a href="/blog/best-time-to-climb-kilimanjaro">best climbing months</a> and can combine the climb with a wildlife extension — browse our <a href="/safaris">safari packages</a> or read park detail on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>. Start on <a href="/kilimanjaro">Kilimanjaro</a> and request your plan via <a href="/booking?route=lemosho-route&interest=${encodeURIComponent('Kilimanjaro Lemosho Route 8-Day Climb')}">booking</a>.</p>

${cta('Lemosho Route', WA_ROUTE('Lemosho Route'), 'lemosho-route', 'Kilimanjaro Lemosho Route 8-Day Climb')}
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
      distance: '~73 km / 45 mi',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Quiet',
      acclimatization: 'Good',
      summitNight: 'Leave Kibo Hut / School Hut area (~4,700 m) around midnight; ascend to Gilman\u2019s Point on the rim, then continue along the crater edge to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Rongai Route 7-Day Climb',
      pros: [
        'The only approach from the quiet northern side of the mountain',
        'Drier rain-shadow terrain — a smart wet-season choice',
        'The most solitude of the standard routes on the early days',
        'The dramatic Mawenzi Tarn camp adds a great acclimatisation night'
      ],
      cons: [
        'Less varied, less lush scenery than the southern routes',
        'A long transfer to the remote northern trailhead',
        'Best done over 7 days, which adds cost',
        'Camping only, and you descend the busier Marangu side'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Nalemuru trailhead to Simba Camp',
          altitude: '1,950 m → 2,650 m',
          hiking: '3–4 hours',
          description:
            'After the long, scenic drive around the mountain toward the Kenyan border, you begin on the quiet northern slopes. The trail climbs gently through farmland and pine before entering natural forest, with a good chance of spotting colobus monkeys and buffalo tracks. Simba Camp sits on open moorland with your first sweeping views of Kibo and Mawenzi.'
        },
        {
          day: 2,
          title: 'Simba Camp to Kikelelwa Camp',
          altitude: '2,650 m → 3,600 m',
          hiking: '5–6 hours',
          description:
            'A steady climb across increasingly open moorland takes you deeper into the rain-shadow country, where the terrain is drier and more spacious than on the southern trails. The path is gentle underfoot and the crowds all but vanish. Kikelelwa Camp is a rugged spot in a rocky valley beneath the jagged spires of Mawenzi.'
        },
        {
          day: 3,
          title: 'Kikelelwa Camp to Mawenzi Tarn',
          altitude: '3,600 m → 4,330 m',
          hiking: '3–4 hours',
          description:
            'A shorter but steeper day climbs to the beautiful Mawenzi Tarn, a small alpine lake tucked in a cirque directly below the towering walls of Mawenzi. The dramatic setting is one of the scenic highlights of the route. Arriving early leaves the afternoon free to rest and adjust to the altitude.'
        },
        {
          day: 4,
          title: 'Acclimatisation day at Mawenzi Tarn',
          altitude: '4,330 m (day walk to ~4,600 m)',
          hiking: '2–3 hours',
          description:
            'This extra night is the reason the 7-day Rongai climbs so much better than the shorter plan. You take a gentle acclimatisation walk toward the slopes of Mawenzi, climbing higher before returning to sleep low beside the tarn. The rest of the day is for recovery, hydration and soaking up the wild scenery.'
        },
        {
          day: 5,
          title: 'Mawenzi Tarn to Kibo Hut',
          altitude: '4,330 m → 4,703 m',
          hiking: '5–6 hours',
          description:
            'You cross the stark lunar expanse of the saddle, the high-altitude desert between Mawenzi and Kibo, with the summit cone looming ahead. The walking is not steep but the thin air keeps the pace slow and steady. You reach Kibo Hut in the afternoon for an early dinner and rest before the midnight start.'
        },
        {
          day: 6,
          title: 'Summit day: Kibo to Uhuru Peak, down to Horombo',
          altitude: '4,703 m → 5,895 m → 3,720 m',
          hiking: '11–14 hours',
          description:
            'Setting off near midnight, you climb the long switchbacks of volcanic scree toward Gilman\u2019s Point on the crater rim. From there the trail follows the rim past Stella Point to Uhuru Peak for sunrise. After celebrating on the roof of Africa you descend the Marangu side, dropping steeply to Kibo and continuing down to Horombo Hut for the night.'
        },
        {
          day: 7,
          title: 'Horombo Hut to Marangu Gate, transfer to Arusha',
          altitude: '3,720 m → 1,860 m',
          hiking: '5–6 hours',
          description:
            'A long, easy descent through moorland and rainforest brings you down the Marangu route to the gate, where you collect your summit certificate. Your Tanzania Safari Magic vehicle is waiting to return you to Arusha. Crew tips are handed over at the gate before farewells.'
        }
      ],
      faqs: [
        {
          q: 'Why choose Rongai over the southern routes?',
          a: 'Rongai is the driest and quietest of the standard routes because it climbs the northern, rain-shadow side of the mountain. If you are travelling in the wetter months or simply want solitude and a wilderness feel, it is an excellent choice.'
        },
        {
          q: 'Is Rongai a good rainy-season route?',
          a: 'Yes. The northern slopes sit in a partial rain shadow and generally receive less precipitation than the southern trails, so the going is often drier when Machame and Lemosho are muddy. It is one of our go-to recommendations for green-season departures.'
        },
        {
          q: 'What is Mawenzi Tarn like?',
          a: 'It is one of the most scenic camps on the whole mountain — a small alpine lake in a bowl directly beneath the dramatic pinnacles of Mawenzi. On the 7-day plan you spend an acclimatisation day there, which is both beautiful and great for your summit chances.'
        },
        {
          q: 'Do I go up and down the same way on Rongai?',
          a: 'No. You ascend from the north but descend the Marangu route on the south-east side, so you see different terrain on the way down. It does mean the descent shares the busier Marangu path.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, camping/hut and rescue fees',
        'Professional licensed guides, cook and porters',
        'All mountain meals and safe drinking water',
        'Quality tents, sleeping mats, dining and toilet tents',
        'Return transfers between Arusha, the Nalemuru trailhead and Marangu Gate',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
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
<p>The Nalemuru trailhead sits well to the north, so Tanzania Safari Magic includes the longer transfer from Arusha and manages permits, camping crew, and meals for the full climb. We often recommend Rongai for green-season departures — check timing in our <a href="/blog/best-time-to-climb-kilimanjaro">best time to climb guide</a> — and can bolt on a warm-up trek such as our <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">6-Day Mount Meru, Tarangire &amp; Ngorongoro</a> package. Read park background on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, then start on <a href="/kilimanjaro">Kilimanjaro</a> and book via <a href="/booking?route=rongai-route&interest=${encodeURIComponent('Kilimanjaro Rongai Route 7-Day Climb')}">booking</a>.</p>

${cta('Rongai Route', WA_ROUTE('Rongai Route'), 'rongai-route', 'Kilimanjaro Rongai Route 7-Day Climb')}
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
      distance: '~98 km / 61 mi',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Quiet',
      acclimatization: 'Excellent',
      summitNight: 'Leave School Hut (~4,800 m) around midnight; ascend to Gilman\u2019s Point on the rim, then continue along the crater edge to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Northern Circuit 9-Day Climb',
      pros: [
        'The highest summit success rate of any route on the mountain',
        'The most acclimatisation days of any Kilimanjaro trail',
        'Remarkable solitude on the rarely visited northern slopes',
        'Panoramic, ever-changing views on a near 360° loop'
      ],
      cons: [
        'The longest and therefore the most expensive route',
        'Requires a longer holiday than most climbers plan for',
        'Camping only across many nights',
        'Long transfer to the western Londorossi trailhead'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Londorossi Gate to Mti Mkubwa (Big Tree) Camp',
          altitude: '2,100 m → 2,750 m',
          hiking: '3–4 hours',
          description:
            'The Northern Circuit shares Lemosho\u2019s remote western start. After the drive to Londorossi and park registration, a short transfer brings you to the trailhead for a gentle forest walk into quiet, pristine rainforest. Big Tree Camp is a calm first night deep among the trees, well away from the busier southern gates.'
        },
        {
          day: 2,
          title: 'Mti Mkubwa to Shira 1 Camp',
          altitude: '2,750 m → 3,505 m',
          hiking: '5–6 hours',
          description:
            'The forest gives way to heather and open moorland as you climb onto the western rim of the ancient Shira Plateau. Kibo appears ahead and the views expand in every direction. Shira 1 Camp sits out on the plateau with big skies and excellent stargazing.'
        },
        {
          day: 3,
          title: 'Shira 1 to Shira 2 Camp',
          altitude: '3,505 m → 3,850 m',
          hiking: '4–5 hours',
          description:
            'A relaxed day crossing the wide Shira Plateau with Kibo drawing closer. The gentle altitude gain is intentional, easing your body into the thinner air. There is usually time for a short acclimatisation walk from Shira 2 before dinner.'
        },
        {
          day: 4,
          title: 'Shira 2 to Lava Tower, down to Moir Hut',
          altitude: '3,850 m → 4,600 m → 4,200 m',
          hiking: '5–7 hours',
          description:
            'You climb east to the 4,600 m Lava Tower for lunch, banking valuable time at altitude, then branch away from the crowds toward the quiet north side. Instead of dropping to Barranco with the other routes, you descend to the secluded Moir Hut in a high valley. From here on you rarely see other climbers.'
        },
        {
          day: 5,
          title: 'Moir Hut to Buffalo Camp',
          altitude: '4,200 m → 4,020 m (via ~4,400 m)',
          hiking: '5–7 hours',
          description:
            'The circuit begins in earnest as you traverse the remote northern slopes, crossing a high point before descending to Buffalo Camp. The scenery is wild and expansive, with long views out over the plains toward Kenya. This is some of the most solitary walking on the entire mountain.'
        },
        {
          day: 6,
          title: 'Buffalo Camp to Third Cave (Rongai) Camp',
          altitude: '4,020 m → 3,950 m (via ~4,230 m)',
          hiking: '5–6 hours',
          description:
            'You continue around the northern arc, climbing over a saddle and descending to the Third Cave area on the Rongai side of the mountain. The gentle up-and-down profile keeps building your acclimatisation without pushing you too high, too fast. The quiet, open camps are a world away from the busy south.'
        },
        {
          day: 7,
          title: 'Third Cave to School Hut',
          altitude: '3,950 m → 4,800 m',
          hiking: '4–5 hours',
          description:
            'A steady climb takes you up to School Hut, the summit base camp high on the eastern flank of Kibo. You arrive in the early afternoon for an early dinner and a final gear check. The rest of the day is for sleep before the midnight start — and by now you are among the best-acclimatised climbers on the mountain.'
        },
        {
          day: 8,
          title: 'Summit day: School Hut to Uhuru Peak, down to Millennium Camp',
          altitude: '4,800 m → 5,895 m → 3,820 m',
          hiking: '11–15 hours',
          description:
            'Starting around midnight, you climb the switchbacks toward Gilman\u2019s Point on the crater rim, then follow the rim past Stella Point to Uhuru Peak for sunrise. All those extra days now pay off with a stronger, steadier summit. After celebrating you descend the southern Mweka trail, dropping through the alpine desert to camp at Millennium.'
        },
        {
          day: 9,
          title: 'Millennium Camp to Mweka Gate, transfer to Arusha',
          altitude: '3,820 m → 1,640 m',
          hiking: '3–4 hours',
          description:
            'A final descent through lush rainforest brings you down to Mweka Gate and your summit certificate. Your Tanzania Safari Magic vehicle returns you to Arusha to rest and celebrate a genuinely big achievement. Crew tips are shared at the gate before you head down.'
        }
      ],
      faqs: [
        {
          q: 'Why does the Northern Circuit have the highest success rate?',
          a: 'Because it is the longest route, it gives your body the most time to acclimatise and follows a gentle up-and-down profile around the mountain. More days at altitude before summit night is the single biggest factor in reaching the top, which is why this route leads the mountain for success.'
        },
        {
          q: 'How many days do I need for the Northern Circuit?',
          a: 'The standard plan is nine days on the mountain, sometimes eight. It is the biggest time commitment of any route, so it suits climbers who can free up a longer holiday and want to give themselves the very best odds.'
        },
        {
          q: 'Is the Northern Circuit really that quiet?',
          a: 'Yes. After the first few days you branch onto the northern slopes that most climbers never see, and you can walk for hours with only your crew for company. The solitude and panoramic views are a big part of the appeal.'
        },
        {
          q: 'Is it good for people who have struggled with altitude before?',
          a: 'It is one of the best choices for that reason. The extra acclimatisation days and gradual profile give a cautious, gentle build toward the summit, which is reassuring if a previous climb left you feeling the altitude.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, camping and rescue fees',
        'Professional licensed guides, cook and porters',
        'All mountain meals and safe drinking water',
        'Quality tents, sleeping mats, dining and toilet tents',
        'Return transfers between Arusha and the Londorossi/Mweka trailheads',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
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
  <a class="btn btn-primary" href="/booking?route=northern-circuit-route&interest=${encodeURIComponent('Kilimanjaro Northern Circuit 9-Day Climb')}" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="northern-arusha">How We Run It from Arusha</h2>
<p>Tanzania Safari Magic organises the full Northern Circuit from Arusha — Londorossi permits, an experienced camping crew for the longer haul, and careful daily health checks that matter more the longer you're at altitude. Because you're already investing serious time, many guests extend the trip with a northern-Tanzania safari; ask about our <a href="/safaris/9-day-mount-meru-northern-tanzania-safari">9-Day Mount Meru &amp; Northern Tanzania Safari</a> or browse all <a href="/safaris">safari packages</a>. Read park detail on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, start on <a href="/kilimanjaro">Kilimanjaro</a>, and confirm dates via <a href="/booking?route=northern-circuit-route&interest=${encodeURIComponent('Kilimanjaro Northern Circuit 9-Day Climb')}">booking</a>.</p>

${cta('Northern Circuit', WA_ROUTE('Northern Circuit Route'), 'northern-circuit-route', 'Kilimanjaro Northern Circuit 9-Day Climb')}
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
      distance: '~53 km / 33 mi',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Quiet',
      acclimatization: 'Poor',
      summitNight: 'Leave Barafu (4,673 m) around midnight; reach the rim at Stella Point, then roughly one more hour along the rim to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Umbwe Route 7-Day Climb',
      pros: [
        'The steepest, most direct and adventurous line up the mountain',
        'Very quiet — you have the lower trail almost to yourself',
        'Dramatic forest ridges and southern high-camp scenery',
        'Short distance for strong, experienced trekkers'
      ],
      cons: [
        'Fast altitude gain gives the poorest acclimatisation profile',
        'Lower success rate than the longer routes',
        'Genuinely demanding — not a first Kilimanjaro route',
        'Steep, exposed sections and camping throughout'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Umbwe Gate to Umbwe Camp',
          altitude: '1,600 m → 2,940 m',
          hiking: '5–6 hours',
          description:
            'From Umbwe Gate the trail wastes no time, climbing steeply through dense, humid rainforest along a narrowing forested ridge. The gradient is relentless and the roots and mud demand real effort, but the tunnel of green is beautiful and utterly quiet. Umbwe Camp perches on the ridge among the last of the tall trees.'
        },
        {
          day: 2,
          title: 'Umbwe Camp to Barranco Camp',
          altitude: '2,940 m → 3,960 m',
          hiking: '4–5 hours',
          description:
            'The steep climb continues along the exposed ridge with dramatic drops on either side and expanding views of the mountain ahead. The forest gives way to giant heather and then open moorland dotted with senecio plants. You drop slightly into the Barranco Valley to camp, having gained serious height in a very short time.'
        },
        {
          day: 3,
          title: 'Barranco Camp to Karanga via the Southern Circuit',
          altitude: '3,960 m → ~4,600 m → 3,995 m',
          hiking: '6–7 hours',
          description:
            'To offset the fast ascent, we build in an acclimatisation loop. You scramble the Barranco Wall and, conditions allowing, take a higher line toward the Lava Tower area before descending to sleep at Karanga. Reaching a high point and sleeping lower is essential on Umbwe, where every extra bit of acclimatisation counts.'
        },
        {
          day: 4,
          title: 'Karanga Camp to Barafu Camp',
          altitude: '3,995 m → 4,673 m',
          hiking: '4–5 hours',
          description:
            'A steady climb across the alpine desert brings you to Barafu, the exposed summit base camp on a rocky ridge shared with the Machame and Lemosho routes. You arrive by early afternoon for an early dinner and a final gear check, then rest as much as the altitude allows before the midnight start.'
        },
        {
          day: 5,
          title: 'Summit day: Barafu to Uhuru Peak, down to Mweka Camp',
          altitude: '4,673 m → 5,895 m → 3,100 m',
          hiking: '11–15 hours',
          description:
            'You set off around midnight, climbing slowly by headlamp toward the crater rim at Stella Point in the deep cold. Dawn arrives as you walk the final hour along the rim to Uhuru Peak. After your summit photos you descend to Barafu for a rest, then continue down into the moorland to camp at Mweka.'
        },
        {
          day: 6,
          title: 'Mweka Camp to Mweka Gate, transfer to Arusha',
          altitude: '3,100 m → 1,640 m',
          hiking: '3–4 hours',
          description:
            'A final descent through the rainforest returns you to Mweka Gate and your summit certificate. Your Tanzania Safari Magic vehicle drives you back to Arusha to shower, rest and celebrate. Crew tips are handed over at the gate before you head down.'
        }
      ],
      faqs: [
        {
          q: 'Is Umbwe the hardest Kilimanjaro route?',
          a: 'Yes, it is widely regarded as the toughest of the standard routes. Its steep, direct line gains altitude very quickly with little natural acclimatisation, which makes it both physically demanding and lower in success rate. We only recommend it to experienced, well-conditioned climbers.'
        },
        {
          q: 'Who should not climb Umbwe?',
          a: 'It is not a first Kilimanjaro route and not for anyone new to high altitude or uneasy on steep, exposed terrain. If you have not trekked high before, we will steer you firmly toward Lemosho or Machame, where better acclimatisation makes for a far more enjoyable climb.'
        },
        {
          q: 'How do you improve acclimatisation on such a steep route?',
          a: 'We build in an acclimatisation loop via the Southern Circuit and run the maximum sensible day count, usually seven days. Careful slow pacing and twice-daily health checks are especially important here because the profile leaves little margin.'
        },
        {
          q: 'Is Umbwe technical climbing?',
          a: 'No, it is steep and strenuous trekking with the Barranco Wall scramble, but it does not require ropes or mountaineering skills. The challenge is the gradient, the exposure and the rapid altitude gain rather than technical difficulty.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, camping and rescue fees',
        'Professional licensed guides, cook and porters',
        'All mountain meals and safe drinking water',
        'Quality tents, sleeping mats, dining and toilet tents',
        'Return transfers between Arusha and the Umbwe/Mweka trailheads',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
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
<p>Because Umbwe is demanding, Tanzania Safari Magic runs an extra-careful pre-climb assessment and briefing in Arusha, then supports you with an experienced camping crew and vigilant twice-daily health checks — pacing and acclimatisation are everything here. We'll happily suggest a warm-up such as our <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">6-Day Mount Meru, Tarangire &amp; Ngorongoro</a> package to prime your body first. Read park context on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, check kit with our <a href="/blog/kilimanjaro-packing-list">Kilimanjaro packing list</a>, start on <a href="/kilimanjaro">Kilimanjaro</a>, and book via <a href="/booking?route=umbwe-route&interest=${encodeURIComponent('Kilimanjaro Umbwe Route 7-Day Climb')}">booking</a>.</p>

${cta('Umbwe Route', WA_ROUTE('Umbwe Route'), 'umbwe-route', 'Kilimanjaro Umbwe Route 7-Day Climb')}
`
    },

    /* ---------------------------------------------------------------- SHIRA */
    {
      slug: 'shira-route',
      name: 'Shira Route',
      days: '7–8 days',
      difficulty: 'Challenging',
      success: 'Good (weaker acclimatisation than Lemosho)',
      scenery: 'Superb (Shira Plateau)',
      accommodation: 'Camping',
      summary:
        'Lemosho\u2019s older sibling — a western approach that drives high onto the Shira Plateau to start. Scenic, but the fast jump to altitude on day one makes acclimatisation harder.',
      meta_title: 'Shira Route Kilimanjaro | High-Start Western Climb, 7–8 Days | Tanzania Safari Magic',
      meta_description:
        'The Shira Route on Kilimanjaro drives high onto the Shira Plateau before joining the Lemosho and Machame trail. 7–8 day day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
      keywords:
        'shira route, shira route kilimanjaro, shira plateau route, western kilimanjaro route, shira vs lemosho, high start kilimanjaro route',
      image: IMG(3),
      highlights: [
        'Drives high onto the Shira Plateau to begin',
        'Scenic western approach, quiet early days',
        'Joins the Lemosho and Machame trail higher up',
        'Best for climbers already acclimatised beforehand'
      ],
      bestFor: 'Climbers who have pre-acclimatised (for example on Mount Meru) and want a quick, scenic start on the plateau.',
      distance: '~56 km / 35 mi',
      altitudeMax: '5,895 m (Uhuru Peak)',
      crowdLevel: 'Quiet',
      acclimatization: 'Fair',
      summitNight: 'Leave Barafu (4,673 m) around midnight; reach the rim at Stella Point, then roughly one more hour along the rim to Uhuru Peak.',
      bookingInterest: 'Kilimanjaro Shira Route 8-Day Climb',
      pros: [
        'Scenic western approach across the wide Shira Plateau',
        'Quiet, uncrowded early days away from the main gates',
        'A quick, high start that suits pre-acclimatised climbers',
        'Joins the classic Lemosho and Machame trail for the summit'
      ],
      cons: [
        'Drives you to ~3,600 m on day one — a hard jump in altitude',
        'Weaker acclimatisation and lower success than Lemosho',
        'Not suitable as a first high-altitude route without prep',
        'Camping only, and a long transfer to the western trailhead'
      ],
      dayByDay: [
        {
          day: 1,
          title: 'Drive to Shira Gate, walk to Simba (Shira 1) Camp',
          altitude: '~3,600 m → 3,610 m',
          hiking: '2–4 hours',
          description:
            'Unlike Lemosho, the Shira Route drives you high. A long, rough 4x4 track climbs past Londorossi and the forest to the Morum Barrier on the western rim of the Shira Plateau at around 3,600 m. From there a short walk brings you to your first camp out on the plateau. The scenery is immediately grand, but starting this high on day one is exactly why acclimatisation needs extra care.'
        },
        {
          day: 2,
          title: 'Simba (Shira 1) Camp to Shira 2 Camp',
          altitude: '3,610 m → 3,850 m',
          hiking: '4–5 hours',
          description:
            'A relatively gentle day crossing the wide, wild expanse of the Shira Plateau with Kibo growing steadily ahead. The modest height gain is deliberate, giving your body time to catch up after the high start. Here the route matches the Lemosho itinerary, and there is usually time for a short acclimatisation stroll from Shira 2.'
        },
        {
          day: 3,
          title: 'Shira 2 to Lava Tower, down to Barranco Camp',
          altitude: '3,850 m → 4,600 m → 3,960 m',
          hiking: '6–7 hours',
          description:
            'The route joins the Machame trail for the classic acclimatisation day. You climb east to the 4,600 m Lava Tower for lunch, then descend into the beautiful Barranco Valley among giant senecio plants. Reaching a high point and sleeping lower is the "climb high, sleep low" tactic that matters even more on a route with a high start.'
        },
        {
          day: 4,
          title: 'Barranco Camp to Karanga Camp',
          altitude: '3,960 m → 3,995 m',
          hiking: '4–5 hours',
          description:
            'The day begins with the Barranco Wall, an enjoyable hands-on scramble rewarded by panoramic views from the top. From there you cross a series of ridges and valleys to Karanga Camp. This shorter day banks rest and acclimatisation before the summit push.'
        },
        {
          day: 5,
          title: 'Karanga Camp to Barafu Camp',
          altitude: '3,995 m → 4,673 m',
          hiking: '4–5 hours',
          description:
            'A steady climb across the barren alpine desert brings you to Barafu, the exposed summit base camp on a rocky ridge. You arrive by early afternoon for an early dinner and a final gear check, then rest as much as the altitude allows before the midnight start.'
        },
        {
          day: 6,
          title: 'Summit day: Barafu to Uhuru Peak, down to Mweka Camp',
          altitude: '4,673 m → 5,895 m → 3,100 m',
          hiking: '11–15 hours',
          description:
            'Setting off around midnight, you climb slowly by headlamp toward the crater rim at Stella Point in the deep cold. Dawn breaks as you make the final hour along the rim to Uhuru Peak, the summit of Africa. After your photos you descend to Barafu for a break, then continue down to the greener Mweka Camp for the night.'
        },
        {
          day: 7,
          title: 'Mweka Camp to Mweka Gate, transfer to Arusha',
          altitude: '3,100 m → 1,640 m',
          hiking: '3–4 hours',
          description:
            'A pleasant final descent through the rainforest returns you to Mweka Gate and your summit certificate. Your Tanzania Safari Magic driver takes you back to Arusha to shower, rest and celebrate. Crew tips are shared at the gate before farewells.'
        }
      ],
      faqs: [
        {
          q: 'What is the difference between the Shira and Lemosho routes?',
          a: 'They follow almost the same line across the western plateau, but Lemosho starts lower and walks up through the forest, while Shira drives you high to around 3,600 m and begins on the plateau itself. That high start means Shira gives weaker acclimatisation, so we generally recommend Lemosho unless you are already acclimatised. Compare the two on our Lemosho Route page at /kilimanjaro/routes/lemosho-route.'
        },
        {
          q: 'Is the Shira Route harder to acclimatise on?',
          a: 'Yes. Because you drive to roughly 3,600 m on the first day rather than climbing to it gradually, your body has less time to adjust early on and altitude symptoms are more likely. It suits climbers who have pre-acclimatised, for example on a Mount Meru trek, rather than first-time high-altitude trekkers.'
        },
        {
          q: 'Why choose Shira over Lemosho at all?',
          a: 'The main reasons are time and the scenic high start. If you have already spent time at altitude and want to begin straight out on the dramatic Shira Plateau without the forest days, Shira delivers that. For most climbers, though, Lemosho\u2019s gentler build is the safer, higher-success choice.'
        },
        {
          q: 'Where does the Shira Route join the other trails?',
          a: 'It meets the Lemosho itinerary at Shira 2 Camp and then follows the Machame trail over Lava Tower, Barranco and Barafu to the summit. From the second day onward the experience is essentially the classic western route.'
        }
      ],
      included: [
        'Kilimanjaro National Park entry, camping and rescue fees',
        'Professional licensed guides, cook and porters',
        'All mountain meals and safe drinking water',
        'Quality tents, sleeping mats, dining and toilet tents',
        'Return transfers between Arusha and the Shira/Mweka trailheads, including the 4x4 up to Shira Gate',
        'Pulse oximeter checks and a first-aid kit'
      ],
      excluded: [
        'International and domestic flights',
        'Tanzania visa and travel insurance',
        'Tips for your mountain crew',
        'Personal trekking gear and sleeping bag hire',
        'Meals, drinks and hotel nights in Arusha before and after the climb'
      ],
      html: `
<p class="guide-lead"><strong>The Shira Route</strong> is the older, higher-starting sibling of Lemosho. Instead of walking up through the forest, a rugged 4x4 track carries you high onto the western rim of the Shira Plateau, where the climb begins at around 3,600 m. It is undeniably scenic and quiet, but that fast jump to altitude on day one is the catch — which is why Tanzania Safari Magic usually points climbers toward Lemosho unless they are already acclimatised.</p>

${fig(IMG(3), 'Shira Route Kilimanjaro plateau scenery on the western side', 'Shira begins high on the sweeping Shira Plateau, sharing Lemosho\u2019s scenery from a higher start.', true)}

<h2 id="shira-overview">Overview</h2>
<p>Shira and <a href="/kilimanjaro/routes/lemosho-route">Lemosho</a> are close cousins: they cross the same beautiful western plateau and merge at Shira 2 Camp before following the Machame trail to the summit. The key difference is the start. Lemosho walks up gradually through the rainforest, gaining altitude slowly, while Shira drives you almost straight to 3,600 m and begins on the plateau. That saves a day of walking but skips the gentle early acclimatisation, so summit-night success tends to trail Lemosho\u2019s. For an honest look at how altitude behaves, read our <a href="/blog/climbing-kilimanjaro-difficulty">Kilimanjaro difficulty guide</a>.</p>

<h2 id="shira-who">Who It's For</h2>
<p>Shira makes the most sense for climbers who have already spent time at altitude — for instance on a <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">Mount Meru warm-up trek</a> — and want a quick, scenic start on the plateau. It is <strong>not</strong> the route we recommend for a first high-altitude climb, precisely because the high drive-in gives your body little chance to adjust early. If you have not climbed high before, the gentler <a href="/kilimanjaro/routes/lemosho-route">Lemosho Route</a> is almost always the better call.</p>

<h2 id="shira-days">Day-by-Day Overview</h2>
<ul>
  <li><strong>Day 1</strong> — Drive high to Shira Gate (~3,600 m) and short walk to Simba (Shira 1) Camp.</li>
  <li><strong>Day 2</strong> — Cross the Shira Plateau to Shira 2 Camp, joining the Lemosho trail.</li>
  <li><strong>Day 3</strong> — Up to Lava Tower for acclimatisation, then descend to sleep at Barranco.</li>
  <li><strong>Day 4</strong> — Barranco Wall scramble to Karanga Camp.</li>
  <li><strong>Day 5</strong> — Short climb to Barafu summit base camp.</li>
  <li><strong>Day 6</strong> — Midnight push to Uhuru Peak, then descend toward Mweka.</li>
  <li><strong>Day 7</strong> — Final forest descent to Mweka Gate and return to Arusha.</li>
</ul>
<p>Your confirmed schedule comes with your quote. Compare Shira against the other trails in our <a href="/blog/kilimanjaro-routes-guide">Kilimanjaro routes guide</a>.</p>

${fig(IMG(9), 'Shira Plateau and glaciers on the western side of Kilimanjaro', 'Above the plateau, Shira enters glacier country as it joins the classic western route.')}

<h2 id="shira-pros">Pros &amp; Cons</h2>
<div class="dest-table-wrap">
  <table class="dest-table">
    <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
    <tbody>
      <tr><td>Scenic, quiet western plateau start</td><td>High drive-in gives weaker acclimatisation</td></tr>
      <tr><td>Saves a day over Lemosho</td><td>Lower success rate than Lemosho</td></tr>
      <tr><td>Joins the classic western route higher up</td><td>Not for first-time high-altitude climbers</td></tr>
    </tbody>
  </table>
</div>

<div class="guide-cta-box compact">
  <p style="margin:0">Not sure whether Shira or Lemosho fits you? We'll advise honestly.</p>
  <a class="btn btn-primary" href="/booking?route=shira-route&interest=${encodeURIComponent('Kilimanjaro Shira Route 8-Day Climb')}" style="min-height:48px">Get a Free Quote</a>
</div>

<h2 id="shira-arusha">How We Run It from Arusha</h2>
<p>Tanzania Safari Magic builds the long western transfer and the 4x4 up to Shira Gate into your package, and handles Londorossi permits, camping crew, and meals throughout. Because of the high start, our guides watch acclimatisation especially closely with twice-daily pulse-oximeter checks and deliberately slow pacing. We will often suggest pre-acclimatising on <a href="/safaris/6-day-mount-meru-tarangire-ngorongoro">Mount Meru</a> first. Read park detail on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, start planning on <a href="/kilimanjaro">Kilimanjaro</a>, and request your plan via <a href="/booking?route=shira-route&interest=${encodeURIComponent('Kilimanjaro Shira Route 8-Day Climb')}">booking</a>.</p>

${cta('Shira Route', WA_ROUTE('Shira Route'), 'shira-route', 'Kilimanjaro Shira Route 8-Day Climb')}
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
<p class="guide-lead"><strong>Every Kilimanjaro route ends at Uhuru Peak</strong> — but the trail you choose shapes your days, your scenery, your comfort, and your summit odds. Tanzania Safari Magic runs all the main routes from Arusha — Machame, Marangu, Lemosho, Rongai, the Northern Circuit and Umbwe, plus the higher-starting Shira variant — and this page compares them honestly so you can pick the right one.</p>
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
      <tr><td>Shira</td><td>7–8</td><td>Camping</td><td>High-start western variant of Lemosho</td></tr>
    </tbody>
  </table>
</div>

<p>Whichever you choose, we handle permits, crew, meals, and transfers — see park background on <a href="/destinations/mount-kilimanjaro-national-park">Mount Kilimanjaro National Park</a>, budget with our <a href="/blog/kilimanjaro-cost">cost guide</a>, and start planning on <a href="/kilimanjaro">Kilimanjaro</a>.</p>

<div class="guide-cta-box">
  <h2>Not Sure Which Route Fits?</h2>
  <p>Tell Tanzania Safari Magic your dates and hiking background — we'll recommend the route that gives you the best experience and the best chance of standing on the roof of Africa.</p>
  <div class="guide-cta-actions">
    <a class="btn btn-primary" href="/booking?interest=${encodeURIComponent('Kilimanjaro Climb')}" style="min-height:48px"><i class="fas fa-calendar-check"></i> Get a Free Quote</a>
    <a class="btn btn-outline" href="${WA}?text=Hi%20Tanzania%20Safari%20Magic%2C%20please%20help%20me%20choose%20a%20Kilimanjaro%20route." target="_blank" rel="noopener" style="min-height:48px"><i class="fab fa-whatsapp"></i> WhatsApp Our Team</a>
    <a class="btn btn-outline" href="/safaris" style="min-height:48px;border-color:rgba(255,255,255,0.45);color:#fff">Add a Safari</a>
  </div>
</div>`
  };

  global.TSM_KiliRoutes = { ROUTES: ROUTES, IMG: IMG, hubMeta: hubMeta };
})(window);
