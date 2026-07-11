// web-admin/src/app/members/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { apiFetch } from '../../lib/apiClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

type Member = {
  _id: string;
  childFirstName?: string;
  childMiddleName?: string;
  childLastName?: string;
  disciplines?: string[];
  session?: string;
  membershipStatus?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  childDateOfBirth?: string;
  createdAt?: string;
};

type SessionFilter = 'ALL' | 'CUBS' | 'TIGERS' | 'UNKNOWN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'EXPIRED';

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB');
}

function getChildFullName(member: Member) {
  return [
    member.childFirstName,
    member.childMiddleName,
    member.childLastName,
  ]
    .filter(Boolean)
    .join(' ');
}

function getGuardianFullName(member: Member) {
  return [member.guardianFirstName, member.guardianLastName]
    .filter(Boolean)
    .join(' ');
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        value === 'CUBS'
          ? 'bg-orange-50 text-orange-700'
          : value === 'TIGERS'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {value}
    </span>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { user } = useAuth();

  const canManageMembers =
    user?.roles.includes('ADMIN') ||
    user?.roles.includes('SUPER_ADMIN');

  useEffect(() => {
    apiFetch<Member[]>('/members')
      .then(setMembers)
      .catch((err) => {
        console.error('Failed to fetch members:', err);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const session = member.session || 'UNKNOWN';

      const sessionMatches =
        sessionFilter === 'ALL' || session === sessionFilter;

      const statusMatches =
        statusFilter === 'ALL' || member.membershipStatus === statusFilter;

      const childFullName = getChildFullName(member).toLowerCase();
      const guardianFullName = getGuardianFullName(member).toLowerCase();

      const searchMatches =
        !normalizedSearch ||
        childFullName.includes(normalizedSearch) ||
        guardianFullName.includes(normalizedSearch);

      return sessionMatches && statusMatches && searchMatches;
    });
  }, [members, search, sessionFilter, statusFilter]);

  const getSessionCount = (session: SessionFilter) => {
    if (session === 'ALL') return members.length;

    return members.filter(
      (member) => (member.session || 'UNKNOWN') === session,
    ).length;
  };

  const getStatusCount = (status: StatusFilter) => {
    const sessionFiltered =
      sessionFilter === 'ALL'
        ? members
        : members.filter(
            (member) => (member.session || 'UNKNOWN') === sessionFilter,
          );

    if (status === 'ALL') return sessionFiltered.length;

    return sessionFiltered.filter(
      (member) => member.membershipStatus === status,
    ).length;
  };

  const handleExportPaymentSheet = () => {
    const rows = filteredMembers.map((member) => ({
      'Child Name': getChildFullName(member),
      Session: member.session || '',
      'Membership Status': member.membershipStatus || '',
      Disciplines: member.disciplines?.join(', ') || '',
      'Date of Birth': formatDate(member.childDateOfBirth),
      'Parent/Guardian Name': getGuardianFullName(member),
      'Paid?': '',
      Notes: '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 28 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 28 },
      { wch: 12 },
      { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Register');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const file = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(
      file,
      `payment-register-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Members
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Overview of all registered child members.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {canManageMembers && (
                <button
                  type="button"
                  onClick={handleExportPaymentSheet}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-soft transition hover:bg-slate-50 sm:w-auto"
                >
                  Export Payment Register
                </button>
              )}

              {canManageMembers && (
                <Link
                  href="/members/new"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 sm:w-auto"
                >
                  + Add member
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-soft sm:p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member or guardian..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />

            <div className="mt-4 space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['ALL', 'CUBS', 'TIGERS', 'UNKNOWN'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSessionFilter(tab)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      sessionFilter === tab
                        ? 'bg-brand-600 text-white shadow-soft'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab === 'ALL' ? 'All' : tab} ({getSessionCount(tab)})
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      statusFilter === status
                        ? 'bg-brand-600 text-white shadow-soft'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'ALL' ? 'All statuses' : status} (
                    {getStatusCount(status)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            {loading && (
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-8 text-center text-sm text-slate-400 shadow-soft">
                Loading members…
              </div>
            )}

            {!loading && filteredMembers.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-8 text-center text-sm text-slate-400 shadow-soft">
                No members found.
              </div>
            )}

            {!loading && filteredMembers.length > 0 && (
              <div className="space-y-3">
                {filteredMembers.map((member) => {
                  const childFullName = getChildFullName(member);
                  const disciplines = member.disciplines || [];

                  return (
                    <Link
                      key={member._id}
                      href={`/members/${member._id}`}
                      className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-soft transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-slate-900">
                            {childFullName || '-'}
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            DOB: {formatDate(member.childDateOfBirth)}
                          </p>
                        </div>

                        <StatusBadge status={member.membershipStatus} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <SessionBadge session={member.session} />

                        {disciplines.length > 0 ? (
                          disciplines.map((discipline) => (
                            <span
                              key={discipline}
                              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                            >
                              {discipline}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                            No disciplines
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="truncate text-xs text-slate-500">
                          Guardian: {getGuardianFullName(member) || '-'}
                        </span>
                        <span className="ml-3 shrink-0 text-xs font-semibold text-brand-600">
                          View
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Child name</th>
                    <th className="px-4 py-3 text-left">Membership</th>
                    <th className="px-4 py-3 text-left">Disciplines</th>
                    <th className="px-4 py-3 text-left">Session</th>
                    <th className="px-4 py-3 text-left">DOB</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        Loading members…
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredMembers.map((member) => {
                      const childFullName = getChildFullName(member);
                      const disciplines = member.disciplines || [];

                      return (
                        <tr
                          key={member._id}
                          className="border-t border-slate-100 hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900">
                              {childFullName || '-'}
                            </div>
                            <div className="mt-1 text-xs text-slate-400 lg:hidden">
                              Guardian: {getGuardianFullName(member) || '-'}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={member.membershipStatus} />
                          </td>

                          <td className="max-w-[240px] px-4 py-4 text-slate-600">
                            <span className="line-clamp-2">
                              {disciplines.length > 0
                                ? disciplines.join(', ')
                                : '-'}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <SessionBadge session={member.session} />
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {formatDate(member.childDateOfBirth)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/members/${member._id}`}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}

                  {!loading && filteredMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        No members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Shell>
    </Protected>
  );
}