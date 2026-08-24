'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/routing';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 glass rounded-lg px-2 py-1 text-xs font-mono"
        aria-label="Switch language"
      >
        {locale.toUpperCase()}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass rounded-xl p-1 absolute top-full mt-2 right-0 min-w-[80px]"
          >
            <button
              onClick={() => switchLocale('en')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                locale === 'en' ? 'bg-indigo/20 text-indigo-2' : 'text-muted hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => switchLocale('vi')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                locale === 'vi' ? 'bg-indigo/20 text-indigo-2' : 'text-muted hover:text-foreground'
              }`}
            >
              Tiếng Việt
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
