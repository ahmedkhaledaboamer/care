import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
export function AboutUs() {
  const t = useTranslations('AboutUs');
  const features = ['feature1', 'feature2', 'feature3', 'feature4'] as const;
  return (
    <section id="about" className="py-24 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <motion.div
              initial={{
                opacity: 0,
                x: -30
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.8
              }}
              className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto lg:mx-0">
              
              <img
 src="/images/banner/b2.png"                alt="Cosmetics laboratory and product showcase"
                className="w-full h-full object-cover" />
              
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}
              transition={{
                duration: 0.8,
                delay: 0.3
              }}
              className="absolute -bottom-10 -end-4 lg:-end-10 z-20 rounded-[2rem] overflow-hidden shadow-xl border-8 border-brand-cream w-2/3 aspect-square">
              
              <img
 src="/images/banner/b5.png"                alt="Beauty products flat lay"
                className="w-full h-full object-cover" />
              
            </motion.div>

            <div className="absolute top-10 -start-10 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 start-20 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl"></div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              x: 30
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.8
            }}>
            
            <div className="mb-4">
              <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
                {t('eyebrow')}
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-8">
              {t('title')}
            </h2>

            <div className="space-y-6 text-gray-600 text-lg">
              <p>{t('p1')}</p>
              <p>{t('p2')}</p>
              <p>{t('p3')}</p>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {features.map((key) =>
              <div key={key} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                  <span className="font-medium text-brand-dark">{t(key)}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}