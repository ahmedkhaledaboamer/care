import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Branch } from '../../api/types';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf, pick } from '../../lib/localize';
import { DEFAULT_CENTER, directionsUrl, type LatLng } from './geo';

export type { LatLng } from './geo';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** SVG pin as a div icon — avoids Leaflet's default image paths, which break in bundlers. */
function pinIcon({ active, main }: { active: boolean; main: boolean }) {
  const size = active ? 46 : main ? 40 : 34;
  const fill = active ? '#0A2E52' : main ? '#125697' : '#70A426';
  const html = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" style="filter: drop-shadow(0 4px 6px rgba(10,46,82,.35))">
      <path d="M16 1.5C9.6 1.5 4.5 6.6 4.5 13c0 8.3 10.1 16.6 10.5 17a1.5 1.5 0 0 0 2 0c.4-.4 10.5-8.7 10.5-17C27.5 6.6 22.4 1.5 16 1.5Z" fill="${fill}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="13" r="4.6" fill="#fff"/>
      ${main ? '<path d="m16 9.6 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="' + fill + '"/>' : ''}
    </svg>`;
  return L.divIcon({ html, className: 'rc-pin', iconSize: [size, size], iconAnchor: [size / 2, size - 2], popupAnchor: [0, -size + 6] });
}

const userIcon = L.divIcon({
  html: '<span class="rc-user-dot"></span>',
  className: 'rc-user',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

/** Keeps tiles correct when the container resizes (modals, responsive layouts). */
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    const t = window.setTimeout(() => map.invalidateSize(), 350);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [map]);
  return null;
}

/** Fits all points once (and again when the set changes). */
function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join('|');
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/** Flies to the selected branch and opens its popup. */
function FlyToSelected({ branch, markers }: { branch?: Branch; markers: React.MutableRefObject<Record<string, L.Marker | null>> }) {
  const map = useMap();
  useEffect(() => {
    if (!branch) return;
    map.flyTo([branch.location.lat, branch.location.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
    const t = window.setTimeout(() => markers.current[branch._id]?.openPopup(), 850);
    return () => window.clearTimeout(t);
  }, [branch, map, markers]);
  return null;
}

export function BranchMap({
  branches,
  selectedId,
  onSelect,
  userLocation,
  className = 'h-[420px]'
}: {
  branches: Branch[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  userLocation?: LatLng | null;
  className?: string;
}) {
  const t = useTranslations('Stores');
  const locale = useLocale();
  const markers = useRef<Record<string, L.Marker | null>>({});
  const selected = branches.find((b) => b._id === selectedId);
  const points = useMemo(
    () => [...branches.map((b) => b.location), ...(userLocation ? [userLocation] : [])],
    [branches, userLocation]
  );

  return (
    <div className={`relative rounded-[2rem] overflow-hidden border border-white shadow-xl bg-brand-beige isolate ${className}`}>
      <MapContainer center={DEFAULT_CENTER} zoom={6} scrollWheelZoom={false} className="w-full h-full" attributionControl aria-label={t('mapLabel')}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <AutoResize />
        <FitBounds points={points} />
        <FlyToSelected branch={selected} markers={markers} />
        {branches.map((b) => (
          <Marker
            key={b._id}
            position={[b.location.lat, b.location.lng]}
            icon={pinIcon({ active: b._id === selectedId, main: !!b.isMain })}
            zIndexOffset={b._id === selectedId ? 1000 : b.isMain ? 500 : 0}
            ref={(m) => {
              markers.current[b._id] = m;
            }}
            eventHandlers={{ click: () => onSelect?.(b._id) }}>
            <Popup>
              <div className="min-w-[200px] text-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {b.isMain && <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-gold mb-1">{t('mainBranch')}</p>}
                <p className="font-serif font-bold text-brand-dark text-base leading-snug">{nameOf(b, locale)}</p>
                <p className="text-xs text-gray-600 mt-1">{pick(b.address, b.addressAr, locale)}</p>
                {b.workingHours && <p className="text-xs text-gray-500 mt-1" dir="ltr">{b.workingHours}</p>}
                <div className="flex gap-2 mt-3">
                  {b.phone && (
                    <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="rc-popup-btn">
                      {t('call')}
                    </a>
                  )}
                  <a href={directionsUrl(b)} target="_blank" rel="noopener noreferrer" className="rc-popup-btn rc-popup-btn--primary">
                    {t('directions')}
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={2000}>
            <Popup>{t('youAreHere')}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }) });
  return null;
}

function Recenter({ value }: { value: LatLng | null }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (!value) return;
    if (first.current) map.setView(value, 14);
    else if (!map.getBounds().contains(value)) map.panTo(value);
    first.current = false;
  }, [value, map]);
  return null;
}

/** Dashboard picker: click the map or drag the pin to set a branch location. */
export function LocationPicker({ value, onChange, className = 'h-72' }: { value: LatLng | null; onChange: (p: LatLng) => void; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-slate-200 isolate ${className}`}>
      <MapContainer center={value ?? DEFAULT_CENTER} zoom={value ? 14 : 6} className="w-full h-full" scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <AutoResize />
        <ClickToPick onPick={onChange} />
        <Recenter value={value} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={pinIcon({ active: true, main: false })}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng();
                onChange({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) });
              }
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default BranchMap;
