import { useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { homeFor, isStaff } from '../../auth/permissions';
import type { User } from '../../api/types';
import { useTranslations } from '../../lib/i18n';
import { EMAIL_RE, useForm } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 bg-white rounded-[2rem] shadow-xl overflow-hidden border border-brand-dark/5">
          <div className="relative hidden lg:block">
            <img src="/images/banner/b4.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 to-brand-dark/10" />
            <img src="/images/logo.png" alt="" className="absolute top-8 start-8 w-28 brightness-0 invert" />
          </div>
          <div className="p-6 sm:p-10 lg:p-12">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark mb-2">{title}</h1>
            {subtitle && <p className="text-gray-500 mb-8">{subtitle}</p>}
            {children}
            {footer && <div className="mt-8 text-sm text-center text-gray-600">{footer}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} icon={<Lock className="w-4 h-4" />} className="pe-11" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute end-3 top-[2.35rem] text-gray-400 hover:text-brand-dark"
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function FormAlert({ message, tone = 'error' }: { message: string | null | undefined; tone?: 'error' | 'info' }) {
  if (!message) return null;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-brand-peach/60 text-brand-dark'}`}>
      {message}
    </div>
  );
}

/** After login: go back where the user came from, unless it's not for their role. */
function useRedirectAfterAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return (user: User) => {
    const staffOnlyTarget = from?.startsWith('/dashboard');
    const shopperOnlyTarget = from && /^\/(cart|checkout|wishlist|account\/(orders|addresses|reviews))/.test(from);
    let target = homeFor(user);
    if (from && from !== '/login') {
      if (isStaff(user) ? !shopperOnlyTarget : !staffOnlyTarget) target = from;
    }
    navigate(target, { replace: true });
  };
}

export function LoginPage() {
  const t = useTranslations('Auth');
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const redirect = useRedirectAfterAuth();
  const state = location.state as { from?: string; reason?: string } | null;
  const form = useForm({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const { email, password } = form.values;
    const errs: Record<string, string> = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = t('emailInvalid');
    if (!password) errs.password = t('passwordMin');
    if (Object.keys(errs).length) return form.setErrors(errs);
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      toast.success(t('welcome', { name: user.name }));
      redirect(user);
    } catch (err) {
      setError(form.applyServerError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Link to="/signup" state={state} className="font-semibold text-brand-gold hover:underline">
            {t('createAccount')}
          </Link>
        </>
      }>
      <form onSubmit={submit} noValidate className="space-y-5">
        <FormAlert message={state?.reason ? t('sessionExpired') : state?.from ? t('loginRequired') : null} tone="info" />
        <FormAlert message={error} />
        <Input label={t('email')} type="email" autoComplete="email" icon={<Mail className="w-4 h-4" />} required {...form.bind('email')} dir="ltr" />
        <PasswordInput label={t('password')} autoComplete="current-password" required {...form.bind('password')} />
        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-goldLight hover:underline">
            {t('forgot')}
          </Link>
        </div>
        <Button type="submit" block size="lg" loading={loading}>
          {t('loginBtn')}
        </Button>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const t = useTranslations('Auth');
  const { signup } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const redirect = useRedirectAfterAuth();
  const form = useForm({ name: '', email: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const v = form.values;
    const errs: Record<string, string> = {};
    if (v.name.trim().length < 3) errs.name = t('nameMin');
    if (!EMAIL_RE.test(v.email.trim())) errs.email = t('emailInvalid');
    if (v.password.length < 6) errs.password = t('passwordMin');
    if (v.passwordConfirm !== v.password) errs.passwordConfirm = t('passwordMatch');
    form.setErrors(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const v = form.values;
      const user = await signup({ name: v.name.trim(), email: v.email.trim().toLowerCase(), password: v.password, passwordConfirm: v.passwordConfirm });
      toast.success(t('welcome', { name: user.name }));
      redirect(user);
    } catch (err) {
      setError(form.applyServerError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('signupTitle')}
      subtitle={t('signupSubtitle')}
      footer={
        <>
          {t('haveAccount')}{' '}
          <Link to="/login" state={location.state} className="font-semibold text-brand-gold hover:underline">
            {t('loginBtn')}
          </Link>
        </>
      }>
      <form onSubmit={submit} noValidate className="space-y-5">
        <FormAlert message={error} />
        <Input label={t('name')} autoComplete="name" icon={<UserIcon className="w-4 h-4" />} required {...form.bind('name')} />
        <Input label={t('email')} type="email" autoComplete="email" icon={<Mail className="w-4 h-4" />} required {...form.bind('email')} dir="ltr" />
        <PasswordInput label={t('password')} autoComplete="new-password" required hint={t('passwordMin')} {...form.bind('password')} />
        <PasswordInput label={t('confirmPassword')} autoComplete="new-password" required {...form.bind('passwordConfirm')} />
        <Button type="submit" block size="lg" loading={loading}>
          {t('signupBtn')}
        </Button>
      </form>
    </AuthShell>
  );
}
