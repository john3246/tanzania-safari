async function loadSystemLogs() {
    const body = document.getElementById('systemLogsBody');
    if (!body) return;
    const search = document.getElementById('logSearch')?.value || '';
    try {
        const qs = search ? `?search=${encodeURIComponent(search)}&limit=100` : '?limit=100';
        const [logsRes, statsRes] = await Promise.all([
            apiRequest('GET', `/audit-logs${qs}`),
            apiRequest('GET', '/audit-logs/stats').catch(() => null)
        ]);
        const stats = statsRes?.data || {};
        if (document.getElementById('logStatTotal')) document.getElementById('logStatTotal').textContent = stats.total_logs ?? (logsRes.data || []).length;
        if (document.getElementById('logStatActors')) document.getElementById('logStatActors').textContent = stats.unique_actors ?? '—';
        if (document.getElementById('logStatCreates')) document.getElementById('logStatCreates').textContent = stats.create_count ?? '—';
        if (document.getElementById('logStatUpdates')) document.getElementById('logStatUpdates').textContent = stats.update_count ?? '—';

        const rows = logsRes.data || logsRes.logs || [];
        body.innerHTML = rows.length ? rows.map(l => {
            const actor = [l.actor_first_name, l.actor_last_name].filter(Boolean).join(' ') || l.actor_email || 'System';
            const details = l.new_values ? (typeof l.new_values === 'string' ? l.new_values : JSON.stringify(l.new_values)).slice(0, 120) : '';
            return `<tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-500 whitespace-nowrap">${l.created_at ? new Date(l.created_at).toLocaleString() : ''}</td>
                <td class="px-4 py-3">${escapeHtml(actor)}</td>
                <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(l.action_performed || l.action || '')}</td>
                <td class="px-4 py-3 text-slate-500">${escapeHtml([l.entity_type, l.entity_id].filter(Boolean).join(' · '))}</td>
                <td class="px-4 py-3 text-xs text-slate-400 font-mono">${escapeHtml(details)}</td>
            </tr>`;
        }).join('') : '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-400">No audit logs yet.</td></tr>';
    } catch (e) {
        body.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-red-500">${escapeHtml(e.message || 'Failed to load logs')}</td></tr>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.loadSystemLogs = loadSystemLogs;
