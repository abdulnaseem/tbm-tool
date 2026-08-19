// web-admin/src/app/members/[id]/page.tsx
'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Protected } from '../../../components/Protected';
import { Shell } from '../../../components/layout/Shell';
import { apiFetch } from '../../../lib/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { useProgramme } from '../../../context/ProgrammeContext';
import { withProgramme } from '../../../lib/programmeApi';


type MemberDetail = {
  _id: string;
  accountType?: string;
  guardianFirstName?: string;
  guardianMiddleName?: string;
  guardianLastName?: string;
  email?: string;
  relationship?: string;
  childFirstName?: string;
  childMiddleName?: string;
  childLastName?: string;
  childsGender?: string;
  childDateOfBirth?: string;
  disciplines?: string[];
  membershipStatus?: string;
  session?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  safeguardingNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  consentPhotography?: boolean;
  consentData?: boolean;
  consentSafeguarding?: boolean;

  trainingStartDate?: string | null;
  bjjBelt?: string;
  bjjStripes?: number;
  lastGradingDate?: string | null;
  gradingNotes?: string;

  createdAt?: string;
  updatedAt?: string;
};

type BjjProgress = {
  memberId: string;
  childName: string;
  trainingStartDate: string | null;
  monthsTraining: number;
  currentBelt: string;
  stripes: number;
  lastGradingDate: string | null;
  gradingNotes: string;
  recordedClasses: number;
  recordedAbsences: number;
  totalRecordedRegisters: number;
  attendanceRate: number;
  firstRecordedClass: string | null;
  latestRecordedClass: string | null;
};

type Payment = {
  _id: string;
  memberId: string;
  guardianEmail?: string;
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD';
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  periodStart: string;
  periodEnd: string;
  notes?: string;
  recordedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

function formatBoolean(value?: boolean) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '-';
}

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

function formatLongDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTrainingDuration(months?: number) {
  if (!months || months <= 0) return 'Less than 1 month';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }

  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${
    remainingMonths === 1 ? '' : 's'
  }`;
}

function formatBelt(value?: string | null) {
  if (!value) return 'White';

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' / ');
}

function getFullName(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="shrink-0 text-sm text-slate-400">
        {label}
      </span>

      <div className="min-w-0 break-all text-right text-sm font-medium text-slate-900">
        {value || '-'}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getBeltBackground(belt?: string | null) {
  switch (belt) {
    case 'GREY_WHITE':
      return 'linear-gradient(90deg, #ffffff 0 24%, #9ca3af 24% 76%, #ffffff 76% 100%)';
    case 'GREY':
      return '#9ca3af';
    case 'GREY_BLACK':
      return 'linear-gradient(90deg, #111827 0 24%, #9ca3af 24% 76%, #111827 76% 100%)';
    case 'YELLOW_WHITE':
      return 'linear-gradient(90deg, #ffffff 0 24%, #facc15 24% 76%, #ffffff 76% 100%)';
    case 'YELLOW':
      return '#facc15';
    case 'YELLOW_BLACK':
      return 'linear-gradient(90deg, #111827 0 24%, #facc15 24% 76%, #111827 76% 100%)';
    case 'ORANGE_WHITE':
      return 'linear-gradient(90deg, #ffffff 0 24%, #f97316 24% 76%, #ffffff 76% 100%)';
    case 'ORANGE':
      return '#f97316';
    case 'ORANGE_BLACK':
      return 'linear-gradient(90deg, #111827 0 24%, #f97316 24% 76%, #111827 76% 100%)';
    case 'GREEN_WHITE':
      return 'linear-gradient(90deg, #ffffff 0 24%, #16a34a 24% 76%, #ffffff 76% 100%)';
    case 'GREEN':
      return '#16a34a';
    case 'GREEN_BLACK':
      return 'linear-gradient(90deg, #111827 0 24%, #16a34a 24% 76%, #111827 76% 100%)';
    case 'WHITE':
    default:
      return '#ffffff';
  }
}

function BeltVisual({
  belt,
  stripes,
  compact = false,
}: {
  belt?: string | null;
  stripes?: number | null;
  compact?: boolean;
}) {
  const safeStripes = Math.min(Math.max(stripes ?? 0, 0), 4);
  const beltLabel = `${formatBelt(belt || 'WHITE')} Belt`;
  const stripeLabel = `${safeStripes} stripe${safeStripes === 1 ? '' : 's'}`;

  return (
    <div
      className={compact ? 'w-full max-w-[230px]' : 'w-full max-w-md'}
      aria-label={`${beltLabel}, ${stripeLabel}`}
      role="img"
    >
      <div
        className={`relative overflow-hidden rounded-lg border border-slate-300 shadow-sm ${
          compact ? 'h-9' : 'h-14'
        }`}
        style={{ background: getBeltBackground(belt) }}
      >
        <div className="absolute inset-y-0 right-[10%] w-[27%] bg-slate-950">
          <div className="flex h-full items-center justify-center gap-1.5 px-2">
            {Array.from({ length: safeStripes }).map((_, index) => (
              <span
                key={index}
                className={`block rounded-full bg-white ${
                  compact ? 'h-5 w-1' : 'h-8 w-1.5'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BjjMetric({
  label,
  value,
  supportingText,
  emphasized = false,
}: {
  label: string;
  value: string | number;
  supportingText?: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        emphasized
          ? 'border-brand-200 bg-brand-50/60'
          : 'border-slate-100 bg-slate-50'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-bold text-slate-900">
        {value}
      </p>
      {supportingText && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {supportingText}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'ACTIVE' | 'EXPIRED' }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
        status === 'ACTIVE'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: Payment['status'] }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        status === 'PAID'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'PENDING'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {status}
    </span>
  );
}

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const memberId = params.id;

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bjjProgress, setBjjProgress] = useState<BjjProgress | null>(null);
  const [bjjProgressError, setBjjProgressError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const { user } = useAuth();
  const { programmeId, programme } = useProgramme();

  const canManageMembers =
    user?.roles.includes('ADMIN') ||
    user?.roles.includes('SUPER_ADMIN');

  const defaultStart =
    programmeId === 'BRAWLERS_BOXING' ? '2026-07-04' : '';

  const defaultEnd =
    programmeId === 'BRAWLERS_BOXING' ? '2026-09-26' : '';

  const defaultAmount =
    programmeId === 'BRAWLERS_BOXING' ? 100 : undefined;

  async function loadData() {
    if (!memberId) return;

    setLoading(true);
    setBjjProgressError(false);

    try {
      const progressRequest =
        programmeId === 'THE_GRAPPLE_HUB'
          ? apiFetch<BjjProgress>(
              withProgramme(`/members/${memberId}/bjj-progress`, programmeId),
            ).catch((err) => {
              console.error('Failed to fetch BJJ progress:', err);
              setBjjProgressError(true);
              return null;
            })
          : Promise.resolve(null);

      const [memberData, paymentData, progressData] = await Promise.all([
        apiFetch<MemberDetail>(
          withProgramme(`/members/${memberId}`, programmeId),
        ),
        apiFetch<Payment[]>(
          withProgramme(`/payments/member/${memberId}`, programmeId),
        ),
        progressRequest,
      ]);

      setMember(memberData);
      setPayments(paymentData);
      setBjjProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch member/payment data:', err);
      setMember(null);
      setPayments([]);
      setBjjProgress(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // loadData intentionally reloads whenever the member or programme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, programmeId]);

  async function handleDelete() {
    if (!memberId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this member?',
    );

    if (!confirmed) return;

    try {
      await apiFetch(
        withProgramme(`/members/${memberId}`, programmeId),
        {
          method: 'DELETE',
        },
      );

      router.replace('/members');
    } catch (err) {
      console.error('Failed to delete member:', err);
      alert('Failed to delete member');
    }
  }

  async function handleAddPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!member) return;

    setPaymentSaving(true);

    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    const payload = {
      memberId: member._id,
      guardianEmail: member.email || '',
      amount: Number(form.get('amount') || 0),
      currency: 'GBP',
      paymentMethod: form.get('paymentMethod') || 'CASH',
      status: 'PAID',
      periodStart: String(form.get('periodStart') || defaultStart),
      periodEnd: String(form.get('periodEnd') || defaultEnd),
      notes: String(form.get('notes') || '').trim(),
    };

    try {
      const newPayment = await apiFetch<Payment>(
        withProgramme('/payments', programmeId),
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      setPayments((currentPayments) => [newPayment, ...currentPayments]);
      formElement.reset();

      const startInput =
        formElement.elements.namedItem(
          'periodStart',
        ) as HTMLInputElement | null;

      const endInput =
        formElement.elements.namedItem(
          'periodEnd',
        ) as HTMLInputElement | null;

      if (startInput) startInput.value = defaultStart;
      if (endInput) endInput.value = defaultEnd;
    } catch (err) {
      console.error('Failed to add payment:', err);
      alert('Failed to add payment');
    } finally {
      setPaymentSaving(false);
    }
  }

  async function handleDeletePayment(paymentId: string) {
    const confirmed = window.confirm('Delete this payment record?');

    if (!confirmed) return;

    try {
      await apiFetch(
        withProgramme(`/payments/${paymentId}`, programmeId),
        {
          method: 'DELETE',
        },
      );

      await loadData();
    } catch (err) {
      console.error('Failed to delete payment:', err);
      alert('Failed to delete payment');
    }
  }

  const activePayment = useMemo(() => {
    const now = new Date();

    return payments.find((payment) => {
      const start = new Date(payment.periodStart);
      const end = new Date(payment.periodEnd);

      return payment.status === 'PAID' && start <= now && end >= now;
    });
  }, [payments]);

  if (loading) {
    return (
      <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
        <Shell>
          <div className="flex min-h-[50vh] items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        </Shell>
      </Protected>
    );
  }

  if (!member) {
    return (
      <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
        <Shell>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-soft">
            Member not found in {programme.name}.
          </div>
        </Shell>
      </Protected>
    );
  }

  const childFullName = getFullName(
    member.childFirstName,
    member.childMiddleName,
    member.childLastName,
  );

  const guardianFullName = getFullName(
    member.guardianFirstName,
    member.guardianMiddleName,
    member.guardianLastName,
  );

  const disciplines = member.disciplines || [];
  const session = member.session || 'UNKNOWN';
  const displayedStatus =
    programmeId === 'BRAWLERS_BOXING'
      ? activePayment
        ? 'ACTIVE'
        : 'EXPIRED'
      : member.membershipStatus === 'ACTIVE'
        ? 'ACTIVE'
        : 'EXPIRED';

  const isGrappleHub = programmeId === 'THE_GRAPPLE_HUB';
  const currentBelt =
    bjjProgress?.currentBelt || member.bjjBelt || 'WHITE';
  const currentStripes =
    bjjProgress?.stripes ?? member.bjjStripes ?? 0;

  const hasMedicalAlert =
    Boolean(member.allergies?.trim()) ||
    Boolean(member.medicalConditions?.trim()) ||
    Boolean(member.medications?.trim()) ||
    Boolean(member.safeguardingNotes?.trim());

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5 pb-24 sm:pb-0">
          {/* PROFILE SUMMARY */}
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
            <div className="p-4 sm:p-5 lg:p-6">
              <Link
                href="/members"
                className="mb-4 inline-flex text-xs font-semibold text-brand-600 transition hover:text-brand-700"
              >
                ← Back to members
              </Link>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl"
                    aria-label={`${childFullName || 'Member'} avatar`}
                  >
                    {getInitials(childFullName || 'Member')}
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {childFullName || 'Unnamed member'}
                      </h1>
                      <StatusBadge status={displayedStatus} />
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {programme.name}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {disciplines.map((discipline) => (
                        <span
                          key={discipline}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          {discipline}
                        </span>
                      ))}

                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        {session}
                      </span>

                      {isGrappleHub && (
                        <span
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                          aria-label={`Current BJJ rank: ${formatBelt(
                            currentBelt,
                          )} Belt, ${currentStripes} stripe${
                            currentStripes === 1 ? '' : 's'
                          }`}
                        >
                          {formatBelt(currentBelt)} Belt · {currentStripes}{' '}
                          Stripe{currentStripes === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isGrappleHub && (
                  <div className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:w-[330px]">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Current BJJ rank
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                          {formatBelt(currentBelt)} Belt
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                          {currentStripes} stripe{currentStripes === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <BeltVisual
                        belt={currentBelt}
                        stripes={currentStripes}
                        compact
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* GRAPPLE HUB: COACHING INFORMATION FIRST */}
          {isGrappleHub && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                    Brazilian Jiu-Jitsu
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Development & grading
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Current rank, training history and digitally recorded
                    attendance for coaching and grading reviews.
                  </p>
                </div>

                {canManageMembers && (
                  <Link
                    href={`/members/${memberId}/edit#bjj-development`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  >
                    Manage grading
                  </Link>
                )}
              </div>

              {bjjProgressError ? (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  BJJ progression information could not be loaded. The rest of
                  the member profile is still available.
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                        Current grade
                      </p>

                      <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            {formatBelt(currentBelt)} Belt
                          </p>
                          <p className="mt-1 text-sm text-white/65">
                            {currentStripes} stripe
                            {currentStripes === 1 ? '' : 's'}
                          </p>
                        </div>

                        <div className="w-full sm:max-w-[300px]">
                          <BeltVisual
                            belt={currentBelt}
                            stripes={currentStripes}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                            Training since
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {formatLongDate(
                              bjjProgress?.trainingStartDate ||
                                member.trainingStartDate ||
                                null,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                            Time training
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {bjjProgress
                              ? formatTrainingDuration(bjjProgress.monthsTraining)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <BjjMetric
                        label="Classes attended"
                        value={bjjProgress?.recordedClasses ?? 0}
                        supportingText={
                          bjjProgress
                            ? `${bjjProgress.totalRecordedRegisters} digital register${
                                bjjProgress.totalRecordedRegisters === 1
                                  ? ''
                                  : 's'
                              }`
                            : 'Digital attendance only'
                        }
                        emphasized
                      />

                      <BjjMetric
                        label="Attendance"
                        value={
                          bjjProgress ? `${bjjProgress.attendanceRate}%` : '-'
                        }
                        supportingText={
                          bjjProgress
                            ? `${bjjProgress.recordedAbsences} recorded absence${
                                bjjProgress.recordedAbsences === 1 ? '' : 's'
                              }`
                            : undefined
                        }
                      />

                      <BjjMetric
                        label="Last grading"
                        value={formatLongDate(
                          bjjProgress?.lastGradingDate ||
                            member.lastGradingDate ||
                            null,
                        )}
                        supportingText="Most recent recorded promotion"
                      />

                      <BjjMetric
                        label="Latest class"
                        value={formatLongDate(
                          bjjProgress?.latestRecordedClass || null,
                        )}
                        supportingText={
                          bjjProgress?.firstRecordedClass
                            ? `Records since ${formatLongDate(
                                bjjProgress.firstRecordedClass,
                              )}`
                            : 'No digital classes recorded yet'
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Grading notes
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {bjjProgress?.gradingNotes ||
                            member.gradingNotes ||
                            'No grading notes recorded yet.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* SAFETY / COACH-CRITICAL INFORMATION */}
          <div className="grid gap-4 lg:grid-cols-3">
            <section
              className={`rounded-2xl border bg-white p-4 shadow-soft sm:p-5 lg:col-span-2 ${
                hasMedicalAlert
                  ? 'border-amber-200'
                  : 'border-slate-100'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Medical & safeguarding
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Check before training when relevant.
                  </p>
                </div>

                {hasMedicalAlert && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    Information recorded
                  </span>
                )}
              </div>

              <dl className="text-sm">
                <DetailRow label="Allergies" value={member.allergies} />
                <DetailRow
                  label="Medical conditions"
                  value={member.medicalConditions}
                />
                <DetailRow label="Medications" value={member.medications} />
                <DetailRow
                  label="Safeguarding notes"
                  value={member.safeguardingNotes}
                />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Emergency contact
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Primary contact in an emergency.
              </p>

              <dl className="mt-3 text-sm">
                <DetailRow label="Name" value={member.emergencyContactName} />
                <DetailRow label="Phone" value={member.emergencyContactPhone} />
              </dl>
            </section>
          </div>

          {/* MEMBER / GUARDIAN DETAILS */}
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Participant details
              </h2>

              <dl className="text-sm">
                <DetailRow label="Full name" value={childFullName} />
                <DetailRow label="Gender" value={member.childsGender} />
                <DetailRow
                  label="Date of birth"
                  value={formatDate(member.childDateOfBirth)}
                />
                <DetailRow label="Session" value={session} />
                <DetailRow
                  label="Disciplines"
                  value={disciplines.length > 0 ? disciplines.join(', ') : '-'}
                />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Parent / guardian
              </h2>

              <dl className="text-sm">
                <DetailRow label="Name" value={guardianFullName} />
                <DetailRow label="Relationship" value={member.relationship} />
                <DetailRow label="Email" value={member.email} />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Consents
              </h2>

              <dl className="text-sm">
                <DetailRow
                  label="Photography"
                  value={formatBoolean(member.consentPhotography)}
                />
                <DetailRow
                  label="Data"
                  value={formatBoolean(member.consentData)}
                />
                <DetailRow
                  label="Safeguarding"
                  value={formatBoolean(member.consentSafeguarding)}
                />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Membership & payment status
              </h2>

              <dl className="text-sm">
                <DetailRow
                  label="Payment status"
                  value={activePayment ? 'Paid / Active' : 'No active payment'}
                />
                <DetailRow
                  label="Valid from"
                  value={
                    activePayment ? formatDate(activePayment.periodStart) : '-'
                  }
                />
                <DetailRow
                  label="Valid until"
                  value={
                    activePayment ? formatDate(activePayment.periodEnd) : '-'
                  }
                />
                <DetailRow
                  label="Amount"
                  value={
                    activePayment
                      ? `${activePayment.currency} ${activePayment.amount}`
                      : '-'
                  }
                />
              </dl>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Payment Form */}
            {canManageMembers && (
              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                  Record payment
                </h2>

                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Amount (£)
                    </label>

                    <input
                      name="amount"
                      type="number"
                      defaultValue={defaultAmount}
                      min={0}
                      required
                      step="0.01"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Payment method
                    </label>

                    <select
                      name="paymentMethod"
                      defaultValue="CASH"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="BANK_TRANSFER">
                        Bank Transfer
                      </option>
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Membership starts
                      </label>

                      <input
                        name="periodStart"
                        type="date"
                        defaultValue={defaultStart || undefined}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Membership ends
                      </label>

                      <input
                        name="periodEnd"
                        type="date"
                        defaultValue={defaultEnd || undefined}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Notes
                    </label>

                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Optional notes..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={paymentSaving}
                    className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paymentSaving ? 'Saving payment...' : 'Record payment'}
                  </button>
                </form>
              </section>
            )}

            {/* Payment History */}

            <section
              className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 ${
                canManageMembers ? 'xl:col-span-2' : 'xl:col-span-3'
              }`}
            >              
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Payment history
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {payments.length} record{payments.length !== 1 && 's'}
                </span>
              </div>

              {payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                  No payments recorded yet.
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}

                  <div className="space-y-3 lg:hidden">
                    {payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              £{payment.amount}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {payment.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>

                          <PaymentStatusBadge status={payment.status} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-slate-400">Paid on</p>
                            <p className="mt-1 font-medium">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Valid until</p>
                            <p className="mt-1 font-medium">
                              {formatDate(payment.periodEnd)}
                            </p>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                            {payment.notes}
                          </div>
                        )}

                        {canManageMembers && (
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(payment._id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Method</th>
                          <th className="px-4 py-3 text-left">Paid</th>
                          <th className="px-4 py-3 text-left">From</th>
                          <th className="px-4 py-3 text-left">Until</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Notes</th>
                          <th className="px-4 py-3 text-right"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {payments.map((payment) => (
                          <tr
                            key={payment._id}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium">
                              £{payment.amount}
                            </td>

                            <td className="px-4 py-3">
                              {payment.paymentMethod.replace('_', ' ')}
                            </td>

                            <td className="px-4 py-3">
                              {formatDate(payment.createdAt)}
                            </td>

                            <td className="px-4 py-3">
                              {formatDate(payment.periodStart)}
                            </td>

                            <td className="px-4 py-3">
                              {formatDate(payment.periodEnd)}
                            </td>

                            <td className="px-4 py-3">
                              <PaymentStatusBadge
                                status={payment.status}
                              />
                            </td>

                            <td className="max-w-xs px-4 py-3 text-slate-600">
                              {payment.notes || '-'}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {canManageMembers && (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePayment(payment._id)}
                                  className="text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </div>

          {canManageMembers && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 p-3 shadow-soft backdrop-blur sm:static sm:border-t-0 sm:bg-transparent sm:p-0 sm:shadow-none">
              <div className="flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 sm:flex-none sm:py-2"
                >
                  Delete member
                </button>

                <Link
                  href={`/members/${memberId}/edit`}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-700 sm:flex-none sm:py-2"
                >
                  Edit member
                </Link>
              </div>
            </div>
          )}
        </div>
      </Shell>
    </Protected>
  );
}