import React from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useSetLocale, useTranslations } from '../lib/i18n';
export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useTranslations('LocaleSwitcher');
  return (
    <div
      role="group"
      aria-label={t('label')}
      className="inline-flex items-center gap-1 bg-white/70 backdrop-blur-sm border border-brand-dark/10 rounded-full p-1 shadow-sm">
      
      <Globe className="w-4 h-4 text-brand-dark/60 mx-1.5 hidden sm:block" />
      <button
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${locale === 'en' ? 'bg-gradient-to-r from-brand-gold to-brand-goldLight text-white shadow' : 'text-brand-dark/70 hover:text-brand-dark'}`}>
        
        {t('en')}
      </button>
      <button
        onClick={() => setLocale('ar')}
        aria-pressed={locale === 'ar'}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${locale === 'ar' ? 'bg-gradient-to-r from-brand-gold to-brand-goldLight text-white shadow' : 'text-brand-dark/70 hover:text-brand-dark'}`}>
        
        {t('ar')}
      </button>
    </div>);

}