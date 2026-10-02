import { Heart } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
import { useWishlist } from '../hooks/useShop';
import { PageHero } from '../components/shop/PageHero';
import { ProductGrid } from '../components/shop/ProductCard';
import { ButtonLink } from '../components/ui/Button';
import { EmptyState, ErrorState } from '../components/ui/States';

export function WishlistPage() {
  const t = useTranslations('Wishlist');
  const wishlist = useWishlist();
  const { query, items } = wishlist;

  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: t('title') }]} title={t('title')} description={items.length ? t('count', { n: items.length }) : undefined} compact />
      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-8">
        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : !query.isLoading && items.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-7 h-7" />}
            title={t('empty')}
            description={t('emptyDesc')}
            action={<ButtonLink to="/products">{t('browse')}</ButtonLink>}
            className="bg-white/60 rounded-3xl"
          />
        ) : (
          <ProductGrid products={query.isLoading ? undefined : items} loading={query.isLoading} skeletons={4} />
        )}
      </section>
    </main>
  );
}
