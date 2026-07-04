// Drag to resize map panel on mobile
document.addEventListener('DOMContentLoaded', function() {
    const dragArea = document.getElementById('mobile-drag-area');
    // Map container is the one with h-[40vh] initially
    const mapContainer = document.querySelector('.h-\\[40vh\\]');
    
    if (!dragArea || !mapContainer) return;

    let startY = 0;
    let startHeight = 0;
    let isDragging = false;

    dragArea.addEventListener('touchstart', function(e) {
        if (window.innerWidth >= 768) return; // Only mobile
        isDragging = true;
        startY = e.touches[0].clientY;
        startHeight = mapContainer.offsetHeight;
        document.body.style.userSelect = 'none';
        dragArea.style.cursor = 'grabbing';
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const deltaY = e.touches[0].clientY - startY;
        let newHeight = startHeight + deltaY;
        
        // Boundaries (20% to 80% of screen height)
        const minHeight = window.innerHeight * 0.2;
        const maxHeight = window.innerHeight * 0.8;
        
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;
        
        mapContainer.style.height = newHeight + 'px';
        
        // Trigger map resize if leaflet map exists
        if (typeof map !== 'undefined' && map && map.invalidateSize) {
            map.invalidateSize();
        }
    }, { passive: true });

    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            dragArea.style.cursor = 'grab';
            if (typeof map !== 'undefined' && map && map.invalidateSize) {
                map.invalidateSize();
            }
        }
    });
});
