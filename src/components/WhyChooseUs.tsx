import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Leaf, Heart } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
export function WhyChooseUs() {
  const t = useTranslations('WhyChooseUs');
  const features = [
  {
    titleKey: 'card1Title',
    descKey: 'card1Desc',
    icon: Droplets,
    bg: 'bg-gradient-to-br from-brand-pink to-white',
    iconColor: 'text-[#70A426]'
  },
  {
    titleKey: 'card2Title',
    descKey: 'card2Desc',
    icon: Leaf,
    bg: 'bg-gradient-to-br from-brand-peach to-white',
    iconColor: 'text-[#125697]'
  },
  {
    titleKey: 'card3Title',
    descKey: 'card3Desc',
    icon: Heart,
    bg: 'bg-gradient-to-br from-brand-purple to-white',
    iconColor: 'text-[#70A426]'
  }] as
  const;
  return (
    <section className="py-24 bg-white/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-lg">{t('description')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) =>
          <motion.div
            key={feature.titleKey}
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
              delay: index * 0.2,
              duration: 0.6
            }}
            className={`${feature.bg} rounded-3xl p-8 shadow-sm border border-white/60 hover:shadow-lg transition-shadow`}>
            
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}