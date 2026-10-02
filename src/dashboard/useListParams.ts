import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Dashboard list state (page, keyword, filters) kept in the URL so it
 * survives reloads and back/forward navigation.
 */
export function useListParams<K extends string>(filterKeys: readonly K[] = []) {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const keyword = sp.get('q') ?? '';
  const filters = Object.fromEntries(filterKeys.map((k) => [k, sp.get(k) ?? ''])) as Record<K, string>;

  const set = useCallback(
    (patch: Record<string, string | number | null>, keepPage = false) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === '') next.delete(k);
            else next.set(k, String(v));
          }
          if (!keepPage && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSp]
  );

  const hasFilters = !!keyword || filterKeys.some((k) => !!filters[k]);

  return {
    page,
    keyword,
    filters,
    hasFilters,
    setPage: (p: number) => set({ page: p }, true),
    setKeyword: (q: string) => set({ q }),
    setFilter: (k: K, v: string) => set({ [k]: v })
  };
}
