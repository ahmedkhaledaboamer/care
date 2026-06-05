import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Beaker,
  Package,
  BookOpen
} from 'lucide-react';

import type { Product } from '../data/products';
import { useLocale, useTranslations } from '../lib/i18n';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({
  product,
  onClose
}: ProductModalProps) {
  const t = useTranslations('ProductModal');
  const locale = useLocale();

  useEffect(() => {
    if (!product) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
          fixed
          inset-0
          z-[10000]
          flex
          items-center
          justify-center
          p-3
          md:p-6
        "
        aria-modal="true"
        role="dialog"
        aria-labelledby="product-modal-title"
      >
        {/* Overlay */}
        <div
          className="
            absolute
            inset-0
            bg-black/60
            backdrop-blur-sm
          "
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.98
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.98
          }}
          transition={{
            type: 'spring',
            damping: 22,
            stiffness: 240
          }}
          className="
            relative
            w-full
            max-w-4xl
            max-h-[92vh]
            bg-white
            rounded-[32px]
            shadow-2xl
            overflow-hidden
            flex
            flex-col
          "
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="
              absolute
              top-4
              end-4
              z-20
              w-10
              h-10
              rounded-full
              bg-brand-cream
              shadow-md
              flex
              items-center
              justify-center
              text-brand-dark
              hover:bg-brand-gold
              hover:text-white
              transition-all
            "
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div
            className="
              overflow-y-auto
              px-5
              py-6
              sm:px-7
              md:px-10
              lg:px-12
              max-h-[calc(92vh-3rem)]
            "
          >
              {/* Category */}
              <span
                className="
                  inline-block
                  px-3
                  py-1
                  rounded-full
                  bg-brand-cream
                  text-brand-gold
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                  mb-4
                "
              >
                {product.category}
              </span>

              {/* Title */}
              <h2
                id="product-modal-title"
                className="
                  font-serif
                  text-2xl
                  sm:text-3xl
                  lg:text-[44px]
                  font-bold
                  leading-[1.2]
                  text-brand-dark
                  mb-4
                  break-words
                "
              >
                {product.name[locale]}
              </h2>

              {/* Description */}
              <p
                className="
                  text-[15px]
                  sm:text-base
                  leading-8
                  text-gray-600
                  mb-8
                "
              >
                {product.fullDescription[locale]}
              </p>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Benefits */}
                <div className="bg-brand-cream/40 rounded-3xl p-5 border border-brand-pinkDark/10">
                  <h3
                    className="
                      text-xs
                      sm:text-sm
                      font-semibold
                      tracking-wider
                      text-brand-dark
                      uppercase
                      mb-4
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Check className="w-4 h-4 text-brand-gold shrink-0" />
                    {t('benefits')}
                  </h3>

                  <ul className="space-y-3">
                    {product.benefits.map((b) => (
                      <li
                        key={b.en}
                        className="
                          flex
                          items-start
                          gap-3
                          text-[15px]
                          leading-7
                          text-gray-700
                        "
                      >
                        <span className="mt-3 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />

                        <span className="break-words">
                          {b[locale]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ingredients */}
                <div className="bg-brand-cream/40 rounded-3xl p-5 border border-brand-pinkDark/10">
                  <h3
                    className="
                      text-xs
                      sm:text-sm
                      font-semibold
                      tracking-wider
                      text-brand-dark
                      uppercase
                      mb-4
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Beaker className="w-4 h-4 text-brand-gold shrink-0" />
                    {t('ingredients')}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((i) => (
                      <span
                        key={i.en}
                        className="
                          px-4
                          py-2
                          rounded-full
                          bg-white
                          border
                          border-brand-pinkDark/20
                          text-[13px]
                          font-medium
                          text-brand-dark
                        "
                      >
                        {i[locale]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Directions */}
              {product.directions && (
                <div className="mt-6">
                  <div className="bg-brand-cream/40 rounded-3xl p-5 border border-brand-pinkDark/10">
                    <h3
                      className="
                        text-xs
                        sm:text-sm
                        font-semibold
                        tracking-wider
                        text-brand-dark
                        uppercase
                        mb-4
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <BookOpen className="w-4 h-4 text-brand-gold shrink-0" />
                      {t('directions')}
                    </h3>

                    <p
                      className="
                        text-[15px]
                        leading-8
                        text-gray-700
                      "
                    >
                      {product.directions[locale]}
                    </p>
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mt-6">
                <div className="bg-brand-cream/40 rounded-3xl p-5 border border-brand-pinkDark/10">
                  <h3
                    className="
                      text-xs
                      sm:text-sm
                      font-semibold
                      tracking-wider
                      text-brand-dark
                      uppercase
                      mb-4
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Package className="w-4 h-4 text-brand-gold shrink-0" />
                    {t('sizes')}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <span
                        key={s.en}
                        className="
                          px-4
                          py-2
                          rounded-xl
                          border
                          border-brand-dark/10
                          text-[13px]
                          font-medium
                          text-brand-dark
                          bg-white
                        "
                      >
                        {s[locale]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <a
                  href="/#contact"
                  onClick={onClose}
                  className="
                    block
                    w-full
                    text-center
                    py-4
                    rounded-full
                    bg-gradient-to-r
                    from-brand-gold
                    to-brand-goldLight
                    text-white
                    font-semibold
                    text-[15px]
                    shadow-lg
                    hover:scale-[1.01]
                    transition-all
                  "
                >
                  {t('cta')}
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}