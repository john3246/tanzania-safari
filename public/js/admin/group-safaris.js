// ── Group Safaris CMS ─────────────────────────────────────────
let groupPackages = [];
let groupDepartures = [];
let selectedGroupPackageId = null;
let allToursForMark = [];

async function loadGroupSafaris() {
    try {
        const [pkgRes, depRes] = await Promise.all([
            apiRequest('GET', '/group-departures/packages'),
            apiRequest('GET', '/group-departures' + (selectedGroupPackageId ? `?package_id=${selectedGroupPackageId}` : ''))
        ]);
        groupPackages = pkgRes.data || [];
        groupDepartures = depRes.data || [];
        renderGroupPackages();
        renderGroupDepartures();
        fillDeparturePackageSelect();
    } catch (e) {
        console.error(e);
        showToast('Failed to load group safaris', 'error');
    }
}

function renderGroupPackages() {
    const el = document.getElementById('groupPackageList');
    if (!el) return;
    if (!groupPackages.length) {
        el.innerHTML = '<div class="p-6 text-center text-gray-500 text-sm">No group itineraries yet. Mark an existing tour or create one under Tours with the group flag.</div>';
        return;
    }
    el.innerHTML = groupPackages.map(p => {
        const active = selectedGroupPackageId === p.package_id;
        return `
        <button type="button" onclick="filterDeparturesByPackage('${p.package_id}')"
            class="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${active ? 'bg-emerald-50 border-l-4 border-emerald-600' : 'border-l-4 border-transparent'}">
            <div class="flex items-start justify-between gap-2">
              <div class="font-semibold text-gray-900 text-sm">${escapeAdmin(p.package_name)}</div>
              <a href="#edit-tour" onclick="event.stopPropagation(); window.currentEditTourId='${p.package_id}'; navigate('edit-tour');" class="text-xs text-safari-600 hover:underline whitespace-nowrap" title="Edit full details">Edit</a>
            </div>
            <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                <span>${p.duration_days || '?'} days</span>
                <span>·</span>
                <span>${p.upcoming_departures || 0} upcoming</span>
                <span>·</span>
                <span class="${p.is_active ? 'text-emerald-600' : 'text-amber-600'}">${p.is_active ? 'Live' : 'Draft'}</span>
            </div>
        </button>`;
    }).join('');
}

function renderGroupDepartures() {
    const body = document.getElementById('groupDepartureBody');
    const label = document.getElementById('groupDepartureFilterLabel');
    if (!body) return;
    if (label) {
        if (selectedGroupPackageId) {
            const pkg = groupPackages.find(p => p.package_id === selectedGroupPackageId);
            label.textContent = pkg ? `Departures for ${pkg.package_name}` : 'Filtered departures';
        } else {
            label.textContent = 'All group departures';
        }
    }
    if (!groupDepartures.length) {
        body.innerHTML = '<tr><td colspan="6" class="px-4 py-10 text-center text-gray-500">No departures yet. Add a fixed date to appear on the public calendar.</td></tr>';
        return;
    }
    body.innerHTML = groupDepartures.map(d => {
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
            <td class="px-4 py-3 whitespace-nowrap">
                <div class="font-medium text-gray-900">${fmtAdminDate(d.start_date)}</div>
                <div class="text-xs text-gray-400">→ ${fmtAdminDate(d.end_date)}</div>
            </td>
            <td class="px-4 py-3">
                <div class="font-medium text-gray-800">${escapeAdmin(d.title)}</div>
                <div class="text-xs text-gray-400 truncate max-w-[12rem]">${escapeAdmin(d.departure_slug)}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">${d.seats_left} / ${d.capacity}</td>
            <td class="px-4 py-3 whitespace-nowrap">${price}</td>
            <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}">${d.status}</span>
                ${!d.is_active ? '<div class="text-[10px] text-amber-600 mt-1">Hidden</div>' : ''}
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
                <button type="button" class="p-2 text-gray-400 hover:text-emerald-600" title="Edit" onclick="editDepartureById('${d.departure_id}')"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="p-2 text-gray-400 hover:text-sky-600" title="+1 seat booked" onclick="bumpSeats('${d.departure_id}', 1)"><i class="fa-solid fa-user-plus"></i></button>
                <button type="button" class="p-2 text-gray-400 hover:text-amber-600" title="-1 seat booked" onclick="bumpSeats('${d.departure_id}', -1)"><i class="fa-solid fa-user-minus"></i></button>
                <a class="p-2 text-gray-400 hover:text-forest-700 inline-block" title="View public" href="/group-safaris/${encodeURIComponent(d.departure_slug)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                <button type="button" class="p-2 text-gray-400 hover:text-red-600" title="Delete" onclick="deleteDeparture('${d.departure_id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function filterDeparturesByPackage(id) {
    selectedGroupPackageId = id;
    loadGroupSafaris();
}

function clearGroupPackageFilter() {
    selectedGroupPackageId = null;
    loadGroupSafaris();
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
    try {
        await apiRequest('POST', '/group-departures/packages/mark', {
            package_id,
            is_group_tour: true,
            group_max_pax: parseInt(document.getElementById('markGroupMaxPax').value, 10) || 6,
            min_age: parseInt(document.getElementById('markGroupMinAge').value, 10) || 3,
            physical_rating: document.getElementById('markGroupRating').value
        });
        showToast('Tour marked as group safari');
        closeMarkGroupModal();
        await loadGroupSafaris();
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
        document.getElementById('departurePrice').value = dep.price_usd || '';
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
            showToast('Departure created');
        }
        closeDepartureModal();
        await loadGroupSafaris();
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
        if (id && typeof navigate === 'function') {
            if (confirm('Itinerary created. Open full editor for more details?')) {
                window.currentEditTourId = id;
                navigate('edit-tour');
            }
        }
    } catch (e) {
        console.error(e);
    }
}

window.loadGroupSafaris = loadGroupSafaris;
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
window.filterDeparturesByPackage = filterDeparturesByPackage;
window.clearGroupPackageFilter = clearGroupPackageFilter;
window.openCreateGroupModal = openCreateGroupModal;
window.closeCreateGroupModal = closeCreateGroupModal;
window.submitCreateGroup = submitCreateGroup;
