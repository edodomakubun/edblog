const fs = require('fs');
const path = require('path');

const kontenDir = path.join(__dirname, 'konten');
const indexFile = path.join(__dirname, 'index.html');

// Pastikan folder konten ada
if (!fs.existsSync(kontenDir)) {
    console.log("Folder /konten tidak ditemukan!");
    process.exit(1);
}

// Baca semua file .html di dalam folder /konten
const files = fs.readdirSync(kontenDir).filter(f => f.endsWith('.html'));

let gridHtml = '';

files.forEach(file => {
    const slug = file.replace('.html', '');
    const content = fs.readFileSync(path.join(kontenDir, file), 'utf-8');
    
    // Cari tag <h2> pertama di dalam artikel untuk dijadikan Judul Kartu
    const matchJudul = content.match(/<h2[^>]*>(.*?)<\/h2>/);
    const judul = matchJudul ? matchJudul[1] : slug.replace(/-/g, ' ');

    // Cari tag <img> pertama untuk dijadikan Thumbnail (opsional)
    const matchGambar = content.match(/<img[^>]+src="([^">]+)"/);
    const gambar = matchGambar ? matchGambar[1] : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

    // Buat HTML Card (Bento/Glass style)
    gridHtml += `
    <a href="/artikel/${slug}" class="group block bg-white/60 backdrop-blur-lg border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
        <div class="h-48 w-full overflow-hidden">
            <img src="${gambar}" alt="${judul}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-800 mb-2 leading-tight">${judul}</h3>
            <p class="text-blue-600 text-sm font-semibold mt-4 group-hover:translate-x-1 transition-transform">Baca artikel &rarr;</p>
        </div>
    </a>
    `;
});

// Masukkan kartu yang sudah di-generate ke dalam index.html
let indexContent = fs.readFileSync(indexFile, 'utf-8');
const finalIndex = indexContent.replace('<!-- {{DAFTAR_ARTIKEL}} -->', gridHtml);

// Simpan sebagai file baru (agar file sumber index.html tidak tertimpa)
fs.writeFileSync(path.join(__dirname, '_site_index.html'), finalIndex);

console.log(`Berhasil memproses ${files.length} artikel untuk beranda.`);