'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { apiFetch } from '../../lib/apiClient';

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  disciplines: string[];
  membershipStatus: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If backend /members not ready, you can replace this with static data
    apiFetch<Member[]>('/members')
      .then(setMembers)
      .catch(() => {
        setMembers([
          {
            id: '1',
            firstName: 'Alex',
            lastName: 'Perez',
            disciplines: ['BJJ', 'Muay Thai'],
            membershipStatus: 'ACTIVE',
          },
          {
            id: '2',
            firstName: 'Jamie',
            lastName: 'Lee',
            disciplines: ['Boxing'],
            membershipStatus: 'TRIAL',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Members</h1>
            <p className="text-sm text-slate-500">
              Overview of all active members across disciplines.
            </p>
          </div>
          <button className="hidden md:inline-flex items-center rounded-xl bg-brand-600 text-white text-sm font-medium px-3 py-2 shadow-soft hover:bg-brand-700">
            + Add member
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Disciplines</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Loading members…
                  </td>
                </tr>
              )}

              {!loading &&
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {m.firstName} {m.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.disciplines.join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          m.membershipStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.membershipStatus === 'TRIAL'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.membershipStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/members/${m.id}`}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

              {!loading && members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Shell>
    </Protected>
  );
}
