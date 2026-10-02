import { useEffect, useState } from 'react';
import { Check, PackageX, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage, isApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { isStaff } from '../auth/permissions';
import { useLocale, useTranslations } from '../lib/i18n';
import { nameOf, productDescription, productTitle } from '../lib/localize';
import { discountPercent } from '../lib/format';
import { useBrand, useProduct, useProducts } from '../hooks/useCatalog';
import { useCart, useRequireShopper } from '../hooks/useShop';
import { Breadcrumbs } from '../components/shop/PageHero';
import { ColorDot, PriceTag, QuantityStepper, WishlistButton } from '../components/shop/ProductBits';
import { ProductGrid } from '../components/shop/ProductCard';
import { ProductReviews } from '../components/shop/ProductReviews';
import { ProductFacts } from '../components/shop/ProductFacts';
import { useCartDrawer } from '../components/shop/CartDrawer';
import { Button, ButtonLink } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState, Stars } from '../components/ui/States';
import { useToast } from '../components/ui/Toast';

function Gallery({ images, title }: { images: string[]; title: string }) {
  const tUi = useTranslations('Ui');
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [images]);
  const current = images[active] ?? images[0];
  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-sm">
        {current && <img src={current} alt={title} className="w-full h-full object-cover" />}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label={tUi('productImages')}>
          {images.map((src, i) => (
            <button
              key={src + i}
              role="tab"
              aria-selected={i === active}
              aria-label={tUi('imageN', { n: i + 1 })}
              onClick={() => setActive(i)}
              className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${i === active ? 'border-brand-gold shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
      <Skeleton className="aspect-square rounded-[2rem]" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-64 rounded-full" />
      </div>
    </div>
  );
}

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('Product');
  const tList = useTranslations('ProductsPage');
  const locale = useLocale();
  const toast = useToast();
  const { user } = useAuth();
  const cart = useCart();
  const drawer = useCartDrawer();
  const requireShopper = useRequireShopper();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const brand = useBrand(product?.brand);
  const categoryId = product?.category?._id;
  const related = useProducts({ category: categoryId, limit: 5, sort: '-sold' }, { enabled: !!categoryId });
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [colorError, setColorError] = useState(false);

  useEffect(() => {
    setColor(undefined);
    setQty(1);
    setColorError(false);
  }, [id]);

  if (isLoading) {
    return (
      <main className="pt-28 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 md:px-12">
        <DetailsSkeleton />
      </main>
    );
  }

  if (isError || !product) {
    const notFound = isApiError(error) && (error.status === 404 || error.status === 400);
    return (
      <main className="pt-28 md:pt-32 pb-24 container mx-auto px-4 sm:px-6 md:px-12">
        {notFound ? (
          <EmptyState icon={<PackageX className="w-7 h-7" />} title={t('notFound')} description={t('notFoundDesc')} action={<ButtonLink to="/products">{t('backToProducts')}</ButtonLink>} />
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
      </main>
    );
  }

  const title = productTitle(product, locale);
  const categoryName = nameOf(product.category, locale);
  const out = product.quantity <= 0;
  const images = [product.imageCover, ...(product.images ?? [])].filter(Boolean);
  const pct = discountPercent(product);
  const colors = product.colors ?? [];
  const inCart = cart.items.filter((i) => i.product === product._id).reduce((n, i) => n + i.quantity, 0);
  const maxQty = Math.max(1, product.quantity - inCart);

  const addToCart = () => {
    if (colors.length && !color) return setColorError(true);
    const state = requireShopper();
    if (state === 'staff') return toast.info(t('staffNotice'));
    if (state !== 'ok') return;
    cart.add.mutate(
      { product, color, quantity: qty },
      {
        onSuccess: () => {
          toast.success(t('added'));
          setQty(1);
          drawer.open();
        },
        onError: (e) => toast.error(errorMessage(e))
      }
    );
  };

  return (
    <main className="pt-28 md:pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <Breadcrumbs
          items={[
            { label: tList('breadcrumbProducts'), to: '/products' },
            ...(categoryName ? [{ label: categoryName, to: categoryId ? `/categories/${categoryId}` : undefined }] : []),
            { label: title }
          ]}
        />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <Gallery images={images} title={title} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {categoryName && (
                  <span className="px-3 py-1 rounded-full bg-white text-brand-gold text-[11px] font-semibold uppercase tracking-wider">{categoryName}</span>
                )}
                {pct > 0 && <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-semibold uppercase tracking-wider">{t('off', { n: pct })}</span>}
              </div>
              <WishlistButton product={product} />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-4 break-words">{title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6">
              <a href="#reviews" className="inline-flex items-center gap-2 hover:text-brand-dark">
                <Stars value={product.ratingsAverage ?? 0} />
                <span>
                  {(product.ratingsAverage ?? 0).toFixed(1)} · {t('reviewsCount', { n: product.ratingsQuantity ?? 0 })}
                </span>
              </a>
              {product.sold > 0 && <span>{t('sold', { n: product.sold })}</span>}
            </div>

            <div className="mb-6">
              <PriceTag product={product} size="lg" />
            </div>

            <div className="mb-6">
              {out ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                  <PackageX className="w-4 h-4" />
                  {t('outOfStock')}
                </span>
              ) : product.quantity <= 5 ? (
                <span className="text-sm font-semibold text-amber-700">{t('onlyLeft', { n: product.quantity })}</span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Check className="w-4 h-4" />
                  {t('inStock')}
                </span>
              )}
            </div>

            {colors.length > 0 && (
              <fieldset className="mb-6">
                <legend className="text-sm font-semibold text-brand-dark mb-3">
                  {t('color')}
                  {color && <span className="font-normal text-gray-500 ms-2">{color}</span>}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={color === c}
                      onClick={() => {
                        setColor(c);
                        setColorError(false);
                      }}
                      className={`inline-flex items-center gap-2 h-10 ps-2 pe-4 rounded-full border-2 text-sm font-medium transition-all ${color === c ? 'border-brand-gold bg-white shadow-sm' : 'border-brand-dark/10 bg-white/70 hover:border-brand-gold/40'}`}>
                      <ColorDot color={c} className="w-6 h-6" />
                      {c}
                    </button>
                  ))}
                </div>
                {colorError && (
                  <p className="text-sm text-red-600 mt-2" role="alert">
                    {t('chooseColor')}
                  </p>
                )}
              </fieldset>
            )}

            {isStaff(user) ? (
              <p className="text-sm text-gray-600 bg-white/70 rounded-2xl p-4 mb-6">{t('staffNotice')}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {!out && (
                  <div>
                    <span className="sr-only">{t('quantity')}</span>
                    <QuantityStepper value={qty} onChange={setQty} max={maxQty} disabled={out} />
                  </div>
                )}
                <Button size="lg" onClick={addToCart} disabled={out || inCart >= product.quantity} loading={cart.add.isPending} className="flex-1 sm:flex-none min-w-[200px]">
                  <ShoppingBag className="w-5 h-5" />
                  {out ? t('outOfStock') : t('addToCart')}
                </Button>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-4 bg-white/70 rounded-3xl p-5 mb-8 text-sm">
              <div>
                <dt className="text-gray-500">{t('category')}</dt>
                <dd className="font-semibold text-brand-dark">
                  {categoryId ? (
                    <Link to={`/categories/${categoryId}`} className="hover:text-brand-goldLight">
                      {categoryName}
                    </Link>
                  ) : (
                    categoryName || '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">{t('brand')}</dt>
                <dd className="font-semibold text-brand-dark">
                  {brand ? (
                    <Link to={`/products?brand=${brand._id}`} className="hover:text-brand-goldLight">
                      {nameOf(brand, locale)}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>

            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-brand-dark mb-3">{t('description')}</h2>
              <p className="text-gray-600 leading-8 whitespace-pre-line break-words">{productDescription(product, locale)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-white/60 rounded-2xl p-3">
                <Truck className="w-5 h-5 text-brand-gold shrink-0" />
                {t('cod')}
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-2xl p-3">
                <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0" />
                {t('genuine')}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <ProductFacts product={product} />
        </section>

        <ProductReviews product={product} />

        {(related.data?.data.filter((p) => p._id !== product._id).length ?? 0) > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-3xl font-bold text-brand-dark mb-8">{t('related')}</h2>
            <ProductGrid products={related.data!.data.filter((p) => p._id !== product._id).slice(0, 4)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6" />
          </section>
        )}
      </div>
    </main>
  );
}
