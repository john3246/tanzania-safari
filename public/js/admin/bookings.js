let allBookings = [];
let currentView = 'list';

async function loadBookings() {
    try {
        const res = await apiRequest('GET', '/bookings');
        if (res.success) {
            allBookings = res.data;
            renderBookings();
            renderPipeline();
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        showToast('Failed to load bookings', 'error');
    }
}

function renderBookings(bookingsToRender = allBookings) {
    const tbody = document.getElementById('bookBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    document.getElementById('bookingCountDisplay').innerText = `Showing ${bookingsToRender.length} bookings`;

    if (bookingsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <div class="flex flex-col items-center justify-center">
                        <i class="fa-solid fa-folder-open text-4xl text-gray-300 mb-3"></i>
                        <p class="text-sm">No bookings found</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    bookingsToRender.forEach(b => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50/50 transition-colors group';
        
        let statusClass = 'bg-gray-100 text-gray-800';
        let statusIcon = 'fa-circle-dot';
        
        if(b.status_name === 'Pending') {
            statusClass = 'bg-amber-100 text-amber-800';
            statusIcon = 'fa-clock';
        }
        else if(b.status_name === 'Confirmed') {
            statusClass = 'bg-emerald-100 text-emerald-800';
            statusIcon = 'fa-check';
        }
        else if(b.status_name === 'Cancelled' || b.status_name === 'Rejected') {
            statusClass = 'bg-red-100 text-red-800';
            statusIcon = 'fa-xmark';
        }



        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                #${(b.booking_id || '').substring(0,8).toUpperCase()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        ${b.full_name ? b.full_name.charAt(0) : 'U'}
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">${b.full_name}</p>
                        <p class="text-xs text-gray-500">${b.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-sm text-gray-900 font-medium truncate max-w-[200px]" title="${b.package_name}">${b.package_name}</p>
                <p class="text-xs text-gray-500">${b.adults} Adults, ${b.children} Children</p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${new Date(b.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                -
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    <i class="fa-solid ${statusIcon} text-[10px]"></i>
                    ${b.status_name || 'Pending'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="viewBookingDetails('${b.booking_id}')" class="text-gray-400 hover:text-primary-600 bg-white border border-gray-200 hover:border-primary-200 shadow-sm w-8 h-8 rounded flex items-center justify-center transition-colors tooltip-trigger" title="View Workspace">
                    <i class="fa-solid fa-folder-open"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPipeline() {
    const pipelineContainer = document.getElementById('bookingPipelineView');
    if (!pipelineContainer) return;
    
    const stages = [
        { id: 'Pending', name: 'New / Pending', color: 'border-t-amber-500' },
        { id: 'Confirmed', name: 'Confirmed', color: 'border-t-emerald-500' },
        { id: 'Cancelled', name: 'Cancelled', color: 'border-t-red-500' },
        { id: 'Rejected', name: 'Rejected', color: 'border-t-gray-500' }
    ];

    pipelineContainer.innerHTML = '';

    stages.forEach(stage => {
        const stageBookings = allBookings.filter(b => (b.status_name || 'Pending') === stage.id);
        const column = document.createElement('div');
        column.className = `flex-1 min-w-[300px] bg-gray-100/50 rounded-xl p-4 flex flex-col border-t-4 ${stage.color} shadow-sm`;
        
        column.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-800">${stage.name}</h3>
                <span class="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">${stageBookings.length}</span>
            </div>
            <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                ${stageBookings.map(b => `
                    <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group" onclick="viewBookingDetails('${b.booking_id}')">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">#${(b.booking_id || '').substring(0,8).toUpperCase()}</span>
                            <span class="text-xs text-gray-400">${new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                        <p class="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">${b.full_name}</p>
                        <p class="text-xs text-gray-500 line-clamp-1 mb-3" title="${b.package_name}">${b.package_name}</p>
                        
                        <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                            <div class="flex -space-x-2">
                                <div class="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-600 font-bold" title="${b.adults} Adults">
                                    <i class="fa-solid fa-user"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${stageBookings.length === 0 ? `
                    <div class="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Empty
                    </div>
                ` : ''}
            </div>
        `;
        pipelineContainer.appendChild(column);
    });
}

function filterBookings() {
    const term = document.getElementById('bookingSearch').value.toLowerCase();
    if (!term) {
        renderBookings();
        return;
    }
    
    const filtered = allBookings.filter(b => 
        (b.booking_id && b.booking_id.toLowerCase().includes(term)) ||
        (b.full_name && b.full_name.toLowerCase().includes(term)) ||
        (b.email && b.email.toLowerCase().includes(term)) ||
        (b.package_name && b.package_name.toLowerCase().includes(term))
    );
    renderBookings(filtered);
}

// Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
    // Only attach once by utilizing event delegation on the document body or main container
    document.body.addEventListener('click', (e) => {
        if(e.target.closest('.tab-btn')) {
            const btn = e.target.closest('.tab-btn');
            // Check if we are inside the bookings page
            if(!btn.closest('#page-bookings')) return;

            const view = btn.dataset.view;
            currentView = view;

            // Update buttons
            document.querySelectorAll('#page-bookings .tab-btn').forEach(b => {
                b.className = 'tab-btn px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50';
            });
            btn.className = 'tab-btn active px-4 py-1.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm ring-1 ring-gray-200';

            // Toggle views
            const listView = document.getElementById('bookingListView');
            const pipelineView = document.getElementById('bookingPipelineView');
            
            if(view === 'list') {
                listView.classList.remove('hidden');
                listView.classList.add('flex');
                pipelineView.classList.add('hidden');
                pipelineView.classList.remove('flex');
            } else {
                pipelineView.classList.remove('hidden');
                pipelineView.classList.add('flex');
                listView.classList.add('hidden');
                listView.classList.remove('flex');
            }
        }
    });
});

window.viewBookingDetails = async function(id) {
    window.currentBookingId = id;
    await navigate('booking-details', true);
}
