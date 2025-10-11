"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPathname);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all ${
          isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'
        }`}
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{locale === 'en' ? 'English' : 'العربية'}</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-all ${
              locale === 'en' ? 'bg-gray-100 font-semibold' : ''
            }`}
            disabled={locale === 'en'}
          >
            <span className="flex items-center gap-2">
              <span>🇬🇧</span>
              <span>English</span>
            </span>
          </button>
          <button
            onClick={() => switchLanguage('ar')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-all ${
              locale === 'ar' ? 'bg-gray-100 font-semibold' : ''
            }`}
            disabled={locale === 'ar'}
          >
            <span className="flex items-center gap-2">
              <span>🇸🇦</span>
              <span>العربية</span>
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}