import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext } from
'react';
import { messages, type Locale, type Messages } from '../messages';
interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  messages: Messages;
}
const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_STORAGE_KEY = 'ds_locale';
export function LocaleProvider({
  children,
  defaultLocale = 'en' as Locale



}: {children: ReactNode;defaultLocale?: Locale;}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return defaultLocale;
    const stored = window.localStorage.getItem(
      LOCALE_STORAGE_KEY
    ) as Locale | null;
    return stored === 'en' || stored === 'ar' ? stored : defaultLocale;
  });
  // Apply lang + dir to <html> based on locale
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      messages: messages[locale]
    }),
    [locale]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LocaleProvider>');
  return ctx;
}
/** next-intl compatible: returns the current locale string */
export function useLocale(): Locale {
  return useI18n().locale;
}
/** Setter — not part of next-intl, but useful for our LocaleSwitcher */
export function useSetLocale(): (l: Locale) => void {
  return useI18n().setLocale;
}
/** next-intl compatible: returns t(key) scoped to a namespace */
export function useTranslations(namespace?: string) {
  const { messages } = useI18n();
  return (key: string): string => {
    const path = namespace ? `${namespace}.${key}` : key;
    const parts = path.split('.');
    let cur: unknown = messages;
    for (const p of parts) {
      if (
      cur &&
      typeof cur === 'object' &&
      p in (cur as Record<string, unknown>))
      {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return path; // fallback to key path if missing
      }
    }
    return typeof cur === 'string' ? cur : path;
  };
}