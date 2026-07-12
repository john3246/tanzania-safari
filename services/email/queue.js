const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../../utils/logger');

// Redis connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  enableOfflineQueue: false
});

redis.on('error', (err) => {
  logger.error({ event: 'redis_error', error: err.message }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info({ event: 'redis_connected' }, 'Redis connected');
});

// Email queue configuration
const QUEUE_NAME = 'email-queue';
const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY) || 5;
const RETRY_ATTEMPTS = parseInt(process.env.QUEUE_RETRY_ATTEMPTS) || 5;
const BACKOFF_MS = parseInt(process.env.QUEUE_BACKOFF_MS) || 5000;

// Create the queue
const emailQueue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: RETRY_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: BACKOFF_MS
    },
    removeOnComplete: {
      count: 1000,
      age: 3600 // 1 hour
    },
    removeOnFail: {
      count: 5000,
      age: 86400 // 24 hours
    }
  }
});

// Dead letter queue for failed emails
const deadLetterQueue = new Queue(`${QUEUE_NAME}:dlq`, {
  connection: redis
});

/**
 * Add email to queue
 */
async function queueEmail(jobName, data, options = {}) {
  try {
    const job = await emailQueue.add(jobName, data, {
      ...options,
      removeOnComplete: options.removeOnComplete !== false ? 1000 : false,
      removeOnFail: options.removeOnFail !== false ? 5000 : false
    });

    logger.info({
      event: 'email_queued',
      jobId: job.id,
      jobName,
      to: data.to
    }, 'Email queued successfully');

    return job;
  } catch (error) {
    logger.error({
      event: 'queue_add_failed',
      jobName,
      error: error.message
    }, 'Failed to add email to queue');

    // Add to dead letter queue if queue fails
    await deadLetterQueue.add(jobName, data, {
      attempts: 1,
      removeOnComplete: 1000,
      removeOnFail: 10000
    });

    throw error;
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount()
    ]);

    const dlqFailed = await deadLetterQueue.getFailedCount();

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      deadLetterQueue: dlqFailed,
      total: waiting + active + completed + failed + delayed
    };
  } catch (error) {
    logger.error({ event: 'queue_stats_failed', error: error.message }, 'Failed to get queue stats');
    return null;
  }
}

/**
 * Clean up old jobs
 */
async function cleanQueue(grace = 5000) {
  try {
    await emailQueue.clean(grace, 0, 'completed');
    await emailQueue.clean(grace, 0, 'failed');
    await deadLetterQueue.clean(grace * 10, 0, 'failed');
    logger.info({ event: 'queue_cleaned' }, 'Queue cleaned successfully');
  } catch (error) {
    logger.error({ event: 'queue_clean_failed', error: error.message }, 'Failed to clean queue');
  }
}

/**
 * Graceful shutdown
 */
async function closeQueue() {
  try {
    await emailQueue.close();
    await deadLetterQueue.close();
    await redis.quit();
    logger.info({ event: 'queue_closed' }, 'Queue closed successfully');
  } catch (error) {
    logger.error({ event: 'queue_close_failed', error: error.message }, 'Failed to close queue');
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  logger.info({ event: 'sigterm_received' }, 'SIGTERM received,关闭队列...');
  await closeQueue();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info({ event: 'sigint_received' }, 'SIGINT received,关闭队列...');
  await closeQueue();
  process.exit(0);
});

module.exports = {
  emailQueue,
  deadLetterQueue,
  queueEmail,
  getQueueStats,
  cleanQueue,
  closeQueue,
  redis,
  QUEUE_NAME,
  CONCURRENCY,
  RETRY_ATTEMPTS,
  BACKOFF_MS
};
