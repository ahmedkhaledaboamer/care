import { lazy, Suspense, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Crosshair, MapPin, Navigation, Phone, Search, Store } from 'lucide-react';
import type { Branch } from '../api/types';
import { useBranches } from '../hooks/useCatalog';
import { useLocale, useTranslations } from '../lib/i18n';
import { nameOf, pick } from '../lib/localize';
import { ButtonLink } from './ui/Button';
import { Skeleton } from './ui/Spinner';
import { EmptyState, ErrorState } from './ui/States';
import { directionsUrl, type LatLng } from './map/geo';

// Leaflet is only downloaded when a map is actually rendered.
const BranchMap = lazy(() => import('./map/BranchMap'));

/** Great-circle distance in km. */
function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function BranchCard({
  branch,
  active,
  distance,
  onSelect
}: {
  branch: Branch;
  active: boolean;
  distance?: number;
  onSelect: () => void;
}) {
  const t = useTranslations('Stores');
  const locale = useLocale();
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())}
        aria-pressed={active}
        className={`group w-full text-start rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 ${
          active ? 'bg-white border-brand-gold/50 shadow-lg' : 'bg-white/70 border-transparent hover:bg-white hover:shadow-md'
        }`}>
        <div className="flex items-start gap-3">
          <span className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${active ? 'bg-brand-dark text-white' : 'bg-brand-pink text-brand-gold'}`}>
            {branch.isMain ? <Store className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-serif font-bold text-brand-dark leading-snug">{nameOf(branch, locale)}</h3>
              {branch.isMain && (
                <span className="px-2 py-0.5 rounded-full bg-brand-peach text-brand-goldLight text-[10px] font-semibold uppercase tracking-wider">{t('mainBranch')}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{pick(branch.address, branch.addressAr, locale)}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
              <span className="font-semibold text-brand-gold">{pick(branch.city, branch.cityAr, locale)}</span>
              {branch.workingHours && (
                <span className="inline-flex items-center gap-1" dir="ltr">
                  <Clock className="w-3.5 h-3.5" />
                  {branch.workingHours}
                </span>
              )}
              {distance != null && <span className="font-semibold text-brand-goldLight">{t('kmAway', { n: distance < 10 ? distance.toFixed(1) : Math.round(distance) })}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {branch.phone && (
                <a
                  href={`tel:${branch.phone.replace(/\s/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-dark/10 text-xs font-semibold text-brand-dark hover:border-brand-gold">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{branch.phone}</span>
                </a>
              )}
              <a
                href={directionsUrl(branch)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white text-xs font-semibold shadow-sm hover:shadow-md">
                <Navigation className="w-3.5 h-3.5" />
                {t('directions')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Store locator: live branches from `GET /branches` on an interactive map.
 * `variant="section"` is the home page block, `"page"` is the full /stores page.
 */
export function StoreLocator({ variant = 'section' }: { variant?: 'section' | 'page' }) {
  const t = useTranslations('Stores');
  const locale = useLocale();
  const { data, isLoading, isError, error, refetch } = useBranches();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const branches = useMemo(() => data ?? [], [data]);
  const cities = useMemo(() => {
    const seen = new Map<string, string>();
    branches.forEach((b) => seen.has(b.city) || seen.set(b.city, pick(b.city, b.cityAr, locale)));
    return [...seen.entries()];
  }, [branches, locale]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = branches.filter((b) => {
      if (city && b.city !== city) return false;
      if (!q) return true;
      return [b.name, b.nameAr, b.city, b.cityAr, b.address, b.addressAr].some((v) => v?.toLowerCase().includes(q));
    });
    if (!userLocation) return list.map((b) => ({ branch: b, distance: undefined as number | undefined }));
    return list
      .map((b) => ({ branch: b, distance: distanceKm(userLocation, b.location) }))
      .sort((a, b) => a.distance - b.distance);
  }, [branches, query, city, userLocation]);

  const locate = () => {
    setGeoError(null);
    if (!('geolocation' in navigator)) return setGeoError(t('locationUnsupported'));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(here);
        setLocating(false);
        const nearest = [...branches].sort((a, b) => distanceKm(here, a.location) - distanceKm(here, b.location))[0];
        if (nearest) setSelectedId(nearest._id);
      },
      () => {
        setLocating(false);
        setGeoError(t('locationDenied'));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const isPage = variant === 'page';
  if (!isPage && !isLoading && (isError || branches.length === 0)) return null;

  const mapHeight = isPage ? 'h-[420px] lg:h-[640px]' : 'h-[380px] lg:h-[560px]';

  return (
    <section id="stores" className={isPage ? 'pb-24' : 'py-24 relative overflow-hidden'} aria-labelledby={isPage ? undefined : 'stores-title'}>
      {!isPage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-beige/60 to-brand-cream pointer-events-none" />
          <div className="absolute -top-24 -start-24 w-96 h-96 rounded-full bg-brand-pink/60 blur-3xl pointer-events-none" />
        </>
      )}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative">
        {!isPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">{t('eyebrow')}</span>
              </div>
              <h2 id="stores-title" className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
                {t('title')}
              </h2>
              <p className="text-gray-600 text-lg">{t('description')}</p>
            </div>
            <ButtonLink to="/stores" variant="secondary">
              {t('viewAll')}
            </ButtonLink>
          </motion.div>
        )}

        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !isLoading && branches.length === 0 ? (
          <EmptyState icon={<Store className="w-7 h-7" />} title={t('empty')} />
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
            <div className="order-2 lg:order-1 flex flex-col gap-4">
              <div className="rounded-3xl bg-white/80 backdrop-blur p-4 shadow-sm space-y-3">
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('searchPh')}
                    aria-label={t('searchPh')}
                    className="w-full h-11 rounded-full border border-brand-dark/10 bg-white ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={locate}
                    disabled={locating || !branches.length}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-brand-dark text-white text-xs font-semibold hover:bg-brand-goldLight transition-colors disabled:opacity-60">
                    <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                    {locating ? t('locating') : t('nearMe')}
                  </button>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label={t('allCities')}
                    className="h-9 rounded-full border border-brand-dark/10 bg-white px-3 text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/40">
                    <option value="">{t('allCities')}</option>
                    {cities.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="ms-auto text-xs text-gray-500">{t('branchesCount', { n: visible.length })}</span>
                </div>
                {geoError && (
                  <p className="text-xs text-red-600" role="alert">
                    {geoError}
                  </p>
                )}
              </div>

              <ul className={`space-y-3 overflow-y-auto pe-1 ${isPage ? 'lg:max-h-[540px]' : 'lg:max-h-[460px]'}`} aria-live="polite">
                {isLoading
                  ? Array.from({ length: 4 }, (_, i) => (
                      <li key={i}>
                        <Skeleton className="h-32 rounded-3xl" />
                      </li>
                    ))
                  : visible.map(({ branch, distance }) => (
                      <BranchCard key={branch._id} branch={branch} distance={distance} active={branch._id === selectedId} onSelect={() => setSelectedId(branch._id)} />
                    ))}
                {!isLoading && visible.length === 0 && <li className="text-sm text-gray-500 text-center py-8">{t('noResults')}</li>}
              </ul>
            </div>

            <div className="order-1 lg:order-2 lg:sticky lg:top-28">
              <Suspense fallback={<Skeleton className={`${mapHeight} rounded-[2rem]`} />}>
                {isLoading ? (
                  <Skeleton className={`${mapHeight} rounded-[2rem]`} />
                ) : (
                  <BranchMap
                    branches={visible.map((v) => v.branch)}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    userLocation={userLocation}
                    className={mapHeight}
                  />
                )}
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
