const crypto = require('crypto');
const db = require('../config/db');

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(String(ip) + (process.env.JWT_SECRET || 'tsm')).digest('hex').slice(0, 32);
}

function classifySource(referrer, utmSource, utmMedium) {
  const utm = String(utmSource || '').toLowerCase().trim();
  if (utm) {
    if (/google|bing|yahoo|duckduck|baidu|yandex/.test(utm)) return 'Organic Search';
    if (/facebook|instagram|twitter|x\.com|tiktok|linkedin|youtube|whatsapp/.test(utm)) return 'Social';
    if (/email|newsletter|mailchimp/.test(utm) || String(utmMedium || '').toLowerCase() === 'email') return 'Email';
    if (/cpc|ppc|ads|adwords|paid/.test(utm) || /cpc|ppc|paid/.test(String(utmMedium || '').toLowerCase())) return 'Paid Ads';
    return `Campaign: ${utmSource}`;
  }

  const ref = String(referrer || '').trim();
  if (!ref) return 'Direct';

  let host = '';
  try {
    host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'Referral';
  }

  if (/tanzaniasafarimagic\.com|localhost|127\.0\.0\.1/.test(host)) return 'Internal';
  if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\./.test(host)) return 'Organic Search';
  if (/facebook\.|instagram\.|twitter\.|x\.com|t\.co|tiktok\.|linkedin\.|youtube\.|whatsapp\./.test(host)) return 'Social';
  return host || 'Referral';
}

function rangeBounds(range) {
  const now = new Date();
  const end = now;
  let start = new Date(now);
  let bucket = 'day';
  let labelFmt = 'Mon DD';

  switch (String(range || 'month').toLowerCase()) {
    case 'day':
    case 'today':
      start.setHours(0, 0, 0, 0);
      bucket = 'hour';
      labelFmt = 'HH24:00';
      break;
    case 'week':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      bucket = 'day';
      labelFmt = 'Dy DD';
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      bucket = 'month';
      labelFmt = 'Mon';
      break;
    case 'month':
    default:
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      bucket = 'day';
      labelFmt = 'Mon DD';
      break;
  }
  return { start, end, bucket, labelFmt };
}

class AnalyticsRepository {
  async recordPageView(data) {
    const source = classifySource(data.referrer, data.utm_source, data.utm_medium);
    const result = await db.query(
      `INSERT INTO page_views (
         session_id, path, title, referrer, referrer_host, source,
         utm_source, utm_medium, utm_campaign, utm_term, search_keyword,
         ip_hash, user_agent, country, viewed_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
       RETURNING view_id`,
      [
        data.session_id || null,
        (data.path || '/').slice(0, 500),
        (data.title || '').slice(0, 300) || null,
        (data.referrer || '').slice(0, 1000) || null,
        data.referrer_host || null,
        source,
        data.utm_source || null,
        data.utm_medium || null,
        data.utm_campaign || null,
        data.utm_term ? String(data.utm_term).slice(0, 180) : null,
        data.search_keyword ? String(data.search_keyword).slice(0, 180) : null,
        hashIp(data.ip),
        (data.user_agent || '').slice(0, 500) || null,
        data.country ? String(data.country).slice(0, 80) : null
      ]
    );
    return result.rows[0];
  }

  async getOverview(range = 'month') {
    const { start, end, bucket } = rangeBounds(range);

    const trunc = bucket === 'hour' ? 'hour' : bucket === 'month' ? 'month' : 'day';
    const labelExpr =
      trunc === 'hour'
        ? `to_char(date_trunc('hour', viewed_at), 'HH24:00')`
        : trunc === 'month'
          ? `to_char(date_trunc('month', viewed_at), 'Mon YYYY')`
          : `to_char(date_trunc('day', viewed_at), 'Mon DD')`;

    const series = await db.query(
      `SELECT date_trunc('${trunc}', viewed_at) AS bucket,
              ${labelExpr} AS label,
              COUNT(*)::int AS views,
              COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS visitors
       FROM page_views
       WHERE viewed_at >= $1 AND viewed_at <= $2
       GROUP BY 1, 2
       ORDER BY 1 ASC`,
      [start.toISOString(), end.toISOString()]
    );

    const totals = await db.query(
      `SELECT
         COUNT(*)::int AS page_views,
         COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS unique_visitors,
         COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE)::int AS today_views,
         COUNT(DISTINCT COALESCE(session_id, ip_hash))
           FILTER (WHERE viewed_at >= CURRENT_DATE)::int AS today_visitors
       FROM page_views
       WHERE viewed_at >= $1 AND viewed_at <= $2`,
      [start.toISOString(), end.toISOString()]
    );

    const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const prev = await db.query(
      `SELECT COUNT(*)::int AS page_views,
              COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS unique_visitors
       FROM page_views
       WHERE viewed_at >= $1 AND viewed_at < $2`,
      [prevStart.toISOString(), start.toISOString()]
    );

    const sources = await db.query(
      `SELECT source,
              COUNT(*)::int AS views,
              COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS visitors
       FROM page_views
       WHERE viewed_at >= $1 AND viewed_at <= $2
         AND source <> 'Internal'
       GROUP BY source
       ORDER BY views DESC
       LIMIT 12`,
      [start.toISOString(), end.toISOString()]
    );

    const referrers = await db.query(
      `SELECT COALESCE(NULLIF(referrer_host, ''), source) AS host,
              COUNT(*)::int AS views
       FROM page_views
       WHERE viewed_at >= $1 AND viewed_at <= $2
         AND source NOT IN ('Direct', 'Internal')
         AND (referrer_host IS NOT NULL OR source NOT IN ('Direct'))
       GROUP BY 1
       ORDER BY views DESC
       LIMIT 15`,
      [start.toISOString(), end.toISOString()]
    );

    const pages = await db.query(
      `SELECT path,
              COUNT(*)::int AS views,
              COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS visitors
       FROM page_views
       WHERE viewed_at >= $1 AND viewed_at <= $2
       GROUP BY path
       ORDER BY views DESC
       LIMIT 15`,
      [start.toISOString(), end.toISOString()]
    );

    let countries = { rows: [] };
    let keywords = { rows: [] };
    try {
      countries = await db.query(
        `SELECT COALESCE(NULLIF(TRIM(country), ''), 'Unknown') AS country,
                COUNT(*)::int AS views,
                COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS visitors
         FROM page_views
         WHERE viewed_at >= $1 AND viewed_at <= $2
         GROUP BY 1
         ORDER BY views DESC
         LIMIT 20`,
        [start.toISOString(), end.toISOString()]
      );
    } catch (_) { /* column may not exist until migration */ }

    try {
      keywords = await db.query(
        `SELECT search_keyword AS keyword,
                COUNT(*)::int AS views,
                COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS visitors
         FROM page_views
         WHERE viewed_at >= $1 AND viewed_at <= $2
           AND search_keyword IS NOT NULL
           AND TRIM(search_keyword) <> ''
         GROUP BY search_keyword
         ORDER BY views DESC
         LIMIT 25`,
        [start.toISOString(), end.toISOString()]
      );
    } catch (_) { /* column may not exist until migration */ }

    const t = totals.rows[0] || {};
    const p = prev.rows[0] || {};
    const viewsChange = p.page_views
      ? Math.round(((t.page_views - p.page_views) / p.page_views) * 100)
      : null;
    const visitorsChange = p.unique_visitors
      ? Math.round(((t.unique_visitors - p.unique_visitors) / p.unique_visitors) * 100)
      : null;

    const topCountry = (countries.rows || []).find((c) => c.country && c.country !== 'Unknown');

    return {
      range,
      start: start.toISOString(),
      end: end.toISOString(),
      totals: {
        page_views: t.page_views || 0,
        unique_visitors: t.unique_visitors || 0,
        today_views: t.today_views || 0,
        today_visitors: t.today_visitors || 0,
        views_change_pct: viewsChange,
        visitors_change_pct: visitorsChange,
        top_country: topCountry ? topCountry.country : null
      },
      series: {
        labels: series.rows.map(r => r.label),
        views: series.rows.map(r => r.views),
        visitors: series.rows.map(r => r.visitors)
      },
      sources: sources.rows,
      referrers: referrers.rows,
      top_pages: pages.rows,
      countries: countries.rows || [],
      keywords: keywords.rows || []
    };
  }

  async getDashboardSnapshot() {
    try {
      const r = await db.query(`
        SELECT
          COUNT(*)::int AS all_time_views,
          COUNT(DISTINCT COALESCE(session_id, ip_hash))::int AS all_time_visitors,
          COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE)::int AS today_views,
          COUNT(*) FILTER (WHERE viewed_at >= date_trunc('week', CURRENT_DATE))::int AS week_views,
          COUNT(*) FILTER (WHERE viewed_at >= date_trunc('month', CURRENT_DATE))::int AS month_views,
          COUNT(*) FILTER (WHERE viewed_at >= date_trunc('year', CURRENT_DATE))::int AS year_views
        FROM page_views
      `);
      return r.rows[0] || {};
    } catch {
      return {};
    }
  }
}

module.exports = new AnalyticsRepository();
module.exports.classifySource = classifySource;
module.exports.hashIp = hashIp;
