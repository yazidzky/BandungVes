/**
 * BandungVerse Utilities — bv-utils.js
 * Smooth animations, skeleton loading, scroll effects, toasts
 */

(function(window) {
    'use strict';

    var BV = {};
    var _prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ═══════════════════════════════════════════
       1. IMAGE SPINNER — auto-wraps all <img>
    ═══════════════════════════════════════════ */
    BV.initImages = function(root) {
        var scope = root || document;
        scope.querySelectorAll('img[src]:not([data-bv])').forEach(function(img) {
            img.setAttribute('data-bv', '1');
            if (img.classList.contains('no-spinner')) return;
            if (img.getAttribute('width') && parseInt(img.getAttribute('width')) < 32) return;

            var wrap = img.parentElement;
            if (!wrap.classList.contains('img-wrap')) {
                var dark = wrap.closest('[class*="bg-\\[#1"]') ||
                           wrap.closest('[style*="background:#7c"]') ||
                           wrap.closest('[style*="background:#9"]') ||
                           wrap.closest('[style*="background:#6"]') ||
                           wrap.closest('[style*="background:#1a"]');
                wrap.classList.add('img-wrap');
                if (dark) wrap.classList.add('dark');
            }

            function done() { img.parentElement && img.parentElement.classList.add('loaded'); }
            if (img.complete && img.naturalWidth > 0) { done(); }
            else {
                img.addEventListener('load',  done, { once: true });
                img.addEventListener('error', done, { once: true });
            }
        });
    };

    /* ═══════════════════════════════════════════
       2. SCROLL REVEAL — .reveal / .reveal-scale
    ═══════════════════════════════════════════ */
    BV.initReveal = function() {
        if (_prefersReduced) {
            document.querySelectorAll('.reveal,.reveal-scale').forEach(function(el) {
                el.classList.add('revealed');
            });
            return;
        }

        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal,.reveal-scale').forEach(function(el) {
                el.classList.add('revealed');
            });
            return;
        }

        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    /* slight delay stagger per item index */
                    var delay = (parseInt(e.target.dataset.revealDelay) || 0);
                    setTimeout(function() { e.target.classList.add('revealed'); }, delay);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

        document.querySelectorAll('.reveal,.reveal-scale').forEach(function(el, i) {
            if (!el.dataset.revealDelay) el.dataset.revealDelay = Math.min(i * 40, 300);
            obs.observe(el);
        });
    };

    /* ═══════════════════════════════════════════
       3. SCROLL PROGRESS BAR
    ═══════════════════════════════════════════ */
    BV.initScrollProgress = function() {
        var bar = document.getElementById('scroll-progress');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'scroll-progress';
            document.body.appendChild(bar);
        }

        var ticking = false;
        function update() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    var st = window.scrollY;
                    var dh = document.documentElement.scrollHeight - window.innerHeight;
                    bar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    };

    /* ═══════════════════════════════════════════
       4. PAGE TRANSITIONS
    ═══════════════════════════════════════════ */
    BV.initPageTransitions = function() {
        if (_prefersReduced) return;

        /* Fade in on page load */
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                document.body.style.opacity = '1';
            });
        });

        /* Smooth exit on internal links */
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href]');
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href || href.charAt(0) === '#' || href.indexOf('http') === 0 ||
                href.indexOf('mailto') === 0 || link.target === '_blank') return;

            e.preventDefault();
            if (navigator.vibrate) navigator.vibrate(8);

            document.body.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            document.body.style.opacity    = '0';
            document.body.style.transform  = 'translateY(6px)';

            setTimeout(function() { window.location.href = href; }, 210);
        });
    };

    /* ═══════════════════════════════════════════
       5. TOAST  BV.toast('msg', 'success|error|info', ms)
    ═══════════════════════════════════════════ */
    BV.toast = function(msg, type, dur) {
        type = type || 'info';
        dur  = dur  || 3000;

        var box = document.getElementById('bv-toast-container');
        if (!box) {
            box = document.createElement('div');
            box.id = 'bv-toast-container';
            document.body.appendChild(box);
        }

        var t = document.createElement('div');
        t.className  = 'bv-toast ' + type;
        t.textContent = msg;
        box.appendChild(t);

        setTimeout(function() {
            t.classList.add('hiding');
            setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
        }, dur);
    };

    /* ═══════════════════════════════════════════
       6. HAPTIC  BV.haptic('light|medium|heavy')
    ═══════════════════════════════════════════ */
    BV.haptic = function(type) {
        if (!navigator.vibrate) return;
        ({ light:[8], medium:[16], heavy:[25,8,16] })[type]
            && navigator.vibrate(({ light:[8], medium:[16], heavy:[25,8,16] })[type]);
    };

    /* ═══════════════════════════════════════════
       7. CARD LIFT — add .card-lift to cards
    ═══════════════════════════════════════════ */
    BV.initCardLift = function(root) {
        if (_prefersReduced) return;
        var scope = root || document;
        scope.querySelectorAll(
            '.wisata-card-item, .culture-pill, .tech-pill'
        ).forEach(function(el) {
            if (!el.classList.contains('card-lift')) el.classList.add('card-lift');
        });
    };

    /* ═══════════════════════════════════════════
       8. COUNTER ANIMATION  BV.countUp(el, end, dur)
    ═══════════════════════════════════════════ */
    BV.countUp = function(el, end, dur) {
        if (_prefersReduced) { el.textContent = end; return; }
        dur = dur || 800;
        var start = 0, step = end / (dur / 16);
        var frame = function() {
            start += step;
            if (start >= end) { el.textContent = end; return; }
            el.textContent = Math.floor(start);
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    };

    /* ═══════════════════════════════════════════
       9. SMOOTH SCROLL for anchor links
    ═══════════════════════════════════════════ */
    BV.scrollTo = function(targetOrId, offset) {
        offset = offset || 80;
        var el = typeof targetOrId === 'string'
            ? document.getElementById(targetOrId)
            : targetOrId;
        if (!el) return;
        var top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: _prefersReduced ? 'auto' : 'smooth' });
    };

    /* ═══════════════════════════════════════════
       AUTO-INIT
    ═══════════════════════════════════════════ */
    function init() {
        BV.initScrollProgress();
        BV.initReveal();
        BV.initPageTransitions();
        BV.initImages();
        BV.initCardLift();

        /* Re-run on dynamic content */
        if ('MutationObserver' in window) {
            var mo = new MutationObserver(function(muts) {
                var hasNew = muts.some(function(m) { return m.addedNodes.length > 0; });
                if (hasNew) {
                    BV.initImages();
                    BV.initReveal();
                    BV.initCardLift();
                }
            });
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.BV = BV;

})(window);
