# Email System Setup Guide

This guide explains how to configure and set up the email system for Tanzania Safari Magic using Namecheap Private Email.

## Prerequisites

- Node.js 18+ installed
- Namecheap Private Email account
- Redis instance (production) or Redis running locally (development)
- PostgreSQL database

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@tanzaniasafarimagic.com
EMAIL_PASS=your_email_password
EMAIL_FROM="Tanzania Safari Magic <info@tanzaniasafarimagic.com>"
ADMIN_EMAIL=info@tanzaniasafarimagic.com
ADMIN_URL=http://localhost:3000/admin
SITE_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
QUEUE_CONCURRENCY=5
QUEUE_RETRY_ATTEMPTS=5
QUEUE_BACKOFF_MS=5000
EMAIL_MAX_PER_MINUTE=20
EMAIL_MAX_PER_HOUR=200
LOG_LEVEL=info
```

## Namecheap Private Email Configuration

### SMTP Settings

- **Host**: `mail.privateemail.com`
- **Port**: `587` (STARTTLS) or `465` (SSL)
- **Authentication**: Required
- **Username**: Your full email address (e.g., `info@tanzaniasafarimagic.com`)
- **Password**: Your email password

### Getting Your Email Password

1. Log in to your Namecheap account
2. Go to "Domain List" > "Private Email"
3. Click "Manage" next to your email account
4. Go to "Mail Settings" > "Mailbox Configuration"
5. Your password is the one you set when creating the mailbox

### IMAP Settings (for reference)

- **Host**: `mail.privateemail.com`
- **Port**: `993`
- **SSL**: Yes

### POP3 Settings (for reference)

- **Host**: `mail.privateemail.com`
- **Port**: `995`
- **SSL**: Yes

## Redis Setup

### Development

Install Redis locally:

```bash
# Windows (using WSL)
sudo apt-get install redis-server
sudo service redis-server start

# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

### Production (Render)

1. Go to your Render dashboard
2. Create a new Redis instance
3. Copy the Redis URL to your environment variables
4. Update `REDIS_URL` in your Render environment variables

## Installation

1. Install required dependencies:

```bash
npm install
```

The following packages are included for the email system:
- `nodemailer` - Email sending
- `handlebars` - Template engine
- `bullmq` - Job queue
- `ioredis` - Redis client
- `winston` - Logging

## Verification

Start the server and verify the email system:

```bash
npm start
```

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "services": {
    "smtp": {
      "status": "connected",
      "host": "mail.privateemail.com",
      "port": "587"
    },
    "queue": {
      "status": "connected",
      "stats": {
        "waiting": 0,
        "active": 0,
        "completed": 0,
        "failed": 0,
        "delayed": 0,
        "total": 0
      }
    },
    "environment": {
      "status": "valid",
      "missing": []
    }
  }
}
```

## Testing (Development Only)

Send a test email:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

## Troubleshooting

### SMTP Connection Failed

- Verify your email credentials are correct
- Check that `EMAIL_HOST` and `EMAIL_PORT` are set correctly
- Ensure your email account allows SMTP access
- Check firewall settings

### Redis Connection Failed

- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Verify `REDIS_URL` is correct
- Check Redis authentication if required

### Emails Not Sending

- Check the logs in `logs/combined.log` and `logs/error.log`
- Verify queue stats via health endpoint
- Check rate limiting settings
- Ensure email templates exist in `services/email/templates/`

## Next Steps

- Read [EMAIL_API.md](EMAIL_API.md) for API usage
- Read [EMAIL_QUEUE.md](EMAIL_QUEUE.md) for queue configuration
- Read [EMAIL_TEMPLATES.md](EMAIL_TEMPLATES.md) for template customization
- Read [EMAIL_SECURITY.md](EMAIL_SECURITY.md) for security best practices
