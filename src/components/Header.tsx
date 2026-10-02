import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, Package, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslations } from '../lib/i18n';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useAuth } from '../auth/AuthContext';
import { can, isStaff } from '../auth/permissions';
import { useCart, useWishlist } from '../hooks/useShop';
import { useCartDrawer } from './shop/CartDrawer';
import { initials, userImageUrl } from '../lib/format';

interface NavLink {
  key: 'home' | 'products' | 'categories' | 'brands' | 'stores' | 'about' | 'agents' | 'blog' | 'contact';
  to: string;
  hash?: string;
}
const linkDefs: NavLink[] = [
{
  key: 'home',
  to: '/',
  hash: 'home'
},
{
  key: 'products',
  to: '/products'
},
{
  key: 'categories',
  to: '/categories'
},
{
  key: 'about',
  to: '/',
  hash: 'about'
},
{
  key: 'agents',
  to: '/',
  hash: 'agents'
},
{
  key: 'blog',
  to: '/blog'
},
{
  key: 'contact',
  to: '/',
  hash: 'contact'
}];

function Avatar({ name, src }: { name?: string; src?: string | null }) {
  return src ?
  <img src={src} alt="" className="w-8 h-8 rounded-full object-cover" /> :

  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight text-white text-xs font-bold flex items-center justify-center">
      {initials(name)}
    </span>;

}

function AccountMenu() {
  const { user, logout } = useAuth();
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        to="/login"
        state={{ from: `${location.pathname}${location.search}` }}
        className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold bg-white/70 border border-brand-dark/10 text-brand-dark hover:border-brand-gold/50 transition-colors">

        <UserIcon className="w-4 h-4" />
        {t('login')}
      </Link>);

  }

  const item = 'flex items-center gap-3 px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-cream rounded-xl';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-1 pe-2 bg-white/70 border border-brand-dark/10 hover:border-brand-gold/50 transition-colors">

        <Avatar name={user.name} src={userImageUrl(user)} />
        <ChevronDown className="w-4 h-4 text-brand-dark/60 hidden sm:block" />
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute end-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-brand-dark/5 p-2 z-50">

            <div className="px-4 py-3 border-b border-brand-dark/5 mb-1">
              <p className="font-semibold text-brand-dark truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {isStaff(user) &&
            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-dark text-white rounded-full px-2 py-0.5">
                  {user.role}
                </span>
            }
            </div>
            {isStaff(user) &&
          <Link role="menuitem" to="/dashboard" className={item}>
                <LayoutDashboard className="w-4 h-4 text-brand-gold" />
                {t('dashboard')}
              </Link>
          }
            <Link role="menuitem" to="/account" className={item}>
              <UserIcon className="w-4 h-4 text-brand-gold" />
              {t('account')}
            </Link>
            {can(user, 'shop') &&
          <>
                <Link role="menuitem" to="/account/orders" className={item}>
                  <Package className="w-4 h-4 text-brand-gold" />
                  {t('myOrders')}
                </Link>
                <Link role="menuitem" to="/wishlist" className={item}>
                  <Heart className="w-4 h-4 text-brand-gold" />
                  {t('wishlist')}
                </Link>
              </>
          }
            <button role="menuitem" onClick={() => logout()} className={`${item} w-full text-red-600`}>
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslations('Header');
  const tNav = useTranslations('Nav');
  const tUi = useTranslations('Ui');
  const { user } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const drawer = useCartDrawer();
  const showShopIcons = !user || can(user, 'shop');
  const label = (key: NavLink['key']) => key === 'categories' || key === 'brands' || key === 'stores' ? tNav(key) : t(key);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLinkClick = (link: NavLink) => {
    setMobileMenuOpen(false);
    if (link.hash) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(link.hash!)?.scrollIntoView({
            behavior: 'smooth'
          });
        }, 50);
      } else {
        document.getElementById(link.hash)?.scrollIntoView({
          behavior: 'smooth'
        });
      }
    } else {
      navigate(link.to);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products');
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const iconBtn = 'relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-brand-dark hover:bg-white/80 transition-colors';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen || searchOpen ? 'bg-white/85 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="Home">
          <img
            src="/images/logo.png" alt=""
            className="w-16 sm:w-24" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-7">
          {linkDefs.map((link) =>
          <button
            key={link.key}
            onClick={() => handleLinkClick(link)}
            className={`text-sm font-medium whitespace-nowrap transition-colors relative group ${!link.hash && location.pathname.startsWith(link.to) && link.to !== '/' ? 'text-brand-gold' : 'text-gray-700 hover:text-brand-gold'}`}>

              {label(link.key)}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-2">
          <button className={iconBtn} onClick={() => setSearchOpen((s) => !s)} aria-label={tNav('search')} aria-expanded={searchOpen}>
            <Search className="w-5 h-5" />
          </button>
          {showShopIcons &&
          <>
              <Link to="/wishlist" className={`${iconBtn} hidden sm:flex`} aria-label={tNav('wishlist')}>
                <Heart className="w-5 h-5" />
                {wishlist.items.length > 0 &&
              <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.items.length}
                  </span>
              }
              </Link>
              <button
              className={iconBtn}
              onClick={() => user ? drawer.open() : navigate('/login', { state: { from: '/cart' } })}
              aria-label={`${tNav('cart')}${cart.count ? ` (${cart.count})` : ''}`}>

                <ShoppingBag className="w-5 h-5" />
                {cart.count > 0 &&
              <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-gold text-white text-[10px] font-bold flex items-center justify-center">
                    {cart.count}
                  </span>
              }
              </button>
            </>
          }
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <AccountMenu />

          {/* Mobile Toggle */}
          <button
            className="xl:hidden text-brand-dark w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={tUi('toggleMenu')}
            aria-expanded={mobileMenuOpen}>

            {mobileMenuOpen ?
            <X className="w-6 h-6" /> :

            <Menu className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen &&
        <motion.form
          onSubmit={onSearch}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="container mx-auto px-4 sm:px-6 md:px-12 overflow-hidden"
          role="search">

            <div className="relative mt-3 max-w-2xl mx-auto">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tNav('searchPh')}
              aria-label={tNav('search')}
              className="w-full ps-11 pe-28 py-3 rounded-full border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />

              <button type="submit" className="absolute end-1.5 top-1/2 -translate-y-1/2 h-9 px-5 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white text-sm font-semibold">
                {tNav('search')}
              </button>
            </div>
          </motion.form>
        }
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg border-t border-brand-pink/30 py-6 px-6 xl:hidden flex flex-col gap-4 max-h-[calc(100vh-5rem)] overflow-y-auto">

            {linkDefs.map((link, i) =>
          <motion.button
            key={link.key}
            initial={{
              opacity: 0,
              x: -10
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              delay: i * 0.05
            }}
            onClick={() => handleLinkClick(link)}
            className="text-start text-lg font-medium text-gray-800 hover:text-brand-gold">

                {label(link.key)}
              </motion.button>
          )}
            <div className="border-t border-brand-dark/5 pt-4 flex flex-wrap items-center gap-3">
              {!user ?
            <>
                  <Link to="/login" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold text-sm">
                    {tNav('login')}
                  </Link>
                  <Link to="/signup" className="px-5 py-2.5 rounded-full border border-brand-dark/10 text-brand-dark font-semibold text-sm">
                    {tNav('signup')}
                  </Link>
                </> :
            showShopIcons &&
            <Link to="/wishlist" className="px-5 py-2.5 rounded-full border border-brand-dark/10 text-brand-dark font-semibold text-sm inline-flex items-center gap-2">
                    <Heart className="w-4 h-4" /> {tNav('wishlist')}
                  </Link>

            }
              <div className="md:hidden">
                <LocaleSwitcher />
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}
