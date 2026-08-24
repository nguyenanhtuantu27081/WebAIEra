'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import { useScrollReveal } from '@/lib/motion/useScrollReveal';

export default function Ecosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const t = useTranslations('ecosystem');
  const tServices = useTranslations('services');

  const services = [
    { key: 'aiAutomation', href: '/services/ai-automation-ai-agent', color: 'bg-indigo' },
    { key: 'aiAgent', href: '/services/ai-automation-ai-agent', color: 'bg-cyan' },
    { key: 'digitalMarketing', href: '/services/digital-marketing-ai-content', color: 'bg-purple' },
    { key: 'quantEquity', href: '/services/phan-tich-dinh-luong-chung-khoan', color: 'bg-blue-400' },
    { key: 'aiSeo', href: '/services/thiet-ke-website-chuan-seo', color: 'bg-teal-300' },
    { key: 'ispa', href: '/services/phan-mem-quan-ly-doanh-nghiep', color: 'bg-fuchsia-300' },
  ];

  return (
    <section ref={sectionRef} id="services" className="relative z-10 py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('title')}</h2>
          <p className="text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.key} href={service.href} className="group">
              <GlassCard className="h-full transition-all duration-300 hover:border-indigo/30 hover:translate-y-[-4px]">
                <div className={`w-2 h-2 rounded-full ${service.color} mb-4 group-hover:animate-pulse-glow`} />
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo transition-colors">
                  {tServices(service.key + '.name')}
                </h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-3">
                  {tServices(service.key + '.desc')}
                </p>
                <span className="inline-block mt-4 text-xs font-mono text-indigo-2 group-hover:translate-x-1 transition-transform">
                  Learn more →
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
