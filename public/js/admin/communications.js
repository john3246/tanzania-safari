// ── Email campaigns / communications ─────────────────────────
let campaignContentOptions = { tours: [], destinations: [], blogs: [], reviews: [] };

function toggleCustomEmailInput() {
    const type = document.querySelector('input[name="recipientType"]:checked')?.value;
    const customContainer = document.getElementById('customEmailInputContainer');
    const customEmail = document.getElementById('customEmailAddress');
    if (!customContainer) return;
    if (type === 'custom') {
        customContainer.classList.remove('hidden');
        if (customEmail) customEmail.required = true;
    } else {
        customContainer.classList.add('hidden');
        if (customEmail) customEmail.required = false;
    }
}

function onCampaignTypeChange() {
    const type = document.getElementById('campaignType')?.value || 'custom';
    const refWrap = document.getElementById('contentRefWrap');
    const offer = document.getElementById('offerFields');
    const select = document.getElementById('contentRef');
    if (!refWrap || !offer || !select) return;

    offer.classList.toggle('hidden', type !== 'offer');
    if (type === 'custom' || type === 'offer') {
        refWrap.classList.add('hidden');
        return;
    }
    refWrap.classList.remove('hidden');
    const map = {
        tour: campaignContentOptions.tours,
        destination: campaignContentOptions.destinations,
        blog: campaignContentOptions.blogs,
        review: campaignContentOptions.reviews
    };
    const list = map[type] || [];
    select.innerHTML = list.map(i =>
        `<option value="${i.id || i.slug}">${escapeHtml(i.title || i.slug || String(i.id))}</option>`
    ).join('') || '<option value="">No items</option>';
}

async function previewCampaign() {
    const campaignType = document.getElementById('campaignType')?.value;
    const contentRef = document.getElementById('contentRef')?.value;
    const payload = { campaignType, contentRef };
    if (campaignType === 'offer') {
        payload.offer = {
            title: document.getElementById('offerTitle')?.value,
            message: document.getElementById('offerMessage')?.value,
            ctaUrl: document.getElementById('offerCtaUrl')?.value,
            subject: document.getElementById('emailSubject')?.value
        };
    }
    try {
        const res = await apiRequest('POST', '/communications/preview', payload);
        if (res.data?.subject) document.getElementById('emailSubject').value = res.data.subject;
        if (res.data?.bodyHtml) document.getElementById('emailBody').value = res.data.bodyHtml;
        showToast('Preview loaded', 'success');
    } catch (e) {
        showToast(e.message || 'Preview failed', 'error');
    }
}

async function sendBroadcastEmail() {
    const btn = document.getElementById('sendEmailBtn');
    setLoading(btn, true);
    try {
        const type = document.querySelector('input[name="recipientType"]:checked').value;
        const campaignType = document.getElementById('campaignType')?.value || 'custom';
        const payload = {
            recipientType: type,
            subject: document.getElementById('emailSubject').value,
            bodyHtml: document.getElementById('emailBody').value,
            campaignType,
            contentRef: document.getElementById('contentRef')?.value || null
        };
        if (type === 'custom') payload.email = document.getElementById('customEmailAddress').value;
        if (campaignType === 'offer') {
            payload.offer = {
                title: document.getElementById('offerTitle')?.value,
                message: document.getElementById('offerMessage')?.value,
                ctaUrl: document.getElementById('offerCtaUrl')?.value,
                subject: payload.subject
            };
        }
        const res = await apiRequest('POST', '/communications/send', payload);
        showToast(res.message || 'Email sent successfully!', 'success');
        document.getElementById('communicationsForm').reset();
        toggleCustomEmailInput();
        onCampaignTypeChange();
        loadCommunications();
    } catch (e) {
        showToast(e.message || 'Failed to send email', 'error');
    } finally {
        setLoading(btn, false);
    }
}

async function loadCommunications() {
    try {
        const [subs, campaigns, options] = await Promise.all([
            apiRequest('GET', '/communications/subscribers').catch(() => ({ data: [] })),
            apiRequest('GET', '/communications/campaigns').catch(() => ({ data: [] })),
            apiRequest('GET', '/communications/content-options').catch(() => ({ data: {} }))
        ]);
        campaignContentOptions = options.data || campaignContentOptions;
        const countEl = document.getElementById('subscriberCount');
        if (countEl) countEl.textContent = (subs.data || []).length;
        const list = document.getElementById('subscriberList');
        if (list) {
            list.innerHTML = (subs.data || []).slice(0, 40).map(s =>
                `<div class="py-1 border-b border-slate-50">${escapeHtml(s.email)}${s.full_name ? ' · ' + escapeHtml(s.full_name) : ''}</div>`
            ).join('') || '<p class="text-slate-400">No subscribers yet.</p>';
        }
        const hist = document.getElementById('campaignHistory');
        if (hist) {
            hist.innerHTML = (campaigns.data || []).map(c => `
                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div class="font-semibold text-slate-800 text-xs">${escapeHtml(c.subject)}</div>
                    <div class="text-[11px] text-slate-500 mt-1">${escapeHtml(c.campaign_type)} · ${c.recipients_count || 0} sent · ${c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div>
                </div>
            `).join('') || '<p class="text-slate-400 text-xs">No campaigns yet.</p>';
        }
        onCampaignTypeChange();
        toggleCustomEmailInput();
    } catch (e) {
        console.warn('loadCommunications', e);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.loadCommunications = loadCommunications;
window.toggleCustomEmailInput = toggleCustomEmailInput;
window.onCampaignTypeChange = onCampaignTypeChange;
window.previewCampaign = previewCampaign;
window.sendBroadcastEmail = sendBroadcastEmail;
