// web-admin/src/context/AuthContext.tsx
'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiFetch } from '../lib/apiClient';
import type {
  AuthUser,
  LoginResponse,
  UserRole,
} from '../types/auth';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const authenticatedUser = await apiFetch<AuthUser>('/auth/me');
      setUser(authenticatedUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setLoading(true);

      try {
        const result = await apiFetch<LoginResponse>(
          '/auth/login/staff',
          {
            method: 'POST',
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password,
            }),
          },
          false,
        );

        setUser(result.user);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiFetch<{ ok: true }>(
        '/auth/logout',
        {
          method: 'POST',
        },
        false,
      );
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) =>
      roles.some((role) => user?.roles.includes(role)),
    [user],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      hasRole,
      login,
      logout,
      refresh: fetchMe,
    }),
    [user, loading, hasRole, login, logout, fetchMe],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }

  return context;
}