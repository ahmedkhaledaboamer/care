import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../lib/i18n';
import { useProducts } from '../hooks/useCatalog';
import { ProductGrid } from './shop/ProductCard';
import { EmptyState, ErrorState } from './ui/States';

/** Home "best sellers" — live data from `GET /products?sort=-sold`. */
export function Products() {
  const navigate = useNavigate();
  const t = useTranslations('Products');
  const tHome = useTranslations('Home');
  const { data, isLoading, isError, error, refetch } = useProducts({ sort: '-sold', limit: 8 });

  return (
    <section id="products" className="py-24 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
              {tHome('bestEyebrow')}
            </span>
            <Sparkles className="w-4 h-4 text-brand-gold" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            {tHome('bestTitle')}
          </h2>
          <p className="text-gray-600 text-lg">{t('description')}</p>
        </div>

        {isError ?
        <ErrorState error={error} onRetry={() => refetch()} /> :
        !isLoading && data?.data.length === 0 ?
        <EmptyState title={tHome('noProducts')} /> :

        <ProductGrid products={data?.data} loading={isLoading} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 mb-16" />
        }

        <div className="text-center">
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2">

            {t('viewAll')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>);

}
