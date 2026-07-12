const { body, validationResult } = require('express-validator');
const logger = require('../../utils/logger');

/**
 * Email validation using regex
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize input to prevent header injection
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove newlines and carriage returns to prevent header injection
  return input
    .replace(/[\r\n]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate email data before sending
 */
function validateEmailData(to, subject, html) {
  const errors = [];

  if (!to || !isValidEmail(to)) {
    errors.push('Invalid recipient email');
  }

  if (!subject || typeof subject !== 'string' || subject.length === 0) {
    errors.push('Subject is required');
  }

  if (!html || typeof html !== 'string' || html.length === 0) {
    errors.push('HTML content is required');
  }

  if (errors.length > 0) {
    logger.error({ event: 'email_validation_failed', errors }, 'Email data validation failed');
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Rate limiter for email sending (in-memory)
 */
class EmailRateLimiter {
  constructor(maxPerMinute = 20, maxPerHour = 200) {
    this.maxPerMinute = maxPerMinute;
    this.maxPerHour = maxPerHour;
    this.requests = new Map();
  }

  canSend(email) {
    const now = Date.now();
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;

    if (!this.requests.has(email)) {
      this.requests.set(email, []);
    }

    const timestamps = this.requests.get(email);
    
    // Remove old timestamps
    const recent = timestamps.filter(t => t > minuteAgo);
    const hourly = timestamps.filter(t => t > hourAgo);

    if (recent.length >= this.maxPerMinute) {
      logger.warn({ event: 'rate_limit_exceeded', email, limit: 'minute' }, 'Email rate limit exceeded (minute)');
      return { allowed: false, reason: 'Too many emails in the last minute' };
    }

    if (hourly.length >= this.maxPerHour) {
      logger.warn({ event: 'rate_limit_exceeded', email, limit: 'hour' }, 'Email rate limit exceeded (hour)');
      return { allowed: false, reason: 'Too many emails in the last hour' };
    }

    timestamps.push(now);
    this.requests.set(email, timestamps);

    return { allowed: true };
  }

  cleanup() {
    const now = Date.now();
    const hourAgo = now - 3600000;

    for (const [email, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => t > hourAgo);
      if (recent.length === 0) {
        this.requests.delete(email);
      } else {
        this.requests.set(email, recent);
      }
    }
  }
}

const rateLimiter = new EmailRateLimiter(
  parseInt(process.env.EMAIL_MAX_PER_MINUTE) || 20,
  parseInt(process.env.EMAIL_MAX_PER_HOUR) || 200
);

// Cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);

/**
 * Environment validation
 */
function validateEnvironment() {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missing = [];

  for (const env of required) {
    if (!process.env[env]) {
      missing.push(env);
    }
  }

  if (missing.length > 0) {
    logger.error({ event: 'env_validation_failed', missing }, 'Missing required environment variables');
    return { valid: false, missing };
  }

  // Validate port
  const port = parseInt(process.env.EMAIL_PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    logger.error({ event: 'env_validation_failed', port }, 'Invalid EMAIL_PORT');
    return { valid: false, missing: ['EMAIL_PORT (invalid)'] };
  }

  return { valid: true };
}

module.exports = {
  isValidEmail,
  sanitizeInput,
  escapeHtml,
  validateEmailData,
  rateLimiter,
  validateEnvironment,
  validationResult
};
