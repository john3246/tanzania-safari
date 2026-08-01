function slugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listFromArray(arr, emptyMsg) {
  if (!arr || !arr.length) return `<p style="color:var(--text-muted)">${emptyMsg}</p>`;
  return `<ul style="padding-left:1.2rem;line-height:1.7">${arr.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

function renderItinerary(itinerary) {
  if (!itinerary || !itinerary.length) {
    return '<p style="color:var(--text-muted)">Detailed day-by-day itinerary will be confirmed with your booking.</p>';
  }
  return itinerary.map((day, i) => `
    <div class="group-itinerary-day">
      <div class="day-label">Day ${day.day || i + 1}</div>
      <h3>${escapeHtml(day.title || 'Safari day')}</h3>
      <p style="margin:0;color:var(--text-secondary);line-height:1.65">${escapeHtml(day.description || '')}</p>
    </div>
  `).join('');
}

function depositFor(price, travelers) {
  const p = Number(price) || 0;
  const t = Math.max(1, parseInt(travelers, 10) || 1);
  return Math.round(p * t * 0.3);
}

function renderSummary(d) {
  const price = Number(d.sale_price_usd || d.price_usd || 0);
  const was = Number(d.price_usd || 0);
  const showWas = d.discount_percent > 0 && was > price;
  const canRequest = d.status !== 'full' && d.status !== 'cancelled' && Number(d.seats_left) > 0;
  const sampleDeposit = depositFor(price, 1);
  return `
    <div class="group-summary-row"><span>Start</span><strong>${fmtDate(d.start_date)}</strong></div>
    <div class="group-summary-row"><span>End</span><strong>${fmtDate(d.end_date)}</strong></div>
    <div class="group-summary-row"><span>Duration</span><strong>${d.duration_days || '—'} days</strong></div>
    <div class="group-summary-row"><span>Physical rating</span><strong>${escapeHtml(d.physical_rating || 'Easy')}</strong></div>
    <div class="group-summary-row"><span>Seats left</span><strong>${d.seats_left} / ${d.capacity}</strong></div>
    <div class="group-summary-row"><span>Status</span><strong>${escapeHtml(String(d.status || '').replace(/_/g, ' '))}</strong></div>
    <div class="group-summary-price">
      ${showWas ? `<s>$${was.toLocaleString()}</s>` : ''}
      $${price.toLocaleString()}
      <div style="font-size:0.8rem;font-weight:500;color:var(--text-muted)">per person</div>
    </div>
    ${canRequest ? `
      <button type="button" class="btn btn-primary" style="width:100%;min-height:48px" onclick="document.getElementById('requestTripForm').scrollIntoView({behavior:'smooth'})">
        <i class="fas fa-paw"></i> Request this trip
      </button>
      <p class="group-deposit-note">
        After approval, a <strong>30% deposit</strong> (from $${sampleDeposit.toLocaleString()} USD per traveler)
        is typically due <strong>within 24 hours</strong>. Our Team sends <strong>offline payment instructions</strong> — nothing is charged on this page. Seats are held once payment is confirmed.
      </p>
      <form id="requestTripForm" class="group-request-form" onsubmit="return submitGroupRequest(event)">
        <input name="full_name" required placeholder="Full name" autocomplete="name">
        <input name="email" type="email" required placeholder="Email" autocomplete="email">
        <input name="phone" placeholder="Phone / WhatsApp" autocomplete="tel">
        <input name="country" placeholder="Country">
        <select name="travelers" id="groupTravelersSelect" onchange="updateDepositHint()">
          <option value="1">1 traveler</option>
          <option value="2">2 travelers</option>
          <option value="3">3 travelers</option>
          <option value="4">4 travelers</option>
        </select>
        <p id="groupDepositHint" class="group-deposit-note" style="margin-top:0">
          Estimated deposit (offline, after approval): <strong>$${sampleDeposit.toLocaleString()} USD</strong> (30%)
        </p>
        <textarea name="message" rows="3" placeholder="Notes (optional)"></textarea>
        <button type="submit" class="btn btn-primary" style="min-height:48px;width:100%">Send request</button>
      </form>
    ` : `<p style="margin:0;color:var(--text-muted);font-size:0.9rem">This departure is not open for new requests. <a href="/group-safaris">See other dates</a>.</p>`}
  `;
}

function updateDepositHint() {
  if (!currentDeparture) return;
  const price = Number(currentDeparture.sale_price_usd || currentDeparture.price_usd || 0);
  const travelers = document.getElementById('groupTravelersSelect')?.value || 1;
  const deposit = depositFor(price, travelers);
  const el = document.getElementById('groupDepositHint');
  if (el) {
    el.innerHTML = `Estimated deposit (offline, after approval): <strong>$${deposit.toLocaleString()} USD</strong> (30% for ${travelers} traveler${travelers > 1 ? 's' : ''})`;
  }
}

let currentDeparture = null;

async function loadGroupDetail() {
  const slug = slugFromPath();
  if (!slug) return;
  try {
    const { data } = await API.get(`/group-departures/${encodeURIComponent(slug)}`);
    currentDeparture = data;
    document.title = `${data.title} | Group Safari | Tanzania Safari Magic`;
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = `https://tanzaniasafarimagic.com/group-safaris/${data.departure_slug}`;

    document.getElementById('groupDetailTitle').textContent = data.title;
    document.getElementById('groupCrumbTitle').textContent = data.title;
    document.getElementById('groupDetailSubtitle').textContent =
      `${fmtDate(data.start_date)} – ${fmtDate(data.end_date)} · ${data.duration_days || ''} days`;

    if (data.featured_image_url) {
      document.getElementById('groupDetailHeroBg').style.backgroundImage =
        `url('${data.featured_image_url}')`;
    }

    document.getElementById('groupOverview').innerHTML =
      `<p style="line-height:1.75;color:var(--text-secondary)">${escapeHtml(data.detailed_description || data.short_description || '')}</p>`;

    const highlights = data.highlights || [];
    document.getElementById('groupHighlights').innerHTML = highlights.length
      ? highlights.map(h => `<div class="group-highlight">${escapeHtml(h)}</div>`).join('')
      : '';

    document.getElementById('groupForMe').innerHTML = `
      <h3 style="margin:0 0 0.5rem;font-size:1.05rem">Is this tour for me?</h3>
      <p style="margin:0;color:var(--text-secondary);line-height:1.65">
        <strong>Trip type:</strong> Small group safari on pre-scheduled dates (up to ${data.group_max_pax || data.capacity || 6} travelers) with a fixed per-person price.
        Great for solo travelers and couples. Minimum age: ${data.min_age != null ? data.min_age : 3}+.
      </p>`;

    document.getElementById('groupPacking').innerHTML = data.packing_list_html
      ? data.packing_list_html
      : `<p style="color:var(--text-secondary);line-height:1.7">Pack light neutral clothing, a warm layer for early game drives, sun protection, binoculars, and any personal medications. Our Team will send a full packing checklist when you request this trip.</p>`;

    const price = Number(data.sale_price_usd || data.price_usd || 0);
    const was = Number(data.price_usd || 0);
    document.getElementById('groupPriceBlock').innerHTML = `
      <p style="font-size:1.5rem;font-weight:800;color:var(--primary);margin:0 0 0.5rem">
        ${data.discount_percent > 0 && was > price ? `<s style="color:#999;font-size:1rem;font-weight:500;margin-right:0.4rem">$${was.toLocaleString()}</s>` : ''}
        $${price.toLocaleString()} <span style="font-size:0.95rem;font-weight:500;color:var(--text-muted)">per person</span>
      </p>
      ${data.discount_percent > 0 ? `<p style="color:var(--accent);font-weight:700;margin:0 0 0.75rem">Save up to ${data.discount_percent}%</p>` : ''}
      <p class="group-deposit-note">A <strong>30% deposit</strong> is typically required within <strong>24 hours</strong> after your request is approved. Payment is arranged offline with Our Team — this page does not take cards. Balance is due before departure as confirmed in writing.</p>
      <p style="color:var(--text-secondary);margin:0.85rem 0 0;line-height:1.65">Price is based on sharing. Single supplements and optional activities may apply — confirm with Our Team when you request this departure.</p>`;

    document.getElementById('groupItinerary').innerHTML = renderItinerary(data.itinerary);

    document.getElementById('groupInclusions').innerHTML = data.inclusions_html
      ? data.inclusions_html
      : listFromArray(data.included_features, 'Inclusions will be confirmed with your booking.');
    document.getElementById('groupExclusions').innerHTML = data.exclusions_html
      ? data.exclusions_html
      : listFromArray(data.excluded_features, 'Exclusions will be confirmed with your booking.');

    document.getElementById('groupVisa').innerHTML = data.visa_info_html
      ? data.visa_info_html
      : `<p style="color:var(--text-secondary);line-height:1.7">Most visitors need a Tanzania visa (e-visa or on arrival depending on nationality). A passport valid for at least 6 months and yellow fever certificate (if arriving from a risk country) are typically required. Our Team will advise based on your passport.</p>`;

    document.getElementById('groupSummary').innerHTML = renderSummary(data);
  } catch (e) {
    document.getElementById('groupDetailTitle').textContent = 'Departure not found';
    document.getElementById('groupSummary').innerHTML =
      `<p style="margin:0">This departure is unavailable. <a href="/group-safaris">Back to calendar</a>.</p>`;
  }
}

async function submitGroupRequest(event) {
  event.preventDefault();
  if (!currentDeparture) return false;
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const fd = new FormData(form);
  const body = Object.fromEntries(fd.entries());
  body.travelers = parseInt(body.travelers, 10) || 1;
  try {
    btn.disabled = true;
    btn.textContent = 'Sending…';
    const res = await API.post(
      `/group-departures/${encodeURIComponent(currentDeparture.departure_slug)}/request`,
      body
    );
    const msg = res.message || 'Request sent!';
    if (typeof toast === 'function') toast(msg, 'success', 8000);
    else alert(msg);
    form.reset();
    updateDepositHint();
  } catch (err) {
    const msg = err.message || 'Request failed. Please try again or WhatsApp Our Team.';
    if (typeof toast === 'function') toast(msg, 'error');
    else alert(msg);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send request';
  }
  return false;
}

window.submitGroupRequest = submitGroupRequest;
window.updateDepositHint = updateDepositHint;
loadGroupDetail();
