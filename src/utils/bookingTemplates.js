const getHeader = () => `
  <div style="background-color: #0D47A1; padding: 20px; text-align: center;">
    <img src="https://tanzaniasafarimagic.com/images/logo.png" alt="Tanzania Safari Magic" style="height: 64px; width: 64px; object-fit: cover; border-radius: 50%; border: 2px solid #ffffff;">
    <h1 style="color: #ffffff; margin: 10px 0 0 0; font-family: sans-serif; font-size: 24px;">Tanzania Safari Magic</h1>
  </div>
`;

const getFooter = () => `
  <div style="background-color: #FBF6EE; padding: 20px; text-align: center; border-top: 2px solid #C8860A; margin-top: 30px;">
    <p style="color: #666; margin: 0; font-family: sans-serif; font-size: 14px;">Tanzania Safari Magic &copy; ${new Date().getFullYear()}</p>
    <p style="color: #666; margin: 5px 0 0 0; font-family: sans-serif; font-size: 12px;">Quotes &amp; offline deposits · Arusha, Tanzania</p>
  </div>
`;

function getClientBookingEmailHTML(booking) {
    const name = booking.customer_name || booking.full_name || 'Traveler';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0D47A1; margin-top: 0;">We received your safari quote request</h2>
          <p style="color: #333; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #333; line-height: 1.6;">Thank you for contacting Tanzania Safari Magic. This is a confirmation that we received your <strong>quote request</strong> — no payment was taken online. Our Team is reviewing your details:</p>
          
          <div style="background-color: #FBF6EE; border-left: 4px solid #C8860A; padding: 15px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Package:</strong> ${booking.package_name || booking.package_id || 'Custom/General'}</p>
            <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${booking.start_date || booking.travel_date || 'TBD'}</p>
            <p style="margin: 5px 0;"><strong>Travelers:</strong> ${booking.number_of_adults || 0} Adults, ${booking.number_of_children || 0} Children</p>
          </div>
          
          <p style="color: #333; line-height: 1.6;">A safari specialist will contact you at <strong>${booking.email}</strong>${booking.phone ? ` or <strong>${booking.phone}</strong>` : ''} with a tailored itinerary. After you accept it, we will send deposit instructions (typically ~20%, arranged offline).</p>
          
          <a href="https://tanzaniasafarimagic.com" style="display: inline-block; background-color: #C8860A; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; margin-top: 20px; font-weight: bold;">Visit Our Website</a>
        </div>
        ${getFooter()}
      </div>
    `;
}

function getAdminBookingEmailHTML(booking) {
    const name = booking.customer_name || booking.full_name || 'Guest';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #C8860A; margin-top: 0;">New safari quote request</h2>
          <p style="color: #333; line-height: 1.6;">A new quote request was submitted (no online payment). Review and reply within 24 hours.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold; width: 35%;">Client Name</td>
              <td style="padding: 10px; border: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Email</td>
              <td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${booking.email}">${booking.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Phone</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.phone || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Package</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.package_name || booking.package_id || 'General/Custom'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Travel Date</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.start_date || booking.travel_date || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Adults</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.number_of_adults || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Children</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.number_of_children || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold; color: #0D47A1;">Estimated total</td>
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #0D47A1;">$${Number(booking.total_price_usd || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Special Requirements</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.special_requirements || 'None provided.'}</td>
            </tr>
          </table>
          
          <a href="https://tanzaniasafarimagic.com/admin" style="display: inline-block; background-color: #0D47A1; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; margin-top: 25px; font-weight: bold;">View in Admin Panel</a>
        </div>
        ${getFooter()}
      </div>
    `;
}

function getClientGroupRequestEmailHTML({ full_name, email, departure, seatsRequested, depositPercent, depositAmount, depositDueAt }) {
    const due = depositDueAt ? new Date(depositDueAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'within 24 hours';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0D47A1; margin-top: 0;">Group safari request received</h2>
          <p style="color: #333; line-height: 1.6;">Hi ${full_name || 'Traveler'},</p>
          <p style="color: #333; line-height: 1.6;">We received your request for <strong>${departure?.title || 'a group departure'}</strong> (${seatsRequested} traveler${seatsRequested > 1 ? 's' : ''}). No payment was taken online.</p>
          <div style="background-color: #FBF6EE; border-left: 4px solid #C8860A; padding: 15px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Typical seat deposit:</strong> ${depositPercent}% ≈ $${Number(depositAmount || 0).toLocaleString()} USD</p>
            <p style="margin: 5px 0;"><strong>Due by:</strong> ${due} (after Our Team approves your request)</p>
            <p style="margin: 5px 0;">We will email or WhatsApp <strong>offline payment instructions</strong> (bank transfer / agreed method). Seats are held once payment is confirmed.</p>
          </div>
          <p style="color: #333; line-height: 1.6;">Questions? Reply to this email or WhatsApp <a href="https://wa.me/255695108009">+255 695 108 009</a>.</p>
        </div>
        ${getFooter()}
      </div>
    `;
}

function getAdminGroupRequestEmailHTML({ full_name, email, phone, departure, seatsRequested, depositPercent, depositAmount, depositDueAt, enquiryId }) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #C8860A; margin-top: 0;">New group safari request</h2>
          <p style="color: #333; line-height: 1.6;">Approve in admin, then send offline deposit instructions.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold;width:35%">Guest</td><td style="padding:10px;border:1px solid #eee">${full_name}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Email</td><td style="padding:10px;border:1px solid #eee"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Phone</td><td style="padding:10px;border:1px solid #eee">${phone || 'N/A'}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Departure</td><td style="padding:10px;border:1px solid #eee">${departure?.title || ''}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Seats</td><td style="padding:10px;border:1px solid #eee">${seatsRequested}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Deposit</td><td style="padding:10px;border:1px solid #eee">${depositPercent}% = $${Number(depositAmount || 0).toLocaleString()} USD</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Due</td><td style="padding:10px;border:1px solid #eee">${depositDueAt || ''}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; background:#f9f9f9;font-weight:bold">Enquiry ID</td><td style="padding:10px;border:1px solid #eee">${enquiryId || ''}</td></tr>
          </table>
          <a href="https://tanzaniasafarimagic.com/admin" style="display: inline-block; background-color: #0D47A1; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; margin-top: 25px; font-weight: bold;">Open Admin</a>
        </div>
        ${getFooter()}
      </div>
    `;
}

function getClientBookingReminderHTML(booking, hoursOffset = 6) {
    const name = booking.customer_name || booking.full_name || 'Traveler';
    const pkg = booking.package_name || booking.package_id || 'your Tanzania safari';
    const date = booking.start_date || booking.travel_date || 'TBD';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0D47A1; margin-top: 0;">Safari quote reminder (${hoursOffset}h)</h2>
          <p style="color: #333; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #333; line-height: 1.6;">Just checking in — we received your quote request and Our Team is still preparing your itinerary. No payment is taken online.</p>
          <div style="background-color: #FBF6EE; border-left: 4px solid #C8860A; padding: 15px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Package:</strong> ${pkg}</p>
            <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Follow-up:</strong> Reminder at ${hoursOffset} hours (within 24h of your request)</p>
          </div>
          <p style="color: #333; line-height: 1.6;">Reply with any updates (dates, lodge style, budget) or WhatsApp <a href="https://wa.me/255695108009">+255 695 108 009</a>.</p>
          <a href="https://wa.me/255695108009" style="display: inline-block; background-color: #C8860A; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; margin-top: 20px; font-weight: bold;">WhatsApp Us</a>
        </div>
        ${getFooter()}
      </div>
    `;
}

module.exports = {
    getClientBookingEmailHTML,
    getAdminBookingEmailHTML,
    getClientGroupRequestEmailHTML,
    getAdminGroupRequestEmailHTML,
    getClientBookingReminderHTML
};
