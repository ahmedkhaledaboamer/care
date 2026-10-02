import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { errorMessage } from '../../api/client';
import type { Address } from '../../api/types';
import { useTranslations } from '../../lib/i18n';
import { AddressForm, AddressSummary, useAddresses } from '../../components/shop/AddressForm';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { AccountCard } from './AccountLayout';

export function AddressesPage() {
  const t = useTranslations('Account');
  const tCommon = useTranslations('Common');
  const toast = useToast();
  const addresses = useAddresses();
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<Address | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const saving = addresses.add.isPending || addresses.replace.isPending;

  const close = () => {
    setEditing(null);
    setFormError(null);
  };

  return (
    <AccountCard
      title={t('addresses')}
      action={
        addresses.list.length > 0 && (
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" />
            {t('addAddress')}
          </Button>
        )
      }>
      {addresses.query.isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : addresses.query.isError ? (
        <ErrorState error={addresses.query.error} onRetry={() => addresses.query.refetch()} />
      ) : addresses.list.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-7 h-7" />}
          title={t('noAddresses')}
          description={t('noAddressesDesc')}
          action={
            <Button onClick={() => setEditing('new')}>
              <Plus className="w-4 h-4" />
              {t('addAddress')}
            </Button>
          }
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {addresses.list.map((a) => (
            <li key={a._id} className="rounded-2xl border border-brand-dark/10 bg-white p-4 flex flex-col">
              <div className="flex-1">
                <AddressSummary address={a} />
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-brand-dark/5">
                <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
                  <Pencil className="w-4 h-4" />
                  {t('replace')}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setToDelete(a)}>
                  <Trash2 className="w-4 h-4" />
                  {tCommon('delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={close}
        dismissible={!saving}
        title={editing === 'new' ? t('addAddress') : t('replaceTitle')}
        description={editing !== 'new' && editing ? t('replaceHint') : undefined}
        size="lg">
        {editing && (
          <AddressForm
            key={editing === 'new' ? 'new' : editing._id}
            initial={editing === 'new' ? undefined : editing}
            submitLabel={tCommon('save')}
            loading={saving}
            serverError={formError}
            onCancel={close}
            onSubmit={(address) => {
              setFormError(null);
              const opts = {
                onSuccess: () => {
                  toast.success(editing === 'new' ? t('addressAdded') : t('addressReplaced'));
                  close();
                },
                onError: (e: unknown) => setFormError(errorMessage(e))
              };
              if (editing === 'new') addresses.add.mutate(address, opts);
              else addresses.replace.mutate({ id: editing._id, address }, opts);
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title={t('deleteAddress')}
        message={toDelete && <AddressSummary address={toDelete} />}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={addresses.remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          addresses.remove.mutate(toDelete._id, {
            onSuccess: () => {
              toast.success(t('addressDeleted'));
              setToDelete(null);
            },
            onError: (e) => toast.error(errorMessage(e))
          })
        }
      />
    </AccountCard>
  );
}
