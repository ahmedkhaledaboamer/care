import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Package, Shapes, ShoppingCart, Tag, Truck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brandsApi, categoriesApi, ordersApi, productsApi, usersApi } from '../../api/services';
import type { ListResponse, Order } from '../../api/types';
import type { QueryParams } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatPrice, shortId } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { productTitle } from '../../lib/localize';
import { Skeleton } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/States';
import { PageHeader, Panel, StatCard, Thumb } from '../components/Kit';
import { DeliveredBadge, PaidBadge } from './Orders';

/**
 * With no filters and `limit=1`, `pagination.numberOfPage` equals the total
 * document count (it's computed on the whole collection) — a cheap count
 * without a dedicated analytics endpoint.
 */
const countOf = (fn: (p?: QueryParams, s?: AbortSignal) => Promise<ListResponse<unknown>>) => ({ signal }: { signal: AbortSignal }) =>
  fn({ limit: 1, field: '_id' }, signal).then((r) => r.pagination.numberOfPage ?? r.results);

const ORDER_SAMPLE = 500;

function useCount(key: string, fn: Parameters<typeof countOf>[0]) {
  return useQuery({ queryKey: ['dash', 'count', key], queryFn: countOf(fn), staleTime: 60 * 1000 });
}

function RevenueChart({ orders }: { orders: Order[] }) {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const [hover, setHover] = useState<number | null>(null);
  const months = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en', { month: 'short' }), year: d.getFullYear(), total: 0, count: 0 };
    });
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (b) {
        b.total += Number(o.totalOrderPrice) || 0;
        b.count += 1;
      }
    }
    return buckets;
  }, [orders, locale]);
  const max = Math.max(1, ...months.map((m) => m.total));
  const ticks = [0, 0.5, 1].map((f) => f * max);

  return (
    <div>
      <div className="relative h-56 flex">
        {/* recessive y-axis */}
        <div className="flex flex-col justify-between text-[11px] text-slate-400 pe-3 py-0.5 tabular-nums w-16 text-end shrink-0">
          {[...ticks].reverse().map((t) => (
            <span key={t}>{t >= 1000 ? `${(t / 1000).toFixed(t >= 10000 ? 0 : 1)}k` : Math.round(t)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-slate-100" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {months.map((m, i) => (
              <div
                key={m.key}
                className="relative flex-1 h-full flex items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={t('overview.barLabel', { month: `${m.label} ${m.year}`, value: formatPrice(m.total, locale), n: m.count })}>
                <div
                  className="w-full max-w-[44px] rounded-t transition-opacity"
                  style={{ height: `${(m.total / max) * 100}%`, minHeight: m.total > 0 ? 2 : 0, background: '#70A426', opacity: hover === null || hover === i ? 1 : 0.45 }}
                />
                {hover === i && (
                  <div className="absolute bottom-full mb-2 z-10 whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs px-2.5 py-1.5 shadow-lg pointer-events-none">
                    <p className="font-semibold">
                      {m.label} {m.year}
                    </p>
                    <p className="tabular-nums">{formatPrice(m.total, locale)}</p>
                    <p className="text-slate-300">{t('overview.nOrders', { n: m.count })}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex ps-16 gap-[2px] mt-2">
        {months.map((m) => (
          <span key={m.key} className="flex-1 text-center text-xs text-slate-500">
            {m.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{t('overview.chartTitle')}</caption>
        <thead>
          <tr>
            <th>{t('overview.month')}</th>
            <th>{t('overview.orderValue')}</th>
            <th>{t('overview.orders')}</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.key}>
              <td>
                {m.label} {m.year}
              </td>
              <td>{formatPrice(m.total, locale)}</td>
              <td>{m.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Overview() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const { user } = useAuth();
  const products = useCount('products', productsApi.list);
  const usersCount = useCount('users', usersApi.list);
  const categories = useCount('categories', categoriesApi.list);
  const brands = useCount('brands', brandsApi.list);

  // Order stats are computed from the most recent orders (no analytics endpoint exists).
  const orders = useQuery({
    queryKey: ['orders', 'dash', 'stats'],
    queryFn: ({ signal }) =>
      ordersApi.list({ limit: ORDER_SAMPLE, sort: '-createdAt', field: 'totalOrderPrice,isPaid,isDelivered,createdAt,paymentMethodType,cartItems,user' }, signal),
    staleTime: 60 * 1000
  });
  const topSelling = useQuery({
    queryKey: ['public', 'products', 'dash', 'top'],
    queryFn: ({ signal }) => productsApi.list({ sort: '-sold', limit: 5, field: 'title,titleAr,imageCover,sold,price,quantity' }, signal),
    staleTime: 60 * 1000
  });
  const lowStock = useQuery({
    queryKey: ['public', 'products', 'dash', 'low'],
    queryFn: ({ signal }) => productsApi.list({ 'quantity[lte]': 5, sort: 'quantity', limit: 5, field: 'title,titleAr,imageCover,quantity' }, signal),
    staleTime: 60 * 1000
  });

  const list = useMemo(() => orders.data?.data ?? [], [orders.data]);
  const stats = useMemo(() => {
    const paid = list.filter((o) => o.isPaid);
    return {
      revenue: paid.reduce((n, o) => n + (Number(o.totalOrderPrice) || 0), 0),
      gross: list.reduce((n, o) => n + (Number(o.totalOrderPrice) || 0), 0),
      paid: paid.length,
      delivered: list.filter((o) => o.isDelivered).length,
      pending: list.filter((o) => !o.isDelivered).length,
      unpaid: list.filter((o) => !o.isPaid).length
    };
  }, [list]);
  const totalOrders = orders.data ? (orders.data.pagination.next ? `${ORDER_SAMPLE}+` : String(orders.data.results)) : '…';
  const sampled = !!orders.data?.pagination.next;
  const n = (q: { data?: number; isLoading: boolean }) => (q.isLoading ? '…' : (q.data ?? 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en'));

  return (
    <>
      <PageHeader title={t('overview.welcome', { name: user?.name?.split(' ')[0] ?? '' })} description={t('overview.subtitle')} />

      {orders.isError && <ErrorState error={orders.error} onRetry={() => orders.refetch()} className="mb-6" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard label={t('overview.revenue')} value={orders.isLoading ? '…' : formatPrice(stats.revenue, locale)} icon={<DollarSign className="w-5 h-5" />} hint={t('overview.totalValue', { value: formatPrice(stats.gross, locale) })} />
        <StatCard label={t('overview.orders')} value={totalOrders} icon={<ShoppingCart className="w-5 h-5" />} tone="blue" hint={sampled ? t('overview.statsFrom', { n: ORDER_SAMPLE }) : undefined} />
        <StatCard label={t('overview.products')} value={n(products)} icon={<Package className="w-5 h-5" />} tone="navy" />
        <StatCard label={t('overview.users')} value={n(usersCount)} icon={<Users className="w-5 h-5" />} tone="navy" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label={t('overview.pendingDelivery')} value={orders.isLoading ? '…' : stats.pending} icon={<Clock className="w-5 h-5" />} tone="amber" />
        <StatCard label={t('overview.unpaid')} value={orders.isLoading ? '…' : stats.unpaid} icon={<AlertTriangle className="w-5 h-5" />} tone="amber" />
        <StatCard label={t('overview.paid')} value={orders.isLoading ? '…' : stats.paid} icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatCard label={t('overview.delivered')} value={orders.isLoading ? '…' : stats.delivered} icon={<Truck className="w-5 h-5" />} />
        <StatCard label={t('overview.categories')} value={n(categories)} icon={<Shapes className="w-5 h-5" />} tone="blue" />
        <StatCard label={t('overview.brands')} value={n(brands)} icon={<Tag className="w-5 h-5" />} tone="blue" />
      </div>

      <div className="grid xl:grid-cols-[1.6fr_1fr] gap-6 mb-6">
        <Panel className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">{t('overview.chartTitle')}</h2>
              <p className="text-xs text-slate-500">{t('overview.chartSubtitle')}</p>
            </div>
          </div>
          {orders.isLoading ? <Skeleton className="h-56" /> : <RevenueChart orders={list} />}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-semibold text-slate-900">{t('overview.recentOrders')}</h2>
            <Link to="/dashboard/orders" className="text-xs font-semibold text-brand-gold hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          {orders.isLoading ? (
            <div className="p-5 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-slate-500">{t('overview.noOrders')}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.slice(0, 6).map((o) => (
                <li key={o._id}>
                  <Link to={`/dashboard/orders/${o._id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        <span dir="ltr" className="font-mono">{shortId(o._id)}</span> · {o.user?.name ?? t('common.customer')}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(o.createdAt, locale)}</p>
                    </div>
                    <div className="text-end shrink-0 space-y-1">
                      <p className="text-sm font-semibold tabular-nums">{formatPrice(o.totalOrderPrice, locale)}</p>
                      <div className="flex gap-1 justify-end">
                        <PaidBadge order={o} />
                        <DeliveredBadge order={o} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel>
          <h2 className="font-semibold text-slate-900 px-5 pt-5 pb-3">{t('overview.bestSellers')}</h2>
          <ul className="divide-y divide-slate-100">
            {(topSelling.data?.data ?? []).map((p) => (
              <li key={p._id}>
                <Link to={`/dashboard/products/${p._id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                  <Thumb src={p.imageCover} />
                  <span className="flex-1 min-w-0 text-sm text-slate-900 truncate">{productTitle(p, locale)}</span>
                  <span className="text-sm text-slate-500 tabular-nums">{t('overview.nSold', { n: p.sold ?? 0 })}</span>
                </Link>
              </li>
            ))}
            {topSelling.data?.data.length === 0 && <li className="px-5 pb-6 text-sm text-slate-500">{t('overview.noProducts')}</li>}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-semibold text-slate-900 px-5 pt-5 pb-3">{t('overview.lowStock')}</h2>
          <ul className="divide-y divide-slate-100">
            {(lowStock.data?.data ?? []).map((p) => (
              <li key={p._id}>
                <Link to={`/dashboard/products/${p._id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                  <Thumb src={p.imageCover} />
                  <span className="flex-1 min-w-0 text-sm text-slate-900 truncate">{productTitle(p, locale)}</span>
                  <span className={`text-sm font-semibold tabular-nums ${p.quantity <= 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.quantity <= 0 ? t('overview.outOfStock') : t('overview.nLeft', { n: p.quantity })}</span>
                </Link>
              </li>
            ))}
            {lowStock.data?.data.length === 0 && <li className="px-5 pb-6 text-sm text-slate-500">{t('overview.wellStocked')}</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
