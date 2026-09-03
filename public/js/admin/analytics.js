// ── Website Analytics (first-party) ───────────────────────────
window.analyticsTrafficChart = null;
window.analyticsSourcesChart = null;

function changeBadge(pct) {
  if (pct == null || Number.isNaN(pct)) return '<span class="text-gray-400">vs prior period</span>';
  const up = pct >= 0;
  const color = up ? 'text-emerald-600' : 'text-red-600';
  const icon = up ? 'fa-arrow-up' : 'fa-arrow-down';
  return `<span class="${color} font-semibold"><i class="fa-solid ${icon}"></i> ${Math.abs(pct)}% vs prior</span>`;
}

function rangeLabel(range) {
  return ({
    day: 'Today by hour',
    week: 'Last 7 days',
    month: 'Last 30 days',
    year: 'This year by month'
  })[range] || range;
}

async function loadAnalytics() {
  const range = document.getElementById('analyticsRange')?.value || 'month';
  const labelEl = document.getElementById('an-range-label');
  if (labelEl) labelEl.textContent = rangeLabel(range);

  try {
    const res = await apiRequest('GET', `/analytics?range=${encodeURIComponent(range)}`);
    const data = res?.data;
    if (!data) return;

    const t = data.totals || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('an-views', Number(t.page_views || 0).toLocaleString());
    set('an-visitors', Number(t.unique_visitors || 0).toLocaleString());
    set('an-today', Number(t.today_views || 0).toLocaleString());

    const vc = document.getElementById('an-views-change');
    if (vc) vc.innerHTML = changeBadge(t.views_change_pct);
    const usc = document.getElementById('an-visitors-change');
    if (usc) usc.innerHTML = changeBadge(t.visitors_change_pct);

    const top = (data.sources || [])[0];
    set('an-top-source', top ? top.source : 'No data yet');
    const topCountry = data.totals?.top_country || (data.countries || []).find((c) => c.country && c.country !== 'Unknown')?.country;
    set(
      'an-top-source-views',
      top
        ? `${Number(top.views).toLocaleString()} views${topCountry ? ` · top country: ${topCountry}` : ''}`
        : 'Visit the public site to start collecting'
    );

    renderAnalyticsCharts(data);
    renderAnalyticsTables(data);
  } catch (err) {
    console.error('loadAnalytics', err);
    if (typeof showToast === 'function') showToast('Failed to load analytics', 'error');
  }
}

function renderAnalyticsCharts(data) {
  const trafficCanvas = document.getElementById('analyticsTrafficChart');
  const sourcesCanvas = document.getElementById('analyticsSourcesChart');

  if (window.analyticsTrafficChart) window.analyticsTrafficChart.destroy();
  if (window.analyticsSourcesChart) window.analyticsSourcesChart.destroy();

  if (trafficCanvas) {
    window.analyticsTrafficChart = new Chart(trafficCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.series?.labels || [],
        datasets: [
          {
            label: 'Page views',
            data: data.series?.views || [],
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Unique visitors',
            data: data.series?.visitors || [],
            borderColor: '#2C391C',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 4],
            fill: false,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const sources = data.sources || [];
  if (sourcesCanvas) {
    window.analyticsSourcesChart = new Chart(sourcesCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: sources.map(s => s.source),
        datasets: [{
          data: sources.map(s => s.views),
          backgroundColor: ['#059669', '#465B2D', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6', '#64748B'],
          borderWidth: 0,
          cutout: '68%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  const list = document.getElementById('an-sources-list');
  if (list) {
    const total = sources.reduce((a, s) => a + Number(s.views || 0), 0) || 1;
    list.innerHTML = sources.length
      ? sources.map(s => {
          const pct = Math.round((Number(s.views) / total) * 100);
          return `<div class="flex justify-between text-sm"><span class="text-gray-700 font-medium truncate pr-2">${escapeAn(s.source)}</span><span class="text-gray-500 shrink-0">${Number(s.views).toLocaleString()} · ${pct}%</span></div>`;
        }).join('')
      : '<p class="text-sm text-gray-400">No traffic sources yet.</p>';
  }
}

function renderAnalyticsTables(data) {
  const refBody = document.getElementById('an-referrers-body');
  if (refBody) {
    const rows = data.referrers || [];
    refBody.innerHTML = rows.length
      ? rows.map(r => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-3 font-medium text-gray-800">${escapeAn(r.host)}</td>
          <td class="px-6 py-3 text-right text-gray-600">${Number(r.views).toLocaleString()}</td>
        </tr>`).join('')
      : '<tr><td colspan="2" class="px-6 py-8 text-center text-gray-400">No external referrers yet — share links with ?utm_source=facebook to track campaigns.</td></tr>';
  }

  const pagesBody = document.getElementById('an-pages-body');
  if (pagesBody) {
    const rows = data.top_pages || [];
    pagesBody.innerHTML = rows.length
      ? rows.map(r => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-3"><a href="${escapeAn(r.path)}" target="_blank" rel="noopener" class="text-emerald-700 font-medium hover:underline">${escapeAn(r.path)}</a></td>
          <td class="px-6 py-3 text-right">${Number(r.views).toLocaleString()}</td>
          <td class="px-6 py-3 text-right text-gray-500">${Number(r.visitors).toLocaleString()}</td>
        </tr>`).join('')
      : '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-400">No page views recorded yet.</td></tr>';
  }

  const countriesBody = document.getElementById('an-countries-body');
  if (countriesBody) {
    const rows = data.countries || [];
    countriesBody.innerHTML = rows.length
      ? rows.map(r => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-3 font-medium text-gray-800">${escapeAn(r.country)}</td>
          <td class="px-6 py-3 text-right">${Number(r.views).toLocaleString()}</td>
          <td class="px-6 py-3 text-right text-gray-500">${Number(r.visitors).toLocaleString()}</td>
        </tr>`).join('')
      : '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-400">No country data yet — new visits will appear here.</td></tr>';
  }

  const keywordsBody = document.getElementById('an-keywords-body');
  if (keywordsBody) {
    const rows = data.keywords || [];
    keywordsBody.innerHTML = rows.length
      ? rows.map(r => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-3 font-medium text-gray-800">${escapeAn(r.keyword)}</td>
          <td class="px-6 py-3 text-right">${Number(r.views).toLocaleString()}</td>
          <td class="px-6 py-3 text-right text-gray-500">${Number(r.visitors).toLocaleString()}</td>
        </tr>`).join('')
      : '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-400">No keywords yet — use utm_term on campaign links, or wait for search referrers.</td></tr>';
  }
}

function escapeAn(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.loadAnalytics = loadAnalytics;
