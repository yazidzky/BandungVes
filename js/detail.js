$(document).ready(function() {
    // Get ID from URL - try query param first, then hash fragment
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    
    // Fallback: read from hash (e.g. view.html#kuliner-1)
    if (!id && window.location.hash) {
        id = window.location.hash.substring(1); // remove the '#'
    }

    if (!id) {
        showError();
        return;
    }

    console.log('Detail.js loaded. ID:', id);

    let kulinerData = [];
    let wisataData = [];
    let budayaData = [];
    let teknologiData = [];
    let storyData = [];
    let similarData = [];

    // Fetch all data
    console.log('Fetching all JSON data...');
    $.when(
        $.getJSON('data/kuliner.json?v=' + Date.now()),
        $.getJSON('data/wisata.json?v=' + Date.now()),
        $.getJSON('data/budaya.json?v=' + Date.now()),
        $.getJSON('data/teknologi.json?v=' + Date.now()),
        $.getJSON('data/story.json?v=' + Date.now())
    ).done(function(kRes, wRes, bRes, tRes, sRes) {
        console.log('All data fetched successfully!');
        kulinerData = kRes[0].map((item, i) => ({ ...item, id: item.id || `kuliner-${i + 1}` }));
        wisataData = wRes[0].map((item, i) => ({ ...item, id: item.id || `wisata-${i + 1}` }));
        budayaData = bRes[0].map((item, i) => ({ ...item, id: item.id || `budaya-${i + 1}` }));
        teknologiData = tRes[0].map((item, i) => ({ ...item, id: item.id || `tekno-${i + 1}` }));
        storyData = sRes[0].map((item, i) => ({ ...item, id: item.id || `story-${i + 1}` }));

        findAndRenderData();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Fetch failed!', textStatus, errorThrown);
        showError();
    });

    let displayData = null;
    let itemType = 'kuliner';
    let activeImage = null;
    let map = null;

    function findAndRenderData() {
        let item = kulinerData.find(k => k.id === id);
        let type = 'kuliner';
        
        if (!item) {
            item = wisataData.find(w => w.id === id);
            if (item) type = 'wisata';
        }
        if (!item) {
            item = budayaData.find(b => b.id === id);
            if (item) type = 'budaya';
        }
        if (!item) {
            item = teknologiData.find(t => t.id === id);
            if (item) type = 'teknologi';
        }
        if (!item) {
            item = storyData.find(s => s.id === id);
            if (item) type = 'story';
        }

        console.log('Item found:', item ? item.id : 'NO ITEM', 'Type:', type);

        if (item) {
            itemType = type;
            
            // Normalize data
            const nama = item.nama || item.nama_tempat || item.nama_budaya || item.judul_chapter || "";
            const deskripsi = item.deskripsi || item.deskripsi_singkat || item.narasi || "";
            const alamat = item.alamat || item.alamat_lengkap || item.lokasi || item.lokasi_kunjungan || "";
            const rating = item.rating ? String(item.rating) : "4.5";
            const reviews_count = item.reviews_count || item.jumlah_review || 0;
            
            let gambar = [];
            if (Array.isArray(item.gambar) && item.gambar.length > 0) gambar = item.gambar;
            else if (Array.isArray(item.images) && item.images.length > 0) gambar = item.images;
            else if (typeof item.image === 'string') gambar = [item.image];
            gambar = gambar.filter(img => img && img.trim() !== "");

            const image = item.image || (gambar.length > 0 ? gambar[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e9d5ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237c3aed' font-size='14' font-family='sans-serif'%3ETidak ada gambar%3C/text%3E%3C/svg%3E");
            const lat = item.lat || item.latitude || 0;
            const long = item.long || item.longitude || 0;
            
            let kategori = [];
            if (Array.isArray(item.kategori)) kategori = item.kategori;
            else if (typeof item.kategori === 'string') kategori = [item.kategori];
            else kategori = ["Umum"];

            displayData = {
                ...item, nama, deskripsi, alamat, rating, reviews_count, gambar, image, lat, long, kategori
            };

            activeImage = (gambar.length > 0 ? gambar[0] : null) || displayData.image;

            // Similar
            let sourceList = [];
            if (type === 'kuliner') sourceList = kulinerData;
            else if (type === 'wisata') sourceList = wisataData;
            else if (type === 'budaya') sourceList = budayaData;
            else if (type === 'teknologi') sourceList = teknologiData;
            
            similarData = sourceList.filter(x => x.id !== id).slice(0, 3);

            renderUI();
        } else {
            showError();
        }
    }

    function renderUI() {
        // Dismiss splash screen
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden-splash');
            setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 700);
        }

        const isDarkLayout = itemType === 'budaya' || itemType === 'teknologi';
        
        // Toggle body classes
        if (isDarkLayout) {
            $('#body-container').removeClass('bg-[#f8f5ff]').addClass('bg-[#1b0730]');
            $('#bg-light').hide();
            $('#bg-dark').show().removeClass('hidden');
            $('#btn-back').removeClass('bg-white text-[#7c3aed] border-gray-200 hover:bg-gray-50').addClass('bg-white text-[#7c3aed] border-transparent hover:bg-gray-100');
            // Update placeholder sesuai tipe
            const ph = itemType === 'teknologi' ? 'Cari Teknologi di Bandung' : 'Cari Budaya di Bandung';
            $('#dark-search-bar input').attr('placeholder', ph);
            $('#dark-search-bar').show().removeClass('hidden');
        } else {
            $('#body-container').removeClass('bg-[#1b0730]').addClass('bg-[#f8f5ff]');
            $('#bg-light').show();
            $('#bg-dark').hide().addClass('hidden');
            $('#btn-back').removeClass('bg-white text-[#7c3aed] border-transparent hover:bg-gray-100').addClass('bg-white border-gray-200 text-[#7c3aed] hover:bg-gray-50');
            $('#dark-search-bar').hide().addClass('hidden');
        }

        if (itemType === 'kuliner') {
            $('#content-area').html(getKulinerHtml());
            initLeaflet();
            bindThumbnailClicks();
        } else if (itemType === 'wisata') {
            $('#content-area').html(getWisataHtml());
            initLeaflet();
            bindThumbnailClicks();
        } else {
            $('#content-area').html(getBudayaHtml());
            bindThumbnailClicks();
        }
    }

    function getJadwalHtml() {
        let html = `
            <div class="border border-gray-200 rounded-2xl p-4 lg:p-6">
                <p class="text-sm text-gray-500 font-medium mb-3">Jadwal Operasional</p>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 lg:gap-x-8 lg:gap-y-3 text-xs lg:text-sm">
        `;
        ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].forEach(hari => {
            const time = displayData.jamBuka || displayData[`jam_${hari.toLowerCase()}`] || (displayData.hours && displayData.hours[hari]) || "08:00 - 17:00";
            html += `
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700">${hari}</span>
                    <span class="text-gray-400">${time}</span>
                </div>
            `;
        });
        html += `</div></div>`;
        return html;
    }

    function getSimilarHtml() {
        let html = `
            <div>
                <p class="text-sm font-bold ${itemType === 'budaya' || itemType === 'teknologi' ? 'text-gray-200' : 'text-gray-700'} mb-4">${itemType === 'kuliner' ? 'Kuliner Serupa' : 'Tempat Serupa'}</p>
                <div class="grid grid-cols-3 gap-4">
        `;
        similarData.forEach(item => {
            let img = [];
            if (Array.isArray(item.gambar) && item.gambar.length > 0) img = item.gambar;
            else if (Array.isArray(item.images) && item.images.length > 0) img = item.images;
            else if (typeof item.image === 'string') img = [item.image];
            img = img.filter(i => i && i.trim() !== "");
            
            const itemImg = item.image || (img.length > 0 ? img[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e9d5ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237c3aed' font-size='14' font-family='sans-serif'%3ETidak ada gambar%3C/text%3E%3C/svg%3E");
            const itemNama = item.nama || item.nama_tempat || item.nama_budaya || item.judul_chapter || "";
            const itemRating = item.rating || "4.5";

            html += `
                <a href="view.html?id=${item.id}">
                    <div class="relative w-full aspect-square rounded-xl overflow-hidden group">
                        <img src="${itemImg}" alt="${itemNama}" class="w-full h-full object-cover transition-transform group-hover:scale-110 bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />

                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                            <div class="flex justify-between items-end">
                                <h4 class="text-white font-bold text-xs leading-tight line-clamp-2">${itemNama}</h4>
                                <div class="flex items-center gap-1 text-[10px] text-yellow-400 font-bold bg-black/40 px-1.5 py-0.5 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    ${itemRating}
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            `;
        });
        html += `</div></div>`;
        return html;
    }

    function getKulinerHtml() {
        // Thumbnail row for mobile (horizontal scroll) and grid for desktop
        let thumbsHtml = '';
        if (displayData.gambar.length > 1) {
            thumbsHtml = `<div class="flex gap-2 overflow-x-auto hide-scrollbar px-4 lg:px-0 lg:grid lg:gap-4" style="grid-template-columns: repeat(${displayData.gambar.length}, minmax(0, 1fr))">`;
            displayData.gambar.forEach(img => {
                thumbsHtml += `
                    <div class="thumbnail-btn flex-shrink-0 w-20 h-20 lg:w-auto lg:h-auto lg:aspect-video rounded-[1rem] overflow-hidden shadow-md cursor-pointer border-2 transition-all ${img === activeImage ? 'border-[#7c3aed] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}" data-src="${img}">
                        <img src="${img}" class="w-full h-full object-cover bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.style.display='none'" />

                    </div>
                `;
            });
            thumbsHtml += `</div>`;
        }

        const tagsHtml = displayData.kategori.slice(0, 2).map(k => `<span class="bg-[#7c3aed] text-white px-4 py-1.5 rounded-full text-xs font-semibold">${k}</span>`).join('');

        return `
            <div class="max-w-6xl mx-auto w-full flex flex-col gap-0 lg:gap-12 lg:p-12 relative z-10 fade-in">

                <!-- 1. Hero image: full-width on mobile, no side padding -->
                <div class="w-full">
                    <img id="main-image" src="${activeImage}" alt="${displayData.nama}"
                        class="w-full aspect-[4/3] lg:aspect-square object-cover lg:rounded-[2.5rem] shadow-md bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />

                </div>

                <!-- 2. Thumbnail row: horizontal scroll on mobile -->
                <div class="mt-3 lg:mt-0">
                    ${thumbsHtml}
                </div>

                <!-- Mobile: single column; Desktop: two columns -->
                <div class="flex flex-col lg:flex-row gap-0 lg:gap-12 mt-4 lg:mt-0">

                    <!-- Left column: info card -->
                    <div class="w-full lg:w-1/2 flex flex-col gap-6">
                        <!-- 3. Info card -->
                        <div class="bg-white rounded-[2rem] px-4 py-6 lg:p-8 shadow-sm mx-4 lg:mx-0">
                            <h1 class="text-[22px] lg:text-[28px] font-bold text-gray-900 mb-2">${displayData.nama}</h1>
                            <div class="flex items-center gap-4 mb-4">
                                <span class="text-base lg:text-lg font-medium text-gray-700">${displayData.harga_tiket || "Rp25.000"}</span>
                                <div class="flex items-center gap-1 text-gray-600 font-medium text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    ${displayData.rating} (${displayData.reviews_count})
                                </div>
                            </div>
                            <div class="flex gap-2 flex-wrap mb-4">${tagsHtml}</div>
                            <p class="text-sm text-gray-800 leading-relaxed font-medium">${displayData.deskripsi}</p>
                        </div>

                        <!-- 4. Jadwal -->
                        <div class="mx-4 lg:mx-0">
                            ${getJadwalHtml()}
                        </div>
                    </div>

                    <!-- Right column: alamat + map + similar -->
                    <div class="w-full lg:w-1/2 flex flex-col gap-6 mt-4 lg:mt-0">
                        <!-- 5. Alamat + Map -->
                        <div class="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col mx-4 lg:mx-0">
                            <div id="map" class="h-[200px] lg:h-[280px] w-full relative z-0"></div>
                            <div class="p-4 lg:p-8 flex flex-col gap-1 relative z-10 bg-white">
                                <p class="text-xs font-bold text-gray-500">Alamat</p>
                                <div class="flex justify-between items-start gap-4 mt-1">
                                    <h3 class="text-[15px] lg:text-[17px] font-bold text-gray-900 leading-snug flex-1">${displayData.alamat}</h3>
                                    <a href="https://www.google.com/maps/dir/?api=1&destination=${displayData.lat},${displayData.long}" target="_blank"
                                        class="bg-[#7c3aed] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0">
                                        Buka di Maps
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- 6. Similar -->
                        <div class="px-4 lg:px-0 pb-4 lg:pb-0">
                            ${getSimilarHtml()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getWisataHtml() {
        // Thumbnail row: horizontal scroll on mobile, vertical list on desktop
        let thumbsHtml = '';
        if (displayData.gambar.length > 1) {
            // Desktop: vertical list on the left of hero
            const listHtml_desktop = `
                <div class="hidden lg:flex w-1/4 flex-col gap-4 overflow-y-auto pr-1">
                    ${displayData.gambar.map(img => `
                        <div class="thumbnail-btn w-full overflow-hidden rounded-3xl cursor-pointer border-2 transition-all ${img === activeImage ? 'border-[#7c3aed] scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}" style="height: ${100 / displayData.gambar.length}%; min-height: 80px;" data-src="${img}">
                            <img src="${img}" class="w-full h-full object-cover rounded-2xl bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.style.display='none'" />

                        </div>
                    `).join('')}
                </div>
            `;
            // Mobile: horizontal scroll row below hero
            thumbsHtml = listHtml_desktop + `
                <div class="flex lg:hidden gap-2 overflow-x-auto hide-scrollbar px-4 mt-3 pb-1">
                    ${displayData.gambar.map(img => `
                        <div class="thumbnail-btn flex-shrink-0 w-20 h-20 rounded-[1rem] overflow-hidden shadow-md cursor-pointer border-2 transition-all ${img === activeImage ? 'border-[#7c3aed] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}" data-src="${img}">
                            <img src="${img}" class="w-full h-full object-cover bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.style.display='none'" />

                        </div>
                    `).join('')}
                </div>
            `;
        }

        const tagsHtml = displayData.kategori.slice(0, 3).map(k => `<span class="bg-[#7c3aed] text-white px-3 py-1 rounded-lg text-xs font-semibold">${k}</span>`).join('');

        return `
            <div class="max-w-6xl mx-auto w-full flex flex-col gap-0 lg:gap-8 lg:p-12 relative z-10 fade-in">

                <!-- 1. Hero image section: full-width on mobile, side-by-side with thumbs on desktop -->
                <div class="lg:flex lg:gap-4 lg:h-[450px]">
                    ${displayData.gambar.length > 1 ? `
                        <div class="hidden lg:flex w-1/4 flex-col gap-4 overflow-y-auto pr-1">
                            ${displayData.gambar.map(img => `
                                <div class="thumbnail-btn w-full overflow-hidden rounded-3xl cursor-pointer border-2 transition-all ${img === activeImage ? 'border-[#7c3aed] scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}" style="height: ${100 / displayData.gambar.length}%; min-height: 80px;" data-src="${img}">
                                    <img src="${img}" class="w-full h-full object-cover rounded-2xl bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.style.display='none'" />

                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="${displayData.gambar.length > 1 ? 'lg:w-3/4' : 'lg:w-full'} w-full">
                        <img id="main-image" src="${activeImage}"
                            class="w-full h-[300px] lg:h-full object-cover lg:rounded-[2.5rem] bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')"
                            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />

                    </div>
                </div>

                <!-- 2. Thumbnail row: mobile only (horizontal scroll) -->
                ${displayData.gambar.length > 1 ? `
                    <div class="flex lg:hidden gap-2 overflow-x-auto hide-scrollbar px-4 mt-3 pb-1">
                        ${displayData.gambar.map(img => `
                            <div class="thumbnail-btn flex-shrink-0 w-20 h-20 rounded-[1rem] overflow-hidden shadow-md cursor-pointer border-2 transition-all ${img === activeImage ? 'border-[#7c3aed] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}" data-src="${img}">
                                <img src="${img}" class="w-full h-full object-cover bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.style.display='none'" />

                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- 3. Info + Map: single column on mobile, side-by-side on desktop -->
                <div class="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4 lg:mt-0 px-4 lg:px-0 pb-4 lg:pb-0">

                    <!-- Map + Alamat -->
                    <div class="w-full lg:w-1/2 flex flex-col gap-6">
                        <div class="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
                            <div id="map" class="h-[200px] lg:h-[380px] w-full relative z-0"></div>
                            <div class="p-4 lg:p-8 flex flex-col gap-1 relative z-10 bg-white">
                                <p class="text-xs font-bold text-gray-500">Alamat</p>
                                <div class="flex justify-between items-start gap-4 mt-1">
                                    <h3 class="text-[15px] lg:text-[17px] font-bold text-gray-900 leading-snug flex-1">${displayData.alamat}</h3>
                                    <a href="https://www.google.com/maps/dir/?api=1&destination=${displayData.lat},${displayData.long}" target="_blank"
                                        class="bg-[#7c3aed] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0">
                                        Buka di Maps
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Info card: name, rating, tags, desc, jadwal, similar -->
                    <div class="w-full lg:w-1/2 flex flex-col gap-6">
                        <div class="bg-white rounded-[2rem] p-4 lg:p-8 shadow-sm flex flex-col gap-4 lg:gap-6">
                            <div>
                                <div class="flex items-start gap-3 mb-3 flex-wrap">
                                    <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 flex-1">${displayData.nama}</h1>
                                    <div class="flex items-center gap-1 text-gray-600 font-medium text-sm flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        ${displayData.rating} (${displayData.reviews_count})
                                    </div>
                                </div>
                                <div class="flex gap-2 flex-wrap mb-3">${tagsHtml}</div>
                                <p class="text-sm text-gray-800 leading-relaxed font-medium">${displayData.deskripsi}</p>
                            </div>
                            ${getJadwalHtml()}
                            ${getSimilarHtml()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getBudayaHtml() {
        let gridHtml = '';
        if (displayData.gambar.length > 1) {
            const img0 = displayData.gambar[0] || '';
            const img1 = displayData.gambar[1] || '';
            const img2 = displayData.gambar[2] || displayData.gambar[1] || '';
            // Mobile: 1 large left (row-span-2) + 2 small right
            gridHtml = `
                <div class="grid grid-cols-2 gap-2 mt-4" style="grid-template-rows: auto auto;">
                    <!-- Big left: spans 2 rows -->
                    <div class="thumbnail-btn rounded-[1rem] overflow-hidden shadow-md cursor-pointer border-2 transition-all row-span-2 ${img0 === activeImage ? 'border-white' : 'border-transparent opacity-70'}" style="height:200px;" data-src="${img0}">
                        <img src="${img0}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
                    </div>
                    <!-- Small top right -->
                    <div class="thumbnail-btn rounded-[1rem] overflow-hidden shadow-md cursor-pointer border-2 transition-all ${img1 === activeImage ? 'border-white' : 'border-transparent opacity-70'}" style="height:96px;" data-src="${img1}">
                        <img src="${img1}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
                    </div>
                    <!-- Small bottom right -->
                    <div class="thumbnail-btn rounded-[1rem] overflow-hidden shadow-md cursor-pointer border-2 transition-all ${img2 === activeImage ? 'border-white' : 'border-transparent opacity-70'}" style="height:96px;" data-src="${img2}">
                        <img src="${img2}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
                    </div>
                </div>`;
        }

        const tagsHtml = displayData.kategori.map(k => `<span class="bg-white text-[#2a0e44] px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold">${k}</span>`).join('');
        const label = itemType === 'teknologi' ? 'Teknologi' : 'Budaya';

        let locHtml = '';
        if (displayData.alamat) {
            locHtml = `
                <div class="bg-white/10 rounded-[1.5rem] p-4 md:p-6 border border-white/10 mb-6 md:mb-8">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Lokasi / Kunjungan</h4>
                    <p class="text-sm text-gray-100 leading-relaxed font-medium">${displayData.alamat}</p>
                </div>
            `;
        }

        return `
            <div class="w-full px-4 md:px-12 lg:max-w-7xl lg:mx-auto pt-20 lg:pt-28 flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10 text-white pb-24 md:pb-8 fade-in">
                <!-- Left: image + grid -->
                <div class="w-full lg:w-[45%] flex flex-col gap-4">
                    <div class="w-full h-[280px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg">
                        <img id="main-image" src="${activeImage}" class="w-full h-full object-cover bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" onerror="this.style.display='none'" />

                    </div>
                    ${gridHtml}
                </div>
                <!-- Right: info -->
                <div class="w-full lg:w-[55%] flex flex-col justify-center">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                            <img src="assets/img/${itemType === 'teknologi' ? 'ic_teknologi' : 'ic_budaya_dan_tradisi'}.svg" alt="${label}" class="w-7 h-7" style="filter: brightness(0) saturate(100%) invert(28%) sepia(98%) saturate(4138%) hue-rotate(260deg) brightness(91%) contrast(101%)" onerror="this.style.display='none'" />
                        </div>
                        <p class="text-base md:text-xl font-semibold tracking-wide text-purple-400">${label}</p>
                    </div>
                    <h1 class="text-3xl md:text-5xl lg:text-[3.5rem] leading-tight font-bold text-white mb-4 md:mb-6">${displayData.nama}</h1>
                    <div class="flex gap-2 md:gap-3 mb-5 md:mb-8 flex-wrap">${tagsHtml}</div>
                    <p class="text-gray-200 text-sm md:text-lg leading-relaxed font-light mb-6 md:mb-8">${displayData.deskripsi}</p>
                    ${locHtml}
                    ${getSimilarHtml()}
                </div>
            </div>
        `;
    }

    function bindThumbnailClicks() {
        $('.thumbnail-btn').on('click', function() {
            const src = $(this).data('src');
            activeImage = src;
            $('#main-image').attr('src', src);
            
            // Update classes
            $('.thumbnail-btn').removeClass('scale-95 border-[#7c3aed] border-white').addClass('border-transparent opacity-60').removeClass('opacity-100');
            
            if (itemType === 'budaya' || itemType === 'teknologi') {
                $(this).addClass('border-white scale-95 opacity-100').removeClass('border-transparent opacity-60');
            } else {
                $(this).addClass('border-[#7c3aed] scale-95 opacity-100').removeClass('border-transparent opacity-60');
            }
        });
    }

    function initLeaflet() {
        if (!displayData.lat || !displayData.long) return;
        
        map = L.map('map', { 
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false
        }).setView([displayData.lat, displayData.long], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const icon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: `
              <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                <div style="background-color: #6B21A8; width: 50px; height: 50px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); overflow: hidden; position: absolute; z-index: 2;">
                  <img src="${displayData.image}" class="bg-purple-100 animate-pulse" onload="this.classList.remove('bg-purple-100', 'animate-pulse')" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />

                </div>
                <div style="position: absolute; bottom: -10px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 15px solid #6B21A8; z-index: 1;"></div>
              </div>
            `,
            iconSize: [60, 60],
            iconAnchor: [30, 60]
        });

        L.marker([displayData.lat, displayData.long], { icon }).addTo(map);
    }

    function showError() {
        const splash = document.getElementById('splash-screen');
        if (splash) { splash.classList.add('hidden-splash'); setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 700); }
        $('#content-area').html(`
            <div class="min-h-screen flex flex-col items-center justify-center pt-20 fade-in">
                <h1 class="text-3xl font-bold mb-4">Data tidak ditemukan</h1>
                <p class="text-gray-500 mb-6">Mungkin ID yang dimasukkan salah.</p>
                <a href="index.html" class="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold">Kembali ke Beranda</a>
            </div>
        `);
    }
});
