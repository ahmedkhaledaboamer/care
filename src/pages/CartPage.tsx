import { useState, type FormEvent } from 'react';
import { ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { errorMessage } from '../api/client';
import { useLocale, useTranslations } from '../lib/i18n';
import { formatPrice } from '../lib/format';
import { useCart } from '../hooks/useShop';
import { PageHero } from '../components/shop/PageHero';
import { CartLine } from '../components/shop/CartDrawer';
import { Button, ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useToast } from '../components/ui/Toast';

export function CouponBox() {
  const t = useTranslations('Cart');
  const cart = useCart();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    setError(null);
    cart.applyCoupon.mutate(c, {
      onSuccess: () => {
        toast.success(t('couponApplied', { code: c }));
        setCode('');
      },
      // Invalid / expired coupon → 400 with a server message.
      onError: (err) => setError(errorMessage(err))
    });
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="coupon" className="text-sm font-medium text-brand-dark flex items-center gap-2">
        <Tag className="w-4 h-4 text-brand-gold" />
        {t('coupon')}
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder={t('couponPh')}
          aria-invalid={!!error || undefined}
          className={`flex-1 min-w-0 h-11 rounded-full border px-4 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${error ? 'border-red-400' : 'border-brand-dark/15'}`}
        />
        <Button type="submit" variant="dark" loading={cart.applyCoupon.isPending} disabled={!code.trim()}>
          {t('applyCoupon')}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {cart.totalAfterDiscount != null && !error && (
        <p className="text-xs text-emerald-700 font-medium">{cart.appliedCoupon ? t('couponApplied', { code: cart.appliedCoupon }) : t('couponAppliedGeneric')}</p>
      )}
    </form>
  );
}

export function CartTotals({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const cart = useCart();
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-gray-600">{t('subtotal')}</dt>
        <dd className="font-semibold tabular-nums">{formatPrice(cart.subtotal, locale)}</dd>
      </div>
      {cart.totalAfterDiscount != null && (
        <div className="flex justify-between text-emerald-700">
          <dt>{t('discount')}</dt>
          <dd className="tabular-nums">−{formatPrice(cart.subtotal - cart.totalAfterDiscount, locale)}</dd>
        </div>
      )}
      {children}
      <div className="flex justify-between text-lg font-bold text-brand-dark border-t border-brand-dark/10 pt-3">
        <dt>{t('total')}</dt>
        <dd className="tabular-nums">{formatPrice(cart.total, locale)}</dd>
      </div>
    </dl>
  );
}

export function CartPage() {
  const t = useTranslations('Cart');
  const tCommon = useTranslations('Common');
  const cart = useCart();
  const toast = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: t('title') }]} title={t('title')} compact />
      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-8">
        {cart.query.isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
        ) : cart.query.isError ? (
          <ErrorState error={cart.query.error} onRetry={() => cart.query.refetch()} />
        ) : cart.items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-7 h-7" />}
            title={t('empty')}
            description={t('emptyDesc')}
            action={<ButtonLink to="/products">{t('continueShopping')}</ButtonLink>}
            className="bg-white/60 rounded-3xl"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
            <div className="bg-white/80 rounded-3xl p-4 sm:p-6 border border-brand-dark/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{t('items', { n: cart.count })}</p>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setConfirmClear(true)}>
                  <Trash2 className="w-4 h-4" />
                  {t('clearCart')}
                </Button>
              </div>
              <ul className="divide-y divide-brand-dark/5">
                {cart.items.map((item) => (
                  <li key={item._id} className="py-5 first:pt-0 last:pb-0">
                    <CartLine item={item} />
                  </li>
                ))}
              </ul>
            </div>

            <aside className="bg-white/80 rounded-3xl p-6 border border-brand-dark/5 space-y-6 lg:sticky lg:top-28">
              <h2 className="font-serif text-xl font-bold text-brand-dark">{t('summary')}</h2>
              <CouponBox />
              <CartTotals />
              <p className="text-xs text-gray-500">{t('couponResetNote')}</p>
              <div className="space-y-3">
                <ButtonLink to="/checkout" block size="lg">
                  {t('checkout')}
                </ButtonLink>
                <ButtonLink to="/products" variant="secondary" block>
                  {t('continueShopping')}
                </ButtonLink>
              </div>
            </aside>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmClear}
        title={t('clearConfirm')}
        confirmLabel={t('clearCart')}
        cancelLabel={tCommon('cancel')}
        loading={cart.clear.isPending}
        onClose={() => setConfirmClear(false)}
        onConfirm={() =>
          cart.clear.mutate(undefined, {
            onSuccess: () => {
              setConfirmClear(false);
              toast.success(t('cleared'));
            },
            onError: (e) => toast.error(errorMessage(e))
          })
        }
      />
    </main>
  );
}
