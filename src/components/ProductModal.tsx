import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../api/types';
import { errorMessage } from '../api/client';
import { useLocale, useTranslations } from '../lib/i18n';
import { nameOf, productDescription, productTitle } from '../lib/localize';
import { useCart, useRequireShopper } from '../hooks/useShop';
import { useCartDrawer } from './shop/CartDrawer';
import { PriceTag, WishlistButton } from './shop/ProductBits';
import { ProductFacts } from './shop/ProductFacts';
import { Stars } from './ui/States';
import { useToast } from './ui/Toast';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/** Quick view for the landing sections — live product from the API. */
export function ProductModal({ product, onClose }: ProductModalProps) {
  const t = useTranslations('ProductModal');
  const tProduct = useTranslations('Product');
  const locale = useLocale();
  const cart = useCart();
  const toast = useToast();
  const drawer = useCartDrawer();
  const requireShopper = useRequireShopper();

  useEffect(() => {
    if (!product) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  const out = (product?.quantity ?? 0) <= 0;
  const needsOptions = (product?.colors?.length ?? 0) > 0;

  const addToCart = () => {
    if (!product) return;
    const state = requireShopper();
    if (state === 'staff') return toast.info(tProduct('staffNotice'));
    if (state !== 'ok') return onClose();
    cart.add.mutate(
      { product },
      {
        onSuccess: () => {
          toast.success(tProduct('added'));
          onClose();
          drawer.open();
        },
        onError: (e) => toast.error(errorMessage(e))
      }
    );
  };

  return createPortal(
    <AnimatePresence>
      {product && (
        <motion.div
          key="product-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby="product-modal-title">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="relative w-full max-w-5xl max-h-[92vh] bg-brand-cream rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
            <button
              onClick={onClose}
              aria-label={t('close')}
              className="absolute top-4 end-4 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>

            {/* Image stays fixed; only the details column scrolls. */}
            <div className="flex flex-col md:flex-row min-h-0 max-h-[92vh]">
              <div className="shrink-0 md:w-5/12 bg-white p-5 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-e border-brand-dark/5">
                <img
                  src={product.imageCover}
                  alt={productTitle(product, locale)}
                  className="w-full max-w-[180px] sm:max-w-[240px] md:max-w-none md:max-h-[80vh] aspect-square object-contain rounded-3xl"
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="px-5 py-6 sm:px-7 md:px-10 md:py-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-white text-brand-gold text-[11px] font-semibold uppercase tracking-wider mb-4">
                    {nameOf(product.category, locale)}
                  </span>
                  <h2 id="product-modal-title" className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-brand-dark mb-3 break-words">
                    {productTitle(product, locale)}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Stars value={product.ratingsAverage ?? 0} size="w-4 h-4" />
                    <span>({product.ratingsQuantity ?? 0})</span>
                  </div>
                  <div className="mb-5">
                    <PriceTag product={product} size="lg" />
                  </div>
                  <p className="text-[15px] leading-8 text-gray-600 mb-6">{productDescription(product, locale)}</p>

                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    {needsOptions ? (
                      <Link
                        to={`/products/${product._id}`}
                        onClick={onClose}
                        className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg hover:scale-[1.01] transition-all">
                        {tProduct('chooseOptions')}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={addToCart}
                        disabled={out || cart.add.isPending}
                        className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100">
                        <ShoppingBag className="w-5 h-5" />
                        {out ? tProduct('outOfStock') : tProduct('addToCart')}
                      </button>
                    )}
                    <WishlistButton product={product} className="w-12 h-12 border border-brand-dark/10" />
                    <Link
                      to={`/products/${product._id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-brand-dark/15 bg-white text-brand-dark font-semibold hover:border-brand-gold transition-colors">
                      {t('viewDetails')}
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  </div>

                  <ProductFacts product={product} compact />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
