import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslations } from '../../lib/i18n';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations('Common');
  const tUi = useTranslations('Ui');
  return (
    <nav aria-label={tUi('breadcrumb')} className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-y-1">
      <Link to="/" className="hover:text-brand-gold transition-colors">
        {t('home')}
      </Link>
      {items.map((c, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          {c.to ? (
            <Link to={c.to} className="hover:text-brand-gold transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-brand-dark font-medium line-clamp-1" aria-current="page">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Page intro shared by storefront pages — same look as the original products page. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  description,
  children,
  compact = false
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-10 -start-10 w-72 h-72 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-20 -end-10 w-72 h-72 bg-brand-peach rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <Breadcrumbs items={crumbs} />
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">{eyebrow}</span>
            </div>
          )}
          <h1 className={`font-serif font-bold text-brand-dark ${compact ? 'text-3xl md:text-4xl mb-3' : 'text-4xl md:text-6xl mb-5'}`}>{title}</h1>
          {description && <p className="text-gray-600 text-base md:text-lg max-w-2xl">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold tracking-wider text-brand-gold uppercase">{eyebrow}</span>
          </div>
        )}
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-dark mb-3">{title}</h2>
        {description && <p className="text-gray-600 text-lg">{description}</p>}
      </div>
      {action}
    </div>
  );
}
