const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../../utils/logger');

// Redis connection - make optional
let redis = null;
let redisAvailable = false;
let emailQueue = null;
let deadLetterQueue = null;

const redisUrl = process.env.REDIS_URL; // If undefined, queue will be disabled

// Try to connect to Redis, but don't fail if unavailable
if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn({ event: 'redis_retry_failed', attempts: times }, 'Redis connection failed after retries, running without queue');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
      }
    });

    redis.on('error', (err) => {
      if (!redisAvailable) {
        logger.warn({ event: 'redis_error', error: err.message }, 'Redis connection error - running without queue');
      }
    });

    redis.on('connect', () => {
      redisAvailable = true;
      logger.info({ event: 'redis_connected' }, 'Redis connected');
    });

    // Set a timeout to determine if Redis is available
    setTimeout(() => {
      if (!redisAvailable) {
        logger.warn({ event: 'redis_unavailable' }, 'Redis not available - email queue disabled, emails will be sent synchronously');
        redis = null;
      }
    }, 5000);
  } catch (error) {
    logger.warn({ event: 'redis_init_failed', error: error.message }, 'Failed to initialize Redis - running without queue');
  }
} else {
  logger.info({ event: 'redis_disabled' }, 'REDIS_URL not set - running without queue');
}

// Email queue configuration
const QUEUE_NAME = 'email-queue';
const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY) || 5;
const RETRY_ATTEMPTS = parseInt(process.env.QUEUE_RETRY_ATTEMPTS) || 5;
const BACKOFF_MS = parseInt(process.env.QUEUE_BACKOFF_MS) || 5000;

// Create the queue only if Redis is available
if (redis) {
  emailQueue = new Queue(QUEUE_NAME, {
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

  // FIXED: Replace the colon with a hyphen
  deadLetterQueue = new Queue(`${QUEUE_NAME}-dlq`, {
    connection: redis
  });
}
/**
 * Add email to queue
 */
async function queueEmail(jobName, data, options = {}) {
  // If Redis is not available, return null to indicate synchronous sending
  if (!emailQueue) {
    logger.warn({ event: 'queue_unavailable', jobName }, 'Queue not available, email will be sent synchronously');
    return null;
  }

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
    if (deadLetterQueue) {
      await deadLetterQueue.add(jobName, data, {
        attempts: 1,
        removeOnComplete: 1000,
        removeOnFail: 10000
      });
    }

    throw error;
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  if (!emailQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      deadLetterQueue: 0,
      total: 0,
      queueAvailable: false
    };
  }

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount()
    ]);

    const dlqFailed = deadLetterQueue ? await deadLetterQueue.getFailedCount() : 0;

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      deadLetterQueue: dlqFailed,
      total: waiting + active + completed + failed + delayed,
      queueAvailable: true
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
  if (!emailQueue) {
    logger.warn({ event: 'queue_unavailable' }, 'Queue not available, cannot clean');
    return;
  }

  try {
    await emailQueue.clean(grace, 0, 'completed');
    await emailQueue.clean(grace, 0, 'failed');
    if (deadLetterQueue) {
      await deadLetterQueue.clean(grace * 10, 0, 'failed');
    }
    logger.info({ event: 'queue_cleaned' }, 'Queue cleaned successfully');
  } catch (error) {
    logger.error({ event: 'queue_clean_failed', error: error.message }, 'Failed to clean queue');
  }
}

/**
 * Graceful shutdown
 */
async function closeQueue() {
  if (!emailQueue) {
    logger.info({ event: 'queue_not_initialized' }, 'Queue not initialized, nothing to close');
    return;
  }

  try {
    await emailQueue.close();
    if (deadLetterQueue) {
      await deadLetterQueue.close();
    }
    if (redis) {
      await redis.quit();
    }
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
