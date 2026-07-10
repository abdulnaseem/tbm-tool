'use client';

import { useAuth } from '../../context/AuthContext';

export function TopNav() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white/95 pl-16 pr-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white">
          M
        </div>

        <span className="text-sm font-semibold text-slate-900">
          Brawlers Boxing
        </span>
      </div>

      <div className="hidden md:block">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Admin portal
        </p>
      </div>

      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs transition hover:border-slate-300 hover:bg-slate-50 md:text-sm"
      >
        Logout
      </button>
    </header>
  );
}