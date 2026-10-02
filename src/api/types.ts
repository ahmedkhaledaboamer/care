/** Domain types — mirror the shapes documented in FRONTEND_API_GUIDE.md. */

export type Role = 'user' | 'manager' | 'admin';

export interface Pagination {
  currentPage: number;
  limit: string | number;
  skip: number;
  numberOfPage: number;
  /** Number of documents matching the filters. */
  totalResults?: number;
  next?: number;
  prev?: number;
}

export interface ListResponse<T> {
  results: number;
  pagination: Pagination;
  data: T[];
}

export interface ItemResponse<T> {
  data: T;
}

export interface Address {
  _id: string;
  alias?: string;
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImg?: string;
  role: Role;
  active?: boolean;
  wishlist?: string[];
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  data: User;
  token: string;
}

/** `{ en, ar }` text used by the bilingual product details. */
export interface LocalizedText {
  en?: string;
  ar?: string;
}

export interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  title?: string;
  ratings: number;
  user: { _id: string; name: string } | string;
  product: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  titleAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  benefits?: LocalizedText[];
  ingredients?: LocalizedText[];
  directions?: LocalizedText | null;
  sizes?: LocalizedText[];
  featured?: boolean;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount?: number;
  colors: string[];
  imageCover: string;
  images: string[];
  /** Populated: `{ _id, name, nameAr, slug }`. */
  category?: { _id?: string; name: string; nameAr?: string; slug?: string } | null;
  subcategories?: string[];
  /** Brand id (not populated). */
  brand?: string | null;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  _id: string;
  /** Product id only — details must be looked up. */
  product: string;
  quantity: number;
  color?: string;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  cartItems: CartItem[];
  totalCartPrice: number;
  /** Only present after a coupon is applied. */
  totalPriceAfterDiscount?: number | string;
  /** Name of the applied coupon. */
  coupon?: string;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  /** An empty cart has no `_id` / `user` yet. */
  data: Cart;
}

export interface Coupon {
  _id: string;
  name: string;
  expire: string;
  discount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id?: string;
  product: { _id: string; title: string; titleAr?: string; imageCover: string } | null;
  quantity: number;
  color?: string;
  price: number;
}

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string; profileImg?: string } | null;
  cartItems: OrderItem[];
  shippingAddress?: ShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: 'cash' | 'card';
  isPaid: boolean;
  paidAt?: string | null;
  isDelivered: boolean;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Branch {
  _id: string;
  name: string;
  nameAr?: string;
  city: string;
  cityAr?: string;
  address: string;
  addressAr?: string;
  phone?: string;
  workingHours?: string;
  location: { lat: number; lng: number };
  isMain?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
