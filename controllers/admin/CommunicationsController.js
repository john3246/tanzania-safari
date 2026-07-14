const emailService = require('../../src/utils/emailService');
const db = require('../../config/db');

class CommunicationsController {
    async sendBroadcast(req, res) {
        try {
            const { recipientType, subject, bodyHtml, email } = req.body;
            
            if (!subject || !bodyHtml) {
                return res.status(400).json({ success: false, message: 'Subject and body are required' });
            }

            let recipients = [];

            if (recipientType === 'custom') {
                if (!email) return res.status(400).json({ success: false, message: 'Custom email address is required' });
                recipients.push(email);
            } else if (recipientType === 'all_users') {
                const users = await db.query('SELECT email FROM users WHERE is_active = true');
                recipients = users.rows.map(u => u.email);
            } else {
                return res.status(400).json({ success: false, message: 'Invalid recipient type' });
            }

            if (recipients.length === 0) {
                return res.status(400).json({ success: false, message: 'No recipients found' });
            }

            // In production, we should queue these or send in batches.
            // For now, we will send sequentially or via Promise.all (if list is small)
            // Using emailService.sendEmail directly
            
            const promises = recipients.map(recipientEmail => 
                emailService.sendEmail({
                    to: recipientEmail,
                    subject: subject,
                    html: bodyHtml
                }).catch(e => {
                    console.error(`Failed to send to ${recipientEmail}:`, e);
                })
            );

            await Promise.all(promises);

            res.status(200).json({
                success: true,
                message: `Successfully sent to ${recipients.length} recipients`,
                count: recipients.length
            });
        } catch (error) {
            console.error('Broadcast Error:', error);
            res.status(500).json({ success: false, message: 'Failed to send broadcast' });
        }
    }
}

module.exports = new CommunicationsController();
