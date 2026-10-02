import { BookOpen, Beaker, Check, Package } from 'lucide-react';
import type { Product } from '../../api/types';
import { useLocale, useTranslations } from '../../lib/i18n';
import { text } from '../../lib/localize';

/** Benefits / ingredients / directions / sizes stored on the product (bilingual). */
export function ProductFacts({ product, compact = false }: { product: Product; compact?: boolean }) {
  const t = useTranslations('ProductModal');
  const locale = useLocale();
  const benefits = (product.benefits ?? []).map((b) => text(b, locale)).filter(Boolean);
  const ingredients = (product.ingredients ?? []).map((i) => text(i, locale)).filter(Boolean);
  const sizes = (product.sizes ?? []).map((s) => text(s, locale)).filter(Boolean);
  const directions = text(product.directions, locale);
  if (!benefits.length && !ingredients.length && !sizes.length && !directions) return null;

  const box = 'bg-white/70 rounded-3xl p-5 border border-brand-pinkDark/10';
  const heading = 'text-xs sm:text-sm font-semibold tracking-wider text-brand-dark uppercase mb-4 flex items-center gap-2';

  return (
    <div className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
      {benefits.length > 0 && (
        <div className={box}>
          <h3 className={heading}>
            <Check className="w-4 h-4 text-brand-gold shrink-0" />
            {t('benefits')}
          </h3>
          <ul className="space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[15px] leading-7 text-gray-700">
                <span className="mt-3 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                <span className="break-words">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {ingredients.length > 0 && (
        <div className={box}>
          <h3 className={heading}>
            <Beaker className="w-4 h-4 text-brand-gold shrink-0" />
            {t('ingredients')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full bg-white border border-brand-pinkDark/20 text-[13px] font-medium text-brand-dark">
                {i}
              </span>
            ))}
          </div>
        </div>
      )}
      {directions && (
        <div className={box}>
          <h3 className={heading}>
            <BookOpen className="w-4 h-4 text-brand-gold shrink-0" />
            {t('directions')}
          </h3>
          <p className="text-[15px] leading-8 text-gray-700">{directions}</p>
        </div>
      )}
      {sizes.length > 0 && (
        <div className={box}>
          <h3 className={heading}>
            <Package className="w-4 h-4 text-brand-gold shrink-0" />
            {t('sizes')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <span key={s} className="px-4 py-2 rounded-xl border border-brand-dark/10 text-[13px] font-medium text-brand-dark bg-white">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
