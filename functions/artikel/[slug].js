// File: functions/artikel/[slug].js

export async function onRequest(context) {
  const { request, env, params } = context;
  const slug = params.slug;

  try {
    // Ambil template master
    const templateResponse = await env.ASSETS.fetch(new Request(new URL('/template.html', request.url)));
    let template = await templateResponse.text();

    // Ambil file HTML artikel dari folder konten
    const articleResponse = await env.ASSETS.fetch(new Request(new URL(`/konten/${slug}.html`, request.url)));
    
    // Tangani jika URL artikel tidak ditemukan (404)
    if (!articleResponse.ok) {
      const errorHtml = template.replace(
        '<!-- {{KONTEN_ARTIKEL}} -->', 
        '<h2 class="text-red-500">404 - Artikel Tidak Ditemukan</h2><p>Maaf, artikel yang Anda cari tidak ada atau sudah dipindahkan.</p><a href="/" class="text-blue-500 hover:underline">&larr; Kembali ke Beranda</a>'
      );
      return new Response(errorHtml, { 
        status: 404, 
        headers: { "content-type": "text/html;charset=UTF-8" } 
      });
    }
    
    const articleContent = await articleResponse.text();

    // Inject konten ke template
    const finalHtml = template.replace('<!-- {{KONTEN_ARTIKEL}} -->', articleContent);

    return new Response(finalHtml, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });

  } catch (error) {
    return new Response("Terjadi kesalahan server: " + error.message, { status: 500 });
  }
}