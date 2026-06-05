import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { useLocale, useTranslations } from '../lib/i18n';
export function BlogPostPage() {
  const { slug } = useParams<{
    slug: string;
  }>();
  const navigate = useNavigate();
  const t = useTranslations('BlogPost');
  const locale = useLocale();
  const post = blogPosts.find((p) => p.slug === slug);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, [slug]);
  if (!post) {
    return (
      <main className="pt-40 pb-24 min-h-screen">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-brand-dark mb-4">
            {t('notFoundTitle')}
          </h1>
          <p className="text-gray-600 mb-8">{t('notFoundDesc')}</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold">
            
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('backToBlog')}
          </Link>
        </div>
      </main>);

  }
  const related = blogPosts.
  filter((p) => p.id !== post.id && p.category === post.category).
  slice(0, 2);
  const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(iso));
  return (
    <main className="pt-32 pb-24">
      <article>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute top-10 -end-10 w-72 h-72 bg-brand-peach rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-gold mb-8 transition-colors">
              
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('back')}
            </button>

            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-cream text-brand-gold text-xs font-semibold uppercase tracking-wider mb-5">
                {post.category}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark leading-tight mb-6">
                {post.title[locale]}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-10">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-brand-dark">
                    {post.author.name[locale]}
                  </span>
                  <span className="text-gray-400">
                    • {post.author.role[locale]}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {post.readMinutes}{' '}
                  {t('minRead')}
                </span>
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.6
              }}
              className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/9] max-w-5xl mx-auto">
              
              <img
                src={post.image}
                alt={post.title[locale]}
                className="w-full h-full object-cover" />
              
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-6 md:px-12 mt-16">
          <div className="max-w-3xl mx-auto prose-content">
            {post.content.map((para, idx) =>
            <p
              key={idx}
              className="text-lg text-gray-700 leading-relaxed mb-6">
              
                {para[locale]}
              </p>
            )}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 &&
        <section className="container mx-auto px-6 md:px-12 mt-24">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-dark mb-10">
                {t('related')}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {related.map((r) =>
              <button
                key={r.id}
                onClick={() => navigate(`/blog/${r.slug}`)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 text-start flex flex-col">
                
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                    src={r.image}
                    alt={r.title[locale]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-bold text-brand-dark mb-2 line-clamp-2">
                        {r.title[locale]}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {r.excerpt[locale]}
                      </p>
                    </div>
                  </button>
              )}
              </div>
            </div>
          </section>
        }
      </article>
    </main>);

}