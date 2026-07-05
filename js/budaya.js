$(document).ready(function() {
    let cultures = [];
    let filteredCultures = [];
    let activeId = null;
    let searchQuery = '';

    // 1. Fetch Data
    $.getJSON('data/budaya.json?v=1')
        .done(function(data) {
            cultures = data.map((item, index) => {
                let images = [];
                if (Array.isArray(item.gambar) && item.gambar.length > 0) {
                    images = item.gambar;
                } else if (Array.isArray(item.images) && item.images.length > 0) {
                    images = item.images;
                } else if (typeof item.image === 'string') {
                    images = [item.image];
                }
                images = images.filter(img => img && img.trim() !== "");

                const mainImg = images.length > 0 ? images[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e9d5ff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237c3aed' font-size='14' font-family='sans-serif'%3ETidak ada gambar%3C/text%3E%3C/svg%3E";
                const thumbnails = images.length > 1 ? images.slice(1) : [];

                return {
                    id: item.id || `budaya-${index}`,
                    title: item.nama || item.nama_budaya || "Tanpa Nama",
                    tags: item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]) : ["Budaya", "Tradisi"],
                    desc: item.deskripsi || item.deskripsi_singkat || "Tidak ada deskripsi.",
                    mainImg,
                    thumbnails
                };
            });

            filteredCultures = [...cultures];
            if (filteredCultures.length > 0) {
                activeId = filteredCultures[0].id;
            }
            
            render();
            setupListeners();
        })
        .fail(function() {
            console.error("Gagal memuat data budaya.");
        });

    function render() {
        // Ensure activeId is valid
        const activeCultureObj = filteredCultures.find(c => c.id === activeId);
        if (!activeCultureObj && filteredCultures.length > 0) {
            activeId = filteredCultures[0].id;
        }
        
        const activeIndex = filteredCultures.findIndex(c => c.id === activeId);
        const activeCulture = activeIndex >= 0 ? filteredCultures[activeIndex] : null;

        // Display Cultures (Active first, then others)
        let displayCultures = [];
        if (activeCulture) {
            displayCultures.push(activeCulture);
            if (filteredCultures.length > 1) {
                for (let i = 1; i < filteredCultures.length; i++) {
                    displayCultures.push(filteredCultures[(activeIndex + i) % filteredCultures.length]);
                }
            }
            
            // Set Background
            $('#bg-img').attr('src', activeCulture.mainImg).show();
        } else {
            $('#bg-img').hide();
        }

        // Render Cards (desktop pill stack)
        let cardsHtml = '';
        displayCultures.forEach(c => {
            const isActive = c.id === activeId;
            const cls = isActive
                ? 'culture-card active shadow-xl bg-black w-full overflow-hidden'
                : 'culture-card inactive shadow-xl bg-black w-full overflow-hidden';
            cardsHtml += `
                <div class="${cls}" data-id="${c.id}">
                    <img src="${c.mainImg}" alt="${c.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                </div>
            `;
        });
        $('#culture-list').html(cardsHtml);

        // Bind clicks for cards
        $('.culture-card.inactive').on('click', function() {
            const id = $(this).data('id');
            activeId = id;
            render(); // Re-render everything with new activeId
        });

        // Render Detail
        if (activeCulture) {
            const tagsHtml = activeCulture.tags.map(tag => `<span class="bg-white text-[#2d0a4e] px-6 py-1.5 rounded-lg font-bold text-sm shadow-sm">${tag}</span>`).join('');
            
            let thumbsHtml = '';
            if (activeCulture.thumbnails.length > 0) {
                thumbsHtml = `
                    <div class="mt-auto hidden md:block">
                        <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
                            ${activeCulture.thumbnails.map((t, i) => `
                                <div class="w-24 h-24 shrink-0 rounded-[1rem] overflow-hidden border border-white/30 cursor-pointer hover:border-white hover:scale-105 transition-all duration-300">
                                    <img src="${t}" alt="${activeCulture.title} ${i+1}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'"/>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            const detailHtml = `
                <div class="flex flex-col h-full fade-enter fade-enter-active">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 border border-purple-400/50 rounded-xl flex items-center justify-center bg-purple-500/15">
                            <img src="assets/img/ic_budaya_dan_tradisi.svg" alt="Budaya" class="w-7 h-7" style="filter:invert(44%) sepia(80%) saturate(600%) hue-rotate(240deg) brightness(110%)" onerror="this.style.display='none'" />
                        </div>
                        <span class="text-lg font-semibold text-purple-400">Budaya</span>
                    </div>
                    <h1 class="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight">${activeCulture.title}</h1>
                    <div class="flex gap-2 md:gap-3 mb-4 md:mb-8 flex-wrap">${tagsHtml}</div>
                    <p class="text-gray-200 text-sm md:text-lg leading-relaxed max-w-2xl mb-6 md:mb-12">${activeCulture.desc}</p>
                    ${thumbsHtml}
                </div>
            `;
            $('#culture-detail').html(detailHtml);

            // Mobile thumbnail grid: 1 big left + 2 small right
            const allImgs = [activeCulture.mainImg, ...activeCulture.thumbnails];
            const bigImg   = allImgs[0] || '';
            const sm1      = allImgs[1] || allImgs[0] || '';
            const sm2      = allImgs[2] || allImgs[0] || '';

            // Horizontal pill scroll    semua item, active highlighted, bisa diklik
            let pillsHtml = '';
            displayCultures.forEach(c => {
                const isAct = c.id === activeId;
                pillsHtml += `
                    <div data-id="${c.id}" class="culture-pill shrink-0 relative overflow-hidden cursor-pointer transition-all duration-300"
                         style="width:130px; height:80px; border-radius:16px; filter:${isAct ? 'grayscale(0)' : 'grayscale(70%)'}; opacity:${isAct ? '1' : '0.55'}; border:${isAct ? '2.5px solid white' : '2.5px solid transparent'}; transform: translateZ(0);">
                        <img src="${c.mainImg}" alt="${c.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                            <span class="text-white text-[0.6rem] font-bold leading-tight line-clamp-2">${c.title}</span>
                        </div>
                    </div>
                `;
            });

            const mobileThumbsHtml = `
                <div class="md:hidden mb-4">
                    <!-- Thumbnail grid 2-col -->
                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="rounded-2xl overflow-hidden" style="height:180px;">
                            <img src="${bigImg}" alt="${activeCulture.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="rounded-2xl overflow-hidden" style="height:86px;">
                                <img src="${sm1}" alt="${activeCulture.title} 2" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                            </div>
                            <div class="rounded-2xl overflow-hidden" style="height:86px;">
                                <img src="${sm2}" alt="${activeCulture.title} 3" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                            </div>
                        </div>
                    </div>
                    <!-- Horizontal pill scroll -->
                    <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2" style="-webkit-overflow-scrolling:touch;">
                        ${pillsHtml}
                    </div>
                </div>
            `;
            $('#culture-thumbs-mobile').html(mobileThumbsHtml);

            // Bind klik pada pill mobile
            $('#culture-thumbs-mobile .culture-pill').on('click', function() {
                activeId = $(this).data('id');
                render();
            });
            
            // Re-bind click for thumbnails (desktop + mobile)
            $('.w-24.h-24.shrink-0').on('click', function() {
                const src = $(this).find('img').attr('src');
                if (!src) return;
                // Update desktop card
                const activeCard = $('.culture-card.active img');
                const temp = activeCard.attr('src');
                activeCard.attr('src', src);
                $(this).find('img').attr('src', temp);
                // Update mobile main image (bigImg in grid)
                $('#culture-thumbs-mobile .grid > div:first-child img').attr('src', src);
                // Update background
                $('#bg-img').attr('src', src);
                // Visual feedback
                $('.w-24.h-24.shrink-0').css('border-color', 'transparent').css('opacity', '0.7');
                $(this).css('border-color', 'white').css('opacity', '1');
            });

        } else {
            $('#culture-detail').html(`
                <div class="flex flex-col items-center justify-center h-full text-center opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                    <h2 class="text-2xl font-bold mb-2">Budaya tidak ditemukan</h2>
                    <p>Coba gunakan kata kunci pencarian yang lain.</p>
                </div>
            `);
        }
    }

    function setupListeners() {
        $('#search-input').on('input', function() {
            searchQuery = $(this).val().toLowerCase();
            filteredCultures = cultures.filter(c => 
                c.title.toLowerCase().includes(searchQuery) || 
                c.tags.some(tag => tag.toLowerCase().includes(searchQuery))
            );
            
            // Reset active ID if current is not in filtered list
            if (!filteredCultures.find(c => c.id === activeId) && filteredCultures.length > 0) {
                activeId = filteredCultures[0].id;
            }
            render();
        });
    }
});
