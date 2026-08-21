function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

const header = document.getElementById('header');
window.addEventListener('scroll', () => { header?.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });
document.getElementById('mobileToggle')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.toggle('active'); document.getElementById('menuOverlay')?.classList.toggle('active'); });
document.getElementById('menuOverlay')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.remove('active'); document.getElementById('menuOverlay')?.classList.remove('active'); });
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

/* Multi-step wizard logic removed – single-stage form now handles all fields */
let packages = [];
let selectedPkg = null;

function adultLabel(n) {
    if (n >= 6) return t('booking.adult6');
    const key = 'booking.adult' + n;
    const val = t(key);
    return val !== key ? val : `${n} ${t('booking.adults')}`;
}

function childLabel(n) {
    if (n <= 0) return t('booking.noChildren');
    if (n >= 3) return t('booking.child3');
    const key = 'booking.child' + n;
    const val = t(key);
    return val !== key ? val : `${n} ${t('booking.children')}`;
}

function updateEndDate() {
    const pkgId = document.getElementById('packageSelect').value;
    const start = document.getElementById('startDate').value;
    if (!start) return;
    const pkg = packages.find(p => String(p.package_id) === String(pkgId));
    if (pkg && start) {
        const end = new Date(start);
        end.setDate(end.getDate() + parseInt(pkg.duration_days || 1));
        document.getElementById('endDate').value = end.toISOString().split('T')[0];
    }
    // End date updated; summary will be refreshed by updateSummary when needed
}
window.updateEndDate = updateEndDate;

function updateSummary() {
    const pkgId = document.getElementById('packageSelect').value;
    selectedPkg = packages.find(p => String(p.package_id) === String(pkgId));
    const adults = parseInt(document.querySelector('[name="number_of_adults"]')?.value || 1);
    const children = parseInt(document.querySelector('[name="number_of_children"]')?.value || 0);
    const sc = document.getElementById('summaryContent');
    if (!selectedPkg) { sc.innerHTML = `<p style="color:var(--text-muted);font-size:.875rem;text-align:center;padding:1rem 0">${t('booking.selectToPrice')}</p>`; return; }
    const basePrice = parseFloat(selectedPkg.base_price_usd || 0);
    const childPrice = basePrice * 0.7;
    const total = (basePrice * adults) + (childPrice * children);
    const deposit = total * 0.2;
    updateEndDate();
    sc.innerHTML = `
    <div class="summary-row"><span class="summary-label">${t('booking.package')}</span><span class="summary-value" style="max-width:160px;text-align:right;font-size:.875rem">${selectedPkg.package_name}</span></div>
    <div class="summary-row"><span class="summary-label">${t('safarisPage.duration')}</span><span class="summary-value">${selectedPkg.duration_days} ${t('common.days')}</span></div>
    <div class="summary-row"><span class="summary-label">${adultLabel(adults)}</span><span class="summary-value">$${(basePrice*adults).toLocaleString()}</span></div>
    ${children>0?`<div class="summary-row"><span class="summary-label">${childLabel(children)} (70%)</span><span class="summary-value">$${(childPrice*children).toLocaleString()}</span></div>`:''}
    <div class="summary-row" style="border-top:2px solid var(--border);margin-top:.5rem;padding-top:.75rem"><span class="summary-label">Estimated total</span><span class="summary-value" style="color:var(--primary);font-size:1.25rem">$${total.toLocaleString()}</span></div>
    <div class="summary-row"><span class="summary-label">Typical deposit later</span><span class="summary-value" style="color:var(--success)">~$${deposit.toLocaleString()} (20%)</span></div>
    <p style="font-size:0.75rem;color:var(--text-muted);margin:0.5rem 0 0;line-height:1.45">This form requests a quote — no card charged online. After you accept the itinerary, Our Team sends deposit instructions.</p>`;
}
window.updateSummary = updateSummary;

function buildConfirmSummary() {
    const data = Object.fromEntries(new FormData(document.getElementById('bookingForm')));
    const el = document.getElementById('confirmSummary');
    el.innerHTML = `
    <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:1.25rem">
      <div class="summary-row"><span class="summary-label">${t('booking.fullName')}</span><span class="summary-value">${data.full_name}</span></div>
      <div class="summary-row"><span class="summary-label">${t('booking.email')}</span><span class="summary-value">${data.email}</span></div>
      <div class="summary-row"><span class="summary-label">${t('booking.package')}</span><span class="summary-value">${selectedPkg?.package_name||''}</span></div>
      <div class="summary-row"><span class="summary-label">${t('booking.startDate')}</span><span class="summary-value">${new Date(data.start_date).toLocaleDateString('en-US',{dateStyle:'long'})}</span></div>
      <div class="summary-row"><span class="summary-label">${t('contact.travelers')}</span><span class="summary-value">${adultLabel(parseInt(data.number_of_adults||1))}, ${childLabel(parseInt(data.number_of_children||0))}</span></div>
    </div>`;
}

function showFieldError(name, on) {
    const input = document.querySelector(`[name="${name}"]`);
    const err = document.querySelector(`[data-error-for="${name}"]`);
    input?.classList.toggle('is-invalid', !!on);
    if (err) err.style.display = on ? 'block' : 'none';
}

function validateBookingForm(data) {
    let ok = true;
    const nameOk = String(data.full_name || '').trim().length >= 2;
    showFieldError('full_name', !nameOk);
    if (!nameOk) ok = false;

    const dateOk = !!data.start_date;
    showFieldError('start_date', !dateOk);
    if (!dateOk) ok = false;

    const interestOk = !!data.destination_interest;
    showFieldError('destination_interest', !interestOk);
    if (!interestOk) ok = false;

    const email = String(data.email || '').trim();
    const phone = String(data.phone || '').trim();
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    showFieldError('email', !emailOk);
    if (!emailOk) ok = false;

    const method = data.contact_method || 'email';
    const hasContact = (method === 'email' && emailOk && email) || ((method === 'whatsapp' || method === 'phone') && phone.length >= 7) || (email && emailOk) || phone.length >= 7;
    showFieldError('phone', !hasContact && method !== 'email');
    showFieldError('email', !hasContact && method === 'email');
    if (!hasContact) ok = false;

    return ok;
}

document.getElementById('optionalToggle')?.addEventListener('click', () => {
    const box = document.getElementById('optionalFields');
    if (!box) return;
    box.hidden = !box.hidden;
});

document.getElementById('bookingForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (!validateBookingForm(data)) {
        toast(t('toast.sendFail') !== 'toast.sendFail' ? t('toast.sendFail') : 'Please complete the highlighted fields.', 'error');
        return;
    }
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('common.sending')}`;
    btn.disabled = true;
    const adults = parseInt(data.number_of_adults || 1);
    const children = parseInt(data.number_of_children || 0);
    const basePrice = parseFloat(selectedPkg?.base_price_usd || 0);
    const total = (basePrice * adults) + (basePrice * 0.7 * children);
    const extraNotes = [
        data.destination_interest ? `Interest: ${data.destination_interest}` : '',
        data.budget_range ? `Budget: ${data.budget_range}` : '',
        data.contact_method ? `Contact via: ${data.contact_method}` : '',
        data.special_requests || ''
    ].filter(Boolean).join('\n');
    try {
        const payload = {
            ...data,
            special_requests: extraNotes,
            package_id: data.package_id || null,
            email: data.email || '',
            total_price_usd: total,
            booking_source: 'Website'
        };
        if (selectedPkg && selectedPkg.package_name) {
            payload.package_name = selectedPkg.package_name;
        }
        const res = await API.post('/bookings', payload);
        if (window.TSMAnalytics && typeof window.TSMAnalytics.markFormSuccess === 'function') {
            window.TSMAnalytics.markFormSuccess('booking');
        }
        if (document.getElementById('stepsBar')) {
          document.getElementById('stepsBar').style.display = 'none';
        }
        document.getElementById('bookingForm').style.display = 'none';
        const sb = document.getElementById('successBox');
        sb.style.display = 'block';
        try {
            window.history.replaceState({}, '', '/thank-you?from=booking');
            if (window.SafariSEO) {
                SafariSEO.applyPageSeo({
                    title: 'Thank You | Tanzania Safari Magic',
                    description: 'Your Tanzania safari booking request was received. Our Arusha team will contact you shortly.',
                    noindex: true
                });
            }
        } catch (_) {}
        const hours = (window.TSM_SITE_CONFIG && window.TSM_SITE_CONFIG.quoteResponseHours) || 24;
        document.getElementById('bookingRef').innerHTML = `
        <div class="summary-row"><span class="summary-label">Quote ref</span><span class="summary-value">#${res.data?.booking_id || res.data?.booking_reference || 'TZ-' + Date.now()}</span></div>
        <div class="summary-row"><span class="summary-label">${t('booking.package')}</span><span class="summary-value">${selectedPkg?.package_name || data.destination_interest || 'Custom itinerary'}</span></div>
        <div class="summary-row"><span class="summary-label">${t('booking.startDate')}</span><span class="summary-value">${data.start_date ? new Date(data.start_date).toLocaleDateString('en-US',{dateStyle:'long'}) : '—'}</span></div>
        <p style="margin:1rem 0 0;font-size:0.9rem;color:var(--text-muted)">We’ll reply within ${hours} hours. No payment was taken.</p>`;
        sb.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        toast(err.message || t('toast.sendFail'), 'error');
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t('booking.requestQuote')}`;
        btn.disabled = false;
    }
});

function normalizeSlug(s) {
    return String(s || '')
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, '');
}

function findPackageFromParams(params) {
    const slug =
        params.get('package') ||
        params.get('package_slug') ||
        params.get('slug') ||
        '';
    const id = params.get('package_id') || params.get('id') || '';
    const nameHint = (params.get('name') || params.get('interest') || '').toLowerCase();
    const route = normalizeSlug(params.get('route') || '');

    if (id) {
        const byId = packages.find((p) => String(p.package_id) === String(id));
        if (byId) return byId;
    }
    if (slug) {
        const want = normalizeSlug(slug);
        const bySlug = packages.find((p) => normalizeSlug(p.package_slug) === want);
        if (bySlug) return bySlug;
    }
    if (route) {
        const routeKey = route.replace(/-route$/, '').replace(/-/g, ' ');
        const kili = packages.filter(
            (p) =>
                /kilimanjaro|machame|marangu|lemosho|rongai|umbwe|northern|shira|meru/i.test(
                    `${p.package_name || ''} ${p.package_slug || ''} ${p.category_name || ''}`
                )
        );
        const scored = kili
            .map((p) => {
                const blob = `${p.package_name || ''} ${p.package_slug || ''}`.toLowerCase();
                let score = 0;
                routeKey.split(/\s+/).forEach((w) => {
                    if (w && blob.includes(w)) score += 2;
                });
                if (blob.includes(route.replace(/-/g, ' '))) score += 3;
                return { p, score };
            })
            .sort((a, b) => b.score - a.score);
        if (scored[0] && scored[0].score > 0) return scored[0].p;
        // Fall back to any Kilimanjaro-category package so the form is not empty
        if (kili[0]) return kili[0];
    }
    if (nameHint) {
        const byName = packages.find((p) =>
            String(p.package_name || '')
                .toLowerCase()
                .includes(nameHint.slice(0, 24))
        );
        if (byName) return byName;
    }
    return null;
}

function applyBookingPrefill(params, match) {
    const sel = document.getElementById('packageSelect');
    const special = document.querySelector('[name="special_requests"]');
    const interest = params.get('interest') || params.get('name') || '';
    const route = params.get('route') || '';

    if (match && sel) {
        sel.value = String(match.package_id);
        // Keep selection visible & harder to miss
        sel.setAttribute('data-preselected', '1');
        try {
            sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (_) {}
        updateSummary();
    }

    if (special && (interest || route)) {
        const line = [
            interest ? `Interested in: ${interest}` : '',
            route ? `Route preference: ${route.replace(/-/g, ' ')}` : '',
            match ? `Pre-selected package: ${match.package_name}` : ''
        ]
            .filter(Boolean)
            .join('\n');
        if (!special.value.trim()) special.value = line;
        else if (!special.value.includes(interest || route)) special.value = `${line}\n\n${special.value}`;
    }

    // Banner under package select
    if ((match || interest || route) && sel && !document.getElementById('preselectNote')) {
        const note = document.createElement('p');
        note.id = 'preselectNote';
        note.style.cssText = 'margin:0.5rem 0 0;font-size:0.85rem;color:var(--primary);font-weight:600';
        const label = match
            ? `${t('booking.preselected') !== 'booking.preselected' ? t('booking.preselected') : 'Pre-selected from your page'}: ${match.package_name}`
            : `${t('booking.routePrefill') !== 'booking.routePrefill' ? t('booking.routePrefill') : 'Route interest noted'}: ${interest || route}`;
        note.innerHTML = `<i class="fas fa-check-circle"></i> ${label}`;
        sel.parentElement?.appendChild(note);
    }
}

// Load packages
async function loadPackages() {
    try {
        const { data } = await API.get('/packages?limit=100');
        packages = Array.isArray(data) ? data : data?.packages || [];
        const sel = document.getElementById('packageSelect');
        if (!sel) return;
        packages.forEach((p) => {
            const opt = document.createElement('option');
            opt.value = p.package_id;
            opt.dataset.slug = p.package_slug || '';
            opt.textContent = `${p.package_name} — $${Number(p.base_price_usd).toLocaleString()} (${p.duration_days} ${t('common.days')})`;
            sel.appendChild(opt);
        });

        const params = new URLSearchParams(window.location.search);
        const match = findPackageFromParams(params);
        applyBookingPrefill(params, match);

        // Min date = tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startEl = document.getElementById('startDate');
        if (startEl) startEl.min = tomorrow.toISOString().split('T')[0];
    } catch (_) {}
}

loadPackages();
// Initialize UI interactions after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // Focus first input for better UX
  document.getElementById('fullName')?.focus();
  // Update summary when package selection or traveler counts change
  document.getElementById('packageSelect')?.addEventListener('change', updateSummary);
  document.querySelectorAll('[name="number_of_adults"], [name="number_of_children"]').forEach(el => {
    el.addEventListener('input', updateSummary);
  });
});
