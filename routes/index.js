const express = require('express');
const router = express.Router();
const path = require('path');

// Serve HTML pages
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Generate Sitemap
router.get('/sitemap.xml', async (req, res) => {
    try {
        const db = require('../config/db');
        const baseUrl = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';

        const urlEntry = (loc, { changefreq = 'weekly', priority = '0.8', lastmod } = {}) => {
            let xml = `<url><loc>${baseUrl}${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority>`;
            if (lastmod) xml += `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>`;
            xml += `</url>`;
            return xml;
        };

        // Packages — try package_slug first, fall back to slug
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

        // Destinations with at least one package preferred; still list active parks
        let destinations = { rows: [] };
        try {
            destinations = await db.query(
                `SELECT park_slug AS slug, updated_at FROM national_parks
                 WHERE is_active = true AND park_slug IS NOT NULL`
            );
        } catch (_) {
            destinations = await db.query(
                `SELECT slug, updated_at FROM national_parks WHERE slug IS NOT NULL`
            );
        }

        // Blog posts — is_published is the live column
        let blogs = { rows: [] };
        try {
            blogs = await db.query(
                `SELECT post_slug AS slug, updated_at, published_at
                 FROM blog_posts
                 WHERE is_published = true AND post_slug IS NOT NULL`
            );
        } catch (_) {
            try {
                blogs = await db.query(
                    `SELECT slug, updated_at FROM blog_posts WHERE status = 'published'`
                );
            } catch (__) {
                blogs = { rows: [] };
            }
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        const staticPages = [
            { path: '', priority: '1.0', changefreq: 'daily' },
            { path: '/safaris', priority: '0.95', changefreq: 'daily' },
            { path: '/group-safaris', priority: '0.95', changefreq: 'daily' },
            { path: '/kilimanjaro', priority: '0.9', changefreq: 'weekly' },
            { path: '/migrations', priority: '0.9', changefreq: 'weekly' },
            { path: '/zanzibar', priority: '0.9', changefreq: 'weekly' },
            { path: '/destinations', priority: '0.9', changefreq: 'weekly' },
            { path: '/booking', priority: '0.9', changefreq: 'monthly' },
            { path: '/about', priority: '0.7', changefreq: 'monthly' },
            { path: '/contact', priority: '0.85', changefreq: 'monthly' },
            { path: '/blog', priority: '0.75', changefreq: 'weekly' }
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
        } catch (_) { /* table may not exist until migration */ }

        destinations.rows.forEach(dest => {
            if (!dest.slug) return;
            xml += urlEntry(`/destinations/${dest.slug}`, {
                priority: '0.8',
                changefreq: 'monthly',
                lastmod: dest.updated_at
            });
        });

        blogs.rows.forEach(blog => {
            if (!blog.slug) return;
            xml += urlEntry(`/blog/${blog.slug}`, {
                priority: '0.7',
                changefreq: 'monthly',
                lastmod: blog.updated_at || blog.published_at
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

router.get('/thank-you', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/thank-you.html'));
});

router.get('/safaris', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/safaris.html'));
});

router.get('/group-safaris', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/group-safaris.html'));
});

router.get('/group-safaris/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/group-safari-detail.html'));
});

router.get(['/kilimanjaro', '/migrations', '/zanzibar'], (req, res) => {
  res.sendFile(path.join(__dirname, '../views/safari-hub.html'));
});

// IMPORTANT: This route must come BEFORE the wildcard route
router.get('/safaris/:slug', (req, res) => {
  console.log('Serving safari detail page for slug:', req.params.slug);
  res.sendFile(path.join(__dirname, '../views/safari-detail.html'));
});

router.get('/destinations', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/destinations.html'));
});

// Add this after the destinations listing route
router.get('/destinations/:slug', (req, res) => {
    console.log('Serving destination detail page for slug:', req.params.slug);
    res.sendFile(path.join(__dirname, '../views/destination-detail.html'));
});
router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/about.html'));
});

router.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/contact.html'));
});

router.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/booking.html'));
});

router.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/blog.html'));
});

router.get('/blog/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/blog-detail.html'));
});
// Handle 404 for any other routes - This should be LAST
router.get('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).sendFile(path.join(__dirname, '../views/404.html'));
});


module.exports = router;