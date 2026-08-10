/**
 * Google Analytics 4 tag — keep exact snippet Google expects for installation checks.
 * Measurement ID: G-ZNT5VEXJ8F
 */
const GA_MEASUREMENT_ID = 'G-ZNT5VEXJ8F';

const GTAG_SNIPPET = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_MEASUREMENT_ID}');
</script>`;

function hasGtag(html) {
  if (typeof html !== 'string') return false;
  return (
    html.includes(GA_MEASUREMENT_ID) ||
    html.includes('googletagmanager.com/gtag/js') ||
    html.includes('googletagmanager.com/gtm.js')
  );
}

/**
 * Insert gtag immediately after <head> so Google's crawler/installation
 * checker sees it in the raw HTML source (not only via late JS).
 */
function ensureGtagInHtml(html) {
  if (!html || typeof html !== 'string' || hasGtag(html)) return html;
  if (!/<head[\s>]/i.test(html)) return html;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${GTAG_SNIPPET}\n`);
}

module.exports = {
  GA_MEASUREMENT_ID,
  GTAG_SNIPPET,
  hasGtag,
  ensureGtagInHtml
};
