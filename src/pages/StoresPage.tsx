import { useTranslations } from '../lib/i18n';
import { PageHero } from '../components/shop/PageHero';
import { StoreLocator } from '../components/StoreLocator';

/** /stores — all branches on the map. */
export function StoresPage() {
  const t = useTranslations('Stores');
  const tNav = useTranslations('Nav');
  return (
    <main className="pt-28 md:pt-32">
      <PageHero crumbs={[{ label: tNav('stores') }]} title={t('pageTitle')} description={t('pageDesc')} compact />
      <div className="mt-10">
        <StoreLocator variant="page" />
      </div>
    </main>
  );
}
