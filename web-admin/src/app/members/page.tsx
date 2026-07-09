// web-admin/src/app/members/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { apiFetch } from '../../lib/apiClient';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB');
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [sessionFilter, setSessionFilter] = useState<
    'ALL' | 'CUBS' | 'TIGERS' | 'UNKNOWN'
  >('ALL');

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'EXPIRED'
  >('ALL');

  const filteredMembers = members.filter((member) => {
    const sessionMatches =
      sessionFilter === 'ALL' || (member.session || 'UNKNOWN') === sessionFilter;
  
    const statusMatches =
      statusFilter === 'ALL' || member.membershipStatus === statusFilter;
  
    const childFullName = [
      member.childFirstName,
      member.childMiddleName,
      member.childLastName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  
    const searchMatches = childFullName.includes(search.toLowerCase());
  
    return sessionMatches && statusMatches && searchMatches;
  });
  
  const getSessionCount = (session: 'ALL' | 'CUBS' | 'TIGERS' | 'UNKNOWN') => {
    if (session === 'ALL') return members.length;
  
    return members.filter(
      (member) => (member.session || 'UNKNOWN') === session,
    ).length;
  };
  
  const getStatusCount = (status: 'ALL' | 'ACTIVE' | 'EXPIRED') => {
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

  useEffect(() => {
    apiFetch<Member[]>('/members')
      .then(setMembers)
      .catch((err) => {
        console.error('Failed to fetch members:', err);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, []);
  
  const handleExportPaymentSheet = () => {
    const rows = filteredMembers.map((member) => ({
      "Child Name": [
        member.childFirstName,
        member.childMiddleName,
        member.childLastName,
      ]
        .filter(Boolean)
        .join(" "),
    
      Session: member.session || "",
    
      "Membership Status": member.membershipStatus || "",
    
      Disciplines: member.disciplines?.join(", ") || "",
    
      "Date of Birth": formatDate(member.childDateOfBirth),
    
      "Parent/Guardian Name": [
        member.guardianFirstName,
        member.guardianLastName,
      ]
        .filter(Boolean)
        .join(" "),
    
      "Paid?": "",
    
      Notes: "",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(rows);
  
    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 28 },
      { wch: 18 },
      { wch: 30 },
      { wch: 12 },
      { wch: 35 },
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Register");
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    saveAs(
      file,
      `payment-register-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Members
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Overview of all registered child members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPaymentSheet}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft hover:bg-slate-50"
            >
              Export Payment Register
            </button>

            <Link
              href="/members/new"
              className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-brand-700"
            >
              + Add member
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name..."
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="mb-4 flex gap-2">
          {(['ALL', 'CUBS', 'TIGERS', 'UNKNOWN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSessionFilter(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                sessionFilter === tab
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab} ({getSessionCount(tab)})
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All statuses' : status} ({getStatusCount(status)})
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">

          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Child name</th>
                <th className="px-4 py-3 text-left">Membership</th>                
                <th className="px-4 py-3 text-left">Disciplines</th>
                <th className="px-4 py-3 text-left">Session</th>
                <th className="px-4 py-3 text-left">DOB</th>
                <th className="px-4 py-3"></th>
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
                  const childFullName = [
                    member.childFirstName,
                    member.childMiddleName,
                    member.childLastName,
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const disciplines = member.disciplines || [];

                  const session =
                    member.session ||
                    member.membershipStatus ||
                    'UNKNOWN';

                  return (
                    <tr
                      key={member._id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {childFullName || '-'}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            member.membershipStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : member.membershipStatus === 'EXPIRED'
                              ? 'bg-red-50 text-red-700'
                              : member.membershipStatus === 'SUSPENDED'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {member.membershipStatus || 'UNKNOWN'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {disciplines.length > 0
                          ? disciplines.join(', ')
                          : '-'}
                      </td>

                      <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          session === 'CUBS'
                            ? 'bg-orange-50 text-orange-700'
                            : session === 'TIGERS'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                          {session}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(member.childDateOfBirth)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/members/${member._id}`}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700"
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
      </Shell>
    </Protected>
  );
}