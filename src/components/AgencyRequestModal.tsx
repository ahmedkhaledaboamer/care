import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
import { sendToEmail } from '../lib/sendToEmail';

interface AgencyRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const RECIPIENT_EMAIL = 'royalcareuae@hotmail.com';

export function AgencyRequestModal({
  open,
  onClose
}: AgencyRequestModalProps) {
  const t = useTranslations('AgencyModal');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });

  const [submitted, setSubmitted] = useState(false);

  // Lock scroll + ESC to close
  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setForm({
          name: '',
          email: '',
          phone: '',
          description: ''
        });

        setSubmitted(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({
        ...f,
        [field]: e.target.value
      }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    sendToEmail({
      subject: `Agency Request from ${form.name}`,
      fields: {
        Name: form.name,
        Email: form.email,
        Phone: form.phone,
        Description: form.description
      }
    });

    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          aria-modal="true"
          role="dialog"
          aria-labelledby="agency-modal-title"
        >
          <div
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.96
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.96
            }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 220
            }}
            className="relative bg-white rounded-3xl shadow-2xl w-full md:max-w-7xl  max-w-lg overflow-hidden"
          >
            {/* Decorative top band */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-gold to-brand-goldLight" />

            <button
              onClick={onClose}
              aria-label={t('close')}
              className="absolute top-5 end-5 z-10 w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-10">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-gold/30">
                    <Check className="w-8 h-8 text-white" />
                  </div>

                  <h3
                    id="agency-modal-title"
                    className="font-serif text-2xl md:text-3xl font-bold text-brand-dark mb-3"
                  >
                    {t('successTitle')}
                  </h3>

                  <p className="text-gray-600 mb-8">
                    {t('successDesc')}
                  </p>

                  <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-full bg-brand-dark text-white font-semibold hover:bg-black transition-colors"
                  >
                    {t('done')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-cream text-brand-gold text-xs font-semibold uppercase tracking-wider mb-3">
                      {t('eyebrow')}
                    </span>

                    <h3
                      id="agency-modal-title"
                      className="font-serif text-2xl md:text-3xl font-bold text-brand-dark mb-2"
                    >
                      {t('title')}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {t('description')}
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Name + Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('name')}
                        </label>

                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={handleChange('name')}
                          placeholder={t('namePh')}
                          className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent transition-shadow bg-gray-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('email')}
                        </label>

                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={handleChange('email')}
                          placeholder={t('emailPh')}
                          className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent transition-shadow bg-gray-50/50"
                        />
                      </div>
                    </div>

                {/* Phone + Description Row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Phone */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {t('phone')}
    </label>

    <input
      required
      type="tel"
      value={form.phone}
      onChange={handleChange('phone')}
      placeholder={t('phonePh')}
      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent transition-shadow bg-gray-50/50"
    />
  </div>

  {/* Description */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {t('descriptionLabel')}
    </label>

    <textarea
      required
      rows={1}
      value={form.description}
      onChange={handleChange('description')}
      placeholder={t('descriptionPh')}
      className="w-full px-4 py-6 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-transparent transition-shadow bg-gray-50/50 resize-none"
    />
  </div>
</div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 rtl:rotate-180" />
                      {t('submit')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}