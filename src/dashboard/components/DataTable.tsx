import type { ReactNode } from 'react';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { useTranslations } from '../../lib/i18n';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide in the mobile card view (e.g. redundant with the title). */
  hideOnMobile?: boolean;
  align?: 'start' | 'end' | 'center';
}

interface Props<T> {
  rows?: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  fetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: ReactNode;
  /** Card title on mobile. */
  mobileTitle?: (row: T) => ReactNode;
  actions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
}

/** Table on md+; stacked cards on small screens (no page-wide overflow). */
export function DataTable<T>({ rows, columns, rowKey, loading, fetching, error, onRetry, empty, mobileTitle, actions, onRowClick }: Props<T>) {
  const t = useTranslations('Dash');
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  if (loading && !rows) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!rows?.length) return <>{empty ?? <EmptyState title={t('common.nothingHere')} />}</>;

  const align = (a?: Column<T>['align']) => (a === 'end' ? 'text-end' : a === 'center' ? 'text-center' : 'text-start');

  return (
    <div className={fetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${align(c.align)} ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-slate-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${align(c.align)} ${c.className ?? ''}`}>
                    {c.cell(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-end whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={rowKey(row)} className="p-4" onClick={onRowClick ? () => onRowClick(row) : undefined}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">{mobileTitle ? mobileTitle(row) : columns[0].cell(row)}</div>
              {actions && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </div>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {columns
                .filter((c, i) => !c.hideOnMobile && (mobileTitle ? true : i > 0))
                .map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wider text-slate-400">{c.header}</dt>
                    <dd className="text-slate-700 truncate">{c.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
