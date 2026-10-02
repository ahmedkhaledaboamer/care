import { Suspense, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  Package,
  Shapes,
  ShoppingCart,
  Store,
  Tag,
  Ticket,
  User as UserIcon,
  Users,
  X
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ordersApi } from '../api/services';
import { useAuth } from '../auth/AuthContext';
import { formatDate, initials, shortId, userImageUrl } from '../lib/format';
import { useLocale, useTranslations } from '../lib/i18n';
import { PageLoader } from '../components/ui/Spinner';
import { LocaleSwitcher } from '../components/LocaleSwitcher';

const nav = [
  { to: '/dashboard', key: 'overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/orders', key: 'orders', icon: ShoppingCart },
  { to: '/dashboard/products', key: 'products', icon: Package },
  { to: '/dashboard/categories', key: 'categories', icon: Shapes },
  { to: '/dashboard/subcategories', key: 'subcategories', icon: FolderTree },
  { to: '/dashboard/brands', key: 'brands', icon: Tag },
  { to: '/dashboard/coupons', key: 'coupons', icon: Ticket },
  { to: '/dashboard/branches', key: 'branches', icon: MapPin },
  { to: '/dashboard/users', key: 'users', icon: Users },
  { to: '/dashboard/reviews', key: 'reviews', icon: MessageSquareText }
];

const segments = ['dashboard', 'orders', 'products', 'categories', 'subcategories', 'brands', 'coupons', 'users', 'reviews', 'branches', 'new', 'edit'];

function Breadcrumbs() {
  const { pathname } = useLocation();
  const t = useTranslations('Dash');
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.map((p, i) => ({
    label: segments.includes(p) ? t(`nav.${p}`) : /^[a-f0-9]{24}$/i.test(p) ? shortId(p) : p,
    to: '/' + parts.slice(0, i + 1).join('/')
  }));
  return (
    <nav aria-label={t('nav.dashboard')} className="hidden sm:flex items-center gap-1 text-sm min-w-0">
      {crumbs.map((c, i) => (
        <span key={c.to} className="inline-flex items-center gap-1 min-w-0">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:rotate-180" />}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-slate-900 truncate" aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link to={c.to} className="text-slate-500 hover:text-slate-900 truncate">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

/** Undelivered orders from the latest orders page — real data, no extra endpoint. */
function Notifications() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));
  const { data } = useQuery({
    queryKey: ['dash', 'orders', 'pending-feed'],
    queryFn: ({ signal }) => ordersApi.list({ isDelivered: false, sort: '-createdAt', limit: 8 }, signal),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });
  const pending = data?.data ?? [];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={pending.length ? t('common.notificationsPending', { n: pending.length }) : t('common.notifications')}
        aria-expanded={open}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900">
        <Bell className="w-5 h-5" />
        {pending.length > 0 && <span className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="font-semibold text-slate-900 text-sm">{t('common.awaitingDelivery')}</p>
            <Link to="/dashboard/orders?delivered=false" onClick={() => setOpen(false)} className="text-xs font-semibold text-brand-gold hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500 text-center">{t('common.allCaughtUp')}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {pending.map((o) => (
                <li key={o._id}>
                  <Link to={`/dashboard/orders/${o._id}`} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-slate-50">
                    <p className="text-sm text-slate-900">
                      <span dir="ltr" className="font-mono font-semibold">{shortId(o._id)}</span> · {o.user?.name ?? t('common.customer')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {o.isPaid ? t('common.paid') : t('common.unpaid')} · {formatDate(o.createdAt, locale, true)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const t = useTranslations('Dash');
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));
  if (!user) return null;
  const img = userImageUrl(user);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-xl p-1 pe-2 hover:bg-slate-100">
        {img ? (
          <img src={img} alt="" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-gold to-brand-goldLight text-white text-xs font-bold flex items-center justify-center">{initials(user.name)}</span>
        )}
        <span className="hidden md:block text-start leading-tight">
          <span className="block text-sm font-semibold text-slate-900 max-w-[140px] truncate">{user.name}</span>
          <span className="block text-[11px] uppercase tracking-wider text-slate-400">{t(`roles.${user.role}`)}</span>
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute end-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <Link role="menuitem" to="/account" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
            <UserIcon className="w-4 h-4" /> {t('common.myProfile')}
          </Link>
          <Link role="menuitem" to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
            <Store className="w-4 h-4" /> {t('common.viewStore')}
          </Link>
          <button role="menuitem" onClick={() => logout({ redirectTo: '/login' })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> {t('common.logOut')}
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations('Dash');
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col h-full bg-brand-dark text-white">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-6 h-16 shrink-0 border-b border-white/10">
        <img src="/images/logo.png" alt="" className="w-16 brightness-0 invert" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{t('common.admin')}</span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label={t('nav.dashboard')}>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-white text-brand-dark shadow' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }>
            <item.icon className="w-[18px] h-[18px]" />
            {t(`nav.${item.key}`)}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <Store className="w-[18px] h-[18px]" /> {t('common.viewStore')}
        </Link>
        <button onClick={() => logout({ redirectTo: '/login' })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <LogOut className="w-[18px] h-[18px]" /> {t('common.logOut')}
        </button>
        {user && <p className="px-3 pt-2 text-[11px] text-white/40">{t('common.signedInAs', { role: t(`roles.${user.role}`) })}</p>}
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    // Direction and font follow the selected language (<html dir/lang> is set by LocaleProvider).
    <div className="min-h-screen bg-slate-50 text-slate-700" style={{ fontFamily: locale === 'ar' ? 'Tajawal, Inter, sans-serif' : 'Inter, sans-serif' }}>
      <aside className="hidden lg:block fixed inset-y-0 start-0 w-64 z-30">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-72 max-w-[85vw] shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 end-3 z-10 w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center" aria-label={t('common.closeMenu')}>
              <X className="w-5 h-5" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100" aria-label={t('common.openMenu')}>
            <Menu className="w-5 h-5" />
          </button>
          <Breadcrumbs />
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <LocaleSwitcher />
            <Notifications />
            <UserMenu />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
