'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b md:px-10 glass">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <span className="w-6 h-6 border border-indigo-2/70 rounded-md grid place-items-center relative" style={{
          boxShadow: 'inset 0 0 14px rgba(129,140,248,.12), 0 0 18px rgba(99,102,241,.09)'
        }}>
          <span className="absolute w-2.5 h-px bg-indigo-2" />
          <span className="absolute w-px h-2.5 bg-indigo-2" />
        </span>
        <span className="text-indigo">AI</span> ERA<span className="text-muted">.VN</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm text-muted font-medium">
        <Link href="/" className="transition-colors hover:text-foreground">{t('home')}</Link>
        <Link href="/services" className="transition-colors hover:text-foreground">{t('services')}</Link>
        <Link href="/contact" className="transition-colors hover:text-foreground">{t('contact')}</Link>
      </nav>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
