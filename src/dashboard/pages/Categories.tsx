import { useState, type FormEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shapes } from 'lucide-react';
import { toFormData } from '../../api/crud';
import { categoriesApi } from '../../api/services';
import type { Category } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { formatDate } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf } from '../../lib/localize';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { pickedFromUrl, SingleImagePicker, type PickedImage } from '../../components/ui/ImagePicker';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { useForm } from '../../hooks/useForm';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, PageHeader, Panel, SearchInput, TableFooter, Thumb, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

const KEY = ['public', 'categories'] as const;

function CategoryModal({ category, onClose }: { category: Category | 'new'; onClose: () => void }) {
  const t = useTranslations('Dash');
  const isNew = category === 'new';
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const form = useForm({ name: isNew ? '' : category.name, nameAr: isNew ? '' : category.nameAr ?? '' });
  const [image, setImage] = useState<PickedImage | null>(!isNew && category.image ? pickedFromUrl(category.image) : null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      assertCan(user, 'catalog:write');
      // The image is only sent when a new one was picked — the current one is kept otherwise.
      const fd = toFormData({ name: form.values.name.trim(), nameAr: form.values.nameAr.trim(), image: image?.file });
      if (!isNew && !form.values.nameAr.trim()) fd.append('nameAr', '');
      return isNew ? categoriesApi.create(fd) : categoriesApi.update(category._id, fd);
    },
    onSuccess: () => {
      toast.success(isNew ? t('categories.created') : t('categories.updated'));
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['public', 'category'] });
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e, ['name', 'nameAr', 'image']))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = form.values.name.trim();
    const errs: Record<string, string> = {};
    if (name.length < 3 || name.length > 32) errs.name = t('common.nameLength', { min: 3, max: 32 });
    if (!image) errs.image = t('common.imageRequired');
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      title={isNew ? t('categories.newTitle') : t('categories.editTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="category-form" loading={save.isPending}>
            {isNew ? t('common.create') : t('common.save')}
          </Button>
        </>
      }>
      <form id="category-form" onSubmit={submit} noValidate className="space-y-5">
        {error && <p className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
        <Input label={t('common.nameEn')} required maxLength={32} dir="ltr" {...form.bind('name')} />
        <Input label={t('common.nameAr')} dir="rtl" maxLength={32} {...form.bind('nameAr')} hint={t('common.nameArHint')} />
        <SingleImagePicker
          label={t('common.image')}
          required
          value={image}
          onChange={(v) => {
            setImage(v);
            form.setErrors((e) => ({ ...e, image: undefined }));
          }}
          error={form.errors.image}
          onError={toast.error}
          hint={isNew ? t('categories.imageHintNew') : t('categories.imageHintEdit')}
        />
      </form>
    </Modal>
  );
}

export function CategoriesPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const params = { keyword: list.keyword || undefined, page: list.page, limit: 15, sort: 'name' };
  const q = useQuery({
    queryKey: [...KEY, 'dash', params],
    queryFn: ({ signal }) => categoriesApi.list(params, signal),
    placeholderData: keepPreviousData
  });
  const del = useDeleteFlow<Category>({
    noun: t('categories.noun'),
    remove: (c) => categoriesApi.remove(c._id),
    invalidate: [KEY],
    describe: (c) => nameOf(c, locale)
  });

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: t('categories.category'),
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Thumb src={c.image} size="w-11 h-11" />
          <div>
            <p className="font-semibold text-slate-900">{nameOf(c, locale)}</p>
            <p className="text-xs text-slate-400">{locale === 'ar' ? c.name : c.nameAr ? <span dir="rtl">{c.nameAr}</span> : c.slug}</p>
          </div>
        </div>
      )
    },
    { key: 'created', header: t('common.created'), cell: (c) => formatDate(c.createdAt, locale) },
    { key: 'updated', header: t('common.updated'), cell: (c) => formatDate(c.updatedAt, locale) }
  ];

  return (
    <>
      <PageHeader
        title={t('categories.title')}
        description={t('categories.description')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> {t('categories.add')}
          </Button>
        }
      />
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('categories.searchPh')} />
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(c) => c._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          empty={<EmptyState icon={<Shapes className="w-7 h-7" />} title={list.hasFilters ? t('categories.noMatch') : t('categories.empty')} />}
          actions={(c) => (
            <>
              <EditAction onClick={() => setEditing(c)} />
              {del.allowed && <DeleteAction onClick={() => del.request(c)} />}
            </>
          )}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} />}
      {del.dialog}
    </>
  );
}
