import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reviewsApi } from '../../api/services';
import type { Review } from '../../api/types';
import { useProductSummary } from '../../hooks/useCatalog';
import { formatDate } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { productTitle } from '../../lib/localize';
import { EmptyState, Stars } from '../../components/ui/States';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, FilterSelect, PageHeader, Panel, TableFooter, Thumb, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

function ProductCell({ id }: { id: string }) {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const { data, isLoading } = useProductSummary(id);
  return (
    <Link to={`/products/${id}#reviews`} target="_blank" className="flex items-center gap-2 min-w-0 hover:underline">
      <Thumb src={data?.imageCover} size="w-8 h-8" />
      <span className="truncate max-w-[200px] text-slate-700">{data ? productTitle(data, locale) : isLoading ? '…' : t('common.deletedProduct')}</span>
    </Link>
  );
}

export function ReviewsPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams(['ratings'] as const);
  const params = { ratings: list.filters.ratings || undefined, page: list.page, limit: 15, sort: '-createdAt' };
  const q = useQuery({
    queryKey: ['public', 'reviews', 'dash', params],
    queryFn: ({ signal }) => reviewsApi.list(params, signal),
    placeholderData: keepPreviousData
  });
  // Reviews can be removed by admins and managers (guide §10).
  const del = useDeleteFlow<Review>({
    noun: t('reviews.noun'),
    action: 'reviews:moderate',
    remove: (r) => reviewsApi.remove(r._id),
    invalidate: [['public', 'reviews'], ['public', 'product']],
    describe: (r) => t('reviews.describe', { name: (typeof r.user === 'object' ? r.user?.name : undefined) ?? t('common.customer') })
  });

  const columns: Column<Review>[] = [
    { key: 'product', header: t('reviews.product'), cell: (r) => <ProductCell id={r.product} /> },
    { key: 'user', header: t('reviews.customer'), cell: (r) => (typeof r.user === 'object' ? r.user?.name : '—') ?? '—' },
    { key: 'rating', header: t('reviews.rating'), cell: (r) => <Stars value={r.ratings} size="w-3.5 h-3.5" /> },
    { key: 'title', header: t('reviews.review'), cell: (r) => <span className="line-clamp-2 max-w-[360px] text-slate-600">{r.title || <em className="text-slate-400">{t('reviews.noText')}</em>}</span> },
    { key: 'date', header: t('reviews.date'), cell: (r) => formatDate(r.createdAt, locale) }
  ];

  return (
    <>
      <PageHeader title={t('reviews.title')} description={t('reviews.description')} />
      <Panel>
        <Toolbar>
          <FilterSelect label={t('reviews.rating')} value={list.filters.ratings} onChange={(v) => list.setFilter('ratings', v)}>
            <option value="">{t('reviews.allRatings')}</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n > 1 ? t('reviews.nStars', { n }) : t('reviews.oneStar')}
              </option>
            ))}
          </FilterSelect>
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(r) => r._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          empty={<EmptyState icon={<MessageSquareText className="w-7 h-7" />} title={t('reviews.empty')} />}
          actions={(r) => (del.allowed ? <DeleteAction onClick={() => del.request(r)} /> : null)}
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {del.dialog}
    </>
  );
}
