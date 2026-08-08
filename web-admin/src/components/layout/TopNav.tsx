// web-admin/src/components/layout/TopNav.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../context/AuthContext';
import { useProgramme } from '../../context/ProgrammeContext';

export function TopNav() {
  const { logout } = useAuth();
  const { programme } = useProgramme();

  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      router.replace('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white/95 pl-16 pr-4 backdrop-blur md:px-8">
      <div>
        <p className="hidden text-xs font-medium uppercase tracking-wide text-slate-400 md:block">
          Admin portal
        </p>

        <p className="text-sm font-semibold text-slate-900 md:hidden">
          {programme.name}
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
      >
        {loggingOut ? 'Logging out…' : 'Logout'}
      </button>
    </header>
  );
}