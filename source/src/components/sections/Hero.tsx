'use client';

import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';

export default function Hero() {
  const t = useTranslations('home');

  return (
    <section className="relative z-10 min-h-screen flex items-center px-6 md:px-10 lg:px-16 pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo/28 bg-indigo/8 text-indigo-2 font-mono text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-2 animate-pulse-glow" />
            {t('badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.97] tracking-tight mb-6">
            <span className="bg-gradient-to-b from-white via-white to-muted bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
          </h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed max-w-xl mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <MagneticButton
              href="#services"
              className="inline-flex items-center px-6 py-3 rounded-full bg-white text-background font-semibold text-sm hover:bg-indigo-2 hover:text-background transition-colors"
            >
              {t('hero.ctaPrimary')}
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="inline-flex items-center px-6 py-3 rounded-full border border-border text-muted font-medium text-sm hover:text-foreground hover:border-indigo/30 transition-all"
            >
              {t('hero.ctaSecondary')}
            </MagneticButton>
          </div>
        </div>

        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2">
          <GlassCard className="w-72 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold">{t('hud.title')}</span>
              <span className="text-[10px] font-mono text-muted">{t('hud.status')}</span>
            </div>
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between text-muted">
                <span>{t('hud.distance')}</span>
                <span className="text-indigo-2">14.0</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('hud.rotationX')}</span>
                <span className="text-indigo-2">0.00</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('hud.rotationY')}</span>
                <span className="text-indigo-2">0.00</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('hud.focus')}</span>
                <span className="text-indigo-2">CORE</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-muted leading-relaxed">
              Drag to rotate. Scroll to fly through space. Click a node to focus.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
