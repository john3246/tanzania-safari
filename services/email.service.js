const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const baseTemplate = (content) => `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#FBF6EE;color:#2A1A0E}
  .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}
  .header{background:linear-gradient(135deg,#C8860A,#C25B2A);padding:32px 40px;text-align:center;color:#fff}
  .header h1{margin:0;font-size:24px;font-weight:700;letter-spacing:.5px}
  .header p{margin:6px 0 0;opacity:.9;font-size:14px}
  .body{padding:40px}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F0E4CC;font-size:14px}
  .row:last-child{border:none}
  .label{color:#8A6E54;font-weight:500}
  .value{font-weight:600;color:#2A1A0E;text-align:right}
  .btn{display:inline-block;background:linear-gradient(135deg,#C8860A,#A36A00);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;margin:24px 0}
  .footer{background:#FBF6EE;padding:24px 40px;text-align:center;font-size:12px;color:#8A6E54}
  .badge{display:inline-block;background:#E8F5E9;color:#2E7D32;padding:4px 12px;border-radius:50px;font-size:12px;font-weight:600}
</style></head><body>
<div style="padding:24px">
<div class="wrap">${content}</div>
</div></body></html>`;

async function sendBookingConfirmation(booking) {
    const html = baseTemplate(`
    <div class="header">
      <h1>🦁 Booking Confirmed!</h1>
      <p>Tanzania Safari & Tours</p>
    </div>
    <div class="body">
      <p>Dear <strong>${booking.full_name}</strong>,</p>
      <p>Your safari booking has been received. We'll confirm availability within <strong>24 hours</strong>.</p>
      <div class="row"><span class="label">Booking Ref</span><span class="value">#${booking.booking_id || 'TZ-' + Date.now()}</span></div>
      <div class="row"><span class="label">Package</span><span class="value">${booking.package_name || 'Safari Package'}</span></div>
      <div class="row"><span class="label">Travel Date</span><span class="value">${new Date(booking.start_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span></div>
      <div class="row"><span class="label">Travelers</span><span class="value">${booking.number_of_adults} Adults${booking.number_of_children ? ', ' + booking.number_of_children + ' Children' : ''}</span></div>
      <div class="row"><span class="label">Total Price</span><span class="value">$${parseFloat(booking.total_price_usd || 0).toLocaleString()} USD</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge">Pending Review</span></span></div>
      <p>Questions? Reply to this email or call <strong>+255 789 456 123</strong></p>
    </div>
    <div class="footer">
      <p>Tanzania Safari & Tours · Arusha, Tanzania · info@tanzaniasafari.com</p>
      <p>This is an automated message. Please do not reply directly.</p>
    </div>`);
    
    return transporter.sendMail({
        from: `"Tanzania Safari" <${process.env.MAIL_USER}>`,
        to: booking.email,
        subject: `Booking Confirmed — ${booking.package_name || 'Safari Package'}`,
        html
    });
}

async function sendContactAcknowledgment(enquiry) {
    const html = baseTemplate(`
    <div class="header">
      <h1>🌿 Message Received</h1>
      <p>Tanzania Safari & Tours</p>
    </div>
    <div class="body">
      <p>Dear <strong>${enquiry.full_name}</strong>,</p>
      <p>Thank you for contacting us! Our team will respond within <strong>24 hours</strong>.</p>
      <div class="row"><span class="label">Your Message</span></div>
      <p style="background:#FBF6EE;padding:16px;border-radius:8px;font-size:14px;margin:8px 0">${enquiry.enquiry_message}</p>
    </div>
    <div class="footer">
      <p>Tanzania Safari & Tours · Arusha, Tanzania · info@tanzaniasafari.com</p>
    </div>`);

    return transporter.sendMail({
        from: `"Tanzania Safari" <${process.env.MAIL_USER}>`,
        to: enquiry.email,
        subject: 'We received your inquiry — Tanzania Safari',
        html
    });
}

async function sendAdminNotification(type, data) {
    const subjects = {
        booking: `🔔 New Booking — ${data.package_name || 'Safari'}`,
        enquiry: `📩 New Enquiry from ${data.full_name}`
    };
    const html = baseTemplate(`
    <div class="header"><h1>Admin Notification</h1><p>${subjects[type]}</p></div>
    <div class="body">
      <pre style="background:#FBF6EE;padding:16px;border-radius:8px;font-size:13px;overflow:auto">${JSON.stringify(data, null, 2)}</pre>
      <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}" class="btn">View in Dashboard</a>
    </div>
    <div class="footer"><p>Tanzania Safari Admin System</p></div>`);

    if (!process.env.ADMIN_EMAIL) return;
    return transporter.sendMail({
        from: `"Tanzania Safari System" <${process.env.MAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: subjects[type],
        html
    });
}

async function sendBookingStatusUpdate(booking, newStatus) {
    const statusMsg = {
        confirmed: '✅ Your booking has been confirmed! Get ready for an incredible safari.',
        cancelled: '❌ Your booking has been cancelled. Contact us if you have questions.',
        pending: '⏳ Your booking is under review. We will update you shortly.'
    };
    const html = baseTemplate(`
    <div class="header"><h1>Booking Update</h1><p>Tanzania Safari & Tours</p></div>
    <div class="body">
      <p>Dear <strong>${booking.full_name}</strong>,</p>
      <p>${statusMsg[newStatus] || 'Your booking status has been updated.'}</p>
      <div class="row"><span class="label">Package</span><span class="value">${booking.package_name}</span></div>
      <div class="row"><span class="label">New Status</span><span class="value">${newStatus.toUpperCase()}</span></div>
    </div>
    <div class="footer"><p>Tanzania Safari & Tours · info@tanzaniasafari.com</p></div>`);

    return transporter.sendMail({
        from: `"Tanzania Safari" <${process.env.MAIL_USER}>`,
        to: booking.email,
        subject: `Booking Status Update — ${newStatus.toUpperCase()}`,
        html
    });
}

async function sendEnquiryResponse(enquiry, responseNotes) {
    const html = baseTemplate(`
    <div class="header"><h1>Safari Inquiry Response</h1><p>Tanzania Safari & Tours</p></div>
    <div class="body">
      <p>Dear <strong>${enquiry.full_name}</strong>,</p>
      <p>Thank you for your inquiry about <strong>${enquiry.package_name || 'your safari'}</strong>.</p>
      <div style="background:#FBF6EE;padding:24px;border-radius:12px;margin:24px 0;line-height:1.6">
        ${responseNotes}
      </div>
      <p>If you have any further questions or would like to proceed with your booking, simply reply to this email or contact us at <strong>+255 789 456 123</strong>.</p>
      <p>We look forward to welcoming you to Tanzania!</p>
    </div>
    <div class="footer"><p>Tanzania Safari & Tours · Arusha, Tanzania · info@tanzaniasafari.com</p></div>`);

    return transporter.sendMail({
        from: `"Tanzania Safari" <${process.env.MAIL_USER}>`,
        to: enquiry.email,
        subject: `Response to your Safari Inquiry — Tanzania Safari`,
        html
    });
}

async function sendNewsletterUpdate(subscriberEmail, blog) {
    const html = baseTemplate(`
    <div class="header"><h1>New Blog Post!</h1><p>Tanzania Safari & Tours</p></div>
    <div class="body">
      <h2>${blog.post_title}</h2>
      <p>${blog.post_excerpt || ''}</p>
      <a href="${process.env.SITE_URL || 'http://localhost:3000'}/blog/${blog.post_slug}" class="btn">Read Full Story</a>
    </div>
    <div class="footer"><p>You received this because you subscribed to our newsletter.</p></div>`);

    return transporter.sendMail({
        from: `"Tanzania Safari" <${process.env.MAIL_USER}>`,
        to: subscriberEmail,
        subject: `New on our Blog: ${blog.post_title}`,
        html
    });
}

module.exports = { 
    sendBookingConfirmation, 
    sendContactAcknowledgment, 
    sendAdminNotification, 
    sendBookingStatusUpdate,
    sendEnquiryResponse,
    sendNewsletterUpdate
};
