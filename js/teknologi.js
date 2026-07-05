$(document).ready(function() {
    let technologies = [];
    let filteredTechnologies = [];
    let activeId = null;
    let searchQuery = '';

    // 1. Fetch Data
    $.getJSON('data/teknologi.json?v=1')
        .done(function(data) {
            technologies = data.map((item, index) => {
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
                    id: item.id || `tekno-${index}`,
                    title: item.nama || item.nama_tempat || "Tanpa Nama",
                    tags: item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]) : ["Teknologi", "Inovasi"],
                    desc: item.deskripsi || item.deskripsi_singkat || "Tidak ada deskripsi.",
                    mainImg,
                    thumbnails
                };
            });

            filteredTechnologies = [...technologies];
            if (filteredTechnologies.length > 0) {
                activeId = filteredTechnologies[0].id;
            }
            
            render();
            setupListeners();
        })
        .fail(function() {
            console.error("Gagal memuat data teknologi.");
        });

    function render() {
        // Ensure activeId is valid
        const activeTechObj = filteredTechnologies.find(t => t.id === activeId);
        if (!activeTechObj && filteredTechnologies.length > 0) {
            activeId = filteredTechnologies[0].id;
        }
        
        const activeIndex = filteredTechnologies.findIndex(t => t.id === activeId);
        const activeTech = activeIndex >= 0 ? filteredTechnologies[activeIndex] : null;

        // Display Technologies (Active first, then others)
        let displayTechnologies = [];
        if (activeTech) {
            displayTechnologies.push(activeTech);
            if (filteredTechnologies.length > 1) {
                for (let i = 1; i < filteredTechnologies.length; i++) {
                    displayTechnologies.push(filteredTechnologies[(activeIndex + i) % filteredTechnologies.length]);
                }
            }
            
            // Set Background
            $('#bg-img').attr('src', activeTech.mainImg).show();
        } else {
            $('#bg-img').hide();
        }

        // Render Cards (desktop only)
        let cardsHtml = '';
        displayTechnologies.forEach(t => {
            const isActive = t.id === activeId;
            const cls = isActive ? 'tech-card active shadow-xl bg-black w-full overflow-hidden' : 'tech-card inactive shadow-xl bg-black w-full overflow-hidden';
            cardsHtml += `
                <div class="${cls}" data-id="${t.id}">
                    <img src="${t.mainImg}" alt="${t.title}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                </div>
            `;
        });
        $('#tech-list').html(cardsHtml);

        // Bind clicks for cards
        $('.tech-card.inactive').on('click', function() {
            const id = $(this).data('id');
            activeId = id;
            render();
        });

        // Render Detail
        if (activeTech) {
            const tagsHtml = activeTech.tags.map(tag => `<span class="bg-white text-[#1c2541] px-6 py-1.5 rounded-lg font-bold text-sm shadow-sm">${tag}</span>`).join('');
            
            let thumbsHtml = '';
            if (activeTech.thumbnails.length > 0) {
                thumbsHtml = `
                    <div class="mt-auto hidden lg:block">
                        <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
                            ${activeTech.thumbnails.map((thumb, i) => `
                                <div class="w-24 h-24 shrink-0 rounded-[1rem] overflow-hidden border border-white/30 cursor-pointer hover:border-white hover:scale-105 transition-all duration-300">
                                    <img src="${thumb}" alt="${activeTech.title} ${i+1}" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
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
                            <img src="assets/img/ic_teknologi.svg" alt="Teknologi" class="w-7 h-7" style="filter:invert(44%) sepia(80%) saturate(600%) hue-rotate(240deg) brightness(110%)" onerror="this.style.display='none'" />
                        </div>
                        <span class="text-lg font-semibold text-purple-400">Teknologi</span>
                    </div>
                    <h1 class="text-3xl lg:text-7xl font-bold mb-4 lg:mb-6 tracking-tight">${activeTech.title}</h1>
                    <div class="flex gap-2 lg:gap-3 mb-4 lg:mb-8 flex-wrap">${tagsHtml}</div>
                    <p class="text-gray-200 text-sm lg:text-lg leading-relaxed max-w-2xl mb-6 lg:mb-12">${activeTech.desc}</p>
                    ${thumbsHtml}
                </div>
            `;
            $('#tech-detail').html(detailHtml);

            // Mobile thumbnail grid + horizontal pill scroll
            const allImgs = [activeTech.mainImg, ...activeTech.thumbnails];
            const bigImg = allImgs[0] || '';
            const sm1    = allImgs[1] || allImgs[0] || '';
            const sm2    = allImgs[2] || allImgs[0] || '';

            // Horizontal pill scroll    semua item teknologi
            let pillsHtml = '';
            displayTechnologies.forEach(t => {
                const isAct = t.id === activeId;
                pillsHtml += `
                    <div data-id="${t.id}" class="tech-pill shrink-0 relative overflow-hidden cursor-pointer transition-all duration-300"
                         style="width:130px; height:80px; border-radius:16px; filter:${isAct ? 'grayscale(0)' : 'grayscale(70%)'}; opacity:${isAct ? '1' : '0.55'}; box-shadow:${isAct ? '0 0 0 2.5px white' : 'none'};">
                        <img src="${t.mainImg}" alt="${t.title}" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                            <span class="text-white text-[0.6rem] font-bold leading-tight line-clamp-2">${t.title}</span>
                        </div>
                    </div>
                `;
            });

            const mobileThumbsHtml = `
                <div class="lg:hidden mb-4">
                    <!-- Thumbnail grid 2-col -->
                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="rounded-2xl overflow-hidden" style="height:180px;">
                            <img src="${bigImg}" alt="${activeTech.title}" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="rounded-2xl overflow-hidden" style="height:86px;">
                                <img src="${sm1}" alt="${activeTech.title} 2" class="w-full h-full object-cover" />
                            </div>
                            <div class="rounded-2xl overflow-hidden" style="height:86px;">
                                <img src="${sm2}" alt="${activeTech.title} 3" class="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                    <!-- Horizontal pill scroll -->
                    <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2" style="-webkit-overflow-scrolling:touch;">
                        ${pillsHtml}
                    </div>
                </div>
            `;
            $('#tech-thumbs-mobile').html(mobileThumbsHtml);

            // Bind klik pada pill mobile
            $('#tech-thumbs-mobile .tech-pill').on('click', function() {
                activeId = $(this).data('id');
                render();
            });
            
            // Re-bind click for thumbnails (desktop + mobile)
            $('.w-24.h-24.shrink-0').on('click', function() {
                const src = $(this).find('img').attr('src');
                if (!src) return;
                // Update desktop card
                const activeCard = $('.tech-card.active img');
                const temp = activeCard.attr('src');
                activeCard.attr('src', src);
                $(this).find('img').attr('src', temp);
                // Update mobile main image
                $('#tech-thumbs-mobile .grid > div:first-child img').attr('src', src);
                // Update background
                $('#bg-img').attr('src', src);
                // Visual feedback
                $('.w-24.h-24.shrink-0').css('border-color', 'transparent').css('opacity', '0.7');
                $(this).css('border-color', 'white').css('opacity', '1');
            });

        } else {
            $('#tech-detail').html(`
                <div class="flex flex-col items-center justify-center h-full text-center opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                    <h2 class="text-2xl font-bold mb-2">Teknologi tidak ditemukan</h2>
                    <p>Coba gunakan kata kunci pencarian yang lain.</p>
                </div>
            `);
        }
    }

    function setupListeners() {
        $('#search-input').on('input', function() {
            searchQuery = $(this).val().toLowerCase();
            filteredTechnologies = technologies.filter(t => 
                t.title.toLowerCase().includes(searchQuery) || 
                t.tags.some(tag => tag.toLowerCase().includes(searchQuery))
            );
            
            if (!filteredTechnologies.find(t => t.id === activeId) && filteredTechnologies.length > 0) {
                activeId = filteredTechnologies[0].id;
            }
            render();
        });
    }
});
