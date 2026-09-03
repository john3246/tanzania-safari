# Email Troubleshooting Guide

This guide helps diagnose and resolve common email system issues.

## Quick Diagnosis

Start with the health endpoint:

```bash
curl http://localhost:3000/health
```

Check each service status:
- **SMTP**: Should be "connected"
- **Queue**: Should be "connected" with reasonable stats
- **Environment**: Should be "valid" with no missing variables

## Common Issues

### Emails Not Sending

**Symptoms:**
- No emails received
- Queue shows jobs in "waiting" or "failed"
- No error in application logs

**Diagnosis:**
1. Check health endpoint for SMTP status
2. Check queue stats for failed jobs
3. Review logs: `tail -f logs/combined.log`
4. Test SMTP connection manually

**Solutions:**
- Verify SMTP credentials in `.env`
- Check SMTP server is accessible
- Ensure `EMAIL_HOST` and `EMAIL_PORT` are correct
- Verify email address is valid
- Check rate limiting (max 20/min, 200/hour)

### SMTP Connection Failed

**Symptoms:**
- Health endpoint shows SMTP "disconnected" or "error"
- Logs show "SMTP verification failed"
- All emails fail

**Diagnosis:**
```bash
# Test SMTP connection manually
telnet mail.privateemail.com 587
```

**Solutions:**
1. **Wrong Credentials:**
   - Verify `EMAIL_USER` and `EMAIL_PASS`
   - Check email account is active
   - Reset email password if needed

2. **Wrong Host/Port:**
   - Host should be `mail.privateemail.com`
   - Port should be `587` (STARTTLS) or `465` (SSL)
   - Check `EMAIL_SECURE` setting

3. **Network Issues:**
   - Check firewall allows outbound SMTP
   - Verify DNS resolution
   - Test from different network

4. **SSL/TLS Issues:**
   - Set `EMAIL_SECURE=false` for port 587
   - Set `EMAIL_SECURE=true` for port 465
   - Check certificate validity

### Queue Not Processing

**Symptoms:**
- Jobs stuck in "waiting" state
- No jobs in "active" or "completed"
- Worker not starting

**Diagnosis:**
1. Check logs for "worker_starting"
2. Verify Redis connection: `redis-cli ping`
3. Check queue stats in health endpoint

**Solutions:**
1. **Redis Not Running:**
   ```bash
   # Start Redis
   sudo service redis-server start  # Linux
   brew services start redis        # macOS
   ```

2. **Wrong Redis URL:**
   - Verify `REDIS_URL` in `.env`
   - Format: `redis://localhost:6379`
   - Production: Use Render Redis URL

3. **Worker Not Starting:**
   - Check worker is imported in `server.js`
   - Look for worker initialization errors
   - Restart the server

### Rate Limit Exceeded

**Symptoms:**
- Emails rejected with rate limit error
- Logs show "rate_limit_exceeded"
- Some emails send, others don't

**Diagnosis:**
```bash
# Check rate limit settings
echo $EMAIL_MAX_PER_MINUTE
echo $EMAIL_MAX_PER_HOUR
```

**Solutions:**
1. **Wait for rate limit to reset**
2. **Increase limits in `.env`:**
   ```bash
   EMAIL_MAX_PER_MINUTE=50
   EMAIL_MAX_PER_HOUR=500
   ```
3. **Use queue for bulk sends** to spread over time

### Template Not Found

**Symptoms:**
- Error: "Failed to load template"
- Email job fails
- Template rendering error

**Diagnosis:**
1. Check template file exists in `services/email/templates/`
2. Verify template name matches exactly
3. Check file permissions

**Solutions:**
1. **Create missing template:**
   ```bash
   touch services/email/templates/template-name.hbs
   ```
2. **Fix template name** (case-sensitive)
3. **Check file permissions:**
   ```bash
   chmod 644 services/email/templates/*.hbs
   ```

### Environment Variables Missing

**Symptoms:**
- Health endpoint shows environment "invalid"
- Logs show missing variables
- Email service fails to start

**Diagnosis:**
```bash
# Check environment variables
echo $EMAIL_HOST
echo $EMAIL_PORT
echo $EMAIL_USER
echo $EMAIL_PASS
```

**Solutions:**
1. **Add missing variables to `.env`:**
   ```bash
   EMAIL_HOST=mail.privateemail.com
   EMAIL_PORT=587
   EMAIL_USER=info@tanzaniasafarimagic.com
   EMAIL_PASS=your_password
   EMAIL_FROM="Tanzania Safari Magic <info@tanzaniasafarimagic.com>"
   ADMIN_EMAIL=info@tanzaniasafarimagic.com
   ```
2. **Restart server** after changing `.env`

### Circuit Breaker Open

**Symptoms:**
- Jobs delayed but not processed
- Logs show "circuit_breaker_opened"
- SMTP failures in logs

**Diagnosis:**
- Circuit breaker opens after 5 consecutive SMTP failures
- Resets after 1 minute

**Solutions:**
1. **Wait for automatic reset** (1 minute)
2. **Fix underlying SMTP issue**
3. **Restart server** to reset immediately

### Dead Letter Queue Growing

**Symptoms:**
- Many jobs in dead letter queue
- Jobs failing repeatedly
- Queue stats show high "deadLetterQueue" count

**Diagnosis:**
```bash
# Check dead letter queue
redis-cli
LRANGE email-queue:dlq:failed 0 -1
```

**Solutions:**
1. **Identify failure cause** from job data
2. **Fix underlying issue** (SMTP, template, data)
3. **Retry failed jobs** programmatically
4. **Clean old jobs**:
   ```javascript
   await emailService.cleanQueue();
   ```

## Log Analysis

### Key Log Events

**Success Events:**
- `email_queued` - Job added to queue
- `email_processing` - Job being processed
- `email_sent` - Email sent successfully
- `job_completed` - Job completed
- `smtp_verified` - SMTP connection verified

**Error Events:**
- `email_send_failed` - Email send failed
- `job_failed` - Job failed
- `job_moved_to_dlq` - Job moved to dead letter queue
- `smtp_verify_failed` - SMTP verification failed
- `template_load_failed` - Template load failed
- `template_render_failed` - Template render failed
- `rate_limit_exceeded` - Rate limit exceeded
- `circuit_breaker_opened` - Circuit breaker opened

### Viewing Logs

```bash
# All logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Filter for email events
grep "email" logs/combined.log

# Filter for errors
grep "error" logs/combined.log
```

## Testing

### Test SMTP Connection

```bash
# Using telnet
telnet mail.privateemail.com 587

# Using openssl
openssl s_client -connect mail.privateemail.com:465 -starttls smtp
```

### Test Email (Development Only)

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### Test Template Rendering

```javascript
const emailService = require('./services/email');
const html = await emailService.renderTemplate('template-name', data);
console.log(html);
```

### Test Queue

```javascript
const stats = await emailService.getQueueStats();
console.log(stats);
```

## Performance Issues

### Slow Email Sending

**Symptoms:**
- Emails take long to send
- Queue backlog grows
- HTTP requests timeout

**Solutions:**
1. **Increase queue concurrency:**
   ```bash
   QUEUE_CONCURRENCY=10
   ```
2. **Use queued emails** instead of direct sends
3. **Check SMTP server performance**
4. **Monitor Redis performance**

### High Memory Usage

**Symptoms:**
- Server memory high
- Redis memory high
- Slow performance

**Solutions:**
1. **Clean old queue jobs:**
   ```javascript
   await emailService.cleanQueue(1000); // Clean jobs older than 1s
   ```
2. **Reduce job retention** in queue config
3. **Increase Redis memory limit**
4. **Monitor queue size regularly**

## Render-Specific Issues

### Redis Connection Failed on Render

**Symptoms:**
- "Redis connection error" in logs
- Queue not working on Render

**Solutions:**
1. **Create Redis instance** on Render
2. **Add Redis URL** to Render environment variables:
   ```
   REDIS_URL=rediss://default:password@host:port
   ```
3. **Use `rediss://`** for TLS connection
4. **Check Redis dashboard** for connection info

### SMTP Timeout on Render

**Symptoms:**
- SMTP works locally but fails on Render
- Connection timeout errors

**Solutions:**
1. **Check Render outbound network** restrictions
2. **Use correct SMTP settings** for production
3. **Increase timeout** in transporter config
4. **Contact Render support** if needed

## Getting Help

### Information to Collect

When reporting issues, include:
1. Health endpoint output
2. Relevant log excerpts
3. Environment variables (redacted)
4. Steps to reproduce
5. Expected vs actual behavior

### Support Channels

- **Email:** info@tanzaniasafarimagic.com
- **Documentation:** See other EMAIL_*.md files
- **Logs:** Check logs/ directory

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug
```

This provides detailed logging for troubleshooting.
