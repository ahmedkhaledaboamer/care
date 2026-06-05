import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ChevronRight, Droplet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products, type Product } from '../data/products';
import { ProductModal } from './ProductModal';
import { useLocale, useTranslations } from '../lib/i18n';
export function NaturalHairCare() {
  const navigate = useNavigate();
  const t = useTranslations('NaturalHairCare');
  const locale = useLocale();
  const [selected, setSelected] = useState<Product | null>(null);
  // Filter the 6 specific hair oils
  const hairOils = products.filter(
    (p) => p.category === 'Hair Care' && p.id.endsWith('-hair-oil')
  );
  // Floating leaves animation variants
  const leafVariants = {
    animate: (i: number) => ({
      y: ['-10%', '10%', '-10%'],
      x: ['-5%', '5%', '-5%'],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 6 + i * 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    })
  };
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-brand-cream/50 to-white">
      {/* Organic Background Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-goldLight/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Floating Leaves */}
      {[...Array(6)].map((_, i) =>
      <motion.div
        key={i}
        custom={i}
        variants={leafVariants}
        animate="animate"
        className="absolute text-brand-gold/20 pointer-events-none"
        style={{
          top: `${15 + i * 15}%`,
          left: `${10 + i % 3 * 35}%`,
          scale: 0.5 + i % 3 * 0.3
        }}>
        
          <Leaf className="w-12 h-12" />
        </motion.div>
      )}

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 mb-4">
              <Leaf className="w-4 h-4 text-brand-gold" />
              <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
                {t('eyebrow')}
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              {t('titleLine1')} <br />
              <span className="text-brand-gold">{t('titleLine2')}</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed">
              {t('description')}
            </p>

            {/* Stat Strip */}
            <div className="flex flex-wrap gap-6 text-sm font-medium text-brand-dark/80">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-brand-gold" />
                {t('stat1')}
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                {t('stat2')}
              </div>
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-brand-gold" />
                {t('stat3')}
              </div>
            </div>
          </div>

          {/* Decorative Illustration Area */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 bg-brand-gold/10 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-brand-gold/20 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Leaf
                  className="w-32 h-32 text-brand-gold opacity-80"
                  strokeWidth={1} />
                
              </div>
              {/* Small floating elements */}
              <motion.div
                animate={{
                  y: [-10, 10, -10]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute top-10 right-10 bg-white p-3 rounded-full shadow-lg">
                
                <Droplet className="w-6 h-6 text-brand-goldLight" />
              </motion.div>
              <motion.div
                animate={{
                  y: [10, -10, 10]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute bottom-10 left-10 bg-white p-3 rounded-full shadow-lg">
                
                <Sparkles className="w-6 h-6 text-brand-gold" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {hairOils.map((product, index) =>
          <motion.div
            key={product.id}
            initial={{
              opacity: 0,
              y: 30
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
              duration: 0.6
            }}
            onClick={() => setSelected(product)}
            className="group cursor-pointer bg-white rounded-[2rem] p-6 shadow-sm border border-brand-gold/10 hover:shadow-xl hover:border-brand-gold/30 transition-all duration-300 relative overflow-hidden">
            
              {/* Subtle Leaf Watermark */}
              <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-brand-gold/5 group-hover:text-brand-gold/10 transition-colors transform -rotate-45" />

              <div className="relative flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 shadow-md border-4 border-white group-hover:scale-105 transition-transform duration-500">
                  <img
                  src={product.image}
                  alt={product.name[locale]}
                  className="w-full h-full object-cover" />
                
                </div>

                <h3 className="font-serif text-2xl font-bold text-brand-dark mb-2">
                  {product.name[locale]}
                </h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-1">
                  {product.shortDescription[locale]}
                </p>

                {/* Ingredient Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {product.ingredients.slice(0, 3).map((ing, i) =>
                <span
                  key={i}
                  className="px-3 py-1 bg-brand-gold/5 text-brand-gold text-xs font-medium rounded-full">
                  
                      {ing[locale]}
                    </span>
                )}
                </div>

                <div className="flex items-center gap-2 text-brand-gold font-semibold text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {t('learnMore')}
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/products?category=Hair%20Care')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2">
            
            {t('cta')}
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>);

}