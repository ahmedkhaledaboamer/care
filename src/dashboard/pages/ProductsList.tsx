import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Package, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/services';
import type { Product } from '../../api/types';
import { useBrands, useCategories } from '../../hooks/useCatalog';
import { formatPrice } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf, productTitle } from '../../lib/localize';
import { ButtonLink } from '../../components/ui/Button';
import { Badge, EmptyState, Stars } from '../../components/ui/States';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, FilterSelect, PageHeader, Panel, SearchInput, TableFooter, Thumb, Toolbar } from '../components/Kit';
import { useListParams } from '../useListParams';
import { useDeleteFlow } from '../useDeleteFlow';

const STOCK: Record<string, Record<string, number>> = {
  out: { 'quantity[lte]': 0 },
  low: { 'quantity[gt]': 0, 'quantity[lte]': 5 },
  in: { 'quantity[gt]': 0 }
};

export const dashProductsKey = ['public', 'products'] as const;

export function ProductsList() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const navigate = useNavigate();
  const list = useListParams(['category', 'brand', 'stock', 'sort'] as const);
  const categories = useCategories();
  const brands = useBrands();
  const brandName = (id?: string | null) => nameOf(brands.data?.find((b) => b._id === id), locale) || '—';

  const params = {
    keyword: list.keyword || undefined,
    category: list.filters.category || undefined,
    brand: list.filters.brand || undefined,
    ...(STOCK[list.filters.stock] ?? {}),
    sort: list.filters.sort || '-createdAt',
    page: list.page,
    limit: 15
  };
  const q = useQuery({
    queryKey: [...dashProductsKey, 'dash', params],
    queryFn: ({ signal }) => productsApi.list(params, signal),
    placeholderData: keepPreviousData
  });

  const del = useDeleteFlow<Product>({
    noun: t('products.noun'),
    remove: (p) => productsApi.remove(p._id),
    invalidate: [dashProductsKey, ['public', 'product'], ['public', 'product-summary']],
    describe: (p) => productTitle(p, locale)
  });

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: t('products.product'),
      cell: (p) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <Thumb src={p.imageCover} size="w-12 h-12" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate max-w-[280px]">{productTitle(p, locale)}</p>
            {p.priceAfterDiscount ? <p className="text-xs text-rose-600">{t('products.onSale')}</p> : <p className="text-xs text-slate-400 truncate max-w-[280px]">{p.slug}</p>}
          </div>
        </div>
      ),
      hideOnMobile: true
    },
    { key: 'category', header: t('common.category'), cell: (p) => nameOf(p.category, locale) || '—' },
    { key: 'brand', header: t('common.brand'), cell: (p) => brandName(p.brand) },
    {
      key: 'price',
      header: t('products.price'),
      align: 'end',
      cell: (p) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-slate-900">{formatPrice(p.priceAfterDiscount || p.price, locale)}</span>
          {p.priceAfterDiscount ? <span className="block text-xs text-slate-400 line-through">{formatPrice(p.price, locale)}</span> : null}
        </div>
      )
    },
    {
      key: 'stock',
      header: t('products.stock'),
      align: 'center',
      cell: (p) => <Badge tone={p.quantity <= 0 ? 'red' : p.quantity <= 5 ? 'amber' : 'green'}>{p.quantity <= 0 ? t('products.outOfStock') : p.quantity}</Badge>
    },
    { key: 'sold', header: t('products.sold'), align: 'center', cell: (p) => <span className="tabular-nums">{p.sold ?? 0}</span> },
    {
      key: 'rating',
      header: t('products.rating'),
      cell: (p) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Stars value={p.ratingsAverage ?? 0} size="w-3.5 h-3.5" />
          <span className="text-xs text-slate-400">({p.ratingsQuantity ?? 0})</span>
        </span>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
        actions={
          <ButtonLink to="/dashboard/products/new" size="sm">
            <Plus className="w-4 h-4" /> {t('products.add')}
          </ButtonLink>
        }
      />
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('products.searchPh')} />
          <FilterSelect label={t('common.category')} value={list.filters.category} onChange={(v) => list.setFilter('category', v)}>
            <option value="">{t('common.allCategories')}</option>
            {categories.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {nameOf(c, locale)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label={t('common.brand')} value={list.filters.brand} onChange={(v) => list.setFilter('brand', v)}>
            <option value="">{t('products.allBrands')}</option>
            {brands.data?.map((b) => (
              <option key={b._id} value={b._id}>
                {nameOf(b, locale)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label={t('products.stock')} value={list.filters.stock} onChange={(v) => list.setFilter('stock', v)}>
            <option value="">{t('products.anyStock')}</option>
            <option value="in">{t('products.inStock')}</option>
            <option value="low">{t('products.lowStock')}</option>
            <option value="out">{t('products.outOfStock')}</option>
          </FilterSelect>
          <FilterSelect label={t('products.sort')} value={list.filters.sort} onChange={(v) => list.setFilter('sort', v)}>
            <option value="">{t('products.newest')}</option>
            <option value="-sold">{t('products.bestSelling')}</option>
            <option value="price">{t('products.priceAsc')}</option>
            <option value="-price">{t('products.priceDesc')}</option>
            <option value="quantity">{t('products.stockAsc')}</option>
            <option value="-ratingsAverage">{t('products.topRated')}</option>
            <option value="title">{t('products.titleAz')}</option>
          </FilterSelect>
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(p) => p._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          onRowClick={(p) => navigate(`/dashboard/products/${p._id}/edit`)}
          mobileTitle={(p) => (
            <div className="flex items-center gap-3">
              <Thumb src={p.imageCover} size="w-12 h-12" />
              <p className="font-semibold text-slate-900 line-clamp-2">{productTitle(p, locale)}</p>
            </div>
          )}
          empty={
            <EmptyState
              icon={<Package className="w-7 h-7" />}
              title={list.hasFilters ? t('products.noMatch') : t('products.empty')}
              description={list.hasFilters ? t('products.noMatchDesc') : t('products.emptyDesc')}
              action={!list.hasFilters && <ButtonLink to="/dashboard/products/new">{t('products.add')}</ButtonLink>}
            />
          }
          actions={(p) => (
            <>
              <EditAction onClick={() => navigate(`/dashboard/products/${p._id}/edit`)} />
              {del.allowed && <DeleteAction onClick={() => del.request(p)} />}
            </>
          )}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} info={q.data ? t('common.onThisPage', { n: q.data.results }) : undefined} />
      </Panel>
      {del.dialog}
    </>
  );
}
