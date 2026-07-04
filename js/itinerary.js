$(document).ready(function() {
    // Data state
    let wisataData = [];
    let kulinerData = [];
    let allLocations = [];
    
    // UI State: 'calendar', 'form', 'generated'
    let viewState = 'calendar';
    
    // Form state
    const today = new Date();
    let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDateStr = today.toISOString().split('T')[0];
    let selectedTime = '09:00';
    let selectedCategories = ['Kuliner', 'Wisata'];
    let routeRating = 4; // max destinations
    
    // Existing itineraries storage { '2026-06-25': [...] }
    let existingItineraries = {};
    
    // Mock initial data (2 days from now)
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() + 2);
    const mockDateStr = mockDate.toISOString().split('T')[0];

    // Map instance & markers
    let map = null;
    let markers = [];

    // Init
    function init() {
        initMap();
        loadData().then(() => {
            // Setup mock data after loading
            const shuffled = [...allLocations].sort(() => 0.5 - Math.random());
            existingItineraries[mockDateStr] = shuffled.slice(0, 3);
            
            setupFormUI();
            renderCalendar();
            switchView('calendar');
            setupListeners();
        });
    }

    // 1. Data Loading
    function loadData() {
        return $.when(
            $.getJSON('data/wisata.json?v=1'),
            $.getJSON('data/kuliner.json?v=1')
        ).done(function(wRes, kRes) {
            wisataData = wRes[0].map(item => ({ ...item, type: 'wisata' }));
            kulinerData = kRes[0].map(item => ({ ...item, type: 'kuliner' }));
            allLocations = [...wisataData, ...kulinerData];
        });
    }

    // 2. Map Init
    function initMap() {
        map = L.map('map', { zoomControl: false }).setView([-6.9175, 107.6191], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }

    // 3. UI Switching
    function switchView(view) {
        viewState = view;
        $('#view-calendar, #view-form, #view-generated').addClass('hidden');
        $(`#view-${view}`).removeClass('hidden');

        // Handle header buttons
        if (view === 'calendar') {
            $('#btn-back').addClass('hidden');
            $('#btn-explore').removeClass('hidden');
        } else {
            $('#btn-explore').addClass('hidden');
            $('#btn-back').removeClass('hidden');
        }

        updateMap();
    }

    // 4. Calendar Logic
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    function renderCalendar() {
        $('#calendar-month-year').text(`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`);
        
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

        let html = '';
        
        // Empty slots
        for (let i = 0; i < firstDayOfMonth; i++) {
            html += `<div class="h-10"></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            // JS months are 0-indexed, but ISO string needs 1-indexed and padded
            const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
            const dayStr = String(i).padStart(2, '0');
            const dStr = `${currentMonth.getFullYear()}-${monthStr}-${dayStr}`;
            
            const hasItin = !!existingItineraries[dStr];
            const isSelected = selectedDateStr === dStr;
            
            let classes = isSelected ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-50 text-gray-700';
            let dotHtml = '';
            
            if (hasItin) {
                let dotColor = isSelected ? 'bg-white' : 'bg-purple-500';
                dotHtml = `<span class="w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor}"></span>`;
            }

            html += `
                <button data-date="${dStr}" class="cal-day-btn h-10 w-full rounded-xl flex flex-col items-center justify-center relative transition-all ${classes}">
                    <span class="text-sm font-semibold">${i}</span>
                    ${dotHtml}
                </button>
            `;
        }
        $('#calendar-grid').html(html);

        // Bind Calendar Clicks
        $('.cal-day-btn').on('click', function() {
            const d = $(this).data('date');
            selectedDateStr = d;
            
            renderCalendar(); // Re-render to update selection style
            renderCalendarStatus();
            updateMap(); // Update map if itinerary exists
        });

        renderCalendarStatus();
    }

    function renderCalendarStatus() {
        const hasItin = !!existingItineraries[selectedDateStr];
        let html = '';
        
        if (hasItin) {
            html = `
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3 class="font-bold text-purple-900 mb-2">Rencana Tersedia</h3>
                <p class="text-sm text-gray-500 mb-6 px-4">Anda sudah memiliki rencana perjalanan untuk tanggal ini.</p>
                <button id="btn-lihat-detail" class="w-full btn-ripple bg-purple-600 hover:bg-purple-800 transition-colors text-white py-3 rounded-xl font-semibold shadow-md">
                    Lihat Detail
                </button>
            `;
        } else {
            html = `
                <div class="w-16 h-16 bg-white shadow-sm border border-purple-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3 class="font-bold text-purple-900 mb-2">Belum ada Rencana</h3>
                <p class="text-sm text-gray-500 mb-6 px-4">Jadwalkan destinasi dan aktivitas seru Anda di tanggal ini.</p>
                <button id="btn-buat-baru" class="w-full btn-ripple bg-purple-600 hover:bg-purple-800 transition-colors text-white py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Buat Rencana Baru
                </button>
            `;
        }
        $('#calendar-status').html(html);

        // Bind dynamic buttons
        $('#btn-lihat-detail').on('click', function() {
            renderGeneratedTimeline();
            switchView('generated');
        });

        $('#btn-buat-baru').on('click', function() {
            $('#form-date').val(selectedDateStr);
            switchView('form');
        });
    }

    // 5. Form Logic
    function setupFormUI() {
        // Init Date
        $('#form-date').val(selectedDateStr);
        
        // Render Rating Buttons
        let rbHtml = '';
        for (let i = 1; i <= 7; i++) {
            const cls = routeRating === i ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-purple-100 shadow-sm';
            rbHtml += `<button data-num="${i}" class="rating-btn w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${cls}">${i}</button>`;
        }
        $('#form-rating-btns').html(rbHtml);

        $('.rating-btn').on('click', function() {
            routeRating = parseInt($(this).data('num'));
            setupFormUI(); // Re-render to update class
        });
    }

    // 6. Generate logic
    function generateRoute() {
        const shuffled = [...allLocations].sort(() => 0.5 - Math.random());
        const count = Math.max(3, Math.min(6, routeRating));
        const items = shuffled.slice(0, count);
        
        selectedDateStr = $('#form-date').val();
        selectedTime = $('#form-time').val() || '09:00';
        
        existingItineraries[selectedDateStr] = items;
        
        renderGeneratedTimeline();
        switchView('generated');
        renderCalendar(); // To show dot on calendar
    }

    // 7. Render Generated View
    function renderGeneratedTimeline() {
        // Render Horizontal Dates Row
        const dates = Object.keys(existingItineraries).sort();
        if (!dates.includes(selectedDateStr)) dates.push(selectedDateStr);

        let datesHtml = '';
        dates.forEach(dStr => {
            const isSelected = selectedDateStr === dStr;
            const d = new Date(dStr);
            const num = d.getDate();
            const cls = isSelected ? 'bg-[#7c3aed] text-white shadow-md ring-2 ring-purple-200 ring-offset-2' : 'bg-white text-gray-600 hover:bg-purple-100 shadow-sm';
            const dot = isSelected ? 'bg-white' : 'bg-purple-500';
            
            datesHtml += `
                <button data-date="${dStr}" class="gen-date-btn w-10 h-10 shrink-0 rounded-full font-bold text-sm flex flex-col items-center justify-center relative transition-all ${cls}">
                    ${num}
                    ${existingItineraries[dStr] ? `<span class="absolute bottom-1 w-1 h-1 rounded-full ${dot}"></span>` : ''}
                </button>
            `;
        });
        $('#generated-dates-row').html(datesHtml);

        $('.gen-date-btn').on('click', function() {
            selectedDateStr = $(this).data('date');
            renderGeneratedTimeline();
            updateMap();
        });

        // Render Timeline
        const items = existingItineraries[selectedDateStr] || [];
        let tlHtml = '';

        if (items.length === 0) {
            tlHtml = `
                <div class="bg-white p-6 rounded-2xl shadow-sm text-center">
                    <p class="text-gray-500 text-sm mb-4">Belum ada aktivitas di tanggal ini.</p>
                    <button class="btn-buat-baru-timeline bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Buat Rencana</button>
                </div>
            `;
        } else {
            let startHour = parseInt(selectedTime.split(':')[0]);
            
            items.forEach((item, idx) => {
                const isKuliner = item.type === 'kuliner' || (item.kategori && item.kategori.includes('Kuliner'));
                const titlePre = isKuliner ? 'Kuliner' : 'Wisata';
                const sHour = String(startHour + idx * 2).padStart(2, '0');
                const eHour = String(startHour + idx * 2 + 1).padStart(2, '0');
                
                const cats = item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]).slice(0, 2).map(c => 
                    `<span class="bg-[#7c3aed] text-white text-[8px] px-2 py-0.5 rounded font-semibold uppercase">${c}</span>`
                ).join('') : '';

                const imgSrc = item.image || (item.gambar && item.gambar[0]) || '';
                tlHtml += `
                    <div class="relative pl-8">
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-[#7c3aed] z-10"></div>
                        ${idx > 0 ? `<div class="absolute left-[-16px] -top-[14px] text-[10px] text-[#7c3aed] font-bold bg-[#f8f5ff] px-1 py-0.5 z-10">45mnt</div>` : ''}
                        
                        <div class="bg-white p-3 rounded-2xl shadow-sm flex gap-3 h-24 hover:shadow-md transition-shadow">
                            <div class="w-20 h-full rounded-xl overflow-hidden shrink-0">
                                <img src="${imgSrc}" class="w-full h-full object-cover bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />


                            </div>
                            <div class="flex flex-col justify-center flex-1">
                                <h4 class="font-bold text-purple-900 text-sm mb-1 line-clamp-1">${titlePre} ${item.nama}</h4>
                                <p class="text-[10px] text-gray-500 line-clamp-1 mb-2">${item.alamat || 'Bandung'}</p>
                                <div class="flex gap-1">${cats}</div>
                            </div>
                            <div class="flex flex-col justify-center items-end text-right pr-1">
                                <span class="text-xs text-gray-500 font-medium">${sHour}:00</span>
                                <span class="text-xs text-gray-500 font-medium mt-1">${eHour}:00</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        $('#generated-timeline').html(tlHtml);
        
        $('.btn-buat-baru-timeline').on('click', function() {
            $('#form-date').val(selectedDateStr);
            switchView('form');
        });
    }

    // 8. Map Rendering
    function updateMap() {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        let mapLocs = [];
        if (viewState === 'calendar' && existingItineraries[selectedDateStr]) {
            mapLocs = existingItineraries[selectedDateStr];
        } else if (viewState === 'generated' && existingItineraries[selectedDateStr]) {
            mapLocs = existingItineraries[selectedDateStr];
        }

        const bounds = [];
        mapLocs.forEach(loc => {
            const lat = loc.lat || loc.latitude;
            const lng = loc.lng || loc.long || loc.longitude;
            
            if (lat && lng) {
                const locImg = loc.image || (loc.gambar && loc.gambar[0]) || '';
                const icon = L.divIcon({
                    className: 'custom-leaflet-icon',
                    html: `
                      <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                        <div style="background-color: #6B21A8; width: 50px; height: 50px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); overflow: hidden; position: absolute; z-index: 2;">
                          <img src="${locImg}" class="bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />


                        </div>
                        <div style="position: absolute; bottom: -10px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 15px solid #6B21A8; z-index: 1;"></div>
                        <div style="position: absolute; right: -25px; top: 10px; background-color: #4C1D95; color: white; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 12px; z-index: 3; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          ${loc.rating || '4.5'}
                        </div>
                      </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 60],
                    popupAnchor: [0, -60]
                });

                const marker = L.marker([lat, lng], { icon }).addTo(map);
                marker.bindPopup(`
                    <div style="width: 260px; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 8px 32px rgba(107,33,168,0.18);">
                        <div style="position: relative; width: 100%; height: 130px;">
                            <img src="${locImg}" class="bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" style="width: 100%; height: 100%; object-fit: cover;" />


                            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)"></div>
                            <div style="position: absolute; bottom: 10px; left: 12px; right: 12px">
                                <h4 style="color: #fff; font-weight: 800; font-size: 15px; margin: 0; line-height: 1.2;">${loc.nama}</h4>
                            </div>
                        </div>
                    </div>
                `, { className: 'custom-popup-premium' });
                markers.push(marker);
                bounds.push([lat, lng]);
            }
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([-6.9175, 107.6191], 13);
        }
    }

    // 9. Attach Global Listeners
    function setupListeners() {
        $('#btn-back').on('click', function() {
            switchView('calendar');
        });

        $('#btn-prev-month').on('click', function() {
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            renderCalendar();
        });

        $('#btn-next-month').on('click', function() {
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            renderCalendar();
        });

        $('.cat-btn').on('click', function() {
            const cat = $(this).data('cat');
            if (selectedCategories.includes(cat)) {
                selectedCategories = selectedCategories.filter(c => c !== cat);
                $(this).removeClass('bg-white text-gray-800 shadow-sm border-transparent').addClass('bg-[#f8f5ff] text-gray-500 border-purple-100');
            } else {
                selectedCategories.push(cat);
                $(this).addClass('bg-white text-gray-800 shadow-sm border-transparent').removeClass('bg-[#f8f5ff] text-gray-500 border-purple-100');
            }
        });

        $('#btn-generate, #btn-regenerate').on('click', function() {
            generateRoute();
        });

        $('#btn-delete-itin').on('click', function() {
            delete existingItineraries[selectedDateStr];
            renderCalendar();
            switchView('calendar');
        });
    }

    // Run
    init();
});
