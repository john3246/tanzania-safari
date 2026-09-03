const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { getTransporter, verifyConnection } = require('./transporter');
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
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

Handlebars.registerHelper('formatPrice', function(price) {
  if (price == null || price === '') return '0';
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});

Handlebars.registerHelper('if', function(conditional, options) {
  if (conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('unless', function(conditional, options) {
  if (!conditional) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Template cache
const templateCache = new Map();
let partialsReady = null;

async function ensurePartialsRegistered() {
  if (partialsReady) return partialsReady;
  partialsReady = (async () => {
    const partialsDir = path.join(__dirname, 'templates', 'partials');
    try {
      const files = await fs.readdir(partialsDir);
      await Promise.all(
        files
          .filter((f) => f.endsWith('.hbs'))
          .map(async (file) => {
            const name = file.replace(/\.hbs$/, '');
            const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
            Handlebars.registerPartial(name, content);
          })
      );
    } catch (err) {
      logger.warn({ event: 'email_partials_missing', error: err.message }, 'Email partials not loaded');
    }
  })();
  return partialsReady;
}

function normalizeTemplateData(data = {}) {
  const siteUrl = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
  // Templates historically used {{#with booking|enquiry|payment}} while callers spread
  // fields at the root. Nest aliases so both styles resolve to the same values.
  const nestedKeys = ['booking', 'enquiry', 'payment', 'refund', 'user', 'content', 'alert'];
  const normalized = {
    site_url: data.site_url || siteUrl,
    year: data.year || new Date().getFullYear(),
    company_name: 'Tanzania Safari Magic',
    company_email: 'info@tanzaniasafarimagic.com',
    company_phone: '+255 695 108 009',
    company_whatsapp: 'https://wa.me/255695108009',
    ...data
  };
  for (const key of nestedKeys) {
    if (!normalized[key] || typeof normalized[key] !== 'object') {
      normalized[key] = { ...normalized };
    }
  }
  return normalized;
}

/**
 * Load and compile a template
 */
async function loadTemplate(templateName) {
  await ensurePartialsRegistered();

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
    const normalized = normalizeTemplateData(data || {});
    const contentTemplate = await loadTemplate(templateName);
    const content = contentTemplate(normalized);
    
    const layoutTemplate = await loadTemplate(`layouts/${layout}`);
    const html = layoutTemplate({
      ...normalized,
      subject: normalized.subject || '',
      header: normalized.header || null,
      body: content,
      footer: normalized.footer || null
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
  let { to, subject, html, text, templateName, templateData } = options;

  if (!html && templateName) {
    try {
      html = await renderTemplate(templateName, templateData || {});
    } catch (err) {
      logger.warn({ event: 'template_render_warning', templateName, error: err.message }, 'Using inline HTML fallback for direct email');
      const bodyContent = templateData?.response_notes || templateData?.enquiry_message || templateData?.message || subject || '';
      html = `
        <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #d9e3d6;border-radius:18px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#2C391C,#465B2D);padding:28px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:22px;font-weight:800">Tanzania Safari Magic</h2>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px">Private safaris from Arusha · Serengeti · Ngorongoro · Zanzibar</p>
          </div>
          <div style="height:4px;background:#C8860A"></div>
          <div style="padding:28px;color:#3d4a3a;font-size:16px;line-height:1.65">
            <p style="margin:0 0 10px">Dear guest,</p>
            <h3 style="color:#2C391C;margin:0 0 12px">${String(subject || '').replace(/</g,'&lt;')}</h3>
            <div style="white-space:pre-wrap;margin-bottom:18px">${String(bodyContent).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            <p style="margin:0 0 8px">With warm regards from Arusha,</p>
            <p style="margin:0 0 4px"><strong>The Tanzania Safari Magic Team</strong></p>
            <p style="margin:0 0 16px;color:#64748b;font-size:13px">Private Safari Specialists · Licensed Local Operator</p>
            <p style="margin:0 0 8px;font-size:13px"><a href="mailto:info@tanzaniasafarimagic.com" style="color:#9A6808;font-weight:650">info@tanzaniasafarimagic.com</a> · <a href="https://wa.me/255695108009" style="color:#9A6808;font-weight:650">+255 695 108 009</a></p>
            <p style="margin-top:20px"><a href="https://tanzaniasafarimagic.com/booking" style="display:inline-block;background:#C8860A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Get a free quote</a></p>
          </div>
          <div style="background:#f0f3ef;padding:20px;text-align:center;font-size:13px;color:#64748b">
            <strong style="color:#2C391C">Tanzania Safari Magic</strong> — your hosts in Arusha<br>
            Office hours Mon–Sat 08:00–18:00 EAT · We reply within 24 hours<br>
            <span style="display:inline-block;margin-top:8px;font-size:12px">&copy; ${new Date().getFullYear()} Tanzania Safari Magic. All rights reserved.</span>
          </div>
        </div>
      `;
    }
  }

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
    const transporter = await getTransporter();
    if (transporter.__smtpMeta?.from) {
      mailOptions.from = transporter.__smtpMeta.from;
    }
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

  // Pre-render HTML template if templateName is provided
  if (!data.html && templateName) {
    try {
      data.html = await renderTemplate(templateName, templateData || {});
    } catch (renderErr) {
      logger.warn({ event: 'template_render_warning', templateName, error: renderErr.message }, 'Falling back to inline HTML rendering');
      const bodyContent = templateData?.response_notes || templateData?.enquiry_message || templateData?.message || subject || '';
      data.html = `
        <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #d9e3d6;border-radius:18px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#2C391C,#465B2D);padding:28px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:22px;font-weight:800">Tanzania Safari Magic</h2>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px">Private safaris from Arusha</p>
          </div>
          <div style="height:4px;background:#C8860A"></div>
          <div style="padding:28px;color:#3d4a3a;font-size:16px;line-height:1.65">
            <p style="margin:0 0 10px">Dear guest,</p>
            <h3 style="color:#2C391C;margin:0 0 12px">${String(subject || '').replace(/</g,'&lt;')}</h3>
            <div style="white-space:pre-wrap;margin-bottom:18px">${String(bodyContent).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            <p style="margin:0 0 8px">With warm regards from Arusha,</p>
            <p style="margin:0"><strong>The Tanzania Safari Magic Team</strong></p>
            <p style="margin:8px 0 0;font-size:13px"><a href="mailto:info@tanzaniasafarimagic.com" style="color:#9A6808">info@tanzaniasafarimagic.com</a> · <a href="https://wa.me/255695108009" style="color:#9A6808">+255 695 108 009</a></p>
          </div>
          <div style="background:#f0f3ef;padding:20px;text-align:center;font-size:13px;color:#64748b">
            &copy; ${new Date().getFullYear()} Tanzania Safari Magic. All rights reserved.
          </div>
        </div>
      `;
    }
  }

  // Validate email data
  const validation = validateEmailData(to, subject, data.html || templateName);
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
    logger.info({ jobName }, 'Bypassing Redis queue, using direct email sending');
    return await sendEmailDirect(data);
  } catch (error) {
    logger.error({
      event: 'email_direct_failed',
      jobName,
      error: error.message
    }, 'Failed to send email directly');
    
    throw error;
  }
}

/**
 * Email workflow functions
 */

// Booking emails
async function sendBookingConfirmation(booking) {
  const subject = `We received your safari request — ${booking.package_name || 'Tanzania Safari Magic'}`;
  const data = {
    to: booking.email,
    subject,
    templateName: 'booking-confirmation',
    templateData: {
      ...booking,
      header: {
        title: 'Your safari request is with us',
        subtitle: 'Thank you — our Arusha team is reviewing your dates'
      },
      subject
    }
  };
  return sendEmailQueued('booking-confirmation', data);
}

async function sendBookingApproved(booking) {
  const subject = `Your safari is confirmed — ${booking.package_name || 'Tanzania Safari Magic'}`;
  const data = {
    to: booking.email,
    subject,
    templateName: 'booking-approved',
    templateData: {
      ...booking,
      header: {
        title: 'Safari confirmed — karibu!',
        subtitle: 'Your journey with Tanzania Safari Magic is approved'
      },
      subject
    }
  };
  return sendEmailQueued('booking-approved', data);
}

async function sendBookingRejected(booking) {
  const subject = `Update on your safari request — ${booking.package_name || 'Tanzania Safari Magic'}`;
  const data = {
    to: booking.email,
    subject,
    templateName: 'booking-rejected',
    templateData: {
      ...booking,
      header: {
        title: 'An update on your request',
        subtitle: 'Let’s find the right dates together'
      },
      subject
    }
  };
  return sendEmailQueued('booking-rejected', data);
}

async function sendBookingCancelled(booking) {
  const subject = `Cancellation confirmation — ${booking.package_name || 'Tanzania Safari Magic'}`;
  const data = {
    to: booking.email,
    subject,
    templateName: 'booking-cancelled',
    templateData: {
      ...booking,
      header: {
        title: 'Booking cancellation confirmed',
        subtitle: 'We’re here whenever you wish to replan'
      },
      subject
    }
  };
  return sendEmailQueued('booking-cancelled', data);
}

async function sendBookingReminder(booking, daysUntil) {
  const subject = `Following up on your safari enquiry — ${booking.package_name || 'Tanzania Safari Magic'}`;
  const data = {
    to: booking.email,
    subject,
    templateName: 'booking-reminder',
    templateData: {
      ...booking,
      days_until: daysUntil,
      header: {
        title: 'Just checking in from Arusha',
        subtitle: 'We’re ready to help you finalise your plans'
      },
      subject
    }
  };
  return sendEmailQueued('booking-reminder', data);
}

async function sendBookingCompleted(booking) {
  const subject = `Asante sana — thank you for travelling with us`;
  const data = {
    to: booking.email,
    subject,
    templateName: 'booking-completed',
    templateData: {
      ...booking,
      header: {
        title: 'Thank you for travelling with us',
        subtitle: 'We hope Tanzania left you with lifelong memories'
      },
      subject
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
    subject: 'Payment received — thank you | Tanzania Safari Magic',
    templateName: 'payment-success',
    templateData: {
      ...payment,
      header: {
        title: 'Payment received — asante',
        subtitle: 'Your receipt from Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('payment-success', data);
}

async function sendPaymentFailed(payment) {
  const data = {
    to: payment.customer_email,
    subject: 'We could not complete your payment — Tanzania Safari Magic',
    templateName: 'payment-failed',
    templateData: {
      ...payment,
      header: {
        title: 'Payment needs another try',
        subtitle: 'We’re here to help you complete it smoothly'
      }
    }
  };
  return sendEmailQueued('payment-failed', data);
}

async function sendRefundInitiated(refund) {
  const data = {
    to: refund.customer_email,
    subject: 'Your refund is being processed — Tanzania Safari Magic',
    templateName: 'refund-initiated',
    templateData: {
      ...refund,
      header: {
        title: 'Refund in progress',
        subtitle: 'We’ll email you again when it is complete'
      }
    }
  };
  return sendEmailQueued('refund-initiated', data);
}

async function sendRefundCompleted(refund) {
  const data = {
    to: refund.customer_email,
    subject: 'Your refund is complete — Tanzania Safari Magic',
    templateName: 'refund-completed',
    templateData: {
      ...refund,
      header: {
        title: 'Refund completed',
        subtitle: 'Thank you for your patience'
      }
    }
  };
  return sendEmailQueued('refund-completed', data);
}

// Contact emails
async function sendContactAcknowledgment(enquiry) {
  const subject = 'We received your message — Tanzania Safari Magic';
  const data = {
    to: enquiry.email,
    subject,
    templateName: 'contact-confirmation',
    templateData: {
      ...enquiry,
      header: {
        title: 'Thank you for contacting us',
        subtitle: 'A safari consultant in Arusha will reply within 24 hours'
      },
      subject
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
    subject: `New enquiry from ${enquiry.full_name}`,
    templateName: 'admin-contact-notification',
    templateData: {
      ...enquiry,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      hide_signature: true,
      header: {
        title: 'New contact enquiry',
        subtitle: 'Action needed within 24 hours'
      }
    },
    priority: 'high'
  };
  return sendEmailQueued('admin-contact-notification', data);
}

async function sendEnquiryResponse(enquiry, responseNotes) {
  const subject = 'A personal reply from Tanzania Safari Magic';
  const data = {
    to: enquiry.email,
    subject,
    templateName: 'enquiry-response',
    templateData: {
      ...enquiry,
      response_notes: responseNotes,
      header: {
        title: 'A note from your safari consultant',
        subtitle: 'Tanzania Safari Magic · Arusha'
      },
      subject
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
    subject: `New booking — ${booking.package_name || booking.booking_reference || 'Safari'}`,
    templateName: 'admin-booking-notification',
    templateData: {
      ...booking,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      hide_signature: true,
      header: {
        title: 'New booking request',
        subtitle: 'Review and respond within 24 hours'
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
    subject: `Booking cancelled — ${booking.package_name || booking.booking_reference || 'Safari'}`,
    templateName: 'admin-booking-cancelled',
    templateData: {
      ...booking,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      hide_signature: true,
      header: {
        title: 'Booking cancelled',
        subtitle: 'Check refund / guest communication'
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
    subject: `Payment failed — ${payment.customer_name || 'Guest'}`,
    templateName: 'admin-payment-failed',
    templateData: {
      ...payment,
      admin_url: process.env.ADMIN_URL || 'http://localhost:3000/admin',
      hide_signature: true,
      header: {
        title: 'Payment failed',
        subtitle: 'Guest may need alternative payment help'
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
    subject: 'Karibu — welcome to Tanzania Safari Magic',
    templateName: 'welcome',
    templateData: {
      ...user,
      site_url: process.env.SITE_URL || 'https://tanzaniasafarimagic.com',
      header: {
        title: 'Karibu — welcome',
        subtitle: 'Your journey with Tanzania Safari Magic begins here'
      }
    }
  };
  return sendEmailQueued('welcome', data);
}

async function sendEmailVerification(user, verificationUrl) {
  const data = {
    to: user.email,
    subject: 'Please verify your email — Tanzania Safari Magic',
    templateName: 'email-verification',
    templateData: {
      verification_url: verificationUrl,
      header: {
        title: 'Verify your email',
        subtitle: 'One quick step to secure your account'
      }
    }
  };
  return sendEmailQueued('email-verification', data);
}

async function sendPasswordResetEmail(email, resetUrl) {
  return sendEmailDirect({
    to: email,
    subject: 'Reset your password — Tanzania Safari Magic',
    html: await renderTemplate('password-reset', {
      reset_url: resetUrl,
      header: {
        title: 'Password reset request',
        subtitle: 'Secure link inside — expires in 1 hour'
      }
    })
  });
}

async function sendPasswordChanged(email) {
  const data = {
    to: email,
    subject: 'Your password was changed — Tanzania Safari Magic',
    templateName: 'password-changed',
    templateData: {
      header: {
        title: 'Password changed successfully',
        subtitle: 'Contact us immediately if this was not you'
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
      site_url: process.env.SITE_URL || 'https://tanzaniasafarimagic.com',
      unsubscribe_url: `${process.env.SITE_URL || 'https://tanzaniasafarimagic.com'}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`,
      header: {
        title: 'Newsletter',
        subtitle: 'Tanzania Safari Magic'
      }
    }
  };
  return sendEmailQueued('newsletter', data);
}

/**
 * Comprehensive welcome + thank-you after newsletter subscribe.
 */
async function sendNewsletterWelcome({ email, full_name = null, unsubscribe_token = null }) {
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
  const token = unsubscribe_token || Buffer.from(String(email).toLowerCase()).toString('base64url');
  const unsubscribe_url = `${site}/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  const data = {
    to: email,
    subject: 'Karibu! Welcome to Tanzania Safari Magic',
    templateName: 'newsletter-welcome',
    templateData: {
      full_name: full_name || null,
      email,
      site_url: site,
      unsubscribe_url,
      header: {
        title: 'Welcome to the journey',
        subtitle: 'Thank you for subscribing'
      }
    }
  };
  return sendEmailQueued('newsletter-welcome', data);
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
  sendNewsletterWelcome,
  
  // Admin alerts
  sendAdminAlert
};
