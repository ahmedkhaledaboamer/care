import { api, type QueryParams } from './client';
import { createCrudService } from './crud';
import type {
  Address,
  AuthResponse,
  Branch,
  Brand,
  CartResponse,
  Category,
  Coupon,
  ItemResponse,
  ListResponse,
  Order,
  Product,
  Review,
  ShippingAddress,
  SubCategory,
  User
} from './types';

/* ---------------------------------- Auth --------------------------------- */
export const authApi = {
  login: (body: { email: string; password: string }) => api.post<AuthResponse>('/auth/login', body),
  signup: (body: { name: string; email: string; password: string; passwordConfirm: string }) =>
    api.post<AuthResponse>('/auth/signup', body),
  forgotPassword: (email: string) => api.post<{ status: string; message: string }>('/auth/forgotPassword', { email }),
  verifyResetCode: (resetCode: string) => api.post<{ status: string }>('/auth/verifyResetCode', { resetCode }),
  resetPassword: (email: string, newPassword: string) =>
    api.put<{ token: string }>('/auth/resetPassword', { email, newPassword })
};

/* --------------------------- Profile (logged user) ------------------------ */
export const profileApi = {
  getMe: (signal?: AbortSignal) => api.get<ItemResponse<User>>('/users/getMe', undefined, signal).then((r) => r.data),
  /** `email` is only sent when changed — see known issue #1. */
  updateMe: (body: { name?: string; phone?: string; email?: string }) =>
    api.put<ItemResponse<User>>('/users/updateMe', body).then((r) => r.data),
  changeMyPassword: (password: string) => api.put<AuthResponse>('/users/changeMyPassword', { password }),
  deleteMe: () => api.delete('/users/deleteMe')
};

/* --------------------------------- Catalog -------------------------------- */
/** Multipart (`name`, `nameAr`, optional `image`) — the image can be left out on update. */
export const categoriesApi = createCrudService<Category, FormData>('/categories');

export const subcategoriesApi = {
  ...createCrudService<SubCategory, { name: string; nameAr?: string; category: string }, { name?: string; nameAr?: string; category?: string }>('/subcategories'),
  /** Note: nested route is singular `subcategory`. */
  listByCategory: (categoryId: string, params?: QueryParams, signal?: AbortSignal) =>
    api.get<ListResponse<SubCategory>>(`/categories/${categoryId}/subcategory`, params, signal),
  createInCategory: (categoryId: string, name: string, nameAr?: string) =>
    api.post<ItemResponse<SubCategory>>(`/categories/${categoryId}/subcategory`, { name, nameAr }).then((r) => r.data)
};

/** Multipart (`name`, `nameAr`, optional `image`). */
export const brandsApi = createCrudService<Brand, FormData>('/brands');

/**
 * Multipart. On update, `imageCover`/`images` files are optional; send the
 * kept image URLs as `images` to remove the others.
 */
export const productsApi = createCrudService<Product, FormData>('/products');

/** Store locations shown on the map. `all: true` (staff) includes inactive ones. */
export type BranchInput = Omit<Branch, '_id' | 'createdAt' | 'updatedAt'>;
export const branchesApi = createCrudService<Branch, BranchInput, Partial<BranchInput>>('/branches');

export const reviewsApi = {
  ...createCrudService<Review, never, { title?: string; ratings?: number }>('/reviews'),
  listForProduct: (productId: string, params?: QueryParams, signal?: AbortSignal) =>
    api.get<ListResponse<Review>>(`/products/${productId}/reviews`, params, signal),
  createForProduct: (productId: string, body: { title?: string; ratings: number }) =>
    api.post<ItemResponse<Review>>(`/products/${productId}/reviews`, body).then((r) => r.data)
};

/* ------------------------------ Customer shop ----------------------------- */
export const wishlistApi = {
  get: (signal?: AbortSignal) => api.get<{ data: Product[] }>('/wishlist', undefined, signal).then((r) => r.data),
  add: (productId: string) => api.post<{ data: string[] }>('/wishlist', { productId }).then((r) => r.data),
  remove: (productId: string) => api.delete<{ data: string[] }>(`/wishlist/${productId}`).then((r) => r!.data)
};

export const addressApi = {
  list: (signal?: AbortSignal) => api.get<{ data: Address[] }>('/address', undefined, signal).then((r) => r.data),
  add: (body: Omit<Address, '_id'>) => api.post<{ data: Address[] }>('/address', body).then((r) => r.data),
  remove: (addressId: string) => api.delete<{ data: Address[] }>(`/address/${addressId}`).then((r) => r!.data)
};

export const cartApi = {
  get: (signal?: AbortSignal) => api.get<CartResponse>('/cart', undefined, signal),
  add: (productId: string, color?: string) => api.post<CartResponse>('/cart', color ? { productId, color } : { productId }),
  updateQuantity: (itemId: string, quantity: number) => api.put<CartResponse>(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete<CartResponse>(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (coupon: string) => api.put<CartResponse>('/cart/applyCoupon', { coupon })
};

export const ordersApi = {
  list: (params?: QueryParams, signal?: AbortSignal) => api.get<ListResponse<Order>>('/orders', params, signal),
  get: (id: string, signal?: AbortSignal) =>
    api.get<ItemResponse<Order>>(`/orders/${id}`, undefined, signal).then((r) => r.data),
  createCash: (cartId: string, shippingAddress: ShippingAddress) =>
    api.post<{ status: string; data: Order }>(`/orders/${cartId}`, { shippingAddress }).then((r) => r.data),
  markPaid: (id: string) => api.put<{ data: Order }>(`/orders/${id}/pay`).then((r) => r.data),
  markDelivered: (id: string) => api.put<{ data: Order }>(`/orders/${id}/deliver`).then((r) => r.data)
};

/* ---------------------------------- Admin --------------------------------- */
export const usersApi = {
  ...createCrudService<User, FormData>('/users'),
  changePassword: (id: string, body: { currentPassword: string; password: string; passwordConfirm: string }) =>
    api.put<ItemResponse<User>>(`/users/changeMyPassword/${id}`, body).then((r) => r.data)
};

export const couponsApi = createCrudService<Coupon, { name: string; expire: string; discount: number }, Partial<{ name: string; expire: string; discount: number }>>(
  '/coupon'
);
