// ── Group Safaris CMS (Tours/Destinations-style management) ───
let groupPackages = [];
let groupDepartures = [];
let selectedGroupPackageId = null;
let allToursForMark = [];
let groupAdminTab = 'itineraries';

async function loadGroupSafaris() {
    try {
        const [pkgRes, depRes] = await Promise.all([
            apiRequest('GET', '/group-departures/packages'),
            apiRequest('GET', '/group-departures')
        ]);
        groupPackages = pkgRes.data || [];
        groupDepartures = depRes.data || [];
        renderGroupItineraries();
        renderGroupDepartures();
        fillDeparturePackageSelect();
        fillDeparturePackageFilter();
        switchGroupTab(groupAdminTab);
    } catch (e) {
        console.error(e);
        showToast('Failed to load group safaris', 'error');
    }
}

function switchGroupTab(tab) {
    groupAdminTab = tab === 'departures' ? 'departures' : 'itineraries';
    const it = document.getElementById('gsPanelItineraries');
    const dep = document.getElementById('gsPanelDepartures');
    const t1 = document.getElementById('gsTabItineraries');
    const t2 = document.getElementById('gsTabDepartures');
    if (!it || !dep) return;
    const onIt = groupAdminTab === 'itineraries';
    it.classList.toggle('hidden', !onIt);
    dep.classList.toggle('hidden', onIt);
    if (t1) {
        t1.className = onIt
            ? 'px-4 py-2.5 text-sm font-semibold border-b-2 border-emerald-600 text-emerald-700'
            : 'px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-800';
    }
    if (t2) {
        t2.className = !onIt
            ? 'px-4 py-2.5 text-sm font-semibold border-b-2 border-emerald-600 text-emerald-700'
            : 'px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-800';
    }
}

function filteredItineraries() {
    const q = (document.getElementById('groupItinerarySearch')?.value || '').toLowerCase().trim();
    const status = document.getElementById('groupItineraryStatus')?.value || '';
    return groupPackages.filter(p => {
        if (status === 'live' && !p.is_active) return false;
        if (status === 'draft' && p.is_active) return false;
        if (!q) return true;
        return String(p.package_name || '').toLowerCase().includes(q)
            || String(p.package_slug || '').toLowerCase().includes(q);
    });
}

function renderGroupItineraries() {
    const body = document.getElementById('groupItineraryBody');
    if (!body) return;
    const rows = filteredItineraries();
    if (!rows.length) {
        body.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500">No group itineraries yet. Add a group safari or mark an existing tour.</td></tr>`;
        return;
    }
    body.innerHTML = rows.map(p => `
        <tr class="hover:bg-slate-50/60">
            <td class="px-6 py-4">
                <div class="font-semibold text-gray-900">${escapeAdmin(p.package_name)}</div>
                <div class="text-xs text-gray-400 mt-0.5">${escapeAdmin(p.package_slug)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${p.duration_days || '—'} days</td>
            <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">$${Number(p.base_price_usd || 0).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap">${p.upcoming_departures || 0}</td>
            <td class="px-6 py-4">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                    ${p.is_active ? 'Live' : 'Draft'}
                </span>
            </td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
                <button type="button" class="p-2 text-gray-400 hover:text-emerald-600" title="Edit full details"
                    onclick="window.currentEditTourId='${p.package_id}'; navigate('edit-tour')"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="p-2 text-gray-400 hover:text-sky-600" title="Add departure"
                    onclick="selectedGroupPackageId='${p.package_id}'; switchGroupTab('departures'); openDepartureModal()"><i class="fa-solid fa-calendar-plus"></i></button>
                <button type="button" class="p-2 text-gray-400 hover:text-forest-700" title="View departures"
                    onclick="selectedGroupPackageId='${p.package_id}'; document.getElementById('groupDeparturePackageFilter').value='${p.package_id}'; switchGroupTab('departures'); filterGroupDepartures()"><i class="fa-solid fa-list"></i></button>
                <a class="p-2 text-gray-400 hover:text-amber-600 inline-block" title="Public calendar" href="/group-safaris" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </td>
        </tr>
    `).join('');
}

function filterGroupItineraries() {
    renderGroupItineraries();
}

function fillDeparturePackageFilter() {
    const sel = document.getElementById('groupDeparturePackageFilter');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All itineraries</option>' + groupPackages.map(p =>
        `<option value="${p.package_id}">${escapeAdmin(p.package_name)}</option>`
    ).join('');
    if (current) sel.value = current;
}

function filteredDepartures() {
    const q = (document.getElementById('groupDepartureSearch')?.value || '').toLowerCase().trim();
    const pkg = document.getElementById('groupDeparturePackageFilter')?.value || selectedGroupPackageId || '';
    const status = document.getElementById('groupDepartureStatusFilter')?.value || '';
    return groupDepartures.filter(d => {
        if (pkg && d.package_id !== pkg) return false;
        if (status && d.status !== status) return false;
        if (!q) return true;
        return String(d.title || '').toLowerCase().includes(q)
            || String(d.departure_slug || '').toLowerCase().includes(q)
            || String(d.package_name || '').toLowerCase().includes(q);
    });
}

function renderGroupDepartures() {
    const body = document.getElementById('groupDepartureBody');
    if (!body) return;
    const rows = filteredDepartures();
    if (!rows.length) {
        body.innerHTML = '<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500">No departures yet. Add a fixed date to appear on the public calendar.</td></tr>';
        return;
    }
    body.innerHTML = rows.map(d => {
        const statusClass = {
            open: 'bg-emerald-100 text-emerald-700',
            guaranteed: 'bg-sky-100 text-sky-700',
            almost_full: 'bg-amber-100 text-amber-700',
            full: 'bg-rose-100 text-rose-700',
            cancelled: 'bg-gray-100 text-gray-600'
        }[d.status] || 'bg-gray-100 text-gray-600';
        const price = d.discount_percent > 0
            ? `<span class="line-through text-gray-400 text-xs">$${Number(d.price_usd).toLocaleString()}</span> <strong>$${Number(d.sale_price_usd).toLocaleString()}</strong>`
            : `<strong>$${Number(d.price_usd || 0).toLocaleString()}</strong>`;
        return `
        <tr class="hover:bg-slate-50/60">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${fmtAdminDate(d.start_date)}</div>
                <div class="text-xs text-gray-400">→ ${fmtAdminDate(d.end_date)}</div>
            </td>
            <td class="px-6 py-4">
                <div class="font-medium text-gray-800">${escapeAdmin(d.title)}</div>
                <div class="text-xs text-gray-400 truncate max-w-[14rem]">${escapeAdmin(d.departure_slug)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${d.seats_left} / ${d.capacity}</td>
            <td class="px-6 py-4 whitespace-nowrap">${price}</td>
            <td class="px-6 py-4">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}">${d.status}</span>
                ${!d.is_active ? '<div class="text-[10px] text-amber-600 mt-1">Hidden</div>' : ''}
            </td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
                <button type="button" class="p-2 text-gray-400 hover:text-emerald-600" title="Edit" onclick="editDepartureById('${d.departure_id}')"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="p-2 text-gray-400 hover:text-sky-600" title="+1 seat booked" onclick="bumpSeats('${d.departure_id}', 1)"><i class="fa-solid fa-user-plus"></i></button>
                <button type="button" class="p-2 text-gray-400 hover:text-amber-600" title="-1 seat booked" onclick="bumpSeats('${d.departure_id}', -1)"><i class="fa-solid fa-user-minus"></i></button>
                <a class="p-2 text-gray-400 hover:text-forest-700 inline-block" title="View public" href="/group-safaris/${encodeURIComponent(d.departure_slug)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                <button type="button" class="p-2 text-gray-400 hover:text-red-600" title="Delete" onclick="deleteDeparture('${d.departure_id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function filterGroupDepartures() {
    selectedGroupPackageId = document.getElementById('groupDeparturePackageFilter')?.value || null;
    renderGroupDepartures();
}

function fillDeparturePackageSelect() {
    const sel = document.getElementById('departurePackageId');
    if (!sel) return;
    sel.innerHTML = groupPackages.map(p =>
        `<option value="${p.package_id}">${escapeAdmin(p.package_name)}</option>`
    ).join('') || '<option value="">No group packages</option>';
    if (selectedGroupPackageId) sel.value = selectedGroupPackageId;
}

async function openMarkGroupModal() {
    const modal = document.getElementById('markGroupModal');
    if (!modal) return;
    try {
        const res = await apiRequest('GET', '/tours?limit=200');
        allToursForMark = (res.data || res.tours || []).filter(t => !t.is_group_tour);
        const sel = document.getElementById('markGroupPackageSelect');
        sel.innerHTML = allToursForMark.map(t =>
            `<option value="${t.id || t.package_id}">${escapeAdmin(t.title || t.package_name)}</option>`
        ).join('') || '<option value="">No tours available</option>';
        const start = document.getElementById('markGroupStart');
        if (start && !start.value) {
            const d = new Date();
            d.setUTCDate(d.getUTCDate() + 21);
            start.value = d.toISOString().slice(0, 10);
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } catch (e) {
        showToast('Could not load tours', 'error');
    }
}

function closeMarkGroupModal() {
    const modal = document.getElementById('markGroupModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function submitMarkGroup() {
    const package_id = document.getElementById('markGroupPackageSelect')?.value;
    if (!package_id) return showToast('Select a tour', 'error');
    const start_date = document.getElementById('markGroupStart')?.value || null;
    const end_date = document.getElementById('markGroupEnd')?.value || null;
    try {
        const res = await apiRequest('POST', '/group-departures/packages/mark', {
            package_id,
            is_group_tour: true,
            group_max_pax: parseInt(document.getElementById('markGroupMaxPax').value, 10) || 6,
            min_age: parseInt(document.getElementById('markGroupMinAge').value, 10) || 3,
            physical_rating: document.getElementById('markGroupRating').value,
            start_date: start_date || undefined,
            end_date: end_date || undefined
        });
        showToast(res.message || 'Tour marked as group safari');
        closeMarkGroupModal();
        await loadGroupSafaris();
        if (res?.data?.departure) switchGroupTab('departures');
    } catch (e) {
        console.error(e);
    }
}

function openDepartureModal(dep = null) {
    const modal = document.getElementById('departureModal');
    if (!modal) return;
    fillDeparturePackageSelect();
    document.getElementById('departureModalTitle').textContent = dep ? 'Edit departure' : 'Add departure';
    document.getElementById('departureEditId').value = dep?.departure_id || '';
    if (dep) {
        document.getElementById('departurePackageId').value = dep.package_id;
        document.getElementById('departureStart').value = toInputDate(dep.start_date);
        document.getElementById('departureEnd').value = toInputDate(dep.end_date);
        document.getElementById('departureSlug').value = dep.departure_slug || '';
        document.getElementById('departureTitle').value = dep.title_override || '';
        document.getElementById('departureCapacity').value = dep.capacity || 6;
        document.getElementById('departureSeats').value = dep.seats_booked || 0;
        document.getElementById('departureDiscount').value = dep.discount_percent || 0;
        document.getElementById('departurePrice').value = dep.price_usd != null ? dep.price_usd : '';
        document.getElementById('departureStatus').value = dep.status || 'open';
        document.getElementById('departureActive').checked = dep.is_active !== false;
        document.getElementById('departureNotes').value = dep.admin_notes || '';
    } else {
        document.getElementById('departureStart').value = '';
        document.getElementById('departureEnd').value = '';
        document.getElementById('departureSlug').value = '';
        document.getElementById('departureTitle').value = '';
        document.getElementById('departureCapacity').value = 6;
        document.getElementById('departureSeats').value = 0;
        document.getElementById('departureDiscount').value = 0;
        document.getElementById('departurePrice').value = '';
        document.getElementById('departureStatus').value = 'open';
        document.getElementById('departureActive').checked = true;
        document.getElementById('departureNotes').value = '';
        if (selectedGroupPackageId) document.getElementById('departurePackageId').value = selectedGroupPackageId;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDepartureModal() {
    const modal = document.getElementById('departureModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function editDepartureById(id) {
    const dep = groupDepartures.find(d => d.departure_id === id);
    if (dep) openDepartureModal(dep);
}

function editDeparture(dep) {
    openDepartureModal(dep);
}

async function submitDeparture() {
    const id = document.getElementById('departureEditId').value;
    const payload = {
        package_id: document.getElementById('departurePackageId').value,
        start_date: document.getElementById('departureStart').value,
        end_date: document.getElementById('departureEnd').value || null,
        departure_slug: document.getElementById('departureSlug').value || undefined,
        title_override: document.getElementById('departureTitle').value || null,
        capacity: parseInt(document.getElementById('departureCapacity').value, 10) || 6,
        seats_booked: parseInt(document.getElementById('departureSeats').value, 10) || 0,
        discount_percent: parseFloat(document.getElementById('departureDiscount').value) || 0,
        price_usd: document.getElementById('departurePrice').value
            ? parseFloat(document.getElementById('departurePrice').value)
            : null,
        status: document.getElementById('departureStatus').value,
        is_active: document.getElementById('departureActive').checked,
        admin_notes: document.getElementById('departureNotes').value || null
    };
    if (!payload.package_id || !payload.start_date) {
        return showToast('Package and start date are required', 'error');
    }
    try {
        if (id) {
            await apiRequest('PUT', `/group-departures/${id}`, payload);
            showToast('Departure updated');
        } else {
            await apiRequest('POST', '/group-departures', payload);
            showToast('Departure created — now visible on the public calendar');
        }
        closeDepartureModal();
        await loadGroupSafaris();
        switchGroupTab('departures');
    } catch (e) {
        console.error(e);
    }
}

async function bumpSeats(id, delta) {
    try {
        await apiRequest('PATCH', `/group-departures/${id}/seats`, { delta });
        await loadGroupSafaris();
    } catch (e) {
        console.error(e);
    }
}

async function deleteDeparture(id) {
    if (!confirm('Delete this departure permanently?')) return;
    try {
        await apiRequest('DELETE', `/group-departures/${id}`);
        showToast('Departure deleted');
        await loadGroupSafaris();
    } catch (e) {
        console.error(e);
    }
}

function openCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function slugifyTitle(title) {
    return String(title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
}

function linesToArr(elId) {
    return String(document.getElementById(elId)?.value || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
}

function parseItineraryText(raw) {
    return String(raw || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map((line, i) => {
            const parts = line.split('|').map(p => p.trim());
            return {
                day: i + 1,
                title: parts[0] || `Day ${i + 1}`,
                description: parts.slice(1).join(' | ') || ''
            };
        });
}

async function submitCreateGroup() {
    const title = document.getElementById('cgTitle')?.value?.trim();
    if (!title) return showToast('Title is required', 'error');
    const days = parseInt(document.getElementById('cgDays')?.value, 10) || 5;
    const included = linesToArr('cgIncluded');
    const excluded = linesToArr('cgExcluded');
    const packing = document.getElementById('cgPacking')?.value || '';
    const visa = document.getElementById('cgVisa')?.value || '';
    const payload = {
        title,
        slug: document.getElementById('cgSlug')?.value?.trim() || slugifyTitle(title),
        overview: document.getElementById('cgOverview')?.value || '',
        description: document.getElementById('cgDescription')?.value || '',
        price_usd: parseFloat(document.getElementById('cgPrice')?.value) || 0,
        duration_days: days,
        duration_nights: Math.max(0, days - 1),
        difficulty: document.getElementById('cgRating')?.value || 'Easy',
        physical_rating: document.getElementById('cgRating')?.value || 'Easy',
        group_size_min: 1,
        group_size_max: parseInt(document.getElementById('cgMaxPax')?.value, 10) || 6,
        group_max_pax: parseInt(document.getElementById('cgMaxPax')?.value, 10) || 6,
        min_age: parseInt(document.getElementById('cgMinAge')?.value, 10) || 3,
        age_minimum: parseInt(document.getElementById('cgMinAge')?.value, 10) || 3,
        featured_image_url: document.getElementById('cgImage')?.value?.trim() || '/images/optimized/serengeti-national-park.webp',
        gallery_urls: [
            document.getElementById('cgImage')?.value?.trim() || '/images/optimized/serengeti-national-park.webp'
        ].filter(Boolean),
        highlights: linesToArr('cgHighlights'),
        included,
        excluded,
        itinerary: parseItineraryText(document.getElementById('cgItinerary')?.value),
        inclusions_html: included.length ? `<ul>${included.map(i => `<li>${i}</li>`).join('')}</ul>` : '',
        exclusions_html: excluded.length ? `<ul>${excluded.map(i => `<li>${i}</li>`).join('')}</ul>` : '',
        packing_list_html: packing,
        visa_info_html: visa,
        is_group_tour: true,
        is_active: true,
        is_featured: true,
        status: 'published'
    };
    try {
        const res = await apiRequest('POST', '/tours', payload);
        showToast('Group safari created');
        closeCreateGroupModal();
        await loadGroupSafaris();
        const id = res?.data?.id || res?.data?.package_id;
        if (id && confirm('Itinerary created. Open full editor, or add a departure now?\nOK = editor, Cancel = add departure')) {
            window.currentEditTourId = id;
            navigate('edit-tour');
        } else if (id) {
            selectedGroupPackageId = id;
            switchGroupTab('departures');
            openDepartureModal();
        }
    } catch (e) {
        console.error(e);
    }
}

function fmtAdminDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toInputDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toISOString().slice(0, 10);
}

function escapeAdmin(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

window.loadGroupSafaris = loadGroupSafaris;
window.switchGroupTab = switchGroupTab;
window.filterGroupItineraries = filterGroupItineraries;
window.filterGroupDepartures = filterGroupDepartures;
window.openMarkGroupModal = openMarkGroupModal;
window.closeMarkGroupModal = closeMarkGroupModal;
window.submitMarkGroup = submitMarkGroup;
window.openDepartureModal = openDepartureModal;
window.closeDepartureModal = closeDepartureModal;
window.submitDeparture = submitDeparture;
window.editDeparture = editDeparture;
window.editDepartureById = editDepartureById;
window.deleteDeparture = deleteDeparture;
window.bumpSeats = bumpSeats;
window.openCreateGroupModal = openCreateGroupModal;
window.closeCreateGroupModal = closeCreateGroupModal;
window.submitCreateGroup = submitCreateGroup;
