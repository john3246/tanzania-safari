function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

function localeTag() {
  const lang = (window.TSM_i18n && window.TSM_i18n.getLanguage && window.TSM_i18n.getLanguage()) || 'en';
  const map = { en: 'en-GB', it: 'it-IT', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', nl: 'nl-NL' };
  return map[lang] || 'en-GB';
}

function slugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(localeTag(), { day: '2-digit', month: 'short', year: 'numeric' });
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
    return `<p style="color:var(--text-muted)">${escapeHtml(t('groupDetail.itineraryEmpty'))}</p>`;
  }
  return itinerary.map((day, i) => `
    <div class="group-itinerary-day">
      <div class="day-label">${escapeHtml(t('groupDetail.dayN', { n: day.day || i + 1 }))}</div>
      <h3>${escapeHtml(day.title || t('groupDetail.safariDay'))}</h3>
      <p style="margin:0;color:var(--text-secondary);line-height:1.65">${escapeHtml(day.description || '')}</p>
      ${window.TSM_ACCOM && typeof window.TSM_ACCOM.cardsHtml === 'function' ? window.TSM_ACCOM.cardsHtml(day) : ''}
    </div>
  `).join('');
}

function depositFor(price, travelers) {
  const p = Number(price) || 0;
  const n = Math.max(1, parseInt(travelers, 10) || 1);
  return Math.round(p * n * 0.3);
}

function travelerOptionsHtml() {
  let html = `<option value="1">${escapeHtml(t('groupDetail.traveler1'))}</option>`;
  for (let n = 2; n <= 4; n++) {
    html += `<option value="${n}">${escapeHtml(t('groupDetail.travelerN', { n }))}</option>`;
  }
  return html;
}

function renderSummary(d) {
  const price = Number(d.sale_price_usd || d.price_usd || 0);
  const was = Number(d.price_usd || 0);
  const showWas = d.discount_percent > 0 && was > price;
  const canRequest = d.status !== 'full' && d.status !== 'cancelled' && Number(d.seats_left) > 0;
  const sampleDeposit = depositFor(price, 1);
  return `
    <div class="group-summary-row"><span>${escapeHtml(t('groupDetail.start'))}</span><strong>${fmtDate(d.start_date)}</strong></div>
    <div class="group-summary-row"><span>${escapeHtml(t('groupDetail.end'))}</span><strong>${fmtDate(d.end_date)}</strong></div>
    <div class="group-summary-row"><span>${escapeHtml(t('groupDetail.duration'))}</span><strong>${d.duration_days || '—'} ${escapeHtml(t('groupDetail.days'))}</strong></div>
    <div class="group-summary-row"><span>${escapeHtml(t('groupDetail.physicalRating'))}</span><strong>${escapeHtml(d.physical_rating || t('groupDetail.easy'))}</strong></div>
    <div class="group-summary-row"><span>${escapeHtml(t('groupDetail.seatsLeft'))}</span><strong>${d.seats_left} / ${d.capacity}</strong></div>
    <div class="group-summary-row"><span>${escapeHtml(t('groupDetail.status'))}</span><strong>${escapeHtml(String(d.status || '').replace(/_/g, ' '))}</strong></div>
    <div class="group-summary-price">
      ${showWas ? `<s>$${was.toLocaleString()}</s>` : ''}
      $${price.toLocaleString()}
      <div style="font-size:0.8rem;font-weight:500;color:var(--text-muted)">${escapeHtml(t('groupDetail.perPerson'))}</div>
    </div>
    ${canRequest ? `
      <button type="button" class="btn btn-primary" style="width:100%;min-height:48px" onclick="document.getElementById('requestTripForm').scrollIntoView({behavior:'smooth'})">
        <i class="fas fa-paw"></i> ${escapeHtml(t('groupDetail.requestTrip'))}
      </button>
      <p class="group-deposit-note">
        ${t('groupDetail.depositNoteHtml', { amount: sampleDeposit.toLocaleString() })}
      </p>
      <form id="requestTripForm" class="group-request-form" onsubmit="return submitGroupRequest(event)">
        <input name="full_name" required placeholder="${escapeHtml(t('groupDetail.fullName'))}" autocomplete="name">
        <input name="email" type="email" required placeholder="${escapeHtml(t('groupDetail.email'))}" autocomplete="email">
        <input name="phone" placeholder="${escapeHtml(t('groupDetail.phone'))}" autocomplete="tel">
        <input name="country" placeholder="${escapeHtml(t('groupDetail.country'))}">
        <select name="travelers" id="groupTravelersSelect" onchange="updateDepositHint()">
          ${travelerOptionsHtml()}
        </select>
        <p id="groupDepositHint" class="group-deposit-note" style="margin-top:0">
          ${t('groupDetail.depositHintHtml', { amount: sampleDeposit.toLocaleString() })}
        </p>
        <textarea name="message" rows="3" placeholder="${escapeHtml(t('groupDetail.notesOptional'))}"></textarea>
        <button type="submit" class="btn btn-primary" style="min-height:48px;width:100%">${escapeHtml(t('groupDetail.sendRequest'))}</button>
      </form>
    ` : `<p style="margin:0;color:var(--text-muted);font-size:0.9rem">${t('groupDetail.notOpenHtml')}</p>`}
  `;
}

function updateDepositHint() {
  if (!currentDeparture) return;
  const price = Number(currentDeparture.sale_price_usd || currentDeparture.price_usd || 0);
  const travelers = document.getElementById('groupTravelersSelect')?.value || 1;
  const deposit = depositFor(price, travelers);
  const el = document.getElementById('groupDepositHint');
  if (el) {
    const n = parseInt(travelers, 10) || 1;
    el.innerHTML = t('groupDetail.depositHintTravelersHtml', {
      amount: deposit.toLocaleString(),
      n,
      s: n > 1 ? 's' : ''
    });
  }
}

let currentDeparture = null;

async function loadGroupDetail() {
  try {
    if (window.TSM_i18n && window.TSM_i18n.ready) await window.TSM_i18n.ready;
  } catch (_) {}

  const slug = slugFromPath();
  if (!slug) return;
  try {
    const { data } = await API.get(`/group-departures/${encodeURIComponent(slug)}`);
    currentDeparture = data;
    document.title = `${data.title} | ${t('groupDetail.titleSuffix')} | Tanzania Safari Magic`;
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = `https://tanzaniasafarimagic.com/group-safaris/${data.departure_slug}`;

    document.getElementById('groupDetailTitle').textContent = data.title;
    document.getElementById('groupCrumbTitle').textContent = data.title;
    document.getElementById('groupDetailSubtitle').textContent =
      `${fmtDate(data.start_date)} – ${fmtDate(data.end_date)} · ${data.duration_days || ''} ${t('groupDetail.days')}`;

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
      <h3 style="margin:0 0 0.5rem;font-size:1.05rem">${escapeHtml(t('groupDetail.forMeTitle'))}</h3>
      <p style="margin:0;color:var(--text-secondary);line-height:1.65">
        ${t('groupDetail.forMeHtml', {
          max: data.group_max_pax || data.capacity || 6,
          age: data.min_age != null ? data.min_age : 3
        })}
      </p>`;

    document.getElementById('groupPacking').innerHTML = data.packing_list_html
      ? data.packing_list_html
      : `<p style="color:var(--text-secondary);line-height:1.7">${escapeHtml(t('groupDetail.packingDefault'))}</p>`;

    const price = Number(data.sale_price_usd || data.price_usd || 0);
    const was = Number(data.price_usd || 0);
    document.getElementById('groupPriceBlock').innerHTML = `
      <p style="font-size:1.5rem;font-weight:800;color:var(--primary);margin:0 0 0.5rem">
        ${data.discount_percent > 0 && was > price ? `<s style="color:#999;font-size:1rem;font-weight:500;margin-right:0.4rem">$${was.toLocaleString()}</s>` : ''}
        $${price.toLocaleString()} <span style="font-size:0.95rem;font-weight:500;color:var(--text-muted)">${escapeHtml(t('groupDetail.perPerson'))}</span>
      </p>
      ${data.discount_percent > 0 ? `<p style="color:var(--accent);font-weight:700;margin:0 0 0.75rem">${escapeHtml(t('groupDetail.saveUpTo', { n: data.discount_percent }))}</p>` : ''}
      <p class="group-deposit-note">${t('groupDetail.priceDepositNoteHtml')}</p>
      <p style="color:var(--text-secondary);margin:0.85rem 0 0;line-height:1.65">${escapeHtml(t('groupDetail.priceSharingNote'))}</p>`;

    if (window.TSM_ACCOM && window.TSM_ACCOM.ready) await window.TSM_ACCOM.ready;
    document.getElementById('groupItinerary').innerHTML = renderItinerary(data.itinerary);

    document.getElementById('groupInclusions').innerHTML = data.inclusions_html
      ? data.inclusions_html
      : listFromArray(data.included_features, escapeHtml(t('groupDetail.inclusionsEmpty')));
    document.getElementById('groupExclusions').innerHTML = data.exclusions_html
      ? data.exclusions_html
      : listFromArray(data.excluded_features, escapeHtml(t('groupDetail.exclusionsEmpty')));

    document.getElementById('groupVisa').innerHTML = data.visa_info_html
      ? data.visa_info_html
      : `<p style="color:var(--text-secondary);line-height:1.7">${escapeHtml(t('groupDetail.visaDefault'))}</p>`;

    document.getElementById('groupSummary').innerHTML = renderSummary(data);
  } catch (e) {
    document.getElementById('groupDetailTitle').textContent = t('groupDetail.notFound');
    document.getElementById('groupSummary').innerHTML =
      `<p style="margin:0">${t('groupDetail.unavailableHtml')}</p>`;
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
    btn.textContent = t('groupDetail.sending');
    const res = await API.post(
      `/group-departures/${encodeURIComponent(currentDeparture.departure_slug)}/request`,
      body
    );
    const msg = res.message || t('groupDetail.requestSent');
    if (typeof toast === 'function') toast(msg, 'success', 8000);
    else alert(msg);
    form.reset();
    updateDepositHint();
  } catch (err) {
    const msg = err.message || t('groupDetail.requestFail');
    if (typeof toast === 'function') toast(msg, 'error');
    else alert(msg);
  } finally {
    btn.disabled = false;
    btn.textContent = t('groupDetail.sendRequest');
  }
  return false;
}

window.submitGroupRequest = submitGroupRequest;
window.updateDepositHint = updateDepositHint;

document.addEventListener('tsm:languagechange', () => {
  if (currentDeparture) loadGroupDetail();
});

loadGroupDetail();
