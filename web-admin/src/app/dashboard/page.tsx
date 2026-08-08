// web-admin/src/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { useAuth } from '../../context/AuthContext';
import { useProgramme } from '../../context/ProgrammeContext';
import { apiFetch } from '../../lib/apiClient';
import { withProgramme } from '../../lib/programmeApi';

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
  juniorsAttendanceRate?: number;
  adultsAttendanceRate?: number;
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

function getMemberName(member: Member) {
  return [
    member.childFirstName,
    member.childMiddleName,
    member.childLastName,
  ]
    .filter(Boolean)
    .join(' ');
}

function MembershipBadge({ status }: { status?: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        status === 'ACTIVE'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'EXPIRED'
          ? 'bg-red-50 text-red-700'
          : status === 'SUSPENDED'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status || 'UNKNOWN'}
    </span>
  );
}

function SessionBadge({ session }: { session?: string }) {
  const value = session || 'UNKNOWN';

  const badgeClass =
    value === 'CUBS'
      ? 'bg-orange-50 text-orange-700'
      : value === 'TIGERS'
      ? 'bg-blue-50 text-blue-700'
      : value === 'ADULTS'
      ? 'bg-violet-50 text-violet-700'
      : value === 'JUNIORS'
      ? 'bg-cyan-50 text-cyan-700'
      : 'bg-slate-100 text-slate-600';

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}
    >
      {value}
    </span>
  );
}

function formatSessionLabel(session: string) {
  return session
    .toLowerCase()
    .replace(/(^|_)([a-z])/g, (_, prefix, letter) =>
      `${prefix ? ' ' : ''}${letter.toUpperCase()}`,
    )
    .trim();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { programmeId, programme } = useProgramme();

  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceReport, setAttendanceReport] =
    useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  const canManageMembers =
    user?.roles.includes('ADMIN') ||
    user?.roles.includes('SUPER_ADMIN');

  useEffect(() => {
    setLoading(true);

    Promise.all([
      apiFetch<Member[]>(withProgramme('/members', programmeId)),
      apiFetch<AttendanceReport>(
        withProgramme('/attendance/report', programmeId),
      ),
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
  }, [programmeId]);

  const totalMembers = members.length;

  const activeMembers = members.filter(
    (member) => member.membershipStatus === 'ACTIVE',
  ).length;

  const expiredMembers = members.filter(
    (member) => member.membershipStatus === 'EXPIRED',
  ).length;

  const sessionSummaries = useMemo(() => {
    const preferredOrder =
      programmeId === 'BRAWLERS_BOXING'
        ? ['CUBS', 'TIGERS']
        : ['JUNIORS', 'ADULTS'];

    const actualSessions = Array.from(
      new Set(
        members
          .map((member) => member.session || 'UNKNOWN')
          .filter((session) => session !== 'UNKNOWN'),
      ),
    );

    const orderedSessions = [
      ...preferredOrder.filter((session) => actualSessions.includes(session)),
      ...actualSessions.filter((session) => !preferredOrder.includes(session)),
    ].slice(0, 2);

    return orderedSessions.map((session) => ({
      session,
      count: members.filter((member) => member.session === session).length,
    }));
  }, [members, programmeId]);

  const getAttendanceRateForSession = (session: string) => {
    if (!attendanceReport) return 0;

    if (session === 'CUBS') return attendanceReport.cubsAttendanceRate ?? 0;
    if (session === 'TIGERS') return attendanceReport.tigersAttendanceRate ?? 0;
    if (session === 'JUNIORS') return attendanceReport.juniorsAttendanceRate ?? 0;
    if (session === 'ADULTS') return attendanceReport.adultsAttendanceRate ?? 0;

    return 0;
  };

  const getSessionTrend = (session: string) => {
    if (programmeId === 'BRAWLERS_BOXING') {
      if (session === 'CUBS') return '5-10 year olds';
      if (session === 'TIGERS') return '11-17 year olds';
    }

    return `${formatSessionLabel(session)} participants`;
  };

  const getSessionVariant = (
    session: string,
  ): 'default' | 'orange' | 'blue' => {
    if (session === 'CUBS') return 'orange';
    if (session === 'TIGERS') return 'blue';
    return 'default';
  };

  const recentMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 5);
  }, [members]);

  const firstName = user?.email?.split('@')[0] || 'User';

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Staff dashboard
              </p>

              <h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">
                Welcome back, {firstName} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Here&apos;s a live overview of {programme.name} members,
                payments and attendance.
              </p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {canManageMembers && (
                  <Link
                    href="/members/new"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    + Add member
                  </Link>
                )}

                <Link
                  href="/attendance"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Take register
                </Link>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

            {sessionSummaries.map(({ session, count }) => (
              <StatCard
                key={session}
                label={formatSessionLabel(session)}
                value={loading ? '...' : String(count)}
                trend={getSessionTrend(session)}
                variant={getSessionVariant(session)}
              />
            ))}
          </div>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Attendance report
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {programme.name} attendance performance across all marked
                  registers.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {loading
                  ? 'Loading...'
                  : `${attendanceReport?.totalMarked ?? 0} marked`}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Overall Attendance"
                value={
                  loading ? '...' : `${attendanceReport?.attendanceRate ?? 0}%`
                }
                trend={`${attendanceReport?.totalPresent ?? 0} present / ${
                  attendanceReport?.totalMarked ?? 0
                } marked`}
                variant="success"
              />

              {sessionSummaries.map(({ session }) => (
                <StatCard
                  key={session}
                  label={`${formatSessionLabel(session)} Attendance`}
                  value={
                    loading
                      ? '...'
                      : `${getAttendanceRateForSession(session)}%`
                  }
                  trend={`${formatSessionLabel(session)} register rate`}
                  variant={getSessionVariant(session)}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recently added members
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    The latest child members added to the system.
                  </p>
                </div>

                <Link
                  href="/members"
                  className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                  Loading members...
                </div>
              ) : recentMembers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                  No members have been added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMembers.map((member) => {
                    const fullName = getMemberName(member);

                    return (
                      <Link
                        key={member._id}
                        href={`/members/${member._id}`}
                        className="block rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50 sm:p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {fullName || 'Unnamed member'}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Added {formatDate(member.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <SessionBadge session={member.session} />
                            <MembershipBadge status={member.membershipStatus} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Quick actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Common admin tasks.
              </p>

              <div className="mt-4 grid gap-2">
                {canManageMembers && (
                  <Link
                    href="/members/new"
                    className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    <span>+ Add new member</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}

                <Link
                  href="/members"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <span>View members</span>
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/attendance"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <span>Take register</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
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
  const accentClass =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : variant === 'danger'
      ? 'bg-red-50 text-red-700'
      : variant === 'orange'
      ? 'bg-orange-50 text-orange-700'
      : variant === 'blue'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-slate-100 text-slate-600';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <span
          className={`h-3 w-3 shrink-0 rounded-full ${accentClass}`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">{trend}</p>
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
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">
            Attendance based on marked registers.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {members.length}
        </span>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Link
              key={member.memberId}
              href={`/members/${member.memberId}`}
              className="block rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {member.childName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {member.present}/{member.total} attended ·{' '}
                    {member.session}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    danger
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {member.rate}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    danger ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(Math.max(member.rate, 0), 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}