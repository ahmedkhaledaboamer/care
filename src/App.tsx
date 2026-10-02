import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { ToastProvider } from './components/ui/Toast';
import { PageLoader } from './components/ui/Spinner';
import { CartDrawerProvider } from './components/shop/CartDrawer';
import { AuthProvider } from './auth/AuthContext';
import { GuestOnly, RequireAuth } from './auth/guards';
import { isApiError } from './api/client';

// Route-level code splitting: named exports → default for React.lazy.
const lazyNamed = <K extends string>(loader: () => Promise<Record<K, React.ComponentType>>, name: K) =>
lazy(() => loader().then((m) => ({ default: m[name] })));

const ProductsPage = lazyNamed(() => import('./pages/ProductsPage'), 'ProductsPage');
const ProductDetailsPage = lazyNamed(() => import('./pages/ProductDetailsPage'), 'ProductDetailsPage');
const CategoriesPage = lazyNamed(() => import('./pages/CatalogPages'), 'CategoriesPage');
const CategoryPage = lazyNamed(() => import('./pages/CatalogPages'), 'CategoryPage');
const BrandsPage = lazyNamed(() => import('./pages/CatalogPages'), 'BrandsPage');
const StoresPage = lazyNamed(() => import('./pages/StoresPage'), 'StoresPage');
const BlogPage = lazyNamed(() => import('./pages/BlogPage'), 'BlogPage');
const BlogPostPage = lazyNamed(() => import('./pages/BlogPostPage'), 'BlogPostPage');
const CartPage = lazyNamed(() => import('./pages/CartPage'), 'CartPage');
const WishlistPage = lazyNamed(() => import('./pages/WishlistPage'), 'WishlistPage');
const CheckoutPage = lazyNamed(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const LoginPage = lazyNamed(() => import('./pages/auth/AuthPages'), 'LoginPage');
const SignupPage = lazyNamed(() => import('./pages/auth/AuthPages'), 'SignupPage');
const ForgotPasswordPage = lazyNamed(() => import('./pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const AccountLayout = lazyNamed(() => import('./pages/account/AccountLayout'), 'AccountLayout');
const ProfilePage = lazyNamed(() => import('./pages/account/ProfilePage'), 'ProfilePage');
const PasswordPage = lazyNamed(() => import('./pages/account/ProfilePage'), 'PasswordPage');
const AddressesPage = lazyNamed(() => import('./pages/account/AddressesPage'), 'AddressesPage');
const OrdersPage = lazyNamed(() => import('./pages/account/OrdersPages'), 'OrdersPage');
const OrderDetailsPage = lazyNamed(() => import('./pages/account/OrdersPages'), 'OrderDetailsPage');
const MyReviewsPage = lazyNamed(() => import('./pages/account/MyReviewsPage'), 'MyReviewsPage');
const NotFoundPage = lazyNamed(() => import('./pages/SystemPages'), 'NotFoundPage');
const ForbiddenPage = lazyNamed(() => import('./pages/SystemPages'), 'ForbiddenPage');
const DashboardApp = lazyNamed(() => import('./dashboard/DashboardApp'), 'DashboardApp');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Don't retry client errors (400/401/403/404) — they won't change.
      retry: (count, err) => !(isApiError(err) && err.status >= 400 && err.status < 500) && count < 2
    }
  }
});

function ScrollOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-brand-cream font-sans selection:bg-brand-pinkDark selection:text-brand-dark">
      <Header />
      <div className="flex-1">
        <Suspense fallback={<div className="pt-32"><PageLoader /></div>}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      <ScrollToTop />
    </div>);

}

const SHOPPER = ['user'] as const;
const STAFF = ['admin', 'manager'] as const;

export function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <CartDrawerProvider>
              <ScrollOnNavigate />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<StoreLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/categories/:id" element={<CategoryPage />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/stores" element={<StoresPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />

                    <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
                    <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
                    <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />

                    <Route path="/cart" element={<RequireAuth roles={[...SHOPPER]}><CartPage /></RequireAuth>} />
                    <Route path="/wishlist" element={<RequireAuth roles={[...SHOPPER]}><WishlistPage /></RequireAuth>} />
                    <Route path="/checkout" element={<RequireAuth roles={[...SHOPPER]}><CheckoutPage /></RequireAuth>} />

                    <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
                      <Route index element={<ProfilePage />} />
                      <Route path="password" element={<PasswordPage />} />
                      <Route path="addresses" element={<RequireAuth roles={[...SHOPPER]}><AddressesPage /></RequireAuth>} />
                      <Route path="orders" element={<RequireAuth roles={[...SHOPPER]}><OrdersPage /></RequireAuth>} />
                      <Route path="orders/:id" element={<RequireAuth roles={[...SHOPPER]}><OrderDetailsPage /></RequireAuth>} />
                      <Route path="reviews" element={<RequireAuth roles={[...SHOPPER]}><MyReviewsPage /></RequireAuth>} />
                    </Route>
                    <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
                    <Route path="/profile" element={<Navigate to="/account" replace />} />

                    <Route path="/forbidden" element={<ForbiddenPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  <Route path="/dashboard/*" element={<RequireAuth roles={[...STAFF]}><DashboardApp /></RequireAuth>} />
                </Routes>
              </Suspense>
            </CartDrawerProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>);

}
