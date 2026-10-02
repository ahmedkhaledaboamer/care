import { Compass, ShieldAlert } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';

export function NotFoundPage() {
  const t = useTranslations('System');
  return (
    <main className="pt-32 pb-24 container mx-auto px-4">
      <EmptyState icon={<Compass className="w-7 h-7" />} title={t('notFoundTitle')} description={t('notFoundDesc')} action={<ButtonLink to="/">{t('goHome')}</ButtonLink>} />
    </main>
  );
}

export function ForbiddenPage() {
  const t = useTranslations('System');
  return (
    <main className="pt-32 pb-24 container mx-auto px-4">
      <EmptyState icon={<ShieldAlert className="w-7 h-7" />} title={t('forbiddenTitle')} description={t('forbiddenDesc')} action={<ButtonLink to="/">{t('goHome')}</ButtonLink>} />
    </main>
  );
}
