function fmtRange(start, end) {
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  const s = start ? new Date(start).toLocaleDateString('en-GB', opts) : '';
  const e = end ? new Date(end).toLocaleDateString('en-GB', opts) : '';
  return e ? `${s} – ${e}` : s;
}

function statusBadge(status) {
  const label = String(status || 'open').replace(/_/g, ' ');
  return `<span class="group-badge ${status || 'open'}">${label}</span>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cardHtml(d) {
  const price = Number(d.sale_price_usd || d.price_usd || 0);
  const was = Number(d.price_usd || 0);
  const showWas = d.discount_percent > 0 && was > price;
  return `
    <a class="group-dep-card" href="/group-safaris/${encodeURIComponent(d.departure_slug)}">
      <div>
        <div class="group-dep-dates"><i class="fas fa-calendar-alt"></i> ${fmtRange(d.start_date, d.end_date)}</div>
        <h3 class="group-dep-title">${escapeHtml(d.title)}</h3>
        <div class="group-dep-meta">
          <span><i class="fas fa-clock"></i> ${d.duration_days || '—'} days</span>
          <span><i class="fas fa-users"></i> ${d.seats_left} seats left</span>
          <span>${statusBadge(d.status)}</span>
        </div>
      </div>
      <div class="group-dep-side">
        <div class="group-dep-price">
          ${showWas ? `<s>$${was.toLocaleString()}</s>` : ''}
          $${price.toLocaleString()}
        </div>
        <span class="btn btn-primary" style="min-height:44px;pointer-events:none">View departure</span>
      </div>
    </a>`;
}

async function loadGroupCalendar() {
  const el = document.getElementById('groupCalendar');
  if (!el) return;
  try {
    const { data } = await API.get('/group-departures?limit=60');
    if (!data?.length) {
      el.innerHTML = `
        <div class="group-empty">
          <p style="margin:0 0 1rem">New open-group dates are being scheduled. Check back soon, or ask Our Team for the next available join-in safari.</p>
          <a class="btn btn-primary" href="/booking" style="min-height:48px">Request dates</a>
          <a class="btn btn-outline" href="/safaris" style="min-height:48px;margin-left:0.5rem">Browse private safaris</a>
        </div>`;
      return;
    }
    el.innerHTML = data.map(cardHtml).join('');
  } catch (e) {
    el.innerHTML = '<div class="group-empty">Unable to load the group safari calendar right now.</div>';
  }
}

loadGroupCalendar();
