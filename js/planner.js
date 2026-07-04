$(document).ready(function() {
    let map = null;
    let markers = [];
    let allData = [];
    let selectedCats = ['Wisata', 'Kuliner'];

    // Initialize Map
    function initMap() {
        map = L.map('map', { zoomControl: false }).setView([-6.9175, 107.6191], 13);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    // Load Data
    $.when(
        $.getJSON('data/kuliner.json?v=1'),
        $.getJSON('data/wisata.json?v=1')
    ).done(function(kRes, wRes) {
        allData = [...wRes[0], ...kRes[0]];
        initMap();
        
        // Show random initial pins
        showOnMap(allData.slice(0, 4));
    });

    // Form Interactions
    $('#input-date').val(new Date().toISOString().split('T')[0]);

    $('.cat-btn').on('click', function() {
        const cat = $(this).data('cat');
        if (selectedCats.includes(cat)) {
            selectedCats = selectedCats.filter(c => c !== cat);
            $(this).removeClass('active bg-purple-100 text-primary border-primary').addClass('bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100');
        } else {
            selectedCats.push(cat);
            $(this).addClass('active bg-purple-100 text-primary border-primary').removeClass('bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100');
        }
    });

    $('#btn-generate').on('click', function() {
        const date = $('#input-date').val();
        const time = $('#input-time').val();
        const count = parseInt($('#input-count').val()) || 4;

        if (selectedCats.length === 0) {
            alert('Pilih minimal satu kategori!');
            return;
        }

        // Generate mock data
        const filtered = allData.filter(d => {
            const dcats = Array.isArray(d.kategori) ? d.kategori : (d.kategori ? [d.kategori] : ['Wisata']);
            return selectedCats.some(c => dcats.includes(c));
        });

        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const itineraryItems = shuffled.slice(0, count);

        showTimeline(itineraryItems, date, time);
    });

    $('#btn-back-timeline').on('click', function() {
        $('#timeline-view').addClass('hidden');
        $('#planner-form').removeClass('hidden');
    });

    function showTimeline(items, dateStr, startTime) {
        // Switch view
        $('#planner-form').addClass('hidden');
        $('#timeline-view').removeClass('hidden');

        // Format Date
        const d = new Date(dateStr);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        $('#disp-date').text(d.toLocaleDateString('id-ID', options));
        $('#disp-count').text(`${items.length} Tempat`);

        // Render Items
        let html = '';
        let currentHour = parseInt(startTime.split(':')[0]);
        let currentMin = parseInt(startTime.split(':')[1]);

        items.forEach((item, idx) => {
            const timeStr = `${('0' + currentHour).slice(-2)}:${('0' + currentMin).slice(-2)}`;
            const img = item.image || (item.gambar && item.gambar[0]) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e9d5ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237c3aed' font-size='14' font-family='sans-serif'%3ETidak ada gambar%3C/text%3E%3C/svg%3E";
            
            html += `
                <div class="relative flex items-start gap-4">
                    <div class="w-14 shrink-0 text-right pt-2">
                        <span class="text-sm font-bold text-gray-700">${timeStr}</span>
                    </div>
                    <div class="w-4 h-4 rounded-full bg-white border-4 border-primary relative z-10 mt-3 shrink-0 shadow-sm"></div>
                    <div class="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onclick="window.location.href='view.html#${item.id}'">
                        <h4 class="font-bold text-gray-900 mb-1">${item.nama || item.nama_tempat}</h4>
                        <div class="flex gap-3 mb-3">
                            <span class="text-xs font-semibold text-primary bg-purple-100 px-2 py-1 rounded-full">⭐ ${item.rating || '4.5'}</span>
                        </div>
                        <img src="${img}" class="w-full h-32 object-cover rounded-xl bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />

                    </div>
                </div>
            `;
            
            // Increment time by approx 2 hours
            currentHour += 2;
        });

        $('#timeline-items').html(html);

        // Show on Map
        showOnMap(items);
    }

    function showOnMap(items) {
        if (!map) return;
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        if (items.length === 0) return;

        const bounds = L.latLngBounds();

        items.forEach((item, i) => {
            const lat = item.lat || item.latitude;
            const lng = item.lng || item.longitude || item.long;
            if (!lat || !lng) return;

            const iconHtml = `
                <div class="relative w-8 h-8 flex items-center justify-center">
                    <div class="absolute inset-0 bg-primary rounded-full opacity-50 animate-ping"></div>
                    <div class="bg-primary text-white w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-sm relative z-10">
                        ${i + 1}
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'bg-transparent',
                html: iconHtml,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const marker = L.marker([lat, lng], { icon }).addTo(map);
            markers.push(marker);
            bounds.extend([lat, lng]);
        });

        if (markers.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
});
