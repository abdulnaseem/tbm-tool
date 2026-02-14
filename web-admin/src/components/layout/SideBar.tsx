'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-100 shadow-soft">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
        <div className="h-9 w-9 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
          M
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">MMA Admin</div>
          <div className="text-xs text-slate-500">Staff portal</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition
                ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 text-xs text-slate-400">
        {user && (
          <>
            <div className="font-medium text-slate-700">{user.email}</div>
            <div className="uppercase tracking-wide text-[10px] font-medium text-slate-500">
              {(user?.roles || []).join(', ')}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
