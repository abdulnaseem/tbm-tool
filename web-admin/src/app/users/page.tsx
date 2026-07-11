// web-admin/src/app/users/page.tsx
'use client';

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiFetch } from '../../lib/apiClient';
import type { UserRole } from '../../types/auth';
import type {
  CreateUserPayload,
  ManagedUser,
  UpdateUserPayload,
} from '../../types/users';

const AVAILABLE_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'COACH',
  'STAFF',
];

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles =
    role === 'SUPER_ADMIN'
      ? 'bg-purple-50 text-purple-700'
      : role === 'ADMIN'
        ? 'bg-blue-50 text-blue-700'
        : role === 'COACH'
          ? 'bg-orange-50 text-orange-700'
          : 'bg-slate-100 text-slate-600';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}
    >
      {role.replace('_', ' ')}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isActive
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function RoleSelector({
  value,
  onChange,
  disabledRoles = [],
}: {
  value: UserRole[];
  onChange: (roles: UserRole[]) => void;
  disabledRoles?: UserRole[];
}) {
  function toggleRole(role: UserRole) {
    if (disabledRoles.includes(role)) {
      return;
    }

    if (value.includes(role)) {
      const nextRoles = value.filter((existingRole) => existingRole !== role);

      if (nextRoles.length > 0) {
        onChange(nextRoles);
      }

      return;
    }

    onChange([...value, role]);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {AVAILABLE_ROLES.map((role) => {
        const selected = value.includes(role);
        const disabled = disabledRoles.includes(role);

        return (
          <label
            key={role}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${
              selected
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-700'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              disabled={disabled}
              onChange={() => toggleRole(role)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />

            {role.replace('_', ' ')}
          </label>
        );
      })}
    </div>
  );
}

function CreateUserDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: ManagedUser) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<UserRole[]>(['STAFF']);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError(null);

    const payload: CreateUserPayload = {
      email: email.trim().toLowerCase(),
      password,
      roles,
      isActive,
    };

    try {
      const createdUser = await apiFetch<ManagedUser>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onCreated(createdUser);
      onClose();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Failed to create the user account'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Create user"
      description="Create a new dashboard account and assign its access level."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="create-user-email"
            className="mb-1.5 block text-xs font-semibold text-slate-500"
          >
            Email address
          </label>

          <input
            id="create-user-email"
            type="email"
            value={email}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={saving}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@example.com"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="create-user-password"
            className="mb-1.5 block text-xs font-semibold text-slate-500"
          >
            Temporary password
          </label>

          <input
            id="create-user-password"
            type="password"
            value={password}
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            disabled={saving}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 12 characters"
            className={inputClassName}
          />

          <p className="mt-1.5 text-xs text-slate-400">
            Share this password securely and ask the user to change it.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Roles</p>

          <RoleSelector value={roles} onChange={setRoles} />
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Active account</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Active users can sign in immediately.
            </p>
          </div>

          <input
            type="checkbox"
            checked={isActive}
            disabled={saving}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserDialog({
  managedUser,
  currentUserId,
  onClose,
  onUpdated,
}: {
  managedUser: ManagedUser;
  currentUserId?: string;
  onClose: () => void;
  onUpdated: (user: ManagedUser) => void;
}) {
  const editingSelf = managedUser.id === currentUserId;

  const [email, setEmail] = useState(managedUser.email);
  const [roles, setRoles] = useState<UserRole[]>(managedUser.roles);
  const [isActive, setIsActive] = useState(managedUser.isActive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError(null);

    const payload: UpdateUserPayload = {
      email: email.trim().toLowerCase(),
      roles,
      isActive,
    };

    try {
      const updatedUser = await apiFetch<ManagedUser>(
        `/users/${managedUser.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      onUpdated(updatedUser);
      onClose();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Failed to update the user account'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Edit user"
      description={managedUser.email}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="edit-user-email"
            className="mb-1.5 block text-xs font-semibold text-slate-500"
          >
            Email address
          </label>

          <input
            id="edit-user-email"
            type="email"
            value={email}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={saving}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Roles</p>

          <RoleSelector
            value={roles}
            onChange={setRoles}
            disabledRoles={editingSelf ? ['SUPER_ADMIN'] : []}
          />

          {editingSelf && (
            <p className="mt-2 text-xs text-slate-500">
              You cannot remove your own SUPER ADMIN role.
            </p>
          )}
        </div>

        <label
          className={`flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 ${
            editingSelf ? 'cursor-not-allowed opacity-60' : ''
          }`}
        >
          <div>
            <p className="text-sm font-medium text-slate-800">Active account</p>

            <p className="mt-0.5 text-xs text-slate-500">
              Inactive users cannot sign in.
            </p>
          </div>

          <input
            type="checkbox"
            checked={isActive}
            disabled={saving || editingSelf}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
        </label>

        {editingSelf && (
          <p className="text-xs text-slate-500">
            You cannot deactivate your own account.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PasswordDialog({
  managedUser,
  onClose,
}: {
  managedUser: ManagedUser;
  onClose: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('The passwords do not match');
      return;
    }

    setSaving(true);

    try {
      await apiFetch<void>(`/users/${managedUser.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password }),
      });

      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Failed to update the password'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Reset password"
      description={`Set a new password for ${managedUser.email}.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-xs font-semibold text-slate-500"
          >
            New password
          </label>

          <input
            id="new-password"
            type="password"
            value={password}
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            disabled={saving}
            onChange={(event) => {
              setPassword(event.target.value);
              setSuccess(false);
            }}
            placeholder="At least 12 characters"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="confirm-new-password"
            className="mb-1.5 block text-xs font-semibold text-slate-500"
          >
            Confirm new password
          </label>

          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            disabled={saving}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setSuccess(false);
            }}
            className={inputClassName}
          />
        </div>

        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
          Resetting the password signs the user out of their current session.
        </p>

        {success && (
          <p
            role="status"
            className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            Password updated successfully.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Close
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteUserDialog({
  managedUser,
  onClose,
  onDeleted,
}: {
  managedUser: ManagedUser;
  onClose: () => void;
  onDeleted: (userId: string) => void;
}) {
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed =
    confirmation.trim().toLowerCase() === managedUser.email.toLowerCase();

  async function handleDelete() {
    if (!confirmed || deleting) return;

    setDeleting(true);
    setError(null);

    try {
      await apiFetch<void>(`/users/${managedUser.id}`, {
        method: 'DELETE',
      });

      onDeleted(managedUser.id);
      onClose();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Failed to delete the user account'),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="Delete user"
      description="This action permanently removes the dashboard account."
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Delete {managedUser.email}?
          </p>

          <p className="mt-1 text-xs leading-5 text-red-600">
            The user will no longer be able to sign in. This action cannot be
            undone.
          </p>
        </div>

        <div>
          <label
            htmlFor="delete-confirmation"
            className="mb-1.5 block text-xs font-semibold text-slate-500"
          >
            Enter the user&apos;s email address to confirm
          </label>

          <input
            id="delete-confirmation"
            type="text"
            value={confirmation}
            autoComplete="off"
            disabled={deleting}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={managedUser.email}
            className={inputClassName}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete user'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL');

  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setPageError(null);

    try {
      const data = await apiFetch<ManagedUser[]>('/users');
      setUsers(data);
    } catch (error) {
      setUsers([]);
      setPageError(getErrorMessage(error, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((managedUser) => {
      const matchesSearch =
        !normalizedSearch ||
        managedUser.email.toLowerCase().includes(normalizedSearch) ||
        managedUser.roles.some((role) =>
          role.toLowerCase().includes(normalizedSearch),
        );

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && managedUser.isActive) ||
        (statusFilter === 'INACTIVE' && !managedUser.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, users]);

  const activeCount = users.filter((managedUser) => managedUser.isActive).length;
  const inactiveCount = users.length - activeCount;
  const superAdminCount = users.filter((managedUser) =>
    managedUser.roles.includes('SUPER_ADMIN'),
  ).length;

  function handleCreated(createdUser: ManagedUser) {
    setUsers((currentUsers) => [createdUser, ...currentUsers]);
  }

  function handleUpdated(updatedUser: ManagedUser) {
    setUsers((currentUsers) =>
      currentUsers.map((managedUser) =>
        managedUser.id === updatedUser.id ? updatedUser : managedUser,
      ),
    );
  }

  function handleDeleted(userId: string) {
    setUsers((currentUsers) =>
      currentUsers.filter((managedUser) => managedUser.id !== userId),
    );
  }

  return (
    <Protected roles={['SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                User management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage dashboard accounts, roles and passwords.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700"
            >
              + Create user
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total users" value={String(users.length)} />
            <SummaryCard
              label="Active users"
              value={String(activeCount)}
              variant="success"
            />
            <SummaryCard
              label="Inactive users"
              value={String(inactiveCount)}
              variant="danger"
            />
            <SummaryCard
              label="Super admins"
              value={String(superAdminCount)}
              variant="purple"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-soft sm:p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search email or role..."
                className={inputClassName}
              />

              <div className="flex gap-2 overflow-x-auto">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      statusFilter === status
                        ? 'bg-brand-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'ALL'
                      ? 'All'
                      : status === 'ACTIVE'
                        ? 'Active'
                        : 'Inactive'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {pageError && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <span>{pageError}</span>

              <button
                type="button"
                onClick={() => void loadUsers()}
                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700"
              >
                Try again
              </button>
            </div>
          )}

          <div className="md:hidden">
            {loading ? (
              <LoadingCard />
            ) : filteredUsers.length === 0 ? (
              <EmptyCard />
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((managedUser) => {
                  const isCurrentUser = managedUser.id === currentUser?.id;

                  return (
                    <article
                      key={managedUser.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="break-all text-sm font-semibold text-slate-900">
                            {managedUser.email}
                          </h2>

                          <p className="mt-1 text-xs text-slate-500">
                            Created {formatDate(managedUser.createdAt)}
                          </p>
                        </div>

                        <StatusBadge isActive={managedUser.isActive} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {managedUser.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}

                        {isCurrentUser && (
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                            YOU
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingUser(managedUser)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setPasswordUser(managedUser)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Password
                        </button>

                        <button
                          type="button"
                          disabled={isCurrentUser}
                          onClick={() => setDeletingUser(managedUser)}
                          className="col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isCurrentUser ? 'Cannot delete yourself' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Roles</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-slate-400"
                      >
                        Loading users…
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-slate-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((managedUser) => {
                      const isCurrentUser =
                        managedUser.id === currentUser?.id;

                      return (
                        <tr
                          key={managedUser.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold uppercase text-brand-700">
                                {managedUser.email.charAt(0)}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-xs truncate font-medium text-slate-900">
                                  {managedUser.email}
                                </p>

                                {isCurrentUser && (
                                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                                    Current account
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex max-w-sm flex-wrap gap-1.5">
                              {managedUser.roles.map((role) => (
                                <RoleBadge key={role} role={role} />
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge isActive={managedUser.isActive} />
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                            {formatDate(managedUser.createdAt)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingUser(managedUser)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setPasswordUser(managedUser)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Password
                              </button>

                              <button
                                type="button"
                                disabled={isCurrentUser}
                                onClick={() => setDeletingUser(managedUser)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {creating && (
          <CreateUserDialog
            onClose={() => setCreating(false)}
            onCreated={handleCreated}
          />
        )}

        {editingUser && (
          <EditUserDialog
            managedUser={editingUser}
            currentUserId={currentUser?.id}
            onClose={() => setEditingUser(null)}
            onUpdated={handleUpdated}
          />
        )}

        {passwordUser && (
          <PasswordDialog
            managedUser={passwordUser}
            onClose={() => setPasswordUser(null)}
          />
        )}

        {deletingUser && (
          <DeleteUserDialog
            managedUser={deletingUser}
            onClose={() => setDeletingUser(null)}
            onDeleted={handleDeleted}
          />
        )}
      </Shell>
    </Protected>
  );
}

function SummaryCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'danger' | 'purple';
}) {
  const accentClass =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : variant === 'danger'
        ? 'bg-red-50 text-red-700'
        : variant === 'purple'
          ? 'bg-purple-50 text-purple-700'
          : 'bg-slate-100 text-slate-600';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>

        <span
          aria-hidden="true"
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${accentClass}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center text-sm text-slate-400 shadow-soft">
      Loading users…
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-10 text-center text-sm text-slate-400 shadow-soft">
      No users found.
    </div>
  );
}