$(document).ready(function() {
    let storyData = [];

    // 1. Fetch Data
    $.getJSON('data/story.json?v=1')
        .done(function(data) {
            storyData = data;
            
            // Set Hero Image
            const heroImg = data[0]?.gambar?.[0];
            if (heroImg) {
                $('#hero-bg-img').attr('src', heroImg);
            }

            renderTimeline();
            
            $('#loading').hide();
            $('#timeline-container').removeClass('hidden');
            $('#footer-section').removeClass('hidden');

            setupScrollObserver();
            setupInteractions();
        })
        .fail(function() {
            // Fallback mock data or error
            console.error("Gagal memuat data story.");
            $('#loading').hide();
        });

    // 2. Render Timeline
    function renderTimeline() {
        let html = '';
        
        storyData.forEach((story, index) => {
            const isEven = index % 2 === 0;
            const mainImg = story.gambar?.[0] ?? '';
            const thumbs = story.gambar ?? [];
            const flexDirection = isEven ? 'md:flex-row' : 'md:flex-row-reverse';

            let thumbsHtml = '';
            if (thumbs.length > 0) {
                thumbsHtml = `
                    <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2" style="scroll-snap-type:x mandatory;">
                        ${thumbs.map((img, i) => `
                            <div class="story-thumb w-24 h-24 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-purple-500 opacity-100' : 'border-neutral-800 opacity-70'} hover:border-purple-500 transition-all cursor-pointer shrink-0" data-src="${img}" data-index="${index}" style="scroll-snap-align:start;">
                                <img src="${img}" alt="${story.judul_chapter} ${i+1}" class="w-full h-full object-cover pointer-events-none" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />
                            </div>
                        `).join('')}
                    </div>`;
            }

            let mainImgHtml = '';
            if (mainImg) {
                mainImgHtml = `<img src="${mainImg}" alt="${story.judul_chapter}" class="main-story-img w-full h-full object-cover transition-all duration-500" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e9d5ff%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%237c3aed%27 font-size=%2714%27 font-family=%27sans-serif%27%3ETidak ada gambar%3C/text%3E%3C/svg%3E'" />`;
            } else {
                mainImgHtml = `<div class="w-full h-full bg-neutral-900 flex items-center justify-center"><span class="text-neutral-600 text-sm">Tidak ada gambar</span></div>`;
            }

            const isLast = index === storyData.length - 1;
            const marginClass = isLast ? 'mb-0' : 'mb-32 md:mb-48';

            html += `
                <section class="fade-up-item relative ${marginClass} flex flex-col ${flexDirection} gap-8 md:gap-24 items-center">
                    <!-- Timeline Dot -->
                    <div class="absolute left-0 md:left-1/2 -translate-x-[5px] w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] z-10 hidden md:block"></div>

                    <!-- Mobile: gambar di atas (order-first), desktop: ikut flexDirection -->
                    <!-- Main Image Box -->
                    <div class="w-full md:w-1/2 pl-8 md:pl-0 order-first md:order-none">
                        <div class="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/50">
                            <div class="absolute inset-0 bg-purple-900/20 mix-blend-overlay z-10 pointer-events-none"></div>
                            ${mainImgHtml}
                        </div>
                    </div>

                    <!-- Content Box -->
                    <div class="w-full md:w-1/2 flex flex-col pl-8 md:pl-0">
                        <div class="text-purple-400 font-bold tracking-widest mb-2 uppercase text-sm">
                            Chapter ${index + 1} • ${story.periode}
                        </div>
                        <h2 class="text-4xl md:text-5xl font-bold mb-6">${story.judul_chapter}</h2>
                        <div class="mb-8">
                            <p class="story-narasi text-neutral-400 text-lg leading-relaxed transition-all duration-500 line-clamp-6" data-index="${index}">
                                ${story.narasi}
                            </p>
                            <button class="btn-toggle-narasi text-purple-400 hover:text-purple-300 font-semibold text-sm mt-2 flex items-center gap-1 transition-colors" data-index="${index}">
                                <span>Baca selengkapnya</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                        </div>
                        ${thumbsHtml}
                    </div>
                </section>
            `;
        });

        $('#story-list').html(html);
    }

    // 3. Interactions
    function setupInteractions() {
        // Toggle baca selengkapnya
        $('.btn-toggle-narasi').on('click', function() {
            const idx = $(this).data('index');
            const pElem = $(`.story-narasi[data-index="${idx}"]`);
            const spanElem = $(this).find('span');
            const svgElem = $(this).find('.svg-icon');

            if (pElem.hasClass('line-clamp-6')) {
                pElem.removeClass('line-clamp-6');
                spanElem.text('Tutup selengkapnya');
                svgElem.addClass('rotate-180');
            } else {
                pElem.addClass('line-clamp-6');
                spanElem.text('Baca selengkapnya');
                svgElem.removeClass('rotate-180');
            }
        });

        // Klik thumbnail → ganti gambar utama di section yang sama
        $(document).on('click', '.story-thumb', function() {
            const src = $(this).find('img').attr('src');
            if (!src) return;
            const section = $(this).closest('section');
            // Main image ada di div pertama (order-first) dalam section
            const mainImg = section.find('.main-story-img');
            if (mainImg.length) {
                mainImg.attr('src', src);
                // Update hero bg juga
                $('#hero-bg-img').attr('src', src);
            }
            // Highlight thumbnail yang dipilih
            section.find('.story-thumb')
                .css('border-color', 'rgba(64,64,64,1)')
                .css('opacity', '0.7');
            $(this)
                .css('border-color', 'rgba(168,85,247,1)')
                .css('opacity', '1');
        });
    }

    // 4. Scroll Animations
    function setupScrollObserver() {
        // Hero Parallax
        $(window).on('scroll', function() {
            const scrollY = window.scrollY;
            const heroHeight = window.innerHeight;
            
            if (scrollY <= heroHeight) {
                const translateY = scrollY * 0.5;
                const opacity = 1 - (scrollY / (heroHeight * 0.2));
                
                $('#hero-bg-img').css('transform', `translateY(${translateY}px)`);
                if (opacity >= 0) {
                    $('#hero-bg-container').css('opacity', opacity);
                }
            }
            
            // Redirect to index when reached bottom
            if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 5) {
                window.location.href = 'index.html';
            }
        });

        // Intersection Observer for fade-up items
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    $(entry.target).addClass('visible');
                    // observer.unobserve(entry.target); // Optional: if you only want it to animate once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -100px 0px"
        });

        $('.fade-up-item').each(function() {
            observer.observe(this);
        });
    }
});
