'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Protected } from '../../../components/Protected';
import { Shell } from '../../../components/layout/Shell';
import { apiFetch } from '../../../lib/apiClient';

type MemberDetail = {
  id: string;
  firstName: string;
  lastName: string;
  disciplines: string[];
  membershipStatus: string;
  email?: string;
  phone?: string;
};

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const memberId = params.id;
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    apiFetch<MemberDetail>(`/members/${memberId}`)
      .then(setMember)
      .catch(() => {
        // fallback dummy data
        setMember({
          id: memberId,
          firstName: 'Alex',
          lastName: 'Perez',
          disciplines: ['BJJ', 'Muay Thai'],
          membershipStatus: 'ACTIVE',
          email: 'alex@example.com',
          phone: '+44 7700 900123',
        });
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}

        {!loading && member && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {member.firstName} {member.lastName}
                </h1>
                <p className="text-sm text-slate-500">
                  {member.disciplines.join(' · ')}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  member.membershipStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {member.membershipStatus}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 md:col-span-2">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Contact details
                </h2>
                <dl className="grid gap-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="text-slate-900">{member.email ?? '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="text-slate-900">{member.phone ?? '-'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Quick actions
                </h2>
                <div className="space-y-2">
                  <button className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 text-slate-700">
                    View attendance
                  </button>
                  <button className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 text-slate-700">
                    View payments
                  </button>
                  <button className="w-full text-xs rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-xs">
                    Suspend membership
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Shell>
    </Protected>
  );
}
