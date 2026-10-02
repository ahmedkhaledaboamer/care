import { Loader2 } from 'lucide-react';
import { useTranslations } from '../../lib/i18n';

export function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label }: { label?: string }) {
  const tUi = useTranslations('Ui');
  label = label ?? tUi('loading');
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-brand-dark/60" role="status">
      <Spinner className="w-8 h-8 text-brand-gold" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-brand-dark/[0.06] ${className}`} aria-hidden="true" />;
}
