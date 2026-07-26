const express = require('express');
const router = express.Router();
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';

function sendHtml(res, relativePath) {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(__dirname, relativePath));
}

// Serve HTML pages
router.get('/', (req, res) => {
  sendHtml(res, '../views/index.html');
});

// Generate Sitemap (correct DB column names)
router.get('/sitemap.xml', async (req, res) => {
    try {
        const db = require('../config/db');
        const baseUrl = SITE_URL.replace(/\/$/, '');

        const [packages, destinations, blogs] = await Promise.all([
            db.query('SELECT package_slug AS slug, updated_at FROM safari_packages WHERE is_active = true'),
            db.query('SELECT park_slug AS slug, updated_at FROM national_parks WHERE is_active = true'),
            db.query('SELECT post_slug AS slug, COALESCE(updated_at, published_at) AS updated_at FROM blog_posts WHERE is_published = true')
        ]);

        const today = new Date().toISOString().split('T')[0];
        const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        const staticPages = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/safaris', priority: '0.9', changefreq: 'daily' },
            { path: '/destinations', priority: '0.9', changefreq: 'weekly' },
            { path: '/about', priority: '0.7', changefreq: 'monthly' },
            { path: '/contact', priority: '0.8', changefreq: 'monthly' },
            { path: '/blog', priority: '0.8', changefreq: 'weekly' },
            { path: '/booking', priority: '0.8', changefreq: 'monthly' }
        ];

        staticPages.forEach((page) => {
            xml += `  <url><loc>${escapeXml(baseUrl + (page.path === '/' ? '' : page.path))}</loc><lastmod>${today}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>\n`;
        });

        packages.rows.forEach((pkg) => {
            if (!pkg.slug) return;
            const lastmod = pkg.updated_at ? new Date(pkg.updated_at).toISOString().split('T')[0] : today;
            xml += `  <url><loc>${escapeXml(baseUrl + '/safaris/' + pkg.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
        });

        destinations.rows.forEach((dest) => {
            if (!dest.slug) return;
            const lastmod = dest.updated_at ? new Date(dest.updated_at).toISOString().split('T')[0] : today;
            xml += `  <url><loc>${escapeXml(baseUrl + '/destinations/' + dest.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
        });

        blogs.rows.forEach((blog) => {
            if (!blog.slug) return;
            const lastmod = blog.updated_at ? new Date(blog.updated_at).toISOString().split('T')[0] : today;
            xml += `  <url><loc>${escapeXml(baseUrl + '/blog/' + blog.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('Error generating sitemap:', err);
        // Fallback minimal sitemap so crawlers still get something useful
        const baseUrl = SITE_URL.replace(/\/$/, '');
        const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/safaris</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/destinations</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/contact</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/blog</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
</urlset>`;
        res.header('Content-Type', 'application/xml; charset=utf-8');
        res.status(200).send(fallback);
    }
});

router.get('/robots.txt', (req, res) => {
  const baseUrl = SITE_URL.replace(/\/$/, '');
  res.type('text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /health

Sitemap: ${baseUrl}/sitemap.xml
`);
});

router.get('/safaris', (req, res) => {
  sendHtml(res, '../views/safaris.html');
});

// IMPORTANT: This route must come BEFORE the wildcard route
router.get('/safaris/:slug', (req, res) => {
  sendHtml(res, '../views/safari-detail.html');
});

router.get('/destinations', (req, res) => {
  sendHtml(res, '../views/destinations.html');
});

router.get('/destinations/:slug', (req, res) => {
  sendHtml(res, '../views/destination-detail.html');
});

router.get('/about', (req, res) => {
  sendHtml(res, '../views/about.html');
});

router.get('/contact', (req, res) => {
  sendHtml(res, '../views/contact.html');
});

router.get('/booking', (req, res) => {
  sendHtml(res, '../views/booking.html');
});

router.get('/blog', (req, res) => {
  sendHtml(res, '../views/blog.html');
});

router.get('/blog/:slug', (req, res) => {
  sendHtml(res, '../views/blog-detail.html');
});

// Handle 404 for any other routes - This should be LAST
router.get('*', (req, res) => {
  res.status(404);
  sendHtml(res, '../views/404.html');
});

module.exports = router;
