import { Heart, KeyRound, LayoutDashboard, LogOut, MapPin, MessageSquareText, Package, User as UserIcon } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { can, isStaff } from '../../auth/permissions';
import { useLocale, useTranslations } from '../../lib/i18n';
import { formatDate, initials, userImageUrl } from '../../lib/format';
import { Breadcrumbs } from '../../components/shop/PageHero';

export function AccountLayout() {
  const t = useTranslations('Account');
  const tNav = useTranslations('Nav');
  const locale = useLocale();
  const { user, logout } = useAuth();
  if (!user) return null;
  const shopper = can(user, 'shop');
  const img = userImageUrl(user);

  const links = [
    { to: '/account', end: true, icon: UserIcon, label: t('profile'), show: true },
    { to: '/account/password', icon: KeyRound, label: t('password'), show: true },
    { to: '/account/orders', icon: Package, label: t('orders'), show: shopper },
    { to: '/account/addresses', icon: MapPin, label: t('addresses'), show: shopper },
    { to: '/account/reviews', icon: MessageSquareText, label: t('reviews'), show: shopper }
  ].filter((l) => l.show);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'bg-brand-dark text-white' : 'text-brand-dark hover:bg-brand-cream'}`;

  return (
    <main className="pt-28 md:pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <Breadcrumbs items={[{ label: t('title') }]} />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <aside className="min-w-0 bg-white/80 rounded-3xl border border-brand-dark/5 p-4 lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-2 mb-3">
              {img ? (
                <img src={img} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight text-white font-bold flex items-center justify-center">{initials(user.name)}</span>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-brand-dark truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.createdAt ? t('memberSince', { date: formatDate(user.createdAt, locale) }) : user.email}</p>
              </div>
            </div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0" aria-label={t('title')}>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </NavLink>
              ))}
              {shopper && (
                <Link to="/wishlist" className={linkCls({ isActive: false })}>
                  <Heart className="w-4 h-4" />
                  {t('wishlist')}
                </Link>
              )}
              {isStaff(user) && (
                <Link to="/dashboard" className={linkCls({ isActive: false })}>
                  <LayoutDashboard className="w-4 h-4" />
                  {tNav('dashboard')}
                </Link>
              )}
              <button onClick={() => logout()} className={`${linkCls({ isActive: false })} text-red-600 lg:mt-2`}>
                <LogOut className="w-4 h-4" />
                {tNav('logout')}
              </button>
            </nav>
          </aside>
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
}

export function AccountCard({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white/80 rounded-3xl border border-brand-dark/5 p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-dark">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
