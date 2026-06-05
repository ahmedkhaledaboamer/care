import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products, type Product } from '../data/products';
import { ProductModal } from './ProductModal';
import { useLocale, useTranslations } from '../lib/i18n';
export function Products() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Product | null>(null);
  const t = useTranslations('Products');
  const locale = useLocale();
  const featured = products.filter((p) => p.featured);
  return (
    <section id="products" className="py-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
              {t('eyebrow')}
            </span>
            <Sparkles className="w-4 h-4 text-brand-gold" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-lg">{t('description')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featured.map((product, index) =>
          <motion.div
            key={product.id}
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              delay: index * 0.1,
              duration: 0.5
            }}
            className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300">
            
              <div
              className={`relative w-full aspect-square rounded-2xl mb-6 overflow-hidden ${product.bg} flex items-center justify-center p-4`}>
              
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                src={product.image}
                alt={product.name[locale]}
                className="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500" />
              
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-dark mb-3">
                {product.name[locale]}
              </h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {product.shortDescription[locale]}
              </p>
              <button
              onClick={() => setSelected(product)}
              className="flex items-center gap-2 text-brand-gold font-semibold text-sm group/btn">
              
                {t('moreDetails')}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </motion.div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2">
            
            {t('viewAll')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>);

}