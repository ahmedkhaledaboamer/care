import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { assertCan, can, type Action } from '../auth/permissions';
import { ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useTranslations } from '../lib/i18n';

/**
 * Confirm-then-delete flow. The permission is checked again inside the
 * action (not only by hiding the button) — deletes are admin-only.
 */
export function useDeleteFlow<T>({
  remove,
  invalidate,
  describe,
  action = 'resource:delete',
  noun
}: {
  remove: (row: T) => Promise<unknown>;
  invalidate: QueryKey[];
  describe: (row: T) => ReactNode;
  action?: Action;
  noun: string;
}) {
  const { user } = useAuth();
  const t = useTranslations('Dash');
  const toast = useToast();
  const qc = useQueryClient();
  const [target, setTarget] = useState<T | null>(null);
  const allowed = can(user, action);

  const mutation = useMutation({
    mutationFn: async (row: T) => {
      assertCan(user, action);
      return remove(row);
    },
    onSuccess: () => {
      toast.success(t('common.deletedToast', { noun }));
      setTarget(null);
      invalidate.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  const dialog = (
    <ConfirmDialog
      open={!!target}
      title={t('common.deleteTitle', { noun })}
      message={
        target && (
          <>
            <strong className="text-slate-900">{describe(target)}</strong> {t('common.deleteMessage')}
          </>
        )
      }
      confirmLabel={t('common.delete')}
      loading={mutation.isPending}
      onClose={() => setTarget(null)}
      onConfirm={() => target && mutation.mutate(target)}
    />
  );

  return {
    allowed,
    request: (row: T) => {
      if (!allowed) return toast.error(t('common.onlyAdminsDelete'));
      setTarget(row);
    },
    dialog
  };
}
