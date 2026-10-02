import type { ReactNode } from 'react';
import { ArrowRight, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf } from '../../lib/localize';
import { useBrands, useCategories } from '../../hooks/useCatalog';
import { Skeleton } from '../ui/Spinner';
import { ButtonLink } from '../ui/Button';
import { SectionTitle } from './PageHero';
import type { Brand, Category } from '../../api/types';

export function CategoryTile({ category, tabIndex }: { category: Category; tabIndex?: number }) {
  const locale = useLocale();
  return (
    <Link
      to={`/categories/${category._id}`}
      tabIndex={tabIndex}
      className="group relative block rounded-3xl overflow-hidden aspect-[4/5] bg-brand-pink shadow-sm hover:shadow-xl transition-all">
      {category.image && (
        <img src={category.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between gap-2">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">{nameOf(category, locale)}</h3>
        <span className="shrink-0 w-9 h-9 rounded-full bg-white/90 text-brand-dark flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}

export function BrandTile({ brand, tabIndex }: { brand: Brand; tabIndex?: number }) {
  const locale = useLocale();
  return (
    <Link
      to={`/products?brand=${brand._id}`}
      tabIndex={tabIndex}
      title={nameOf(brand, locale)}
      className="flex items-center justify-center h-32 rounded-2xl bg-white border border-brand-dark/5 p-2 text-center shadow-sm hover:border-brand-gold/40 hover:shadow-lg transition-all">
      {brand.image ? (
        <img src={brand.image} alt={nameOf(brand, locale)} loading="lazy" className="h-full w-auto max-w-full object-contain" />
      ) : (
        <span className="font-serif text-lg font-bold text-brand-dark">{nameOf(brand, locale)}</span>
      )}
    </Link>
  );
}

export function ShopByCategory() {
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');
  const { data, isLoading, isError } = useCategories();
  if (isError || (!isLoading && !data?.length)) return null;
  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <SectionTitle
          eyebrow={t('catEyebrow')}
          title={t('catTitle')}
          description={t('catDesc')}
          action={
            <ButtonLink to="/categories" variant="secondary">
              {tCommon('viewAll')}
            </ButtonLink>
          }
        />
      </div>
      {isLoading ? (
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex gap-5 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-44 sm:w-56 shrink-0 rounded-3xl" />
          ))}
        </div>
      ) : (
        <Marquee
          items={data!}
          itemKey={(c) => c._id}
          itemClassName="w-44 sm:w-56"
          secondsPerItem={4.5}
          reverse
          renderItem={(c, duplicate) => <CategoryTile category={c} tabIndex={duplicate ? -1 : undefined} />}
        />
      )}
    </section>
  );
}

/**
 * One-row, endlessly scrolling strip. The list is rendered twice and the track
 * moves by half its width, so the loop is seamless. Pauses on hover/focus and
 * stays still for users who prefer reduced motion.
 */
function Marquee<T>({
  items,
  itemKey,
  renderItem,
  itemClassName,
  minItems = 8,
  secondsPerItem = 3.5,
  reverse = false
}: {
  items: T[];
  itemKey: (item: T) => string;
  renderItem: (item: T, duplicate: boolean) => ReactNode;
  itemClassName: string;
  minItems?: number;
  secondsPerItem?: number;
  reverse?: boolean;
}) {
  // repeat short lists so one copy is always wider than the screen
  const base = items.length >= minItems ? items : Array.from({ length: Math.ceil(minItems / Math.max(items.length, 1)) }, () => items).flat();
  const duration = `${Math.max(base.length * secondsPerItem, 20)}s`;
  return (
    <div className={`rc-marquee relative overflow-hidden py-2 ${reverse ? 'rc-marquee--reverse' : ''}`} style={{ ['--rc-marquee-duration' as string]: duration }}>
      <div className="rc-marquee-track flex w-max">
        {[0, 1].map((copy) =>
          base.map((item, i) => (
            <div key={`${copy}-${itemKey(item)}-${i}`} className={`shrink-0 pe-5 ${itemClassName}`} aria-hidden={copy === 1 || undefined}>
              {renderItem(item, copy === 1)}
            </div>
          ))
        )}
      </div>
      <div className="pointer-events-none absolute inset-y-0 start-0 w-16 sm:w-32 bg-gradient-to-r rtl:bg-gradient-to-l from-brand-cream to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-16 sm:w-32 bg-gradient-to-l rtl:bg-gradient-to-r from-brand-cream to-transparent" />
    </div>
  );
}

export function BrandsStrip() {
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');
  const { data, isLoading, isError } = useBrands();
  if (isError || (!isLoading && !data?.length)) return null;
  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <SectionTitle
          eyebrow={t('brandsEyebrow')}
          title={t('brandsTitle')}
          action={
            <ButtonLink to="/brands" variant="secondary">
              {tCommon('viewAll')}
            </ButtonLink>
          }
        />
      </div>
      {isLoading ? (
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex gap-5 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-44 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : (
        <Marquee
          items={data!}
          itemKey={(b) => b._id}
          itemClassName="w-48 sm:w-56"
          renderItem={(b, duplicate) => <BrandTile brand={b} tabIndex={duplicate ? -1 : undefined} />}
        />
      )}
    </section>
  );
}

export function ShopPromo() {
  const t = useTranslations('Home');
  return (
    <section className="py-10 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="rounded-[2rem] bg-brand-dark text-white p-8 md:p-12 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center overflow-hidden relative">
          <div className="absolute -top-20 -end-20 w-72 h-72 bg-brand-gold/30 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">{t('promoTitle')}</h2>
            <p className="text-white/70 text-lg mb-6">{t('promoDesc')}</p>
            <ButtonLink to="/products" size="lg">
              {t('promoCta')}
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </ButtonLink>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-center">
            {[Truck, Wallet, ShieldCheck].map((Icon, i) => (
              <div key={i} className="rounded-2xl bg-white/10 p-4 flex items-center justify-center aspect-square">
                <Icon className="w-9 h-9 text-brand-pinkDark" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
