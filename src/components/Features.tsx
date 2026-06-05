import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '../lib/i18n';

export function Features() {
  const t = useTranslations('Features');

  return (
    <section className="py-24 bg-gray-100">
      <div className="container mx-auto px-6 md:px-12">

        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark">
            {t('title')}
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Card 1 */}
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
              duration: 0.6
            }}
            className="group relative rounded-[2rem] overflow-hidden shadow-xl bg-black"
          >

            {/* Background Image */}
            <img
              src="/images/banner/b13.png"
              alt={t('card1Title')}
              className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90"></div>

            {/* Content */}
            <div className="absolute bottom-0 start-0 end-0 p-8 md:p-10">
              <h3 className="font-serif text-3xl font-bold text-white mb-4">
                {t('card1Title')}
              </h3>

              <p className="text-white/90 text-lg leading-relaxed">
                {t('card1Desc')}
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
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
              duration: 0.6,
              delay: 0.2
            }}
            className="group relative rounded-[2rem] overflow-hidden shadow-xl bg-black"
          >

            {/* Background Image */}
            <img
              src="/images/banner/b15.png"
              alt={t('card2Title')}
              className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90"></div>

            {/* Content */}
            <div className="absolute bottom-0 start-0 end-0 p-8 md:p-10">
              <h3 className="font-serif text-3xl font-bold text-white mb-4">
                {t('card2Title')}
              </h3>

              <p className="text-white/90 text-lg leading-relaxed">
                {t('card2Desc')}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}