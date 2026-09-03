# Email Templates Documentation

This document describes the Handlebars email templates used in the Tanzania Safari Magic application.

## Template Structure

```
services/email/templates/
├── layouts/
│   └── main.hbs           # Main layout wrapper
├── booking-confirmation.hbs
├── booking-approved.hbs
├── booking-rejected.hbs
├── booking-cancelled.hbs
├── booking-reminder.hbs
├── booking-completed.hbs
├── payment-success.hbs
├── payment-failed.hbs
├── refund-initiated.hbs
├── refund-completed.hbs
├── contact-confirmation.hbs
├── admin-contact-notification.hbs
├── admin-booking-notification.hbs
├── admin-alert.hbs
├── welcome.hbs
├── email-verification.hbs
├── password-reset.hbs
├── password-changed.hbs
└── newsletter.hbs
```

## Layout System

### Main Layout (`layouts/main.hbs`)

The main layout provides:
- Responsive design
- Brand styling (Tanzania Safari Magic colors)
- Header section
- Body content area
- Footer section
- Mobile optimization

**Usage:**
```javascript
await emailService.renderTemplate('template-name', data, 'main');
```

**Data structure:**
```javascript
{
  subject: 'Email Subject',
  header: {
    title: 'Header Title',
    subtitle: 'Header Subtitle'
  },
  body: 'HTML content',
  footer: 'Custom footer HTML (optional)'
}
```

## Template Helpers

### formatDate

Format a date string to a readable format.

```handlebars
{{formatDate date_field}}
```

**Example:** `June 1, 2024`

### formatPrice

Format a price number with commas.

```handlebars
{{formatPrice price_field}}
```

**Example:** `3,500`

### if

Conditional rendering.

```handlebars
{{#if condition}}
  Content if true
{{else}}
  Content if false
{{/if}}
```

## Booking Templates

### Booking Confirmation

**Template:** `booking-confirmation.hbs`

**Purpose:** Confirm booking receipt to customer

**Data fields:**
- `full_name` - Customer name
- `booking_reference` - Booking ID
- `package_name` - Safari package name
- `start_date` - Travel date
- `number_of_adults` - Adult count
- `number_of_children` - Child count (optional)
- `total_price_usd` - Total price

**Usage:**
```javascript
await emailService.sendBookingConfirmation(booking);
```

### Booking Approved

**Template:** `booking-approved.hbs`

**Purpose:** Notify customer of booking approval

**Data fields:** Same as booking confirmation

### Booking Rejected

**Template:** `booking-rejected.hbs`

**Purpose:** Notify customer of booking rejection

**Data fields:** Same as booking confirmation

### Booking Cancelled

**Template:** `booking-cancelled.hbs`

**Purpose:** Confirm booking cancellation to customer

**Data fields:** Same as booking confirmation

### Booking Reminder

**Template:** `booking-reminder.hbs`

**Purpose:** Send reminder before travel date

**Data fields:** Same as booking confirmation + `days_until`

**Usage:**
```javascript
await emailService.sendBookingReminder(booking, daysUntil);
```

### Booking Completed

**Template:** `booking-completed.hbs`

**Purpose:** Thank customer after safari completion

**Data fields:** Same as booking confirmation

## Payment Templates

### Payment Success

**Template:** `payment-success.hbs`

**Purpose:** Confirm successful payment

**Data fields:**
- `customer_name` - Customer name
- `payment_id` - Payment ID
- `booking_reference` - Booking reference
- `amount` - Payment amount
- `payment_date` - Payment date

### Payment Failed

**Template:** `payment-failed.hbs`

**Purpose:** Notify of payment failure

**Data fields:** Same as payment success

### Refund Initiated

**Template:** `refund-initiated.hbs`

**Purpose:** Notify of refund initiation

**Data fields:**
- `customer_name` - Customer name
- `refund_id` - Refund ID
- `booking_reference` - Booking reference
- `amount` - Refund amount

### Refund Completed

**Template:** `refund-completed.hbs`

**Purpose:** Confirm refund completion

**Data fields:** Same as refund initiated

## Contact Templates

### Contact Confirmation

**Template:** `contact-confirmation.hbs`

**Purpose:** Acknowledge contact form submission

**Data fields:**
- `full_name` - Customer name
- `enquiry_id` - Enquiry ID
- `enquiry_type` - Type of enquiry
- `package_name` - Package (optional)
- `enquiry_message` - Message content

### Admin Contact Notification

**Template:** `admin-contact-notification.hbs`

**Purpose:** Notify admin of new enquiry

**Data fields:** Same as contact confirmation + `admin_url`

### Admin Booking Notification

**Template:** `admin-booking-notification.hbs`

**Purpose:** Notify admin of new booking

**Data fields:**
- `booking_id` - Booking ID
- `booking_reference` - Booking reference
- `full_name` - Customer name
- `email` - Customer email
- `phone` - Phone (optional)
- `package_name` - Package name
- `start_date` - Travel date
- `number_of_adults` - Adult count
- `number_of_children` - Child count (optional)
- `total_price_usd` - Total price
- `admin_url` - Admin dashboard URL

## Authentication Templates

### Welcome Email

**Template:** `welcome.hbs`

**Purpose:** Welcome new user

**Data fields:**
- `first_name` - User first name
- `last_name` - User last name
- `email` - User email
- `site_url` - Site URL

### Email Verification

**Template:** `email-verification.hbs`

**Purpose:** Send email verification link

**Data fields:**
- `verification_url` - Verification URL

### Password Reset

**Template:** `password-reset.hbs`

**Purpose:** Send password reset link

**Data fields:**
- `reset_url` - Password reset URL

### Password Changed

**Template:** `password-changed.hbs`

**Purpose:** Confirm password change

**Data fields:** None (uses header only)

## Newsletter Template

**Template:** `newsletter.hbs`

**Purpose:** Send newsletter updates

**Data fields:**
- `subject` - Newsletter subject
- `featured_post` - Blog post object (optional)
  - `post_title` - Post title
  - `post_excerpt` - Post excerpt
  - `post_slug` - Post slug
- `featured_package` - Package object (optional)
  - `package_name` - Package name
  - `short_description` - Description
  - `duration_days` - Duration
  - `price_usd` - Price
  - `package_slug` - Package slug
- `site_url` - Site URL
- `unsubscribe_url` - Unsubscribe URL

## Admin Alert Template

**Template:** `admin-alert.hbs`

**Purpose:** Send system alerts to admin

**Data fields:**
- `alert_type` - Type of alert
- `timestamp` - Alert timestamp
- `severity` - Severity level
- `error_message` - Error message (optional)
- `details` - Additional details (optional)

## Customization

### Styling

All templates use inline CSS for maximum email client compatibility. To customize:

1. Edit `layouts/main.hbs` for global styles
2. Edit individual templates for specific styles

### Brand Colors

Current brand colors:
- Primary: `#C8860A` (golden)
- Secondary: `#9A6808` (dark gold)
- Background: `#FBF6EE` (cream)
- Text: `#2A1A0E` (dark brown)
- Accent: `#8A6E54` (tan)

### Adding New Templates

1. Create template file in `services/email/templates/`
2. Add corresponding function in `services/email/email.service.js`
3. Export function in `services/email/index.js`

**Example template:**
```handlebars
<p>Hello {{name}},</p>
<p>{{message}}</p>
```

**Example service function:**
```javascript
async function sendCustomEmail(data) {
  const emailData = {
    to: data.email,
    subject: data.subject,
    templateName: 'custom-template',
    templateData: {
      ...data,
      header: {
        title: 'Custom Email',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('custom-email', emailData);
}
```

## Testing Templates

Test template rendering:

```javascript
const html = await emailService.renderTemplate('template-name', data);
console.log(html);
```

## Best Practices

1. **Use inline CSS** for email client compatibility
2. **Keep width under 600px** for mobile optimization
3. **Test in multiple clients** (Gmail, Outlook, Apple Mail)
4. **Use alt text** for images
5. **Avoid JavaScript** - not supported in email
6. **Use table-based layouts** for complex structures
7. **Keep subject lines under 50 characters**
8. **Personalize with recipient data**
9. **Include clear call-to-action buttons**
10. **Add plaintext fallback** for accessibility
