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

// Email system initialization
const emailService = require('./services/email');
const logger = require('./utils/logger');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Environment Configuration ─────────────────────────────────────
// Instruct Express to trust headers set by Render's reverse proxy (e.g., X-Forwarded-For).
// This is crucial for rate limiting and logging accurate client IPs.
app.set('trust proxy', 1);

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
                "https://tanzania-safari.onrender.com", // Added deployment URL for CSP compatibility
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
        //'http://localhost:3000',
        //'http://localhost:5173',
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
// The 'trust proxy' setting above ensures these limits are applied per client IP.
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
app.use('/api/public', require('./routes/public.routes'));

// ── Health Check Endpoint ───────────────────────────────────────
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  // SMTP status
  try {
    const smtpConnected = await emailService.verifyConnection();
    health.services.smtp = {
      status: smtpConnected ? 'connected' : 'disconnected',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT
    };
  } catch (error) {
    health.services.smtp = {
      status: 'error',
      error: error.message
    };
  }

  // Queue status
  try {
    const queueStats = await emailService.getQueueStats();
    health.services.queue = {
      status: 'connected',
      stats: queueStats
    };
  } catch (error) {
    health.services.queue = {
      status: 'error',
      error: error.message
    };
  }

  // Environment validation
  const envValidation = emailService.validateEnvironment();
  health.services.environment = {
    status: envValidation.valid ? 'valid' : 'invalid',
    missing: envValidation.missing || []
  };

  const overallStatus = Object.values(health.services).every(s => s.status !== 'error');
  health.status = overallStatus ? 'healthy' : 'degraded';

  const statusCode = overallStatus ? 200 : 503;
  res.status(statusCode).json(health);
});

// ── Test Email Endpoint (Development Only) ───────────────────
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/test-email', async (req, res) => {
    try {
      const { to } = req.body;
      if (!to) {
        return res.status(400).json({ success: false, message: 'Email address required' });
      }

      await emailService.sendEmailDirect({
        to,
        subject: 'Test Email — Tanzania Safari Magic',
        html: `
          <div style="padding: 40px; font-family: Arial, sans-serif;">
            <h1 style="color: #C25B2A;">Test Email</h1>
            <p>This is a test email from Tanzania Safari Magic.</p>
            <p>If you received this, the email system is working correctly!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `
      });

      res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
      logger.error({ event: 'test_email_failed', error: error.message }, 'Test email failed');
      res.status(500).json({ success: false, message: error.message });
    }
  });
}

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

// ── Server Startup with SMTP Verification ───────────────────────
async function startServer() {
  try {
    // Run automatic migrations for missing columns
    try {
      const db = require('./config/db');
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255), ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;');
      console.log('Checked/Added reset_token columns on users table.');
    } catch (dbErr) {
      console.warn('Could not run DB column migration:', dbErr.message);
    }

    // Verify SMTP connection on startup
    logger.info({ event: 'server_starting' }, 'Starting server...');
    
    const smtpConnected = await emailService.verifyConnection();
    if (smtpConnected) {
      logger.info({ event: 'smtp_startup_ok' }, 'SMTP connection verified on startup');
    } else {
      logger.warn({ event: 'smtp_startup_failed' }, 'SMTP connection failed on startup, but server will continue');
    }

    // Validate environment
    const envValidation = emailService.validateEnvironment();
    if (!envValidation.valid) {
      logger.warn({ event: 'env_validation_warning', missing: envValidation.missing }, 'Environment validation failed');
    }

    // Start email worker
    logger.info({ event: 'worker_starting' }, 'Starting email worker...');
    // Worker is already started by requiring the module

    app.listen(PORT, () => {
      logger.info({
        event: 'server_started',
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        smtp: smtpConnected ? 'connected' : 'disconnected'
      }, `Server running in ${process.env.NODE_ENV || 'development'} mode at http://localhost:${PORT}`);
      
      console.log(`\nServer running in ${process.env.NODE_ENV || 'development'} mode at http://localhost:${PORT}`);
      console.log(`Admin Panel: http://localhost:${PORT}/admin/login`);
      console.log(`API:         http://localhost:${PORT}/api`);
      console.log(`Health:      http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    logger.error({ event: 'server_startup_failed', error: error.message }, 'Failed to start server');
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info({ event: 'sigterm_received' }, 'SIGTERM received, shutting down gracefully...');
  await emailService.closeQueue();
  await emailService.closeWorker();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info({ event: 'sigint_received' }, 'SIGINT received, shutting down gracefully...');
  await emailService.closeQueue();
  await emailService.closeWorker();
  process.exit(0);
});

startServer();