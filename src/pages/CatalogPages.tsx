import { useQuery } from '@tanstack/react-query';
import { FolderX } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { isApiError } from '../api/client';
import { categoriesApi } from '../api/services';
import { useLocale, useTranslations } from '../lib/i18n';
import { nameOf } from '../lib/localize';
import { useBrands, useCategories, useProducts, useSubcategories } from '../hooks/useCatalog';
import { PageHero } from '../components/shop/PageHero';
import { BrandTile, CategoryTile } from '../components/shop/HomeCatalog';
import { ProductGrid } from '../components/shop/ProductCard';
import { ButtonLink } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState, Pager } from '../components/ui/States';

export function CategoriesPage() {
  const t = useTranslations('Catalog');
  const tNav = useTranslations('Nav');
  const { data, isLoading, isError, error, refetch } = useCategories();
  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: tNav('categories') }]} title={t('categoriesTitle')} description={t('categoriesDesc')} compact />
      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-10">
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !isLoading && !data?.length ? (
          <EmptyState title={t('noCategories')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {isLoading ? Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />) : data!.map((c) => <CategoryTile key={c._id} category={c} />)}
          </div>
        )}
      </section>
    </main>
  );
}

export function CategoryPage() {
  const { id = '' } = useParams<{ id: string }>();
  const t = useTranslations('Catalog');
  const tNav = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const tList = useTranslations('Listing');
  const locale = useLocale();
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;

  const category = useQuery({
    queryKey: ['public', 'category', id],
    queryFn: ({ signal }) => categoriesApi.get(id, signal),
    enabled: !!id
  });
  const subs = useSubcategories(id);
  const products = useProducts({ category: id, page, limit: 12, sort: '-sold' });

  if (category.isError) {
    const nf = isApiError(category.error) && (category.error.status === 404 || category.error.status === 400);
    return (
      <main className="pt-32 pb-24 container mx-auto px-4">
        {nf ? (
          <EmptyState icon={<FolderX className="w-7 h-7" />} title={t('categoryNotFound')} action={<ButtonLink to="/categories">{tNav('categories')}</ButtonLink>} />
        ) : (
          <ErrorState error={category.error} onRetry={() => category.refetch()} />
        )}
      </main>
    );
  }

  const name = nameOf(category.data, locale);
  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: tNav('categories'), to: '/categories' }, { label: name || '…' }]} title={name || <Skeleton className="h-12 w-64" />} compact>
        {(subs.data?.length ?? 0) > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-3">{t('subcategories')}</p>
            <div className="flex flex-wrap gap-2">
              {subs.data!.map((s) => (
                <span key={s._id} className="px-4 py-2 rounded-full bg-white/80 border border-brand-dark/10 text-sm text-brand-dark">
                  {nameOf(s, locale)}
                </span>
              ))}
            </div>
          </div>
        )}
      </PageHero>
      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-10">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="font-serif text-2xl font-bold text-brand-dark">{t('products')}</h2>
          <ButtonLink to={`/products?category=${id}`} variant="secondary" size="sm">
            {tList('filters')}
          </ButtonLink>
        </div>
        {products.isError ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : !products.isLoading && products.data?.data.length === 0 ? (
          <EmptyState title={tList('noResults')} />
        ) : (
          <>
            <ProductGrid products={products.data?.data} loading={products.isLoading} />
            <Pager
              className="mt-12"
              page={page}
              hasNext={!!products.data?.pagination.next}
              hasPrev={page > 1}
              labels={{ prev: tCommon('prev'), next: tCommon('next'), page: tCommon('page'), of: tCommon('of') }}
              onChange={(p) => {
                setSp({ page: String(p) }, { replace: true });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </section>
    </main>
  );
}

export function BrandsPage() {
  const t = useTranslations('Catalog');
  const tNav = useTranslations('Nav');
  const { data, isLoading, isError, error, refetch } = useBrands();
  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: tNav('brands') }]} title={t('brandsTitle')} description={t('brandsDesc')} compact />
      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-10">
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !isLoading && !data?.length ? (
          <EmptyState title={t('noBrands')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {isLoading ? Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />) : data!.map((b) => <BrandTile key={b._id} brand={b} />)}
          </div>
        )}
      </section>
    </main>
  );
}
