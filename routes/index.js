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
        const baseUrl = 'https://tanzaniasafarimagic.com';
        
        const packages = await db.query('SELECT slug FROM safari_packages WHERE is_active = true');
        const destinations = await db.query('SELECT slug FROM national_parks');
        const blogs = await db.query('SELECT slug FROM blog_posts WHERE status = $1', ['published']);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Static Pages
        const staticPages = ['', '/safaris', '/destinations', '/about', '/contact', '/blog'];
        staticPages.forEach(page => {
            xml += `<url><loc>${baseUrl}${page}</loc><changefreq>weekly</changefreq><priority>${page === '' ? '1.0' : '0.8'}</priority></url>`;
        });

        // Dynamic Safaris
        packages.rows.forEach(pkg => {
            xml += `<url><loc>${baseUrl}/safaris/${pkg.slug}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`;
        });

        // Dynamic Destinations
        destinations.rows.forEach(dest => {
            xml += `<url><loc>${baseUrl}/destinations/${dest.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
        });

        // Dynamic Blogs
        blogs.rows.forEach(blog => {
            xml += `<url><loc>${baseUrl}/blog/${blog.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Error generating sitemap:', err);
        res.status(500).end();
    }
});

router.get('/safaris', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/safaris.html'));
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