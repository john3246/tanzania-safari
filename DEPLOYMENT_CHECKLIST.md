# Email System Deployment Checklist

Use this checklist to ensure the email system is properly configured for production deployment on Render.

## Pre-Deployment Checklist

### Environment Variables

- [ ] `EMAIL_HOST=mail.privateemail.com`
- [ ] `EMAIL_PORT=587` (or 465 for SSL)
- [ ] `EMAIL_SECURE=false` (or true for port 465)
- [ ] `EMAIL_USER=info@tanzaniasafarimagic.com`
- [ ] `EMAIL_PASS=<Render Secret>` - Set as Render secret
- [ ] `EMAIL_FROM="Tanzania Safari Magic <info@tanzaniasafarimagic.com>"`
- [ ] `ADMIN_EMAIL=info@tanzaniasafarimagic.com`
- [ ] `ADMIN_URL=https://your-app.onrender.com/admin`
- [ ] `SITE_URL=https://your-app.onrender.com`
- [ ] `REDIS_URL=<Render Redis URL>` - Set from Render Redis instance
- [ ] `QUEUE_CONCURRENCY=5`
- [ ] `QUEUE_RETRY_ATTEMPTS=5`
- [ ] `QUEUE_BACKOFF_MS=5000`
- [ ] `EMAIL_MAX_PER_MINUTE=20`
- [ ] `EMAIL_MAX_PER_HOUR=200`
- [ ] `LOG_LEVEL=info`
- [ ] `NODE_ENV=production`

### Namecheap Configuration

- [ ] Email account created: info@tanzaniasafarimagic.com
- [ ] SMTP password set and recorded
- [ ] SMTP access enabled
- [ ] SPF record configured: `v=spf1 include:privateemail.com ~all`
- [ ] DKIM enabled in Namecheap panel
- [ ] DMARC record configured: `v=DMARC1; p=quarantine; rua=mailto:info@tanzaniasafarimagic.com`

### Render Setup

#### Redis Instance
- [ ] Redis instance created on Render
- [ ] Redis URL copied to environment variables
- [ ] Redis plan appropriate for expected volume
- [ ] Redis region matches application region

#### Application
- [ ] Application created on Render
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Environment variables configured
- [ ] Secrets added (EMAIL_PASS)
- [ ] Health check enabled: `/health`
- [ ] Auto-deploy from GitHub enabled

### Code Verification

- [ ] All dependencies installed (package.json updated)
- [ ] No hardcoded secrets in code
- [ ] Email service centralized in `services/email/`
- [ ] Duplicate email services removed
- [ ] All imports updated to use centralized service
- [ ] Templates exist in `services/email/templates/`
- [ ] Worker properly initialized
- [ ] Graceful shutdown implemented
- [ ] Health endpoint implemented
- [ ] Test endpoint removed/disabled in production

## Deployment Steps

### 1. Prepare Code

```bash
# Commit all changes
git add .
git commit -m "Implement enterprise email system"
git push origin main
```

### 2. Configure Render Secrets

1. Go to Render dashboard
2. Select your application
3. Go to "Environment"
4. Add secret `EMAIL_PASS` with your Namecheap email password
5. Add `REDIS_URL` from your Redis instance

### 3. Deploy

1. Push to trigger auto-deploy
2. Monitor build logs
3. Verify deployment succeeds

### 4. Post-Deployment Verification

#### Health Check

```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "smtp": { "status": "connected" },
    "queue": { "status": "connected" },
    "environment": { "status": "valid" }
  }
}
```

#### Test Email

Send a test email (temporarily enable test endpoint or use API):

```bash
curl -X POST https://your-app.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-personal-email@example.com"}'
```

#### Verify Email Receipt

- Check inbox for test email
- Verify sender address
- Check email content renders correctly
- Verify links work

#### Test Booking Flow

1. Create a test booking via API
2. Verify confirmation email received
3. Verify admin notification received
4. Update booking status
5. Verify status update email received

## Monitoring Setup

### Logs

- [ ] Render logs accessible
- [ ] Log level set to `info` or `warn` in production
- [ ] Error logs monitored regularly
- [ ] Log retention configured

### Metrics to Monitor

- [ ] SMTP connection status
- [ ] Queue size (waiting, active, failed)
- [ ] Email send success rate
- [ ] Rate limit violations
- [ ] Circuit breaker status
- [ ] Redis memory usage
- [ ] Application memory usage

### Alerts

Configure alerts for:
- [ ] SMTP connection failures
- [ ] Queue size > threshold
- [ ] High failure rate
- [ ] Redis connection failures
- [ ] Application errors

## Security Verification

- [ ] Environment variables not exposed in logs
- [ ] Secrets stored as Render secrets
- [ ] HTTPS enforced
- [ ] Admin routes require authentication
- [ ] Test endpoint disabled in production
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] HTML escaping enabled
- [ ] TLS/SSL for SMTP
- [ ] SPF/DKIM/DMARC configured

## Performance Verification

- [ ] Email sending doesn't block HTTP requests
- [ ] Queue processing is responsive
- [ ] No memory leaks
- [ ] Redis connection stable
- [ ] SMTP connection stable
- [ ] Circuit breaker resets correctly

## Backup and Recovery

- [ ] Redis backup configured (Render automatic)
- [ ] Database backup configured
- [ ] Environment variables documented
- [ ] Recovery procedure documented
- [ ] Rollback procedure tested

## Documentation

- [ ] EMAIL_SETUP.md reviewed
- [ ] EMAIL_API.md reviewed
- [ ] EMAIL_QUEUE.md reviewed
- [ ] EMAIL_TEMPLATES.md reviewed
- [ ] EMAIL_SECURITY.md reviewed
- [ ] EMAIL_TROUBLESHOOTING.md reviewed
- [ ] This checklist completed

## Ongoing Maintenance

### Weekly
- [ ] Check email delivery rates
- [ ] Review queue statistics
- [ ] Monitor error logs
- [ ] Verify SMTP connection

### Monthly
- [ ] Review rate limit effectiveness
- [ ] Check template rendering
- [ ] Audit email content
- [ ] Review security logs

### Quarterly
- [ ] Rotate SMTP password
- [ ] Review and update templates
- [ ] Audit environment variables
- [ ] Test backup and recovery

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Disable Email System:**
   - Set `EMAIL_ENABLED=false` (add this flag)
   - Or remove email calls temporarily

3. **Investigate:**
   - Check Render logs
   - Review health endpoint
   - Test SMTP connection manually

4. **Fix and Redeploy:**
   - Fix identified issue
   - Test locally
   - Deploy again

## Contact Information

- **Technical Lead:** [Your Name]
- **Email:** info@tanzaniasafarimagic.com
- **Render Dashboard:** https://dashboard.render.com
- **Namecheap Panel:** https://ap.www.namecheap.com

## Notes

```
Add any deployment-specific notes here:
- Date deployed: ___________
- Deployed by: ___________
- Version: ___________
- Issues encountered: ___________
- Resolution: ___________
```
