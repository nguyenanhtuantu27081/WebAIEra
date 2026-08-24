'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-foreground transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-foreground transition-all ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-foreground transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      <nav className={`${open ? 'flex' : 'hidden'} md:flex absolute md:static top-full left-0 right-0 md:right-auto bg-background md:bg-transparent border-b md:border-0 border-border p-4 md:p-0 flex-col md:flex-row gap-4 md:items-center`}>
        <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          {t('home')}
        </Link>
        <Link href="/services" className="text-sm text-muted hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          {t('services')}
        </Link>
        <Link href="/contact" className="text-sm text-muted hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          {t('contact')}
        </Link>
      </nav>
    </>
  );
}
