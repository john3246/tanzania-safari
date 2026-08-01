const emailService = require('../../src/utils/emailService');
const db = require('../../config/db');
const campaignService = require('../../services/CampaignService');
const { notifyAdmins, logAudit } = require('../../services/adminEvents');

class CommunicationsController {
    async sendBroadcast(req, res) {
        try {
            const { recipientType, subject, bodyHtml, email, campaignType, contentRef, offer } = req.body;

            if (recipientType === 'subscribers' || recipientType === 'newsletter') {
                let built = null;
                if (campaignType && campaignType !== 'custom' && (contentRef || offer)) {
                    built = await campaignService.buildContentCampaign(
                        campaignType,
                        campaignType === 'offer' || campaignType === 'discount' ? (offer || contentRef) : contentRef
                    );
                }
                const result = await campaignService.sendToSubscribers({
                    subject: subject || built?.subject,
                    bodyHtml: bodyHtml || built?.bodyHtml,
                    campaignType: campaignType || 'custom',
                    contentRef: built?.contentRef || contentRef || null,
                    sentBy: req.user?.user_id,
                    req
                });
                return res.json({
                    success: true,
                    message: `Campaign sent to ${result.sent} subscriber(s)`,
                    count: result.sent,
                    data: result
                });
            }

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

            if (!recipients.length) {
                return res.status(400).json({ success: false, message: 'No recipients found' });
            }

            const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
            const wrapped = `
              <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5ebe3;border-radius:16px;overflow:hidden">
                <div style="background:#263E22;padding:24px;text-align:center;color:#fff">
                  <img src="${site}/images/logo.png" width="48" height="48" style="border-radius:8px;background:#fff;padding:4px" alt="">
                  <h1 style="margin:10px 0 0;font-size:20px">Tanzania Safari Magic</h1>
                </div>
                <div style="height:4px;background:#FF6F00"></div>
                <div style="padding:28px;color:#475569;font-size:15px;line-height:1.6">${bodyHtml}</div>
                <div style="background:#f0f3ef;padding:16px;text-align:center;font-size:12px;color:#64748b">Arusha, Tanzania · Quotes &amp; offline deposits</div>
              </div>`;

            await Promise.all(recipients.map(recipientEmail =>
                emailService.sendEmail({ to: recipientEmail, subject, html: wrapped }).catch(e => {
                    console.error(`Failed to send to ${recipientEmail}:`, e.message);
                })
            ));

            await notifyAdmins({
                type: 'email',
                title: 'Broadcast sent',
                message: `"${subject}" sent to ${recipients.length} recipient(s)`,
                actionUrl: '/admin/communications'
            });
            await logAudit({
                userId: req.user?.user_id,
                action: 'email_broadcast',
                entityType: 'communications',
                newValues: { subject, count: recipients.length, recipientType },
                req
            });

            res.json({
                success: true,
                message: `Successfully sent to ${recipients.length} recipients`,
                count: recipients.length
            });
        } catch (error) {
            console.error('Broadcast Error:', error);
            res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to send broadcast' });
        }
    }

    async listSubscribers(req, res) {
        try {
            const rows = await campaignService.getActiveSubscribers();
            res.json({ success: true, data: rows, count: rows.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async listCampaigns(req, res) {
        try {
            await campaignService.ensureCampaignTables();
            const result = await db.query(
                `SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 50`
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async previewCampaign(req, res) {
        try {
            const { campaignType, contentRef, offer } = req.body || {};
            const built = await campaignService.buildContentCampaign(
                campaignType,
                campaignType === 'offer' || campaignType === 'discount' ? (offer || contentRef) : contentRef
            );
            res.json({ success: true, data: built });
        } catch (error) {
            res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }

    async contentOptions(req, res) {
        try {
            const [tours, destinations, blogs, reviews] = await Promise.all([
                db.query(`SELECT package_id as id, package_name as title, package_slug as slug FROM safari_packages WHERE is_active = true ORDER BY package_name LIMIT 100`).catch(() => ({ rows: [] })),
                db.query(`SELECT park_id as id, park_name as title, park_slug as slug FROM national_parks WHERE is_active = true ORDER BY park_name LIMIT 100`).catch(() => ({ rows: [] })),
                db.query(`SELECT post_id as id, post_title as title, post_slug as slug FROM blog_posts WHERE is_published = true ORDER BY published_at DESC NULLS LAST LIMIT 100`).catch(() => ({ rows: [] })),
                db.query(`SELECT review_id as id, COALESCE(first_name,'Guest') as title, rating FROM reviews WHERE is_approved = true ORDER BY created_at DESC LIMIT 50`).catch(() => ({ rows: [] }))
            ]);
            res.json({
                success: true,
                data: {
                    tours: tours.rows,
                    destinations: destinations.rows,
                    blogs: blogs.rows,
                    reviews: reviews.rows
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CommunicationsController();
