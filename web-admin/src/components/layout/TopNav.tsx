'use client';

import { useAuth } from '../../context/AuthContext';

export function TopNav() {
  const { logout } = useAuth();

  return (
    <header className="h-16 px-4 md:px-8 border-b border-slate-100 bg-white flex items-center justify-between">
      <div className="md:hidden flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
          M
        </div>
        <span className="font-semibold text-slate-900 text-sm">
          MMA Admin
        </span>
      </div>
      <div className="flex-1" />
      <button
        onClick={() => logout()}
        className="text-xs md:text-sm rounded-full border border-slate-200 px-3 py-1.5 hover:border-slate-300 hover:bg-slate-50 transition"
      >
        Logout
      </button>
    </header>
  );
}