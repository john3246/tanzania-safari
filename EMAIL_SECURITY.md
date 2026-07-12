# Email Security Documentation

This document outlines the security measures implemented in the email system and best practices for maintaining email security.

## Implemented Security Measures

### Input Validation

All email inputs are validated before processing:

```javascript
// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Data validation
function validateEmailData(to, subject, html) {
  // Validates required fields and data types
}
```

### Header Injection Prevention

Headers are sanitized to prevent injection attacks:

```javascript
function sanitizeInput(input) {
  return input
    .replace(/[\r\n]/g, '')  // Remove newlines
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
    .trim();
}
```

### HTML Escaping

User-generated content is HTML-escaped to prevent XSS:

```javascript
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### Template Injection Prevention

Handlebars templates are pre-compiled and cached. User data is escaped by default unless explicitly marked as safe.

### Secret Redaction

Sensitive data is redacted from logs:

```javascript
const redactSecrets = winston.format((info) => {
  if (info.message) {
    info.message = info.message
      .replace(/password["\s:=]+[^\s"']+/gi, 'password=[REDACTED]')
      .replace(/EMAIL_PASS["\s:=]+[^\s"']+/gi, 'EMAIL_PASS=[REDACTED]')
      .replace(/token["\s:=]+[^\s"']+/gi, 'token=[REDACTED]');
  }
  return info;
});
```

### Rate Limiting

Email sending is rate-limited per recipient:

- **Per minute**: 20 emails
- **Per hour**: 200 emails

This prevents spam and abuse.

### Environment Validation

Required environment variables are validated on startup:

```javascript
function validateEnvironment() {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  // Validates all required variables are set
}
```

### TLS/SSL Encryption

SMTP connections use TLS/SSL encryption:

```javascript
const transporter = nodemailer.createTransport({
  host,
  port,
  secure: process.env.EMAIL_SECURE === 'true' || Number(port) === 465,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});
```

### Circuit Breaker

Circuit breaker prevents cascading failures when SMTP is unavailable.

## Security Best Practices

### Environment Variables

**DO:**
- Store secrets in environment variables
- Use different secrets for development and production
- Rotate secrets regularly
- Use strong, unique passwords

**DON'T:**
- Hardcode secrets in code
- Commit secrets to version control
- Share secrets via email or chat
- Use default or weak passwords

### Email Credentials

**Namecheap Private Email Security:**
1. Use a strong, unique password
2. Enable two-factor authentication if available
3. Regularly change your password
4. Monitor for unauthorized access
5. Use application-specific passwords if supported

### SMTP Configuration

**Production:**
```bash
EMAIL_SECURE=true
EMAIL_PORT=465  # SSL
```

**Development:**
```bash
EMAIL_SECURE=false
EMAIL_PORT=587  # STARTTLS
```

### Redis Security

**Production:**
- Use Redis with authentication
- Use TLS (rediss://) for connections
- Restrict Redis access via firewall
- Use Render's managed Redis (includes security)

**Development:**
- Redis can run without authentication locally
- Don't expose Redis port to public internet

### Content Security

**Email Content:**
- Never include sensitive data in email bodies
- Use secure links (HTTPS)
- Validate all user-generated content
- Sanitize HTML in templates
- Avoid JavaScript in emails (not supported anyway)

**Links:**
- Use absolute URLs
- Include tracking parameters only if necessary
- Use HTTPS for all links
- Validate redirect URLs

### Access Control

**Admin Endpoints:**
- All admin routes require authentication
- Use JWT tokens with expiration
- Implement role-based access control
- Log all admin actions

**Test Email Endpoint:**
- Only available in development mode
- Removed in production builds

## Threat Mitigation

### Phishing Protection

1. **Brand Consistency:** All emails use consistent branding
2. **No Suspicious Links:** All links point to official domains
3. **Clear Sender Info:** From address matches domain
4. **No Urgency Tactics:** Avoid creating false urgency

### Spam Prevention

1. **Rate Limiting:** Enforced per recipient
2. **Opt-in Only:** Only send to subscribers who opted in
3. **Unsubscribe Links:** Include in all marketing emails
4. **SPF/DKIM/DMARC:** Configure email authentication (see below)

### Data Protection

1. **Minimize Data:** Only include necessary information
2. **No PII in Subject:** Keep subjects generic
3. **Secure Storage:** Encrypt sensitive data at rest
4. **Retention Policy:** Delete old emails/queue jobs

## Email Authentication (SPF, DKIM, DMARC)

### SPF (Sender Policy Framework)

Add SPF record to your DNS:

```txt
v=spf1 include:privateemail.com ~all
```

**Setup:**
1. Log in to Namecheap
2. Go to Domain List > Advanced DNS
3. Add TXT record
4. Name: `@`
5. Value: `v=spf1 include:privateemail.com ~all`
6. TTL: 3600

### DKIM (DomainKeys Identified Mail)

Namecheap Private Email handles DKIM automatically. Verify in your email settings.

### DMARC (Domain-based Message Authentication)

Add DMARC record to your DNS:

```txt
v=DMARC1; p=quarantine; rua=mailto:info@tanzaniasafarimagic.com
```

**Setup:**
1. Log in to Namecheap
2. Go to Domain List > Advanced DNS
3. Add TXT record
4. Name: `_dmarc`
5. Value: `v=DMARC1; p=quarantine; rua=mailto:info@tanzaniasafarimagic.com`
6. TTL: 3600

**DMARC Policies:**
- `p=none` - Monitor only (start here)
- `p=quarantine` - Mark suspicious emails
- `p=reject` - Reject failing emails (after monitoring)

## Monitoring and Auditing

### Log Monitoring

Monitor logs for:
- Unusual email volumes
- Failed authentication attempts
- Rate limit violations
- Template rendering errors
- SMTP connection failures

### Security Alerts

The system sends admin alerts for:
- SMTP connection failures
- Queue failures
- Critical errors

### Regular Audits

Perform regular security audits:
- Review environment variables
- Check for hardcoded secrets
- Verify rate limit effectiveness
- Audit email templates for XSS
- Review access logs

## Compliance

### GDPR Considerations

1. **Consent:** Only send emails with user consent
2. **Right to Opt-out:** Include unsubscribe links
3. **Data Minimization:** Collect only necessary data
4. **Right to Delete:** Provide data deletion on request
5. **Data Portability:** Allow users to export their data

### CAN-SPAM Compliance

1. **Clear Subject Lines:** Accurate, not misleading
2. **Opt-out Mechanism:** Easy to unsubscribe
3. **Physical Address:** Include in footer
4. **Honoring Opt-outs:** Process within 10 days
5. **No Deceptive Content:** Honest, transparent

## Incident Response

### Email Breach Response

1. **Identify:** Determine scope and impact
2. **Contain:** Change credentials, stop email sends
3. **Notify:** Inform affected users
4. **Investigate:** Review logs, identify root cause
5. **Remediate:** Fix vulnerabilities, update processes
6. **Document:** Record incident and response

### Reporting Security Issues

Report security issues to:
- Email: info@tanzaniasafarimagic.com
- Include: Description, steps to reproduce, impact

## Security Checklist

- [ ] Environment variables are set and not hardcoded
- [ ] SMTP uses TLS/SSL encryption
- [ ] Rate limiting is configured
- [ ] Input validation is implemented
- [ ] HTML escaping is enabled
- [ ] Secrets are redacted from logs
- [ ] SPF record is configured
- [ ] DKIM is enabled
- [ ] DMARC record is configured
- [ ] Redis uses authentication in production
- [ ] Admin routes require authentication
- [ ] Test endpoint is disabled in production
- [ ] Logs are monitored regularly
- [ ] Security audits are performed regularly
- [ ] Incident response plan is documented
