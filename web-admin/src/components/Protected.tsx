// web-admin/src/components/Protected.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

type ProtectedProps = {
  children: ReactNode;
  roles?: UserRole[];
};

export function Protected({
  children,
  roles = [],
}: ProtectedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const hasRequiredRole =
    roles.length === 0 ||
    roles.some((role) => user?.roles.includes(role));

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!hasRequiredRole) {
      router.replace('/dashboard');
    }
  }, [hasRequiredRole, loading, router, user]);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user || !hasRequiredRole) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div
        aria-label="Loading"
        className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
      />
    </div>
  );
}