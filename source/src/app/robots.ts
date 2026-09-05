import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn';
  const body = `User-agent: *
Allow: /

# AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
