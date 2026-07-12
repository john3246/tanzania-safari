const { Worker } = require('bullmq');
const { emailQueue, deadLetterQueue, redis, CONCURRENCY, RETRY_ATTEMPTS, BACKOFF_MS } = require('./queue');
const { transporter, verifyConnection } = require('./transporter');
const { renderTemplate } = require('./email.service');
const logger = require('../../utils/logger');

// Circuit breaker state
let circuitBreakerOpen = false;
let circuitBreakerTimer = null;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
let failureCount = 0;

/**
 * Reset circuit breaker
 */
function resetCircuitBreaker() {
  circuitBreakerOpen = false;
  failureCount = 0;
  logger.info({ event: 'circuit_breaker_reset' }, 'Circuit breaker reset');
}

/**
 * Open circuit breaker
 */
function openCircuitBreaker() {
  circuitBreakerOpen = true;
  logger.warn({ event: 'circuit_breaker_opened', failureCount }, 'Circuit breaker opened');
  
  if (circuitBreakerTimer) {
    clearTimeout(circuitBreakerTimer);
  }
  
  circuitBreakerTimer = setTimeout(resetCircuitBreaker, CIRCUIT_BREAKER_TIMEOUT);
}

/**
 * Process email job
 */
async function processEmailJob(job) {
  const { to, subject, templateName, templateData } = job.data;

  logger.info({
    event: 'email_processing',
    jobId: job.id,
    jobName: job.name,
    to
  }, 'Processing email job');

  // Check circuit breaker
  if (circuitBreakerOpen) {
    logger.warn({ event: 'circuit_breaker_active', jobId: job.id }, 'Circuit breaker is open, delaying job');
    throw new Error('Circuit breaker is open, retrying later');
  }

  try {
    // Verify SMTP connection
    const isConnected = await verifyConnection();
    if (!isConnected) {
      throw new Error('SMTP connection failed');
    }

    // Render template
    const html = await renderTemplate(templateName, templateData);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Tanzania Safari Magic" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info({
      event: 'email_sent',
      jobId: job.id,
      to,
      subject,
      messageId: info.messageId
    }, 'Email sent successfully');

    // Reset failure count on success
    failureCount = 0;

    return { success: true, messageId: info.messageId };
  } catch (error) {
    failureCount++;

    logger.error({
      event: 'email_send_failed',
      jobId: job.id,
      to,
      error: error.message,
      failureCount
    }, 'Failed to send email');

    // Open circuit breaker if threshold reached
    if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
      openCircuitBreaker();
    }

    throw error;
  }
}

/**
 * Create email worker
 */
const emailWorker = new Worker('email-queue', async (job) => {
  return await processEmailJob(job);
}, {
  connection: redis,
  concurrency: CONCURRENCY,
  limiter: {
    max: parseInt(process.env.EMAIL_MAX_PER_MINUTE) || 20,
    duration: 60000 // 1 minute
  }
});

// Worker event handlers
emailWorker.on('completed', (job) => {
  logger.info({
    event: 'job_completed',
    jobId: job.id,
    jobName: job.name
  }, 'Email job completed');
});

emailWorker.on('failed', (job, err) => {
  logger.error({
    event: 'job_failed',
    jobId: job?.id,
    jobName: job?.name,
    error: err.message,
    attemptsMade: job?.attemptsMade,
    attemptsLeft: RETRY_ATTEMPTS - (job?.attemptsMade || 0)
  }, 'Email job failed');

  // Move to dead letter queue if max retries exceeded
  if (job && job.attemptsMade >= RETRY_ATTEMPTS) {
    deadLetterQueue.add(job.name, job.data, {
      attempts: 1,
      removeOnComplete: 1000,
      removeOnFail: 10000
    }).then(() => {
      logger.warn({
        event: 'job_moved_to_dlq',
        jobId: job.id
      }, 'Job moved to dead letter queue');
    }).catch((err) => {
      logger.error({
        event: 'dlq_move_failed',
        jobId: job.id,
        error: err.message
      }, 'Failed to move job to dead letter queue');
    });
  }
});

emailWorker.on('error', (err) => {
  logger.error({
    event: 'worker_error',
    error: err.message
  }, 'Email worker error');
});

// Graceful shutdown
async function closeWorker() {
  try {
    await emailWorker.close();
    logger.info({ event: 'worker_closed' }, 'Email worker closed');
  } catch (error) {
    logger.error({ event: 'worker_close_failed', error: error.message }, 'Failed to close worker');
  }
}

process.on('SIGTERM', async () => {
  logger.info({ event: 'sigterm_received' }, 'SIGTERM received, closing worker...');
  await closeWorker();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info({ event: 'sigint_received' }, 'SIGINT received, closing worker...');
  await closeWorker();
  process.exit(0);
});

module.exports = {
  emailWorker,
  closeWorker,
  processEmailJob
};
