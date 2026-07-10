const express = require('express');
const router = express.Router();
const path = require('path');

// Serve HTML pages
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
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