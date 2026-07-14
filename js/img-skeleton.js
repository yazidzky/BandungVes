/**
 * img-skeleton.js
 * Automatically applies skeleton shimmer loading to images.
 * 
 * Usage: Include this script. It uses MutationObserver to catch 
 * dynamically added images and applies the shimmer skeleton effect
 * while they load.
 */
(function() {
    'use strict';

    /**
     * Process an <img> element: wrap its parent with skeleton class 
     * or apply directly if parent is already a suitable container.
     */
    function processImage(img) {
        // Skip if already processed
        if (img.dataset.skeletonProcessed) return;
        img.dataset.skeletonProcessed = 'true';

        // Skip tiny images and SVGs (icons, data URIs, etc.)
        if (img.src && (img.src.startsWith('data:image/svg') || img.src.includes('.svg') || img.src === '')) return;
        if (img.width > 0 && img.width < 24) return;

        // Find the wrapping container (parent with fixed size)
        const parent = img.parentElement;
        if (!parent) return;

        // Skip if parent already has skeleton
        if (parent.classList.contains('img-skeleton') || 
            parent.classList.contains('img-skeleton-dark') ||
            parent.classList.contains('loaded')) return;

        // Skip if parent has substantial text content (it's not just an image wrapper)
        if (parent.textContent && parent.textContent.trim().length > 15) return;

        // Skip if parent has non-image children (likely a complex layout, not a simple image wrapper)
        const hasNonImgChildren = Array.from(parent.children).some(child => child.tagName !== 'IMG' && child.tagName !== 'PICTURE' && child.tagName !== 'SOURCE');
        if (hasNonImgChildren) return;

        // Detect dark background
        const isDark = parent.closest('[class*="bg-[#0a0a0a]"], [class*="bg-[#1b0730]"], [class*="bg-[#1a0b2e]"], [style*="background:#1a0b2e"], [style*="background:#4c1d95"]');

        // Only apply skeleton to container-style parents (ones with overflow:hidden, rounded, etc.)
        const parentStyle = window.getComputedStyle(parent);
        const hasFixedSize = parent.style.height || parent.classList.contains('aspect-square') || 
                           parent.classList.contains('aspect-[4/3]') || parentStyle.overflow === 'hidden' ||
                           parent.querySelector('img') === img;

        if (!hasFixedSize) return;

        // Add skeleton class
        const skeletonClass = isDark ? 'img-skeleton-dark' : 'img-skeleton';
        parent.classList.add(skeletonClass);

        // Remove old animate-pulse and bg-purple-* placeholders
        parent.classList.remove('animate-pulse', 'bg-purple-200', 'bg-purple-200/20', 'bg-purple-100');
        img.classList.remove('animate-pulse', 'bg-purple-100', 'bg-purple-200');

        // When image loads, mark as loaded
        if (img.complete && img.naturalWidth > 0) {
            parent.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                parent.classList.add('loaded');
            }, { once: true });
            img.addEventListener('error', function() {
                parent.classList.add('loaded');
            }, { once: true });
        }
    }

    /**
     * Process all images in the document
     */
    function processAllImages() {
        document.querySelectorAll('img').forEach(processImage);
    }

    // Initial pass
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processAllImages);
    } else {
        processAllImages();
    }

    // Watch for dynamically added images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType !== 1) return;
                if (node.tagName === 'IMG') {
                    processImage(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(processImage);
                }
            });
        });
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    // Re-process periodically for late-loaded content (e.g. JSON-rendered)
    setTimeout(processAllImages, 1000);
    setTimeout(processAllImages, 3000);
})();
