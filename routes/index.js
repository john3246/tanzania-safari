const express = require('express');
const router = express.Router();
const path = require('path');
const seo = require('../utils/seoRender');

const VIEWS = path.join(__dirname, '../views');

function sendFile(res, name) {
  res.sendFile(path.join(VIEWS, name));
}

// ── Home ──────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const lang = seo.parseLangFromRequest(req);
    seo.sendSeoHtml(res, 'index.html', {
      pageKey: 'home',
      canonical: seo.SITE.url + '/',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: seo.KEYWORD_HUB.home,
      type: 'website',
      lang,
      hreflangPath: '/',
      jsonLd: [seo.websiteSchema(lang), seo.organizationSchema()]
    });
  } catch {
    sendFile(res, 'index.html');
  }
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
      'arusha-national-park': '0.85'
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/safaris', priority: '0.95', changefreq: 'daily' },
      { path: '/group-safaris', priority: '0.95', changefreq: 'daily' },
      { path: '/kilimanjaro', priority: '0.98', changefreq: 'weekly' },
      { path: '/migrations', priority: '0.98', changefreq: 'weekly' },
      { path: '/zanzibar', priority: '0.95', changefreq: 'weekly' },
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

router.get('/safaris', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'safaris.html', {
      pageKey: 'safaris',
      canonical: seo.SITE.url + '/safaris',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: seo.KEYWORD_HUB.safaris,
      h1: 'Tanzania Safari Packages',
      hreflangPath: '/safaris'
    });
  } catch {
    sendFile(res, 'safaris.html');
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
      h1: 'Zanzibar Beach Extensions',
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
        seo.organizationSchema()
      ]
    });
  } catch {
    sendFile(res, 'safari-hub.html');
  }
});

router.get('/safaris/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const db = require('../config/db');
    let row = null;
    try {
      const r = await db.query(`
        SELECT package_name, package_slug, short_description, detailed_description,
               featured_image_url, duration_days, base_price_usd, meta_title, meta_description
        FROM safari_packages
        WHERE package_slug = $1 AND is_active = true
        LIMIT 1
      `, [slug]);
      row = r.rows[0];
    } catch (_) { /* fall through */ }

    const title = (row?.meta_title || (row
      ? `${row.package_name} | ${row.duration_days || ''}-Day Tanzania Safari`
      : 'Tanzania Safari Package | Tours from Arusha')).slice(0, 70);
    const description = row?.meta_description
      || seo.truncate(row?.short_description || row?.detailed_description
        || 'Private Tanzania safari itinerary with expert local guides from Arusha. Serengeti, Ngorongoro & more.', 160);

    seo.sendSeoHtml(res, 'safari-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/safaris/${encodeURIComponent(slug)}`,
      image: row?.featured_image_url || '/images/optimized/serengeti-national-park.webp',
      keywords: `tanzania safari, ${row?.package_name || 'safari package'}, serengeti, ngorongoro, private safari arusha`,
      type: 'product',
      h1: row?.package_name || 'Tanzania Safari Package',
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Safaris', url: '/safaris' },
          { name: row?.package_name || 'Safari', url: `/safaris/${slug}` }
        ])
      ]
    });
  } catch (e) {
    console.error('safari SEO:', e.message);
    sendFile(res, 'safari-detail.html');
  }
});

router.get('/destinations', (req, res) => {
  try {
    seo.sendSeoHtml(res, 'destinations.html', {
      pageKey: 'destinations',
      canonical: seo.SITE.url + '/destinations',
      image: '/images/optimized/balloon.webp',
      keywords: seo.KEYWORD_HUB.destinations,
      h1: 'Tanzania Safari Destinations',
      hreflangPath: '/destinations'
    });
  } catch {
    sendFile(res, 'destinations.html');
  }
});

router.get('/destinations/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const db = require('../config/db');
    let row = null;
    try {
      const r = await db.query(`
        SELECT park_name, park_slug, short_description, detailed_description,
               featured_image_url, meta_title, meta_description
        FROM national_parks
        WHERE park_slug = $1
        LIMIT 1
      `, [slug]);
      row = r.rows[0];
    } catch (_) { /* fall through */ }

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

    seo.sendSeoHtml(res, 'destination-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/destinations/${encodeURIComponent(slug)}`,
      image: row?.featured_image_url || (isKili ? kiliMeta.image : '/images/optimized/serengeti-national-park.webp'),
      keywords: isKili ? kiliMeta.keywords : `${name}, tanzania safari, ${slug.replace(/-/g, ' ')}, wildlife safari arusha`,
      type: 'article',
      h1: isKili ? kiliMeta.h1 : name,
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Destinations', url: '/destinations' },
          { name: isKili ? 'Kilimanjaro National Park' : name, url: `/destinations/${slug}` }
        ])
      ]
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

    const title = (row?.meta_title || row?.post_title || 'Tanzania Safari Guide').slice(0, 70);
    const description = row?.meta_description
      || seo.truncate(row?.post_excerpt || seo.stripHtml(row?.post_content), 160)
      || 'Tanzania safari planning guide from Tanzania Safari Magic in Arusha.';
    const tags = Array.isArray(row?.post_tags) ? row.post_tags.join(', ') : '';

    seo.sendSeoHtml(res, 'blog-detail.html', {
      title,
      description,
      canonical: `${seo.SITE.url}/blog/${encodeURIComponent(slug)}`,
      image: row?.featured_image_url || '/images/optimized/serengeti-national-park.webp',
      keywords: tags || seo.KEYWORD_HUB.blog,
      type: 'article',
      h1: row?.post_title || title,
      jsonLd: [
        seo.breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: row?.post_title || 'Guide', url: `/blog/${slug}` }
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          image: seo.absoluteUrl(row?.featured_image_url),
          author: { '@type': 'Person', name: 'John Raphael Shayo' },
          publisher: {
            '@type': 'Organization',
            name: seo.SITE.name,
            logo: { '@type': 'ImageObject', url: seo.SITE.logo }
          },
          datePublished: row?.published_at || undefined,
          dateModified: row?.updated_at || row?.published_at || undefined,
          mainEntityOfPage: `${seo.SITE.url}/blog/${slug}`
        }
      ]
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
