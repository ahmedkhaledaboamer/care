import React, { useState } from 'react';
import {
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight } from
'lucide-react';
import { useTranslations } from '../lib/i18n';
import { sendToEmail } from '../lib/sendToEmail';
export function Footer() {
  const tFooter = useTranslations('Footer');
  const tHeader = useTranslations('Header');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const quickLinks: Array<
    'home' | 'products' | 'about' | 'agents' | 'blog' | 'contact'> =
  ['home', 'products', 'about', 'agents', 'blog', 'contact'];
  const categoryKeys = [
  'catHairOils',
  'catShampoo',
  'catSunscreen',
  'catSkin',
  'catAcne'] as
  const;
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    sendToEmail({
      subject: 'Newsletter Subscription',
      fields: {
        Email: newsletterEmail,
        Source: 'Footer newsletter signup'
      }
    });
    setNewsletterEmail('');
  };
  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              {/* <Sparkles className="w-6 h-6 text-brand-gold" />
              <span className="font-serif text-3xl font-semibold tracking-wide">
                Dream & Shine
              </span> */}
                    <img
 src="/images/logo.png"              alt=""
              className="  w-36" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {tFooter('tagline')}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold transition-colors">
                
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold transition-colors">
                
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold transition-colors">
                
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xl font-semibold mb-6 text-brand-goldLight">
              {tFooter('quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((key) =>
              <li key={key}>
                  <a
                  href={
                  key === 'products' ?
                  '/products' :
                  key === 'blog' ?
                  '/blog' :
                  `#${key}`
                  }
                  className="text-gray-400 hover:text-white transition-colors">
                  
                    {tHeader(key)}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl font-semibold mb-6 text-brand-goldLight">
              {tFooter('categories')}
            </h4>
            <ul className="space-y-3">
              {categoryKeys.map((key) =>
              <li key={key}>
                  <a
                  href="/products"
                  className="text-gray-400 hover:text-white transition-colors">
                  
                    {tFooter(key)}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl font-semibold mb-6 text-brand-goldLight">
              {tFooter('stayUpdated')}
            </h4>
            <p className="text-gray-400 mb-4">{tFooter('newsletter')}</p>
            <form className="flex gap-2 mb-8" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={tFooter('emailPh')}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-brand-gold text-white placeholder-gray-500" />
              
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark rounded-lg px-4 py-2 transition-colors flex items-center justify-center">
                
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </form>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Royal Care General Trading L.L.C</p>
              <p>UAE</p>
              <p dir="ltr">Email: royalcareuae@hotmail.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          <p>{tFooter('copyright')}</p>
        </div>
      </div>
    </footer>);

}