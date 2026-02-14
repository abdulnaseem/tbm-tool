'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@gym.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   setError(null);
  //   try {
  //     await login(email, password);
  //   } catch (err) {
  //     setError('Invalid email or password');
  //   }
  // };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
    router.push('/dashboard');
  }

  // async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   setError("");

  //   const res = await fetch("http://localhost:4000/api/auth/login/staff", {
  //     method: "POST",
  //     credentials: "include", // <-- important
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   if (!res.ok) {
  //     setError("Invalid credentials");
  //     return;
  //   }

  //   router.push("/dashboard");
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-brand-50">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-brand-500 text-white items-center justify-center text-xl font-bold shadow-soft">
            M
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Sign in to MMA Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Use your staff login to access the dashboard.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500 bg-slate-50"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2.5 shadow-soft transition disabled:opacity-70"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center">
            Demo accounts: admin@gym.com / coach@gym.com — password123
          </p>
        </div>
      </div>
    </div>
  );
}
