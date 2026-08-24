'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import Ecosystem from '@/components/sections/Ecosystem';
import Services from '@/components/sections/Services';
import CTA from '@/components/sections/CTA';

const AiEraScene = dynamic(() => import('@/components/three/AiEraScene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-background" />,
});

export default function HomePage() {
  return (
    <>
      <AiEraScene />
      <Hero />
      <Ecosystem />
      <Services />
      <CTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AI Era',
            url: 'https://ai-era.vn',
            logo: 'https://ai-era.vn/logo.png',
            description: 'AI Era cung cấp giải pháp AI Automation, AI Agent, Digital Marketing, Phân tích định lượng chứng khoán, Thiết kế website SEO và Phần mềm quản lý doanh nghiệp ngành.',
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'contact@ai-era.vn',
              contactType: 'customer service',
            },
            sameAs: [],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'AI Era',
            url: 'https://ai-era.vn',
            description: 'Hệ sinh thái AI cho doanh nghiệp Việt Nam — Automation, Agent, Marketing, Quantitative Equity, AI SEO và SaaS.',
            inLanguage: 'vi-VN',
          }),
        }}
      />
    </>
  );
}
