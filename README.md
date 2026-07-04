# 🏔️ BandungVerse

> **Jelajahi sejarah, budaya, kuliner, dan destinasi terbaik Bandung dalam satu pengalaman interaktif.**

BandungVerse adalah platform web interaktif yang dirancang untuk menjadi panduan komprehensif bagi wisatawan maupun masyarakat lokal yang ingin mengeksplorasi keindahan kota Bandung. Melalui antarmuka yang modern dan dinamis, pengguna dapat menemukan kekayaan budaya, inovasi teknologi, hingga rekomendasi kuliner dan destinasi wisata terbaik di Kota Kembang.

---

## ✨ Fitur Utama

- 🗺️ **Eksplorasi Destinasi**: Temukan berbagai spot wisata menarik dengan informasi detail.
- 🍲 **Katalog Kuliner**: Rekomendasi tempat makan legendaris hingga kafe kekinian.
- 🎭 **Wawasan Budaya**: Pelajari sejarah, seni, dan tradisi lokal Sunda.
- 🏙️ **Pusat Teknologi**: Sorotan mengenai perkembangan smart city dan inovasi di Bandung.
- 📱 **Responsif & Interaktif**: Antarmuka mulus yang mendukung *mobile* dan *desktop* dengan animasi dinamis.

---

## 🛠️ Tech Stack & Arsitektur

Proyek ini dibangun dengan pendekatan *Vanilla Web Development* dengan sentuhan utilitas modern untuk memastikan performa yang cepat dan pengalaman *developer* yang baik:

- **Core**: HTML5, CSS3, JavaScript (ES6+).
- **Styling**: [Tailwind CSS (via CDN)](https://tailwindcss.com/) untuk *rapid UI development* dan penyesuaian gaya utilitas yang ekstensif.
- **Typography**: Font [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) dari Google Fonts.
- **Ikonografi & Aset**: Menggunakan format SVG kustom (`/assets/img/`) untuk resolusi tajam di berbagai ukuran layar dan *loading* yang ringan.
- **Data Management**: Konten disajikan secara dinamis menggunakan file JSON (`/data/`) yang dimuat (*fetch*) melalui JavaScript asinkron. Pendekatan ini memisahkan logika UI (*views*) dengan struktur data statis, sehingga *maintenance* konten menjadi jauh lebih mudah.

---

## 📁 Struktur Direktori

```text
BandungVes/
├── assets/          # Aset statis berupa gambar, ikon (SVG/PNG/JPG), dan font lokal
├── css/             # File CSS kustom (globals.css, animasi tambahan, override utilitas)
├── data/            # File JSON berisi dataset konten (budaya, kuliner, wisata, dll.)
├── js/              # Logika JavaScript untuk interaktivitas UI, fetch data, dan routing
├── index.html       # Halaman beranda / titik masuk utama
└── *.html           # Halaman pendukung lainnya (explore, itinerary, planner, map, dll.)
```

---

## 🚀 Cara Menjalankan Secara Lokal

Karena proyek ini menggunakan pemanggilan API `fetch()` untuk mengambil data JSON lokal, maka aplikasi harus dijalankan menggunakan web server lokal untuk menghindari isu **CORS (Cross-Origin Resource Sharing)** yang terjadi jika Anda hanya membuka file HTML secara langsung (protokol `file://`).

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/yazidzky/BandungVes.git
   cd BandungVes/html-version
   ```

2. **Jalankan local web server:**
   
   Jika Anda sudah menginstal [Node.js](https://nodejs.org/), Anda bisa menggunakan *package* `serve`:
   ```bash
   npx serve .
   ```

   *Alternatif: Menggunakan ekstensi **Live Server** di VS Code, atau **Python** (`python -m http.server`).*

3. **Buka di Browser:**
   Arahkan browser Anda ke `http://localhost:3000` (atau port yang diberikan oleh server lokal Anda).

---

## 💡 Konsep Desain (Design System)

- **Palet Warna**: Menggunakan kombinasi warna premium dengan warna *Primary* Ungu (`#6B21A8`) yang mencerminkan kreativitas dan keanggunan, dipadukan dengan desain *Glassmorphism* (latar putih transparan dengan efek blur) untuk memberikan kesan ultra-modern.
- **Animasi & Transisi**: Mengadopsi prinsip *Micro-interactions* dengan *hover state* yang mulus, efek pantulan (*ripple*) pada tombol, dan animasi *fade-in-up* untuk memastikan website terasa hidup saat pengguna melakukan *scrolling*.
- **Mobile-First Approach**: Struktur navigasi dan tata letak didesain agar intuitif pada layar ponsel pintar (menggunakan *bottom navigation bar* yang kekinian), yang kemudian beradaptasi dengan mulus pada layar *desktop* yang lebih lebar.

---

## 🤝 Kontribusi

Kami sangat menyambut kontribusi untuk proyek ini! Jika Anda menemukan bug, ingin menambah daftar rekomendasi destinasi, atau memiliki ide fitur baru:

1. *Fork* repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturBaru`).
3. *Commit* perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4. *Push* ke *branch* (`git push origin feature/FiturBaru`).
5. Buka **Pull Request**.

---

*Dibuat untuk kemajuan pariwisata, budaya, dan teknologi Kota Bandung.*
