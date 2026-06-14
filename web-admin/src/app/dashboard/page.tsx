// web-admin/src/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/apiClient';

type Member = {
  _id: string;
  childFirstName?: string;
  childMiddleName?: string;
  childLastName?: string;
  session?: string;
  membershipStatus?: string;
  createdAt?: string;
};

type AttendanceMemberReport = {
  memberId: string;
  childName: string;
  session: string;
  total: number;
  present: number;
  absent: number;
  rate: number;
};

type AttendanceReport = {
  totalMarked: number;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  cubsAttendanceRate: number;
  tigersAttendanceRate: number;
  mostRegular: AttendanceMemberReport[];
  lowAttendance: AttendanceMemberReport[];
};

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceReport, setAttendanceReport] =
    useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Member[]>('/members'),
      apiFetch<AttendanceReport>('/attendance/report'),
    ])
      .then(([memberData, attendanceData]) => {
        setMembers(memberData);
        setAttendanceReport(attendanceData);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data:', err);
        setMembers([]);
        setAttendanceReport(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalMembers = members.length;

  const activeMembers = members.filter(
    (member) => member.membershipStatus === 'ACTIVE',
  ).length;

  const expiredMembers = members.filter(
    (member) => member.membershipStatus === 'EXPIRED',
  ).length;

  const cubsCount = members.filter((member) => member.session === 'CUBS').length;

  const tigersCount = members.filter(
    (member) => member.session === 'TIGERS',
  ).length;

  const recentMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [members]);

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-900">
                Welcome back, {user?.email?.split('@')[0] ?? 'User'} 👋
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Here&apos;s a live overview of your members, payments and
                attendance.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Total Members"
                value={loading ? '...' : String(totalMembers)}
                trend="Registered members"
              />

              <StatCard
                label="Active Members"
                value={loading ? '...' : String(activeMembers)}
                trend="Paid and in date"
                variant="success"
              />

              <StatCard
                label="Expired Members"
                value={loading ? '...' : String(expiredMembers)}
                trend="No active payment"
                variant="danger"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                label="Cubs"
                value={loading ? '...' : String(cubsCount)}
                trend="5-10 year olds"
                variant="orange"
              />

              <StatCard
                label="Tigers"
                value={loading ? '...' : String(tigersCount)}
                trend="11-17 year olds"
                variant="blue"
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Attendance report
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Overall Attendance"
                  value={
                    loading
                      ? '...'
                      : `${attendanceReport?.attendanceRate ?? 0}%`
                  }
                  trend={`${attendanceReport?.totalPresent ?? 0} present / ${
                    attendanceReport?.totalMarked ?? 0
                  } marked`}
                  variant="success"
                />

                <StatCard
                  label="Cubs Attendance"
                  value={
                    loading
                      ? '...'
                      : `${attendanceReport?.cubsAttendanceRate ?? 0}%`
                  }
                  trend="Cubs register rate"
                  variant="orange"
                />

                <StatCard
                  label="Tigers Attendance"
                  value={
                    loading
                      ? '...'
                      : `${attendanceReport?.tigersAttendanceRate ?? 0}%`
                  }
                  trend="Tigers register rate"
                  variant="blue"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recently added members
                </h3>

                <Link
                  href="/members"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <p className="text-sm text-slate-500">Loading members...</p>
              ) : recentMembers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No members have been added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentMembers.map((member) => {
                    const fullName = [
                      member.childFirstName,
                      member.childMiddleName,
                      member.childLastName,
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <Link
                        key={member._id}
                        href={`/members/${member._id}`}
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {fullName || 'Unnamed member'}
                          </p>

                          <p className="text-xs text-slate-500">
                            Added {formatDate(member.createdAt)} ·{' '}
                            {member.session || 'UNKNOWN'}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            member.membershipStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : member.membershipStatus === 'EXPIRED'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {member.membershipStatus || 'UNKNOWN'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Quick actions
              </h3>

              <div className="space-y-2">
                <Link
                  href="/members/new"
                  className="block rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
                >
                  + Add new member
                </Link>

                <Link
                  href="/members"
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View members
                </Link>

                <Link
                  href="/attendance"
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Take register
                </Link>
              </div>
            </div>

            <AttendanceList
              title="Most regular pupils"
              emptyText="No attendance data yet."
              members={attendanceReport?.mostRegular || []}
            />

            <AttendanceList
              title="Low attendance"
              emptyText="No low attendance pupils yet."
              members={attendanceReport?.lowAttendance || []}
              danger
            />
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
  variant = 'default',
}: {
  label: string;
  value: string;
  trend: string;
  variant?: 'default' | 'success' | 'danger' | 'orange' | 'blue';
}) {
  const trendClass =
    variant === 'success'
      ? 'text-emerald-600'
      : variant === 'danger'
      ? 'text-red-600'
      : variant === 'orange'
      ? 'text-orange-600'
      : variant === 'blue'
      ? 'text-blue-600'
      : 'text-slate-500';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
      <div className={`mt-1 text-[11px] ${trendClass}`}>{trend}</div>
    </div>
  );
}

function AttendanceList({
  title,
  emptyText,
  members,
  danger = false,
}: {
  title: string;
  emptyText: string;
  members: AttendanceMemberReport[];
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>

      {members.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <Link
              key={member.memberId}
              href={`/members/${member.memberId}`}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {member.childName}
                </p>
                <p className="text-xs text-slate-500">
                  {member.present}/{member.total} attended · {member.session}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  danger
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {member.rate}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}