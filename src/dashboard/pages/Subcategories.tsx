import { useEffect, useState, type FormEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus } from 'lucide-react';
import { subcategoriesApi } from '../../api/services';
import type { SubCategory } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { useCategories } from '../../hooks/useCatalog';
import { useForm } from '../../hooks/useForm';
import { formatDate } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf } from '../../lib/localize';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { Badge, EmptyState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, FilterSelect, PageHeader, Panel, SearchInput, TableFooter, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

const KEY = ['public', 'subcategories'] as const;

function SubcategoryModal({ sub, defaultCategory, onClose }: { sub: SubCategory | 'new'; defaultCategory: string; onClose: () => void }) {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const isNew = sub === 'new';
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const categories = useCategories();
  // Fresh copy via GET /subcategories/:id when editing.
  const detail = useQuery({
    queryKey: [...KEY, 'detail', isNew ? '' : sub._id],
    queryFn: ({ signal }) => subcategoriesApi.get((sub as SubCategory)._id, signal),
    enabled: !isNew
  });
  const current = detail.data ?? (isNew ? null : sub);
  const form = useForm({ name: current?.name ?? '', nameAr: current?.nameAr ?? '', category: current?.category ?? defaultCategory });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (detail.data) form.reset({ name: detail.data.name, nameAr: detail.data.nameAr ?? '', category: detail.data.category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () => {
      assertCan(user, 'catalog:write');
      const name = form.values.name.trim();
      const nameAr = form.values.nameAr.trim();
      if (!isNew) return subcategoriesApi.update(sub._id, { name, nameAr, category: form.values.category || undefined });
      // Inside a category filter use the nested route (singular `subcategory`).
      return form.values.category === defaultCategory && defaultCategory
        ? subcategoriesApi.createInCategory(defaultCategory, name, nameAr || undefined)
        : subcategoriesApi.create({ name, nameAr: nameAr || undefined, category: form.values.category });
    },
    onSuccess: () => {
      toast.success(isNew ? t('subcategories.created') : t('subcategories.updated'));
      qc.invalidateQueries({ queryKey: KEY });
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};
    const name = form.values.name.trim();
    if (name.length < 2 || name.length > 32) errs.name = t('common.nameLength', { min: 2, max: 32 });
    if (isNew && !form.values.category) errs.category = t('common.chooseCategory');
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      title={isNew ? t('subcategories.newTitle') : t('subcategories.editTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="sub-form" loading={save.isPending}>
            {isNew ? t('common.create') : t('common.save')}
          </Button>
        </>
      }>
      {!isNew && detail.isLoading ? (
        <div className="py-8 flex justify-center">
          <Spinner className="w-6 h-6 text-brand-gold" />
        </div>
      ) : (
        <form id="sub-form" onSubmit={submit} noValidate className="space-y-5" key={current?._id ?? 'new'}>
          {error && <p className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
          <Input label={t('common.nameEn')} required maxLength={32} dir="ltr" {...form.bind('name')} />
          <Input label={t('common.nameAr')} dir="rtl" maxLength={32} {...form.bind('nameAr')} hint={t('common.nameArHint')} />
          <Select label={t('subcategories.parent')} required {...form.bind('category')}>
            <option value="">{t('common.selectCategory')}</option>
            {categories.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {nameOf(c, locale)}
              </option>
            ))}
          </Select>
        </form>
      )}
    </Modal>
  );
}

export function SubcategoriesPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams(['category'] as const);
  const categories = useCategories();
  const [editing, setEditing] = useState<SubCategory | 'new' | null>(null);
  const categoryName = (id: string) => nameOf(categories.data?.find((c) => c._id === id), locale) || '—';
  const cat = list.filters.category;
  const params = { keyword: list.keyword || undefined, page: list.page, limit: 15, sort: 'name' };
  const q = useQuery({
    queryKey: [...KEY, 'dash', cat, params],
    // Filtered by category → nested GET /categories/:id/subcategory.
    queryFn: ({ signal }) => (cat ? subcategoriesApi.listByCategory(cat, params, signal) : subcategoriesApi.list(params, signal)),
    placeholderData: keepPreviousData
  });
  const del = useDeleteFlow<SubCategory>({
    noun: t('subcategories.noun'),
    remove: (s) => subcategoriesApi.remove(s._id),
    invalidate: [KEY],
    describe: (s) => nameOf(s, locale)
  });

  const columns: Column<SubCategory>[] = [
    {
      key: 'name',
      header: t('common.name'),
      cell: (s) => (
        <div>
          <p className="font-semibold text-slate-900">{nameOf(s, locale)}</p>
          {s.nameAr && <p className="text-xs text-slate-400">{locale === 'ar' ? s.name : s.nameAr}</p>}
        </div>
      )
    },
    { key: 'category', header: t('common.category'), cell: (s) => <Badge tone="blue">{categoryName(s.category)}</Badge> },
    { key: 'slug', header: t('common.slug'), cell: (s) => <span className="text-slate-400">{s.slug}</span> },
    { key: 'created', header: t('common.created'), cell: (s) => formatDate(s.createdAt, locale) }
  ];

  return (
    <>
      <PageHeader
        title={t('subcategories.title')}
        description={t('subcategories.description')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> {t('subcategories.add')}
          </Button>
        }
      />
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('subcategories.searchPh')} />
          <FilterSelect label={t('common.category')} value={cat} onChange={(v) => list.setFilter('category', v)}>
            <option value="">{t('common.allCategories')}</option>
            {categories.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {nameOf(c, locale)}
              </option>
            ))}
          </FilterSelect>
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(s) => s._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          empty={<EmptyState icon={<FolderTree className="w-7 h-7" />} title={list.hasFilters ? t('subcategories.noMatch') : t('subcategories.empty')} />}
          actions={(s) => (
            <>
              <EditAction onClick={() => setEditing(s)} />
              {del.allowed && <DeleteAction onClick={() => del.request(s)} />}
            </>
          )}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {editing && <SubcategoryModal sub={editing} defaultCategory={cat} onClose={() => setEditing(null)} />}
      {del.dialog}
    </>
  );
}
