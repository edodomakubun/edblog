const fs = require('fs');
const path = require('path');

const kontenDir = path.join(__dirname, 'konten');
const artikelOutputDir = path.join(__dirname, 'artikel'); // Folder tujuan artikel
const indexTemplateFile = path.join(__dirname, 'index_template.html');
const articleTemplateFile = path.join(__dirname, 'template.html');
const indexOutputFile = path.join(__dirname, 'index.html');

// 1. Siapkan folder
if (!fs.existsSync(kontenDir)) {
    console.log("Folder /konten tidak ditemukan!");
    process.exit(1);
}
// Buat folder /artikel/ jika belum ada
if (!fs.existsSync(artikelOutputDir)) {
    fs.mkdirSync(artikelOutputDir); 
}

const files = fs.readdirSync(kontenDir).filter(f => f.endsWith('.html'));
let gridHtml = '';

// Baca template artikel master
let articleTemplate = fs.readFileSync(articleTemplateFile, 'utf-8');

files.forEach(file => {
    const slug = file.replace('.html', '');
    const content = fs.readFileSync(path.join(kontenDir, file), 'utf-8');

    // --- EKSTRAKSI DATA UNTUK BERANDA ---
    const matchJudul = content.match(/<h2[^>]*>(.*?)<\/h2>/);
    const judul = matchJudul ? matchJudul[1] : slug.replace(/-/g, ' ');

    const matchGambar = content.match(/<img[^>]+src=["']([^"']+)["']/);
    const gambar = matchGambar ? matchGambar[1] : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

    const paragraphs = content.match(/<p[^>]*>(.*?)<\/p>/g) || [];
    let excerpt = "Klik untuk membaca selengkapnya...";
    let tanggal = "Baru Saja";
    
    for (let p of paragraphs) {
        let cleanText = p.replace(/<\/?[^>]+(>|$)/g, "").trim();
        if (cleanText.toLowerCase().includes('dipublikasikan')) {
            tanggal = cleanText.replace(/dipublikasikan pada|dipublikasikan:/i, '').trim();
        } else if (cleanText.length > 20 && excerpt.startsWith("Klik")) {
            excerpt = cleanText.substring(0, 110) + '...';
        }
    }

    // --- BANGUN KARTU BENTO GRID ---
    // Perhatikan href sekarang mengarah ke file .html statis
    gridHtml += `
    <a href="/artikel/${slug}.html" class="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div class="h-56 w-full overflow-hidden relative border-b border-slate-100">
            <img src="${gambar}" alt="${judul}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out">
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <p class="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">${tanggal}</p>
            <h3 class="text-xl font-extrabold text-slate-800 mb-3 leading-snug line-clamp-2">${judul}</h3>
            <p class="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">${excerpt}</p>
            <div class="mt-auto flex items-center text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                Baca artikel &rarr;
            </div>
        </div>
    </a>
    `;

    // --- BANGUN HALAMAN ARTIKEL STATIS ---
    // Gantikan placeholder dengan isi artikel
    const finalArticleHtml = articleTemplate.replace('', content);
    // Simpan file hasil rakitan ke dalam folder /artikel/
    fs.writeFileSync(path.join(artikelOutputDir, `${slug}.html`), finalArticleHtml);
});

// --- RAKIT HALAMAN BERANDA ---
let indexTemplateContent = fs.readFileSync(indexTemplateFile, 'utf-8');
const finalIndex = indexTemplateContent.replace('', gridHtml);
fs.writeFileSync(indexOutputFile, finalIndex);

console.log(`Berhasil mem-build ${files.length} artikel secara statis murni.`);