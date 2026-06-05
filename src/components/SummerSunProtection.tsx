import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Clock,
  Sparkles,
  ShieldCheck,
  Droplets,
  ArrowRight } from
'lucide-react';
import { products } from '../data/products';
import { ProductModal } from './ProductModal';
import { useLocale, useTranslations } from '../lib/i18n';
export function SummerSunProtection() {
  const t = useTranslations('SunProtection');
  const locale = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const sunscreen = products.find((p) => p.id === 'sunscreen-spf-50') ?? null;
  const tips = [
  {
    icon: ShieldCheck,
    key: 'tip1' as const
  },
  {
    icon: Clock,
    key: 'tip2' as const
  },
  {
    icon: Droplets,
    key: 'tip3' as const
  },
  {
    icon: Sparkles,
    key: 'tip4' as const
  }];

  return (
    <section
      id="summer"
      aria-label={t('title')}
      className="relative py-24 overflow-hidden">
      
      {/* Warm sun-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/60 to-rose-50" />
      <div className="absolute -top-20 -end-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-300/40 to-orange-300/30 blur-3xl" />
      <div className="absolute -bottom-32 -start-20 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200/40 to-amber-200/30 blur-3xl" />

      {/* Animated sun decoration */}
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute top-12 end-8 md:end-20 w-28 h-28 md:w-40 md:h-40 opacity-30 pointer-events-none">
        
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {Array.from({
              length: 12
            }).map((_, i) =>
            <line
              key={i}
              x1="50"
              y1="8"
              x2="50"
              y2="20"
              transform={`rotate(${i * 30} 50 50)`} />

            )}
          </g>
          <circle cx="50" cy="50" r="14" fill="currentColor" />
        </svg>
      </motion.div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: content */}
          <motion.div
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
              duration: 0.7
            }}>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-amber-200 mb-6">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold tracking-wider text-amber-700 uppercase">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark leading-tight mb-6">
              {t('titleLine1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                {t('titleLine2')}
              </span>
            </h2>

            <p className="text-lg text-gray-700 mb-4 font-medium">
              {t('subtitle')}
            </p>
            <p className="text-base text-gray-600 mb-10">{t('description')}</p>

            {/* Tip cards */}
            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {tips.map((tip, i) =>
              <motion.div
                key={tip.key}
                initial={{
                  opacity: 0,
                  x: -10
                }}
                whileInView={{
                  opacity: 1,
                  x: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.4
                }}
                className="flex items-start gap-3 bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-4 shadow-sm">
                
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
                    <tip.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark text-sm leading-snug mb-0.5">
                      {t(`${tip.key}Title`)}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t(`${tip.key}Desc`)}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => sunscreen && setModalOpen(true)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:-translate-y-1 inline-flex items-center gap-2">
                
                {t('ctaShop')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </button>
              <a
                href="#products"
                className="px-8 py-4 rounded-full bg-white text-brand-dark font-semibold border border-amber-200 shadow-sm hover:bg-amber-50 transition-all hover:-translate-y-1">
                
                {t('ctaExplore')}
              </a>
            </div>
          </motion.div>

          {/* Right: visual */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            whileInView={{
              opacity: 1,
              scale: 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.8
            }}
            className="relative">
            
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img
 src="/images/banner/b10.png"                alt={t('imageAlt')}
                className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-transparent" />

              {/* SPF badge */}
              <motion.div
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute top-6 start-6 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl">
                
                <p className="text-[10px] font-semibold tracking-widest text-amber-600 uppercase">
                  {t('badgeLabel')}
                </p>
                <p className="font-serif text-2xl font-bold text-brand-dark leading-none">
                  SPF 50+
                </p>
              </motion.div>

              {/* Bottom info card */}
              <motion.div
                animate={{
                  y: [0, 8, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1
                }}
                className="absolute bottom-6 start-6 end-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white">
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-base font-bold text-brand-dark leading-tight">
                      {t('cardTitle')}
                    </p>
                    <p className="text-xs text-gray-600">{t('cardDesc')}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative dots */}
            <div className="absolute -top-4 -start-4 w-8 h-8 rounded-full bg-amber-300/60 blur-sm" />
            <div className="absolute -bottom-2 -end-2 w-6 h-6 rounded-full bg-rose-300/60 blur-sm" />
          </motion.div>
        </div>
      </div>

      <ProductModal
        product={modalOpen ? sunscreen : null}
        onClose={() => setModalOpen(false)} />
      
    </section>);

}