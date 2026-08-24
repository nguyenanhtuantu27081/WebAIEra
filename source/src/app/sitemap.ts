import { NextResponse } from 'next/server';
import { routing } from '@/lib/i18n/routing';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const baseUrl = 'https://ai-era.vn';
  const pages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/services/phan-tich-dinh-luong-chung-khoan', priority: 0.8, changefreq: 'weekly' },
    { url: '/services/ai-automation-ai-agent', priority: 0.8, changefreq: 'weekly' },
    { url: '/services/thiet-ke-website-chuan-seo', priority: 0.8, changefreq: 'weekly' },
    { url: '/services/landing-page-hosting', priority: 0.8, changefreq: 'weekly' },
    { url: '/services/digital-marketing-ai-content', priority: 0.8, changefreq: 'weekly' },
    { url: '/services/phan-mem-quan-ly-doanh-nghiep', priority: 0.8, changefreq: 'weekly' },
  ];

  const sitemap = pages
    .flatMap((page) =>
      routing.locales.map((locale) => ({
        url: `${baseUrl}/${locale}${page.url}`,
        lastModified: new Date().toISOString(),
        changeFrequency: page.changefreq as any,
        priority: page.priority,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page.url}`,
            vi: `${baseUrl}/vi${page.url}`,
          },
        },
      }))
    )
    .map((entry) => {
      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${entry.alternates.languages.en}" />
    <xhtml:link rel="alternate" hreflang="vi" href="${entry.alternates.languages.vi}" />
  </url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
