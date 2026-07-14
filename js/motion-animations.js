/**
 * motion-animations.js
 * Centralized Motion animation helpers for BandungVerse.
 * Uses the global Motion object from CDN: { animate, inView, stagger, spring }
 */

(function() {
    'use strict';

    const M = window.Motion;
    if (!M) {
        console.warn('Motion library not loaded. Animations will fallback to CSS.');
        return;
    }

    const { animate, inView } = M;

    // ─── Skeleton Loading ───
    window.BVMotion = window.BVMotion || {};

    /**
     * Show a centered skeleton loader overlay
     */
    window.BVMotion.showSkeleton = function() {
        if (document.getElementById('bv-skeleton-loader')) return;
        const overlay = document.createElement('div');
        overlay.id = 'bv-skeleton-loader';
        overlay.innerHTML = `
            <div style="
                position: fixed; inset: 0; z-index: 9999;
                background: white;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                gap: 20px;
            ">
                <img src="assets/img/logo_bandung_verse.svg" alt="Loading" style="height:40px; opacity:0.7;" onerror="this.style.display='none'" />
                <div style="display:flex; gap:8px; align-items:center;">
                    <div class="bv-dot" style="width:10px;height:10px;border-radius:50%;background:#7c3aed;"></div>
                    <div class="bv-dot" style="width:10px;height:10px;border-radius:50%;background:#a855f7;"></div>
                    <div class="bv-dot" style="width:10px;height:10px;border-radius:50%;background:#c084fc;"></div>
                </div>
                <p style="font-size:13px; color:#9ca3af; font-weight:500; letter-spacing:0.05em;">Memuat konten...</p>
            </div>
        `;
        document.body.prepend(overlay);

        // Animate dots
        const dots = overlay.querySelectorAll('.bv-dot');
        dots.forEach((dot, i) => {
            animate(dot,
                { scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] },
                { duration: 1.2, delay: i * 0.15, repeat: Infinity, easing: 'ease-in-out' }
            );
        });
    };

    /**
     * Dismiss skeleton loader with smooth fade out
     */
    window.BVMotion.dismissSkeleton = function() {
        const overlay = document.getElementById('bv-skeleton-loader');
        if (!overlay) return;
        animate(overlay,
            { opacity: [1, 0] },
            { duration: 0.5, easing: 'ease-out' }
        ).then(() => {
            overlay.remove();
        });
    };

    // ─── Scroll Reveal (InView) ───

    /**
     * Setup scroll reveal for .fade-in-up elements
     * Replaces IntersectionObserver approach with Motion inView
     */
    window.BVMotion.setupScrollReveal = function() {
        // Observer wrapper compatible with existing code
        window.observer = {
            observe: function(el) {
                if (!el) return;
                // Parse delay from class name
                let delay = 0;
                el.classList.forEach(cls => {
                    if (cls.startsWith('delay-')) {
                        delay = parseInt(cls.split('-')[1]) / 1000;
                    }
                });

                inView(el, (info) => {
                    animate(info.target,
                        { opacity: [0, 1], y: [30, 0] },
                        { duration: 0.7, delay: delay, easing: [0.25, 0.1, 0.25, 1] }
                    );
                }, { margin: '0px 0px -60px 0px' });
            }
        };
    };

    // ─── Card Transition Animations ───

    /**
     * Animate wisata card page transition.
     * Call this AFTER updating card HTML in the container.
     * @param {string} containerId - The id of the cards container (e.g., 'wisata-cards-desktop')
     * @param {string} direction - 'next' or 'prev'
     */
    window.BVMotion.animateCardTransition = function(containerId, direction) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cards = container.children;
        if (!cards || cards.length === 0) return;

        const xStart = direction === 'next' ? 60 : -60;

        Array.from(cards).forEach((card, i) => {
            animate(card,
                { opacity: [0, 1], x: [xStart, 0], scale: [0.92, 1] },
                { duration: 0.5, delay: i * 0.08, easing: [0.25, 0.1, 0.25, 1] }
            );
        });
    };

    /**
     * Animate kuliner grid items on initial load
     * @param {string} containerId - selector for the grid container
     */
    window.BVMotion.animateGridIn = function(containerId) {
        const container = document.querySelector(containerId);
        if (!container) return;
        const items = container.querySelectorAll('.fade-in-up, a.group, a.block');
        if (!items.length) return;

        Array.from(items).forEach((item, i) => {
            animate(item,
                { opacity: [0, 1], y: [25, 0], scale: [0.95, 1] },
                { duration: 0.6, delay: i * 0.06, easing: [0.25, 0.1, 0.25, 1] }
            );
        });
    };

    // ─── Budaya Card Transition ───

    /**
     * Animate budaya content switch (title, desc, images)
     * @param {string} direction - 'up' or 'down'
     * @param {Function} updateFn - function that updates the DOM content
     */
    window.BVMotion.animateBudayaSwitch = function(direction, updateFn) {
        const yOut = direction === 'down' ? -30 : 30;
        const yIn = direction === 'down' ? 30 : -30;

        // Elements to animate
        const titleEls = document.querySelectorAll('#budaya-title, #budaya-title-desktop');
        const descEls = document.querySelectorAll('#budaya-desc, #budaya-desc-desktop');
        const mainImgs = document.querySelectorAll('.budaya-main-img');
        const prevImgs = document.querySelectorAll('.budaya-prev-img');
        const nextImgs = document.querySelectorAll('.budaya-next-img');

        // Phase 1: Animate out
        const outPromises = [];

        titleEls.forEach(el => {
            outPromises.push(
                animate(el, { opacity: [1, 0], y: [0, yOut] }, { duration: 0.25, easing: 'ease-in' })
            );
        });
        descEls.forEach(el => {
            outPromises.push(
                animate(el, { opacity: [1, 0], y: [0, yOut] }, { duration: 0.25, easing: 'ease-in' })
            );
        });
        mainImgs.forEach(el => {
            outPromises.push(
                animate(el, { opacity: [1, 0], scale: [1, 0.95] }, { duration: 0.25, easing: 'ease-in' })
            );
        });
        prevImgs.forEach(el => {
            outPromises.push(
                animate(el, { opacity: [el.style.opacity || 0.65, 0] }, { duration: 0.2, easing: 'ease-in' })
            );
        });
        nextImgs.forEach(el => {
            outPromises.push(
                animate(el, { opacity: [el.style.opacity || 0.45, 0] }, { duration: 0.2, easing: 'ease-in' })
            );
        });

        // Phase 2: After out, update content, then animate in
        Promise.all(outPromises.map(p => p.finished || p)).then(() => {
            // Update DOM
            if (typeof updateFn === 'function') updateFn();

            // Animate in
            titleEls.forEach(el => {
                animate(el, { opacity: [0, 1], y: [yIn, 0] }, { duration: 0.4, easing: [0.25, 0.1, 0.25, 1] });
            });
            descEls.forEach(el => {
                animate(el, { opacity: [0, 1], y: [yIn, 0] }, { duration: 0.4, delay: 0.05, easing: [0.25, 0.1, 0.25, 1] });
            });
            mainImgs.forEach(el => {
                animate(el, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.45, easing: [0.25, 0.1, 0.25, 1] });
            });
            prevImgs.forEach(el => {
                animate(el, { opacity: [0, 0.65] }, { duration: 0.35, easing: 'ease-out' });
            });
            nextImgs.forEach(el => {
                animate(el, { opacity: [0, 0.45] }, { duration: 0.35, easing: 'ease-out' });
            });
        });
    };

    // ─── Hero Entry Animation ───

    /**
     * Animate hero section elements on page load
     */
    window.BVMotion.animateHeroEntry = function() {
        // Mobile hero
        const mobileHero = document.getElementById('beranda');
        if (mobileHero && window.innerWidth < 768) {
            const tagline = mobileHero.querySelector('h1');
            const imgGrid = mobileHero.querySelector('#hero-img-grid');
            const buttons = mobileHero.querySelectorAll('button');

            if (tagline) {
                animate(tagline, { opacity: [0, 1], y: [20, 0] }, { duration: 0.8, delay: 0.2, easing: [0.25, 0.1, 0.25, 1] });
            }
            if (imgGrid) {
                const imgs = imgGrid.querySelectorAll('[id^="hero-img-"][id$="-wrap"]');
                imgs.forEach((img, i) => {
                    animate(img, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.6, delay: 0.1 + i * 0.1, easing: [0.25, 0.1, 0.25, 1] });
                });
            }
            buttons.forEach((btn, i) => {
                animate(btn, { opacity: [0, 1], x: [i % 2 === 0 ? 30 : -30, 0] }, { duration: 0.5, delay: 0.5 + i * 0.1, easing: [0.25, 0.1, 0.25, 1] });
            });
        }

        // Desktop hero
        const desktopHero = document.getElementById('beranda-desktop');
        if (desktopHero && window.innerWidth >= 768) {
            const content = desktopHero.querySelector('.z-20');
            if (content) {
                animate(content, { opacity: [0, 1], x: [-30, 0] }, { duration: 0.8, delay: 0.2, easing: [0.25, 0.1, 0.25, 1] });
            }
            const imgWrappers = desktopHero.querySelectorAll('[id^="desk-img-"][id$="-wrap"]');
            imgWrappers.forEach((img, i) => {
                animate(img, { opacity: [0, 1], y: [40, 0] }, { duration: 0.7, delay: 0.3 + i * 0.12, easing: [0.25, 0.1, 0.25, 1] });
            });
        }
    };

})();
