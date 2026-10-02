import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { QueryParams } from '../api/client';
import { useLocale, useTranslations } from '../lib/i18n';
import { nameOf } from '../lib/localize';
import { useDebounce } from '../hooks/useForm';
import { useBrands, useCategories, useProducts } from '../hooks/useCatalog';
import { PageHero } from '../components/shop/PageHero';
import { ProductGrid } from '../components/shop/ProductCard';
import { EmptyState, ErrorState, Pager, Stars } from '../components/ui/States';
import { Button } from '../components/ui/Button';

/** URL search param ↔ API query param mapping (bracket operators per guide §3). */
export function productQueryFromSearch(sp: URLSearchParams, defaults: { limit?: number } = {}): QueryParams {
  return {
    keyword: sp.get('keyword') || undefined,
    category: sp.get('category') || undefined,
    brand: sp.get('brand') || undefined,
    'price[gte]': sp.get('minPrice') || undefined,
    'price[lte]': sp.get('maxPrice') || undefined,
    'ratingsAverage[gte]': sp.get('rating') || undefined,
    sort: sp.get('sort') || '-sold',
    page: Number(sp.get('page')) || 1,
    limit: Number(sp.get('limit')) || defaults.limit || 12
  };
}

const FILTER_KEYS = ['keyword', 'category', 'brand', 'minPrice', 'maxPrice', 'rating'] as const;

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-brand-dark/5 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <legend className="text-xs font-semibold tracking-wider uppercase text-brand-dark mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function RadioList({
  name,
  options,
  value,
  onChange,
  allLabel
}: {
  name: string;
  options: { value: string; label: ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
}) {
  return (
    <div className="space-y-1 max-h-60 overflow-y-auto pe-1">
      {[{ value: '', label: allLabel }, ...options].map((o) => (
        <label
          key={o.value || 'all'}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors ${value === o.value ? 'bg-brand-pink text-brand-dark font-semibold' : 'text-gray-600 hover:bg-brand-cream'}`}>
          <input type="radio" name={name} className="accent-brand-gold" checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function Filters({ sp, update }: { sp: URLSearchParams; update: (patch: Record<string, string | null>) => void }) {
  const t = useTranslations('Listing');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const categories = useCategories();
  const brands = useBrands();
  const [min, setMin] = useState(sp.get('minPrice') ?? '');
  const [max, setMax] = useState(sp.get('maxPrice') ?? '');
  useEffect(() => {
    setMin(sp.get('minPrice') ?? '');
    setMax(sp.get('maxPrice') ?? '');
  }, [sp]);

  const applyPrice = () => update({ minPrice: min || null, maxPrice: max || null });

  return (
    <div>
      <FilterGroup title={t('category')}>
        <RadioList
          name="category"
          allLabel={tCommon('all')}
          value={sp.get('category') ?? ''}
          onChange={(v) => update({ category: v || null })}
          options={(categories.data ?? []).map((c) => ({ value: c._id, label: nameOf(c, locale) }))}
        />
      </FilterGroup>
      {(brands.data?.length ?? 0) > 0 && (
        <FilterGroup title={t('brand')}>
          <RadioList
            name="brand"
            allLabel={tCommon('all')}
            value={sp.get('brand') ?? ''}
            onChange={(v) => update({ brand: v || null })}
            options={(brands.data ?? []).map((b) => ({ value: b._id, label: nameOf(b, locale) }))}
          />
        </FilterGroup>
      )}
      <FilterGroup title={t('price')}>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyPrice();
          }}>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={applyPrice}
            placeholder={t('min')}
            aria-label={t('min')}
            className="w-full h-10 rounded-xl border border-brand-dark/15 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={applyPrice}
            placeholder={t('max')}
            aria-label={t('max')}
            className="w-full h-10 rounded-xl border border-brand-dark/15 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
          <button type="submit" className="sr-only">
            {tCommon('apply')}
          </button>
        </form>
      </FilterGroup>
      <FilterGroup title={t('rating')}>
        <RadioList
          name="rating"
          allLabel={t('anyRating')}
          value={sp.get('rating') ?? ''}
          onChange={(v) => update({ rating: v || null })}
          options={[4, 3, 2, 1].map((r) => ({
            value: String(r),
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Stars value={r} size="w-3.5 h-3.5" /> {t('andUp')}
              </span>
            )
          }))}
        />
      </FilterGroup>
    </div>
  );
}

export function ProductsPage() {
  const t = useTranslations('ProductsPage');
  const tl = useTranslations('Listing');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [sp, setSp] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const categories = useCategories();
  const brands = useBrands();

  const [keyword, setKeyword] = useState(sp.get('keyword') ?? '');
  const debounced = useDebounce(keyword, 400);

  const update = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (resetPage) next.delete('page');
    setSp(next, { replace: true });
  };

  // keyword input → URL (debounced); URL → input (e.g. header search)
  useEffect(() => {
    if ((sp.get('keyword') ?? '') !== debounced.trim()) update({ keyword: debounced.trim() || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  useEffect(() => {
    // Compare with the debounced value so our own URL writes never clobber typing.
    const k = sp.get('keyword') ?? '';
    if (k !== debounced.trim()) setKeyword(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const params = useMemo(() => productQueryFromSearch(sp), [sp]);
  const { data, isLoading, isFetching, isError, error, refetch } = useProducts(params);
  const page = Number(params.page);
  const hasFilters = FILTER_KEYS.some((k) => sp.get(k));

  const chips: { key: string; label: string; clear: Record<string, null> }[] = [];
  if (sp.get('keyword')) chips.push({ key: 'k', label: `“${sp.get('keyword')}”`, clear: { keyword: null } });
  if (sp.get('category')) chips.push({ key: 'c', label: nameOf(categories.data?.find((c) => c._id === sp.get('category')), locale) || tl('category'), clear: { category: null } });
  if (sp.get('brand')) chips.push({ key: 'b', label: nameOf(brands.data?.find((b) => b._id === sp.get('brand')), locale) || tl('brand'), clear: { brand: null } });
  if (sp.get('minPrice') || sp.get('maxPrice'))
    chips.push({ key: 'p', label: `${tl('price')}: ${sp.get('minPrice') || '0'} – ${sp.get('maxPrice') || '∞'}`, clear: { minPrice: null, maxPrice: null } });
  if (sp.get('rating')) chips.push({ key: 'r', label: `${sp.get('rating')}★ ${tl('andUp')}`, clear: { rating: null } });

  const clearAll = () => {
    setKeyword('');
    const next = new URLSearchParams();
    if (sp.get('sort')) next.set('sort', sp.get('sort')!);
    if (sp.get('limit')) next.set('limit', sp.get('limit')!);
    setSp(next, { replace: true });
  };

  return (
    <main className="pt-28 md:pt-32 pb-24">
      <PageHero crumbs={[{ label: t('breadcrumbProducts') }]} eyebrow={t('eyebrow')} title={t('title')} description={t('description')} compact>
        <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="w-full ps-11 pe-4 py-3 rounded-full border border-brand-dark/10 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="lg:hidden" onClick={() => setDrawer(true)}>
              <SlidersHorizontal className="w-4 h-4" />
              {tl('filters')}
              {chips.length > 0 && <span className="ms-1 w-5 h-5 rounded-full bg-brand-gold text-white text-[10px] flex items-center justify-center">{chips.length}</span>}
            </Button>
            <label className="sr-only" htmlFor="sort">
              {tl('sortBy')}
            </label>
            <select
              id="sort"
              value={sp.get('sort') ?? '-sold'}
              onChange={(e) => update({ sort: e.target.value })}
              className="h-11 rounded-full border border-brand-dark/10 bg-white/80 px-4 text-sm font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/40">
              <option value="-sold">{tl('sortBest')}</option>
              <option value="-createdAt">{tl('sortNewest')}</option>
              <option value="price">{tl('sortPriceLow')}</option>
              <option value="-price">{tl('sortPriceHigh')}</option>
              <option value="-ratingsAverage">{tl('sortRating')}</option>
              <option value="title">{tl('sortAz')}</option>
            </select>
            <label className="sr-only" htmlFor="limit">
              {tl('perPage')}
            </label>
            <select
              id="limit"
              value={String(params.limit)}
              onChange={(e) => update({ limit: e.target.value })}
              className="h-11 rounded-full border border-brand-dark/10 bg-white/80 px-4 text-sm font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/40 hidden sm:block">
              {[12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n} / {tCommon('page').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  if (c.clear.keyword === null) setKeyword('');
                  update(c.clear);
                }}
                className="inline-flex items-center gap-1.5 ps-3 pe-2 py-1.5 rounded-full bg-white border border-brand-dark/10 text-sm text-brand-dark hover:border-red-300">
                {c.label}
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ))}
            <button onClick={clearAll} className="text-sm font-semibold text-brand-gold hover:underline ms-1">
              {tl('clearAll')}
            </button>
          </div>
        )}
      </PageHero>

      <section className="container mx-auto px-4 sm:px-6 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28 bg-white/70 backdrop-blur-sm rounded-3xl p-5 border border-brand-dark/5">
            <Filters sp={sp} update={update} />
          </div>
        </aside>

        <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : !isLoading && data?.data.length === 0 ? (
            <EmptyState
              title={tl('noResults')}
              description={tl('noResultsDesc')}
              action={hasFilters ? <Button variant="secondary" onClick={clearAll}>{tl('clearAll')}</Button> : undefined}
            />
          ) : (
            <>
              <ProductGrid products={data?.data} loading={isLoading} skeletons={Number(params.limit) > 12 ? 12 : 8} />
              <Pager
                className="mt-12"
                page={page}
                hasNext={!!data?.pagination.next}
                hasPrev={page > 1}
                totalPages={hasFilters ? undefined : data?.pagination.numberOfPage}
                labels={{ prev: tCommon('prev'), next: tCommon('next'), page: tCommon('page'), of: tCommon('of') }}
                onChange={(p) => {
                  update({ page: String(p) }, false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[9000] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-brand-dark/40" onClick={() => setDrawer(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={tl('filters')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 max-h-[85vh] bg-white rounded-t-3xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-dark/5">
                <h2 className="font-serif text-xl font-bold">{tl('filters')}</h2>
                <button onClick={() => setDrawer(false)} aria-label={tCommon('close')} className="w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 py-4 flex-1">
                <Filters sp={sp} update={update} />
              </div>
              <div className="p-4 border-t border-brand-dark/5 grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={clearAll}>
                  {tl('clearAll')}
                </Button>
                <Button onClick={() => setDrawer(false)}>{tl('showResults')}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
