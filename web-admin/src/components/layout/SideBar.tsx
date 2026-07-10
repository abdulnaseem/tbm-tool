'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type IconName = 'dashboard' | 'members' | 'attendance';

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/members', label: 'Members', icon: 'members' },
  { href: '/attendance', label: 'Attendance', icon: 'attendance' },
];

function Icon({ name }: { name: IconName }) {
  const className = 'h-5 w-5 shrink-0';

  if (name === 'dashboard') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === 'members') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 11a4 4 0 1 0-3.46-6A5.5 5.5 0 0 1 15 9.5c0 .52-.07 1.02-.21 1.5H16Zm-6.5 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6.5 2c-1.21 0-2.33.35-3.28.94A7.02 7.02 0 0 1 16.5 20H21v-2a5 5 0 0 0-5-5Zm-6.5 0A5.5 5.5 0 0 0 4 18.5V20h11v-1.5A5.5 5.5 0 0 0 9.5 13Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v12A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-12A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm13 8H4v8.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V10ZM6 13h3v3H6v-3Zm5 0h3v3h-3v-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    const email = user?.email || 'User';
    return email.charAt(0).toUpperCase();
  }, [user?.email]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <div className="shrink-0 border-b border-slate-100 px-3 py-4">
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-slate-950">
            <Image
              src="/butterfly-logo-black.jpeg"
              alt="The Butterfly Movement logo"
              fill
              sizes="44px"
              className="object-contain p-1"
              priority
            />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-sm font-bold leading-tight text-slate-900">
                The Butterfly Movement
              </h1>

              <p className="whitespace-nowrap text-xs font-medium text-slate-500">
                Staff portal
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
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
        )}
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? 'justify-center' : 'gap-3'
              } ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon name={item.icon} />

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-4">
        {user && (
          <div
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-700">
                  {user.email}
                </div>

                <div className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {(user?.roles || []).join(', ')}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="mt-4 hidden w-full items-center justify-center rounded-2xl border border-slate-100 px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 md:flex"
        >
          <span className="text-lg leading-none">
            {collapsed ? '→' : '←'}
          </span>

          {!collapsed && (
            <span className="ml-2 text-xs font-medium">Collapse</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-soft ring-1 ring-slate-100 md:hidden"
      >
        ☰
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r border-slate-100 bg-white shadow-soft transition-[width,transform] duration-300 ease-in-out ${
          collapsed ? 'md:w-20' : 'md:w-64'
        } ${
          mobileOpen
            ? 'w-72 translate-x-0'
            : 'w-72 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex shrink-0 justify-end px-3 pt-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}