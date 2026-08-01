const header = document.getElementById('header');
window.addEventListener('scroll', () => { header?.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });
document.getElementById('mobileToggle')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.toggle('active'); document.getElementById('menuOverlay')?.classList.toggle('active'); });
document.getElementById('menuOverlay')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.remove('active'); document.getElementById('menuOverlay')?.classList.remove('active'); });
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

/* Multi-step wizard logic removed – single-stage form now handles all fields */
let packages = [];
let selectedPkg = null;

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
    if (!selectedPkg) { sc.innerHTML = '<p style="color:var(--text-muted);font-size:.875rem;text-align:center;padding:1rem 0">Select a package to see pricing</p>'; return; }
    const basePrice = parseFloat(selectedPkg.base_price_usd || 0);
    const childPrice = basePrice * 0.7;
    const total = (basePrice * adults) + (childPrice * children);
    const deposit = total * 0.2;
    updateEndDate();
    sc.innerHTML = `
    <div class="summary-row"><span class="summary-label">Package</span><span class="summary-value" style="max-width:160px;text-align:right;font-size:.875rem">${selectedPkg.package_name}</span></div>
    <div class="summary-row"><span class="summary-label">Duration</span><span class="summary-value">${selectedPkg.duration_days} Days</span></div>
    <div class="summary-row"><span class="summary-label">${adults} Adult${adults>1?'s':''}</span><span class="summary-value">$${(basePrice*adults).toLocaleString()}</span></div>
    ${children>0?`<div class="summary-row"><span class="summary-label">${children} Child${children>1?'ren':''} (70%)</span><span class="summary-value">$${(childPrice*children).toLocaleString()}</span></div>`:''}
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
      <div class="summary-row"><span class="summary-label">Name</span><span class="summary-value">${data.full_name}</span></div>
      <div class="summary-row"><span class="summary-label">Email</span><span class="summary-value">${data.email}</span></div>
      <div class="summary-row"><span class="summary-label">Package</span><span class="summary-value">${selectedPkg?.package_name||''}</span></div>
      <div class="summary-row"><span class="summary-label">Date</span><span class="summary-value">${new Date(data.start_date).toLocaleDateString('en-US',{dateStyle:'long'})}</span></div>
      <div class="summary-row"><span class="summary-label">Travelers</span><span class="summary-value">${data.number_of_adults} Adults, ${data.number_of_children||0} Children</span></div>
    </div>`;
}

document.getElementById('bookingForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending request...';
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(e.target));
    const adults = parseInt(data.number_of_adults || 1);
    const children = parseInt(data.number_of_children || 0);
    const basePrice = parseFloat(selectedPkg?.base_price_usd || 0);
    const total = (basePrice * adults) + (basePrice * 0.7 * children);
    try {
        const payload = { ...data, total_price_usd: total, booking_source: 'Website' };
        if (selectedPkg && selectedPkg.package_name) {
            payload.package_name = selectedPkg.package_name;
        }
        const res = await API.post('/bookings', payload);
        // Hide optional steps bar if present
        if (document.getElementById('stepsBar')) {
          document.getElementById('stepsBar').style.display = 'none';
        }
        document.getElementById('bookingForm').style.display = 'none';
        const sb = document.getElementById('successBox');
        sb.style.display = 'block';
        // Soft thank-you URL for analytics without leaving the page content
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
        document.getElementById('bookingRef').innerHTML = `
        <div class="summary-row"><span class="summary-label">Booking Ref</span><span class="summary-value">#${res.data?.booking_id || 'TZ-' + Date.now()}</span></div>
        <div class="summary-row"><span class="summary-label">Package</span><span class="summary-value">${selectedPkg?.package_name}</span></div>
        <div class="summary-row"><span class="summary-label">Date</span><span class="summary-value">${new Date(data.start_date).toLocaleDateString('en-US',{dateStyle:'long'})}</span></div>
        <div class="summary-row"><span class="summary-label">Total</span><span class="summary-value">$${total.toLocaleString()}</span></div>`;
    } catch (err) {
        toast(err.message || 'Booking failed. Please try again.', 'error');
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Request Free Quote';
        btn.disabled = false;
    }
});

// Load packages
async function loadPackages() {
    try {
        const { data } = await API.get('/packages?limit=100');
        packages = data || [];
        const sel = document.getElementById('packageSelect');
        packages.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.package_id;
            opt.textContent = `${p.package_name} — $${Number(p.base_price_usd).toLocaleString()} (${p.duration_days} days)`;
            sel.appendChild(opt);
        });
        // Pre-select from URL
        const urlPkg = new URLSearchParams(window.location.search).get('package');
        if (urlPkg) {
            const match = packages.find(p => p.package_slug === urlPkg);
            if (match) { sel.value = match.package_id; updateSummary(); }
        }
        // Min date = tomorrow
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('startDate').min = tomorrow.toISOString().split('T')[0];
    } catch {}
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