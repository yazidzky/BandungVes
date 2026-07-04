/**
 * Build data files from assets/Data/ originals into data/ folder
 * Normalizes field names and adds IDs so all JS files can find items correctly.
 */
const fs = require('fs');
const path = require('path');

const assetDir = path.join(__dirname, 'assets', 'Data');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// --- WISATA ---
const wisataRaw = JSON.parse(fs.readFileSync(path.join(assetDir, 'wisata_Kota_bandung.json'), 'utf8'));
const wisata = wisataRaw.map((item, i) => ({
    id: `wisata-${i + 1}`,
    nama: item.nama_tempat,
    nama_tempat: item.nama_tempat,
    deskripsi: item.deskripsi_singkat,
    deskripsi_singkat: item.deskripsi_singkat,
    alamat: item.alamat_lengkap,
    alamat_lengkap: item.alamat_lengkap,
    lat: item.latitude,
    long: item.longitude,
    latitude: item.latitude,
    longitude: item.longitude,
    image: (item.gambar && item.gambar.length > 0) ? item.gambar[0] : 'https://placehold.co/400x300/purple/white?text=No+Image',
    gambar: item.gambar || [],
    images: item.gambar || [],
    rating: item.rating || 4.5,
    reviews_count: item.jumlah_review || 0,
    jumlah_review: item.jumlah_review || 0,
    kategori: Array.isArray(item.kategori) ? [...item.kategori, 'Wisata'] : [item.kategori || 'Wisata', 'Wisata'],
    harga_tiket: item.harga_tiket || '',
    link_gmaps: item.link_gmaps || '',
    jam_senin: item.jam_senin || '',
    jam_selasa: item.jam_selasa || '',
    jam_rabu: item.jam_rabu || '',
    jam_kamis: item.jam_kamis || '',
    jam_jumat: item.jam_jumat || '',
    jam_sabtu: item.jam_sabtu || '',
    jam_minggu: item.jam_minggu || '',
    fasilitas: ['Parkir', 'Toilet', 'Spot Foto']
}));
fs.writeFileSync(path.join(dataDir, 'wisata.json'), JSON.stringify(wisata, null, 2), 'utf8');
console.log(`✅ wisata.json: ${wisata.length} items`);

// --- BUDAYA ---
const budayaRaw = JSON.parse(fs.readFileSync(path.join(assetDir, 'Tradisi_Budaya_Kota_Bandung.json'), 'utf8'));
const budaya = budayaRaw.map((item, i) => ({
    id: `budaya-${i + 1}`,
    nama: item.nama_budaya,
    nama_budaya: item.nama_budaya,
    deskripsi: item.deskripsi,
    alamat: item.lokasi_kunjungan || '',
    lokasi_kunjungan: item.lokasi_kunjungan || '',
    image: (item.gambar && item.gambar.length > 0) ? item.gambar[0] : 'https://placehold.co/400x300/purple/white?text=No+Image',
    gambar: item.gambar || [],
    images: item.gambar || [],
    kategori: Array.isArray(item.kategori) ? item.kategori : [item.kategori || 'Budaya'],
    rating: 4.7
}));
fs.writeFileSync(path.join(dataDir, 'budaya.json'), JSON.stringify(budaya, null, 2), 'utf8');
console.log(`✅ budaya.json: ${budaya.length} items`);

// --- TEKNOLOGI ---
const teknoRaw = JSON.parse(fs.readFileSync(path.join(assetDir, 'Teknologi_kota_bandung.json'), 'utf8'));
const teknologi = teknoRaw.map((item, i) => ({
    id: `tekno-${i + 1}`,
    nama: item.nama,
    deskripsi: item.deskripsi,
    alamat: item.lokasi || '',
    lokasi: item.lokasi || '',
    image: (item.gambar && item.gambar.length > 0) ? item.gambar[0] : 'https://placehold.co/400x300/purple/white?text=No+Image',
    gambar: item.gambar || [],
    images: item.gambar || [],
    kategori: ['Teknologi'],
    rating: 4.8
}));
fs.writeFileSync(path.join(dataDir, 'teknologi.json'), JSON.stringify(teknologi, null, 2), 'utf8');
console.log(`✅ teknologi.json: ${teknologi.length} items`);

// --- STORY ---
const storyRaw = JSON.parse(fs.readFileSync(path.join(assetDir, 'City_Story_Kota_Bandung.json'), 'utf8'));
const story = storyRaw.map((item, i) => ({
    id: `story-${i + 1}`,
    chapter: i + 1,
    title: item.judul_chapter,
    judul_chapter: item.judul_chapter,
    periode: item.periode,
    deskripsi: (item.narasi || '').substring(0, 200) + '...',
    content: item.narasi,
    narasi: item.narasi,
    hero_image: (item.gambar && item.gambar.length > 0) ? item.gambar[0] : 'https://placehold.co/1200x600/purple/white?text=No+Image',
    image: (item.gambar && item.gambar.length > 0) ? item.gambar[0] : 'https://placehold.co/400x300/purple/white?text=No+Image',
    gambar: item.gambar || [],
    images: item.gambar || []
}));
fs.writeFileSync(path.join(dataDir, 'story.json'), JSON.stringify(story, null, 2), 'utf8');
console.log(`✅ story.json: ${story.length} items`);

// --- KULINER ---
const kulinerAssetPath = path.join(assetDir, 'kuliner_Kota_bandung.json');
if (fs.existsSync(kulinerAssetPath)) {
    const kulinerRaw = JSON.parse(fs.readFileSync(kulinerAssetPath, 'utf8'));
    const kuliner = kulinerRaw.map((item, i) => ({
        id: `kuliner-${i + 1}`,
        nama: item.nama_tempat,
        nama_tempat: item.nama_tempat,
        deskripsi: item.deskripsi_singkat,
        deskripsi_singkat: item.deskripsi_singkat,
        alamat: item.alamat_lengkap,
        alamat_lengkap: item.alamat_lengkap,
        lat: item.latitude,
        long: item.longitude,
        latitude: item.latitude,
        longitude: item.longitude,
        image: (item.gambar && item.gambar.length > 0) ? item.gambar[0] : 'https://placehold.co/400x300/purple/white?text=No+Image',
        gambar: item.gambar || [],
        images: item.gambar || [],
        rating: item.rating || 4.5,
        reviews_count: item.jumlah_review || 0,
        jumlah_review: item.jumlah_review || 0,
        kategori: Array.isArray(item.kategori) ? item.kategori : [item.kategori || 'Kuliner'],
        harga_tiket: item.harga || '',
        link_gmaps: item.link_gmaps || '',
        jam_senin: item.jam_senin || '',
        jam_selasa: item.jam_selasa || '',
        jam_rabu: item.jam_rabu || '',
        jam_kamis: item.jam_kamis || '',
        jam_jumat: item.jam_jumat || '',
        jam_sabtu: item.jam_sabtu || '',
        jam_minggu: item.jam_minggu || ''
    }));
    fs.writeFileSync(path.join(dataDir, 'kuliner.json'), JSON.stringify(kuliner, null, 2), 'utf8');
    console.log(`✅ kuliner.json: ${kuliner.length} items (built from assets)`);
} else {
    console.log('⚠️ kuliner_Kota_bandung.json not found in assets, skipping');
}

console.log('\n🎉 All data files built successfully from assets/Data/!');
