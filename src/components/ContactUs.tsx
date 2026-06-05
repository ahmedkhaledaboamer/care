import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Check } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
import { sendToEmail } from '../lib/sendToEmail';
interface ContactForm {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}
const empty: ContactForm = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  country: '',
  message: ''
};
export function ContactUs() {
  const t = useTranslations('Contact');
  const [form, setForm] = useState<ContactForm>(empty);
  const [submitted, setSubmitted] = useState(false);
  const handleChange =
  (field: keyof ContactForm) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  setForm((f) => ({
    ...f,
    [field]: e.target.value
  }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToEmail({
      subject: `New Contact Request from ${form.fullName}`,
      fields: {
        Name: form.fullName,
        Company: form.company,
        Email: form.email,
        Phone: form.phone,
        Country: form.country,
        Message: form.message
      }
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(empty);
    }, 6000);
  };
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
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
            }}>
            
            <div className="mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
                {t('title')}
              </h2>
              <p className="text-gray-600 text-lg">{t('description')}</p>
            </div>

            {submitted ?
            <div className="rounded-2xl border border-brand-gold/30 bg-brand-cream p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-gold/30">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-dark mb-2">
                  {t('successTitle')}
                </h3>
                <p className="text-gray-600">{t('successDesc')}</p>
              </div> :

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fullName')}
                    </label>
                    <input
                    required
                    type="text"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pinkDark focus:border-transparent transition-shadow bg-gray-50/50"
                    placeholder={t('fullNamePh')} />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('company')}
                    </label>
                    <input
                    type="text"
                    value={form.company}
                    onChange={handleChange('company')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pinkDark focus:border-transparent transition-shadow bg-gray-50/50"
                    placeholder={t('companyPh')} />
                  
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')}
                    </label>
                    <input
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pinkDark focus:border-transparent transition-shadow bg-gray-50/50"
                    placeholder={t('emailPh')} />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('phone')}
                    </label>
                    <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pinkDark focus:border-transparent transition-shadow bg-gray-50/50"
                    placeholder={t('phonePh')} />
                  
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('country')}
                  </label>
                  <input
                  type="text"
                  value={form.country}
                  onChange={handleChange('country')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pinkDark focus:border-transparent transition-shadow bg-gray-50/50"
                  placeholder={t('countryPh')} />
                
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('message')}
                  </label>
                  <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange('message')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pinkDark focus:border-transparent transition-shadow bg-gray-50/50 resize-none"
                  placeholder={t('messagePh')}>
                </textarea>
                </div>

                <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1">
                
                  {t('submit')}
                </button>
              </form>
            }
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
            }}
            className="relative h-full min-h-[500px] rounded-[2rem] overflow-hidden shadow-2xl">
            
            <img
 src="/images/banner/b8.png"              alt=""
              className="absolute inset-0 w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            <div className="absolute bottom-8 start-8 end-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-dark" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {t('hqLabel')}
                    </p>
                    <p className="text-sm text-gray-600">{t('hqValue')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-peach flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-dark" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {t('emailLabel')}
                    </p>
                    <p className="text-sm text-gray-600" dir="ltr">
                      royalcareuae@hotmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}