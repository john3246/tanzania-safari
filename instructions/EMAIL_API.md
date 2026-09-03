# Email API Documentation

This document describes the email service API for sending emails in the Tanzania Safari Magic application.

## Import

```javascript
const emailService = require('./services/email');
```

## Core Functions

### sendEmailDirect(options)

Send an email directly (synchronous). Use for critical emails that must be sent immediately.

**Parameters:**
- `to` (string) - Recipient email address
- `subject` (string) - Email subject
- `html` (string) - HTML content
- `text` (string, optional) - Plain text content

**Returns:** Promise<{ success: boolean, messageId: string }>

**Example:**
```javascript
await emailService.sendEmailDirect({
  to: 'customer@example.com',
  subject: 'Important Update',
  html: '<p>Your account has been updated.</p>'
});
```

### sendEmailQueued(jobName, data)

Queue an email for async processing. Use for non-critical emails to avoid blocking HTTP requests.

**Parameters:**
- `jobName` (string) - Job identifier
- `to` (string) - Recipient email address
- `subject` (string) - Email subject
- `templateName` (string) - Template file name (without .hbs)
- `templateData` (object) - Data for template rendering
- `priority` (string, optional) - 'normal' or 'high'

**Returns:** Promise<{ success: boolean, jobId: string }>

**Example:**
```javascript
await emailService.sendEmailQueued('booking-confirmation', {
  to: 'customer@example.com',
  subject: 'Booking Confirmed',
  templateName: 'booking-confirmation',
  templateData: { booking: {...} },
  priority: 'high'
});
```

## Booking Emails

### sendBookingConfirmation(booking)

Send booking confirmation email to customer.

**Parameters:**
- `booking` (object) - Booking details with: email, full_name, package_name, start_date, number_of_adults, number_of_children, total_price_usd, booking_reference

**Example:**
```javascript
await emailService.sendBookingConfirmation({
  email: 'customer@example.com',
  full_name: 'John Doe',
  package_name: '7-Day Safari',
  start_date: '2024-06-01',
  number_of_adults: 2,
  number_of_children: 1,
  total_price_usd: 3500,
  booking_reference: 'TS-ABC123'
});
```

### sendBookingApproved(booking)

Send booking approval email to customer.

### sendBookingRejected(booking)

Send booking rejection email to customer.

### sendBookingCancelled(booking)

Send booking cancellation email to customer.

### sendBookingReminder(booking, daysUntil)

Send booking reminder email to customer.

**Parameters:**
- `booking` (object) - Booking details
- `daysUntil` (number) - Days until travel date

### sendBookingCompleted(booking)

Send booking completion email to customer.

## Payment Emails

### sendPaymentSuccess(payment)

Send payment success email to customer.

**Parameters:**
- `payment` (object) - Payment details with: customer_email, customer_name, payment_id, booking_reference, amount, payment_date

### sendPaymentFailed(payment)

Send payment failure email to customer.

### sendRefundInitiated(refund)

Send refund initiation email to customer.

**Parameters:**
- `refund` (object) - Refund details with: customer_email, customer_name, refund_id, booking_reference, amount

### sendRefundCompleted(refund)

Send refund completion email to customer.

## Contact Emails

### sendContactAcknowledgment(enquiry)

Send contact form acknowledgment to customer.

**Parameters:**
- `enquiry` (object) - Enquiry details with: email, full_name, enquiry_id, enquiry_type, enquiry_message, package_name

### sendAdminContactNotification(enquiry)

Send new contact enquiry notification to admin.

### sendAdminBookingNotification(booking)

Send new booking notification to admin.

## Authentication Emails

### sendWelcomeEmail(user)

Send welcome email to new user.

**Parameters:**
- `user` (object) - User details with: email, first_name, last_name

### sendEmailVerification(user, verificationUrl)

Send email verification link to user.

**Parameters:**
- `user` (object) - User details
- `verificationUrl` (string) - Verification URL

### sendPasswordResetEmail(email, resetUrl)

Send password reset link to user.

**Parameters:**
- `email` (string) - User email
- `resetUrl` (string) - Password reset URL

### sendPasswordChanged(email)

Send password changed confirmation to user.

## Newsletter Emails

### sendNewsletterUpdate(subscriberEmail, content)

Send newsletter to subscriber.

**Parameters:**
- `subscriberEmail` (string) - Subscriber email
- `content` (object) - Newsletter content with: subject, featured_post, featured_package

## Admin Alerts

### sendAdminAlert(type, data)

Send admin alert for system issues.

**Parameters:**
- `type` (string) - Alert type: 'smtp_failure', 'queue_failure', 'critical_error'
- `data` (object) - Alert details

## Queue Functions

### getQueueStats()

Get email queue statistics.

**Returns:** Promise<{ waiting, active, completed, failed, delayed, total }>

**Example:**
```javascript
const stats = await emailService.getQueueStats();
console.log('Queue stats:', stats);
```

### cleanQueue(grace)

Clean old jobs from queue.

**Parameters:**
- `grace` (number) - Grace period in milliseconds (default: 5000)

### closeQueue()

Close queue connection gracefully.

### closeWorker()

Close email worker gracefully.

## Helper Functions

### verifyConnection()

Verify SMTP connection.

**Returns:** Promise<boolean>

### validateEnvironment()

Validate required environment variables.

**Returns:** { valid: boolean, missing: string[] }

### rateLimiter.canSend(email)

Check if email can be sent (rate limiting).

**Returns:** { allowed: boolean, reason?: string }

## Health Check

The health endpoint at `/health` provides system status:

```bash
curl http://localhost:3000/health
```

Response includes:
- SMTP connection status
- Queue statistics
- Environment validation
- Overall system health

## Test Email (Development Only)

Send a test email in development mode:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

## Error Handling

All email functions throw errors on failure. Always use try-catch:

```javascript
try {
  await emailService.sendBookingConfirmation(booking);
} catch (error) {
  console.error('Email failed:', error);
  // Handle error gracefully
}
```

## Best Practices

1. **Use queued emails** for non-critical emails to avoid blocking
2. **Use direct emails** only for critical, time-sensitive emails
3. **Always handle errors** - email failures should not break your application
4. **Validate data** before passing to email functions
5. **Use rate limiting** - the system automatically enforces limits
6. **Monitor queue stats** - check for failed jobs regularly
