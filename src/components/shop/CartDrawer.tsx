import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { CartItem } from '../../api/types';
import { errorMessage } from '../../api/client';
import { useLocale, useTranslations } from '../../lib/i18n';
import { formatPrice } from '../../lib/format';
import { productTitle } from '../../lib/localize';
import { useProductSummary } from '../../hooks/useCatalog';
import { useCart } from '../../hooks/useShop';
import { ButtonLink } from '../ui/Button';
import { Skeleton } from '../ui/Spinner';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import { ColorDot, QuantityStepper } from './ProductBits';

const DrawerContext = createContext<{ open: () => void; close: () => void; isOpen: boolean } | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);
  return (
    <DrawerContext.Provider value={value}>
      {children}
      <CartDrawer open={isOpen} onClose={close} />
    </DrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useCartDrawer must be used inside <CartDrawerProvider>');
  return ctx;
}

/**
 * One cart row. `cartItems[].product` is only an id, so the product's image
 * and title come from the (cached) product summary query.
 */
export function CartLine({ item, compact = false, readOnly = false }: { item: CartItem; compact?: boolean; readOnly?: boolean }) {
  const tUi = useTranslations('Ui');
  const t = useTranslations('Cart');
  const locale = useLocale();
  const toast = useToast();
  const cart = useCart();
  const { data: product, isLoading, isError } = useProductSummary(item.product);
  const busy = (cart.update.isPending && cart.update.variables?.itemId === item._id) || (cart.remove.isPending && cart.remove.variables === item._id);
  const max = product ? Math.max(product.quantity, item.quantity) : undefined;

  const setQty = (quantity: number) => {
    if (quantity < 1) return;
    if (product && quantity > product.quantity) return toast.info(t('maxStock', { n: product.quantity }));
    cart.update.mutate({ itemId: item._id, quantity }, { onError: (e) => toast.error(errorMessage(e)) });
  };
  const remove = () =>
    cart.remove.mutate(item._id, {
      onSuccess: () => toast.success(t('removed')),
      onError: (e) => toast.error(errorMessage(e))
    });

  const img = compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24';
  return (
    <div className={`flex gap-3 sm:gap-4 ${busy ? 'opacity-60' : ''}`}>
      <Link to={`/products/${item.product}`} className={`${img} shrink-0 rounded-2xl overflow-hidden bg-brand-cream`}>
        {isLoading ? <Skeleton className="w-full h-full" /> : product && <img src={product.imageCover} alt="" loading="lazy" className="w-full h-full object-cover" />}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-4 w-40 mb-2" />
            ) : (
              <Link to={`/products/${item.product}`} className="font-semibold text-brand-dark hover:text-brand-goldLight line-clamp-2 text-sm sm:text-base">
                {isError || !product ? t('unavailable') : productTitle(product, locale)}
              </Link>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
              {item.color && (
                <span className="inline-flex items-center gap-1.5">
                  <ColorDot color={item.color} className="w-3 h-3" />
                  {item.color}
                </span>
              )}
              <span>
                {formatPrice(item.price, locale)} {t('each')}
              </span>
            </div>
          </div>
          {!readOnly && (
            <button onClick={remove} disabled={busy} className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label={tUi('remove')} title={tUi('remove')}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          {readOnly ? (
            <span className="text-sm text-gray-500">× {item.quantity}</span>
          ) : (
            <QuantityStepper value={item.quantity} onChange={setQty} max={max} disabled={busy} size="sm" />
          )}
          <span className="font-bold text-brand-dark tabular-nums">{formatPrice(item.price * item.quantity, locale)}</span>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tUi = useTranslations('Ui');
  const t = useTranslations('Cart');
  const locale = useLocale();
  const cart = useCart();
  const location = useLocation();

  useEffect(() => {
    onClose();
    // close on navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[9000]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            initial={{ x: locale === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: locale === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 bottom-0 end-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <header className="flex items-center justify-between px-5 py-4 border-b border-brand-dark/5">
              <h2 className="font-serif text-xl font-bold text-brand-dark flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-gold" />
                {t('title')}
                {cart.count > 0 && <span className="text-sm font-sans font-medium text-gray-500">({t('items', { n: cart.count })})</span>}
              </h2>
              <button onClick={onClose} aria-label={tUi('close')} className="w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center hover:bg-brand-pinkDark/60">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.query.isLoading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-16 h-16" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cart.query.isError ? (
                <ErrorState error={cart.query.error} onRetry={() => cart.query.refetch()} />
              ) : cart.items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="w-7 h-7" />}
                  title={t('empty')}
                  description={t('emptyDesc')}
                  action={
                    <ButtonLink to="/products">{t('continueShopping')}</ButtonLink>
                  }
                />
              ) : (
                <ul className="space-y-5">
                  {cart.items.map((item) => (
                    <li key={item._id}>
                      <CartLine item={item} compact />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <footer className="border-t border-brand-dark/5 px-5 py-4 space-y-3 bg-brand-cream/40">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-semibold">{formatPrice(cart.subtotal, locale)}</span>
                </div>
                {cart.totalAfterDiscount != null && (
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span>{t('discount')}</span>
                    <span>−{formatPrice(cart.subtotal - cart.totalAfterDiscount, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-brand-dark text-lg">
                  <span>{t('total')}</span>
                  <span>{formatPrice(cart.total, locale)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <ButtonLink to="/cart" variant="secondary" block>{t('viewCart')}</ButtonLink>
                  <ButtonLink to="/checkout" block>{t('checkout')}</ButtonLink>
                </div>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
