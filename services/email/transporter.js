const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

// Build transporter configuration from environment variables
const host = process.env.EMAIL_HOST || 'mail.privateemail.com';
const port = parseInt(process.env.EMAIL_PORT, 10) || 587; // default STARTTLS port
const secure = process.env.EMAIL_SECURE === 'true' || Number(port) === 465; // true for SSL (port 465)

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // In development allow self-signed certs
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  pool: true,
  maxConnections: 10,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10
});

// Verify connection on startup - useful for health checks and circuit breaker
async function verifyConnection() {
  try {
    await transporter.verify();
    logger.info({ event: 'smtp_verified', host, port }, 'SMTP connection verified');
    return true;
  } catch (err) {
    logger.error({ event: 'smtp_verify_failed', error: err.message, host, port }, 'SMTP verification failed');
    return false;
  }
}

module.exports = { transporter, verifyConnection };
