import { useEffect, useState, type ReactNode } from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useForm';
import { Pager } from '../../components/ui/States';
import { useTranslations } from '../../lib/i18n';

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
}

/** Search box that reports a debounced value. */
export function SearchInput({ value, onChange, placeholder = '…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 400);
  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  useEffect(() => {
    if (value !== debounced) setLocal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
      />
    </div>
  );
}

export function FilterSelect({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 pe-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/40">
      {children}
    </select>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 p-4 border-b border-slate-200">{children}</div>;
}

export function TableFooter({ page, hasNext, onChange, info }: { page: number; hasNext: boolean; onChange: (p: number) => void; info?: ReactNode }) {
  if (page <= 1 && !hasNext && !info) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
      <p className="text-xs text-slate-500">{info}</p>
      <Pager page={page} hasPrev={page > 1} hasNext={hasNext} onChange={onChange} />
    </div>
  );
}

export function IconAction({ label, onClick, tone = 'default', children }: { label: string; onClick: () => void; tone?: 'default' | 'danger'; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors ${tone === 'danger' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}>
      {children}
    </button>
  );
}

export function EditAction({ onClick }: { onClick: () => void }) {
  const t = useTranslations('Ui');
  return (
    <IconAction label={t('edit')} onClick={onClick}>
      <Pencil className="w-4 h-4" />
    </IconAction>
  );
}

export function DeleteAction({ onClick }: { onClick: () => void }) {
  const t = useTranslations('Ui');
  return (
    <IconAction label={t('delete')} tone="danger" onClick={onClick}>
      <Trash2 className="w-4 h-4" />
    </IconAction>
  );
}

export function StatCard({ label, value, icon, hint, tone = 'green' }: { label: string; value: ReactNode; icon: ReactNode; hint?: ReactNode; tone?: 'green' | 'blue' | 'amber' | 'navy' }) {
  const tones = {
    green: 'bg-brand-pink text-brand-gold',
    blue: 'bg-brand-peach text-brand-goldLight',
    amber: 'bg-amber-50 text-amber-600',
    navy: 'bg-slate-100 text-brand-dark'
  };
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums truncate">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>{icon}</span>
      </div>
    </Panel>
  );
}

export function Thumb({ src, alt = '', rounded = 'rounded-lg', size = 'w-10 h-10' }: { src?: string | null; alt?: string; rounded?: string; size?: string }) {
  return <div className={`${size} ${rounded} overflow-hidden bg-slate-100 shrink-0`}>{src && <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />}</div>;
}
