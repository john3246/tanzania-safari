/**
 * Resolve visitor country for first-party analytics.
 * Prefer CDN headers (Cloudflare / Vercel / CloudFront), then a cached
 * free IP lookup. Never blocks the request for more than a short timeout.
 */
const cache = new Map(); // ip -> { country, ts }
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 5000;

function isPrivateIp(ip) {
  if (!ip) return true;
  const s = String(ip).replace(/^::ffff:/, '');
  if (s === '127.0.0.1' || s === '::1' || s === '0.0.0.0') return true;
  if (/^10\./.test(s)) return true;
  if (/^192\.168\./.test(s)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(s)) return true;
  if (/^fc|fd|fe80/i.test(s)) return true;
  return false;
}

function countryFromHeaders(req) {
  const h = req.headers || {};
  const raw =
    h['cf-ipcountry'] ||
    h['x-vercel-ip-country'] ||
    h['cloudfront-viewer-country'] ||
    h['x-country-code'] ||
    h['x-appengine-country'] ||
    '';
  const code = String(raw).trim().toUpperCase();
  if (!code || code === 'XX' || code === 'T1') return null;
  return codeToName(code) || code;
}

const ISO_NAMES = {
  US: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  AT: 'Austria',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  IE: 'Ireland',
  PT: 'Portugal',
  PL: 'Poland',
  CZ: 'Czechia',
  AU: 'Australia',
  NZ: 'New Zealand',
  CA: 'Canada',
  ZA: 'South Africa',
  KE: 'Kenya',
  TZ: 'Tanzania',
  UG: 'Uganda',
  RW: 'Rwanda',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  IN: 'India',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  MY: 'Malaysia',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  IL: 'Israel',
  TR: 'Turkey',
  RU: 'Russia',
  UA: 'Ukraine',
  RO: 'Romania',
  HU: 'Hungary',
  GR: 'Greece',
  CZ: 'Czech Republic'
};

function codeToName(code) {
  return ISO_NAMES[code] || null;
}

async function lookupIpCountry(ip) {
  if (!ip || isPrivateIp(ip)) return null;
  const key = String(ip);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.country;

  let country = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 900);
    // ip-api.com free tier (non-HTTPS for free) — fields limited
    const url = `http://ip-api.com/json/${encodeURIComponent(key)}?fields=status,country,countryCode`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        country = data.country || codeToName(data.countryCode) || data.countryCode || null;
      }
    }
  } catch (_) {
    country = null;
  }

  if (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
  cache.set(key, { country, ts: Date.now() });
  return country;
}

/**
 * Extract search keyword from UTM term or organic referrer query strings.
 */
function extractSearchKeyword({ utm_term, referrer } = {}) {
  const term = String(utm_term || '').trim();
  if (term) return term.slice(0, 180);

  const ref = String(referrer || '').trim();
  if (!ref) return null;
  try {
    const u = new URL(ref);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    const isSearch =
      /google\./.test(host) ||
      /bing\./.test(host) ||
      /yahoo\./.test(host) ||
      /duckduckgo\./.test(host) ||
      /yandex\./.test(host) ||
      /baidu\./.test(host);
    if (!isSearch) return null;
    const q =
      u.searchParams.get('q') ||
      u.searchParams.get('query') ||
      u.searchParams.get('p') ||
      u.searchParams.get('text') ||
      u.searchParams.get('wd');
    if (!q) return null;
    return decodeURIComponent(String(q)).replace(/\+/g, ' ').trim().slice(0, 180) || null;
  } catch {
    return null;
  }
}

async function resolveCountry(req, ip) {
  const fromHeader = countryFromHeaders(req);
  if (fromHeader) return fromHeader;
  return lookupIpCountry(ip);
}

module.exports = {
  countryFromHeaders,
  lookupIpCountry,
  resolveCountry,
  extractSearchKeyword,
  codeToName,
  isPrivateIp
};
