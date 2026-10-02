import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../api/types';
import { errorMessage } from '../../api/client';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf, productTitle } from '../../lib/localize';
import { discountPercent } from '../../lib/format';
import { useCart, useRequireShopper } from '../../hooks/useShop';
import { useToast } from '../ui/Toast';
import { Skeleton } from '../ui/Spinner';
import { Stars } from '../ui/States';
import { useCartDrawer } from './CartDrawer';
import { PriceTag, WishlistButton } from './ProductBits';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const t = useTranslations('Product');
  const locale = useLocale();
  const cart = useCart();
  const toast = useToast();
  const drawer = useCartDrawer();
  const requireShopper = useRequireShopper();
  const navigate = useNavigate();
  const out = product.quantity <= 0;
  const pct = discountPercent(product);
  const needsOptions = (product.colors?.length ?? 0) > 0;
  const href = `/products/${product._id}`;

  const onAdd = () => {
    if (needsOptions) return navigate(href);
    const state = requireShopper();
    if (state === 'staff') return toast.info(t('staffNotice'));
    if (state !== 'ok') return;
    cart.add.mutate(
      { product },
      {
        onSuccess: () => {
          toast.success(t('added'));
          drawer.open();
        },
        onError: (e) => toast.error(errorMessage(e))
      }
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 8) * 0.04, duration: 0.35 }}
      className="group bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative w-full aspect-square rounded-2xl mb-4 overflow-hidden bg-brand-cream">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <img
            src={product.imageCover}
            alt={productTitle(product, locale)}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${out ? 'opacity-60 grayscale-[40%]' : ''}`}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
          />
        </Link>
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 items-start">
          {out ? (
            <span className="px-2.5 py-1 rounded-full bg-brand-dark text-white text-[10px] font-semibold tracking-wider uppercase">{t('outOfStock')}</span>
          ) : pct > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold tracking-wider uppercase">{t('off', { n: pct })}</span>
          ) : null}
        </div>
        <WishlistButton product={product} className="absolute top-3 end-3" />
      </div>

      {product.category?.name && <span className="text-[11px] font-semibold tracking-wider text-brand-gold uppercase mb-1">{nameOf(product.category, locale)}</span>}
      <h3 className="font-serif text-lg font-bold text-brand-dark leading-snug line-clamp-2 mb-2">
        <Link to={href} className="hover:text-brand-goldLight transition-colors">
          {productTitle(product, locale)}
        </Link>
      </h3>
      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
        <Stars value={product.ratingsAverage ?? 0} size="w-3.5 h-3.5" />
        <span>({product.ratingsQuantity ?? 0})</span>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3">
        <PriceTag product={product} />
        <button
          type="button"
          onClick={onAdd}
          disabled={out || cart.add.isPending}
          aria-label={needsOptions ? t('chooseOptions') : t('addToCart')}
          title={needsOptions ? t('chooseOptions') : t('addToCart')}
          className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white flex items-center justify-center shadow-md shadow-brand-gold/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none">
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
      <Skeleton className="w-full aspect-square rounded-2xl mb-4" />
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-5 w-4/5 mb-2" />
      <Skeleton className="h-3 w-24 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  loading,
  skeletons = 8,
  className = 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
}: {
  products?: Product[];
  loading?: boolean;
  skeletons?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {loading && !products
        ? Array.from({ length: skeletons }, (_, i) => <ProductCardSkeleton key={i} />)
        : products?.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
    </div>
  );
}
