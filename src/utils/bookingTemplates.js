const getHeader = () => `
  <div style="background-color: #0D47A1; padding: 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-family: sans-serif; font-size: 24px;">Tanzania Safari Magic</h1>
  </div>
`;

const getFooter = () => `
  <div style="background-color: #FBF6EE; padding: 20px; text-align: center; border-top: 2px solid #FF6F00; margin-top: 30px;">
    <p style="color: #666; margin: 0; font-family: sans-serif; font-size: 14px;">Tanzania Safari Magic &copy; ${new Date().getFullYear()}</p>
    <p style="color: #666; margin: 5px 0 0 0; font-family: sans-serif; font-size: 12px;">The ultimate adventure awaits.</p>
  </div>
`;

function getClientBookingEmailHTML(booking) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0D47A1; margin-top: 0;">Your Safari Booking is Confirmed!</h2>
          <p style="color: #333; line-height: 1.6;">Hi ${booking.customer_name || 'Traveler'},</p>
          <p style="color: #333; line-height: 1.6;">Thank you for booking with Tanzania Safari Magic. We have received your booking request and our team is already reviewing it. Here is a summary of your requested trip:</p>
          
          <div style="background-color: #FBF6EE; border-left: 4px solid #FF6F00; padding: 15px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Package ID:</strong> ${booking.package_id || 'Custom/General'}</p>
            <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${booking.travel_date || 'TBD'}</p>
            <p style="margin: 5px 0;"><strong>Travelers:</strong> ${booking.number_of_adults || 0} Adults, ${booking.number_of_children || 0} Children</p>
          </div>
          
          <p style="color: #333; line-height: 1.6;">One of our Safari Experts will contact you shortly at <strong>${booking.email}</strong> or <strong>${booking.phone}</strong> to finalize your itinerary and discuss any special requirements.</p>
          
          <a href="https://tanzaniasafarimagic.com" style="display: inline-block; background-color: #FF6F00; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; margin-top: 20px; font-weight: bold;">Visit Our Website</a>
        </div>
        ${getFooter()}
      </div>
    `;
}

function getAdminBookingEmailHTML(booking) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
        ${getHeader()}
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #FF6F00; margin-top: 0;">New Booking Received!</h2>
          <p style="color: #333; line-height: 1.6;">A new booking has just been submitted on the website. Please review the details below and contact the client.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold; width: 35%;">Client Name</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.customer_name}</td>
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
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Package ID</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.package_id || 'General/Custom'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9; font-weight: bold;">Travel Date</td>
              <td style="padding: 10px; border: 1px solid #eee;">${booking.travel_date || 'N/A'}</td>
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

module.exports = {
    getClientBookingEmailHTML,
    getAdminBookingEmailHTML
};
