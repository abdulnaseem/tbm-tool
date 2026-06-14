'use client';

import { useEffect, useState } from 'react';
import { Protected } from '../../components/Protected';
import { Shell } from '../../components/layout/Shell';
import { apiFetch } from '../../lib/apiClient';

type Session = 'CUBS' | 'TIGERS';
type Status = 'PRESENT' | 'ABSENT';

type RegisterMember = {
  memberId: string;
  childName: string;
  session: Session;
  status: Status | null;
  markedAt?: string | null;
};

type RegisterResponse = {
  session: Session;
  date: string;
  registerOpen: boolean;
  message: string;
  members: RegisterMember[];
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

function formatTime(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AttendancePage() {
  const [session, setSession] = useState<Session>('CUBS');
  const [register, setRegister] = useState<RegisterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function loadRegister(selectedSession = session) {
    setLoading(true);

    try {
      const data = await apiFetch<RegisterResponse>(
        `/attendance/register/${selectedSession}`,
      );

      setRegister(data);
    } catch (err) {
      console.error('Failed to load register:', err);
      setRegister(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegister(session);
  }, [session]);

  async function markAttendance(memberId: string, status: Status) {
    if (!register?.registerOpen) {
      alert('Register is currently closed.');
      return;
    }

    setMarkingId(memberId);

    try {
      await apiFetch('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          memberId,
          session,
          status,
          markedBy: 'ADMIN',
        }),
      });

      await loadRegister(session);
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      alert('Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  }

  const sessionLabel =
    session === 'CUBS'
      ? 'Cubs · Saturday 12:30pm – 1:45pm'
      : 'Tigers · Saturday 1:45pm – 3:00pm';

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Take register
              </h1>
              <p className="mt-1 text-sm text-slate-500">{sessionLabel}</p>
            </div>

            <div className="flex gap-2">
              {(['CUBS', 'TIGERS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSession(tab)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${
                    session === tab
                      ? tab === 'CUBS'
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-500 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 text-sm shadow-soft ${
              register?.registerOpen
                ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                : 'border-amber-100 bg-amber-50 text-amber-800'
            }`}
          >
            <div className="font-semibold">
              {register?.registerOpen ? 'Register open' : 'Register closed'}
            </div>
            <div className="mt-1">
              {register?.message ||
                'Register opens 10 minutes before the session starts.'}
            </div>
            <div className="mt-1 text-xs">
              Date: {formatDate(register?.date)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {session} register
                </h2>
                <p className="text-xs text-slate-500">
                  Mark each pupil as present or absent.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {register?.members.length || 0} pupils
              </span>
            </div>

            {loading && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                Loading register…
              </div>
            )}

            {!loading && !register && (
              <div className="px-5 py-8 text-center text-sm text-red-500">
                Failed to load register.
              </div>
            )}

            {!loading && register && register.members.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No pupils found for this session.
              </div>
            )}

            {!loading && register && register.members.length > 0 && (
              <div className="divide-y divide-slate-100">
                {register.members.map((member) => {
                  const selectedStatus = member.status;

                  return (
                    <div
                      key={member.memberId}
                      className={`p-5 ${
                        selectedStatus === 'ABSENT'
                          ? 'bg-orange-50/60'
                          : selectedStatus === 'PRESENT'
                          ? 'bg-emerald-50/40'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {member.childName || 'Unnamed pupil'}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Status:{' '}
                            <span className="font-medium">
                              {selectedStatus || 'Not marked'}
                            </span>{' '}
                            · Marked at {formatTime(member.markedAt)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
                          <button
                            disabled={
                              !register.registerOpen ||
                              markingId === member.memberId
                            }
                            onClick={() =>
                              markAttendance(member.memberId, 'ABSENT')
                            }
                            className={`rounded-xl border px-5 py-2 text-sm font-medium disabled:opacity-50 ${
                              selectedStatus === 'ABSENT'
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-orange-50'
                            }`}
                          >
                            ✕ Absent
                          </button>

                          <button
                            disabled={
                              !register.registerOpen ||
                              markingId === member.memberId
                            }
                            onClick={() =>
                              markAttendance(member.memberId, 'PRESENT')
                            }
                            className={`rounded-xl border px-5 py-2 text-sm font-medium disabled:opacity-50 ${
                              selectedStatus === 'PRESENT'
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50'
                            }`}
                          >
                            ✓ Present
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Shell>
    </Protected>
  );
}