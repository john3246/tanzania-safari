// ── Revenue Chart Logic ────────────────────────────────────────

async function renderRevenueChart(stats = {}) {
    const canvas = document.getElementById('visitorsChartCanvas');
    const donutCanvas = document.getElementById('bookingsStatusChart');
    
    // In dashboard.html there's visitorsChart and bookingsChart
    const dashVisitorsCanvas = document.getElementById('visitorsChart');
    const dashBookingsCanvas = document.getElementById('bookingsChart');

    if (window.visitorsChartInstance) window.visitorsChartInstance.destroy();
    if (window.bookingsChartInstance) window.bookingsChartInstance.destroy();

    // Use stats or mock data
    const visitorData = stats.visitorsByMonth || [];
    const visitorLabels = stats.visitorLabels || [];

    if (dashVisitorsCanvas) {
        const ctx = dashVisitorsCanvas.getContext('2d');
        window.visitorsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: visitorLabels,
                datasets: [{
                    label: 'Bookings',
                    data: visitorData,
                    borderColor: '#263E22',
                    backgroundColor: 'rgba(11, 59, 45, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    if (dashBookingsCanvas) {
        const dCtx = dashBookingsCanvas.getContext('2d');
        const confirmed = Number(stats.bookings_confirmed || 0);
        const pending = Number(stats.bookings_pending || 0);
        const cancelled = Number(stats.bookings_cancelled || 0);
        
        window.bookingsChartInstance = new Chart(dCtx, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Cancelled'],
                datasets: [{
                    data: [confirmed, pending, cancelled],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
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
                if (document.getElementById('dash-visitors')) {
            document.getElementById('dash-visitors').textContent = (stats.total_views || 0).toLocaleString();
        }
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
    } catch (e) {
        console.error('Error loading dashboard:', e);
    }
}

async function loadRecentActivity() {
    try {
        // Bookings Table
        const bRes = await apiRequest('GET', '/bookings');
        const bBody = document.getElementById('dashBookingsBody');
        if (bBody) {
            bBody.innerHTML = (bRes.data || []).slice(0, 5).map(b => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 font-medium text-slate-800">#BK-${b.id}</td>
                <td class="p-4">${b.full_name}</td>
                <td class="p-4">${b.package_name || 'Safari Package'}</td>
                <td class="p-4 text-slate-500">${new Date(b.created_at).toLocaleDateString()}</td>
                <td class="p-4">${b.number_of_people}</td>
                <td class="p-4 font-semibold">$${Number(b.total_price_usd).toLocaleString()}</td>
                <td class="p-4 text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${b.status_name === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${b.status_name || 'Pending'}</span>
                </td>
            </tr>`).join('') || '<tr><td colspan="7" class="p-4 text-center">No recent bookings</td></tr>';
        }

        // Recent Activities (Using Enquiries and Reviews as activity)
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

        // Top Performing Tours (Using Packages)
        const pRes = await apiRequest('GET', '/packages?limit=3');
        const tBody = document.getElementById('dashTopToursBody');
        if (tBody) {
            tBody.innerHTML = (pRes.data || []).map(p => `
            <div class="flex items-center gap-3">
                <img src="${p.main_image_url || '/images/placeholder.jpeg'}" class="w-12 h-12 rounded-lg object-cover" onerror="this.src='/images/placeholder.jpeg'">
                <div class="flex-1 overflow-hidden">
                    <div class="font-medium text-sm text-slate-800 truncate">${p.name}</div>
                    <div class="text-xs text-slate-500">${p.days} Days • From $${p.price_per_person}</div>
                </div>
                <div class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Active</div>
            </div>`).join('') || '<div class="text-center text-slate-400 text-sm py-4">No tours available</div>';
        }

    } catch (e) { console.error('Error loading recent activity:', e); }
}

