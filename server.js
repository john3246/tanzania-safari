const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const indexRoutes = require('./routes/index');
const apiRoutes   = require('./routes/api');
const adminRoutes = require('./routes/admin');
const imageRoutes = require('./routes/images');

// Email system initialization
const emailService = require('./services/email');
const logger = require('./utils/logger');

const app  = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ── Performance Optimization ──────────────────────────────────
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// ── Environment Configuration ─────────────────────────────────────
// Instruct Express to trust headers set by Render's reverse proxy (e.g., X-Forwarded-For).
// This is crucial for rate limiting and logging accurate client IPs.
app.set('trust proxy', 1);

// Apex host canonicalization (www → non-www) — avoids duplicate ranking signals
app.use((req, res, next) => {
    const host = (req.hostname || '').toLowerCase();
    if (host === 'www.tanzaniasafarimagic.com') {
        const target = `https://tanzaniasafarimagic.com${req.originalUrl || '/'}`;
        return res.redirect(301, target);
    }
    next();
});

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security ──────────────────────────────────────────────────
// Render assigns its own external hostname; the chat widget needs it whitelisted
// for WebSocket upgrades in addition to the fixed production domains.
const renderExternalHost = process.env.RENDER_EXTERNAL_URL
    ? process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')
    : null;
const renderConnectSrc = renderExternalHost
    ? [renderExternalHost, renderExternalHost.replace(/^https:/, 'wss:')]
    : [];

// Robust Helmet configuration with expanded Content Security Policy
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"], 
            connectSrc: [
                "'self'", 
                "https://cdn.jsdelivr.net",
                "https://tanzaniasafarimagic.com", 
                "https://www.tanzaniasafarimagic.com",
                "https://tanzania-safari.onrender.com",
                "http://localhost:3000",
                "http://localhost:5173",
                "ws://localhost:3000",
                "wss://localhost:3000",
                "wss://tanzania-safari.onrender.com",
                "wss://tanzaniasafarimagic.com",
                "wss://www.tanzaniasafarimagic.com",
                ...renderConnectSrc
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "data:", "https://ka-f.fontawesome.com"],
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

// ── Static files with Aggressive Caching ──────────────────────────────────────────────
const cacheOptions = {
    maxAge: '30d',
    etag: true
};
app.use(express.static(path.join(__dirname, 'public'), cacheOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), cacheOptions));

// ── Crawler Fallbacks (Prevent 404 Pollution) ───────────────────
app.get('/favicon.ico', (req, res) => {
    res.redirect(301, '/images/logo.png');
});
app.get(['/ads.txt', '/app-ads.txt', '/sellers.json'], (req, res) => {
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
    node: process.version,
    render: {
      service: process.env.RENDER_SERVICE_NAME || null,
      instance: process.env.RENDER_INSTANCE_ID || null,
      region: process.env.RENDER_REGION || null,
      gitCommit: (process.env.RENDER_GIT_COMMIT || '').slice(0, 8) || null,
      isRender: Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID)
    },
    services: {}
  };

  // Database
  try {
    const db = require('./config/db');
    const t0 = Date.now();
    await db.query('SELECT 1 AS ok');
    health.services.database = {
      status: 'connected',
      latencyMs: Date.now() - t0
    };
  } catch (error) {
    health.services.database = {
      status: 'error',
      error: error.message
    };
  }

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

  // Redis (optional)
  if (process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 2000, lazyConnect: true });
      await redis.connect();
      const pong = await redis.ping();
      await redis.quit();
      health.services.redis = { status: pong === 'PONG' ? 'connected' : 'error' };
    } catch (error) {
      health.services.redis = { status: 'error', error: error.message };
    }
  } else {
    health.services.redis = { status: 'not_configured' };
  }

  // Environment validation
  const envValidation = emailService.validateEnvironment();
  health.services.environment = {
    status: envValidation.valid ? 'valid' : 'invalid',
    missing: envValidation.missing || []
  };

  const criticalOk = health.services.database?.status === 'connected';
  const overallStatus = criticalOk && Object.values(health.services).every(s =>
    s.status !== 'error' || s.status === 'not_configured'
  );
  // Degraded if non-critical services fail; unhealthy if DB down
  if (!criticalOk) {
    health.status = 'unhealthy';
  } else if (!overallStatus) {
    health.status = 'degraded';
  } else {
    health.status = 'healthy';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
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
app.get(['/admin', '/admin/*'], (req, res) =>
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

// ── Live Chat (Socket.io) ─────────────────────────────────────
const { initChatSocket, setupRedisAdapter } = require('./socket/chatHandler');

// The chat widget is always served from the same origin as this server, so the
// socket allowlist must cover every host the site is reachable on, independent
// of ALLOWED_ORIGIN (which may be narrowed for the REST API).
const socketAllowedOrigins = new Set([
    ...allowedOrigins,
    'https://tanzaniasafarimagic.com',
    'https://www.tanzaniasafarimagic.com',
    'https://tanzania-safari.onrender.com',
    'http://localhost:3000'
]);

if (process.env.RENDER_EXTERNAL_URL) {
    socketAllowedOrigins.add(process.env.RENDER_EXTERNAL_URL.replace(/\/$/, ''));
}

const io = socketIo(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || socketAllowedOrigins.has(origin) || process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

initChatSocket(io);

// ── Server Startup with SMTP Verification ───────────────────────
async function startServer() {
  try {
    // Run automatic migrations for missing columns
    try {
      const db = require('./config/db');
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255), ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;');
      
      // Auto-create media_library table if missing
      const mediaLibraryQuery = `
      CREATE TABLE IF NOT EXISTS media_library (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_filename VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100),
          file_size BIGINT,
          path TEXT,
          url TEXT,
          thumbnail_url TEXT,
          webp_url TEXT,
          alt_text VARCHAR(255),
          caption TEXT,
          folder VARCHAR(255) DEFAULT 'root',
          tags JSONB DEFAULT '[]',
          entity_type VARCHAR(100),
          entity_id INTEGER,
          uploaded_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
      );`;
      await db.query(mediaLibraryQuery);
      console.log('Checked/Added reset_token columns and media_library table.');
    } catch (dbErr) {
      console.warn('Could not run DB migrations:', dbErr.message);
    }

    // Verify SMTP connection on startup
    logger.info({ event: 'server_starting' }, 'Starting server...');
    
    const smtpConnected = await emailService.verifyConnection();
    if (smtpConnected) {
      logger.info({ event: 'smtp_startup_ok' }, 'SMTP connection verified on startup');
    } else {
      logger.warn({ event: 'smtp_startup_failed' }, 'SMTP connection failed on startup, but server will continue');
    }

    // Auto-run DB migrations on startup (crucial for Render production DB)
    try {
      const runMigrations = require('./run_migration');
      await runMigrations();
    } catch (migErr) {
      logger.warn({ event: 'migration_warning', error: migErr.message }, 'Migration skipped or failed');
    }

    // Socket.io Redis adapter for multi-instance (optional)
    await setupRedisAdapter(io);

    // Validate environment
    const envValidation = emailService.validateEnvironment();
    if (!envValidation.valid) {
      logger.warn({ event: 'env_validation_warning', missing: envValidation.missing }, 'Environment validation failed');
    }

    // Start email worker
    logger.info({ event: 'worker_starting' }, 'Starting email worker...');
    // Worker is already started by requiring the module

    server.listen(PORT, () => {
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