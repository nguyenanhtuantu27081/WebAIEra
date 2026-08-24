'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import { useScrollReveal } from '@/lib/motion/useScrollReveal';

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const t = useTranslations('site');

  const services = [
    { title: 'Phân tích định lượng chứng khoán', desc: 'Tín hiệu định lượng, factor model và machine learning cho nhà đầu tư Việt Nam.', href: '/services/phan-tich-dinh-luong-chung-khoan' },
    { title: 'AI Automation & AI Agent', desc: 'Tự động hóa quy trình và triển khai AI Agent theo yêu cầu doanh nghiệp.', href: '/services/ai-automation-ai-agent' },
    { title: 'Thiết kế website chuẩn SEO', desc: 'Website semantic-first, tốc độ cao và tối ưu AI discovery.', href: '/services/thiet-ke-website-chuan-seo' },
    { title: 'Landing page & Hosting', desc: 'Landing page chuyển đổi cao kết hợp hosting miễn phí.', href: '/services/landing-page-hosting' },
    { title: 'Digital Marketing & AI Content', desc: 'Quảng cáo đa nền tảng và tự động hóa nội dung bằng AI.', href: '/services/digital-marketing-ai-content' },
    { title: 'Phần mềm quản lý doanh nghiệp', desc: 'Giải pháp SaaS chuyên ngành cho Spa, Nail, Nha khoa, Gym.', href: '/services/phan-mem-quan-ly-doanh-nghiep' },
  ];

  return (
    <section ref={sectionRef} className="relative z-10 py-24 px-6 md:px-10 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Expertise</h2>
            <p className="text-muted max-w-xl">End-to-end AI and digital solutions tailored for Vietnamese businesses.</p>
          </div>
          <Link href="/services" className="hidden md:inline-flex items-center text-sm text-indigo hover:text-indigo-2 transition-colors">
            View all services →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.href} href={service.href}>
              <GlassCard className="h-full transition-all duration-300 hover:border-indigo/30 hover:translate-y-[-4px]">
                <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{service.desc}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
