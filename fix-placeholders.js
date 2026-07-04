/**
 * Regenerate SVG placeholders without problematic features:
 * - Remove feGaussianBlur filter (causes rendering issues in some browsers)
 * - Remove emoji text (not reliably rendered in SVG across all browsers)
 * - Use unique IDs per file to prevent conflicts when multiple SVGs load on same page
 * - Use simple, clean SVG that always renders
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'img', 'placeholders');

// Color palettes per category
const PALETTES = {
    wisata:    [['#7c3aed','#4f46e5'], ['#6d28d9','#7c3aed'], ['#4c1d95','#6d28d9'], ['#5b21b6','#6d28d9'], ['#7e22ce','#9333ea']],
    kuliner:   [['#dc2626','#ea580c'], ['#b45309','#d97706'], ['#be123c','#e11d48'], ['#9f1239','#be123c'], ['#c2410c','#ea580c']],
    budaya:    [['#7e22ce','#a855f7'], ['#6b21a8','#9333ea'], ['#581c87','#7e22ce'], ['#4a044e','#7e22ce'], ['#86198f','#a21caf']],
    teknologi: [['#1d4ed8','#0284c7'], ['#1e40af','#3b82f6'], ['#1e3a8a','#1d4ed8'], ['#1d4ed8','#0ea5e9'], ['#2563eb','#3b82f6']],
    story:     [['#374151','#6b7280'], ['#1f2937','#4b5563'], ['#111827','#374151'], ['#0f172a','#1f2937'], ['#1e293b','#475569']],
};

// Simple SVG icons (path-based, no emoji)
const ICONS = {
    wisata: `<path d="M400 180 L480 320 L320 320 Z" fill="white" fill-opacity="0.9"/>
             <path d="M340 320 L400 220 L460 320 Z" fill="white" fill-opacity="0.7"/>
             <circle cx="400" cy="165" r="20" fill="white" fill-opacity="0.9"/>`,
    kuliner: `<circle cx="400" cy="240" r="70" fill="none" stroke="white" stroke-width="8" stroke-opacity="0.9"/>
              <line x1="400" y1="170" x2="400" y2="200" stroke="white" stroke-width="8" stroke-opacity="0.9"/>
              <path d="M370 200 Q370 240 380 250 L380 310 L420 310 L420 250 Q430 240 430 200 L370 200Z" fill="white" fill-opacity="0.9"/>`,
    budaya: `<path d="M280 320 L400 160 L520 320 Z" fill="none" stroke="white" stroke-width="8" stroke-opacity="0.9"/>
             <rect x="340" y="260" width="120" height="60" fill="white" fill-opacity="0.7"/>
             <rect x="370" y="230" width="60" height="30" fill="white" fill-opacity="0.5"/>`,
    teknologi: `<rect x="300" y="200" width="200" height="140" rx="16" fill="none" stroke="white" stroke-width="8" stroke-opacity="0.9"/>
                <line x1="340" y1="340" x2="460" y2="340" stroke="white" stroke-width="8" stroke-opacity="0.9"/>
                <circle cx="400" cy="270" r="30" fill="white" fill-opacity="0.4"/>`,
    story: `<path d="M300 200 L500 200 L500 360 L300 360 Z" fill="none" stroke="white" stroke-width="8" stroke-opacity="0.9"/>
            <line x1="330" y1="240" x2="470" y2="240" stroke="white" stroke-width="6" stroke-opacity="0.7"/>
            <line x1="330" y1="270" x2="470" y2="270" stroke="white" stroke-width="6" stroke-opacity="0.7"/>
            <line x1="330" y1="300" x2="420" y2="300" stroke="white" stroke-width="6" stroke-opacity="0.7"/>`,
};

let counter = 0;

function makeSVG(label, type, idx) {
    counter++;
    // Use a stable ID based on counter only (not timestamp) so SVGs are deterministic
    const uid = `g${counter}i${idx}`;
    const palette = PALETTES[type] || PALETTES.wisata;
    const [c1, c2] = palette[idx % palette.length];
    const icon = ICONS[type] || ICONS.wisata;
    
    // Truncate label safely (no special chars that break SVG)
    const safeLabel = (label || type)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const display = safeLabel.length > 24 ? safeLabel.substring(0, 22) + '...' : safeLabel;

    // Accent color (lighter version of c1)
    const accentOpacity = 0.15;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="grad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="800" height="600" fill="url(#grad_${uid})"/>
  <!-- Decorative shapes (no filter) -->
  <circle cx="650" cy="80" r="250" fill="white" fill-opacity="${accentOpacity}"/>
  <circle cx="100" cy="520" r="200" fill="white" fill-opacity="${accentOpacity}"/>
  <circle cx="400" cy="300" r="350" fill="white" fill-opacity="0.04"/>
  <!-- Grid lines -->
  <line x1="0" y1="150" x2="800" y2="150" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="0" y1="300" x2="800" y2="300" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="0" y1="450" x2="800" y2="450" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="200" y1="0" x2="200" y2="600" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="400" y1="0" x2="400" y2="600" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="600" y1="0" x2="600" y2="600" stroke="white" stroke-opacity="0.06" stroke-width="1"/>
  <!-- Icon -->
  ${icon}
  <!-- Label -->
  <text x="400" y="390" text-anchor="middle" font-size="24" font-weight="700" fill="white" fill-opacity="0.95" font-family="Arial,Helvetica,sans-serif">${display}</text>
  <!-- Badge background -->
  <rect x="310" y="412" width="180" height="30" rx="15" fill="white" fill-opacity="0.18"/>
  <!-- Badge text -->
  <text x="400" y="432" text-anchor="middle" font-size="13" fill="white" fill-opacity="0.85" font-family="Arial,Helvetica,sans-serif">Kota Bandung</text>
</svg>`;
}

// Read all data files and regenerate placeholders
const dataDir = path.join(__dirname, 'data');
const files = ['wisata', 'kuliner', 'budaya', 'teknologi', 'story'];
let totalRegenerated = 0;

files.forEach(type => {
    const filePath = path.join(dataDir, `${type}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${type}.json - not found`);
        return;
    }

    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.forEach((item, i) => {
        const label = item.nama || item.title || item.judul_chapter || type;
        const numImages = (item.gambar && item.gambar.length) || 5;

        for (let idx = 0; idx < numImages; idx++) {
            const filename = `${item.id}-${idx}.svg`;
            const svgPath = path.join(outDir, filename);
            // Always overwrite to fix broken SVGs
            fs.writeFileSync(svgPath, makeSVG(label, type, idx), 'utf8');
            totalRegenerated++;
        }

        // Hero/main image
        const mainFilename = `${item.id}-main.svg`;
        const mainPath = path.join(outDir, mainFilename);
        fs.writeFileSync(mainPath, makeSVG(label, type, 0), 'utf8');
        totalRegenerated++;
    });

    console.log(`✅ ${type}: regenerated placeholders`);
});

console.log(`\n🎉 Regenerated ${totalRegenerated} SVG placeholder files`);
console.log('✅ All SVGs now use unique gradient IDs and no emoji/filter dependencies');
