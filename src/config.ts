/** Runtime configuration, read from Vite env vars (see .env.example). */
export const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;
export const CURRENCY = import.meta.env.VITE_CURRENCY || 'AED';
/** Stripe checkout is isolated behind this flag until the backend issue is fixed. */
export const STRIPE_ENABLED = import.meta.env.VITE_ENABLE_STRIPE === 'true';
