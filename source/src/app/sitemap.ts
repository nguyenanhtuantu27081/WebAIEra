import { NextResponse } from 'next/server';
import { routing } from '@/lib/i18n/routing';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn';
  const pages = [
    { url: '', priority: '1.0', changefreq: 'daily', lastmod: '2026-09-05' },
    { url: '/services', priority: '0.9', changefreq: 'weekly', lastmod: '2026-09-05' },
    { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: '2026-09-05' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly', lastmod: '2026-09-05' },
    { url: '/services/phan-tich-dinh-luong-chung-khoan', priority: '0.8', changefreq: 'weekly', lastmod: '2026-09-05' },
    { url: '/services/ai-automation-ai-agent', priority: '0.8', changefreq: 'weekly', lastmod: '2026-09-05' },
    { url: '/services/thiet-ke-website-chuan-seo', priority: '0.8', changefreq: 'weekly', lastmod: '2026-09-05' },
    { url: '/services/landing-page-hosting', priority: '0.8', changefreq: 'weekly', lastmod: '2026-09-05' },
    { url: '/services/digital-marketing-ai-content', priority: '0.8', changefreq: 'weekly', lastmod: '2026-09-05' },
    { url: '/services/phan-mem-quan-ly-doanh-nghiep', priority: '0.8', changefreq: 'weekly', lastmod: '2026-09-05' },
  ];

  const sitemap = pages
    .flatMap((page) =>
      routing.locales.map((locale) => ({
        url: `${baseUrl}/${locale}${page.url}`,
        lastModified: page.lastmod,
        changeFrequency: page.changefreq,
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
