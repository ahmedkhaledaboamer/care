import { useState, type FormEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag } from 'lucide-react';
import { toFormData } from '../../api/crud';
import { brandsApi } from '../../api/services';
import type { Brand } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { useForm } from '../../hooks/useForm';
import { formatDate } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf } from '../../lib/localize';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { pickedFromUrl, SingleImagePicker, type PickedImage } from '../../components/ui/ImagePicker';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, PageHeader, Panel, SearchInput, TableFooter, Thumb, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

const KEY = ['public', 'brands'] as const;

function BrandModal({ brand, onClose }: { brand: Brand | 'new'; onClose: () => void }) {
  const t = useTranslations('Dash');
  const isNew = brand === 'new';
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const form = useForm({ name: isNew ? '' : brand.name, nameAr: isNew ? '' : brand.nameAr ?? '' });
  const [image, setImage] = useState<PickedImage | null>(!isNew && brand.image ? pickedFromUrl(brand.image) : null);
  const [error, setError] = useState<string | null>(null);

  // Multipart: the logo is optional and only sent when a new file was picked.
  const save = useMutation({
    mutationFn: () => {
      assertCan(user, 'catalog:write');
      const fd = toFormData({ name: form.values.name.trim(), nameAr: form.values.nameAr.trim(), image: image?.file });
      if (!isNew && !form.values.nameAr.trim()) fd.append('nameAr', '');
      return isNew ? brandsApi.create(fd) : brandsApi.update(brand._id, fd);
    },
    onSuccess: () => {
      toast.success(isNew ? t('brands.created') : t('brands.updated'));
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['public', 'brand'] });
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e, ['name', 'nameAr', 'image']))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = form.values.name.trim();
    if (name.length < 3 || name.length > 32) return form.setErrors({ name: t('common.nameLength', { min: 3, max: 32 }) });
    save.mutate();
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      title={isNew ? t('brands.newTitle') : t('brands.editTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="brand-form" loading={save.isPending}>
            {isNew ? t('common.create') : t('common.save')}
          </Button>
        </>
      }>
      <form id="brand-form" onSubmit={submit} noValidate className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
        <Input label={t('common.nameEn')} required maxLength={32} dir="ltr" {...form.bind('name')} />
        <Input label={t('common.nameAr')} dir="rtl" maxLength={32} {...form.bind('nameAr')} hint={t('common.nameArHint')} />
        <SingleImagePicker label={t('common.logo')} value={image} onChange={setImage} onError={toast.error} hint={t('brands.logoHint')} />
      </form>
    </Modal>
  );
}

export function BrandsPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams();
  const [editing, setEditing] = useState<Brand | 'new' | null>(null);
  const params = { keyword: list.keyword || undefined, page: list.page, limit: 15, sort: 'name' };
  const q = useQuery({
    queryKey: [...KEY, 'dash', params],
    queryFn: ({ signal }) => brandsApi.list(params, signal),
    placeholderData: keepPreviousData
  });
  const del = useDeleteFlow<Brand>({
    noun: t('brands.noun'),
    remove: (b) => brandsApi.remove(b._id),
    invalidate: [KEY],
    describe: (b) => nameOf(b, locale)
  });

  const columns: Column<Brand>[] = [
    {
      key: 'name',
      header: t('brands.brand'),
      cell: (b) => (
        <div className="flex items-center gap-3">
          <Thumb src={b.image} size="w-10 h-10" />
          <div>
            <p className="font-semibold text-slate-900">{nameOf(b, locale)}</p>
            {b.nameAr && <p className="text-xs text-slate-400">{locale === 'ar' ? b.name : b.nameAr}</p>}
          </div>
        </div>
      )
    },
    { key: 'slug', header: t('common.slug'), cell: (b) => <span className="text-slate-400">{b.slug}</span> },
    { key: 'created', header: t('common.created'), cell: (b) => formatDate(b.createdAt, locale) }
  ];

  return (
    <>
      <PageHeader
        title={t('brands.title')}
        description={t('brands.description')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> {t('brands.add')}
          </Button>
        }
      />
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('brands.searchPh')} />
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(b) => b._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          empty={<EmptyState icon={<Tag className="w-7 h-7" />} title={list.hasFilters ? t('brands.noMatch') : t('brands.empty')} />}
          actions={(b) => (
            <>
              <EditAction onClick={() => setEditing(b)} />
              {del.allowed && <DeleteAction onClick={() => del.request(b)} />}
            </>
          )}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {editing && <BrandModal brand={editing} onClose={() => setEditing(null)} />}
      {del.dialog}
    </>
  );
}
