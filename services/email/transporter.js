const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

let transporter = null;
let lastConfigKey = '';

function buildFromEnv() {
  const host = process.env.EMAIL_HOST || 'mail.privateemail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const secure = process.env.EMAIL_SECURE === 'true' || Number(port) === 465;
  return {
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    pool: true,
    maxConnections: 10,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10
  };
}

async function loadSmtpFromDb() {
  try {
    const siteSettingsService = require('../SiteSettingsService');
    const rows = await siteSettingsService.getSMTPSettings();
    if (!rows || !rows.length) return null;
    const map = {};
    rows.forEach(r => {
      const k = (r.key || '').replace(/^smtp\./, '');
      map[k] = r.value;
    });
    if (!map.host && !map.user) return null;
    const port = parseInt(map.port, 10) || 587;
    return {
      host: map.host || process.env.EMAIL_HOST,
      port,
      secure: map.secure === 'true' || Number(port) === 465,
      auth: {
        user: map.user || process.env.EMAIL_USER,
        pass: map.pass || process.env.EMAIL_PASS,
      },
      from: map.from,
      admin_email: map.admin_email,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
      pool: true,
      maxConnections: 10,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 10
    };
  } catch (err) {
    logger.warn({ event: 'smtp_db_load_failed', error: err.message }, 'Using env SMTP settings');
    return null;
  }
}

async function getTransporter(forceReload = false) {
  const dbConfig = await loadSmtpFromDb();
  const config = dbConfig || buildFromEnv();
  const key = JSON.stringify({
    host: config.host,
    port: config.port,
    user: config.auth?.user,
    pass: config.auth?.pass ? '***' : ''
  });

  if (!transporter || forceReload || key !== lastConfigKey) {
    lastConfigKey = key;
    transporter = nodemailer.createTransport(config);
    transporter.__smtpMeta = {
      from: config.from || process.env.EMAIL_FROM,
      admin_email: config.admin_email || process.env.ADMIN_EMAIL
    };
  }
  return transporter;
}

// Eager default for modules that import { transporter } synchronously
transporter = nodemailer.createTransport(buildFromEnv());

async function verifyConnection() {
  try {
    const t = await getTransporter(true);
    await t.verify();
    logger.info({ event: 'smtp_verified', host: t.options.host, port: t.options.port }, 'SMTP connection verified');
    return true;
  } catch (err) {
    logger.error({ event: 'smtp_verify_failed', error: err.message }, 'SMTP verification failed');
    return false;
  }
}

module.exports = { transporter, verifyConnection, getTransporter };
