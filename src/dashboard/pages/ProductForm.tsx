import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { productsApi } from '../../api/services';
import type { LocalizedText } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { useBrands, useCategories, useSubcategories } from '../../hooks/useCatalog';
import { useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { MultiImagePicker, pickedFromUrl, SingleImagePicker, type PickedImage } from '../../components/ui/ImagePicker';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf } from '../../lib/localize';
import { ColorDot } from '../../components/shop/ProductBits';
import { PageHeader, Panel } from '../components/Kit';
import { dashProductsKey } from './ProductsList';

interface Values extends Record<string, unknown> {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  quantity: string;
  price: string;
  priceAfterDiscount: string;
  category: string;
  brand: string;
  benefits: string;
  ingredients: string;
  sizes: string;
  directionsEn: string;
  directionsAr: string;
}

const EMPTY: Values = {
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  quantity: '',
  price: '',
  priceAfterDiscount: '',
  category: '',
  brand: '',
  benefits: '',
  ingredients: '',
  sizes: '',
  directionsEn: '',
  directionsAr: ''
};

/** `[{en, ar}]` ⇄ one "English | عربي" pair per line. */
const toLines = (list?: LocalizedText[]) => (list ?? []).map((x) => [x.en, x.ar].filter(Boolean).join(' | ')).join('\n');
const fromLines = (value: string): LocalizedText[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, ...rest] = line.split('|');
      const ar = rest.join('|').trim();
      return { en: en.trim(), ...(ar ? { ar } : {}) };
    });

function ColorsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const t = useTranslations('Dash');
  const [draft, setDraft] = useState('');
  const add = () => {
    const c = draft.trim();
    if (c && !value.some((v) => v.toLowerCase() === c.toLowerCase())) onChange([...value, c]);
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
  };
  return (
    <div>
      <label htmlFor="colors" className="block text-sm font-medium text-brand-dark mb-1.5">
        {t('productForm.colors')} <span className="text-slate-400 font-normal">({t('common.optional')})</span>
      </label>
      <div className="flex flex-wrap items-center gap-2 min-h-11 rounded-xl border border-brand-dark/15 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-brand-gold/40">
        {value.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5 ps-1.5 pe-1 py-1 rounded-full bg-slate-100 text-sm">
            <ColorDot color={c} />
            {c}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== c))} className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center" aria-label={t('productForm.removeColor', { name: c })}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          id="colors"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={value.length ? '' : t('productForm.colorsPh')}
          className="flex-1 min-w-[140px] bg-transparent text-sm focus:outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">{t('productForm.colorsHint')}</p>
    </div>
  );
}

export function ProductFormPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const editing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const categories = useCategories();
  const brands = useBrands();
  const form = useForm<Values>(EMPTY);
  const subcategories = useSubcategories(form.values.category || undefined);
  const [colors, setColors] = useState<string[]>([]);
  const [subs, setSubs] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [cover, setCover] = useState<PickedImage | null>(null);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ['public', 'product', id ?? '', 'edit'],
    queryFn: ({ signal }) => productsApi.get(id!, signal),
    enabled: editing,
    staleTime: 0
  });

  // Hydrate the form once the product is loaded.
  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    form.reset({
      title: p.title,
      titleAr: p.titleAr ?? '',
      description: p.description,
      descriptionAr: p.descriptionAr ?? '',
      quantity: String(p.quantity ?? ''),
      price: String(p.price ?? ''),
      priceAfterDiscount: p.priceAfterDiscount ? String(p.priceAfterDiscount) : '',
      category: p.category?._id ?? '',
      brand: p.brand ?? '',
      benefits: toLines(p.benefits),
      ingredients: toLines(p.ingredients),
      sizes: toLines(p.sizes),
      directionsEn: p.directions?.en ?? '',
      directionsAr: p.directions?.ar ?? ''
    });
    setColors(p.colors ?? []);
    setSubs(p.subcategories ?? []);
    setFeatured(!!p.featured);
    setCover(p.imageCover ? pickedFromUrl(p.imageCover) : null);
    setImages((p.images ?? []).map(pickedFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  // Drop subcategories that don't belong to a newly chosen category.
  const subOptions = useMemo(() => subcategories.data ?? [], [subcategories.data]);
  useEffect(() => {
    if (!subcategories.data) return;
    setSubs((cur) => cur.filter((s) => subOptions.some((o) => o._id === s)));
  }, [subOptions, subcategories.data]);

  const validate = () => {
    const v = form.values;
    const e: Record<string, string> = {};
    const title = v.title.trim();
    if (title.length < 3 || title.length > 100) e.title = t('productForm.errTitle');
    if (v.titleAr.trim().length > 100) e.titleAr = t('productForm.errTitleAr');
    const desc = v.description.trim();
    if (desc.length < 20 || desc.length > 2000) e.description = t('productForm.errDesc');
    if (v.quantity === '' || !Number.isInteger(Number(v.quantity)) || Number(v.quantity) < 0) e.quantity = t('productForm.errQty');
    const price = Number(v.price);
    if (v.price === '' || !(price > 0)) e.price = t('productForm.errPrice');
    else if (price > 200000) e.price = t('productForm.errPriceMax');
    if (v.priceAfterDiscount !== '') {
      const d = Number(v.priceAfterDiscount);
      if (!(d > 0)) e.priceAfterDiscount = t('productForm.errSale');
      else if (d >= price) e.priceAfterDiscount = t('productForm.errSaleLower');
    }
    if (!v.category) e.category = t('productForm.errCategory');
    if (!cover) e.imageCover = t('productForm.errCover');
    form.setErrors(e);
    return !Object.keys(e).length;
  };

  const save = useMutation({
    mutationFn: async () => {
      assertCan(user, 'catalog:write');
      const v = form.values;
      const fd = new FormData();
      fd.append('title', v.title.trim());
      fd.append('titleAr', v.titleAr.trim());
      fd.append('description', v.description.trim());
      fd.append('descriptionAr', v.descriptionAr.trim());
      fd.append('quantity', v.quantity);
      fd.append('price', v.price);
      // empty string clears the sale price on update
      if (v.priceAfterDiscount || editing) fd.append('priceAfterDiscount', v.priceAfterDiscount);
      fd.append('category', v.category);
      if (v.brand || editing) fd.append('brand', v.brand);
      fd.append('featured', String(featured));
      // lists are sent as JSON so empty lists clear the field
      fd.append('colors', JSON.stringify(colors));
      fd.append('subcategories', JSON.stringify(subs));
      fd.append('benefits', JSON.stringify(fromLines(v.benefits)));
      fd.append('ingredients', JSON.stringify(fromLines(v.ingredients)));
      fd.append('sizes', JSON.stringify(fromLines(v.sizes)));
      fd.append('directions', JSON.stringify({ en: v.directionsEn.trim(), ar: v.directionsAr.trim() }));
      // cover: a new file, or the current one is kept
      if (cover?.file) fd.append('imageCover', cover.file);
      else if (cover?.url && !editing) fd.append('imageCover', cover.url);
      // gallery: kept URLs + new files (the order of new files is preserved)
      fd.append('images', JSON.stringify(images.filter((i) => !i.file && i.url).map((i) => i.url)));
      images.forEach((i) => i.file && fd.append('images', i.file));
      return editing ? productsApi.update(id!, fd) : productsApi.create(fd);
    },
    onSuccess: (p) => {
      toast.success(editing ? t('productForm.updated') : t('productForm.created'));
      qc.invalidateQueries({ queryKey: dashProductsKey });
      qc.invalidateQueries({ queryKey: ['public', 'product'] });
      qc.invalidateQueries({ queryKey: ['public', 'products'] });
      qc.removeQueries({ queryKey: ['public', 'product-summary', p._id] });
      navigate('/dashboard/products');
    },
    onError: (e) => {
      setError(
        form.applyServerError(e, ['title', 'titleAr', 'description', 'descriptionAr', 'quantity', 'price', 'priceAfterDiscount', 'category', 'brand', 'imageCover', 'images'])
      );
    }
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (validate()) save.mutate();
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (editing && existing.isLoading) return <PageLoader />;
  if (editing && existing.isError) return <ErrorState error={existing.error} onRetry={() => existing.refetch()} />;

  const p = existing.data;

  return (
    <>
      <Link to="/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('productForm.back')}
      </Link>
      <PageHeader title={editing ? t('productForm.editTitle') : t('productForm.newTitle')} description={editing ? (locale === 'ar' && p?.titleAr) || p?.title : t('productForm.newDesc')} />

      <form onSubmit={submit} noValidate className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="space-y-6">
          {error && (
            <div role="alert" className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <Panel className="p-5 sm:p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">{t('productForm.details')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label={t('productForm.titleEn')} required maxLength={100} dir="ltr" {...form.bind('title')} />
              <Input label={t('productForm.titleAr')} dir="rtl" maxLength={100} {...form.bind('titleAr')} hint={t('productForm.arHint')} />
            </div>
            <Textarea
              label={t('productForm.descEn')}
              required
              dir="ltr"
              maxLength={2000}
              className="min-h-[140px]"
              {...form.bind('description')}
              hint={t('productForm.descHint', { n: form.values.description.trim().length })}
            />
            <Textarea label={t('productForm.descAr')} dir="rtl" maxLength={2000} className="min-h-[140px]" {...form.bind('descriptionAr')} />
            <ColorsInput value={colors} onChange={setColors} />
          </Panel>

          <Panel className="p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-900">{t('productForm.facts')}</h2>
              <p className="text-xs text-slate-500 mt-1">{t('productForm.factsHint')}</p>
            </div>
            <Textarea label={t('productForm.benefits')} className="min-h-[110px]" {...form.bind('benefits')} placeholder={'Nourishes the scalp | يغذي فروة الرأس'} />
            <Textarea label={t('productForm.ingredients')} className="min-h-[110px]" {...form.bind('ingredients')} placeholder={'Argan Oil | زيت الأرجان'} />
            <Textarea label={t('productForm.sizes')} className="min-h-[70px]" {...form.bind('sizes')} placeholder={'200 ml | 200 مل'} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Textarea label={t('productForm.directionsEn')} dir="ltr" className="min-h-[90px]" {...form.bind('directionsEn')} />
              <Textarea label={t('productForm.directionsAr')} dir="rtl" className="min-h-[90px]" {...form.bind('directionsAr')} />
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">{t('productForm.media')}</h2>
            <SingleImagePicker
              label={t('productForm.cover')}
              required
              value={cover}
              onChange={(v) => {
                setCover(v);
                form.setErrors((e) => ({ ...e, imageCover: undefined }));
              }}
              error={form.errors.imageCover}
              onError={toast.error}
              hint={t('productForm.coverHint')}
            />
            <MultiImagePicker
              label={t('productForm.gallery')}
              value={images}
              onChange={(v) => {
                setImages(v);
                form.setErrors((e) => ({ ...e, images: undefined }));
              }}
              error={form.errors.images}
              onError={toast.error}
              hint={t('productForm.galleryHint')}
            />
          </Panel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Panel className="p-5 sm:p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">{t('productForm.pricing')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('productForm.price')} required type="number" min={0} step="0.01" inputMode="decimal" {...form.bind('price')} />
              <Input label={t('productForm.salePrice')} type="number" min={0} step="0.01" inputMode="decimal" {...form.bind('priceAfterDiscount')} hint={t('productForm.salePriceHint')} />
            </div>
            <Input label={t('productForm.quantity')} required type="number" min={0} step="1" inputMode="numeric" {...form.bind('quantity')} />
          </Panel>

          <Panel className="p-5 sm:p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">{t('productForm.organization')}</h2>
            <Select label={t('common.category')} required {...form.bind('category')}>
              <option value="">{t('common.selectCategory')}</option>
              {categories.data?.map((c) => (
                <option key={c._id} value={c._id}>
                  {nameOf(c, locale)}
                </option>
              ))}
            </Select>
            {form.values.category && (
              <fieldset>
                <legend className="block text-sm font-medium text-brand-dark mb-1.5">{t('productForm.subcategories')}</legend>
                {subOptions.length === 0 ? (
                  <p className="text-xs text-slate-500">{subcategories.isLoading ? t('productForm.loading') : t('productForm.noSubs')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subOptions.map((s) => {
                      const on = subs.includes(s._id);
                      return (
                        <label
                          key={s._id}
                          className={`cursor-pointer select-none px-3 py-1.5 rounded-full border text-sm transition-colors ${on ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => setSubs((cur) => (on ? cur.filter((x) => x !== s._id) : [...cur, s._id]))} />
                          {nameOf(s, locale)}
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            )}
            <Select label={t('common.brand')} {...form.bind('brand')} hint={t('common.optional')}>
              <option value="">{t('productForm.noBrand')}</option>
              {brands.data?.map((b) => (
                <option key={b._id} value={b._id}>
                  {nameOf(b, locale)}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <Star className={`w-4 h-4 ${featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span className="text-sm">
                <span className="font-medium text-slate-900">{t('productForm.featured')}</span>
                <span className="block text-xs text-slate-500">{t('productForm.featuredHint')}</span>
              </span>
            </label>
          </Panel>

          <div className="flex gap-3">
            <Button type="submit" loading={save.isPending} className="flex-1">
              {editing ? t('common.saveChanges') : t('productForm.create')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard/products')} disabled={save.isPending}>
              {t('common.cancel')}
            </Button>
          </div>
          {save.isError && !error && <p className="text-sm text-red-600">{errorMessage(save.error)}</p>}
        </div>
      </form>
    </>
  );
}
