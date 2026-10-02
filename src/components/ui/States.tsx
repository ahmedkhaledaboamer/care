import type { ReactNode } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, PackageOpen, RotateCw, Star } from 'lucide-react';
import { Button } from './Button';
import { errorMessage } from '../../api/client';
import { useTranslations } from '../../lib/i18n';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-pink flex items-center justify-center text-brand-gold">
        {icon ?? <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="font-serif text-xl font-bold text-brand-dark">{title}</h3>
      {description && <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title,
  retryLabel,
  className = ''
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: ReactNode;
  retryLabel?: string;
  className?: string;
}) {
  const tUi = useTranslations('Ui');
  return (
    <div className={`text-center py-14 px-6 ${className}`} role="alert">
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg text-brand-dark">{title ?? tUi('errorTitle')}</h3>
      <p className="text-gray-500 mt-1 text-sm max-w-md mx-auto">{errorMessage(error, tUi('genericError'))}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw className="w-4 h-4" />
          {retryLabel ?? tUi('retry')}
        </Button>
      )}
    </div>
  );
}

export type BadgeTone = 'green' | 'blue' | 'gray' | 'red' | 'amber' | 'navy';
const tones: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  navy: 'bg-brand-dark text-white ring-brand-dark'
};

export function Badge({ tone = 'gray', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Prev/next pager driven by `pagination.next` / `prev`. */
export function Pager({
  page,
  hasNext,
  hasPrev,
  onChange,
  totalPages,
  labels,
  className = ''
}: {
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
  onChange: (p: number) => void;
  totalPages?: number;
  labels?: { prev: string; next: string; page: string; of: string };
  className?: string;
}) {
  const tUi = useTranslations('Ui');
  if (!hasNext && !hasPrev) return null;
  labels = labels ?? { prev: tUi('prev'), next: tUi('next'), page: tUi('page'), of: tUi('of') };
  return (
    <nav className={`flex items-center justify-center gap-3 ${className}`} aria-label={tUi('pagination')}>
      <Button variant="secondary" size="sm" disabled={!hasPrev} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        <span className="hidden sm:inline">{labels.prev}</span>
      </Button>
      <span className="text-sm text-gray-600 tabular-nums">
        {labels.page} <strong className="text-brand-dark">{page}</strong>
        {totalPages && totalPages >= page ? (
          <>
            {' '}
            {labels.of} {totalPages}
          </>
        ) : null}
      </span>
      <Button variant="secondary" size="sm" disabled={!hasNext} onClick={() => onChange(page + 1)}>
        <span className="hidden sm:inline">{labels.next}</span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </Button>
    </nav>
  );
}

export function Stars({ value = 0, size = 'w-4 h-4', className = '' }: { value?: number; size?: string; className?: string }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${v.toFixed(1)} out of 5`} role="img">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, v - (i - 1)));
        return (
          <span key={i} className={`relative inline-block ${size}`}>
            <Star className={`absolute inset-0 ${size} text-gray-300`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} text-amber-400 fill-amber-400`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function StarInput({ value, onChange, size = 'w-7 h-7' }: { value: number; onChange: (v: number) => void; size?: string }) {
  return (
    <div className="inline-flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 rounded">
          <Star className={`${size} ${i <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}
