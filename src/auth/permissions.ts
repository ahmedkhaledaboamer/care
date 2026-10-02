import type { Role, User } from '../api/types';

export const STAFF_ROLES: Role[] = ['admin', 'manager'];

export type Action =
  | 'dashboard:access'
  | 'catalog:write' // create / update products, categories, subcategories, brands
  | 'coupons:write'
  | 'users:write'
  | 'orders:manage' // mark paid / delivered
  | 'reviews:moderate' // delete any review
  | 'resource:delete' // delete products, categories, subcategories, brands, users, coupons
  | 'shop'; // cart, wishlist, addresses, placing orders, writing reviews

const rules: Record<Action, Role[]> = {
  'dashboard:access': ['admin', 'manager'],
  'catalog:write': ['admin', 'manager'],
  'coupons:write': ['admin', 'manager'],
  'users:write': ['admin', 'manager'],
  'orders:manage': ['admin', 'manager'],
  'reviews:moderate': ['admin', 'manager'],
  'resource:delete': ['admin'],
  shop: ['user']
};

export function can(user: Pick<User, 'role'> | null | undefined, action: Action): boolean {
  return !!user && rules[action].includes(user.role);
}

export function isStaff(user: Pick<User, 'role'> | null | undefined): boolean {
  return !!user && STAFF_ROLES.includes(user.role);
}

export class PermissionError extends Error {
  constructor(action: Action) {
    super(`You don't have permission to perform this action (${action}).`);
    this.name = 'PermissionError';
  }
}

/** Throws unless allowed — call inside action handlers, not just to hide buttons. */
export function assertCan(user: Pick<User, 'role'> | null | undefined, action: Action) {
  if (!can(user, action)) throw new PermissionError(action);
}

/** Where to send a user right after login. */
export function homeFor(user: Pick<User, 'role'>): string {
  return isStaff(user) ? '/dashboard' : '/';
}
