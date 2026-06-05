import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '../lib/i18n';
export function Banner() {
  const t = useTranslations('Banner');
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1615397323783-943388c69fdd?auto=format&fit=crop&q=80&w=1600"
          alt=""
          className="w-full h-full object-cover object-center" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/90 via-brand-peach/80 to-brand-purple/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
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
            duration: 0.8
          }}
          className="max-w-3xl mx-auto">
          
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-brand-dark mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-brand-dark/80 mb-10 font-medium">
            {t('description')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#products"
              className="px-8 py-4 rounded-full bg-brand-dark text-white font-semibold shadow-lg hover:bg-black transition-all hover:-translate-y-1">
              
              {t('ctaExplore')}
            </a>
            <a
              href="#agents"
              className="px-8 py-4 rounded-full bg-white text-brand-dark font-semibold shadow-lg hover:bg-brand-cream transition-all hover:-translate-y-1">
              
              {t('ctaAgent')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>);

}