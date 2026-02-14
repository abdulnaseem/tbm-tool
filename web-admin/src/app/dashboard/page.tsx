'use client';

import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Welcome back, {user?.email?.split('@')[0] ?? 'User'} 👋
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Here&apos;s a quick overview of today&apos;s classes and
                activity.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Today’s Classes" value="4" trend="+1 vs last week" />
              <StatCard label="Total Members" value="128" trend="+6 this month" />
              <StatCard label="Attendance Rate" value="82%" trend="Stable" />
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Today’s Sessions
              </h3>
              <ul className="divide-y divide-slate-100 text-sm">
                <li className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-slate-900">
                      BJJ Fundamentals
                    </div>
                    <div className="text-xs text-slate-500">
                      18:00 – 19:00 · Coach Alex
                    </div>
                  </div>
                  <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                    18 booked
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-slate-900">
                      Muay Thai All Levels
                    </div>
                    <div className="text-xs text-slate-500">
                      19:00 – 20:00 · Coach Sam
                    </div>
                  </div>
                  <span className="text-xs rounded-full bg-amber-50 text-amber-700 px-2 py-1">
                    12 booked
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Recent News
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="font-medium text-slate-900">
                    Grading weekend confirmed
                  </div>
                  <div className="text-xs text-slate-500">
                    2 days ago · All disciplines
                  </div>
                </li>
                <li className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="font-medium text-slate-900">
                    New intro course intake
                  </div>
                  <div className="text-xs text-slate-500">
                    5 days ago · Boxing
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Shell>
    </Protected>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-[11px] text-emerald-600">{trend}</div>
    </div>
  );
}
