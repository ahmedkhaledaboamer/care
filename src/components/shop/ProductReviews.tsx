import { useEffect, useState, type FormEvent } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { MessageSquareText, Pencil, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { reviewsApi } from '../../api/services';
import type { Product, Review } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { can } from '../../auth/permissions';
import { useLocale, useTranslations } from '../../lib/i18n';
import { formatDate, initials } from '../../lib/format';
import { qk } from '../../hooks/useCatalog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Field';
import { ConfirmDialog } from '../ui/Modal';
import { Skeleton } from '../ui/Spinner';
import { EmptyState, ErrorState, StarInput, Stars } from '../ui/States';
import { useToast } from '../ui/Toast';

const PAGE = 10;
export const reviewKeys = {
  product: (productId: string) => ['public', 'reviews', productId] as const,
  mine: (productId: string, userId: string) => ['reviews', 'mine', productId, userId] as const,
  byUser: (userId: string) => ['reviews', 'by-user', userId] as const
};

/** Refetch the product now and again shortly after — its rating is updated asynchronously server-side. */
export function refreshProduct(qc: QueryClient, productId: string) {
  const run = () => {
    qc.invalidateQueries({ queryKey: qk.product(productId) });
    qc.invalidateQueries({ queryKey: ['public', 'products'] });
  };
  run();
  window.setTimeout(run, 1200);
}

const reviewerName = (r: Review, fallback: string) => (typeof r.user === 'object' && r.user?.name) || fallback;
const reviewerId = (r: Review) => (typeof r.user === 'object' ? r.user?._id : r.user);

function ReviewForm({ productId, existing, onDone }: { productId: string; existing?: Review; onDone: () => void }) {
  const t = useTranslations('Reviews');
  const tCommon = useTranslations('Common');
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [ratings, setRatings] = useState(existing?.ratings ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const body = { ratings, ...(title.trim() ? { title: title.trim() } : {}) };
      return existing ? reviewsApi.update(existing._id, body) : reviewsApi.createForProduct(productId, body);
    },
    onSuccess: () => {
      toast.success(existing ? t('updated') : t('created'));
      qc.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.mine(productId, user!._id) });
      qc.invalidateQueries({ queryKey: reviewKeys.byUser(user!._id) });
      // ratingsAverage / ratingsQuantity are recalculated server-side.
      refreshProduct(qc, productId);
      onDone();
    },
    onError: (e) => setError(errorMessage(e))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (ratings < 1 || ratings > 5) return setError(t('ratingRequired'));
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl p-5 sm:p-6 border border-brand-dark/5 space-y-4">
      <div>
        <span className="block text-sm font-medium text-brand-dark mb-2">
          {t('ratingLabel')} <span className="text-red-500">*</span>
        </span>
        <StarInput value={ratings} onChange={(v) => { setRatings(v); setError(null); }} />
      </div>
      <Textarea label={`${t('titleLabel')} (${tCommon('optional')})`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('titlePh')} maxLength={500} />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" loading={mutation.isPending}>
          {existing ? t('update') : t('submit')}
        </Button>
        {existing && (
          <Button variant="secondary" onClick={onDone} disabled={mutation.isPending}>
            {tCommon('cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}

function ReviewItem({ review, canDelete, canEdit, onEdit, onDelete }: { review: Review; canDelete: boolean; canEdit: boolean; onEdit: () => void; onDelete: () => void }) {
  const t = useTranslations('Reviews');
  const tUi = useTranslations('Ui');
  const locale = useLocale();
  const name = reviewerName(review, t('anonymous'));
  return (
    <li className="py-5 flex gap-4">
      <span className="shrink-0 w-10 h-10 rounded-full bg-brand-peach text-brand-dark text-sm font-bold flex items-center justify-center">{initials(name)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-brand-dark">{name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Stars value={review.ratings} size="w-3.5 h-3.5" />
              <span>{formatDate(review.createdAt, locale)}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {canEdit && (
              <button onClick={onEdit} className="p-2 rounded-full text-gray-400 hover:text-brand-dark hover:bg-brand-cream" aria-label={tUi('editReview')}>
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={onDelete} className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label={tUi('deleteReview')}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {review.title && <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line break-words">{review.title}</p>}
      </div>
    </li>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const t = useTranslations('Reviews');
  const tUi = useTranslations('Ui');
  const tCommon = useTranslations('Common');
  const toast = useToast();
  const qc = useQueryClient();
  const location = useLocation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const isShopper = can(user, 'shop');
  const isModerator = can(user, 'reviews:moderate');

  const list = useInfiniteQuery({
    queryKey: reviewKeys.product(product._id),
    queryFn: ({ pageParam, signal }) => reviewsApi.listForProduct(product._id, { page: pageParam, limit: PAGE, sort: '-createdAt' }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.pagination.next ?? undefined
  });

  // The current user's own review (filter by `user` works on any list endpoint).
  const mine = useQuery({
    queryKey: reviewKeys.mine(product._id, user?._id ?? ''),
    queryFn: ({ signal }) => reviewsApi.listForProduct(product._id, { user: user!._id, limit: 1 }, signal).then((r) => r.data[0] ?? null),
    enabled: isShopper
  });

  useEffect(() => setEditing(false), [product._id]);

  const del = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      toast.success(t('deleted'));
      setToDelete(null);
      qc.invalidateQueries({ queryKey: reviewKeys.product(product._id) });
      if (user) {
        qc.invalidateQueries({ queryKey: reviewKeys.mine(product._id, user._id) });
        qc.invalidateQueries({ queryKey: reviewKeys.byUser(user._id) });
      }
      refreshProduct(qc, product._id);
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  const reviews = list.data?.pages.flatMap((p) => p.data) ?? [];
  const myReview = mine.data ?? null;
  // The backend recalculates ratingsAverage asynchronously after responding,
  // so when every review is loaded compute the summary from them directly.
  const complete = list.isSuccess && !list.hasNextPage;
  const total = complete ? reviews.length : product.ratingsQuantity ?? reviews.length;
  const average = complete ? (reviews.length ? reviews.reduce((n, r) => n + r.ratings, 0) / reviews.length : 0) : product.ratingsAverage ?? 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => Math.round(r.ratings) === s).length }));
  const maxN = Math.max(1, ...dist.map((d) => d.n));

  return (
    <section id="reviews" className="mt-16 lg:mt-24">
      <h2 className="font-serif text-3xl font-bold text-brand-dark mb-8">{t('title')}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8 lg:gap-12">
        <div className="space-y-6">
          <div className="bg-white/80 rounded-3xl p-6 border border-brand-dark/5">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-bold text-brand-dark">{average.toFixed(1)}</span>
              <Stars value={average} className="mb-2" />
            </div>
            <p className="text-sm text-gray-500 mb-5">{t('basedOn', { n: total })}</p>
            <ul className="space-y-2" aria-label={tUi('ratingDistribution')}>
              {dist.map(({ s, n }) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-gray-600">{s}</span>
                  <span className="flex-1 h-2 rounded-full bg-brand-dark/5 overflow-hidden">
                    <span className="block h-full bg-amber-400 rounded-full" style={{ width: `${(n / maxN) * 100}%` }} />
                  </span>
                  <span className="w-6 text-end text-gray-500 tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </div>

          {!user ? (
            <Link
              to="/login"
              state={{ from: `${location.pathname}#reviews` }}
              className="block text-center rounded-full py-3 font-semibold text-sm bg-white border border-brand-dark/10 text-brand-dark hover:border-brand-gold/50">
              {t('loginToReview')}
            </Link>
          ) : !isShopper ? (
            <p className="text-sm text-gray-500 bg-white/60 rounded-2xl p-4">{t('staffCannot')}</p>
          ) : mine.isLoading ? (
            <Skeleton className="h-40 rounded-3xl" />
          ) : myReview && !editing ? (
            <div className="bg-brand-pink/60 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark">{t('yours')}</p>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(true)} className="p-2 rounded-full hover:bg-white/70" aria-label={tUi('editReview')}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setToDelete(myReview)} className="p-2 rounded-full hover:bg-white/70 text-red-600" aria-label={tUi('deleteReview')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Stars value={myReview.ratings} />
              {myReview.title && <p className="mt-2 text-sm text-gray-700 break-words">{myReview.title}</p>}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">{myReview ? t('update') : t('write')}</h3>
              <ReviewForm productId={product._id} existing={myReview ?? undefined} onDone={() => setEditing(false)} />
            </div>
          )}
        </div>

        <div>
          {list.isLoading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : list.isError ? (
            <ErrorState error={list.error} onRetry={() => list.refetch()} />
          ) : reviews.length === 0 ? (
            <EmptyState icon={<MessageSquareText className="w-7 h-7" />} title={t('none')} description={t('noneDesc')} className="bg-white/50 rounded-3xl" />
          ) : (
            <>
              <ul className="divide-y divide-brand-dark/5">
                {reviews.map((r) => {
                  const own = !!user && reviewerId(r) === user._id;
                  return (
                    <ReviewItem
                      key={r._id}
                      review={r}
                      canEdit={own && isShopper}
                      canDelete={own || isModerator}
                      onEdit={() => {
                        setEditing(true);
                        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onDelete={() => setToDelete(r)}
                    />
                  );
                })}
              </ul>
              {list.hasNextPage && (
                <div className="text-center mt-6">
                  <Button variant="secondary" onClick={() => list.fetchNextPage()} loading={list.isFetchingNextPage}>
                    {t('loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={t('deleteConfirm')}
        message={t('deleteDesc')}
        confirmLabel={tCommon('delete')}
        loading={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete._id)}
      />
    </section>
  );
}
