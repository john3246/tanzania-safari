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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let allDepartures = [];
let calYear = new Date().getFullYear();
let calMonth = null; // 1-12 or null = all months in year with data

function availableYears(data) {
  const years = new Set(data.map(d => new Date(d.start_date).getFullYear()).filter(Boolean));
  const now = new Date().getFullYear();
  years.add(now);
  years.add(now + 1);
  return Array.from(years).sort((a, b) => a - b);
}

function monthsWithData(data, year) {
  const set = new Set();
  data.forEach(d => {
    const dt = new Date(d.start_date);
    if (dt.getFullYear() === year) set.add(dt.getMonth() + 1);
  });
  return set;
}

function filteredDepartures() {
  return allDepartures.filter(d => {
    const dt = new Date(d.start_date);
    if (dt.getFullYear() !== calYear) return false;
    if (calMonth && (dt.getMonth() + 1) !== calMonth) return false;
    return true;
  });
}

function cardHtml(d) {
  const price = Number(d.sale_price_usd || d.price_usd || 0);
  const was = Number(d.price_usd || 0);
  const showWas = d.discount_percent > 0 && was > price;
  const img = d.featured_image_url || '/images/optimized/serengeti-national-park.webp';
  const dayNum = new Date(d.start_date).getDate();
  const tags = (d.highlights || []).slice(0, 3);
  return `
    <a class="group-dep-card" href="/group-safaris/${encodeURIComponent(d.departure_slug)}">
      <div class="group-dep-media">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(d.title)}" loading="lazy" decoding="async"
             onerror="this.src='/images/optimized/serengeti-national-park.webp'">
        <span class="group-dep-day">${String(dayNum).padStart(2, '0')}</span>
      </div>
      <div class="group-dep-body">
        <div class="group-dep-dates"><i class="fas fa-calendar-alt"></i> ${fmtRange(d.start_date, d.end_date)}</div>
        <h3 class="group-dep-title">${escapeHtml(d.title)}</h3>
        <div class="group-dep-meta">
          <span><i class="fas fa-clock"></i> ${d.duration_days || '—'} days</span>
          <span><i class="fas fa-users"></i> ${d.seats_left} seats left</span>
          <span>${statusBadge(d.status)}</span>
        </div>
        ${tags.length ? `<div class="group-dep-tags">${tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        <div class="group-dep-side">
          <div class="group-dep-price">
            ${showWas ? `<s>$${was.toLocaleString()}</s>` : ''}
            $${price.toLocaleString()}
            ${d.discount_percent > 0 ? `<em class="group-dep-off">${d.discount_percent}% off</em>` : ''}
          </div>
          <span class="btn btn-primary btn-sm" style="pointer-events:none">Join group</span>
        </div>
      </div>
    </a>`;
}

function renderYearButtons() {
  const el = document.getElementById('groupCalYears');
  if (!el) return;
  const years = availableYears(allDepartures);
  if (!years.includes(calYear)) calYear = years[0];
  el.innerHTML = years.map(y =>
    `<button type="button" class="group-cal-chip ${y === calYear ? 'active' : ''}" data-year="${y}">${y}</button>`
  ).join('');
  el.querySelectorAll('[data-year]').forEach(btn => {
    btn.addEventListener('click', () => {
      calYear = parseInt(btn.dataset.year, 10);
      const months = monthsWithData(allDepartures, calYear);
      if (calMonth && !months.has(calMonth)) calMonth = months.size ? Array.from(months)[0] : null;
      renderCalendarControls();
      renderCalendarList();
    });
  });
}

function renderMonthButtons() {
  const el = document.getElementById('groupCalMonths');
  if (!el) return;
  const months = monthsWithData(allDepartures, calYear);
  if (calMonth == null && months.size) {
    // Default to first upcoming month in selected year
    const now = new Date();
    const upcoming = Array.from(months).sort((a, b) => a - b).find(m =>
      calYear > now.getFullYear() || m >= (now.getMonth() + 1)
    );
    calMonth = upcoming || Array.from(months).sort((a, b) => a - b)[0];
  }
  el.innerHTML = MONTHS.map((label, i) => {
    const m = i + 1;
    const enabled = months.has(m);
    const active = calMonth === m;
    return `<button type="button" class="group-cal-chip ${active ? 'active' : ''}" data-month="${m}" ${enabled ? '' : 'disabled'}>${label}</button>`;
  }).join('');
  el.querySelectorAll('[data-month]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const m = parseInt(btn.dataset.month, 10);
      calMonth = calMonth === m ? null : m;
      renderMonthButtons();
      renderCalendarList();
    });
  });
}

function renderCalendarControls() {
  renderYearButtons();
  renderMonthButtons();
  const label = document.getElementById('groupCalFilterLabel');
  if (label) {
    label.textContent = calMonth
      ? `${MONTHS[calMonth - 1]} ${calYear}`
      : `All months · ${calYear}`;
  }
}

function renderCalendarList() {
  const el = document.getElementById('groupCalendar');
  if (!el) return;
  const data = filteredDepartures();
  if (!data.length) {
    el.innerHTML = `
      <div class="group-empty">
        <p style="margin:0 0 1rem">No open-group departures for this period. Try another month, or ask Our Team for the next available join-in safari.</p>
        <a class="btn btn-primary" href="/booking" style="min-height:48px">Request dates</a>
        <a class="btn btn-outline" href="/safaris" style="min-height:48px;margin-left:0.5rem">Browse private safaris</a>
      </div>`;
    return;
  }
  el.innerHTML = data.map(cardHtml).join('');
}

async function loadGroupCalendar() {
  const el = document.getElementById('groupCalendar');
  if (!el) return;
  try {
    const { data } = await API.get('/group-departures?limit=120');
    allDepartures = data || [];
    if (!allDepartures.length) {
      document.getElementById('groupCalControls')?.classList.add('is-empty');
      el.innerHTML = `
        <div class="group-empty">
          <p style="margin:0 0 1rem">New open-group dates are being scheduled. Check back soon, or ask Our Team for the next available join-in safari.</p>
          <a class="btn btn-primary" href="/booking" style="min-height:48px">Request dates</a>
          <a class="btn btn-outline" href="/safaris" style="min-height:48px;margin-left:0.5rem">Browse private safaris</a>
        </div>`;
      return;
    }
    renderCalendarControls();
    renderCalendarList();
  } catch (e) {
    el.innerHTML = '<div class="group-empty">Unable to load the group safari calendar right now.</div>';
  }
}

loadGroupCalendar();
