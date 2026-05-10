const fs = require('fs');
const path = require('path');

const kontenDir = path.join(__dirname, 'konten');
const indexFile = path.join(__dirname, 'index.html');

if (!fs.existsSync(kontenDir)) {
    console.log("Folder /konten tidak ditemukan!");
    process.exit(1);
}

const files = fs.readdirSync(kontenDir).filter(f => f.endsWith('.html'));
let gridHtml = '';

files.forEach(file => {
    const slug = file.replace('.html', '');
    const content = fs.readFileSync(path.join(kontenDir, file), 'utf-8');
    
    // Ambil Judul
    const matchJudul = content.match(/<h2[^>]*>(.*?)<\/h2>/);
    const judul = matchJudul ? matchJudul[1] : slug.replace(/-/g, ' ');

    // Ambil Gambar
    const matchGambar = content.match(/<img[^>]+src="([^">]+)"/);
    const gambar = matchGambar ? matchGambar[1] : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

    // Ekstraksi Tanggal & Cuplikan Singkat (Excerpt)
    const paragraphs = content.match(/<p[^>]*>(.*?)<\/p>/g) || [];
    let excerpt = "Klik untuk membaca selengkapnya tentang artikel ini...";
    let tanggal = "Baru saja";
    
    for (let p of paragraphs) {
        let cleanText = p.replace(/<\/?[^>]+(>|$)/g, "").trim(); // Hapus tag HTML di dalam p
        if (cleanText.toLowerCase().includes('dipublikasikan')) {
            tanggal = cleanText.replace(/dipublikasikan pada|dipublikasikan:/i, '').trim();
        } else if (cleanText.length > 30 && excerpt.startsWith("Klik untuk")) {
            excerpt = cleanText.substring(0, 110) + '...'; // Potong jadi 110 huruf
        }
    }

    // Buat HTML Card dengan Animasi Hover Super Halus
    gridHtml += `
    <a href="/artikel/${slug}" class="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-300">
        <div class="h-56 w-full overflow-hidden relative">
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img src="${gambar}" alt="${judul}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out">
        </div>
        <div class="p-8 flex flex-col flex-grow">
            <p class="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider">${tanggal}</p>
            <h3 class="text-xl font-extrabold text-slate-800 mb-3 leading-snug line-clamp-2">${judul}</h3>
            <p class="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">${excerpt}</p>
            <div class="mt-auto flex items-center font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                Baca artikel <span class="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
            </div>
        </div>
    </a>
    `;
});

let indexContent = fs.readFileSync(indexFile, 'utf-8');
const finalIndex = indexContent.replace('', gridHtml);

fs.writeFileSync(path.join(__dirname, '_site_index.html'), finalIndex);
console.log(`Berhasil memproses ${files.length} artikel dengan desain dan animasi baru.`);