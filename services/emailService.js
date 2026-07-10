const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.warn('⚠️ Email credentials not set. Skipping email.');
            return;
        }
        await transporter.sendMail({
            from: `"Tanzania Safari" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log('✅ Email sent to:', to);
    } catch (error) {
        console.error('❌ Email failed:', error);
        throw error;
    }
};

module.exports = { sendEmail };
