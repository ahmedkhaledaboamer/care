import type { Branch } from '../../api/types';

/** Kept out of BranchMap so importing it doesn't pull Leaflet into the main bundle. */
export type LatLng = { lat: number; lng: number };

/** Center of Egypt — used when there is nothing to fit. */
export const DEFAULT_CENTER: LatLng = { lat: 28.6, lng: 30.8 };

export const directionsUrl = (b: Pick<Branch, 'location'>) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.location.lat},${b.location.lng}`;
