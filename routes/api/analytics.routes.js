const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const analyticsRepo = require('../../repositories/analytics.repository');

const pageviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many tracking requests' }
});

const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|headless|phantom|selenium|wget|curl|python-requests|scrapy/i;

function parseHost(ref) {
  try {
    return new URL(ref).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function normalizePath(raw) {
  let p = String(raw || '/').split('?')[0].split('#')[0] || '/';
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p.slice(0, 500);
}

router.post('/pageview', pageviewLimiter, async (req, res) => {
  try {
    const ua = req.headers['user-agent'] || '';
    if (BOT_UA.test(ua)) {
      return res.json({ success: true, skipped: 'bot' });
    }

    const path = normalizePath(req.body?.path || req.body?.page);
    if (!path || path.startsWith('/admin') || path.startsWith('/api') || path === '/health') {
      return res.json({ success: true, skipped: 'path' });
    }

    let ip = req.ip || req.headers['x-forwarded-for'] || null;
    if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
    if (ip === '::1') ip = '127.0.0.1';

    const referrer = req.body?.referrer || req.headers.referer || '';
    await analyticsRepo.recordPageView({
      session_id: String(req.body?.session_id || '').slice(0, 64) || null,
      path,
      title: req.body?.title,
      referrer,
      referrer_host: parseHost(referrer),
      utm_source: req.body?.utm_source,
      utm_medium: req.body?.utm_medium,
      utm_campaign: req.body?.utm_campaign,
      ip,
      user_agent: ua
    });

    res.json({ success: true });
  } catch (err) {
    console.error('pageview track error:', err.message);
    // Never break the site for analytics failures
    res.json({ success: true, tracked: false });
  }
});

module.exports = router;
