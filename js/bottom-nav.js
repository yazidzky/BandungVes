(function() {
    'use strict';

    var path      = window.location.pathname.toLowerCase();
    var isHome    = path === '/' || path.endsWith('index.html') || path === '';
    var isExplore = path.endsWith('explore.html');
    var isBudaya  = path.endsWith('budaya.html');

    var _active   = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#7c3aed;color:white;box-shadow:0 4px 16px rgba(124,58,237,0.45);text-decoration:none;transition:transform 0.2s ease,box-shadow 0.2s ease;';
    var _inactive = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#9ca3af;text-decoration:none;transition:transform 0.2s ease;';

    function sty(active) { return active ? _active : _inactive; }
    function imgF(active) {
        return active ? 'filter:brightness(0) invert(1)' : 'filter:invert(42%) sepia(10%) saturate(500%) hue-rotate(220deg) brightness(80%)';
    }

    /* ── CSS injected once ───────────────────── */
    function injectStyles() {
        if (document.getElementById('bv-nav-style')) return;
        var s = document.createElement('style');
        s.id = 'bv-nav-style';
        s.textContent = [
            '#bottom-nav-global {',
            '  will-change: transform;',
            '  transition: transform 0.45s cubic-bezier(0.34,1.4,0.64,1);',
            '}',
            '#bottom-nav-global nav a:active {',
            '  transform: scale(0.88) !important;',
            '}',
            '#btn-toggle-bottom-nav {',
            '  will-change: transform, bottom;',
            '  transition: transform 0.3s ease, bottom 0.45s cubic-bezier(0.34,1.4,0.64,1), opacity 0.25s ease;',
            '}',
            '#btn-toggle-bottom-nav:hover { opacity:0.85; transform:translateX(-50%) scale(1.08); }',
            '#btn-toggle-bottom-nav:active { transform:translateX(-50%) scale(0.92); }',
            /* Bounce in on first load */
            '@keyframes navBounceIn {',
            '  0%   { transform: translateY(80px); opacity:0; }',
            '  60%  { transform: translateY(-6px); opacity:1; }',
            '  80%  { transform: translateY(3px); }',
            '  100% { transform: translateY(0); }',
            '}',
            '.nav-bounce-in { animation: navBounceIn 0.6s cubic-bezier(0.34,1.4,0.64,1) both; }',
            '.toggle-fade-in { animation: toggleFade 0.4s 0.3s ease both; }',
            '@keyframes toggleFade {',
            '  from { opacity:0; transform:translateX(-50%) translateY(8px); }',
            '  to   { opacity:1; transform:translateX(-50%) translateY(0); }',
            '}',
            /* Rotate icon */
            '#toggle-nav-icon { transition: transform 0.35s cubic-bezier(0.34,1.4,0.64,1); }',
            '.icon-rotated { transform: rotate(180deg); }'
        ].join('\n');
        document.head.appendChild(s);
    }

    function injectNav() {
        if (document.getElementById('bottom-nav-global')) return;
        injectStyles();

        /* ── NAV PILL ─────────────────────────── */
        var pill = document.createElement('div');
        pill.id = 'bottom-nav-global';
        // Only bounce in if nav is NOT hidden (otherwise apply hidden state silently)
        var savedHidden = sessionStorage.getItem('bv-nav-hidden') === '1';
        if (!savedHidden) pill.className = 'nav-bounce-in';
        pill.style.cssText = 'position:fixed;bottom:24px;left:0;right:0;width:100vw;text-align:center;z-index:9990;pointer-events:none;-webkit-transform:translateZ(0);transform:translateZ(0);';

        pill.innerHTML =
            '<nav style="pointer-events:auto;display:inline-flex;">' +
            '<div style="display:flex;align-items:center;gap:12px;' +
            'background:rgba(255,255,255,0.96);' +
            '-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);' +
            'padding:12px 20px;border-radius:999px;' +
            'box-shadow:0 8px 40px rgba(0,0,0,0.14),0 2px 8px rgba(124,58,237,0.08);' +
            'border:1px solid rgba(233,213,255,0.85);">' +
            /* Home */
            '<a href="index.html" style="' + sty(isHome) + '" aria-label="Beranda">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
            '</a>' +
            /* Explore */
            '<a href="explore.html" style="' + sty(isExplore) + '" aria-label="Jelajahi">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
            '</a>' +
            /* Budaya */
            '<a href="budaya.html" style="' + sty(isBudaya) + '" aria-label="Budaya">' +
            '<img src="assets/img/ic_budaya_dan_tradisi.svg" alt="Budaya" width="20" height="20" style="' + imgF(isBudaya) + ';pointer-events:none;" onerror="this.style.display=\'none\'" />' +
            '</a>' +
            '</div></nav>';

        /* ── TOGGLE BUTTON ──────────────────────
           Lives independently so hiding nav does NOT move this button */
        var toggle = document.createElement('button');
        toggle.id = 'btn-toggle-bottom-nav';
        toggle.className = 'toggle-fade-in';
        toggle.setAttribute('aria-label', 'Sembunyikan navigasi');
        toggle.style.cssText = [
            'position:fixed',
            'bottom:92px',          /* sits above nav pill */
            'left:50%',
            'transform:translateX(-50%)',
            'background:rgba(255,255,255,0.94)',
            '-webkit-backdrop-filter:blur(10px)',
            'backdrop-filter:blur(10px)',
            'border:1px solid rgba(233,213,255,0.85)',
            'box-shadow:0 4px 20px rgba(0,0,0,0.1),0 1px 4px rgba(124,58,237,0.08)',
            'width:28px',
            'height:28px',
            'border-radius:50%',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'cursor:pointer',
            'color:#7c3aed',
            'z-index:9991',
            'padding:0',
            'border-style:solid'
        ].join(';');

        toggle.innerHTML =
            '<svg id="toggle-nav-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" ' +
            'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
            'stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="m6 9 6 6 6-6"/>' +
            '</svg>';

        document.documentElement.appendChild(pill);
        document.documentElement.appendChild(toggle);

        /* ── TOGGLE INTERACTION ──────────────── */
        var hidden = sessionStorage.getItem('bv-nav-hidden') === '1';
        var icon   = document.getElementById('toggle-nav-icon');

        // Apply saved state immediately on inject (no animation)
        if (hidden) {
            pill.style.transition   = 'none';
            toggle.style.transition = 'none';
            pill.style.transform    = 'translateY(90px)';
            pill.style.opacity      = '0';
            toggle.style.bottom     = '20px';
            icon.classList.add('icon-rotated');
            toggle.setAttribute('aria-label', 'Tampilkan navigasi');
            // Re-enable transitions after next frame
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    pill.style.transition   = '';
                    toggle.style.transition = '';
                });
            });
        }

        toggle.addEventListener('click', function() {
            hidden = !hidden;
            sessionStorage.setItem('bv-nav-hidden', hidden ? '1' : '0');

            if (hidden) {
                pill.style.transform   = 'translateY(90px)';
                pill.style.opacity     = '0';
                toggle.style.bottom    = '20px';
                icon.classList.add('icon-rotated');
                toggle.setAttribute('aria-label', 'Tampilkan navigasi');
                if (navigator.vibrate) navigator.vibrate(10);
            } else {
                pill.style.transform   = 'translateY(0)';
                pill.style.opacity     = '1';
                toggle.style.bottom    = '92px';
                icon.classList.remove('icon-rotated');
                toggle.setAttribute('aria-label', 'Sembunyikan navigasi');
                if (navigator.vibrate) navigator.vibrate(8);
            }
        });

        /* Ripple on nav links */
        pill.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', function() {
                if (navigator.vibrate) navigator.vibrate(10);
            });
        });
    }

    function checkVisibility() {
        var p = document.getElementById('bottom-nav-global');
        var t = document.getElementById('btn-toggle-bottom-nav');
        var ok = window.innerWidth < 768;

        if (!ok) {
            if (p) p.style.display = 'none';
            if (t) t.style.display = 'none';
        } else {
            if (p) { p.style.display = 'block'; p.style.opacity = p.style.opacity || '1'; }
            if (t) t.style.display = 'flex';
            if (!p) injectNav();
        }
    }

    window.addEventListener('load', checkVisibility);
    window.addEventListener('resize', checkVisibility);
})();
