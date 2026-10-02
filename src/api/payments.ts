/**
 * Visa / Stripe checkout. The backend creates the session (redirecting back to
 * FRONTEND_URL) and the order is created by the Stripe webhook after a real
 * payment. Enable with VITE_ENABLE_STRIPE=true once STRIPE_SECRET is set.
 */
import { STRIPE_ENABLED } from '../config';
import { api } from './client';
import type { ShippingAddress } from './types';

interface CheckoutSessionResponse {
  status: string;
  session: { url: string; id?: string };
}

export const stripeCheckout = {
  enabled: STRIPE_ENABLED,
  async start(cartId: string, shippingAddress?: ShippingAddress) {
    if (!STRIPE_ENABLED) throw new Error('Card payments are not available yet.');
    const res = await api.post<CheckoutSessionResponse>(`/orders/checkout-session/${cartId}`, { shippingAddress });
    if (!res.session?.url) throw new Error('Payment session could not be created.');
    window.location.assign(res.session.url);
  }
};
