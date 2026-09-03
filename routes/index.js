const express = require('express');
const router = express.Router();
const path = require('path');
const seo = require('../utils/seoRender');
const ssr = require('../utils/ssrContent');

const VIEWS = path.join(__dirname, '../views');

function sendFile(res, name) {
  res.sendFile(path.join(VIEWS, name));
}

// Real, answerable questions travelers ask before booking a Tanzania trip.
// English is used in schema (crawlers/LLMs index the primary language).
const HOME_FAQS = [
  {
    q: 'When is the best time to visit Tanzania for a safari?',
    a: 'The best time for wildlife viewing in northern Tanzania is the dry season from June to October, plus January and February. The Great Wildebeest Migration moves year-round — calving is in the southern Serengeti and Ndutu in January–February, and the dramatic Mara River crossings usually happen from July to September.'
  },
  {
    q: 'How much does a Tanzania safari cost?',
    a: 'A private guided Tanzania safari typically ranges from about $250 to $600+ per person per day, depending on season, accommodation level and group size. Mid-range lodge safaris are the most popular. Share your dates and party size with us for a free tailored quote from Arusha.'
  },
  {
    q: 'Do I need a visa to travel to Tanzania?',
    a: 'Most international visitors need a tourist visa, which many nationalities can obtain online as an e-visa before travel or on arrival. Requirements vary by nationality, so check the official Tanzania immigration portal or ask our Arusha team for current guidance.'
  },
  {
    q: 'How many days do I need for a Tanzania safari?',
    a: 'A rewarding northern-circuit safari (Tarangire, Ngorongoro Crater and Serengeti) usually takes 5 to 7 days. Add 2 to 3 nights for a Zanzibar beach extension, or 6 to 9 days for a Mount Kilimanjaro or Mount Meru climb.'
  },
  {
    q: 'Is it safe to visit Tanzania?',
    a: 'Tanzania is one of Africa\u2019s most popular and welcoming safari destinations. On safari you travel with a licensed professional guide, and our team supports you throughout. Follow standard travel precautions and your guide\u2019s advice in parks and towns.'
  },
  {
    q: 'Can I combine a safari with climbing Kilimanjaro or a Zanzibar beach holiday?',
    a: 'Yes. We specialize in tailor-made itineraries from Arusha that combine a Serengeti and Ngorongoro safari with a Mount Kilimanjaro or Mount Meru climb and a bush-to-beach Zanzibar extension, all in one seamless trip.'
  },
  {
    q: 'How do I book a Tanzania safari with Tanzania Safari Magic?',
    a: 'Request a free, no-obligation quote through our booking page or message us on WhatsApp at +255 695 108 009. We\u2019ll design a custom itinerary, confirm availability, and secure your trip with a deposit — no payment is required just to enquire.'
  }
];

// ── Home ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lang = seo.parseLangFromRequest(req);
    const [featured, destinations, reviewStats, reviews] = await Promise.all([
      ssr.fetchFeaturedPackages(6),
      ssr.fetchDestinations(4),
      ssr.fetchReviewStats(),
      ssr.fetchApprovedReviews(6)
    ]);
    const jsonLd = [
      seo.websiteSchema(lang),
      seo.organizationSchema(reviewStats),
      seo.faqPageSchema(HOME_FAQS),
      seo.breadcrumbSchema([{ name: 'Home', url: '/' }])
    ];
    const reviewLd = seo.reviewListSchema(reviews);
    if (reviewLd) jsonLd.push(reviewLd);
    if (featured.length) jsonLd.push(seo.touristTripItemListSchema(ssr.toTripListItems(featured)));
    if (destinations.length) {
      jsonLd.push(seo.touristDestinationItemListSchema(ssr.toDestinationListItems(destinations)));
    }

    seo.sendSeoHtml(res, 'index.html', {
      pageKey: 'home',
      canonical: seo.SITE.url + '/',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: seo.KEYWORD_HUB.home,
      type: 'website',
      lang,
      hreflangPath: '/',
      jsonLd,
      replaceHtml: {
        destinationsGrid: ssr.destinationListHtml(destinations),
        safarisGrid: ssr.packageListHtml(featured),
        partnersGrid: ssr.partnersListHtml(ssr.loadPartners())
      }
    });
  } catch (e) {
    console.error('home SEO:', e.message);
    sendFile(res, 'index.html');
  }
});

// FAQ copy mirrors the visible questions on views/visit-tanzania.html
// so the FAQPage rich result stays eligible (schema must match on-page content).
const VISIT_TZ_FAQS = [
  {
    q: 'Is Tanzania safe to visit?',
    a: 'Yes. Tanzania is one of Africa\u2019s most stable, welcoming destinations and safari areas are very safe with professional guides. Use normal travel precautions in towns, and your guide handles logistics throughout.'
  },
  {
    q: 'Do I need a visa to visit Tanzania?',
    a: 'Most visitors need a tourist visa, available online as an e-visa or on arrival at major airports. See our Tanzania visa guide for costs and step-by-step instructions.'
  },
  {
    q: 'What is the best time to visit Tanzania?',
    a: 'June to October is best for general wildlife and Mara River crossings, while January to February is ideal for the calving season. Read our full best time to visit Tanzania guide for month-by-month advice.'
  },
  {
    q: 'How much does a Tanzania safari cost?',
    a: 'Costs vary by season, accommodation and park fees. Mid-range safaris typically start around $250 to $450 per person per day. See our Tanzania safari cost guide for detailed 2026 budgets.'
  },
  {
    q: 'How many days do I need in Tanzania?',
    a: 'A great northern-circuit safari takes 5 to 7 days. Add 2 to 4 days for Zanzibar or 6 to 8 days for a Kilimanjaro climb. Most first-timers spend 8 to 12 days combining safari and beach.'
  },
  {
    q: 'Do I need vaccinations for Tanzania?',
    a: 'Yellow fever proof may be required if arriving from an at-risk country, and malaria prophylaxis is recommended. Always confirm current requirements with a travel clinic before you go.'
  },
  {
    q: 'Can I combine a safari with Zanzibar or Kilimanjaro?',
    a: 'Absolutely — that\u2019s our specialty. We build bush-to-beach trips with Zanzibar and combined Kilimanjaro climb-and-safari itineraries, all from Arusha.'
  },
  {
    q: 'What is the best time to climb Kilimanjaro?',
    a: 'The clearest months are January to March and June to October. Explore our Kilimanjaro routes to pick the trail that fits your fitness and schedule.'
  },
  {
    q: 'What currency and language are used in Tanzania?',
    a: 'The currency is the Tanzanian Shilling (TZS); US dollars are widely accepted for tourism. Swahili and English are both official languages, so communication is easy.'
  },
  {
    q: 'How do I get to Tanzania and the safari parks?',
    a: 'Most safari travelers fly into Kilimanjaro International Airport (JRO) near Arusha, the gateway to the northern circuit. From there we handle all transfers and game drives — just request a quote and we\u2019ll plan the rest.'
  }
];

// Featured trips surfaced on the visit-tanzania hub (ItemList of TouristTrip).
const VISIT_TZ_TRIPS = [
  {
    name: 'Serengeti & Ngorongoro Safari',
    url: '/safaris',
    image: '/images/optimized/serengeti-national-park.webp',
    description: 'Classic northern-circuit private safari through the Serengeti and Ngorongoro Crater from Arusha.'
  },
  {
    name: 'Great Wildebeest Migration Safari',
    url: '/migrations',
    image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
    description: 'Witness the Great Migration calving season and Mara River crossings in the Serengeti.'
  },
  {
    name: 'Climb Mount Kilimanjaro',
    url: '/kilimanjaro',
    image: '/images/optimized/mount-kilimanjaro-national-park.webp',
    description: 'Guided treks to Uhuru Peak (5,895 m) on the Machame, Lemosho, Marangu and other routes.'
  },
  {
    name: 'Zanzibar Beach Extension',
    url: '/zanzibar',
    image: '/images/zanzibar/zanzibar%20(1).jpeg',
    description: 'Add white-sand beaches, Stone Town and spice tours after your Tanzania safari.'
  }
];

// ── Visit Tanzania hub (+ keyword aliases for discovery) ──────
function sendVisitTanzania(req, res) {
  try {
    const lang = seo.parseLangFromRequest(req);
    seo.sendSeoHtml(res, 'visit-tanzania.html', {
      pageKey: 'visitTanzania',
      canonical: seo.SITE.url + '/visit-tanzania',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: seo.KEYWORD_HUB.visitTanzania,
      type: 'website',
      lang,
      hreflangPath: '/visit-tanzania',
      h1: 'Visit Tanzania',
      jsonLd: [
        seo.websiteSchema(lang),
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Visit Tanzania', url: '/visit-tanzania' }
        ]),
        seo.organizationSchema(),
        seo.faqPageSchema(VISIT_TZ_FAQS),
        seo.touristTripItemListSchema(VISIT_TZ_TRIPS)
      ]
    });
  } catch {
    sendFile(res, 'visit-tanzania.html');
  }
}

router.get('/visit-tanzania', sendVisitTanzania);
// High-intent discovery aliases → canonical /visit-tanzania
router.get(['/tanzania', '/travel-tanzania', '/tanzania-holidays', '/tanzania-tourism'], (req, res) => {
  res.redirect(301, '/visit-tanzania');
});

// ── Sitemap ───────────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
  try {
    const db = require('../config/db');
    const baseUrl = seo.SITE.url;

    const escapeXml = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    /** Build absolute, XML-safe sitemap loc from a path (e.g. /safaris/my-slug) */
    const toLoc = (pathPart) => {
      const raw = String(pathPart || '').trim();
      if (!raw || raw === '/') return escapeXml(baseUrl);
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      const encoded = path
        .split('/')
        .map((seg, i) => {
          if (i === 0) return '';
          let decoded = seg;
          try {
            decoded = decodeURIComponent(seg);
          } catch (_) { /* keep raw segment */ }
          return encodeURIComponent(decoded);
        })
        .join('/');
      return escapeXml(`${baseUrl}${encoded}`);
    };

    const urlEntry = (loc, { changefreq = 'weekly', priority = '0.8', lastmod } = {}) => {
      const pathPart = String(loc || '').trim();
      const abs = toLoc(pathPart);
      const rawPath = !pathPart || pathPart === '/' || pathPart === '' ? '/' : (pathPart.startsWith('/') ? pathPart : `/${pathPart}`);
      const cleanUrl = rawPath === '/' ? baseUrl : `${baseUrl}${rawPath}`;
      let xml = `<url><loc>${abs}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority>`;
      if (lastmod) xml += `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>`;
      // hreflang alternates for multilingual SEO
      const langs = seo.LOCALES || ['en', 'it', 'fr', 'es', 'de', 'nl'];
      langs.forEach((lang) => {
        const href =
          lang === 'en'
            ? cleanUrl
            : `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}lang=${lang}`;
        xml += `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`;
      });
      xml += `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(cleanUrl)}"/>`;
      xml += `</url>`;
      return xml;
    };

    let packages = { rows: [] };
    try {
      packages = await db.query(
        `SELECT package_slug AS slug, updated_at
         FROM safari_packages
         WHERE is_active = true AND package_slug IS NOT NULL AND package_slug <> ''`
      );
    } catch (_) {
      packages = await db.query(
        `SELECT slug, updated_at FROM safari_packages WHERE is_active = true AND slug IS NOT NULL`
      );
    }

    // Destinations that have content OR linked packages (avoid thin noindex pages)
    let destinations = { rows: [] };
    try {
      destinations = await db.query(`
        SELECT DISTINCT np.park_slug AS slug, np.updated_at
        FROM national_parks np
        WHERE np.is_active = true
          AND np.park_slug IS NOT NULL
          AND (
            EXISTS (
              SELECT 1 FROM safari_packages sp
              WHERE sp.is_active = true
                AND (
                  sp.destinations::text ILIKE '%' || np.park_name || '%'
                  OR sp.package_slug ILIKE '%' || REPLACE(np.park_slug, '-national-park', '') || '%'
                )
            )
            OR np.park_slug IN (
              'serengeti-national-park',
              'ngorongoro-conservation-area',
              'tarangire-national-park',
              'lake-manyara-national-park',
              'arusha-national-park',
              'mount-kilimanjaro-national-park',
              'zanzibar'
            )
          )
      `);
    } catch (_) {
      try {
        destinations = await db.query(
          `SELECT park_slug AS slug, updated_at FROM national_parks
           WHERE is_active = true AND park_slug IS NOT NULL`
        );
      } catch (__) {
        destinations = { rows: [] };
      }
    }

    let blogs = { rows: [] };
    try {
      blogs = await db.query(
        `SELECT post_slug AS slug, updated_at, published_at
         FROM blog_posts
         WHERE is_published = true AND post_slug IS NOT NULL`
      );
    } catch (_) {
      blogs = { rows: [] };
    }

    // High-value pillar blog priorities
    const blogPriority = {
      'tanzania-safari': '1.0',
      'best-time-to-visit-tanzania': '0.95',
      'tanzania-safari-cost': '0.95',
      'great-wildebeest-migration': '0.95',
      'serengeti-national-park': '0.9',
      'ngorongoro-crater': '0.9',
      'zanzibar-guide': '0.9',
      'arusha-national-park': '0.85',
      'first-tanzania-safari': '0.9',
      'tanzania-solo-travel': '0.85',
      'things-to-do-in-arusha': '0.85',
      'tanzania-visa-guide': '0.9',
      'climbing-kilimanjaro-difficulty': '0.95',
      'kilimanjaro-cost': '0.95',
      'best-time-to-climb-kilimanjaro': '0.95',
      'kilimanjaro-routes-guide': '0.95',
      'kilimanjaro-packing-list': '0.9',
      'train-for-kilimanjaro': '0.9',
      'kilimanjaro-tipping-guide': '0.85',
      'kilimanjaro-acclimatization': '0.9',
      'serengeti-safari-cost-2026': '0.95',
      'tanzania-safari-zanzibar-combo': '0.95',
      'kilimanjaro-route-comparison': '0.95'
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/visit-tanzania', priority: '0.98', changefreq: 'weekly' },
      { path: '/safaris', priority: '0.95', changefreq: 'daily' },
      { path: '/group-safaris', priority: '0.95', changefreq: 'daily' },
      { path: '/kilimanjaro', priority: '0.98', changefreq: 'weekly' },
      { path: '/kilimanjaro/routes', priority: '0.95', changefreq: 'weekly' },
      { path: '/migrations', priority: '0.98', changefreq: 'weekly' },
      { path: '/zanzibar', priority: '0.95', changefreq: 'weekly' },
      { path: '/2027-safaris', priority: '0.97', changefreq: 'weekly' },
      { path: '/destinations', priority: '0.95', changefreq: 'weekly' },
      { path: '/destinations/serengeti-national-park', priority: '0.95', changefreq: 'weekly' },
      { path: '/destinations/ngorongoro-conservation-area', priority: '0.95', changefreq: 'weekly' },
      { path: '/destinations/mount-kilimanjaro-national-park', priority: '0.98', changefreq: 'weekly' },
      { path: '/destinations/tarangire-national-park', priority: '0.85', changefreq: 'weekly' },
      { path: '/destinations/lake-manyara-national-park', priority: '0.85', changefreq: 'weekly' },
      { path: '/destinations/arusha-national-park', priority: '0.85', changefreq: 'weekly' },
      { path: '/destinations/zanzibar', priority: '0.9', changefreq: 'weekly' },
      { path: '/booking', priority: '0.92', changefreq: 'monthly' },
      { path: '/about', priority: '0.75', changefreq: 'monthly' },
      { path: '/contact', priority: '0.88', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
      { path: '/terms', priority: '0.4', changefreq: 'yearly' },
      { path: '/blog', priority: '0.92', changefreq: 'daily' }
    ];
    staticPages.forEach(p => {
      xml += urlEntry(p.path, { priority: p.priority, changefreq: p.changefreq });
    });

    // Kilimanjaro route detail pages
    KILI_ROUTE_SLUGS.forEach(slug => {
      xml += urlEntry(`/kilimanjaro/routes/${slug}`, { priority: '0.9', changefreq: 'weekly' });
    });

    packages.rows.forEach(pkg => {
      if (!pkg.slug) return;
      xml += urlEntry(`/safaris/${pkg.slug}`, {
        priority: '0.9',
        changefreq: 'weekly',
        lastmod: pkg.updated_at
      });
    });

    try {
      const departures = await db.query(`
        SELECT departure_slug AS slug, updated_at
        FROM group_departures
        WHERE is_active = true AND start_date >= CURRENT_DATE AND status <> 'cancelled'
      `);
      departures.rows.forEach(dep => {
        if (!dep.slug) return;
        xml += urlEntry(`/group-safaris/${dep.slug}`, {
          priority: '0.85',
          changefreq: 'weekly',
          lastmod: dep.updated_at
        });
      });
    } catch (_) { /* optional */ }

    destinations.rows.forEach(dest => {
      if (!dest.slug) return;
      const hi = ['serengeti-national-park', 'ngorongoro-conservation-area', 'zanzibar'].includes(dest.slug);
      xml += urlEntry(`/destinations/${dest.slug}`, {
        priority: hi ? '0.9' : '0.8',
        changefreq: 'weekly',
        lastmod: dest.updated_at
      });
    });

    const blogSlugs = new Set();
    blogs.rows.forEach(blog => {
      if (!blog.slug) return;
      blogSlugs.add(blog.slug);
      xml += urlEntry(`/blog/${blog.slug}`, {
        priority: blogPriority[blog.slug] || '0.8',
        changefreq: 'weekly',
        lastmod: blog.updated_at || blog.published_at
      });
    });

    // Ensure high-value pillar guides are listed even if not yet in blog_posts
    Object.keys(blogPriority).forEach(slug => {
      if (blogSlugs.has(slug)) return;
      xml += urlEntry(`/blog/${slug}`, {
        priority: blogPriority[slug],
        changefreq: 'weekly'
      });
    });

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).end();
  }
});

// robots.txt fallback if static missing — prefer public/robots.txt via express.static
router.get('/robots.txt', (req, res, next) => next());

router.get('/thank-you', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'thank-you.html', {
      title: 'Thank You | Tanzania Safari Magic',
      description: 'Thanks for contacting Tanzania Safari Magic. Our Arusha team will reply shortly.',
      canonical: seo.SITE.url + '/thank-you',
      robots: 'noindex, follow'
    });
  } catch {
    sendFile(res, 'thank-you.html');
  }
});

router.get('/unsubscribe', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'unsubscribe.html', {
      title: 'Unsubscribe | Tanzania Safari Magic',
      description: 'Manage newsletter subscription.',
      canonical: seo.SITE.url + '/unsubscribe',
      robots: 'noindex, follow'
    });
  } catch {
    sendFile(res, 'unsubscribe.html');
  }
});

router.get('/safaris', async (req, res) => {
  try {
    // Filter/query pages share one canonical to avoid duplicate indexation
    const packages = await ssr.fetchPackages(24);
    const jsonLd = [
      seo.organizationSchema(),
      seo.breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Safaris', url: '/safaris' }
      ])
    ];
    if (packages.length) jsonLd.push(seo.touristTripItemListSchema(ssr.toTripListItems(packages)));

    seo.sendSeoHtml(res, 'safaris.html', {
      pageKey: 'safaris',
      canonical: seo.SITE.url + '/safaris',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: seo.KEYWORD_HUB.safaris,
      h1: 'Tanzania Safari Packages',
      hreflangPath: '/safaris',
      robots: 'index, follow',
      jsonLd,
      replaceHtml: {
        safarisGrid: ssr.packageListHtml(packages)
      }
    });
  } catch (e) {
    console.error('safaris SEO:', e.message);
    sendFile(res, 'safaris.html');
  }
});

router.get(['/tanzania-2027', '/safaris-2027'], (req, res) => {
  res.redirect(301, '/2027-safaris');
});

router.get('/2027-safaris', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'safaris-2027.html', {
      title: '2027 Tanzania Safaris | 12-Day Nature & Cultural Safari',
      description:
        'Join our 12-day Discover Tanzania Nature & Cultural Safari, 2–13 September 2027: Western Kilimanjaro, Tarangire, Lake Eyasi, Serengeti, Mara River and Ngorongoro Crater. From $5,913 per person.',
      canonical: seo.SITE.url + '/2027-safaris',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords:
        'tanzania safari 2027, september 2027 safari, serengeti migration 2027, ngorongoro safari 2027, hadzabe safari, mara river crossing 2027',
      h1: 'Tanzania — nature, culture & the Great Migration',
      hreflangPath: '/2027-safaris',
      type: 'website',
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: '2027 Safaris', url: '/2027-safaris' }
        ]),
        seo.organizationSchema()
      ]
    });
  } catch {
    sendFile(res, 'safaris-2027.html');
  }
});

router.get('/group-safaris', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'group-safaris.html', {
      pageKey: 'group',
      canonical: seo.SITE.url + '/group-safaris',
      image: '/images/optimized/mbugani.webp',
      keywords: seo.KEYWORD_HUB.group,
      h1: 'Open Group Safaris Tanzania',
      hreflangPath: '/group-safaris'
    });
  } catch {
    sendFile(res, 'group-safaris.html');
  }
});

router.get('/group-safaris/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const db = require('../config/db');
    let row = null;
    try {
      const r = await db.query(`
        SELECT gd.departure_slug, gd.title_override, gd.start_date, gd.end_date,
               gd.price_usd, gd.discount_percent, sp.package_name, sp.featured_image_url,
               sp.short_description, sp.duration_days
        FROM group_departures gd
        JOIN safari_packages sp ON sp.package_id = gd.package_id
        WHERE gd.departure_slug = $1 AND gd.is_active = true
        LIMIT 1
      `, [slug]);
      row = r.rows[0];
    } catch (_) { /* fall through */ }

    const title = row
      ? `${row.title_override || row.package_name} | Group Safari Tanzania`
      : 'Group Safari Departure | Tanzania Safari Magic';
    const desc = row
      ? `Join ${row.title_override || row.package_name} (${row.duration_days || ''} days). Fixed-date group safari from Arusha — request your seat with Tanzania Safari Magic.`
      : 'Fixed-date group safari departure in Tanzania. View itinerary, price, and request your seat.';

    seo.sendSeoHtml(res, 'group-safari-detail.html', {
      title: title.slice(0, 70),
      description: desc,
      canonical: `${seo.SITE.url}/group-safaris/${encodeURIComponent(slug)}`,
      image: row?.featured_image_url || '/images/optimized/mbugani.webp',
      keywords: 'group safari tanzania, ' + (row?.package_name || 'shared safari'),
      type: 'article',
      h1: row?.title_override || row?.package_name || 'Group Safari Departure',
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Group Safaris', url: '/group-safaris' },
          { name: row?.title_override || row?.package_name || 'Departure', url: `/group-safaris/${slug}` }
        ])
      ]
    });
  } catch (e) {
    console.error('group-safari SEO:', e.message);
    sendFile(res, 'group-safari-detail.html');
  }
});

// ── Kilimanjaro routes hub + detail (more specific — declared before /kilimanjaro) ──
const KILI_ROUTE_SEO = {
  'machame-route': {
    name: 'Machame Route',
    title: 'Machame Route Kilimanjaro | 6–7 Day Camping Climb',
    description:
      'Climb the Machame Route on Kilimanjaro with Tanzania Safari Magic in Arusha. 6–7 day camping itinerary, day-by-day overview, difficulty, pros and cons, and free quotes.',
    image: '/images/kilimanjaro/kilimanjaro%20(1).jpeg'
  },
  'marangu-route': {
    name: 'Marangu Route',
    title: 'Marangu Route Kilimanjaro | Hut Climb, 5–6 Days',
    description:
      'The Marangu "Coca-Cola" Route on Kilimanjaro — the only hut trail. 5–6 day itinerary, day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic in Arusha.',
    image: '/images/kilimanjaro/kilimanjaro%20(2).jpeg'
  },
  'lemosho-route': {
    name: 'Lemosho Route',
    title: 'Lemosho Route Kilimanjaro | 7–8 Day Scenic Climb',
    description:
      'Climb the Lemosho Route on Kilimanjaro — a scenic 7–8 day western approach with high success rates. Day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
    image: '/images/kilimanjaro/kilimanjaro%20(3).jpeg'
  },
  'rongai-route': {
    name: 'Rongai Route',
    title: 'Rongai Route Kilimanjaro | Northern Approach, 6–7 Days',
    description:
      'The Rongai Route climbs Kilimanjaro from the quiet northern side near Kenya. 6–7 day itinerary, day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
    image: '/images/kilimanjaro/kilimanjaro%20(4).jpeg'
  },
  'northern-circuit-route': {
    name: 'Northern Circuit Route',
    title: 'Northern Circuit Kilimanjaro | 8–9 Day Route',
    description:
      'The Northern Circuit is Kilimanjaro’s longest, quietest route with the highest success rate. 8–9 day day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
    image: '/images/kilimanjaro/kilimanjaro%20(5).jpeg'
  },
  'umbwe-route': {
    name: 'Umbwe Route',
    title: 'Umbwe Route Kilimanjaro | Steep Direct Climb, 6–7 Days',
    description:
      'The Umbwe Route is Kilimanjaro’s steepest, most direct and challenging trail. 6–7 day day-by-day overview, who it suits, pros and cons, and free quotes from Tanzania Safari Magic.',
    image: '/images/kilimanjaro/kilimanjaro%20(6).jpeg'
  },
  'shira-route': {
    name: 'Shira Route',
    title: 'Shira Route Kilimanjaro | High-Start Western Climb, 7–8 Days',
    description:
      'The Shira Route drives high onto the Shira Plateau before joining the Lemosho and Machame trail. 7–8 day day-by-day overview, pros and cons, and free quotes from Tanzania Safari Magic.',
    image: '/images/kilimanjaro/kilimanjaro%20(3).jpeg'
  }
};
const KILI_ROUTE_SLUGS = Object.keys(KILI_ROUTE_SEO);

router.get('/kilimanjaro/routes', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'kilimanjaro-routes.html', {
      pageKey: 'kilimanjaroRoutes',
      canonical: seo.SITE.url + '/kilimanjaro/routes',
      image: '/images/kilimanjaro/kilimanjaro%20(1).jpeg',
      keywords: 'kilimanjaro routes, machame route, lemosho route, marangu route, rongai route, northern circuit, umbwe route, best kilimanjaro route',
      h1: 'Kilimanjaro Climbing Routes',
      hreflangPath: '/kilimanjaro/routes',
      type: 'website',
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Kilimanjaro', url: '/kilimanjaro' },
          { name: 'Routes', url: '/kilimanjaro/routes' }
        ]),
        seo.organizationSchema()
      ]
    });
  } catch {
    sendFile(res, 'kilimanjaro-routes.html');
  }
});

router.get('/kilimanjaro/routes/:slug', (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase();
  const meta = KILI_ROUTE_SEO[slug];
  try {
    const name = meta ? meta.name : 'Kilimanjaro Route';
    const title = (meta ? meta.title : `${name} | Kilimanjaro Climbing Route`).slice(0, 70);
    const description = meta
      ? meta.description
      : 'Kilimanjaro climbing route details — difficulty, days, distance and summit success rate. Plan your private climb from Arusha.';

    seo.sendSeoHtml(res, 'kilimanjaro-route-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/kilimanjaro/routes/${encodeURIComponent(slug)}`,
      image: meta ? meta.image : '/images/optimized/mount-kilimanjaro-national-park.webp',
      keywords: `${name.toLowerCase()}, kilimanjaro route, climb kilimanjaro, ${slug.replace(/-/g, ' ')}, kilimanjaro from arusha`,
      type: 'article',
      h1: name,
      hreflangPath: `/kilimanjaro/routes/${slug}`,
      robots: meta ? 'index, follow' : 'noindex, follow',
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Kilimanjaro', url: '/kilimanjaro' },
          { name: 'Routes', url: '/kilimanjaro/routes' },
          { name: name, url: `/kilimanjaro/routes/${slug}` }
        ])
      ]
    });
  } catch (e) {
    console.error('kilimanjaro route SEO:', e.message);
    sendFile(res, 'kilimanjaro-route-detail.html');
  }
});

router.get(['/kilimanjaro', '/migrations', '/zanzibar'], (req, res) => {
  const hub = {
    '/kilimanjaro': {
      pageKey: 'kilimanjaro',
      keywords: seo.KEYWORD_HUB.kilimanjaro,
      image: '/images/optimized/mount-kilimanjaro-national-park.webp',
      h1: 'Kilimanjaro Climbs & Treks',
      eyebrow: 'Mount Kilimanjaro · 5,895 m',
      crumb: 'Kilimanjaro'
    },
    '/migrations': {
      pageKey: 'migrations',
      keywords: 'great wildebeest migration, serengeti migration safari, mara river crossing, ndutu calving, tanzania tourism',
      image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
      h1: 'Great Migration Safaris',
      eyebrow: 'Wildebeest Migration',
      crumb: 'Migrations'
    },
    '/zanzibar': {
      pageKey: 'zanzibar',
      keywords: 'zanzibar safari package, bush to beach tanzania, safari and zanzibar, spice island holiday',
      image: '/images/zanzibar/zanzibar%20(1).jpeg',
      h1: 'Zanzibar Safaris & Beach Holidays',
      eyebrow: 'Spice Island',
      crumb: 'Zanzibar'
    }
  };
  const meta = hub[req.path] || hub['/kilimanjaro'];
  try {
    seo.sendSeoHtml(res, 'safari-hub.html', {
      ...meta,
      canonical: seo.SITE.url + req.path,
      hreflangPath: req.path,
      type: 'website',
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Safaris', url: '/safaris' },
          { name: meta.h1, url: req.path }
        ]),
        seo.organizationSchema(),
        ...(req.path === '/kilimanjaro'
          ? [
              seo.touristTripItemListSchema([
                { name: 'Machame Route', url: '/kilimanjaro/routes/machame-route', image: '/images/kilimanjaro/kilimanjaro%20(1).jpeg', description: 'Popular 6–7 day Kilimanjaro camping route.' },
                { name: 'Lemosho Route', url: '/kilimanjaro/routes/lemosho-route', image: '/images/kilimanjaro/kilimanjaro%20(3).jpeg', description: 'Scenic western approach with strong acclimatization.' },
                { name: 'Marangu Route', url: '/kilimanjaro/routes/marangu-route', image: '/images/kilimanjaro/kilimanjaro%20(2).jpeg', description: 'Classic hut route to Uhuru Peak.' },
                { name: 'Northern Circuit', url: '/kilimanjaro/routes/northern-circuit-route', image: '/images/kilimanjaro/kilimanjaro%20(5).jpeg', description: 'Longest route with the highest summit success profile.' }
              ])
            ]
          : [])
      ]
    });
  } catch {
    sendFile(res, 'safari-hub.html');
  }
});

router.get('/safaris/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const row = await ssr.fetchPackageBySlug(slug);

    const title = seo.packagePageTitle(row);
    const description = seo.packagePageDescription(row);

    const jsonLd = [
      seo.organizationSchema(),
      seo.breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Safaris', url: '/safaris' },
        { name: row?.package_name || 'Safari', url: `/safaris/${slug}` }
      ])
    ];
    const trip = seo.touristTripSchema(row);
    if (trip) jsonLd.push(trip);

    seo.sendSeoHtml(res, 'safari-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/safaris/${encodeURIComponent(slug)}`,
      image: row?.featured_image_url || '/images/optimized/serengeti-national-park.webp',
      keywords: `tanzania safari, ${row?.package_name || 'safari package'}, serengeti, ngorongoro, private safari arusha`,
      type: 'product',
      h1: row?.package_name || 'Tanzania Safari Package',
      jsonLd,
      replaceHtml: {
        loadingState: row ? ssr.safariDetailSsrHtml(row) : ''
      }
    });
  } catch (e) {
    console.error('safari SEO:', e.message);
    sendFile(res, 'safari-detail.html');
  }
});

router.get('/destinations', async (req, res) => {
  try {
    const destinations = await ssr.fetchDestinations(24);
    const jsonLd = [
      seo.organizationSchema(),
      seo.breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Destinations', url: '/destinations' }
      ])
    ];
    if (destinations.length) {
      jsonLd.push(seo.touristDestinationItemListSchema(ssr.toDestinationListItems(destinations)));
    }

    // Crawlable destination cards in the northern grid; client JS re-partitions on hydrate
    const listHtml = ssr.destinationListHtml(destinations);

    seo.sendSeoHtml(res, 'destinations.html', {
      pageKey: 'destinations',
      canonical: seo.SITE.url + '/destinations',
      image: '/images/optimized/balloon.webp',
      keywords: seo.KEYWORD_HUB.destinations,
      h1: 'Tanzania Safari Destinations',
      hreflangPath: '/destinations',
      jsonLd,
      replaceHtml: {
        northernDestGrid: listHtml,
        southernDestGrid: '',
        zanzibarDestGrid: ''
      }
    });
  } catch (e) {
    console.error('destinations SEO:', e.message);
    sendFile(res, 'destinations.html');
  }
});

router.get('/destinations/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const row = await ssr.fetchDestinationBySlug(slug);

    const name = row?.park_name || slug.replace(/-/g, ' ');
    const isKili = /kilimanjaro/i.test(slug) || /kilimanjaro/i.test(name || '');
    const kiliMeta = {
      title: 'Kilimanjaro National Park Guide | Climb & Trek | Tanzania Safari Magic',
      description: 'Climb Mount Kilimanjaro (5,895 m) with Tanzania Safari Magic. UNESCO park, Machame, Lemosho & Marangu routes, best time, costs, and safari + trek combos from Arusha.',
      keywords: seo.KEYWORD_HUB.kilimanjaro,
      image: '/images/optimized/mount-kilimanjaro-national-park.webp',
      h1: 'Kilimanjaro National Park — Climb Africa’s Highest Peak'
    };
    const title = (isKili ? kiliMeta.title : (row?.meta_title || `${name} Safari Guide | Tanzania Safari Magic`)).slice(0, 70);
    const description = isKili
      ? kiliMeta.description
      : (row?.meta_description
        || seo.truncate(row?.short_description || row?.detailed_description
          || `Plan your ${name} safari with Tanzania Safari Magic in Arusha — wildlife, best time, and private packages.`, 160));

    const destName = isKili ? 'Mount Kilimanjaro National Park' : name;
    const image = row?.featured_image_url || (isKili ? kiliMeta.image : '/images/optimized/serengeti-national-park.webp');
    const h1 = isKili ? kiliMeta.h1 : name;

    seo.sendSeoHtml(res, 'destination-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/destinations/${encodeURIComponent(slug)}`,
      image,
      keywords: isKili ? kiliMeta.keywords : `${name}, tanzania safari, visit tanzania, ${slug.replace(/-/g, ' ')}, wildlife safari arusha, tanzania tourism`,
      type: 'article',
      h1,
      jsonLd: [
        seo.organizationSchema(),
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Destinations', url: '/destinations' },
          { name: isKili ? 'Kilimanjaro National Park' : name, url: `/destinations/${slug}` }
        ]),
        seo.touristDestinationSchema({
          name: destName,
          description,
          url: `/destinations/${slug}`,
          image
        })
      ],
      replaceBlock: {
        destinationDetailContent: row
          ? ssr.destinationDetailSsrHtml(Object.assign({}, row, { park_name: h1 }))
          : `<main id="destinationDetailContent"><h1>${seo.escapeHtml(h1)}</h1><p>${seo.escapeHtml(description)}</p><p><a href="/booking?interest=${encodeURIComponent(name)}">Request a free quote</a></p></main>`
      }
    });
  } catch (e) {
    console.error('destination SEO:', e.message);
    sendFile(res, 'destination-detail.html');
  }
});

router.get('/about', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'about.html', {
      pageKey: 'about',
      canonical: seo.SITE.url + '/about',
      image: '/images/logo.png',
      hreflangPath: '/about'
    });
  } catch {
    sendFile(res, 'about.html');
  }
});

router.get('/privacy', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'privacy.html', {
      pageKey: 'privacy',
      canonical: seo.SITE.url + '/privacy',
      robots: 'index, follow',
      hreflangPath: '/privacy'
    });
  } catch {
    sendFile(res, 'privacy.html');
  }
});

router.get('/terms', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'terms.html', {
      pageKey: 'terms',
      canonical: seo.SITE.url + '/terms',
      robots: 'index, follow',
      hreflangPath: '/terms'
    });
  } catch {
    sendFile(res, 'terms.html');
  }
});

router.get('/contact', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'contact.html', {
      pageKey: 'contact',
      canonical: seo.SITE.url + '/contact',
      hreflangPath: '/contact'
    });
  } catch {
    sendFile(res, 'contact.html');
  }
});

router.get('/booking', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'booking.html', {
      pageKey: 'booking',
      canonical: seo.SITE.url + '/booking',
      keywords: seo.KEYWORD_HUB.booking,
      h1: 'Request Your Tanzania Safari Quote',
      hreflangPath: '/booking'
    });
  } catch {
    sendFile(res, 'booking.html');
  }
});

router.get('/blog', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'blog.html', {
      pageKey: 'blog',
      canonical: seo.SITE.url + '/blog',
      image: '/images/optimized/balloon.webp',
      keywords: seo.KEYWORD_HUB.blog,
      h1: 'Tanzania Safari Guides & Blog',
      hreflangPath: '/blog'
    });
  } catch {
    sendFile(res, 'blog.html');
  }
});

router.get('/blog/:slug', async (req, res) => {
  const slug = req.params.slug;
  const PILLAR_PAGE_SEO = {
    'serengeti-safari-cost-2026': {
      title: 'Serengeti Safari Cost 2026 | What\'s Included from Arusha',
      description: 'Serengeti safari cost 2026: typical USD per person, park fees, lodges, and what is included vs excluded. WhatsApp for live availability.',
      image: '/images/optimized/serengeti-national-park.webp',
      faqs: [
        { q: 'How much does a Serengeti safari cost in 2026?', a: 'A private mid-range Serengeti safari with a local Arusha operator typically costs about USD $450–$650+ per person per day, depending on lodges and season.' },
        { q: 'What is included in a Serengeti safari price?', a: 'A complete quote should include park fees, a private 4x4, a licensed guide, and named lodges. Flights, visas, tips, drinks, and balloon safaris are usually extra.' }
      ]
    },
    'tanzania-safari-zanzibar-combo': {
      title: 'Safari + Zanzibar 2026 | How to Combine Beach & Bush',
      description: 'How to combine a Tanzania safari with Zanzibar in 2026: days, flights from Arusha, costs, and sample itineraries. WhatsApp for live availability.',
      image: '/images/optimized/boat%20zanzibar.webp',
      faqs: [
        { q: 'How do you combine a Tanzania safari with Zanzibar?', a: 'Do 5–8 northern-circuit safari days from Arusha, then fly to Zanzibar for 3–5 beach nights. We book both on one quote.' },
        { q: 'How many days for safari plus Zanzibar?', a: 'Ten to twelve days is the most comfortable first trip. Eight to nine days works with a shorter beach stay.' }
      ]
    },
    'kilimanjaro-route-comparison': {
      title: 'Kilimanjaro Route Comparison 2026 | Machame vs Lemosho',
      description: 'Compare 6–8 day Kilimanjaro routes: Machame, Lemosho, Marangu — days, difficulty, huts vs camping. WhatsApp Arusha for a 2026 climb quote.',
      image: '/images/kilimanjaro/kilimanjaro%20(1).jpeg',
      faqs: [
        { q: 'Which Kilimanjaro route is best for 7 days?', a: 'Machame in 7 days or Lemosho in 7–8 days are the usual picks for camping. Marangu uses huts and is often 5–6 days.' },
        { q: 'Machame vs Lemosho — which should I book?', a: 'Book Lemosho if you can take the extra day. Book 7-day Machame for the classic southern-circuit trail.' }
      ]
    },
    'great-wildebeest-migration': {
      title: 'Best Time for the Great Migration 2026 | Month-by-Month',
      description: 'Month-by-month Great Migration calendar: Ndutu calving, Grumeti, Mara River crossings. WhatsApp for live herd location and 2026 availability.',
      image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp'
    }
  };
  const pillar = PILLAR_PAGE_SEO[slug];
  try {
    const db = require('../config/db');
    let row = null;
    try {
      const r = await db.query(`
        SELECT post_title, post_slug, post_excerpt, post_content, featured_image_url,
               meta_title, meta_description, post_tags, published_at, updated_at
        FROM blog_posts
        WHERE post_slug = $1 AND is_published = true
        LIMIT 1
      `, [slug]);
      row = r.rows[0];
    } catch (_) { /* fall through */ }

    const title = (row?.meta_title || pillar?.title || row?.post_title || 'Tanzania Safari Guide').slice(0, 65);
    const description = row?.meta_description
      || pillar?.description
      || seo.truncate(row?.post_excerpt || seo.stripHtml(row?.post_content), 158)
      || 'Tanzania safari planning guide from Tanzania Safari Magic in Arusha.';
    const tags = Array.isArray(row?.post_tags) ? row.post_tags.join(', ') : '';
    const jsonLd = [
      seo.breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: row?.post_title || pillar?.title || 'Guide', url: `/blog/${slug}` }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: seo.absoluteUrl(row?.featured_image_url || pillar?.image),
        author: { '@type': 'Person', name: 'John Raphael Shayo' },
        publisher: {
          '@type': 'Organization',
          name: seo.SITE.name,
          logo: { '@type': 'ImageObject', url: seo.SITE.logo }
        },
        datePublished: row?.published_at || '2026-08-21',
        dateModified: row?.updated_at || row?.published_at || '2026-08-21',
        mainEntityOfPage: `${seo.SITE.url}/blog/${slug}`
      }
    ];
    if (pillar?.faqs?.length) jsonLd.push(seo.faqPageSchema(pillar.faqs));

    seo.sendSeoHtml(res, 'blog-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/blog/${encodeURIComponent(slug)}`,
      image: row?.featured_image_url || pillar?.image || '/images/optimized/serengeti-national-park.webp',
      keywords: tags || seo.KEYWORD_HUB.blog,
      type: 'article',
      h1: row?.post_title || pillar?.title || title,
      jsonLd
    });
  } catch (e) {
    console.error('blog SEO:', e.message);
    sendFile(res, 'blog-detail.html');
  }
});

router.get('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  try {
    seo.sendSeoHtml(res, '404.html', {
      title: 'Page Not Found | Tanzania Safari Magic',
      description: 'This page was not found. Browse Tanzania safari packages, destinations, and travel guides from Arusha.',
      canonical: seo.SITE.url + '/404',
      robots: 'noindex, follow'
    }, 404);
  } catch {
    res.status(404).sendFile(path.join(VIEWS, '404.html'));
  }
});

module.exports = router;
