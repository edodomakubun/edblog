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
    const matchExcerpt = content.match(/<p[^>]*>(.*?)<\/p>/s);
    const excerpt = matchExcerpt ? matchExcerpt[1].replace(/<[^>]+>/g, '').slice(0, 120) : 'Baca artikel lengkap untuk melihat detail, contoh, dan praktik terbaik.';

    // Buat HTML Kartu
    gridHtml += `
    <a href="artikel/${slug}.html" class="group block rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div class="relative h-56 overflow-hidden bg-slate-100">
            <img src="${gambar}" alt="${judul}" class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>
        </div>
        <div class="p-6">
            <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Artikel</span>
            <h3 class="mt-4 text-2xl font-semibold text-slate-900">${judul}</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600 min-h-[3.5rem]">${excerpt}...</p>
            <div class="mt-6 flex items-center justify-between">
                <span class="text-sm font-semibold text-blue-600">Baca lebih lanjut &rarr;</span>
            </div>
        </div>
    </a>
    `;

    // Gabungkan isi artikel ke template artikel
    const finalArticleHtml = articleTemplate.replace('{{CONTENT}}', content);
    fs.writeFileSync(path.join(artikelOutputDir, `${slug}.html`), finalArticleHtml);
});

// Gabungkan kartu ke template index
let indexTemplateContent = fs.readFileSync(indexTemplateFile, 'utf-8');
const finalIndex = indexTemplateContent.replace('{{GRID}}', gridHtml);
fs.writeFileSync(indexOutputFile, finalIndex);

console.log("Proses build selesai dan berhasil.");