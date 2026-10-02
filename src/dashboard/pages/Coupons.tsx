import { useEffect, useState, type FormEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Ticket } from 'lucide-react';
import { couponsApi } from '../../api/services';
import type { Coupon } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { useForm } from '../../hooks/useForm';
import { formatDate } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { Badge, EmptyState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, FilterSelect, PageHeader, Panel, SearchInput, TableFooter, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

const KEY = ['coupons'] as const;
const toDateInput = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const isExpired = (c: Coupon) => new Date(c.expire).getTime() <= Date.now();

function CouponModal({ coupon, onClose }: { coupon: Coupon | 'new'; onClose: () => void }) {
  const t = useTranslations('Dash');
  const isNew = coupon === 'new';
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const detail = useQuery({
    queryKey: [...KEY, 'detail', isNew ? '' : coupon._id],
    queryFn: ({ signal }) => couponsApi.get((coupon as Coupon)._id, signal),
    enabled: !isNew
  });
  const form = useForm({
    name: isNew ? '' : coupon.name,
    expire: isNew ? '' : toDateInput(coupon.expire),
    discount: isNew ? '' : String(coupon.discount)
  });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const c = detail.data;
    if (c) form.reset({ name: c.name, expire: toDateInput(c.expire), discount: String(c.discount) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () => {
      assertCan(user, 'coupons:write');
      const body = { name: form.values.name.trim().toUpperCase(), expire: form.values.expire, discount: Number(form.values.discount) };
      return isNew ? couponsApi.create(body) : couponsApi.update(coupon._id, body);
    },
    onSuccess: () => {
      toast.success(isNew ? t('coupons.created') : t('coupons.updated'));
      qc.invalidateQueries({ queryKey: KEY });
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = form.values;
    const errs: Record<string, string> = {};
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(v.name.trim())) errs.name = t('coupons.errCode');
    if (!v.expire) errs.expire = t('coupons.errExpire');
    else if (isNew && new Date(v.expire).getTime() < new Date().setHours(0, 0, 0, 0)) errs.expire = t('coupons.errExpireFuture');
    const d = Number(v.discount);
    if (!(d > 0 && d <= 100)) errs.discount = t('coupons.errDiscount');
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      title={isNew ? t('coupons.newTitle') : t('coupons.editTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="coupon-form" loading={save.isPending}>
            {isNew ? t('common.create') : t('common.save')}
          </Button>
        </>
      }>
      {!isNew && detail.isLoading ? (
        <div className="py-8 flex justify-center">
          <Spinner className="w-6 h-6 text-brand-gold" />
        </div>
      ) : (
        <form id="coupon-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
          <Input label={t('coupons.code')} required dir="ltr" {...form.bind('name')} className="uppercase" wrapperClassName="sm:col-span-2" placeholder="SUMMER20" />
          <Input label={t('coupons.discountPct')} required type="number" min={1} max={100} {...form.bind('discount')} />
          <Input label={t('coupons.expiresOn')} required type="date" {...form.bind('expire')} />
        </form>
      )}
    </Modal>
  );
}

export function CouponsPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams(['status'] as const);
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);
  const [now] = useState(() => new Date().toISOString());
  const params = {
    keyword: list.keyword || undefined,
    ...(list.filters.status === 'active' ? { 'expire[gt]': now } : list.filters.status === 'expired' ? { 'expire[lte]': now } : {}),
    page: list.page,
    limit: 15,
    sort: '-createdAt'
  };
  const q = useQuery({
    queryKey: [...KEY, 'list', params],
    queryFn: ({ signal }) => couponsApi.list(params, signal),
    placeholderData: keepPreviousData
  });
  const del = useDeleteFlow<Coupon>({
    noun: t('coupons.noun'),
    remove: (c) => couponsApi.remove(c._id),
    invalidate: [KEY],
    describe: (c) => c.name
  });

  const columns: Column<Coupon>[] = [
    { key: 'name', header: t('coupons.code'), cell: (c) => <span dir="ltr" className="font-mono font-semibold text-slate-900">{c.name}</span> },
    { key: 'discount', header: t('coupons.discount'), cell: (c) => <span className="font-semibold">{c.discount}%</span> },
    { key: 'expire', header: t('coupons.expires'), cell: (c) => formatDate(c.expire, locale) },
    { key: 'status', header: t('common.status'), cell: (c) => (isExpired(c) ? <Badge tone="gray">{t('coupons.expired')}</Badge> : <Badge tone="green">{t('coupons.active')}</Badge>) },
    { key: 'created', header: t('common.created'), cell: (c) => formatDate(c.createdAt, locale) }
  ];

  return (
    <>
      <PageHeader
        title={t('coupons.title')}
        description={t('coupons.description')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> {t('coupons.add')}
          </Button>
        }
      />
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('coupons.searchPh')} />
          <FilterSelect label={t('common.status')} value={list.filters.status} onChange={(v) => list.setFilter('status', v)}>
            <option value="">{t('coupons.all')}</option>
            <option value="active">{t('coupons.active')}</option>
            <option value="expired">{t('coupons.expired')}</option>
          </FilterSelect>
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(c) => c._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          empty={<EmptyState icon={<Ticket className="w-7 h-7" />} title={list.hasFilters ? t('coupons.noMatch') : t('coupons.empty')} />}
          actions={(c) => (
            <>
              <EditAction onClick={() => setEditing(c)} />
              {del.allowed && <DeleteAction onClick={() => del.request(c)} />}
            </>
          )}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {editing && <CouponModal coupon={editing} onClose={() => setEditing(null)} />}
      {del.dialog}
    </>
  );
}
