import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { useLocale, useTranslations } from '../lib/i18n';
export function Blog() {
  const navigate = useNavigate();
  const t = useTranslations('Blog');
  const locale = useLocale();
  const featured = blogPosts.filter((p) => p.featured).slice(0, 3);
  const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(iso));
  return (
    <section id="blog" className="py-24 relative z-10 bg-white/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
              {t('eyebrow')}
            </span>
            <Sparkles className="w-4 h-4 text-brand-gold" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-lg">{t('description')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featured.map((post, index) =>
          <motion.article
            key={post.id}
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
            className="group bg-white rounded-3xl overflow-hidden shadow-sm  border border-transparent hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 flex flex-col">
            
              <button
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="relative aspect-[14/10] overflow-hidden text-start">
              
                <img
                src={post.image}
                alt={post.title[locale]}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              
                <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold tracking-wider text-brand-dark uppercase">
                  {post.category}
                </span>
              </button>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {post.readMinutes}{' '}
                    {t('minRead')}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-brand-dark mb-3 line-clamp-2">
                  {post.title[locale]}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                  {post.excerpt[locale]}
                </p>

                <button
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="flex items-center gap-2 text-brand-gold font-semibold text-sm group/btn self-start">
                
                  {t('readMore')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform rtl:rotate-180" />
                </button>
              </div>
            </motion.article>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/blog')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2">
            
            {t('viewAll')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>);

}