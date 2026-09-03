/**
 * Tanzania Safari Magic — client-side i18n
 * Languages: en (primary), it, fr, es, de, nl
 * Persist choice in localStorage key `tsm_lang`
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'tsm_lang';
  var SUPPORTED = ['en', 'it', 'fr', 'es', 'de', 'nl'];
  var LABELS = {
    en: 'English',
    it: 'Italiano',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    nl: 'Nederlands'
  };
  var FLAGS = { en: '🇬🇧', it: '🇮🇹', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪', nl: '🇳🇱' };

  var state = {
    lang: 'en',
    dict: {},
    ready: null
  };

  function getStoredLang() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var q = (params.get('lang') || '').toLowerCase();
      if (q && SUPPORTED.indexOf(q) !== -1) {
        try {
          localStorage.setItem(STORAGE_KEY, q);
        } catch (_) {}
        return q;
      }
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (_) {}
    return 'en';
  }

  function resolve(obj, path) {
    if (!obj || !path) return undefined;
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function interpolate(str, vars) {
    if (!vars || typeof str !== 'string') return str;
    return str.replace(/\{\{(\w+)\}\}/g, function (_, key) {
      return vars[key] != null ? String(vars[key]) : '';
    });
  }

  function t(key, vars) {
    var val = resolve(state.dict, key);
    if (val == null && state.lang !== 'en' && state._en) {
      val = resolve(state._en, key);
    }
    if (val == null) return key;
    if (typeof val !== 'string') return val;
    return interpolate(val, vars);
  }

  function applyToElement(el) {
    var key = el.getAttribute('data-i18n');
    if (key) {
      var translated = t(key);
      if (translated !== key) el.textContent = translated;
    }
    var htmlKey = el.getAttribute('data-i18n-html');
    if (htmlKey) {
      var htmlVal = t(htmlKey);
      if (htmlVal !== htmlKey) el.innerHTML = htmlVal;
    }
    var ph = el.getAttribute('data-i18n-placeholder');
    if (ph) {
      var phVal = t(ph);
      if (phVal !== ph) el.setAttribute('placeholder', phVal);
    }
    var aria = el.getAttribute('data-i18n-aria');
    if (aria) {
      var ariaVal = t(aria);
      if (ariaVal !== aria) el.setAttribute('aria-label', ariaVal);
    }
    var title = el.getAttribute('data-i18n-title');
    if (title) {
      var titleVal = t(title);
      if (titleVal !== title) el.setAttribute('title', titleVal);
    }
    var valueKey = el.getAttribute('data-i18n-value');
    if (valueKey && (el.tagName === 'OPTION' || el.tagName === 'INPUT' || el.tagName === 'BUTTON')) {
      var v = t(valueKey);
      if (v !== valueKey && el.tagName === 'OPTION') el.textContent = v;
    }
  }

  function applyTranslations(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(
      '[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-aria],[data-i18n-title],[data-i18n-value]'
    );
    for (var i = 0; i < nodes.length; i++) applyToElement(nodes[i]);
    if (document.documentElement) {
      document.documentElement.lang = state.lang;
    }
  }

  function loadDict(lang) {
    return fetch('/locales/' + lang + '.json?v=4')
      .then(function (res) {
        if (!res.ok) throw new Error('locale ' + lang);
        return res.json();
      });
  }

  function setLanguage(lang, opts) {
    opts = opts || {};
    if (SUPPORTED.indexOf(lang) === -1) lang = 'en';
    var prev = state.lang;
    state.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}

    var chain = Promise.resolve();
    if (lang !== 'en' && !state._en) {
      chain = loadDict('en').then(function (en) {
        state._en = en;
      });
    }

    return chain
      .then(function () {
        return loadDict(lang);
      })
      .then(function (dict) {
        state.dict = dict;
        if (lang === 'en') state._en = dict;
        applyTranslations(document);
        updateSwitcherUI();
        try {
          // Keep shareable ?lang= URLs in sync for SEO / hreflang
          var url = new URL(window.location.href);
          if (lang === 'en') url.searchParams.delete('lang');
          else url.searchParams.set('lang', lang);
          var next = url.pathname + url.search + url.hash;
          if (next !== window.location.pathname + window.location.search + window.location.hash) {
            window.history.replaceState({}, '', next);
          }
        } catch (_) {}
        try {
          document.cookie = 'tsm_lang=' + lang + ';path=/;max-age=31536000;SameSite=Lax';
        } catch (_) {}
        try {
          document.dispatchEvent(
            new CustomEvent('tsm:languagechange', { detail: { lang: lang, prev: prev } })
          );
        } catch (_) {}
        if (opts.reload) {
          window.location.reload();
        }
        return lang;
      })
      .catch(function (err) {
        console.warn('[i18n] Failed to load locale', lang, err);
        if (lang !== 'en') return setLanguage('en', opts);
      });
  }

  function updateSwitcherUI() {
    var root = document.getElementById('langSwitcher');
    if (!root) return;
    var btn = root.querySelector('.lang-switcher-btn');
    var current = root.querySelector('.lang-current');
    if (current) {
      current.innerHTML =
        '<span class="lang-flag" aria-hidden="true">' +
        (FLAGS[state.lang] || '') +
        '</span><span class="lang-code">' +
        state.lang.toUpperCase() +
        '</span>';
    }
    if (btn) btn.setAttribute('aria-expanded', 'false');
    root.classList.remove('open');
    root.querySelectorAll('.lang-option').forEach(function (opt) {
      var code = opt.getAttribute('data-lang');
      opt.classList.toggle('active', code === state.lang);
      opt.setAttribute('aria-selected', code === state.lang ? 'true' : 'false');
    });
  }

  function buildSwitcherHtml() {
    var options = SUPPORTED.map(function (code) {
      return (
        '<button type="button" class="lang-option' +
        (code === state.lang ? ' active' : '') +
        '" role="option" data-lang="' +
        code +
        '" aria-selected="' +
        (code === state.lang ? 'true' : 'false') +
        '">' +
        '<span class="lang-flag" aria-hidden="true">' +
        FLAGS[code] +
        '</span>' +
        '<span class="lang-name">' +
        LABELS[code] +
        '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="lang-switcher" id="langSwitcher">' +
      '<button type="button" class="lang-switcher-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Choose language">' +
      '<span class="lang-current">' +
      '<span class="lang-flag" aria-hidden="true">' +
      FLAGS[state.lang] +
      '</span><span class="lang-code">' +
      state.lang.toUpperCase() +
      '</span></span>' +
      '<i class="fas fa-chevron-down lang-caret" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="lang-dropdown" role="listbox" aria-label="Languages">' +
      options +
      '</div></div>'
    );
  }

  function initSwitcher(mount) {
    var host = mount || document.getElementById('langSwitcherMount');
    if (!host) return;
    if (host.querySelector('#langSwitcher')) {
      updateSwitcherUI();
      return;
    }
    host.innerHTML = buildSwitcherHtml();
    var root = document.getElementById('langSwitcher');
    var btn = root.querySelector('.lang-switcher-btn');
    var dropdown = root.querySelector('.lang-dropdown');

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = root.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    dropdown.addEventListener('click', function (e) {
      var opt = e.target.closest('.lang-option');
      if (!opt) return;
      e.preventDefault();
      e.stopPropagation();
      var lang = opt.getAttribute('data-lang');
      if (lang && lang !== state.lang) {
        setLanguage(lang, { reload: true });
      } else {
        root.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#langSwitcher')) {
        root.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function injectStyles() {
    if (document.getElementById('tsm-i18n-css')) return;
    var style = document.createElement('style');
    style.id = 'tsm-i18n-css';
    style.textContent =
      '.lang-switcher{position:relative;display:inline-flex;align-items:center;z-index:40}' +
      '.lang-switcher-btn{display:inline-flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:8px;padding:.28rem .55rem;font-size:.75rem;font-weight:600;cursor:pointer;min-height:32px;letter-spacing:.02em}' +
      '.lang-switcher-btn:hover{background:rgba(255,255,255,.2)}' +
      '.lang-current{display:inline-flex;align-items:center;gap:.35rem}' +
      '.lang-flag{font-size:.95rem;line-height:1}' +
      '.lang-code{font-size:.72rem}' +
      '.lang-caret{font-size:.55rem;opacity:.85}' +
      '.lang-dropdown{display:none;position:absolute;top:calc(100% + 6px);right:0;min-width:11rem;background:#fff;color:#1a2a17;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.18);border:1px solid rgba(70, 91, 45,.1);padding:.35rem;z-index:100}' +
      '.lang-switcher.open .lang-dropdown{display:block}' +
      '.lang-option{display:flex;align-items:center;gap:.55rem;width:100%;border:0;background:transparent;text-align:left;padding:.55rem .65rem;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600;color:#1a2a17}' +
      '.lang-option:hover{background:#f3f6f1}' +
      '.lang-option.active{background:#e8f0e4;color:var(--primary,#2d5a27)}' +
      '.header-top .lang-switcher-btn,.header .top-bar .lang-switcher-btn{background:#f3f6f1;color:#2C391C;border-color:#cfd8cb}' +
      '.header-top .lang-switcher-btn:hover{background:#e8f0e4}' +
      '@media(max-width:640px){.top-bar-location{display:none}}';
    (document.head || document.documentElement).appendChild(style);
  }

  state.lang = getStoredLang();
  injectStyles();

  state.ready = setLanguage(state.lang, { reload: false }).then(function () {
    return state.lang;
  });

  global.TSM_i18n = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: function () {
      return state.lang;
    },
    applyTranslations: applyTranslations,
    initSwitcher: initSwitcher,
    supported: SUPPORTED.slice(),
    labels: LABELS,
    ready: state.ready
  };
  global.t = t;
})(typeof window !== 'undefined' ? window : this);
