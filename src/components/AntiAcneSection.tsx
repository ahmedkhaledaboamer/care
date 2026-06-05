import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Droplets,
  Sparkles,
  ChevronRight,
  CheckCircle2 } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products, type Product } from '../data/products';
import { ProductModal } from './ProductModal';
import { useLocale, useTranslations } from '../lib/i18n';
export function AntiAcneSection() {
  const navigate = useNavigate();
  const t = useTranslations('AntiAcne');
  const locale = useLocale();
  const [selected, setSelected] = useState<Product | null>(null);
  // Filter the 4 anti-acne products
  const acneProducts = products.filter((p) => p.category === 'Anti Acne');
  // Map products to steps based on ID
  const getStepNumber = (id: string) => {
    if (id.includes('face-wash')) return 1;
    if (id.includes('soap')) return 2;
    if (id.includes('gel')) return 3;
    if (id.includes('body-spray')) return 4;
    return 1;
  };
  // Sort products by step
  const sortedProducts = [...acneProducts].sort(
    (a, b) => getStepNumber(a.id) - getStepNumber(b.id)
  );
  const faceWash = acneProducts.find((p) => p.id.includes('face-wash'));
  const steps = [
  {
    title: t('step1Title'),
    desc: t('step1Desc'),
    icon: Droplets
  },
  {
    title: t('step2Title'),
    desc: t('step2Desc'),
    icon: Shield
  },
  {
    title: t('step3Title'),
    desc: t('step3Desc'),
    icon: Sparkles
  },
  {
    title: t('step4Title'),
    desc: t('step4Desc'),
    icon: CheckCircle2
  }];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-blue-50/50">
      {/* Clinical Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-goldLight/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header & Routine Section */}
        <div className="flex flex-col lg:flex-row gap-16 mb-20">
          {/* Left Column: Text & Steps */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-brand-goldLight" />
              <span className="text-sm font-semibold tracking-wider text-brand-goldLight uppercase">
                {t('eyebrow')}
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-6 leading-tight">
              {t('titleLine1')} <br />
              <span className="text-brand-goldLight">{t('titleLine2')}</span>
            </h2>
            <p className="text-gray-600 text-lg mb-10 max-w-xl leading-relaxed">
              {t('description')}
            </p>

            {/* 4-Step Routine List */}
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{
                      opacity: 0,
                      x: -20
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0
                    }}
                    viewport={{
                      once: true
                    }}
                    transition={{
                      delay: idx * 0.1,
                      duration: 0.5
                    }}
                    className="flex items-start gap-4">
                    
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center shrink-0 text-brand-goldLight">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark text-lg mb-1">
                        {step.title}
                      </h4>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </motion.div>);

              })}
            </div>
          </div>

          {/* Right Column: Featured Hero Card */}
          <div className="lg:w-1/2 flex justify-center items-center">
            {faceWash &&
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
                duration: 0.7
              }}
              className="relative w-full max-w-md">
              
                {/* Decorative Halos */}
                <div className="absolute inset-0 bg-brand-goldLight/10 rounded-full blur-2xl animate-pulse" />

                <div className="relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-50">
                  <div className="absolute top-6 right-6 bg-blue-50 text-brand-goldLight text-xs font-bold px-3 py-1 rounded-full">
                    {t('stepBadge')} 01
                  </div>

                  <div className="aspect-square rounded-3xl overflow-hidden mb-8 bg-blue-50/50 flex items-center justify-center p-6 relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-goldLight/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img
                    src={faceWash.image}
                    alt={faceWash.name[locale]}
                    className="w-full h-full object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500" />
                  
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-brand-dark mb-3 text-center">
                    {faceWash.name[locale]}
                  </h3>
                  <p className="text-gray-500 text-center mb-6">
                    {faceWash.shortDescription[locale]}
                  </p>

                  <button
                  onClick={() => setSelected(faceWash)}
                  className="w-full py-4 rounded-2xl bg-blue-50 text-brand-goldLight font-semibold hover:bg-brand-goldLight hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                  
                    {t('learnMore')}
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>

                {/* Floating clinical icons */}
                <motion.div
                animate={{
                  y: [-10, 10, -10]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-blue-50 text-brand-goldLight">
                
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <motion.div
                animate={{
                  y: [10, -10, 10]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1
                }}
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border border-blue-50 text-brand-goldLight">
                
                  <Droplets className="w-6 h-6" />
                </motion.div>
              </motion.div>
            }
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sortedProducts.map((product, index) => {
            const stepNum = getStepNumber(product.id);
            return (
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
                onClick={() => setSelected(product)}
                className="group cursor-pointer bg-white rounded-3xl p-5 shadow-sm border border-blue-50 hover:shadow-xl hover:border-brand-goldLight/30 transition-all duration-300 flex flex-col">
                
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-50 text-brand-goldLight text-xs font-bold px-3 py-1 rounded-full">
                    {t('stepBadge')} 0{stepNum}
                  </span>
                  <Shield className="w-4 h-4 text-brand-goldLight/40 group-hover:text-brand-goldLight transition-colors" />
                </div>

                <div className="relative w-full aspect-square rounded-2xl mb-5 overflow-hidden bg-blue-50/30 flex items-center justify-center p-4">
                  <img
                    src={product.image}
                    alt={product.name[locale]}
                    className="w-full h-full object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-500" />
                  
                </div>

                <h3 className="font-serif text-lg font-bold text-brand-dark mb-2">
                  {product.name[locale]}
                </h3>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2 flex-grow">
                  {product.shortDescription[locale]}
                </p>

                <div className="flex items-center gap-1 text-brand-goldLight font-semibold text-sm mt-auto">
                  {t('learnMore')}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </div>
              </motion.div>);

          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/products?category=Anti%20Acne')}
            className="px-8 py-4 rounded-full bg-brand-goldLight text-white font-semibold shadow-lg shadow-brand-goldLight/20 hover:shadow-brand-goldLight/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2">
            
            {t('cta')}
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>);

}