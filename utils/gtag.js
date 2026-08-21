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

/** Stops the live Chrome freeze: cached site-trust.js watched an empty #teamGrid forever. */
const FREEZE_GUARD_SNIPPET = `<script>
(function(){try{
  if(window.__TSM_FREEZE_GUARD)return;
  window.__TSM_FREEZE_GUARD=1;
  var Orig=window.MutationObserver;
  if(!Orig)return;
  window.MutationObserver=function(cb){
    var n=0,t0=0;
    return new Orig(function(muts,obs){
      var now=Date.now();
      if(now-t0>1000){n=0;t0=now;}
      if(++n>25){try{obs.disconnect();}catch(e){}return;}
      try{
        var g=document.getElementById('teamGrid');
        if(g&&!g.firstElementChild){obs.disconnect();return;}
      }catch(e){}
      if(typeof cb==='function')cb(muts,obs);
    });
  };
  window.MutationObserver.prototype=Orig.prototype;
}catch(e){}})();
</script>`;

function hasGtag(html) {
  if (typeof html !== 'string') return false;
  return (
    html.includes(GA_MEASUREMENT_ID) ||
    html.includes('googletagmanager.com/gtag/js') ||
    html.includes('googletagmanager.com/gtm.js')
  );
}

function ensureFreezeGuardInHtml(html) {
  if (!html || typeof html !== 'string' || html.includes('__TSM_FREEZE_GUARD')) return html;
  if (!/<head[\s>]/i.test(html)) return html;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${FREEZE_GUARD_SNIPPET}\n`);
}

/**
 * Insert gtag immediately after <head> so Google's crawler/installation
 * checker sees it in the raw HTML source (not only via late JS).
 */
function ensureGtagInHtml(html) {
  if (!html || typeof html !== 'string') return html;
  html = ensureFreezeGuardInHtml(html);
  if (hasGtag(html) || !/<head[\s>]/i.test(html)) return html;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${GTAG_SNIPPET}\n`);
}

module.exports = {
  GA_MEASUREMENT_ID,
  GTAG_SNIPPET,
  hasGtag,
  ensureFreezeGuardInHtml,
  ensureGtagInHtml
};

