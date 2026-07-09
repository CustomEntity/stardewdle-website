export async function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
            xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="https://www.w3.org/1999/xhtml"
            xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
            xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
            xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
            xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
        >
  <url>
    <loc>https://www.brawldle.gg/</loc>
    <lastmod>2025-10-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://www.brawldle.gg/classic</loc>
    <lastmod>2025-10-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://www.brawldle.gg/gadget</loc>
    <lastmod>2025-10-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
   
  <url>
    <loc>https://www.brawldle.gg/hypercharge</loc>
    <lastmod>2025-10-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
     
  <url>
    <loc>https://www.brawldle.gg/pixel</loc>
    <lastmod>2025-10-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>     
</urlset>
`;
	const response = new Response(body);
	response.headers.set('Content-Type', 'application/xml');
	return response;
}
