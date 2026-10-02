import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { isApiError } from '../api/client';
import { cartApi, wishlistApi } from '../api/services';
import type { CartResponse, Product } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { can } from '../auth/permissions';
import { seedProducts } from './useCatalog';

export const CART_KEY = ['cart'] as const;
export const WISHLIST_KEY = ['wishlist'] as const;

const COUPON_KEY = 'rc_coupon';
export const couponMemory = {
  get: () => {
    try {
      return window.localStorage.getItem(COUPON_KEY) || '';
    } catch {
      return '';
    }
  },
  set: (v: string) => {
    try {
      if (v) window.localStorage.setItem(COUPON_KEY, v);
      else window.localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }
};

/** Cart state. An empty cart comes back without an `_id` (older backends answered 404 — also treated as empty). */
export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = can(user, 'shop');

  const query = useQuery({
    queryKey: CART_KEY,
    queryFn: async ({ signal }) => {
      try {
        return await cartApi.get(signal);
      } catch (e) {
        if (isApiError(e) && e.status === 404) return null;
        throw e;
      }
    },
    enabled,
    staleTime: 30 * 1000
  });

  const setCart = (res: CartResponse | null) => qc.setQueryData(CART_KEY, res);

  const add = useMutation({
    mutationFn: async ({ product, color, quantity = 1 }: { product: Product; color?: string; quantity?: number }) => {
      seedProducts(qc, [product]);
      const before = qc.getQueryData<CartResponse | null>(CART_KEY);
      const prevQty = before?.data.cartItems.find((i) => i.product === product._id && (i.color || undefined) === (color || undefined))?.quantity ?? 0;
      let res = await cartApi.add(product._id, color);
      // POST adds one unit; set the exact quantity when more were requested.
      if (quantity > 1) {
        const item = res.data.cartItems.find((i) => i.product === product._id && (i.color || undefined) === (color || undefined));
        if (item) res = await cartApi.updateQuantity(item._id, prevQty + quantity);
      }
      return res;
    },
    onSuccess: setCart
  });

  const update = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await qc.cancelQueries({ queryKey: CART_KEY });
      const prev = qc.getQueryData<CartResponse | null>(CART_KEY);
      if (prev) {
        qc.setQueryData<CartResponse>(CART_KEY, {
          ...prev,
          data: { ...prev.data, cartItems: prev.data.cartItems.map((i) => (i._id === itemId ? { ...i, quantity } : i)) }
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && setCart(ctx.prev ?? null),
    onSuccess: setCart
  });

  const remove = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: setCart
  });

  const clear = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      couponMemory.set('');
      setCart(null);
    }
  });

  const applyCoupon = useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: (res, code) => {
      couponMemory.set(code);
      setCart(res);
    }
  });

  const cart = query.data?.data ?? null;
  const discounted = cart?.totalPriceAfterDiscount != null && cart.totalPriceAfterDiscount !== '' ? Number(cart.totalPriceAfterDiscount) : null;

  return {
    enabled,
    query,
    cart,
    cartId: cart?._id ?? null,
    items: cart?.cartItems ?? [],
    count: query.data?.numOfCartItems ?? 0,
    subtotal: cart?.totalCartPrice ?? 0,
    totalAfterDiscount: discounted,
    total: discounted ?? cart?.totalCartPrice ?? 0,
    appliedCoupon: discounted != null ? cart?.coupon || couponMemory.get() : '',
    add,
    update,
    remove,
    clear,
    applyCoupon
  };
}

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = can(user, 'shop');

  const query = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async ({ signal }) => {
      const list = await wishlistApi.get(signal);
      seedProducts(qc, list);
      return list;
    },
    enabled,
    staleTime: 60 * 1000
  });

  /** POST/DELETE return the id list — reconcile the optimistic list with it. */
  const reconcile = (ids: string[]) => {
    const list = qc.getQueryData<Product[]>(WISHLIST_KEY) ?? [];
    const idSet = new Set(ids.map(String));
    const next = list.filter((p) => idSet.has(p._id));
    qc.setQueryData(WISHLIST_KEY, next);
    if (next.length !== idSet.size) qc.invalidateQueries({ queryKey: WISHLIST_KEY });
  };

  const toggle = useMutation({
    mutationFn: ({ product, inList }: { product: Product; inList: boolean }) =>
      inList ? wishlistApi.remove(product._id) : wishlistApi.add(product._id),
    onMutate: async ({ product, inList }) => {
      await qc.cancelQueries({ queryKey: WISHLIST_KEY });
      const prev = qc.getQueryData<Product[]>(WISHLIST_KEY);
      const list = prev ?? [];
      qc.setQueryData(WISHLIST_KEY, inList ? list.filter((p) => p._id !== product._id) : [product, ...list]);
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(WISHLIST_KEY, ctx?.prev),
    onSuccess: reconcile
  });

  const ids = new Set((query.data ?? []).map((p) => p._id));
  return { enabled, query, items: query.data ?? [], ids, has: (id: string) => ids.has(id), toggle };
}

/** Sends guests to login (then back here) before a shopping action. */
export function useRequireShopper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return (): 'ok' | 'guest' | 'staff' => {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return 'guest';
    }
    return can(user, 'shop') ? 'ok' : 'staff';
  };
}
