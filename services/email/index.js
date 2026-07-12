/**
 * Centralized Email Service
 * 
 * This is the main entry point for all email operations.
 * All controllers and services should import from this file.
 * 
 * @module services/email
 */

const emailService = require('./email.service');
const { queueEmail, getQueueStats, cleanQueue, closeQueue } = require('./queue');
const { emailWorker, closeWorker } = require('./worker');
const { verifyConnection } = require('./transporter');
const { validateEnvironment, rateLimiter } = require('./helpers');

// Re-export all email functions
module.exports = {
  // Core email functions
  ...emailService,
  
  // Queue functions
  queueEmail,
  getQueueStats,
  cleanQueue,
  closeQueue,
  
  // Worker functions
  emailWorker,
  closeWorker,
  
  // Transporter functions
  verifyConnection,
  
  // Helper functions
  validateEnvironment,
  rateLimiter
};
