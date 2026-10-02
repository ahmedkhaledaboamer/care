import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Mail, Phone, User as UserIcon } from 'lucide-react';
import { errorMessage } from '../../api/client';
import { profileApi } from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { useTranslations } from '../../lib/i18n';
import { EMAIL_RE, PHONE_RE, useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { FormAlert, PasswordInput } from '../auth/AuthPages';
import { AccountCard } from './AccountLayout';

export function ProfilePage() {
  const t = useTranslations('Account');
  const tAuth = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const toast = useToast();
  const { updateUser, logout } = useAuth();
  const me = useQuery({ queryKey: ['me'], queryFn: ({ signal }) => profileApi.getMe(signal) });
  const form = useForm({ name: '', phone: '', email: '' });
  const [error, setError] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  useEffect(() => {
    if (me.data) {
      form.reset({ name: me.data.name ?? '', phone: me.data.phone ?? '', email: me.data.email ?? '' });
      updateUser(me.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.data]);

  const save = useMutation({
    mutationFn: () => {
      const v = form.values;
      return profileApi.updateMe({
        name: v.name.trim(),
        phone: v.phone.replace(/[\s-]/g, ''),
        email: v.email.trim().toLowerCase()
      });
    },
    onSuccess: (user) => {
      toast.success(t('profileUpdated'));
      updateUser(user);
      me.refetch();
    },
    onError: (e) => setError(form.applyServerError(e, ['name', 'phone', 'email']))
  });

  const deactivate = useMutation({
    mutationFn: () => profileApi.deleteMe(),
    onSuccess: () => {
      toast.info(t('deactivated'));
      logout();
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = form.values;
    const errs: Record<string, string> = {};
    if (v.name.trim().length < 3) errs.name = tAuth('nameMin');
    if (v.phone.trim() && !PHONE_RE.test(v.phone.replace(/[\s-]/g, ''))) errs.phone = tAuth('phoneInvalid');
    if (!EMAIL_RE.test(v.email.trim())) errs.email = tAuth('emailInvalid');
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };

  if (me.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />;

  return (
    <div className="space-y-6">
      <AccountCard title={t('profile')}>
        <form onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-5 max-w-2xl">
          <div className="sm:col-span-2">
            <FormAlert message={error} />
          </div>
          <Input label={t('name')} required icon={<UserIcon className="w-4 h-4" />} {...form.bind('name')} autoComplete="name" wrapperClassName="sm:col-span-2" />
          <Input label={t('email')} required type="email" icon={<Mail className="w-4 h-4" />} {...form.bind('email')} autoComplete="email" dir="ltr" />
          <Input label={`${t('phone')} (${tCommon('optional')})`} type="tel" icon={<Phone className="w-4 h-4" />} hint={t('phoneHint')} {...form.bind('phone')} autoComplete="tel" dir="ltr" />
          <div className="sm:col-span-2">
            <Button type="submit" loading={save.isPending}>
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </AccountCard>

      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-5 sm:p-8">
        <h2 className="font-semibold text-red-700 mb-1">{t('dangerZone')}</h2>
        <p className="text-sm text-gray-600 mb-4">{t('deactivateDesc')}</p>
        <Button variant="outline-danger" onClick={() => setConfirmDeactivate(true)}>
          {t('deactivate')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        title={t('deactivateConfirm')}
        message={t('deactivateDesc')}
        confirmLabel={t('deactivate')}
        cancelLabel={tCommon('cancel')}
        loading={deactivate.isPending}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={() => deactivate.mutate()}
      />
    </div>
  );
}

export function PasswordPage() {
  const t = useTranslations('Account');
  const tAuth = useTranslations('Auth');
  const toast = useToast();
  const { setSession } = useAuth();
  const form = useForm({ password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: () => profileApi.changeMyPassword(form.values.password),
    // The old token is invalidated — store the new one.
    onSuccess: (res) => {
      setSession(res.token, res.data);
      form.reset({ password: '', confirm: '' });
      toast.success(t('passwordUpdated'));
    },
    onError: (e) => setError(form.applyServerError(e))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};
    if (form.values.password.length < 6) errs.password = tAuth('passwordMin');
    if (form.values.confirm !== form.values.password) errs.confirm = tAuth('passwordMatch');
    if (Object.keys(errs).length) return form.setErrors(errs);
    change.mutate();
  };

  return (
    <AccountCard title={t('changePassword')}>
      <form onSubmit={submit} noValidate className="space-y-5 max-w-md">
        <FormAlert message={error} />
        <PasswordInput label={t('newPassword')} autoComplete="new-password" required hint={tAuth('passwordMin')} {...form.bind('password')} />
        <PasswordInput label={t('confirmPassword')} autoComplete="new-password" required {...form.bind('confirm')} />
        <Button type="submit" loading={change.isPending}>
          {t('changePassword')}
        </Button>
      </form>
    </AccountCard>
  );
}
