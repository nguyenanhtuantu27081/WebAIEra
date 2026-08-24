'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border py-12 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <h3 className="font-bold text-xl mb-3">{t('company')}</h3>
          <p className="text-muted text-sm leading-relaxed max-w-md">
            {t('description')}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4 text-foreground/80">Links</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/" className="hover:text-foreground transition-colors">{t('links.services')}</Link></li>
            <li><Link href="/about" className="hover:text-foreground transition-colors">{t('links.about')}</Link></li>
            <li><Link href="/contact" className="hover:text-foreground transition-colors">{t('links.contact')}</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground transition-colors">{t('links.privacy')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4 text-foreground/80">Services</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/services/phan-tich-dinh-luong-chung-khoan" className="hover:text-foreground transition-colors">Quantitative Equity</Link></li>
            <li><Link href="/services/ai-automation-ai-agent" className="hover:text-foreground transition-colors">AI Automation</Link></li>
            <li><Link href="/services/thiet-ke-website-chuan-seo" className="hover:text-foreground transition-colors">SEO Web Design</Link></li>
            <li><Link href="/services/phan-mem-quan-ly-doanh-nghiep" className="hover:text-foreground transition-colors">SaaS iSpa</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted">
          {t('company')} {t('rights')}
        </p>
        <p className="text-xs text-muted font-mono">{t('tagline')}</p>
      </div>
    </footer>
  );
}
