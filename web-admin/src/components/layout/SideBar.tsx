'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const navItems: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
  { href: '/attendance', label: 'Attendance' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-100 bg-white shadow-soft md:flex">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-950">
            <Image
              src="/butterfly-logo-black.jpeg"
              alt="The Butterfly Movement logo"
              fill
              sizes="44px"
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-sm font-bold leading-tight text-slate-900">
              The Butterfly Movement
            </h1>
            <p className="whitespace-nowrap text-xs font-medium text-slate-500">
              Staff portal
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white">
              <Image
                src="/logo2.jpeg"
                alt="Brawlers Boxing logo"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="whitespace-nowrap text-sm font-semibold text-slate-900">
                Brawlers Boxing
              </div>
              <div className="whitespace-nowrap text-xs text-slate-500">
                Boxing programme
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
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
            <div className="truncate font-medium text-slate-700">
              {user.email}
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {(user?.roles || []).join(', ')}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}