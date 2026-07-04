/**
 * Rebuild data/ files using real image URLs from assets/Data/
 * Maps original data fields to the format expected by the app
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'assets', 'Data');
const outDir = path.join(__dirname, 'data');

// ─── WISATA ───────────────────────────────────────────────────────────────────
const rawWisata = JSON.parse(fs.readFileSync(path.join(srcDir, 'wisata_Kota_bandung.json'), 'utf8'));
const wisata = rawWisata.map((item, i) => {
    const gambar = (item.gambar || []).filter(Boolean);
    const id = `wisata-${i + 1}`;
    return {
        id,
        nama: item.nama_tempat || '',
        nama_tempat: item.nama_tempat || '',
        deskripsi: item.deskripsi_singkat || '',
        deskripsi_singkat: item.deskripsi_singkat || '',
        alamat: item.alamat_lengkap || '',
        alamat_lengkap: item.alamat_lengkap || '',
        lat: item.latitude || 0,
        long: item.longitude || 0,
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        image: gambar[0] || '',
        gambar: gambar,
        images: gambar,
        hero_image: gambar[0] || '',
        rating: item.rating || 4.5,
        reviews_count: item.jumlah_review || 0,
        jumlah_review: item.jumlah_review || 0,
        kategori: item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]) : [],
        harga_tiket: item.harga_tiket || 'Gratis',
        link_gmaps: item.link_gmaps || '',
        jam_senin: item.jam_senin || '',
        jam_selasa: item.jam_selasa || '',
        jam_rabu: item.jam_rabu || '',
        jam_kamis: item.jam_kamis || '',
        jam_jumat: item.jam_jumat || '',
        jam_sabtu: item.jam_sabtu || '',
        jam_minggu: item.jam_minggu || '',
        fasilitas: item.fasilitas || []
    };
});
fs.writeFileSync(path.join(outDir, 'wisata.json'), JSON.stringify(wisata, null, 2), 'utf8');
console.log(`✅ wisata.json: ${wisata.length} items, images from real URLs`);

// ─── KULINER ──────────────────────────────────────────────────────────────────
const rawKuliner = JSON.parse(fs.readFileSync(path.join(srcDir, 'kuliner_Kota_bandung.json'), 'utf8'));
const kuliner = rawKuliner.map((item, i) => {
    const gambar = (item.gambar || []).filter(Boolean);
    const id = `kuliner-${i + 1}`;
    return {
        id,
        nama: item.nama_tempat || '',
        nama_tempat: item.nama_tempat || '',
        deskripsi: item.deskripsi_singkat || '',
        deskripsi_singkat: item.deskripsi_singkat || '',
        alamat: item.alamat_lengkap || '',
        alamat_lengkap: item.alamat_lengkap || '',
        lat: item.latitude || 0,
        long: item.longitude || 0,
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        image: gambar[0] || '',
        gambar: gambar,
        images: gambar,
        hero_image: gambar[0] || '',
        rating: item.rating || 4.5,
        reviews_count: item.jumlah_review || 0,
        jumlah_review: item.jumlah_review || 0,
        kategori: item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]) : [],
        harga_tiket: item.harga || '',
        harga: item.harga || '',
        link_gmaps: item.link_gmaps || '',
        jam_senin: item.jam_senin || '',
        jam_selasa: item.jam_selasa || '',
        jam_rabu: item.jam_rabu || '',
        jam_kamis: item.jam_kamis || '',
        jam_jumat: item.jam_jumat || '',
        jam_sabtu: item.jam_sabtu || '',
        jam_minggu: item.jam_minggu || '',
        fasilitas: item.fasilitas || []
    };
});
fs.writeFileSync(path.join(outDir, 'kuliner.json'), JSON.stringify(kuliner, null, 2), 'utf8');
console.log(`✅ kuliner.json: ${kuliner.length} items, images from real URLs`);

// ─── BUDAYA ───────────────────────────────────────────────────────────────────
const rawBudaya = JSON.parse(fs.readFileSync(path.join(srcDir, 'Tradisi_Budaya_Kota_Bandung.json'), 'utf8'));
const budaya = rawBudaya.map((item, i) => {
    const gambar = (item.gambar || []).filter(Boolean);
    const id = `budaya-${i + 1}`;
    const nama = item.nama_budaya || item.nama || '';
    return {
        id,
        nama,
        nama_budaya: nama,
        deskripsi: item.deskripsi || '',
        deskripsi_singkat: item.deskripsi ? item.deskripsi.substring(0, 300) + '...' : '',
        alamat: item.lokasi_kunjungan || '',
        lokasi_kunjungan: item.lokasi_kunjungan || '',
        image: gambar[0] || '',
        gambar: gambar,
        images: gambar,
        hero_image: gambar[0] || '',
        rating: item.rating || 4.5,
        reviews_count: item.jumlah_review || 0,
        jumlah_review: item.jumlah_review || 0,
        kategori: item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]) : ['Budaya'],
        harga_tiket: item.harga_tiket || '',
        link_gmaps: item.link_gmaps || ''
    };
});
fs.writeFileSync(path.join(outDir, 'budaya.json'), JSON.stringify(budaya, null, 2), 'utf8');
console.log(`✅ budaya.json: ${budaya.length} items, images from real URLs`);

// ─── TEKNOLOGI ────────────────────────────────────────────────────────────────
const rawTeknologi = JSON.parse(fs.readFileSync(path.join(srcDir, 'Teknologi_kota_bandung.json'), 'utf8'));
const teknologi = rawTeknologi.map((item, i) => {
    const gambar = (item.gambar || []).filter(Boolean);
    const id = `teknologi-${i + 1}`;
    return {
        id,
        nama: item.nama || '',
        deskripsi: item.deskripsi || '',
        deskripsi_singkat: item.deskripsi ? item.deskripsi.substring(0, 300) + '...' : '',
        alamat: item.lokasi || '',
        lokasi: item.lokasi || '',
        image: gambar[0] || '',
        gambar: gambar,
        images: gambar,
        hero_image: gambar[0] || '',
        rating: item.rating || 4.5,
        reviews_count: item.jumlah_review || 0,
        jumlah_review: item.jumlah_review || 0,
        kategori: item.kategori ? (Array.isArray(item.kategori) ? item.kategori : [item.kategori]) : ['Teknologi'],
        harga_tiket: item.harga_tiket || '',
        link_gmaps: item.link_gmaps || ''
    };
});
fs.writeFileSync(path.join(outDir, 'teknologi.json'), JSON.stringify(teknologi, null, 2), 'utf8');
console.log(`✅ teknologi.json: ${teknologi.length} items, images from real URLs`);

// ─── STORY ────────────────────────────────────────────────────────────────────
const rawStory = JSON.parse(fs.readFileSync(path.join(srcDir, 'City_Story_Kota_Bandung.json'), 'utf8'));
const story = rawStory.map((item, i) => {
    const gambar = (item.gambar || []).filter(Boolean);
    const id = `story-${i + 1}`;
    return {
        id,
        judul_chapter: item.judul_chapter || '',
        periode: item.periode || '',
        narasi: item.narasi || '',
        nama: item.judul_chapter || '',
        image: gambar[0] || '',
        gambar: gambar,
        images: gambar,
        hero_image: gambar[0] || ''
    };
});
fs.writeFileSync(path.join(outDir, 'story.json'), JSON.stringify(story, null, 2), 'utf8');
console.log(`✅ story.json: ${story.length} items, images from real URLs`);

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n🎉 All data/ files rebuilt with real image URLs from assets/Data/');
console.log('   No more SVG placeholders — real photos will now load from Google/Wikipedia CDN');
