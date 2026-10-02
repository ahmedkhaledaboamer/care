import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone } from 'lucide-react';
import { addressApi } from '../../api/services';
import type { Address } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { can } from '../../auth/permissions';
import { useTranslations } from '../../lib/i18n';
import { PHONE_RE, useForm } from '../../hooks/useForm';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Field';

export const ADDRESS_KEY = ['addresses'] as const;
export type AddressInput = Omit<Address, '_id'>;

export function useAddresses() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ADDRESS_KEY,
    queryFn: ({ signal }) => addressApi.list(signal),
    enabled: can(user, 'shop')
  });
  const set = (list: Address[]) => qc.setQueryData(ADDRESS_KEY, list);
  const add = useMutation({ mutationFn: (a: AddressInput) => addressApi.add(a), onSuccess: set });
  const remove = useMutation({ mutationFn: (id: string) => addressApi.remove(id), onSuccess: set });
  /**
   * No update endpoint exists: create the new address first (so nothing is
   * lost if it fails), then delete the old one.
   */
  const replace = useMutation({
    mutationFn: async ({ id, address }: { id: string; address: AddressInput }) => {
      await addressApi.add(address);
      return addressApi.remove(id);
    },
    onSuccess: set,
    onError: () => qc.invalidateQueries({ queryKey: ADDRESS_KEY })
  });
  return { query, list: query.data ?? [], add, remove, replace };
}

const empty: AddressInput = { alias: '', details: '', phone: '', city: '', postalCode: '' };

export function AddressForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
  onCancel,
  serverError
}: {
  initial?: Partial<AddressInput>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (a: AddressInput, setErrors: (e: Record<string, string>) => void) => void;
  onCancel?: () => void;
  serverError?: string | null;
}) {
  const t = useTranslations('Account');
  const tAuth = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const form = useForm<AddressInput>({ ...empty, ...initial });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = form.values;
    const errs: Record<string, string> = {};
    if (!v.details.trim()) errs.details = tCommon('required');
    if (!v.city.trim()) errs.city = tCommon('required');
    if (!v.phone.trim()) errs.phone = tCommon('required');
    else if (!PHONE_RE.test(v.phone.replace(/[\s-]/g, ''))) errs.phone = tAuth('phoneInvalid');
    if (Object.keys(errs).length) return form.setErrors(errs);
    onSubmit(
      {
        alias: v.alias?.trim() || undefined,
        details: v.details.trim(),
        phone: v.phone.replace(/[\s-]/g, ''),
        city: v.city.trim(),
        postalCode: v.postalCode?.trim() || undefined
      },
      (e2) => form.setErrors(e2)
    );
  };

  return (
    <form onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
      <Input label={`${t('alias')} (${tCommon('optional')})`} placeholder={t('aliasPh')} {...form.bind('alias')} wrapperClassName="sm:col-span-2" maxLength={40} />
      <Textarea label={t('details')} required {...form.bind('details')} wrapperClassName="sm:col-span-2" className="min-h-[80px]" autoComplete="street-address" />
      <Input label={t('city')} required {...form.bind('city')} autoComplete="address-level2" />
      <Input label={`${t('postalCode')} (${tCommon('optional')})`} {...form.bind('postalCode')} inputMode="numeric" autoComplete="postal-code" />
      <Input label={t('phone')} required type="tel" hint={t('phoneHint')} {...form.bind('phone')} autoComplete="tel" wrapperClassName="sm:col-span-2" dir="ltr" />
      {serverError && (
        <p className="sm:col-span-2 text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}
      <div className="sm:col-span-2 flex flex-wrap gap-3 justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {tCommon('cancel')}
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function AddressSummary({ address }: { address: Pick<Address, 'details' | 'city' | 'phone' | 'postalCode'> & { alias?: string } }) {
  return (
    <div className="text-sm text-gray-600 space-y-1">
      {address.alias && <p className="font-semibold text-brand-dark">{address.alias}</p>}
      <p className="flex gap-2">
        <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        <span className="break-words">
          {address.details}, {address.city}
          {address.postalCode ? ` ${address.postalCode}` : ''}
        </span>
      </p>
      <p className="flex gap-2" dir="ltr">
        <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        {address.phone}
      </p>
    </div>
  );
}
