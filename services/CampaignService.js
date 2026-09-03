/**
 * Campaign broadcasts — audience from newsletter + customers + bookings.
 * Batches of 100; never sends the same campaign to the same email twice.
 */
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../src/utils/emailService');
const { notifyAdmins, logAudit } = require('./adminEvents');

const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function wrapCampaignHtml({ title, intro, itemsHtml, ctaUrl, ctaLabel }) {
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
  return `
  <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5ebe3;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2C391C,#465B2D);padding:28px;text-align:center;color:#fff">
      <img src="${site}/images/logo.png" alt="Tanzania Safari Magic" width="56" height="56" style="border-radius:10px;background:#fff;padding:6px">
      <h1 style="margin:12px 0 0;font-size:22px">${title || 'Tanzania Safari Magic'}</h1>
      <p style="margin:8px 0 0;opacity:.9;font-size:14px">Private safaris from Arusha</p>
    </div>
    <div style="height:4px;background:#C8860A"></div>
    <div style="padding:28px;color:#475569;font-size:15px;line-height:1.6">
      ${intro ? `<p>${intro}</p>` : ''}
      ${itemsHtml || ''}
      ${ctaUrl ? `<p style="margin-top:24px"><a href="${ctaUrl}" style="display:inline-block;background:#C8860A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700">${ctaLabel || 'Explore'}</a></p>` : ''}
    </div>
    <div style="background:#f0f3ef;padding:20px;text-align:center;font-size:13px;color:#64748b">
      <p style="margin:0 0 8px"><strong style="color:#2C391C">Tanzania Safari Magic</strong> · Arusha, Tanzania</p>
      <p style="margin:0 0 8px"><a href="mailto:info@tanzaniasafarimagic.com" style="color:#465B2D;font-weight:700">Email</a> · <a href="https://wa.me/255695108009" style="color:#465B2D;font-weight:700">WhatsApp</a></p>
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
    CREATE TABLE IF NOT EXISTS email_campaign_recipients (
      id bigserial PRIMARY KEY,
      campaign_id uuid NOT NULL REFERENCES email_campaigns(campaign_id) ON DELETE CASCADE,
      email varchar(255) NOT NULL,
      source varchar(40),
      sent_at timestamptz DEFAULT NOW(),
      UNIQUE (campaign_id, email)
    )
  `).catch(() => {});

  await db.query(`
    ALTER TABLE newsletter_subscribers
      ADD COLUMN IF NOT EXISTS unsubscribe_token varchar(64),
      ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS full_name varchar(150)
  `).catch(() => {});
}

/**
 * Unique audience: newsletter + customers + booking emails.
 */
async function getCampaignAudience() {
  await ensureCampaignTables();
  const map = new Map();

  const add = (email, name, source) => {
    const key = String(email || '').trim().toLowerCase();
    if (!key || !key.includes('@')) return;
    if (!map.has(key)) {
      map.set(key, {
        email: key,
        full_name: name || null,
        source: source || 'unknown',
        unsubscribe_token: null
      });
    } else if (name && !map.get(key).full_name) {
      map.get(key).full_name = name;
    }
  };

  // Newsletter
  try {
    const news = await db.query(`
      SELECT email, full_name, unsubscribe_token
      FROM newsletter_subscribers
      WHERE COALESCE(is_active, true) = true AND email IS NOT NULL AND email <> ''
    `);
    for (const r of news.rows) {
      add(r.email, r.full_name, 'newsletter');
      if (r.unsubscribe_token && map.has(String(r.email).toLowerCase())) {
        map.get(String(r.email).toLowerCase()).unsubscribe_token = r.unsubscribe_token;
      }
    }
  } catch (e) {
    console.warn('newsletter audience:', e.message);
  }

  // Customers CRM
  try {
    const cust = await db.query(`
      SELECT email, name FROM customers
      WHERE email IS NOT NULL AND email <> ''
    `);
    for (const r of cust.rows) add(r.email, r.name, 'customer');
  } catch (e) {
    console.warn('customers audience:', e.message);
  }

  // Bookings
  try {
    const books = await db.query(`
      SELECT DISTINCT LOWER(email) AS email,
             COALESCE(customer_name, full_name) AS full_name
      FROM bookings
      WHERE email IS NOT NULL AND TRIM(email) <> ''
    `);
    for (const r of books.rows) add(r.email, r.full_name, 'booking');
  } catch (e) {
    // column names may vary
    try {
      const books = await db.query(`
        SELECT DISTINCT LOWER(email) AS email FROM bookings WHERE email IS NOT NULL AND email <> ''
      `);
      for (const r of books.rows) add(r.email, null, 'booking');
    } catch (e2) {
      console.warn('bookings audience:', e2.message);
    }
  }

  return Array.from(map.values());
}

async function getActiveSubscribers() {
  return getCampaignAudience();
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

async function ensureRecipientTokens(recipients) {
  for (const s of recipients) {
    if (s.unsubscribe_token) continue;
    const token = crypto.randomBytes(24).toString('hex');
    s.unsubscribe_token = token;
    await db.query(
      `UPDATE newsletter_subscribers SET unsubscribe_token = $1 WHERE LOWER(email) = LOWER($2)`,
      [token, s.email]
    ).catch(() => {});
  }
}

async function sendToSubscribers({ subject, bodyHtml, campaignType = 'custom', contentRef = null, sentBy = null, req = null }) {
  if (!subject || !bodyHtml) {
    const err = new Error('Subject and body are required');
    err.status = 400;
    throw err;
  }

  await ensureCampaignTables();
  const audience = await getCampaignAudience();
  if (!audience.length) {
    const err = new Error('No recipients found (newsletter, customers, or bookings)');
    err.status = 400;
    throw err;
  }

  await ensureRecipientTokens(audience);

  const campaignRes = await db.query(
    `INSERT INTO email_campaigns (campaign_type, subject, body_html, content_ref, status, recipients_count, sent_by)
     VALUES ($1, $2, $3, $4, 'sending', 0, $5)
     RETURNING *`,
    [campaignType, subject, bodyHtml, contentRef, sentBy]
  );
  const campaign = campaignRes.rows[0];
  const campaignId = campaign.campaign_id;

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < audience.length; i += BATCH_SIZE) {
    const batch = audience.slice(i, i + BATCH_SIZE);
    for (const s of batch) {
      // Claim slot — unique (campaign_id, email) prevents double send
      let claimed = false;
      try {
        await db.query(
          `INSERT INTO email_campaign_recipients (campaign_id, email, source)
           VALUES ($1, $2, $3)`,
          [campaignId, s.email, s.source]
        );
        claimed = true;
      } catch (dup) {
        skipped++;
        continue;
      }

      try {
        await emailService.sendEmail({
          to: s.email,
          subject,
          html: personalize(bodyHtml, s)
        });
        sent++;
      } catch (e) {
        failed++;
        console.error(`Campaign email failed for ${s.email}:`, e.message);
        // Keep recipient row so we don't retry the same campaign endlessly
      }
    }

    if (i + BATCH_SIZE < audience.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  await db.query(
    `UPDATE email_campaigns SET status = 'sent', recipients_count = $1 WHERE campaign_id = $2`,
    [sent, campaignId]
  ).catch(() => {});

  await notifyAdmins({
    type: 'email',
    title: 'Campaign sent',
    message: `"${subject}" → ${sent} sent, ${skipped} skipped (already sent), ${failed} failed · batches of ${BATCH_SIZE}`,
    actionUrl: '/admin/communications'
  });

  await logAudit({
    userId: sentBy,
    action: 'campaign_send',
    entityType: 'email_campaign',
    entityId: campaignId,
    newValues: { subject, campaignType, sent, skipped, failed, audience: audience.length },
    req
  });

  return {
    sent,
    skipped,
    failed,
    total: audience.length,
    batches: Math.ceil(audience.length / BATCH_SIZE),
    campaign: { ...campaign, recipients_count: sent, status: 'sent' }
  };
}

async function buildContentCampaign(type, refId) {
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';

  if (type === 'tour' || type === 'package') {
    const r = await db.query(
      `SELECT package_id, package_name, package_slug, short_description, base_price_usd, featured_image_url
       FROM safari_packages WHERE package_id::text = $1 OR package_slug = $1 LIMIT 1`,
      [String(refId)]
    );
    const p = r.rows[0];
    if (!p) throw Object.assign(new Error('Tour not found'), { status: 404 });
    return {
      subject: `Safari spotlight: ${p.package_name}`,
      bodyHtml: wrapCampaignHtml({
        title: p.package_name,
        intro: p.short_description || 'A curated Tanzania safari from Our Team in Arusha.',
        itemsHtml: `
          ${p.featured_image_url ? `<img src="${p.featured_image_url}" alt="" style="width:100%;border-radius:12px;margin:12px 0">` : ''}
          <p><strong>From $${Number(p.base_price_usd || 0).toLocaleString()} USD</strong> · private itinerary</p>
        `,
        ctaUrl: `${site}/safaris/${p.package_slug}`,
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
  getCampaignAudience,
  sendToSubscribers,
  buildContentCampaign,
  ensureCampaignTables,
  BATCH_SIZE
};
