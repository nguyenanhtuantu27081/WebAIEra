import { Metadata } from 'next';
import { generateMetadata as buildMetadata, siteConfig } from '@/lib/seo/metadata';
import Hero from '@/components/sections/Hero';
import Ecosystem from '@/components/sections/Ecosystem';
import Services from '@/components/sections/Services';
import CTA from '@/components/sections/CTA';
import HeroSceneSwitcher from '@/components/three/HeroSceneSwitcher';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isVi = locale === 'vi';
  return buildMetadata({
    title: isVi
      ? 'AI Era — Giải pháp AI, Fintech & Phần mềm Doanh nghiệp'
      : 'AI Era — Enterprise AI, Fintech & Software Solutions',
    description: isVi
      ? 'AI Era (AI Era Solution) cung cấp giải pháp AI Automation, AI Agent, Fintech, phân tích định lượng chứng khoán, thiết kế website SEO và phần mềm quản lý doanh nghiệp.'
      : 'AI Era (AI Era Solution) delivers applied AI automation, intelligent agents, quantitative fintech, SEO web engineering, and vertical enterprise SaaS.',
    path: '',
    locale,
  });
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <HeroSceneSwitcher />
      <Hero />
      <Ecosystem />
      <Services />
      <CTA />
    </>
  );
}
