import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, Check, CreditCard, Lock, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { stripeCheckout } from '../api/payments';
import { ordersApi } from '../api/services';
import type { Address } from '../api/types';
import { useTranslations } from '../lib/i18n';
import { CART_KEY, couponMemory, useCart } from '../hooks/useShop';
import { PageHero } from '../components/shop/PageHero';
import { CartLine } from '../components/shop/CartDrawer';
import { AddressForm, AddressSummary, useAddresses } from '../components/shop/AddressForm';
import { CartTotals, CouponBox } from './CartPage';
import { Button, ButtonLink } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useToast } from '../components/ui/Toast';

type Step = 1 | 2 | 3;
type Method = 'cash' | 'card';

function Stepper({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  const t = useTranslations('Checkout');
  const steps: [Step, string][] = [
    [1, t('stepAddress')],
    [2, t('stepPayment')],
    [3, t('stepReview')]
  ];
  return (
    <ol className="flex items-center gap-2 sm:gap-4 mb-8">
      {steps.map(([n, label], i) => (
        <li key={n} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none">
          <button
            type="button"
            disabled={n > step}
            onClick={() => onJump(n)}
            aria-current={n === step ? 'step' : undefined}
            className="flex items-center gap-2 disabled:cursor-default">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${n < step ? 'bg-brand-gold text-white' : n === step ? 'bg-brand-dark text-white' : 'bg-white text-gray-400 border border-brand-dark/10'}`}>
              {n < step ? <Check className="w-4 h-4" /> : n}
            </span>
            <span className={`text-sm font-semibold hidden sm:inline ${n === step ? 'text-brand-dark' : 'text-gray-500'}`}>{label}</span>
          </button>
          {i < steps.length - 1 && <span className={`flex-1 h-0.5 rounded ${n < step ? 'bg-brand-gold' : 'bg-brand-dark/10'}`} />}
        </li>
      ))}
    </ol>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white/80 rounded-3xl p-5 sm:p-6 border border-brand-dark/5 ${className}`}>{children}</div>;
}

export function CheckoutPage() {
  const t = useTranslations('Checkout');
  const tAcc = useTranslations('Account');
  const tCart = useTranslations('Cart');
  const tCommon = useTranslations('Common');
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cart = useCart();
  const addresses = useAddresses();
  const [step, setStep] = useState<Step>(1);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>('cash');
  const [orderError, setOrderError] = useState<string | null>(null);

  // Pre-select the first saved address; open the form if there are none.
  useEffect(() => {
    if (!addresses.query.isSuccess) return;
    const list = addresses.list;
    if (!list.length) setAdding(true);
    else if (!addressId || !list.some((a) => a._id === addressId)) setAddressId(list[0]._id);
  }, [addresses.query.isSuccess, addresses.list, addressId]);

  const selected: Address | undefined = addresses.list.find((a) => a._id === addressId);

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!cart.cartId || !selected) throw new Error(t('selectAddress'));
      const shippingAddress = {
        details: selected.details,
        phone: selected.phone,
        city: selected.city,
        ...(selected.postalCode ? { postalCode: selected.postalCode } : {})
      };
      if (method === 'card') {
        await stripeCheckout.start(cart.cartId, shippingAddress);
        return null;
      }
      return ordersApi.createCash(cart.cartId, shippingAddress);
    },
    onSuccess: (order) => {
      if (!order) return; // redirected to Stripe
      // The server deletes the cart and updates stock/sold after a cash order.
      couponMemory.set('');
      qc.setQueryData(CART_KEY, null);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['public', 'products'] });
      qc.invalidateQueries({ queryKey: ['public', 'product'] });
      qc.invalidateQueries({ queryKey: ['public', 'product-summary'] });
      toast.success(t('orderPlaced'));
      navigate(`/account/orders/${order._id}`, { replace: true, state: { placed: true } });
    },
    onError: (e) => setOrderError(errorMessage(e))
  });

  if (cart.query.isLoading) {
    return (
      <main className="pt-32 pb-24 container mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </main>
    );
  }
  if (cart.query.isError) {
    return (
      <main className="pt-32 pb-24 container mx-auto px-4">
        <ErrorState error={cart.query.error} onRetry={() => cart.query.refetch()} />
      </main>
    );
  }
  if (!cart.items.length) {
    return (
      <main className="pt-32 pb-24 container mx-auto px-4">
        <EmptyState icon={<ShoppingBag className="w-7 h-7" />} title={tCart('empty')} description={t('emptyCart')} action={<ButtonLink to="/products">{tCart('continueShopping')}</ButtonLink>} />
      </main>
    );
  }

  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: tCart('title'), to: '/cart' }, { label: t('title') }]} title={t('title')} compact />
      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div>
          <Stepper step={step} onJump={setStep} />

          {step === 1 && (
            <Card>
              <h2 className="font-serif text-xl font-bold text-brand-dark mb-4">{t('selectAddress')}</h2>
              {addresses.query.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : addresses.query.isError ? (
                <ErrorState error={addresses.query.error} onRetry={() => addresses.query.refetch()} />
              ) : (
                <>
                  {addresses.list.length === 0 && !adding && <p className="text-sm text-gray-500 mb-4">{t('noAddresses')}</p>}
                  <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label={t('selectAddress')}>
                    {addresses.list.map((a) => (
                      <label
                        key={a._id}
                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${addressId === a._id ? 'border-brand-gold bg-brand-pink/40' : 'border-brand-dark/10 hover:border-brand-gold/40 bg-white'}`}>
                        <input type="radio" name="address" className="sr-only" checked={addressId === a._id} onChange={() => setAddressId(a._id)} />
                        {addressId === a._id && (
                          <span className="absolute top-3 end-3 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <AddressSummary address={a} />
                      </label>
                    ))}
                  </div>

                  {adding ? (
                    <div className="mt-6 border-t border-brand-dark/5 pt-6">
                      <h3 className="font-semibold text-brand-dark mb-4">{t('addNew')}</h3>
                      <AddressForm
                        submitLabel={tAcc('addAddress')}
                        loading={addresses.add.isPending}
                        serverError={addError}
                        onCancel={addresses.list.length ? () => setAdding(false) : undefined}
                        onSubmit={(a) => {
                          setAddError(null);
                          addresses.add.mutate(a, {
                            onSuccess: (list) => {
                              toast.success(tAcc('addressAdded'));
                              setAdding(false);
                              setAddressId(list[list.length - 1]?._id ?? null);
                            },
                            onError: (e) => setAddError(errorMessage(e))
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <Button variant="secondary" className="mt-4" onClick={() => setAdding(true)}>
                      <Plus className="w-4 h-4" />
                      {t('addNew')}
                    </Button>
                  )}
                </>
              )}
              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} disabled={!selected}>
                  {tCommon('continue')}
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <h2 className="font-serif text-xl font-bold text-brand-dark mb-4">{t('paymentMethod')}</h2>
              <div className="space-y-3" role="radiogroup" aria-label={t('paymentMethod')}>
                {(
                  [
                    ['cash', Banknote, t('cash'), t('cashDesc'), true],
                    ['card', CreditCard, t('card'), stripeCheckout.enabled ? t('cardDesc') : t('cardUnavailable'), stripeCheckout.enabled]
                  ] as const
                ).map(([value, Icon, label, desc, enabled]) => (
                  <label
                    key={value}
                    className={`flex items-start gap-4 rounded-2xl border-2 p-4 transition-all ${!enabled ? 'opacity-60 cursor-not-allowed bg-gray-50 border-brand-dark/5' : method === value ? 'border-brand-gold bg-brand-pink/40 cursor-pointer' : 'border-brand-dark/10 bg-white hover:border-brand-gold/40 cursor-pointer'}`}>
                    <input type="radio" name="method" className="mt-1 accent-brand-gold" disabled={!enabled} checked={method === value} onChange={() => setMethod(value)} />
                    <Icon className="w-6 h-6 text-brand-gold shrink-0" />
                    <span>
                      <span className="block font-semibold text-brand-dark">{label}</span>
                      <span className="block text-sm text-gray-500">{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  {tCommon('back')}
                </Button>
                <Button onClick={() => setStep(3)}>{tCommon('continue')}</Button>
              </div>
            </Card>
          )}

          {step === 3 && selected && (
            <div className="space-y-4">
              <Card>
                <h2 className="font-serif text-xl font-bold text-brand-dark mb-5">{t('reviewTitle')}</h2>
                <ul className="divide-y divide-brand-dark/5">
                  {cart.items.map((item) => (
                    <li key={item._id} className="py-4 first:pt-0 last:pb-0">
                      <CartLine item={item} readOnly compact />
                    </li>
                  ))}
                </ul>
              </Card>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">{t('shipTo')}</h3>
                    <button className="text-sm font-semibold text-brand-gold hover:underline" onClick={() => setStep(1)}>
                      {t('change')}
                    </button>
                  </div>
                  <AddressSummary address={selected} />
                </Card>
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">{t('payingWith')}</h3>
                    <button className="text-sm font-semibold text-brand-gold hover:underline" onClick={() => setStep(2)}>
                      {t('change')}
                    </button>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-gray-700">
                    {method === 'cash' ? <Banknote className="w-5 h-5 text-brand-gold" /> : <CreditCard className="w-5 h-5 text-brand-gold" />}
                    {method === 'cash' ? t('cash') : t('card')}
                  </p>
                </Card>
              </div>
              {orderError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-4" role="alert">
                  {orderError}
                </p>
              )}
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)} disabled={placeOrder.isPending}>
                  {tCommon('back')}
                </Button>
                <Button
                  size="lg"
                  loading={placeOrder.isPending}
                  onClick={() => {
                    setOrderError(null);
                    placeOrder.mutate();
                  }}>
                  <Lock className="w-4 h-4" />
                  {method === 'card' ? t('payWithCard') : t('placeOrder')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="bg-white/80 rounded-3xl p-6 border border-brand-dark/5 space-y-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-xl font-bold text-brand-dark">{tCart('summary')}</h2>
          <p className="text-sm text-gray-500">{tCart('items', { n: cart.count })}</p>
          <CouponBox />
          <CartTotals>
            <div className="flex justify-between">
              <dt className="text-gray-600">{t('shipping')}</dt>
              <dd className="font-semibold text-emerald-700">{t('free')}</dd>
            </div>
          </CartTotals>
        </aside>
      </section>
    </main>
  );
}
