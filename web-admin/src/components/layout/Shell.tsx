// web-admin/src/components/layout/Shell.tsx
'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './SideBar';
import { TopNav } from './TopNav';

export function Shell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`flex min-h-screen min-w-0 flex-col transition-[margin] duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <TopNav />

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}