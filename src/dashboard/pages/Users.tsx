import { useEffect, useState, type FormEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Users as UsersIcon } from 'lucide-react';
import { toFormData } from '../../api/crud';
import { usersApi } from '../../api/services';
import type { Role, User } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { assertCan } from '../../auth/permissions';
import { EMAIL_RE, PHONE_RE, useForm } from '../../hooks/useForm';
import { formatDate, initials, userImageUrl } from '../../lib/format';
import { useLocale, useTranslations } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { pickedFromUrl, SingleImagePicker, type PickedImage } from '../../components/ui/ImagePicker';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { Badge, EmptyState, type BadgeTone } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { PasswordInput } from '../../pages/auth/AuthPages';
import { DataTable, type Column } from '../components/DataTable';
import { DeleteAction, EditAction, FilterSelect, IconAction, PageHeader, Panel, SearchInput, TableFooter, Toolbar } from '../components/Kit';
import { useDeleteFlow } from '../useDeleteFlow';
import { useListParams } from '../useListParams';

const KEY = ['users'] as const;
const roleTone: Record<Role, BadgeTone> = { admin: 'navy', manager: 'blue', user: 'gray' };

/** Managers may manage customers and managers, but can't grant or modify admin accounts. */
function useRoleRules() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return {
    assignable: (isAdmin ? ['user', 'manager', 'admin'] : ['user', 'manager']) as Role[],
    canModify: (target: User) => isAdmin || target.role !== 'admin'
  };
}

function Avatar({ user, size = 'w-10 h-10' }: { user: User; size?: string }) {
  const src = userImageUrl(user);
  return src ? (
    <img src={src} alt="" loading="lazy" className={`${size} rounded-full object-cover shrink-0`} />
  ) : (
    <span className={`${size} rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight text-white text-xs font-bold flex items-center justify-center shrink-0`}>{initials(user.name)}</span>
  );
}

function UserModal({ target, onClose }: { target: User | 'new'; onClose: () => void }) {
  const t = useTranslations('Dash');
  const isNew = target === 'new';
  const toast = useToast();
  const qc = useQueryClient();
  const { user: me, updateUser } = useAuth();
  const rules = useRoleRules();
  const detail = useQuery({
    queryKey: [...KEY, 'detail', isNew ? '' : target._id],
    queryFn: ({ signal }) => usersApi.get((target as User)._id, signal),
    enabled: !isNew
  });
  const base = detail.data ?? (isNew ? null : target);
  const form = useForm({
    name: base?.name ?? '',
    email: base?.email ?? '',
    phone: base?.phone ?? '',
    role: (base?.role ?? 'user') as string,
    password: '',
    passwordConfirm: ''
  });
  const [image, setImage] = useState<PickedImage | null>(base && userImageUrl(base) ? pickedFromUrl(userImageUrl(base)!) : null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const u = detail.data;
    if (!u) return;
    form.reset({ name: u.name, email: u.email ?? '', phone: u.phone ?? '', role: u.role, password: '', passwordConfirm: '' });
    setImage(userImageUrl(u) ? pickedFromUrl(userImageUrl(u)!) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () => {
      assertCan(me, 'users:write');
      const v = form.values;
      if (!rules.assignable.includes(v.role as Role)) throw new Error(t('common.notAllowedRole'));
      const common = {
        name: v.name.trim(),
        phone: v.phone.replace(/[\s-]/g, '') || undefined,
        role: v.role,
        profileImg: image?.file
      };
      if (isNew) {
        return usersApi.create(toFormData({ ...common, email: v.email.trim().toLowerCase(), password: v.password, passwordConfirm: v.passwordConfirm }));
      }
      return usersApi.update(target._id, toFormData({ ...common, email: v.email.trim().toLowerCase() }));
    },
    onSuccess: (u) => {
      toast.success(isNew ? t('users.created') : t('users.updated'));
      qc.invalidateQueries({ queryKey: KEY });
      if (me && u._id === me._id) updateUser({ ...me, ...u });
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e, ['name', 'email', 'phone', 'role', 'password', 'passwordConfirm', 'profileImg']))
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = form.values;
    const errs: Record<string, string> = {};
    if (v.name.trim().length < 3) errs.name = t('users.errName');
    if (!EMAIL_RE.test(v.email.trim())) errs.email = t('users.errEmail');
    if (v.phone.trim() && !PHONE_RE.test(v.phone.replace(/[\s-]/g, ''))) errs.phone = t('users.errPhone');
    if (isNew) {
      if (v.password.length < 6) errs.password = t('users.errPassword');
      if (v.passwordConfirm !== v.password) errs.passwordConfirm = t('users.errMatch');
    }
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      size="lg"
      title={isNew ? t('users.newTitle') : t('users.editTitle')}
      description={!isNew ? base?.email : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="user-form" loading={save.isPending}>
            {isNew ? t('users.createUser') : t('common.save')}
          </Button>
        </>
      }>
      {!isNew && detail.isLoading ? (
        <div className="py-10 flex justify-center">
          <Spinner className="w-6 h-6 text-brand-gold" />
        </div>
      ) : (
        <form id="user-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
          {error && <p className="sm:col-span-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
          <div className="sm:col-span-2">
            <SingleImagePicker label={t('users.profileImage')} value={image} onChange={setImage} onError={toast.error} error={form.errors.profileImg} />
          </div>
          <Input label={t('users.fullName')} required {...form.bind('name')} />
          <Select label={t('users.role')} required {...form.bind('role')}>
            {rules.assignable.map((r) => (
              <option key={r} value={r}>
                {t(`roles.${r}`)}
              </option>
            ))}
          </Select>
          <Input label={t('users.email')} required type="email" dir="ltr" {...form.bind('email')} autoComplete="off" />
          <Input label={t('users.phoneOptional')} type="tel" dir="ltr" {...form.bind('phone')} hint={t('users.phoneHint')} />
          {isNew && (
            <>
              <PasswordInput label={t('users.password')} required autoComplete="new-password" {...form.bind('password')} />
              <PasswordInput label={t('users.confirmPassword')} required autoComplete="new-password" {...form.bind('passwordConfirm')} />
            </>
          )}
        </form>
      )}
    </Modal>
  );
}

function PasswordModal({ target, onClose }: { target: User; onClose: () => void }) {
  const t = useTranslations('Dash');
  const toast = useToast();
  const { user: me } = useAuth();
  const form = useForm({ currentPassword: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      assertCan(me, 'users:write');
      return usersApi.changePassword(target._id, form.values);
    },
    onSuccess: () => {
      toast.success(t('users.passwordChanged', { name: target.name }));
      onClose();
    },
    onError: (e) => setError(form.applyServerError(e))
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = form.values;
    const errs: Record<string, string> = {};
    if (!v.currentPassword) errs.currentPassword = t('common.required');
    if (v.password.length < 6) errs.password = t('users.errPassword');
    if (v.passwordConfirm !== v.password) errs.passwordConfirm = t('users.errMatch');
    if (Object.keys(errs).length) return form.setErrors(errs);
    save.mutate();
  };
  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!save.isPending}
      title={t('users.changePassword')}
      description={`${target.name} · ${target.email}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="pw-form" loading={save.isPending}>
            {t('users.changePassword')}
          </Button>
        </>
      }>
      <form id="pw-form" onSubmit={submit} noValidate className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
        <PasswordInput label={t('users.currentPassword')} required autoComplete="off" {...form.bind('currentPassword')} hint={t('users.currentPasswordHint')} />
        <PasswordInput label={t('users.newPassword')} required autoComplete="new-password" {...form.bind('password')} />
        <PasswordInput label={t('users.confirmNewPassword')} required autoComplete="new-password" {...form.bind('passwordConfirm')} />
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const t = useTranslations('Dash');
  const locale = useLocale();
  const list = useListParams(['role', 'active'] as const);
  const { user: me } = useAuth();
  const rules = useRoleRules();
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [pwFor, setPwFor] = useState<User | null>(null);
  const params = {
    keyword: list.keyword || undefined,
    role: list.filters.role || undefined,
    active: list.filters.active || undefined,
    page: list.page,
    limit: 15,
    sort: '-createdAt',
    field: 'name,email,phone,role,profileImg,active,createdAt'
  };
  const q = useQuery({
    queryKey: [...KEY, 'list', params],
    queryFn: ({ signal }) => usersApi.list(params, signal),
    placeholderData: keepPreviousData
  });
  const del = useDeleteFlow<User>({
    noun: t('users.noun'),
    remove: (u) => usersApi.remove(u._id),
    invalidate: [KEY],
    describe: (u) => `${u.name} (${u.email})`
  });

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: t('users.user'),
      hideOnMobile: true,
      cell: (u) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar user={u} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">
              {u.name}
              {me?._id === u._id && <span className="ms-2 text-[10px] uppercase text-slate-400">{t('users.you')}</span>}
            </p>
            <p className="text-xs text-slate-500 truncate">{u.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', header: t('users.phone'), cell: (u) => <span dir="ltr">{u.phone || '—'}</span> },
    { key: 'role', header: t('users.role'), cell: (u) => <Badge tone={roleTone[u.role]}>{t(`roles.${u.role}`)}</Badge> },
    { key: 'status', header: t('common.status'), cell: (u) => (u.active === false ? <Badge tone="red">{t('users.deactivated')}</Badge> : <Badge tone="green">{t('users.active')}</Badge>) },
    { key: 'created', header: t('users.joined'), cell: (u) => formatDate(u.createdAt, locale) }
  ];

  return (
    <>
      <PageHeader
        title={t('users.title')}
        description={t('users.description')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> {t('users.add')}
          </Button>
        }
      />
      <Panel>
        <Toolbar>
          <SearchInput value={list.keyword} onChange={list.setKeyword} placeholder={t('users.searchPh')} />
          <FilterSelect label={t('users.role')} value={list.filters.role} onChange={(v) => list.setFilter('role', v)}>
            <option value="">{t('users.allRoles')}</option>
            <option value="user">{t('users.customers')}</option>
            <option value="manager">{t('users.managers')}</option>
            <option value="admin">{t('users.admins')}</option>
          </FilterSelect>
          <FilterSelect label={t('common.status')} value={list.filters.active} onChange={(v) => list.setFilter('active', v)}>
            <option value="">{t('users.anyStatus')}</option>
            <option value="true">{t('users.active')}</option>
            <option value="false">{t('users.deactivated')}</option>
          </FilterSelect>
        </Toolbar>
        <DataTable
          rows={q.data?.data}
          columns={columns}
          rowKey={(u) => u._id}
          loading={q.isLoading}
          fetching={q.isFetching}
          error={q.error}
          onRetry={() => q.refetch()}
          mobileTitle={(u) => (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar user={u} />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
            </div>
          )}
          empty={<EmptyState icon={<UsersIcon className="w-7 h-7" />} title={list.hasFilters ? t('users.noMatch') : t('users.empty')} />}
          actions={(u) =>
            rules.canModify(u) ? (
              <>
                <EditAction onClick={() => setEditing(u)} />
                <IconAction label={t('users.changePassword')} onClick={() => setPwFor(u)}>
                  <KeyRound className="w-4 h-4" />
                </IconAction>
                {del.allowed && me?._id !== u._id && <DeleteAction onClick={() => del.request(u)} />}
              </>
            ) : (
              <span className="text-xs text-slate-400 px-2">{t('users.adminOnly')}</span>
            )
          }
        />
        <TableFooter page={list.page} hasNext={!!q.data?.pagination.next} onChange={list.setPage} />
      </Panel>
      {editing && <UserModal target={editing} onClose={() => setEditing(null)} />}
      {pwFor && <PasswordModal target={pwFor} onClose={() => setPwFor(null)} />}
      {del.dialog}
    </>
  );
}
