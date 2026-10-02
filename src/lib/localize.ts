import type { Locale } from '../messages';
import type { LocalizedText, Product } from '../api/types';

/** Picks the Arabic value in Arabic mode, falling back to English. */
export function pick(en: string | undefined | null, ar: string | undefined | null, locale: Locale): string {
  return (locale === 'ar' ? ar || en : en || ar) ?? '';
}

export function text(value: LocalizedText | null | undefined, locale: Locale): string {
  return value ? pick(value.en, value.ar, locale) : '';
}

/** Localized name for categories, brands, subcategories, branches... */
export function nameOf(entity: { name?: string; nameAr?: string } | null | undefined, locale: Locale): string {
  return entity ? pick(entity.name, entity.nameAr, locale) : '';
}

export function productTitle(p: Pick<Product, 'title' | 'titleAr'> | null | undefined, locale: Locale): string {
  return p ? pick(p.title, p.titleAr, locale) : '';
}

export function productDescription(p: Pick<Product, 'description' | 'descriptionAr'>, locale: Locale): string {
  return pick(p.description, p.descriptionAr, locale);
}

/** First sentence of the description — used on cards and teasers. */
export function productTeaser(p: Pick<Product, 'description' | 'descriptionAr'>, locale: Locale): string {
  const d = productDescription(p, locale);
  const m = d.match(/^.+?[.!؟?](\s|$)/);
  return (m ? m[0] : d).trim();
}
