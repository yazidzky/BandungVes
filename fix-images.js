const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = ['wisata.json', 'kuliner.json', 'budaya.json', 'teknologi.json', 'story.json'];

// Domains that are known to block browser access or return broken images
const BLOCKED_DOMAINS = [
    'lh3.googleusercontent.com',
    'lh4.googleusercontent.com',
    'lh5.googleusercontent.com',
    'lh6.googleusercontent.com',
    'placehold.co',
    'encrypted-tbn0.gstatic.com',  // Google thumbnail cache — often blocked
];

function isUnreliableUrl(url) {
    if (!url || url.trim() === '') return true;
    return BLOCKED_DOMAINS.some(domain => url.includes(domain));
}

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data = data.map(item => {
        const seed = item.id || Math.random().toString(36).substring(7);
        
        // Fix gambar array
        if (Array.isArray(item.gambar)) {
            item.gambar = item.gambar
                .filter(img => img && img.trim() !== '')
                .map((img, idx) => {
                    if (isUnreliableUrl(img)) {
                        return `https://picsum.photos/seed/${seed}-${idx}/800/600`;
                    }
                    return img;
                });
        }
        
        // Keep images array in sync with gambar
        if (Array.isArray(item.gambar)) {
            item.images = [...item.gambar];
        } else if (Array.isArray(item.images)) {
            item.images = item.images
                .filter(img => img && img.trim() !== '')
                .map((img, idx) => {
                    if (isUnreliableUrl(img)) {
                        return `https://picsum.photos/seed/${seed}-${idx}/800/600`;
                    }
                    return img;
                });
        }
        
        // Keep image (single) in sync with gambar[0]
        if (Array.isArray(item.gambar) && item.gambar.length > 0) {
            item.image = item.gambar[0];
        } else if (isUnreliableUrl(item.image)) {
            item.image = `https://picsum.photos/seed/${seed}-0/800/600`;
        }

        // Same for hero_image (story)
        if (item.hero_image && isUnreliableUrl(item.hero_image)) {
            item.hero_image = item.image || `https://picsum.photos/seed/${seed}-hero/1200/600`;
        }
        
        return item;
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Fixed images in ${file}`);
});
