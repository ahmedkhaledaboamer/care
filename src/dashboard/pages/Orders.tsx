import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Mail, MapPin, Phone, ShoppingCart, Truck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { errorMessage, isApiError } from '../../api/client';
import { ordersApi } from '../../api/services';
import type { Order } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan, can } from '../../auth/permissions';
import { formatDate, formatPrice, shortId, userImageUrl, initials } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { productTitle } from '../../lib/localize';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { FilterSelect, PageHeader, Panel, TableFooter, Thumb, Toolbar } from '../components/Kit';
import { useListParams } from '../useListParams';

const KEY = ['orders'] as const;

export function PaidBadge({ order }: { order: Order }) {
  const t = useTranslations('Dash');
  return <Badge tone={order.isPaid ? 'green' : 'amber'}>{order.isPaid ? t('orders.paid') : t('orders.unpaid')}</Badge>;
}
export function DeliveredBadge({ order }: { order: Order }) {
  const t = useTranslations('Dash');
  return <Badge tone={order.isDelivered ? 'green' : 'blue'}>{order.isDelivered ? t('orders.delivered') : t('orders.processing')}</Badge>;
}
export function MethodLabel({ order }: { order: Order }) {
  const t = useTranslations('Dash');
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      {order.paymentMethodType === 'card' ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
      {order.paymentMethodType === 'card' ? t('orders.card') : t('orders.cash')}
    </span>
  );
}

export function OrdersList() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const navigate = useNavigate();
  const list = useListParams(['paid', 'delivered', 'method'] as const);
  const params = {
    isPaid: list.filters.paid || undefined,
    isDelivered: list.filters.delivered || undefined,
    paymentMethodType: list.filters.method || undefined,
    page: list.page,
    limit: 15,
    sort: '-createdAt'
  };
  const q = useQuery({
    queryKey: [...KEY, 'dash', params],
    queryFn: ({ signal }) => ordersApi.list(params, signal),
    placeholderData: keepPreviousData
  });

  const columns: Column<Order>[] = [
    { key: 'id', header: t('orders.order'), cell: (o) => <span dir="ltr" className="font-mono font-semibold text-slate-900">{shortId(o._id)}</span> },
    {
      key: 'customer',
      header: t('orders.customer'),
      cell: (o) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate max-w-[180px]">{o.user?.name ?? t('common.deletedUser')}</p>
          <p className="text-xs text-slate-400 truncate max-w-[180px]">{o.user?.email}</p>
        </div>
      )
    },
    {
      key: 'items',
      header: t('orders.products'),
      cell: (o) => (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {o.cartItems.slice(0, 3).map((i, idx) => (
              <Thumb key={idx} src={i.product?.imageCover} size="w-8 h-8" rounded="rounded-full ring-2 ring-white" />
            ))}
          </div>
          <span className="text-xs text-slate-500 ms-1">{t('orders.nItems', { n: o.cartItems.reduce((n, i) => n + i.quantity, 0) })}</span>
        </div>
      )
    },
    { key: 'total', header: t('orders.total'), align: 'end', cell: (o) => <span className="font-semibold text-slate-900 whitespace-nowrap">{formatPrice(o.totalOrderPrice, locale)}</span> },
    { key: 'method', header: t('orders.payment'), cell: (o) => <MethodLabel order={o} /> },
    { key: 'paid', header: t('orders.paid'), cell: (o) => <PaidBadge order={o} /> },
    { key: 'delivered', header: t('orders.delivery'), cell: (o) => <DeliveredBadge order={o} /> },
    { key: 'date', header: t('orders.placed'), cell: (o) => <span className="whitespace-nowrap">{formatDate(o.createdAt, locale, true)}</span> }
  ];

  return (
    <>
      <PageHeader title={t('orders.title')} description={t('orders.description')} />
      <Panel>
        <Toolbar>
          <FilterSelect label={t('orders.paymentStatus')} value={list.filters.paid} onChange={(v) => list.setFilter('paid', v)}>
            <option value="">{t('orders.anyPayment')}</option>
            <option value="true">{t('orders.paid')}</option>
            <option value="false">{t('orders.unpaid')}</option>
          </FilterSelect>
          <FilterSelect label={t('orders.deliveryStatus')} value={list.filters.delivered} onChange={(v) => list.setFilter('delivered', v)}>
            <option value="">{t('orders.anyDelivery')}</option>
            <option value="true">{t('orders.delivered')}</option>
            <option value="false">{t('orders.processing')}</option>
          </FilterSelect>
          <FilterSelect label={t('orders.method')} value={list.filters.method} onChange={(v) => list.setFilter('method', v)}>
            <option value="">{t('orders.anyMethod')}</option>
            <option value="cash">{t('orders.cash')}</option>
            <option value="card">{t('orders.card')}</option>
          </FilterSelect>
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(o) => o._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          onRowClick={(o) => navigate(`/dashboard/orders/${o._id}`)}
          empty={<EmptyState icon={<ShoppingCart className="w-7 h-7" />} title={list.hasFilters ? t('orders.noMatch') : t('orders.empty')} />}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
    </>
  );
}

export function OrderDetail() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const { id = '' } = useParams<{ id: string }>();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [confirm, setConfirm] = useState<'pay' | 'deliver' | null>(null);
  const q = useQuery({ queryKey: [...KEY, 'detail', id], queryFn: ({ signal }) => ordersApi.get(id, signal) });

  const action = useMutation({
    mutationFn: (kind: 'pay' | 'deliver') => {
      assertCan(user, 'orders:manage');
      return kind === 'pay' ? ordersApi.markPaid(id) : ordersApi.markDelivered(id);
    },
    onSuccess: (order, kind) => {
      toast.success(kind === 'pay' ? t('orders.markedPaid') : t('orders.markedDelivered'));
      // The action response isn't populated — merge flags into the cached order.
      qc.setQueryData<Order>([...KEY, 'detail', id], (prev) => (prev ? { ...prev, isPaid: order.isPaid, paidAt: order.paidAt, isDelivered: order.isDelivered, deliveredAt: order.deliveredAt } : prev));
      qc.invalidateQueries({ queryKey: KEY });
      setConfirm(null);
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  if (q.isLoading) return <PageLoader />;
  if (q.isError || !q.data) {
    const nf = isApiError(q.error) && (q.error.status === 404 || q.error.status === 400);
    return nf ? <EmptyState title={t('orders.notFound')} action={<ButtonLink to="/dashboard/orders">{t('orders.backToOrders')}</ButtonLink>} /> : <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  }

  const o = q.data;
  const manage = can(user, 'orders:manage');
  const itemsTotal = o.cartItems.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = Math.max(0, itemsTotal + o.taxPrice + o.shippingPrice - o.totalOrderPrice);
  const avatar = o.user ? userImageUrl(o.user) : null;

  return (
    <>
      <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('orders.title')}
      </Link>
      <PageHeader
        title={t('orders.orderTitle', { id: shortId(o._id) })}
        description={t('orders.placedOn', { date: formatDate(o.createdAt, locale, true) })}
        actions={
          manage && (
            <>
              <Button size="sm" variant={o.isPaid ? 'secondary' : 'primary'} disabled={o.isPaid} onClick={() => setConfirm('pay')}>
                <CheckCircle2 className="w-4 h-4" /> {o.isPaid ? t('orders.paid') : t('orders.markPaid')}
              </Button>
              <Button size="sm" variant={o.isDelivered ? 'secondary' : 'dark'} disabled={o.isDelivered} onClick={() => setConfirm('deliver')}>
                <Truck className="w-4 h-4" /> {o.isDelivered ? t('orders.delivered') : t('orders.markDelivered')}
              </Button>
            </>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Panel className="p-4">
              <p className="text-xs text-slate-500 mb-1.5">{t('orders.payment')}</p>
              <PaidBadge order={o} />
              <p className="text-xs text-slate-400 mt-2">{o.isPaid ? formatDate(o.paidAt, locale, true) : t('orders.awaitingPayment')}</p>
            </Panel>
            <Panel className="p-4">
              <p className="text-xs text-slate-500 mb-1.5">{t('orders.delivery')}</p>
              <DeliveredBadge order={o} />
              <p className="text-xs text-slate-400 mt-2">{o.isDelivered ? formatDate(o.deliveredAt, locale, true) : t('orders.notDelivered')}</p>
            </Panel>
            <Panel className="p-4">
              <p className="text-xs text-slate-500 mb-1.5">{t('orders.methodLabel')}</p>
              <MethodLabel order={o} />
            </Panel>
          </div>

          <Panel>
            <h2 className="font-semibold text-slate-900 px-5 pt-5 pb-3">{t('orders.items')}</h2>
            <ul className="divide-y divide-slate-100">
              {o.cartItems.map((i, idx) => (
                <li key={i._id ?? idx} className="px-5 py-4 flex items-center gap-4">
                  <Thumb src={i.product?.imageCover} size="w-14 h-14" rounded="rounded-xl" />
                  <div className="flex-1 min-w-0">
                    {i.product ? (
                      <Link to={`/dashboard/products/${i.product._id}/edit`} className="font-medium text-slate-900 hover:underline line-clamp-1">
                        {productTitle(i.product, locale)}
                      </Link>
                    ) : (
                      <span className="text-slate-400">{t('common.deletedProduct')}</span>
                    )}
                    <p className="text-xs text-slate-500">
                      {i.color ? `${t('orders.color', { color: i.color })} · ` : ''}
                      {i.quantity} × {formatPrice(i.price, locale)}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatPrice(i.price * i.quantity, locale)}</span>
                </li>
              ))}
            </ul>
            <dl className="border-t border-slate-100 px-5 py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{t('orders.subtotal')}</dt>
                <dd>{formatPrice(itemsTotal, locale)}</dd>
              </div>
              {discount > 0.009 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>{t('orders.couponDiscount')}</dt>
                  <dd>−{formatPrice(discount, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">{t('orders.tax')}</dt>
                <dd>{formatPrice(o.taxPrice, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{t('orders.shipping')}</dt>
                <dd>{formatPrice(o.shippingPrice, locale)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <dt>{t('orders.total')}</dt>
                <dd>{formatPrice(o.totalOrderPrice, locale)}</dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-5">
            <h2 className="font-semibold text-slate-900 mb-4">{t('orders.customer')}</h2>
            {o.user ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">{initials(o.user.name)}</span>
                  )}
                  <p className="font-semibold text-slate-900">{o.user.name}</p>
                </div>
                <p className="flex items-center gap-2 text-slate-600 break-all">
                  <Mail className="w-4 h-4 shrink-0" /> <a href={`mailto:${o.user.email}`} className="hover:underline">{o.user.email}</a>
                </p>
                {o.user.phone && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 shrink-0" /> <span dir="ltr">{o.user.phone}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t('orders.noUser')}</p>
            )}
          </Panel>
          <Panel className="p-5">
            <h2 className="font-semibold text-slate-900 mb-4">{t('orders.shippingAddress')}</h2>
            {o.shippingAddress?.details ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {o.shippingAddress.details}, {o.shippingAddress.city} {o.shippingAddress.postalCode}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" /> <span dir="ltr">{o.shippingAddress.phone}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t('orders.noAddress')}</p>
            )}
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        tone="primary"
        title={confirm === 'pay' ? t('orders.confirmPaidTitle') : t('orders.confirmDeliveredTitle')}
        message={confirm === 'pay' ? t('orders.confirmPaidMsg') : t('orders.confirmDeliveredMsg')}
        confirmLabel={confirm === 'pay' ? t('orders.markPaid') : t('orders.markDelivered')}
        loading={action.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && action.mutate(confirm)}
      />
    </>
  );
}
