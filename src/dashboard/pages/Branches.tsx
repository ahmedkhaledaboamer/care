import { lazy, Suspense, useState, type FormEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, MapPin, Plus, Star } from 'lucide-react';
import { branchesApi, type BranchInput } from '../../api/services';
import type { Branch } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { Badge, EmptyState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { directionsUrl, type LatLng } from '../../components/map/geo';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf, pick } from '../../lib/localize';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, PageHeader, Panel, SearchInput, TableFooter, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

const LocationPicker = lazy(() => import('../../components/map/BranchMap').then((m) => ({ default: m.LocationPicker })));
const BranchMap = lazy(() => import('../../components/map/BranchMap'));

const KEY = ['public', 'branches'] as const;

const fieldsOf = (b?: Branch) => ({
  name: b?.name ?? '',
  nameAr: b?.nameAr ?? '',
  city: b?.city ?? '',
  cityAr: b?.cityAr ?? '',
  address: b?.address ?? '',
  addressAr: b?.addressAr ?? '',
  phone: b?.phone ?? '',
  workingHours: b?.workingHours ?? '10:00 AM - 11:00 PM',
  lat: b ? String(b.location.lat) : '',
  lng: b ? String(b.location.lng) : ''
});

function BranchModal({ branch, onClose }: { branch: Branch | 'new'; onClose: () => void }) {
  const t = useTranslations('Dash');
  const isNew = branch === 'new';
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const form = useForm(fieldsOf(isNew ? undefined : branch));
  const [isMain, setIsMain] = useState(!isNew && !!branch.isMain);
  const [active, setActive] = useState(isNew || branch.active !== false);
  const [error, setError] = useState<string | null>(null);

  const lat = Number(form.values.lat);
  const lng = Number(form.values.lng);
  const point: LatLng | null = form.values.lat !== '' && form.values.lng !== '' && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  const setPoint = (p: LatLng) => {
    form.setValues((v) => ({ ...v, lat: String(p.lat), lng: String(p.lng) }));
    form.setErrors((e) => ({ ...e, lat: undefined, lng: undefined }));
  };

  const save = useMutation({
    mutationFn: () => {
      assertCan(user, 'catalog:write');
      const v = form.values;
      const body: BranchInput = {
        name: v.name.trim(),
        nameAr: v.nameAr.trim(),
        city: v.city.trim(),
        cityAr: v.cityAr.trim(),
        address: v.address.trim(),
        addressAr: v.addressAr.trim(),
        phone: v.phone.trim(),
        workingHours: v.workingHours.trim(),
        location: { lat, lng },
        isMain,
        active
      };
      return isNew ? branchesApi.create(body) : branchesApi.update(branch._id, body);
    },
    onSuccess: () => {
      toast.success(isNew ? t('branches.created') : t('branches.updated'));
      qc.invalidateQueries({ queryKey: KEY });
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e, ['name', 'city', 'address', 'phone']))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = form.values;
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = t('branches.errName');
    if (!v.city.trim()) errs.city = t('branches.errCity');
    if (!v.address.trim()) errs.address = t('branches.errAddress');
    if (!point || lat < -90 || lat > 90) errs.lat = t('branches.errLat');
    if (!point || lng < -180 || lng > 180) errs.lng = t('branches.errLng');
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      size="lg"
      title={isNew ? t('branches.newTitle') : t('branches.editTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="branch-form" loading={save.isPending}>
            {isNew ? t('common.create') : t('common.save')}
          </Button>
        </>
      }>
      <form id="branch-form" onSubmit={submit} noValidate className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label={t('common.nameEn')} required maxLength={60} dir="ltr" {...form.bind('name')} />
          <Input label={t('common.nameAr')} dir="rtl" maxLength={60} {...form.bind('nameAr')} />
          <Input label={t('branches.cityEn')} required dir="ltr" {...form.bind('city')} />
          <Input label={t('branches.cityAr')} dir="rtl" {...form.bind('cityAr')} />
          <Input label={t('branches.addressEn')} required dir="ltr" {...form.bind('address')} />
          <Input label={t('branches.addressAr')} dir="rtl" {...form.bind('addressAr')} />
          <Input label={t('branches.phone')} type="tel" dir="ltr" {...form.bind('phone')} />
          <Input label={t('branches.hours')} dir="ltr" {...form.bind('workingHours')} />
        </div>

        <div>
          <p className="text-sm font-medium text-brand-dark mb-1.5">
            {t('branches.location')} <span className="text-red-500">*</span>
          </p>
          <Suspense fallback={<Skeleton className="h-72 rounded-2xl" />}>
            <LocationPicker value={point} onChange={setPoint} />
          </Suspense>
          <p className="mt-1.5 text-xs text-slate-500">{t('branches.locationHint')}</p>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Input label={t('branches.lat')} type="number" step="any" dir="ltr" {...form.bind('lat')} />
            <Input label={t('branches.lng')} type="number" step="any" dir="ltr" {...form.bind('lng')} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 cursor-pointer text-sm">
            <input type="checkbox" checked={isMain} onChange={(e) => setIsMain(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            {t('branches.main')}
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 cursor-pointer text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
            {t('branches.showOnMap')}
          </label>
        </div>
      </form>
    </Modal>
  );
}

export function BranchesPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams();
  const [editing, setEditing] = useState<Branch | 'new' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const params = { keyword: list.keyword || undefined, page: list.page, limit: 15, sort: '-isMain,name', all: true };
  const q = useQuery({
    queryKey: [...KEY, 'dash', params],
    queryFn: ({ signal }) => branchesApi.list(params, signal),
    placeholderData: keepPreviousData
  });
  const del = useDeleteFlow<Branch>({
    noun: t('branches.noun'),
    remove: (b) => branchesApi.remove(b._id),
    invalidate: [KEY],
    describe: (b) => nameOf(b, locale)
  });

  const columns: Column<Branch>[] = [
    {
      key: 'name',
      header: t('branches.branch'),
      cell: (b) => (
        <button type="button" onClick={() => setSelected(b._id)} className="flex items-center gap-3 text-start">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${b.isMain ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700'}`}>
            {b.isMain ? <Star className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          </span>
          <span>
            <span className="block font-semibold text-slate-900">{nameOf(b, locale)}</span>
            {b.nameAr && <span className="block text-xs text-slate-400">{locale === 'ar' ? b.name : b.nameAr}</span>}
          </span>
        </button>
      )
    },
    { key: 'city', header: t('branches.city'), cell: (b) => pick(b.city, b.cityAr, locale) },
    { key: 'phone', header: t('branches.phone'), cell: (b) => <span dir="ltr">{b.phone || '—'}</span> },
    {
      key: 'status',
      header: t('common.status'),
      cell: (b) => (b.active === false ? <Badge tone="gray">{t('branches.hidden')}</Badge> : <Badge tone="green">{t('branches.visible')}</Badge>)
    },
    {
      key: 'map',
      header: t('branches.map'),
      cell: (b) => (
        <a href={directionsUrl(b)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-sky-700 hover:underline">
          {t('branches.open')} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )
    }
  ];

  const rows = q.data?.data ?? [];

  return (
    <>
      <PageHeader
        title={t('branches.title')}
        description={t('branches.description')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> {t('branches.add')}
          </Button>
        }
      />
      {rows.length > 0 && (
        <Panel className="p-3 mb-6">
          <Suspense fallback={<Skeleton className="h-80 rounded-[2rem]" />}>
            <BranchMap branches={rows} selectedId={selected} onSelect={setSelected} className="h-80" />
          </Suspense>
        </Panel>
      )}
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('branches.searchPh')} />
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(b) => b._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          empty={<EmptyState icon={<MapPin className="w-7 h-7" />} title={list.hasFilters ? t('branches.noMatch') : t('branches.empty')} />}
          actions={(b) => (
            <>
              <EditAction onClick={() => setEditing(b)} />
              {del.allowed && <DeleteAction onClick={() => del.request(b)} />}
            </>
          )}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {editing && <BranchModal branch={editing} onClose={() => setEditing(null)} />}
      {del.dialog}
    </>
  );
}
