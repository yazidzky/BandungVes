$(document).ready(function() {
    let allPlaces = [];
    let filteredPlaces = [];
    let currentFilter = 'all';
    let map = null;
    let markers = [];

    const filters = [
        { id: "all", label: "Semua" },
        { id: "food", label: "Kuliner" },
        { id: "tourism", label: "Wisata" },
        { id: "hidden", label: "Hidden Gems" },
        { id: "family", label: "Keluarga" },
        { id: "trending", label: "Trending" },
    ];

    // Fetch data
    $.when(
        $.getJSON('data/kuliner.json?v=1'),
        $.getJSON('data/wisata.json?v=1')
    ).done(function(kRes, wRes) {
        const kulinerData = kRes[0];
        const wisataData = wRes[0];

        const mappedKuliner = kulinerData.map(item => {
            const imagesList = item.gambar || item.images || [];
            return {
                id: item.id,
                name: item.nama || item.nama_tempat || "",
                lat: item.lat || item.latitude || 0,
                lng: item.long || item.longitude || 0,
                image: item.image || (imagesList.length > 0 ? imagesList[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e9d5ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237c3aed' font-size='14' font-family='sans-serif'%3ETidak ada gambar%3C/text%3E%3C/svg%3E"),
                rating: item.rating || "4.5",
                duration: item.durasi || "30",
                tags: Array.isArray(item.kategori) ? item.kategori : (item.kategori ? [item.kategori] : ["Kuliner"]),
                type: "food",
                address: item.alamat || item.alamat_lengkap || ""
            };
        });

        const mappedWisata = wisataData.map(item => {
            const imagesList = item.gambar || item.images || [];
            return {
                id: item.id,
                name: item.nama || item.nama_tempat || "",
                lat: item.lat || item.latitude || 0,
                lng: item.long || item.longitude || 0,
                image: item.image || (imagesList.length > 0 ? imagesList[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e9d5ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237c3aed' font-size='14' font-family='sans-serif'%3ETidak ada gambar%3C/text%3E%3C/svg%3E"),
                rating: item.rating || "4.5",
                duration: item.durasi || "45",
                tags: Array.isArray(item.kategori) ? item.kategori : (item.kategori ? [item.kategori] : ["Wisata"]),
                type: "tourism",
                address: item.alamat || item.alamat_lengkap || ""
            };
        });

        allPlaces = [...mappedKuliner, ...mappedWisata];
        applyFilter();
        initMap();
        renderFilters();
    });

    function applyFilter() {
        if (currentFilter === 'all') {
            filteredPlaces = allPlaces;
        } else if (currentFilter === 'food' || currentFilter === 'tourism') {
            filteredPlaces = allPlaces.filter(p => p.type === currentFilter);
        } else {
            // Dummy logic for other filters just to mimic UI
            filteredPlaces = allPlaces.slice(0, 10);
        }
        
        renderList();
        updateMarkers();
    }

    function renderFilters() {
        let html = '';
        filters.forEach(f => {
            const activeClass = currentFilter === f.id ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            html += `<button data-id="${f.id}" class="filter-btn px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeClass}">${f.label}</button>`;
        });
        $('#filter-buttons').html(html);

        $('.filter-btn').on('click', function() {
            currentFilter = $(this).data('id');
            renderFilters(); // Re-render to update classes
            applyFilter();
        });
    }

    function renderList() {
        $('#result-count').text(`${filteredPlaces.length} Tempat Ditemukan`);
        
        let html = '';
        filteredPlaces.forEach((place, index) => {
            const tagsHtml = place.tags.slice(0, 2).map(tag => `<span class="text-xs font-semibold text-primary bg-purple-100 px-3 py-1 rounded-full">${tag}</span>`).join('');
            
            // Simple animation delay via css logic if needed, but we'll use inline style for delay
            html += `
                <a href="view.html#${place.id}" class="block">
                    <div class="flex gap-4 p-5 rounded-3xl bg-gray-50 cursor-pointer hover:bg-purple-50 transition transform hover:translate-x-1" style="animation: fadeIn 0.5s ease forwards; animation-delay: ${index * 0.02}s; opacity: 0;">
                        <div class="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                            <img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-900 mb-1">${place.name}</h4>
                            <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span>⭐ ${place.rating}</span>
                                <span>•</span>
                                <span>${place.duration} menit</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${tagsHtml}
                            </div>
                        </div>
                    </div>
                </a>
            `;
        });
        $('#places-list').html(html);
    }

    function initMap() {
        map = L.map('map', { zoomControl: false }).setView([-6.9175, 107.6191], 13);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        updateMarkers();
    }

    function updateMarkers() {
        if (!map) return;
        
        // Remove old markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        filteredPlaces.forEach(place => {
            if (!place.lat || !place.lng) return;

            const iconHtml = `
                <div class="relative w-12 h-12 flex items-center justify-center transition-transform hover:scale-110 hover:z-50">
                    <div class="bg-[#7c3aed] w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden absolute z-10">
                        <img src="${place.image}" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
                    </div>
                    <div class="absolute bottom-[-4px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#7c3aed] z-0"></div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'bg-transparent',
                html: iconHtml,
                iconSize: [48, 48],
                iconAnchor: [24, 48],
                popupAnchor: [0, -48]
            });

            const popupContent = `
                <div class="p-4 w-full cursor-pointer hover:bg-gray-50 transition-colors" onclick="window.location.href='view.html#${place.id}'">
                    <img src="${place.image}" class="w-full h-32 object-cover rounded-xl mb-3" />
                    <h3 class="font-bold text-gray-900 text-lg mb-1">${place.name}</h3>
                    <p class="text-sm text-gray-500 mb-2 line-clamp-1">${place.address}</p>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-1 text-sm font-bold text-yellow-500">
                            ⭐ ${place.rating}
                        </div>
                        <span class="text-xs font-semibold text-primary bg-purple-100 px-2 py-1 rounded-full">${place.type === 'food' ? 'Kuliner' : 'Wisata'}</span>
                    </div>
                </div>
            `;

            const marker = L.marker([place.lat, place.lng], { icon })
                .bindPopup(popupContent, { className: 'custom-popup' })
                .addTo(map);

            markers.push(marker);
        });
    }

    // Add keyframes for fadeIn dynamically
    $('<style>@keyframes fadeIn { to { opacity: 1; } }</style>').appendTo('head');
});
