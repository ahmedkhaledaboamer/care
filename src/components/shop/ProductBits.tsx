import { Heart, Minus, Plus } from 'lucide-react';
import type { Product } from '../../api/types';
import { useLocale, useTranslations } from '../../lib/i18n';
import { discountPercent, effectivePrice, formatPrice } from '../../lib/format';
import { useRequireShopper, useWishlist } from '../../hooks/useShop';
import { useToast } from '../ui/Toast';
import { errorMessage } from '../../api/client';

export function PriceTag({ product, size = 'md' }: { product: Pick<Product, 'price' | 'priceAfterDiscount'>; size?: 'md' | 'lg' }) {
  const locale = useLocale();
  const tUi = useTranslations('Ui');
  const pct = discountPercent(product);
  return (
    <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
      <span className={`font-bold text-brand-dark ${size === 'lg' ? 'text-3xl' : 'text-lg'}`}>{formatPrice(effectivePrice(product), locale)}</span>
      {pct > 0 && (
        <span className={`text-gray-400 line-through ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
          <span className="sr-only">{tUi('wasPrice')} </span>
          {formatPrice(product.price, locale)}
        </span>
      )}
    </div>
  );
}

export function WishlistButton({ product, className = '' }: { product: Product; className?: string }) {
  const t = useTranslations('Product');
  const wishlist = useWishlist();
  const requireShopper = useRequireShopper();
  const toast = useToast();
  const inList = wishlist.has(product._id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const state = requireShopper();
    if (state === 'staff') return toast.info(t('staffNotice'));
    if (state !== 'ok') return;
    wishlist.toggle.mutate(
      { product, inList },
      {
        onSuccess: () => toast.success(inList ? t('wishRemoved') : t('wishAdded')),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={inList}
      aria-label={inList ? t('removeFromWishlist') : t('addToWishlist')}
      title={inList ? t('removeFromWishlist') : t('addToWishlist')}
      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${inList ? 'bg-rose-50 text-rose-500' : 'bg-white/90 text-brand-dark/60 hover:text-rose-500'} ${className}`}>
      <Heart className={`w-5 h-5 transition-transform ${inList ? 'fill-rose-500 scale-110' : ''}`} />
    </button>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  size = 'md'
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const t = useTranslations('Product');
  const btn = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return (
    <div className="inline-flex items-center rounded-full border border-brand-dark/15 bg-white">
      <button
        type="button"
        className={`${btn} flex items-center justify-center rounded-full text-brand-dark hover:bg-brand-cream disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label={t('decrease')}>
        <Minus className="w-4 h-4" />
      </button>
      <span className={`min-w-[2.25rem] text-center font-semibold tabular-nums ${size === 'sm' ? 'text-sm' : ''}`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${btn} flex items-center justify-center rounded-full text-brand-dark hover:bg-brand-cream disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label={t('increase')}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Color names or hex values from `product.colors`. */
export function ColorDot({ color, className = 'w-4 h-4' }: { color: string; className?: string }) {
  return <span className={`inline-block rounded-full border border-black/10 ${className}`} style={{ background: color }} aria-hidden="true" />;
}
