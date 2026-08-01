/**
 * Newsletter / content campaign broadcasts to subscribers.
 */
const db = require('../config/db');
const emailService = require('../src/utils/emailService');
const { notifyAdmins, logAudit } = require('./adminEvents');

function wrapCampaignHtml({ title, intro, itemsHtml, ctaUrl, ctaLabel }) {
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
  return `
  <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5ebe3;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1E311B,#263E22);padding:28px;text-align:center;color:#fff">
      <img src="${site}/images/logo.png" alt="Tanzania Safari Magic" width="56" height="56" style="border-radius:10px;background:#fff;padding:6px">
      <h1 style="margin:12px 0 0;font-size:22px">${title || 'Tanzania Safari Magic'}</h1>
      <p style="margin:8px 0 0;opacity:.9;font-size:14px">Private safaris from Arusha</p>
    </div>
    <div style="height:4px;background:#FF6F00"></div>
    <div style="padding:28px;color:#475569;font-size:15px;line-height:1.6">
      ${intro ? `<p>${intro}</p>` : ''}
      ${itemsHtml || ''}
      ${ctaUrl ? `<p style="margin-top:24px"><a href="${ctaUrl}" style="display:inline-block;background:#FF6F00;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700">${ctaLabel || 'Explore'}</a></p>` : ''}
    </div>
    <div style="background:#f0f3ef;padding:20px;text-align:center;font-size:13px;color:#64748b">
      <p style="margin:0 0 8px"><strong style="color:#1E311B">Tanzania Safari Magic</strong> · Arusha, Tanzania</p>
      <p style="margin:0 0 8px"><a href="mailto:info@tanzaniasafarimagic.com" style="color:#263E22;font-weight:700">Email</a> · <a href="https://wa.me/255695108009" style="color:#263E22;font-weight:700">WhatsApp</a></p>
      <p style="margin:0;font-size:12px"><a href="{{unsubscribe_url}}" style="color:#64748b">Unsubscribe</a></p>
    </div>
  </div>`;
}

async function ensureCampaignTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS email_campaigns (
      campaign_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_type varchar(50) NOT NULL,
      subject varchar(255) NOT NULL,
      preview_text text,
      body_html text NOT NULL,
      content_ref varchar(100),
      status varchar(30) DEFAULT 'sent',
      recipients_count integer DEFAULT 0,
      sent_by uuid,
      created_at timestamptz DEFAULT NOW()
    )
  `).catch(() => {});
  await db.query(`
    ALTER TABLE newsletter_subscribers
      ADD COLUMN IF NOT EXISTS unsubscribe_token varchar(64),
      ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true
  `).catch(() => {});
}

async function getActiveSubscribers() {
  await ensureCampaignTables();
  const result = await db.query(`
    SELECT subscriber_id, email, full_name, unsubscribe_token
    FROM newsletter_subscribers
    WHERE COALESCE(is_active, true) = true
      AND email IS NOT NULL AND email <> ''
    ORDER BY subscribed_at DESC NULLS LAST
  `).catch(async () => {
    return db.query(`SELECT subscriber_id, email, full_name FROM newsletter_subscribers`);
  });
  return result.rows || [];
}

function personalize(html, subscriber) {
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
  const token = subscriber.unsubscribe_token || Buffer.from(subscriber.email).toString('base64url');
  const unsub = `${site}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${encodeURIComponent(token)}`;
  return html
    .replace(/\{\{unsubscribe_url\}\}/g, unsub)
    .replace(/\{\{name\}\}/g, subscriber.full_name || 'Traveler')
    .replace(/\{\{email\}\}/g, subscriber.email);
}

async function sendToSubscribers({ subject, bodyHtml, campaignType = 'custom', contentRef = null, sentBy = null, req = null }) {
  await ensureCampaignTables();
  const subscribers = await getActiveSubscribers();
  if (!subscribers.length) {
    const err = new Error('No active newsletter subscribers');
    err.status = 400;
    throw err;
  }

  // Ensure tokens exist
  for (const s of subscribers) {
    if (!s.unsubscribe_token) {
      const token = require('crypto').randomBytes(24).toString('hex');
      await db.query(
        `UPDATE newsletter_subscribers SET unsubscribe_token = $1 WHERE subscriber_id = $2 OR email = $3`,
        [token, s.subscriber_id, s.email]
      ).catch(() => {});
      s.unsubscribe_token = token;
    }
  }

  let sent = 0;
  for (const s of subscribers) {
    try {
      await emailService.sendEmail({
        to: s.email,
        subject,
        html: personalize(bodyHtml, s)
      });
      sent++;
    } catch (e) {
      console.error(`Campaign email failed for ${s.email}:`, e.message);
    }
  }

  const campaign = await db.query(
    `INSERT INTO email_campaigns (campaign_type, subject, body_html, content_ref, status, recipients_count, sent_by)
     VALUES ($1, $2, $3, $4, 'sent', $5, $6)
     RETURNING *`,
    [campaignType, subject, bodyHtml, contentRef, sent, sentBy]
  ).catch(() => ({ rows: [] }));

  await notifyAdmins({
    type: 'email',
    title: 'Campaign sent',
    message: `"${subject}" delivered to ${sent} subscriber(s)`,
    actionUrl: '/admin/communications'
  });

  await logAudit({
    userId: sentBy,
    action: 'campaign_send',
    entityType: 'email_campaign',
    entityId: campaign.rows[0]?.campaign_id,
    newValues: { subject, campaignType, recipients: sent },
    req
  });

  return { sent, total: subscribers.length, campaign: campaign.rows[0] || null };
}

async function buildContentCampaign(type, refId) {
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';

  if (type === 'tour' || type === 'package') {
    const r = await db.query(
      `SELECT package_id, package_name, package_slug, short_description, base_price_usd, featured_image_url
       FROM safari_packages WHERE package_id = $1 OR package_slug = $1 LIMIT 1`,
      [refId]
    );
    const p = r.rows[0];
    if (!p) throw Object.assign(new Error('Tour not found'), { status: 404 });
    const url = `${site}/safaris/${p.package_slug}`;
    return {
      subject: `Safari spotlight: ${p.package_name}`,
      bodyHtml: wrapCampaignHtml({
        title: p.package_name,
        intro: p.short_description || 'A curated Tanzania safari from Our Team in Arusha.',
        itemsHtml: `
          ${p.featured_image_url ? `<img src="${p.featured_image_url}" alt="" style="width:100%;border-radius:12px;margin:12px 0">` : ''}
          <p><strong>From $${Number(p.base_price_usd || 0).toLocaleString()} USD</strong> · private itinerary</p>
        `,
        ctaUrl: url,
        ctaLabel: 'View this safari'
      }),
      contentRef: String(p.package_id)
    };
  }

  if (type === 'destination') {
    const r = await db.query(
      `SELECT park_id, park_name, park_slug, short_description, featured_image_url
       FROM national_parks WHERE park_id::text = $1 OR park_slug = $1 LIMIT 1`,
      [String(refId)]
    );
    const d = r.rows[0];
    if (!d) throw Object.assign(new Error('Destination not found'), { status: 404 });
    return {
      subject: `Discover ${d.park_name}`,
      bodyHtml: wrapCampaignHtml({
        title: d.park_name,
        intro: d.short_description || 'Explore this Tanzania destination with Our Team.',
        itemsHtml: d.featured_image_url ? `<img src="${d.featured_image_url}" alt="" style="width:100%;border-radius:12px;margin:12px 0">` : '',
        ctaUrl: `${site}/destinations/${d.park_slug}`,
        ctaLabel: 'Explore destination'
      }),
      contentRef: String(d.park_id)
    };
  }

  if (type === 'blog') {
    const r = await db.query(
      `SELECT post_id, post_title, post_slug, post_excerpt, featured_image_url
       FROM blog_posts WHERE post_id::text = $1 OR post_slug = $1 LIMIT 1`,
      [String(refId)]
    );
    const b = r.rows[0];
    if (!b) throw Object.assign(new Error('Blog post not found'), { status: 404 });
    return {
      subject: b.post_title,
      bodyHtml: wrapCampaignHtml({
        title: b.post_title,
        intro: b.post_excerpt || 'New safari guide from Tanzania Safari Magic.',
        itemsHtml: b.featured_image_url ? `<img src="${b.featured_image_url}" alt="" style="width:100%;border-radius:12px;margin:12px 0">` : '',
        ctaUrl: `${site}/blog/${b.post_slug}`,
        ctaLabel: 'Read the guide'
      }),
      contentRef: String(b.post_id)
    };
  }

  if (type === 'offer' || type === 'discount') {
    return {
      subject: refId?.subject || 'Special safari offer from Tanzania Safari Magic',
      bodyHtml: wrapCampaignHtml({
        title: refId?.title || 'Limited-time safari offer',
        intro: refId?.message || 'Save on selected departures — reply or book a free quote.',
        itemsHtml: refId?.detailsHtml || '',
        ctaUrl: refId?.ctaUrl || `${site}/group-safaris`,
        ctaLabel: refId?.ctaLabel || 'See offers'
      }),
      contentRef: 'offer'
    };
  }

  if (type === 'review') {
    const r = await db.query(
      `SELECT review_id, first_name, last_name, rating, comment, review_text
       FROM reviews WHERE review_id::text = $1 LIMIT 1`,
      [String(refId)]
    ).catch(() => ({ rows: [] }));
    const rev = r.rows[0];
    if (!rev) throw Object.assign(new Error('Review not found'), { status: 404 });
    const text = rev.comment || rev.review_text || '';
    return {
      subject: 'Traveler story from the Tanzanian bush',
      bodyHtml: wrapCampaignHtml({
        title: 'Guest review',
        intro: `"${text.slice(0, 280)}${text.length > 280 ? '…' : ''}"`,
        itemsHtml: `<p>— ${[rev.first_name, rev.last_name].filter(Boolean).join(' ')} · ${rev.rating || 5}/5</p>`,
        ctaUrl: `${site}/`,
        ctaLabel: 'Plan your safari'
      }),
      contentRef: String(rev.review_id)
    };
  }

  throw Object.assign(new Error('Unknown campaign type'), { status: 400 });
}

module.exports = {
  wrapCampaignHtml,
  getActiveSubscribers,
  sendToSubscribers,
  buildContentCampaign,
  ensureCampaignTables
};
