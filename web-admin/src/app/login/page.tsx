'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('naseem@thebutterflymovement.health');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(email.trim().toLowerCase(), password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-brand-50 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-brand-500 text-white items-center justify-center text-xl font-bold shadow-soft">
            TBM
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Sign in to The Butterfly Movement
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Staff portal for Brawlers Boxing.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 bg-slate-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 bg-slate-50"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2.5 shadow-soft transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[11px] text-slate-500">
            <p className="font-medium text-slate-600 mb-1">Staff accounts</p>
            <p>Coach: jamee@thebutterflymovement.health</p>
            <p>Staff: emon@thebutterflymovement.health</p>
            <p>Admin: naseem@thebutterflymovement.health</p>
            <p>Admin: abdulhannan@thebutterflymovement.health</p>
          </div>
        </div>
      </div>
    </div>
  );
}