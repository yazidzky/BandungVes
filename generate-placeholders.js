/**
 * Generate local SVG placeholder images for all data items
 * These are stored in assets/img/placeholders/ and used when online images fail
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'img', 'placeholders');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Color palettes per category
const PALETTES = {
    wisata:    [['#7c3aed','#4f46e5'], ['#6d28d9','#7c3aed'], ['#4c1d95','#6d28d9']],
    kuliner:   [['#dc2626','#ea580c'], ['#b45309','#d97706'], ['#be123c','#e11d48']],
    budaya:    [['#7e22ce','#a855f7'], ['#6b21a8','#9333ea'], ['#581c87','#7e22ce']],
    teknologi: [['#1d4ed8','#0284c7'], ['#1e40af','#3b82f6'], ['#1e3a8a','#1d4ed8']],
    story:     [['#374151','#6b7280'], ['#1f2937','#4b5563'], ['#111827','#374151']],
};

const ICONS = {
    wisata:    '🏔️',
    kuliner:   '🍜',
    budaya:    '🎭',
    teknologi: '⚙️',
    story:     '📖',
};

function makeSVG(label, type, idx) {
    const palette = PALETTES[type] || PALETTES.wisata;
    const [c1, c2] = palette[idx % palette.length];
    const icon = ICONS[type] || '📍';
    // Truncate label for display
    const display = label.length > 22 ? label.substring(0, 20) + '…' : label;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="40"/></filter>
  </defs>
  <!-- Background -->
  <rect width="800" height="600" fill="url(#g)"/>
  <!-- Decorative circles -->
  <circle cx="650" cy="100" r="200" fill="white" fill-opacity="0.05" filter="url(#blur)"/>
  <circle cx="150" cy="500" r="160" fill="white" fill-opacity="0.05" filter="url(#blur)"/>
  <!-- Grid lines -->
  <line x1="0" y1="150" x2="800" y2="150" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
  <line x1="0" y1="300" x2="800" y2="300" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
  <line x1="0" y1="450" x2="800" y2="450" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
  <line x1="200" y1="0" x2="200" y2="600" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
  <line x1="400" y1="0" x2="400" y2="600" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
  <line x1="600" y1="0" x2="600" y2="600" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
  <!-- Icon (text emoji fallback) -->
  <text x="400" y="260" text-anchor="middle" font-size="80" fill="white" fill-opacity="0.9" font-family="sans-serif">${icon}</text>
  <!-- Label -->
  <text x="400" y="340" text-anchor="middle" font-size="28" font-weight="bold" fill="white" fill-opacity="0.95" font-family="'Plus Jakarta Sans',sans-serif">${display}</text>
  <!-- Bandung badge -->
  <rect x="320" y="370" width="160" height="32" rx="16" fill="white" fill-opacity="0.15"/>
  <text x="400" y="391" text-anchor="middle" font-size="13" fill="white" fill-opacity="0.8" font-family="sans-serif">Kota Bandung</text>
</svg>`;
}

// Process each data file
const dataDir = path.join(__dirname, 'data');
const files = ['wisata', 'kuliner', 'budaya', 'teknologi', 'story'];
let totalGenerated = 0;

files.forEach(type => {
    const filePath = path.join(dataDir, `${type}.json`);
    if (!fs.existsSync(filePath)) return;

    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data = data.map((item, i) => {
        const label = item.nama || item.title || item.judul_chapter || type;
        const numImages = (item.gambar && item.gambar.length) || 5;

        const newGambar = [];
        for (let idx = 0; idx < numImages; idx++) {
            const filename = `${item.id}-${idx}.svg`;
            const svgPath = path.join(outDir, filename);
            if (!fs.existsSync(svgPath)) {
                fs.writeFileSync(svgPath, makeSVG(label, type, idx), 'utf8');
                totalGenerated++;
            }
            newGambar.push(`assets/img/placeholders/${filename}`);
        }

        // Also generate a hero/main image
        const mainFilename = `${item.id}-main.svg`;
        const mainPath = path.join(outDir, mainFilename);
        if (!fs.existsSync(mainPath)) {
            fs.writeFileSync(mainPath, makeSVG(label, type, 0), 'utf8');
            totalGenerated++;
        }

        return {
            ...item,
            image: newGambar[0],
            gambar: newGambar,
            images: newGambar,
            hero_image: newGambar[0],
        };
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ ${type}.json: updated with local SVG placeholders`);
});

console.log(`\n🎉 Generated ${totalGenerated} SVG placeholder files in assets/img/placeholders/`);
