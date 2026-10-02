import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, ChevronRight, Package } from 'lucide-react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { ordersApi } from '../../api/services';
import type { Order } from '../../api/types';
import { useLocale, useTranslations } from '../../lib/i18n';
import { formatDate, formatPrice, shortId } from '../../lib/format';
import { productTitle } from '../../lib/localize';
import { AddressSummary } from '../../components/shop/AddressForm';
import { ColorDot } from '../../components/shop/ProductBits';
import { ButtonLink } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Spinner';
import { Badge, EmptyState, ErrorState, Pager } from '../../components/ui/States';
import { AccountCard } from './AccountLayout';

export function OrderBadges({ order }: { order: Order }) {
  const t = useTranslations('Orders');
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone={order.isPaid ? 'green' : 'amber'}>{order.isPaid ? t('paid') : t('unpaid')}</Badge>
      <Badge tone={order.isDelivered ? 'green' : 'blue'}>{order.isDelivered ? t('delivered') : t('pending')}</Badge>
    </div>
  );
}

export function OrdersPage() {
  const t = useTranslations('Orders');
  const tCart = useTranslations('Cart');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['orders', 'mine', page],
    queryFn: ({ signal }) => ordersApi.list({ page, limit: 10, sort: '-createdAt' }, signal),
    placeholderData: keepPreviousData
  });

  return (
    <AccountCard title={t('title')}>
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState icon={<Package className="w-7 h-7" />} title={t('empty')} description={t('emptyDesc')} action={<ButtonLink to="/products">{tCart('continueShopping')}</ButtonLink>} />
      ) : (
        <>
          <ul className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
            {data.data.map((o) => (
              <li key={o._id}>
                <Link
                  to={`/account/orders/${o._id}`}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-x-6 gap-y-3 rounded-2xl border border-brand-dark/10 bg-white p-4 hover:border-brand-gold/40 hover:shadow-md transition-all">
                  <div className="min-w-[110px]">
                    <p className="text-xs text-gray-500">{t('order')}</p>
                    <p className="font-bold text-brand-dark font-mono">{shortId(o._id)}</p>
                  </div>
                  <div className="min-w-[110px]">
                    <p className="text-xs text-gray-500">{t('date')}</p>
                    <p className="text-sm font-medium">{formatDate(o.createdAt, locale)}</p>
                  </div>
                  <div className="min-w-[100px]">
                    <p className="text-xs text-gray-500">{t('total')}</p>
                    <p className="text-sm font-bold">{formatPrice(o.totalOrderPrice, locale)}</p>
                  </div>
                  <div className="min-w-[70px]">
                    <p className="text-xs text-gray-500">{t('method')}</p>
                    <p className="text-sm font-medium">{o.paymentMethodType === 'card' ? t('card') : t('cash')}</p>
                  </div>
                  <div className="flex-1">
                    <OrderBadges order={o} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180 hidden sm:block" />
                </Link>
              </li>
            ))}
          </ul>
          <Pager
            className="mt-8"
            page={page}
            hasNext={!!data.pagination.next}
            hasPrev={page > 1}
            labels={{ prev: tCommon('prev'), next: tCommon('next'), page: tCommon('page'), of: tCommon('of') }}
            onChange={(p) => setSp({ page: String(p) })}
          />
        </>
      )}
    </AccountCard>
  );
}

export function OrderDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const t = useTranslations('Orders');
  const tCart = useTranslations('Cart');
  const locale = useLocale();
  const location = useLocation();
  const placed = (location.state as { placed?: boolean } | null)?.placed;
  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: ({ signal }) => ordersApi.get(id, signal)
  });

  if (isLoading) return <Skeleton className="h-[500px] rounded-3xl" />;
  if (isError || !order) {
    const nf = isApiError(error) && (error.status === 404 || error.status === 400);
    return nf ? (
      <EmptyState title={t('notFound')} action={<ButtonLink to="/account/orders">{t('back')}</ButtonLink>} />
    ) : (
      <ErrorState error={error} onRetry={() => refetch()} />
    );
  }

  const itemsTotal = order.cartItems.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = Math.max(0, itemsTotal + order.taxPrice + order.shippingPrice - order.totalOrderPrice);

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-brand-gold">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('back')}
      </Link>

      {placed && (
        <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 text-emerald-800 p-5" role="status">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-semibold">{t('success')}</p>
        </div>
      )}

      <AccountCard
        title={`${t('order')} ${shortId(order._id)}`}
        description={t('placedOn', { date: formatDate(order.createdAt, locale, true) })}
        action={<OrderBadges order={order} />}>
        <div className="grid sm:grid-cols-3 gap-4 mb-8 text-sm">
          <div className="rounded-2xl bg-brand-cream/70 p-4">
            <p className="text-xs text-gray-500 mb-1">{t('method')}</p>
            <p className="font-semibold">{order.paymentMethodType === 'card' ? t('card') : t('cash')}</p>
          </div>
          <div className="rounded-2xl bg-brand-cream/70 p-4">
            <p className="text-xs text-gray-500 mb-1">{t('payment')}</p>
            <p className="font-semibold">{order.isPaid ? t('paidOn', { date: formatDate(order.paidAt, locale) }) : t('unpaid')}</p>
          </div>
          <div className="rounded-2xl bg-brand-cream/70 p-4">
            <p className="text-xs text-gray-500 mb-1">{t('delivery')}</p>
            <p className="font-semibold">{order.isDelivered ? t('deliveredOn', { date: formatDate(order.deliveredAt, locale) }) : t('pending')}</p>
          </div>
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-3">{t('items')}</h3>
        <ul className="divide-y divide-brand-dark/5 mb-8">
          {order.cartItems.map((item, i) => (
            <li key={item._id ?? i} className="py-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-cream shrink-0">
                {item.product?.imageCover && <img src={item.product.imageCover} alt="" loading="lazy" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                {item.product ? (
                  <Link to={`/products/${item.product._id}`} className="font-semibold text-brand-dark hover:text-brand-goldLight line-clamp-2">
                    {productTitle(item.product, locale)}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-400">{tCart('unavailable')}</span>
                )}
                <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-1">
                  {item.color && (
                    <span className="inline-flex items-center gap-1.5">
                      <ColorDot color={item.color} className="w-3 h-3" />
                      {item.color}
                    </span>
                  )}
                  <span>
                    {t('qty')}: {item.quantity}
                  </span>
                  <span>{formatPrice(item.price, locale)}</span>
                </div>
              </div>
              <span className="font-bold tabular-nums">{formatPrice(item.price * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-3">{t('shippingAddress')}</h3>
            {order.shippingAddress?.details ? <AddressSummary address={order.shippingAddress} /> : <p className="text-sm text-gray-500">—</p>}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-3">{t('summary')}</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">{t('subtotal')}</dt>
                <dd>{formatPrice(itemsTotal, locale)}</dd>
              </div>
              {discount > 0.009 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>{tCart('discount')}</dt>
                  <dd>−{formatPrice(discount, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">{t('tax')}</dt>
                <dd>{formatPrice(order.taxPrice, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">{t('shipping')}</dt>
                <dd>{formatPrice(order.shippingPrice, locale)}</dd>
              </div>
              <div className="flex justify-between text-lg font-bold text-brand-dark border-t border-brand-dark/10 pt-2">
                <dt>{t('total')}</dt>
                <dd>{formatPrice(order.totalOrderPrice, locale)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </AccountCard>
    </div>
  );
}
