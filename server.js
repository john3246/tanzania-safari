const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const indexRoutes = require('./routes/index');
const apiRoutes   = require('./routes/api');
const adminRoutes = require('./routes/admin');
const imageRoutes = require('./routes/images');

const app  = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } }));
app.use('/api/bookings', rateLimit({ windowMs: 60 * 60 * 1000, max: 30 }));
app.use('/api/contact', rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }));

// ── Logging ───────────────────────────────────────────────────
app.use(morgan('dev'));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api',        apiRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/images', imageRoutes);

// ── Admin HTML Routes ─────────────────────────────────────────
app.get('/admin/login', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/login.html')));
app.get('/admin', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/index.html')));
app.get('/admin/:page', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/index.html')));

// ── Frontend Routes ───────────────────────────────────────────
app.use('/', indexRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) =>
    res.status(404).sendFile(path.join(__dirname, 'views/404.html')));

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin/login`);
    console.log(`📡 API:         http://localhost:${PORT}/api\n`);
});