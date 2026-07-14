$(document).ready(function() {
    // State
    let allLocations = [];
    let filteredLocations = [];
    let activeFilters = [];
    let searchQuery = '';
    let userCoords = null;
    let userLocationStr = '';
    
    // Map Instance and Markers Array
    let map = null;
    let markers = [];

    // Filter Config    disesuaikan dengan isi data JSON
    const availableFilters = [
        { id: 'wisata',          label: 'Wisata',        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>', type: 'type' },
        { id: 'kuliner',         label: 'Kuliner',       icon: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>', type: 'type' },
        { id: 'Cafe',            label: 'Cafe',          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>', type: 'category' },
        { id: 'Historical Landmark', label: 'Bersejarah',icon: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12v6"/><path d="M14 12v6"/></svg>', type: 'category' },
        { id: 'City Park',       label: 'Taman',         icon: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-8"/><path d="M12 8l-4 6h8l-4-6z"/><path d="M12 2l-6 8h12l-6-8z"/></svg>', type: 'category' },
        { id: 'Family Friendly', label: 'Keluarga',      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', type: 'category' }
    ];

    // Initialize
    function init() {
        initMap();
        renderFilters();
        loadData();
        setupEventListeners();
    }

    // 1. Load Data
    function loadData() {
        $.when(
            $.getJSON('data/wisata.json?v=1'),
            $.getJSON('data/kuliner.json?v=1')
        ).done(function(wisataRes, kulinerRes) {
            const wisata = wisataRes[0].map(item => ({ ...item, type: 'wisata' }));
            const kuliner = kulinerRes[0].map(item => ({ ...item, type: 'kuliner' }));
            allLocations = [...wisata, ...kuliner];
            applyFilters();
        });
    }

    // 2. Init Map
    function initMap() {
        // Center Bandung
        map = L.map('map', { zoomControl: false, minZoom: 11 }).setView([-6.9175, 107.6191], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }

    // 3. Render Quick Filters
    function renderFilters() {
        let html = '';
        availableFilters.forEach(filter => {
            const isActive = activeFilters.includes(filter.id);
            const classes = isActive 
                ? 'bg-[#6b21a8] text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-purple-50 shadow-sm';
            
            html += `
                <button data-id="${filter.id}" class="filter-btn px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${classes}">
                    <span class="shrink-0">${filter.icon}</span>
                    ${filter.label}
                </button>
            `;
        });
        $('#quick-filters').html(html);
        
        // Re-bind click events
        $('.filter-btn').off('click').on('click', function() {
            const id = $(this).data('id');
            if (activeFilters.includes(id)) {
                activeFilters = activeFilters.filter(f => f !== id);
            } else {
                activeFilters.push(id);
            }
            renderFilters();
            applyFilters();
        });
    }

    // 4. Apply Filters
    function applyFilters() {
        // Jika belum ada pencarian atau filter yang aktif, jangan tampilkan apa-apa di awal
        if (!searchQuery && activeFilters.length === 0 && !userCoords) {
            filteredLocations = [];
            updateUI();
            return;
        }

        let result = allLocations;

        // By Type
        const activeTypes = activeFilters.filter(f => availableFilters.find(af => af.id === f)?.type === 'type');
        if (activeTypes.length > 0) {
            result = result.filter(loc => activeTypes.includes(loc.type));
        }

        // By Category (AND logic: item must match ALL selected categories)
        const activeCats = activeFilters.filter(f => availableFilters.find(af => af.id === f)?.type === 'category');
        if (activeCats.length > 0) {
            result = result.filter(loc => loc.kategori && activeCats.every(cat => loc.kategori.includes(cat)));
        }

        // By Search
        if (searchQuery) {
            result = result.filter(loc => loc.nama.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // By Distance
        if (userCoords) {
            result = result.map(loc => {
                const lat = loc.lat || loc.latitude;
                const lng = loc.lng || loc.long || loc.longitude;
                const distance = (lat && lng) ? getDistance(userCoords.lat, userCoords.lng, lat, lng) : Infinity;
                return { ...loc, distance };
            }).sort((a, b) => a.distance - b.distance).slice(0, 5);
        }

        filteredLocations = result;
        updateUI();
    }

    // 5. Update UI (Map & Sidebar)
    function updateUI() {
        // Update Sidebar List
        $('#result-count').text(filteredLocations.length);
        
        let listHtml = '';
        if (!searchQuery && activeFilters.length === 0 && !userCoords) {
            listHtml = '<div class="text-center text-gray-500 mt-10">Mulai cari atau pilih filter untuk melihat tempat.</div>';
        } else if (filteredLocations.length === 0) {
            listHtml = '<div class="text-center text-gray-500 mt-10">Tidak ada hasil yang cocok dengan filter.</div>';
        } else {
            filteredLocations.forEach((loc, i) => {
                let distHtml = '';
                if (loc.distance !== undefined) {
                    const dTxt = loc.distance < 1 ? `${Math.round(loc.distance * 1000)} m` : `${loc.distance.toFixed(1)} km`;
                    distHtml = `<p class="text-[10px] text-[#7c3aed] font-bold mb-1">${dTxt} dari lokasi</p>`;
                }

                const locImg = loc.image || (loc.gambar && loc.gambar[0]) || '';
                
                listHtml += `
                    <a href="view.html?v=4&id=${loc.id}" class="block group">
                        <div class="bg-white p-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex gap-3 cursor-pointer" style="animation: fadeUp ${0.3 + (i*0.05)}s ease forwards; opacity: 0; transform: translateY(10px);">
                            <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shrink-0 relative">
                                <img src="${locImg}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />


                            </div>
                            <div class="flex flex-col justify-center flex-1 py-1 pr-2 overflow-hidden">
                                <h4 class="font-bold text-gray-900 text-sm leading-tight mb-1 truncate group-hover:text-[#7c3aed] transition-colors">${loc.nama}</h4>
                                ${distHtml}
                                <p class="text-[10px] text-gray-500 flex items-start gap-1 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-[1px]"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span class="truncate">${loc.alamat || 'Bandung'}</span>
                                </p>
                                <div class="flex items-center gap-2 mt-auto">
                                    <div class="inline-flex items-center gap-1 bg-[#fbbf24] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        ${loc.rating || '4.5'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            });
        }
        $('#sidebar-list').html(listHtml);

        // Update Map Markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        const mapLocs = filteredLocations.slice(0, 55); // Prevent browser crash
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

                const catsHtml = loc.kategori 
                    ? (Array.isArray(loc.kategori) ? loc.kategori : [loc.kategori]).slice(0,3).map(c => 
                        `<span style="background: #f3e8ff; color: #7c3aed; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">${c}</span>`
                      ).join('')
                    : '';

                const popupHtml = `
                    <div style="width: 260px; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 8px 32px rgba(107,33,168,0.18); border: 1px solid #ede9fe">
                        <div style="position: relative; width: 100%; height: 130px; overflow: hidden">
                            <img src="${locImg}" class="bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />


                            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)"></div>
                            <div style="position: absolute; top: 8px; right: 8px; background: rgba(124,58,237,0.9); backdrop-filter: blur(8px); color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                ${loc.rating || '4.5'}
                            </div>
                            <div style="position: absolute; bottom: 10px; left: 12px; right: 12px">
                                <h4 style="color: #fff; font-weight: 800; font-size: 15px; margin: 0; line-height: 1.2; text-shadow: 0 1px 4px rgba(0,0,0,0.4)">${loc.nama}</h4>
                            </div>
                        </div>
                        <div style="padding: 12px 14px 14px">
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px">${catsHtml}</div>
                            <a href="view.html?v=4&id=${loc.id}" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 8px 0; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-size: 13px; font-weight: 700; text-decoration: none;">
                                Lihat Detail
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </a>
                        </div>
                    </div>
                `;

                const marker = L.marker([lat, lng], { icon }).addTo(map);
                marker.bindPopup(popupHtml, { className: 'custom-popup-premium' });
                markers.push(marker);
                bounds.push([lat, lng]);
            }
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    // 6. Setup Listeners
    function setupEventListeners() {
        // Place Search
        $('#place-search-input').on('input', function() {
            searchQuery = $(this).val();
            applyFilters();
        });

        // Location Search (Nominatim)
        let locTimeout;
        $('#loc-search-input').on('input', function() {
            const val = $(this).val();
            userLocationStr = val;
            
            clearTimeout(locTimeout);
            
            if (val.length < 3 || val.includes("Lokasi Anda") || val.includes("Pusat Kota")) {
                $('#loc-suggestions').addClass('hidden');
                if (val === '') {
                    userCoords = null;
                    applyFilters();
                }
                return;
            }

            locTimeout = setTimeout(function() {
                $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=id`)
                    .done(function(data) {
                        if (data.length > 0) {
                            let html = '';
                            data.forEach((s, i) => {
                                const title = s.name || s.display_name.split(',')[0];
                                html += `
                                    <button data-lat="${s.lat}" data-lng="${s.lon}" data-title="${title}" class="loc-suggestion-item w-full text-left px-4 py-3 hover:bg-purple-50 flex items-start gap-3 border-b border-gray-50 last:border-0 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                        <div class="flex flex-col overflow-hidden">
                                            <span class="text-sm font-semibold text-gray-800 truncate">${title}</span>
                                            <span class="text-[10px] text-gray-500 truncate">${s.display_name}</span>
                                        </div>
                                    </button>
                                `;
                            });
                            $('#loc-suggestions').html(html).removeClass('hidden');
                            
                            $('.loc-suggestion-item').on('click', function() {
                                const lat = parseFloat($(this).data('lat'));
                                const lng = parseFloat($(this).data('lng'));
                                const title = $(this).data('title');
                                
                                $('#loc-search-input').val(title);
                                $('#loc-suggestions').addClass('hidden');
                                userCoords = { lat, lng };
                                applyFilters();
                            });
                        } else {
                            $('#loc-suggestions').addClass('hidden');
                        }
                    });
            }, 500);
        });

        // Hide suggestions when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#loc-search-input, #loc-suggestions').length) {
                $('#loc-suggestions').addClass('hidden');
            }
        });

        // Get Current Location (desktop + mobile buttons)
        function handleGetLocation(inputSelector) {
            if (navigator.geolocation) {
                $(inputSelector).val('Mendeteksi lokasi...');
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        userCoords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        $('#loc-search-input, #loc-search-input-mobile').val('Lokasi Anda Saat Ini');
                        applyFilters();
                    },
                    function() {
                        userCoords = { lat: -6.9175, lng: 107.6191 };
                        $('#loc-search-input, #loc-search-input-mobile').val('Pusat Kota Bandung (Fallback)');
                        applyFilters();
                    }
                );
            }
        }

        $('#btn-get-location').on('click', function() {
            handleGetLocation('#loc-search-input');
        });

        $('#btn-get-location-mobile').on('click', function() {
            handleGetLocation('#loc-search-input-mobile');
        });

        // Mobile location search input mirrors desktop logic
        let locTimeoutMobile;
        $('#loc-search-input-mobile').on('input', function() {
            const val = $(this).val();
            userLocationStr = val;
            clearTimeout(locTimeoutMobile);
            if (val.length < 3 || val.includes("Lokasi Anda") || val.includes("Pusat Kota")) {
                $('#loc-suggestions').addClass('hidden');
                if (val === '') { userCoords = null; applyFilters(); }
                return;
            }
            locTimeoutMobile = setTimeout(function() {
                $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=id`)
                    .done(function(data) {
                        if (data.length > 0) {
                            let html = '';
                            data.forEach((s) => {
                                const title = s.name || s.display_name.split(',')[0];
                                html += `
                                    <button data-lat="${s.lat}" data-lng="${s.lon}" data-title="${title}" class="loc-suggestion-item w-full text-left px-4 py-3 hover:bg-purple-50 flex items-start gap-3 border-b border-gray-50 last:border-0 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                        <div class="flex flex-col overflow-hidden">
                                            <span class="text-sm font-semibold text-gray-800 truncate">${title}</span>
                                            <span class="text-[10px] text-gray-500 truncate">${s.display_name}</span>
                                        </div>
                                    </button>
                                `;
                            });
                            $('#loc-suggestions').html(html).removeClass('hidden');
                            $('.loc-suggestion-item').on('click', function() {
                                const lat = parseFloat($(this).data('lat'));
                                const lng = parseFloat($(this).data('lng'));
                                const title = $(this).data('title');
                                $('#loc-search-input, #loc-search-input-mobile').val(title);
                                $('#loc-suggestions').addClass('hidden');
                                userCoords = { lat, lng };
                                applyFilters();
                            });
                        } else {
                            $('#loc-suggestions').addClass('hidden');
                        }
                    });
            }, 500);
        });
    }

    // Helper Math Distance
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Add Keyframe animation to doc
    $('<style>@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }</style>').appendTo('head');

    // Run
    init();
});
