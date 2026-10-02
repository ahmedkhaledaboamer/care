import { useState, type FormEvent } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { authApi } from '../../api/services';
import { useAuth } from '../../auth/AuthContext';
import { homeFor } from '../../auth/permissions';
import { useTranslations } from '../../lib/i18n';
import { EMAIL_RE } from '../../hooks/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';
import { AuthShell, FormAlert, PasswordInput } from './AuthPages';

type Step = 1 | 2 | 3;

/** 3-step reset: forgotPassword → verifyResetCode → resetPassword (email kept from step 1). */
export function ForgotPasswordPage() {
  const t = useTranslations('Auth');
  const toast = useToast();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      // Wrong code may return 500 (issue #8): show the server message as-is.
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const sendCode = (e?: FormEvent) => {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return setFieldError({ email: t('emailInvalid') });
    setFieldError({});
    run(async () => {
      await authApi.forgotPassword(clean);
      setEmail(clean);
      toast.success(t('codeSent'));
      setStep(2);
    });
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) return setFieldError({ resetCode: t('codeInvalid') });
    setFieldError({});
    run(async () => {
      await authApi.verifyResetCode(code.trim());
      setStep(3);
    });
  };

  const reset = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (password.length < 6) errs.newPassword = t('passwordMin');
    if (confirm !== password) errs.confirm = t('passwordMatch');
    setFieldError(errs);
    if (Object.keys(errs).length) return;
    run(async () => {
      const { token } = await authApi.resetPassword(email, password);
      const user = await loginWithToken(token);
      toast.success(t('resetDone'));
      navigate(homeFor(user), { replace: true });
    });
  };

  const titles: Record<Step, [string, string]> = {
    1: [t('forgotTitle'), t('forgotDesc')],
    2: [t('verifyTitle'), t('verifyDesc', { email })],
    3: [t('resetTitle'), t('resetDesc', { email })]
  };

  return (
    <AuthShell
      title={titles[step][0]}
      subtitle={titles[step][1]}
      footer={
        <Link to="/login" className="font-semibold text-brand-gold hover:underline">
          {t('backToLogin')}
        </Link>
      }>
      <div className="flex items-center gap-2 mb-6" aria-label={t('step', { n: step })}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-gradient-to-r from-brand-gold to-brand-goldLight' : 'bg-brand-dark/10'}`} />
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{t('step', { n: step })}</p>

      {step === 1 && (
        <form onSubmit={sendCode} noValidate className="space-y-5">
          <FormAlert message={error} />
          <Input
            label={t('email')}
            type="email"
            autoComplete="email"
            icon={<Mail className="w-4 h-4" />}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError.email}
            dir="ltr"
          />
          <Button type="submit" block size="lg" loading={loading}>
            {t('sendCode')}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verify} noValidate className="space-y-5">
          <FormAlert message={error} />
          <Input
            label={t('code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            icon={<KeyRound className="w-4 h-4" />}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            error={fieldError.resetCode}
            className="tracking-[0.5em] font-semibold text-lg"
            dir="ltr"
          />
          <Button type="submit" block size="lg" loading={loading}>
            {t('verify')}
          </Button>
          <div className="flex justify-between text-sm">
            <button type="button" className="text-brand-goldLight hover:underline disabled:opacity-50" disabled={loading} onClick={() => sendCode()}>
              {t('resend')}
            </button>
            <button
              type="button"
              className="text-gray-500 hover:underline"
              onClick={() => {
                setStep(1);
                setCode('');
                setError(null);
              }}>
              {t('useDifferentEmail')}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={reset} noValidate className="space-y-5">
          <FormAlert message={error} />
          <PasswordInput label={t('newPassword')} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={fieldError.newPassword} hint={t('passwordMin')} />
          <PasswordInput label={t('confirmPassword')} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} error={fieldError.confirm} />
          <Button type="submit" block size="lg" loading={loading}>
            {t('resetBtn')}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
