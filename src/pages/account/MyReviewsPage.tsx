import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { reviewsApi } from '../../api/services';
import type { Review } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { useLocale, useTranslations } from '../../lib/i18n';
import { formatDate } from '../../lib/format';
import { productTitle } from '../../lib/localize';
import { useProductSummary } from '../../hooks/useCatalog';
import { refreshProduct, reviewKeys } from '../../components/shop/ProductReviews';
import { ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState, Pager, Stars } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { AccountCard } from './AccountLayout';

function ReviewRow({ review, onDelete }: { review: Review; onDelete: () => void }) {
  const locale = useLocale();
  const tUi = useTranslations('Ui');
  const { data: product, isLoading } = useProductSummary(review.product);
  return (
    <li className="flex gap-4 py-5">
      <Link to={`/products/${review.product}#reviews`} className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-cream shrink-0">
        {isLoading ? <Skeleton className="w-full h-full" /> : product && <img src={product.imageCover} alt="" loading="lazy" className="w-full h-full object-cover" />}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${review.product}#reviews`} className="font-semibold text-brand-dark hover:text-brand-goldLight line-clamp-1">
            {product ? productTitle(product, locale) : isLoading ? '…' : '—'}
          </Link>
          <button onClick={onDelete} className="p-2 -m-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0" aria-label={tUi('deleteReview')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <Stars value={review.ratings} size="w-3.5 h-3.5" />
          {formatDate(review.createdAt, locale)}
        </div>
        {review.title && <p className="text-sm text-gray-700 mt-2 break-words">{review.title}</p>}
      </div>
    </li>
  );
}

export function MyReviewsPage() {
  const t = useTranslations('Account');
  const tR = useTranslations('Reviews');
  const tW = useTranslations('Wishlist');
  const tCommon = useTranslations('Common');
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Review | null>(null);

  // Generic `?user=<id>` field filter on GET /reviews.
  const q = useQuery({
    queryKey: [...reviewKeys.byUser(user!._id), page],
    queryFn: ({ signal }) => reviewsApi.list({ user: user!._id, page, limit: 10, sort: '-createdAt' }, signal),
    placeholderData: keepPreviousData
  });

  const del = useMutation({
    mutationFn: (r: Review) => reviewsApi.remove(r._id),
    onSuccess: (_d, r) => {
      toast.success(tR('deleted'));
      setToDelete(null);
      qc.invalidateQueries({ queryKey: reviewKeys.byUser(user!._id) });
      qc.invalidateQueries({ queryKey: reviewKeys.product(r.product) });
      qc.invalidateQueries({ queryKey: reviewKeys.mine(r.product, user!._id) });
      refreshProduct(qc, r.product);
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  return (
    <AccountCard title={t('reviews')}>
      {q.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : !q.data?.data.length ? (
        <EmptyState icon={<MessageSquareText className="w-7 h-7" />} title={t('noReviews')} action={<ButtonLink to="/products">{tW('browse')}</ButtonLink>} />
      ) : (
        <>
          <ul className="divide-y divide-brand-dark/5 -mt-5">
            {q.data.data.map((r) => (
              <ReviewRow key={r._id} review={r} onDelete={() => setToDelete(r)} />
            ))}
          </ul>
          <Pager
            className="mt-6"
            page={page}
            hasNext={!!q.data.pagination.next}
            hasPrev={page > 1}
            labels={{ prev: tCommon('prev'), next: tCommon('next'), page: tCommon('page'), of: tCommon('of') }}
            onChange={setPage}
          />
        </>
      )}
      <ConfirmDialog
        open={!!toDelete}
        title={tR('deleteConfirm')}
        message={tR('deleteDesc')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete)}
      />
    </AccountCard>
  );
}
