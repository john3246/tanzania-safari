const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 465,
  secure: process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Tanzania Safari Magic" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email via Namecheap SMTP:', error);
    throw error;
  }
};

module.exports = sendEmail;
