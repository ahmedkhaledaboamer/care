import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

const lazyNamed = <K extends string>(loader: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

const Overview = lazyNamed(() => import('./pages/Overview'), 'Overview');
const ProductsList = lazyNamed(() => import('./pages/ProductsList'), 'ProductsList');
const ProductFormPage = lazyNamed(() => import('./pages/ProductForm'), 'ProductFormPage');
const CategoriesPage = lazyNamed(() => import('./pages/Categories'), 'CategoriesPage');
const SubcategoriesPage = lazyNamed(() => import('./pages/Subcategories'), 'SubcategoriesPage');
const BrandsPage = lazyNamed(() => import('./pages/Brands'), 'BrandsPage');
const CouponsPage = lazyNamed(() => import('./pages/Coupons'), 'CouponsPage');
const UsersPage = lazyNamed(() => import('./pages/Users'), 'UsersPage');
const OrdersList = lazyNamed(() => import('./pages/Orders'), 'OrdersList');
const OrderDetail = lazyNamed(() => import('./pages/Orders'), 'OrderDetail');
const ReviewsPage = lazyNamed(() => import('./pages/Reviews'), 'ReviewsPage');
const BranchesPage = lazyNamed(() => import('./pages/Branches'), 'BranchesPage');

/** Mounted at /dashboard/* behind RequireAuth(admin | manager). */
export function DashboardApp() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="subcategories" element={<SubcategoriesPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
