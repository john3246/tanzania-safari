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
// Robust Helmet configuration with expanded Content Security Policy
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com"], 
            connectSrc: [
                "'self'", 
                "https://tanzaniasafarimagic.com", 
                "https://www.tanzaniasafarimagic.com",
                "https://tanzania-safari.onrender.com",
                "http://localhost:3000",
                "http://localhost:5173"
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Dynamic CORS configuration supporting multiple environments
const allowedOrigins = process.env.ALLOWED_ORIGIN 
    ? process.env.ALLOWED_ORIGIN.split(',') 
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://tanzaniasafarimagic.com',
        'https://www.tanzaniasafarimagic.com'
      ];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// ── Crawler Fallbacks (Prevent 404 Pollution) ───────────────────
app.get(['/favicon.ico', '/ads.txt', '/app-ads.txt', '/sellers.json'], (req, res) => {
    res.status(204).end();
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api',        apiRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/images', imageRoutes);

// ── Admin HTML Routes ─────────────────────────────────────────
app.get('/admin/login', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/login.html')));
app.get('/admin/register', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/register.html')));
app.get('/admin/reset-password', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/reset-password.html')));
app.get('/admin', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/index.html')));
app.get('/admin/:page', (req, res) =>
    res.sendFile(path.join(__dirname, 'views/admin/index.html')));

// ── Frontend Routes ───────────────────────────────────────────
app.use('/', indexRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) =>
    res.status(404).sendFile(path.join(__dirname, 'views/404.html')));

// ── Centralized Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    // Log the full error internally
    console.error(`[${new Date().toISOString()}] Server Error on ${req.method} ${req.url}:`, err.stack);
    
    // Determine status code
    const statusCode = err.statusCode || 500;
    
    // In production, NEVER leak the stack trace or internal error messages to the client
    const isProd = process.env.NODE_ENV === 'production';
    
    res.status(statusCode).json({
        success: false,
        message: isProd && statusCode === 500 ? 'Internal Server Error' : (err.message || 'Something went wrong!'),
        error: isProd ? undefined : err.stack
    });
});

app.listen(PORT, () => {
    console.log(`\nServer running in ${process.env.NODE_ENV || 'development'} mode at http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin/login`);
    console.log(`API:         http://localhost:${PORT}/api\n`);
});