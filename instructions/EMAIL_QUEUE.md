# Email Queue Documentation

This document explains the BullMQ-based email queue system used for asynchronous email processing.

## Overview

The email queue system uses BullMQ with Redis to process emails asynchronously, preventing email sending from blocking HTTP requests and providing reliability through retries and dead letter queues.

## Architecture

```
HTTP Request → Email Service → BullMQ Queue → Redis → Email Worker → SMTP
                                              ↓
                                      Dead Letter Queue (failed jobs)
```

## Components

### Queue

The main email queue (`email-queue`) holds jobs waiting to be processed.

**Configuration:**
- **Concurrency**: 5 jobs processed simultaneously (configurable via `QUEUE_CONCURRENCY`)
- **Retry Attempts**: 5 (configurable via `QUEUE_RETRY_ATTEMPTS`)
- **Backoff**: Exponential with 5s initial delay (configurable via `QUEUE_BACKOFF_MS`)
- **Job Retention**: Completed jobs kept for 1 hour, failed jobs for 24 hours

### Worker

The email worker processes jobs from the queue.

**Features:**
- Concurrent job processing
- Automatic retry on failure
- Circuit breaker for SMTP failures
- Graceful shutdown handling

### Dead Letter Queue

Failed jobs that exceed retry attempts are moved to the dead letter queue (`email-queue:dlq`) for manual inspection.

## Queue Statistics

Monitor queue health via the health endpoint:

```bash
curl http://localhost:3000/health
```

**Stats include:**
- `waiting` - Jobs waiting to be processed
- `active` - Jobs currently being processed
- `completed` - Successfully completed jobs
- `failed` - Failed jobs (within retry limit)
- `delayed` - Jobs delayed for retry
- `total` - Total jobs in queue

## Job Priority

Jobs can be prioritized:

```javascript
await emailService.sendEmailQueued('job-name', data, { priority: 'high' });
```

- **High priority**: Admin notifications, critical alerts
- **Normal priority**: Customer notifications, newsletters

## Rate Limiting

The queue enforces rate limits:

- **Per minute**: 20 emails (configurable via `EMAIL_MAX_PER_MINUTE`)
- **Per hour**: 200 emails (configurable via `EMAIL_MAX_PER_HOUR`)

Rate limiting is applied per recipient email address.

## Retry Strategy

Jobs are retried with exponential backoff:

```
Attempt 1: Immediate
Attempt 2: 5s delay
Attempt 3: 10s delay
Attempt 4: 20s delay
Attempt 5: 40s delay
```

After 5 failed attempts, the job is moved to the dead letter queue.

## Circuit Breaker

The email worker implements a circuit breaker pattern:

- **Threshold**: 5 consecutive SMTP failures
- **Timeout**: 1 minute
- **Behavior**: When open, new jobs are delayed until the circuit resets

This prevents cascading failures when SMTP is unavailable.

## Graceful Shutdown

The queue and worker shut down gracefully on SIGTERM/SIGINT:

1. Stop accepting new jobs
2. Complete active jobs
3. Close Redis connections
4. Exit cleanly

## Redis Configuration

### Development

```bash
REDIS_URL=redis://localhost:6379
```

### Production (Render)

```bash
REDIS_URL=rediss://default:password@host:port
```

Use Render's managed Redis for production.

## Monitoring

### Logs

Check logs for queue activity:

```bash
tail -f logs/combined.log
```

**Log events:**
- `email_queued` - Job added to queue
- `email_processing` - Job being processed
- `email_sent` - Email sent successfully
- `email_send_failed` - Email send failed
- `job_completed` - Job completed
- `job_failed` - Job failed
- `job_moved_to_dlq` - Job moved to dead letter queue

### Health Endpoint

Monitor queue health:

```bash
curl http://localhost:3000/health | jq '.services.queue'
```

## Manual Queue Management

### Clean Old Jobs

```javascript
await emailService.cleanQueue(5000); // Clean jobs older than 5s
```

### View Dead Letter Queue

Connect to Redis CLI:

```bash
redis-cli
```

```redis
LRANGE email-queue:dlq:failed 0 -1
```

### Retry Failed Jobs

You can retry jobs from the dead letter queue programmatically:

```javascript
const deadLetterQueue = require('./services/email').deadLetterQueue;
const jobs = await deadLetterQueue.getFailed();
for (const job of jobs) {
  await emailQueue.add(job.name, job.data);
  await job.remove();
}
```

## Performance Tuning

### Increase Concurrency

For high-volume systems, increase concurrency:

```bash
QUEUE_CONCURRENCY=10
```

### Adjust Retry Strategy

For faster retries:

```bash
QUEUE_RETRY_ATTEMPTS=3
QUEUE_BACKOFF_MS=2000
```

### Increase Rate Limits

For bulk email campaigns:

```bash
EMAIL_MAX_PER_MINUTE=50
EMAIL_MAX_PER_HOUR=500
```

## Troubleshooting

### Jobs Not Processing

1. Check worker is running: Look for `worker_starting` in logs
2. Verify Redis connection: Check `redis-cli ping`
3. Check queue stats: Look for jobs stuck in `waiting` or `active`

### High Failure Rate

1. Check SMTP connection: Use health endpoint
2. Review error logs: Look for `email_send_failed` events
3. Check circuit breaker status: Look for `circuit_breaker_opened` events

### Memory Issues

1. Reduce job retention time in queue configuration
2. Clean queue more frequently
3. Increase Redis memory limit

## Best Practices

1. **Use queued emails** for non-critical sends
2. **Monitor queue stats** regularly
3. **Clean old jobs** periodically
4. **Set appropriate rate limits** for your volume
5. **Use dead letter queue** for failed job analysis
6. **Test retry strategy** in development
7. **Monitor Redis memory** usage
