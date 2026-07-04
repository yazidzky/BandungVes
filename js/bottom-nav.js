(function() {
    // Detect active page
    var path = window.location.pathname.toLowerCase();
    var isHome     = path === '/' || path.endsWith('index.html') || path === '';
    var isExplore  = path.endsWith('explore.html');
    var isBudaya   = path.endsWith('budaya.html');

    var activeStyle   = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#4c1d95;color:white;box-shadow:0 4px 12px rgba(124,58,237,0.4);text-decoration:none;transition:all 0.3s;';
    var inactiveStyle = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#9ca3af;text-decoration:none;transition:all 0.3s;';

    function iconStyle(active) { return active ? activeStyle : inactiveStyle; }
    function imgFilter(active) { return active ? 'filter:brightness(0) invert(1)' : 'filter:invert(42%) sepia(10%) saturate(500%) hue-rotate(220deg) brightness(80%)'; }

    function injectNav() {
        if (document.getElementById('bottom-nav-global')) return;
        var navContainer = document.createElement('div');
        navContainer.id = 'bottom-nav-global';
        navContainer.style.cssText = 'position:fixed;bottom:24px;left:0;right:0;width:100vw;text-align:center;z-index:2147483647;pointer-events:none;transition:transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);';
        
        // Inner content
        navContainer.innerHTML = `
            <div style="position:relative; display:inline-block; pointer-events:auto;">
                <!-- Hide button -->
                <button id="btn-toggle-bottom-nav" style="position:absolute; top:-36px; left:50%; transform:translateX(-50%); background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); border:1px solid rgba(233,213,255,0.9); box-shadow:0 4px 12px rgba(0,0,0,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#4c1d95; transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                
                <nav id="bottom-nav-inner" style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);padding:12px 20px;border-radius:999px;box-shadow:0 8px 32px rgba(0,0,0,0.18);border:1px solid rgba(233,213,255,0.9); transition:all 0.3s;">
                    <a href="index.html" style="${iconStyle(isHome)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </a>
                    <a href="explore.html" style="${iconStyle(isExplore)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </a>
                    <a href="budaya.html" style="${iconStyle(isBudaya)}">
                        <img src="assets/img/ic_budaya_dan_tradisi.svg" alt="Budaya" width="20" height="20" style="${imgFilter(isBudaya)}" onerror="this.style.display='none'" />
                    </a>
                </nav>
            </div>
        `;
        document.documentElement.appendChild(navContainer);

        // Toggle logic
        var isHidden = false;
        var toggleBtn = document.getElementById('btn-toggle-bottom-nav');
        var svgIcon = toggleBtn.querySelector('svg');
        
        toggleBtn.addEventListener('click', function() {
            isHidden = !isHidden;
            if (isHidden) {
                // Move nav down offscreen but keep button slightly peeking or adjust button position
                navContainer.style.transform = 'translateY(100px)';
                toggleBtn.style.transform = 'translate(-50%, -64px)'; 
                svgIcon.innerHTML = '<path d="m18 15-6-6-6 6"/>'; // Up arrow
            } else {
                navContainer.style.transform = 'translateY(0)';
                toggleBtn.style.transform = 'translateX(-50%)'; 
                svgIcon.innerHTML = '<path d="m6 9 6 6 6-6"/>'; // Down arrow
            }
        });
    }

    function checkVisibility() {
        var el = document.getElementById('bottom-nav-global');
        if (el) {
            el.style.display = window.innerWidth >= 768 ? 'none' : 'block';
        } else {
            if (window.innerWidth < 768) {
                injectNav();
            }
        }
    }
    window.addEventListener('load', checkVisibility);
    window.addEventListener('resize', checkVisibility);
})();
