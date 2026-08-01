// ── Revenue Chart Logic ────────────────────────────────────────

async function renderRevenueChart(stats = {}) {
    const dashVisitorsCanvas = document.getElementById('visitorsChart');
    const dashBookingsCanvas = document.getElementById('bookingsChart');

    if (window.visitorsChartInstance) window.visitorsChartInstance.destroy();
    if (window.bookingsChartInstance) window.bookingsChartInstance.destroy();

    const visitorData = stats.visitorsByMonth || [];
    const visitorLabels = stats.visitorLabels || [];
    const uniqueData = stats.uniqueVisitorsByPeriod || [];

    if (dashVisitorsCanvas) {
        const ctx = dashVisitorsCanvas.getContext('2d');
        const datasets = [{
            label: 'Page views',
            data: visitorData,
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }];
        if (uniqueData.length) {
            datasets.push({
                label: 'Unique visitors',
                data: uniqueData,
                borderColor: '#1E311B',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 4],
                fill: false,
                tension: 0.4
            });
        }
        window.visitorsChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: visitorLabels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: datasets.length > 1, position: 'bottom' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Mini sources list on dashboard
    const sourcesBox = document.getElementById('dash-traffic-sources');
    if (sourcesBox) {
        const sources = stats.traffic_sources || [];
        sourcesBox.innerHTML = sources.length
            ? sources.slice(0, 5).map(s => `
                <div class="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span class="text-gray-700 font-medium truncate pr-2">${String(s.source || '').replace(/</g,'&lt;')}</span>
                  <span class="text-gray-500 shrink-0">${Number(s.views || 0).toLocaleString()}</span>
                </div>`).join('')
            : '<p class="text-sm text-gray-400">No traffic yet — open the public site to collect visits.</p>';
    }

    if (dashBookingsCanvas) {
        const dCtx = dashBookingsCanvas.getContext('2d');
        const confirmed = Number(stats.bookings_confirmed || 0);
        const pending = Number(stats.bookings_pending || 0);
        const cancelled = Number(stats.bookings_cancelled || 0);
        const completed = Number(stats.bookings_completed || 0);
        
        const total = confirmed + pending + cancelled + completed;

        if (document.getElementById('dash-chart-total-bookings')) {
            document.getElementById('dash-chart-total-bookings').textContent = total;
            document.getElementById('dash-confirmed-count').textContent = confirmed;
            document.getElementById('dash-confirmed-percent').textContent = total ? Math.round((confirmed / total) * 100) : 0;
            
            document.getElementById('dash-pending-count').textContent = pending;
            document.getElementById('dash-pending-percent').textContent = total ? Math.round((pending / total) * 100) : 0;
            
            document.getElementById('dash-cancelled-count').textContent = cancelled;
            document.getElementById('dash-cancelled-percent').textContent = total ? Math.round((cancelled / total) * 100) : 0;
            
            document.getElementById('dash-completed-count').textContent = completed;
            document.getElementById('dash-completed-percent').textContent = total ? Math.round((completed / total) * 100) : 0;
        }

        window.bookingsChartInstance = new Chart(dCtx, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
                datasets: [{
                    data: [confirmed, pending, cancelled, completed],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

// ── Dashboard ─────────────────────────────────────────────────
async function loadDashboard() {
    try {
        const res = await apiRequest('GET', '/stats');
        if (!res || !res.data) return;
        const stats = res.data;

        const rangeEl = document.getElementById('dateRangeDisplay');
        if (rangeEl) {
            const now = new Date();
            rangeEl.textContent = `Today ${now.toLocaleDateString()} · Live traffic`;
        }
        
        if (document.getElementById('dash-visitors')) {
            document.getElementById('dash-visitors').textContent = Number(stats.total_views || stats.page_views_all || 0).toLocaleString();
        }
        const todayEl = document.getElementById('dash-today-views');
        if (todayEl) todayEl.textContent = Number(stats.today_views || 0).toLocaleString();
        const weekEl = document.getElementById('dash-week-views');
        if (weekEl) weekEl.textContent = Number(stats.week_views || 0).toLocaleString();
        const monthEl = document.getElementById('dash-month-views');
        if (monthEl) monthEl.textContent = Number(stats.month_views || 0).toLocaleString();

        if (document.getElementById('dash-inquiries')) document.getElementById('dash-inquiries').textContent = stats.total_enquiries || 0;
        if (document.getElementById('dash-bookings')) document.getElementById('dash-bookings').textContent = stats.total_bookings || 0;
        if (document.getElementById('dash-revenue')) {
            document.getElementById('dash-revenue').textContent = '$' + Number(stats.total_revenue || 0).toLocaleString();
        }
        if (document.getElementById('dash-tours')) document.getElementById('dash-tours').textContent = stats.total_packages || 0;

        if (document.getElementById('s-packages')) document.getElementById('s-packages').textContent = stats.total_packages || 0;
        if (document.getElementById('s-destinations')) document.getElementById('s-destinations').textContent = stats.total_destinations || 0;
        if (document.getElementById('s-bookings')) document.getElementById('s-bookings').textContent = stats.total_bookings || 0;
        if (document.getElementById('s-enquiries')) document.getElementById('s-enquiries').textContent = stats.total_enquiries || 0;

        renderRevenueChart(stats);
        loadRecentActivity();
        refreshDashboardHealth();
    } catch (e) {
        console.error('Error loading dashboard:', e);
    }
}

async function refreshDashboardHealth() {
    try {
        const res = await apiRequest('GET', '/health');
        const h = res.data || res;
        const db = h.services?.database || {};
        const dbEl = document.getElementById('dash-db-status');
        if (dbEl) {
            const ok = db.status === 'connected';
            dbEl.className = ok ? 'text-forest-600 font-medium flex items-center gap-1' : 'text-red-600 font-medium';
            dbEl.innerHTML = ok
                ? `Connected ${db.latencyMs != null ? `(${db.latencyMs}ms)` : ''} <i class="fa-solid fa-check"></i>`
                : `Error`;
        }
        const nodeEl = document.getElementById('dash-node-status');
        if (nodeEl) {
            const host = h.render?.isRender
                ? `Render · ${h.render.service || 'web'} · ${h.node || ''}`
                : (h.node || 'local');
            nodeEl.textContent = host;
        }
        const sysEl = document.getElementById('dash-system-status');
        if (sysEl) {
            const st = h.status || 'unknown';
            const color = st === 'healthy' ? 'forest' : st === 'degraded' ? 'amber' : 'red';
            sysEl.className = `text-${color}-600 font-medium flex items-center gap-1`;
            sysEl.innerHTML = `${st.charAt(0).toUpperCase() + st.slice(1)} <div class="w-2 h-2 rounded-full bg-${color}-500 ml-1"></div>`;
        }
    } catch (e) {
        const sysEl = document.getElementById('dash-system-status');
        if (sysEl) sysEl.textContent = 'Unavailable';
    }
}

async function loadRecentActivity() {
    try {
        const bRes = await apiRequest('GET', '/bookings');
        const bBody = document.getElementById('dashBookingsBody');
        if (bBody) {
            bBody.innerHTML = (bRes.data || []).slice(0, 5).map(b => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 font-medium text-slate-800">#BK-${b.booking_id?.substring(0,8) || b.id}</td>
                <td class="p-4">${b.full_name}</td>
                <td class="p-4">${b.package_name || 'Safari Package'}</td>
                <td class="p-4 text-slate-500">${new Date(b.created_at).toLocaleDateString()}</td>
                <td class="p-4">${(b.number_of_adults || 0) + (b.number_of_children || 0)}</td>
                <td class="p-4 font-semibold">$${Number(b.total_price_usd).toLocaleString()}</td>
                <td class="p-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${b.status_name === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${b.status_name || 'Pending'}</span>
                </td>
            </tr>`).join('') || '<tr><td colspan="7" class="p-4 text-center">No recent bookings</td></tr>';
        }

        const eRes = await apiRequest('GET', '/enquiries');
        const aBody = document.getElementById('dashActivityBody');
        if (aBody) {
            aBody.innerHTML = (eRes.data || []).slice(0, 4).map(e => `
            <div class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5"><i class="ph ph-envelope-simple"></i></div>
                <div>
                    <p class="text-sm text-slate-800"><span class="font-semibold">${e.full_name}</span> sent a new inquiry.</p>
                    <p class="text-xs text-slate-400 mt-1">${new Date(e.created_at).toLocaleString()}</p>
                </div>
            </div>`).join('') || '<div class="text-center text-slate-400 text-sm py-4">No recent activities</div>';
        }

        const pRes = await apiRequest('GET', '/packages?limit=3');
        const tBody = document.getElementById('dashTopToursBody');
        if (tBody) {
            tBody.innerHTML = (pRes.data || []).map(p => `
            <div class="flex items-center gap-3">
                <img src="${(p.image_urls && p.image_urls[0]) || '/images/optimized/balloon.webp'}" class="w-12 h-12 rounded-lg object-cover" onerror="this.src='/images/optimized/balloon.webp'">
                <div class="flex-1 overflow-hidden">
                    <div class="font-medium text-sm text-slate-800 truncate">${p.package_name}</div>
                    <div class="text-xs text-slate-500">${p.duration_days} Days • From $${p.base_price_usd}</div>
                </div>
                <div class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Active</div>
            </div>`).join('') || '<div class="text-center text-slate-400 text-sm py-4">No tours available</div>';
        }

    } catch (e) { console.error('Error loading recent activity:', e); }
}
