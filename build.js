const fs = require('fs');
const path = require('path');

const kontenDir = path.join(__dirname, 'konten');
const artikelOutputDir = path.join(__dirname, 'artikel');
const indexTemplateFile = path.join(__dirname, 'index_template.html');
const articleTemplateFile = path.join(__dirname, 'template.html');
const indexOutputFile = path.join(__dirname, 'index.html');

if (!fs.existsSync(kontenDir)) {
    console.log("Folder /konten tidak ada!");
    process.exit(1);
}
if (!fs.existsSync(artikelOutputDir)) {
    fs.mkdirSync(artikelOutputDir);
}

const files = fs.readdirSync(kontenDir).filter(f => f.endsWith('.html'));
let gridHtml = '';
let articleTemplate = fs.readFileSync(articleTemplateFile, 'utf-8');

files.forEach(file => {
    const slug = file.replace('.html', '');
    const content = fs.readFileSync(path.join(kontenDir, file), 'utf-8');

    // Coba ambil judul dan gambar
    const matchJudul = content.match(/<h2[^>]*>(.*?)<\/h2>/);
    const judul = matchJudul ? matchJudul[1] : slug;

    const matchGambar = content.match(/<img[^>]+src=["']([^"']+)["']/);
    const gambar = matchGambar ? matchGambar[1] : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

    // Buat HTML Kartu
    gridHtml += `
    <a href="/artikel/${slug}" class="block bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-all duration-300">
        <div class="h-52 w-full overflow-hidden">
            <img src="${gambar}" alt="${judul}" class="w-full h-full object-cover">
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-800 mb-3 line-clamp-2">${judul}</h3>
            <p class="text-blue-600 text-sm font-bold">Baca artikel &rarr;</p>
        </div>
    </a>
    `;

    // Gabungkan isi artikel ke template artikel
    const finalArticleHtml = articleTemplate.replace('', content);
    fs.writeFileSync(path.join(artikelOutputDir, `${slug}.html`), finalArticleHtml);
});

// Gabungkan kartu ke template index
let indexTemplateContent = fs.readFileSync(indexTemplateFile, 'utf-8');
const finalIndex = indexTemplateContent.replace('', gridHtml);
fs.writeFileSync(indexOutputFile, finalIndex);

console.log("Proses build selesai dan berhasil.");