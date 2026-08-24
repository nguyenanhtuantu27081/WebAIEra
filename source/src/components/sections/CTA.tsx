'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import { useScrollReveal } from '@/lib/motion/useScrollReveal';

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const t = useTranslations('cta');

  return (
    <section ref={sectionRef} id="contact" className="relative z-10 py-24 px-6 md:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <GlassCard className="p-10 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('title')}</h2>
          <p className="text-muted max-w-xl mx-auto mb-8">{t('subtitle')}</p>
          <a
            href="mailto:contact@ai-era.vn"
            className="inline-flex items-center px-8 py-4 rounded-full bg-white text-background font-semibold hover:bg-indigo-2 hover:text-background transition-colors"
          >
            {t('button')}
          </a>
        </GlassCard>
      </div>
    </section>
  );
}
