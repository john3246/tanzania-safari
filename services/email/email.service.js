const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { transporter, verifyConnection } = require('./transporter');
const { queueEmail } = require('./queue');
const { 
  validateEmailData, 
  sanitizeInput, 
  escapeHtml, 
  rateLimiter,
  validateEnvironment 
} = require('./helpers');
const logger = require('../../utils/logger');

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

Handlebars.registerHelper('formatPrice', function(price) {
  if (!price) return '0';
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});

Handlebars.registerHelper('if', function(conditional, options) {
  if (conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

// Template cache
const templateCache = new Map();

/**
 * Load and compile a template
 */
async function loadTemplate(templateName) {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  try {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    const template = Handlebars.compile(templateContent);
    templateCache.set(templateName, template);
    
    logger.debug({ event: 'template_loaded', templateName }, 'Template loaded');
    return template;
  } catch (error) {
    logger.error({ event: 'template_load_failed', templateName, error: error.message }, 'Failed to load template');
    throw new Error(`Failed to load template: ${templateName}`);
  }
}

/**
 * Load layout and compile with content
 */
async function renderTemplate(templateName, data, layout = 'main') {
  try {
    const contentTemplate = await loadTemplate(templateName);
    const content = contentTemplate(data);
    
    const layoutTemplate = await loadTemplate(`layouts/${layout}`);
    const html = layoutTemplate({
      subject: data.subject || '',
      header: data.header || null,
      body: content,
      footer: data.footer || null,
      ...data
    });
    
    return html;
  } catch (error) {
    logger.error({ event: 'template_render_failed', templateName, error: error.message }, 'Failed to render template');
    throw error;
  }
}

/**
 * Generate plaintext version from HTML
 */
function generatePlaintext(html) {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Send email directly (synchronous, for critical emails)
 */
async function sendEmailDirect(options) {
  const { to, subject, html, text } = options;

  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    throw new Error(`Invalid environment: ${envValidation.missing.join(', ')}`);
  }

  // Validate email data
  const validation = validateEmailData(to, subject, html);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Rate limiting
  const rateCheck = rateLimiter.canSend(to);
  if (!rateCheck.allowed) {
    throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
  }

  // Sanitize inputs
  const sanitizedSubject = sanitizeInput(subject);
  const sanitizedTo = sanitizeInput(to);

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Tanzania Safari Magic" <${process.env.EMAIL_USER}>`,
    to: sanitizedTo,
    subject: sanitizedSubject,
    html,
    text: text || generatePlaintext(html)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info({
      event: 'email_sent',
      to: sanitizedTo,
      subject: sanitizedSubject,
      messageId: info.messageId
    }, 'Email sent successfully');
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error({
      event: 'email_send_failed',
      to: sanitizedTo,
      subject: sanitizedSubject,
      error: error.message
    }, 'Failed to send email');
    
    throw error;
  }
}

/**
 * Queue email for async processing
 */
async function sendEmailQueued(jobName, data) {
  const { to, subject, templateName, templateData, priority = 'normal' } = data;

  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    logger.warn({ event: 'env_validation_failed', missing: envValidation.missing }, 'Environment validation failed, email will not be sent');
    return { success: false, error: 'Invalid environment' };
  }

  // Validate email data
  const validation = validateEmailData(to, subject, templateName);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Rate limiting
  const rateCheck = rateLimiter.canSend(to);
  if (!rateCheck.allowed) {
    logger.warn({ event: 'rate_limit_exceeded', to, reason: rateCheck.reason }, 'Rate limit exceeded');
    return { success: false, error: rateCheck.reason };
  }

  try {
    const job = await queueEmail(jobName, data, {
      priority: priority === 'high' ? 10 : 5
    });
    
    return { success: true, jobId: job.id };
  } catch (error) {
    logger.error({
      event: 'email_queue_failed',
      jobName,
      error: error.message
    }, 'Failed to queue email');
    
    throw error;
  }
}

/**
 * Email workflow functions
 */

// Booking emails
async function sendBookingConfirmation(booking) {
  const data = {
    to: booking.email,
    subject: `Booking Confirmed — ${booking.package_name || 'Safari Package'}`,
    templateName: 'booking-confirmation',
    templateData: {
      ...booking,
      header: {
        title: 'Booking Confirmed!',
        subtitle: 'Tanzania Safari Magic'
      },
      subject: `Booking Confirmed — ${booking.package_name || 'Safari Package'}`
    }
  };
  return sendEmailQueued('booking-confirmation', data);
}

async function sendBookingApproved(booking) {
  const data = {
    to: booking.email,
    subject: `Booking Approved — ${booking.package_name}`,
    templateName: 'booking-approved',
    templateData: {
      ...booking,
      header: {
        title: 'Booking Approved!',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('booking-approved', data);
}

async function sendBookingRejected(booking) {
  const data = {
    to: booking.email,
    subject: `Booking Update — ${booking.package_name}`,
    templateName: 'booking-rejected',
    templateData: {
      ...booking,
      header: {
        title: 'Booking Update',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('booking-rejected', data);
}

async function sendBookingCancelled(booking) {
  const data = {
    to: booking.email,
    subject: `Booking Cancelled — ${booking.package_name}`,
    templateName: 'booking-cancelled',
    templateData: {
      ...booking,
      header: {
        title: 'Booking Cancelled',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('booking-cancelled', data);
}

async function sendBookingReminder(booking, daysUntil) {
  const data = {
    to: booking.email,
    subject: `Safari Reminder — ${booking.package_name}`,
    templateName: 'booking-reminder',
    templateData: {
      ...booking,
      days_until: daysUntil,
      header: {
        title: 'Upcoming Safari!',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('booking-reminder', data);
}

async function sendBookingCompleted(booking) {
  const data = {
    to: booking.email,
    subject: `Thank You — ${booking.package_name}`,
    templateName: 'booking-completed',
    templateData: {
      ...booking,
      header: {
        title: 'Safari Completed',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('booking-completed', data);
}

async function sendBookingUpdated(booking) {
  const data = {
    to: booking.email,
    subject: `Booking Updated — ${booking.package_name || 'Safari Package'}`,
    templateName: 'booking-updated',
    templateData: {
      ...booking,
      header: {
        title: 'Booking Updated',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('booking-updated', data);
}

async function sendPaymentReceipt(booking, amount) {
  const data = {
    to: booking.email,
    subject: `Payment Receipt — $${amount}`,
    templateName: 'payment-receipt',
    templateData: {
      ...booking,
      payment_amount: amount,
      balance_due: Math.max(0, (parseFloat(booking.total_amount || 0) - parseFloat(booking.discount_amount || 0) - parseFloat(booking.paid_amount || 0))),
      header: {
        title: 'Payment Receipt',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('payment-receipt', data);
}

// Payment emails
async function sendPaymentSuccess(payment) {
  const data = {
    to: payment.customer_email,
    subject: 'Payment Successful',
    templateName: 'payment-success',
    templateData: {
      ...payment,
      header: {
        title: 'Payment Successful',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('payment-success', data);
}

async function sendPaymentFailed(payment) {
  const data = {
    to: payment.customer_email,
    subject: 'Payment Failed',
    templateName: 'payment-failed',
    templateData: {
      ...payment,
      header: {
        title: 'Payment Failed',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('payment-failed', data);
}

async function sendRefundInitiated(refund) {
  const data = {
    to: refund.customer_email,
    subject: 'Refund Initiated',
    templateName: 'refund-initiated',
    templateData: {
      ...refund,
      header: {
        title: 'Refund Initiated',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('refund-initiated', data);
}

async function sendRefundCompleted(refund) {
  const data = {
    to: refund.customer_email,
    subject: 'Refund Completed',
    templateName: 'refund-completed',
    templateData: {
      ...refund,
      header: {
        title: 'Refund Completed',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('refund-completed', data);
}

// Contact emails
async function sendContactAcknowledgment(enquiry) {
  const data = {
    to: enquiry.email,
    subject: 'Message Received — Tanzania Safari Magic',
    templateName: 'contact-confirmation',
    templateData: {
      ...enquiry,
      header: {
        title: 'Message Received',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('contact-confirmation', data);
}

async function sendAdminContactNotification(enquiry) {
  if (!process.env.ADMIN_EMAIL) {
    logger.warn({ event: 'admin_email_missing' }, 'ADMIN_EMAIL not set, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not set' };
  }

  const data = {
    to: process.env.ADMIN_EMAIL,
    subject: `New Enquiry from ${enquiry.full_name}`,
    templateName: 'admin-contact-notification',
    templateData: {
      ...enquiry,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      header: {
        title: 'Admin Notification',
        subtitle: 'New Contact Enquiry'
      }
    },
    priority: 'high'
  };
  return sendEmailQueued('admin-contact-notification', data);
}

async function sendEnquiryResponse(enquiry, responseNotes) {
  const data = {
    to: enquiry.email,
    subject: `Response to your Safari Inquiry — Tanzania Safari Magic`,
    templateName: 'enquiry-response',
    templateData: {
      ...enquiry,
      response_notes: responseNotes,
      header: {
        title: 'Safari Inquiry Response',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('enquiry-response', data);
}

async function sendAdminBookingNotification(booking) {
  if (!process.env.ADMIN_EMAIL) {
    logger.warn({ event: 'admin_email_missing' }, 'ADMIN_EMAIL not set, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not set' };
  }

  const data = {
    to: process.env.ADMIN_EMAIL,
    subject: `New Booking — ${booking.package_name}`,
    templateName: 'admin-booking-notification',
    templateData: {
      ...booking,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      header: {
        title: 'Admin Notification',
        subtitle: 'New Booking Received'
      }
    },
    priority: 'high'
  };
  return sendEmailQueued('admin-booking-notification', data);
}

async function sendAdminBookingCancelled(booking) {
  if (!process.env.ADMIN_EMAIL) {
    logger.warn({ event: 'admin_email_missing' }, 'ADMIN_EMAIL not set, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not set' };
  }

  const data = {
    to: process.env.ADMIN_EMAIL,
    subject: `Booking Cancelled — ${booking.package_name}`,
    templateName: 'admin-booking-cancelled',
    templateData: {
      ...booking,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      header: {
        title: 'Admin Notification',
        subtitle: 'Booking Cancelled'
      }
    },
    priority: 'high'
  };
  return sendEmailQueued('admin-booking-cancelled', data);
}

async function sendAdminPaymentFailed(payment) {
  if (!process.env.ADMIN_EMAIL) {
    logger.warn({ event: 'admin_email_missing' }, 'ADMIN_EMAIL not set, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not set' };
  }

  const data = {
    to: process.env.ADMIN_EMAIL,
    subject: `Payment Failed — ${payment.customer_name}`,
    templateName: 'admin-payment-failed',
    templateData: {
      ...payment,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      header: {
        title: 'Admin Notification',
        subtitle: 'Payment Failed'
      }
    },
    priority: 'high'
  };
  return sendEmailQueued('admin-payment-failed', data);
}

// Auth emails
async function sendWelcomeEmail(user) {
  const data = {
    to: user.email,
    subject: 'Welcome to Tanzania Safari Magic!',
    templateName: 'welcome',
    templateData: {
      ...user,
      site_url: process.env.SITE_URL || 'http://localhost:3000',
      header: {
        title: 'Welcome!',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('welcome', data);
}

async function sendEmailVerification(user, verificationUrl) {
  const data = {
    to: user.email,
    subject: 'Verify Your Email Address',
    templateName: 'email-verification',
    templateData: {
      verification_url: verificationUrl,
      header: {
        title: 'Verify Your Email',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('email-verification', data);
}

async function sendPasswordResetEmail(email, resetUrl) {
  const data = {
    to: email,
    subject: 'Password Reset — Tanzania Safari Magic',
    templateName: 'password-reset',
    templateData: {
      reset_url: resetUrl,
      header: {
        title: 'Password Reset',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailDirect({
    to: email,
    subject: 'Password Reset — Tanzania Safari Magic',
    html: await renderTemplate('password-reset', { reset_url: resetUrl, header: { title: 'Password Reset', subtitle: 'Tanzania Safari Magic' } })
  });
}

async function sendPasswordChanged(email) {
  const data = {
    to: email,
    subject: 'Password Changed — Tanzania Safari Magic',
    templateName: 'password-changed',
    templateData: {
      header: {
        title: 'Password Changed',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('password-changed', data);
}

// Newsletter
async function sendNewsletterUpdate(subscriberEmail, content) {
  const data = {
    to: subscriberEmail,
    subject: content.subject || 'Tanzania Safari Magic Newsletter',
    templateName: 'newsletter',
    templateData: {
      ...content,
      site_url: process.env.SITE_URL || 'http://localhost:3000',
      unsubscribe_url: `${process.env.SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${subscriberEmail}`,
      header: {
        title: 'Newsletter',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('newsletter', data);
}

// Admin alerts
async function sendAdminAlert(type, data) {
  if (!process.env.ADMIN_EMAIL) {
    logger.warn({ event: 'admin_email_missing' }, 'ADMIN_EMAIL not set, skipping admin alert');
    return { success: false, error: 'ADMIN_EMAIL not set' };
  }

  const subjects = {
    smtp_failure: 'SMTP Connection Failure',
    queue_failure: 'Email Queue Failure',
    critical_error: 'Critical Email Error'
  };

  const queueData = {
    to: process.env.ADMIN_EMAIL,
    subject: subjects[type] || 'Admin Alert',
    templateName: 'admin-alert',
    templateData: {
      ...data,
      alert_type: type,
      header: {
        title: 'Admin Alert',
        subtitle: subjects[type] || 'System Alert'
      }
    },
    priority: 'high'
  };
  return sendEmailQueued('admin-alert', queueData);
}

module.exports = {
  // Core functions
  sendEmailDirect,
  sendEmailQueued,
  renderTemplate,
  verifyConnection,
  
  // Booking emails
  sendBookingConfirmation,
  sendBookingApproved,
  sendBookingRejected,
  sendBookingCancelled,
  sendBookingReminder,
  sendBookingCompleted,
  sendBookingUpdated,
  sendPaymentReceipt,
  
  // Payment emails
  sendPaymentSuccess,
  sendPaymentFailed,
  sendRefundInitiated,
  sendRefundCompleted,
  
  // Contact emails
  sendContactAcknowledgment,
  sendAdminContactNotification,
  sendAdminBookingNotification,
  sendAdminBookingCancelled,
  sendAdminPaymentFailed,
  sendEnquiryResponse,
  
  // Auth emails
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendPasswordChanged,
  
  // Newsletter
  sendNewsletterUpdate,
  
  // Admin alerts
  sendAdminAlert
};
