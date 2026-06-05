import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  products,
  categories,
  type Product,
  type Category } from
'../data/products';
import { ProductModal } from '../components/ProductModal';
import { useLocale, useTranslations } from '../lib/i18n';
export function ProductsPage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const t = useTranslations('ProductsPage');
  const locale = useLocale();
  const categoryLabel = (c: Category) => {
    switch (c) {
      case 'All':
        return t('categoryAll');
      case 'Hair Care':
        return t('categoryHair');
      case 'Skin Care':
        return t('categorySkin');
      case 'Sun Protection':
        return t('categorySun');
      case 'Anti Acne':
        return t('categoryAcne');
      case 'Body Care':
        return t('categoryBody');
    }
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesQuery =
      q === '' ||
      p.name[locale].toLowerCase().includes(q) ||
      p.shortDescription[locale].toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, locale]);
  return (
    <main className="pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute top-10 -start-10 w-72 h-72 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="absolute top-20 -end-10 w-72 h-72 bg-brand-peach rounded-full mix-blend-multiply filter blur-3xl opacity-50" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-brand-gold transition-colors">
              {t('breadcrumbHome')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-brand-dark font-medium">
              {t('breadcrumbProducts')}
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
                {t('eyebrow')}
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-brand-dark mb-6">
              {t('title')}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              {t('description')}
            </p>
          </div>

          <div className="mt-12 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) =>
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${category === cat ? 'bg-brand-dark text-white border-brand-dark shadow-md' : 'bg-white/70 backdrop-blur-sm text-brand-dark border-brand-dark/10 hover:border-brand-gold/50'}`}>
                
                  {categoryLabel(cat)}
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full ps-11 pe-4 py-3 rounded-full border border-brand-dark/10 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent transition-shadow" />
              
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-12 mt-16">
        {filtered.length === 0 ?
        <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('emptyState')}</p>
          </div> :

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((product, index) =>
          <motion.div
            key={product.id}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: index % 8 * 0.05,
              duration: 0.4
            }}
            className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 flex flex-col">
            
                <div
              className={`relative w-full aspect-square rounded-2xl mb-6 overflow-hidden ${product.bg} flex items-center justify-center p-4`}>
              
                  <img
                src={product.image}
                alt={product.name[locale]}
                className="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500" />
              
                  <span className="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold tracking-wider text-brand-dark uppercase">
                    {categoryLabel(product.category)}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-dark mb-3">
                  {product.name[locale]}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                  {product.shortDescription[locale]}
                </p>
                <button
              onClick={() => setSelected(product)}
              className="flex items-center gap-2 text-brand-gold font-semibold text-sm group/btn self-start">
              
                  {t('moreDetails')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform rtl:rotate-180" />
                </button>
              </motion.div>
          )}
          </div>
        }
      </section>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </main>);

}