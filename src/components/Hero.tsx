import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Sparkles } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
export function Hero() {
  const t = useTranslations('Hero');
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center">
      
      <div className="absolute top-20 start-10 w-72 h-72 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute top-40 end-10 w-72 h-72 bg-brand-peach rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-8 start-40 w-72 h-72 bg-brand-purple rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8
            }}
            className="max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-brand-gold/30 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-semibold tracking-wider text-brand-dark uppercase">
                {t('eyebrow')}
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark leading-tight mb-6">
              {t('titleLine1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldLight">
                {t('titleLine2')}
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-4 font-medium">
              {t('subtitle')}
            </p>
            <p className="text-base text-gray-500 mb-8">{t('description')}</p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="#products"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1">
                
                {t('ctaExplore')}
              </a>
              <a
                href="#agents"
                className="px-8 py-4 rounded-full bg-white text-brand-dark font-semibold border border-brand-gold/30 shadow-sm hover:bg-brand-cream transition-all hover:-translate-y-1">
                
                {t('ctaAgent')}
              </a>
            </div>

            <div className="flex flex-wrap gap-6 items-center border-t border-brand-pinkDark/30 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center">
                  <Star className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark">{t('stat1Value')}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('stat1Label')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-peach flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark">{t('stat2Value')}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('stat2Label')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark">{t('stat3Value')}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('stat3Label')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative h-[600px] hidden lg:block">
            <motion.div
              animate={{
                y: [0, -15, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-10 end-0 w-3/4 h-3/4 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white z-20">
              
              <img
                src="/images/banner/b4.png"
                alt="Beautiful healthy hair & glowing skin model"
                className="w-full h-full object-cover" />
              
            </motion.div>

            <motion.div
              animate={{
                y: [0, 15, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
              className="absolute bottom-0 start-0 w-1/2 h-1/2 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-30">
              
              <img
 src="/images/banner/b3.png"
                 alt="Hair Oil Products"
                className="w-full h-full object-cover" />
              
            </motion.div>

            <motion.div
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
              className="absolute top-0 start-10 w-2/5 h-2/5 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-10">
              
              <img
 src="/images/banner/b2.png"
                 alt="Skin Care Collection"
                className="w-full h-full object-cover" />
              
            </motion.div>
          </div>
        </div>
      </div>
    </section>);

}