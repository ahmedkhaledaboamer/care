import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Package, Megaphone } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
import { AgencyRequestModal } from './AgencyRequestModal';
export function Agents() {
  const t = useTranslations('Agents');
  const [modalOpen, setModalOpen] = useState(false);
  const benefits = [
  {
    icon: Briefcase,
    key: 'benefit1' as const
  },
  {
    icon: Megaphone,
    key: 'benefit2' as const
  },
  {
    icon: TrendingUp,
    key: 'benefit3' as const
  },
  {
    icon: Package,
    key: 'benefit4' as const
  }];

  return (
    <section
      id="agents"
      className="py-24 bg-brand-cream/50 relative overflow-hidden">
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
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
            className="relative">
            
            <div className="rounded-[2rem] overflow-hidden shadow-2xl  ">
              <img
 src="/images/banner/b7.png"
                 alt="Business partnership and boutique"
                className="w-full h-full object-cover" />
              
            </div>
            <div className="absolute -bottom-6 -end-6 bg-white p-6 rounded-2xl shadow-xl border border-brand-gold/20 max-w-[200px]">
              <p className="font-serif text-2xl font-bold text-brand-gold mb-1">
                {t('badge1')}
              </p>
              <p className="text-sm text-gray-600 font-medium">{t('badge2')}</p>
            </div>
          </motion.div>

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
            
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-6">
              {t('title')}
            </h2>
            <p className="text-gray-600 text-lg mb-8">{t('description')}</p>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((benefit) =>
              <div
                key={benefit.key}
                className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm border border-brand-pink/30">
                
                  <div className="w-10 h-10 rounded-full bg-brand-pink/50 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-brand-dark" />
                  </div>
                  <p className="font-medium text-brand-dark mt-2">
                    {t(benefit.key)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1">
              
              {t('cta')}
            </button>
          </motion.div>
        </div>
      </div>

      <AgencyRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)} />
      
    </section>);

}