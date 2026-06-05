import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslations } from '../lib/i18n';
import { LocaleSwitcher } from './LocaleSwitcher';
interface NavLink {
  key: 'home' | 'products' | 'about' | 'agents' | 'blog' | 'contact';
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

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslations('Header');
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          {/* <Sparkles className="w-5 h-5 text-brand-gold transition-transform group-hover:rotate-12" />
          <span className="font-serif text-2xl font-semibold text-brand-dark tracking-wide">
            Dream & Shine
          </span> */}


          <img
 src="/images/logo.png"              alt=""
              className="  w-24" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {linkDefs.map((link) =>
          <button
            key={link.key}
            onClick={() => handleLinkClick(link)}
            className="text-sm font-medium text-gray-700 hover:text-brand-gold transition-colors relative group">
            
              {t(link.key)}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-brand-dark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu">
            
            {mobileMenuOpen ?
            <X className="w-6 h-6" /> :

            <Menu className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

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
          className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg border-t border-brand-pink/30 py-6 px-6 md:hidden flex flex-col gap-4">
          
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
              delay: i * 0.1
            }}
            onClick={() => handleLinkClick(link)}
            className="text-start text-lg font-medium text-gray-800 hover:text-brand-gold">
            
                {t(link.key)}
              </motion.button>
          )}
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}