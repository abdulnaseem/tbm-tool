// web-admin/src/app/members/[id]/page.tsx
'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Protected } from '../../../components/Protected';
import { Shell } from '../../../components/layout/Shell';
import { apiFetch } from '../../../lib/apiClient';

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
  createdAt?: string;
  updatedAt?: string;
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

function getFullName(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium text-slate-900 sm:text-right">
        {value || '-'}
      </dd>
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
  const [loading, setLoading] = useState(true);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const defaultStart = '2026-07-04';
  const defaultEnd = '2026-09-26';

  async function loadData() {
    if (!memberId) return;

    try {
      const [memberData, paymentData] = await Promise.all([
        apiFetch<MemberDetail>(`/members/${memberId}`),
        apiFetch<Payment[]>(`/payments/member/${memberId}`),
      ]);

      setMember(memberData);
      setPayments(paymentData);
    } catch (err) {
      console.error('Failed to fetch member/payment data:', err);
      setMember(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [memberId]);

  async function handleDelete() {
    if (!memberId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this member?',
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/members/${memberId}`, {
        method: 'DELETE',
      });

      router.push('/members');
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
      amount: Number(form.get('amount') || 100),
      currency: 'GBP',
      paymentMethod: form.get('paymentMethod') || 'CASH',
      status: 'PAID',
      periodStart: String(form.get('periodStart') || defaultStart),
      periodEnd: String(form.get('periodEnd') || defaultEnd),
      notes: String(form.get('notes') || '').trim(),
      recordedBy: 'ADMIN',
    };

    try {
      const newPayment = await apiFetch<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setPayments((currentPayments) => [newPayment, ...currentPayments]);
      formElement.reset();
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
      await apiFetch(`/payments/${paymentId}`, {
        method: 'DELETE',
      });

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
            Member not found.
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
  const displayedStatus = activePayment ? 'ACTIVE' : 'EXPIRED';

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-5 pb-24 sm:pb-0">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/members"
                className="mb-3 inline-flex text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                ← Back to members
              </Link>

              <h1 className="break-words text-xl font-semibold text-slate-900 sm:text-2xl">
                {childFullName || 'Unnamed member'}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
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
                    No discipline
                  </span>
                )}

                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  {session}
                </span>
              </div>
            </div>

            <StatusBadge status={displayedStatus} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Child details
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
                Current payment status
              </h2>

              <dl className="text-sm">
                <DetailRow
                  label="Status"
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

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Guardian
              </h2>

              <dl className="text-sm">
                <DetailRow label="Name" value={guardianFullName} />
                <DetailRow label="Relationship" value={member.relationship} />
                <DetailRow label="Email" value={member.email} />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Emergency contact
              </h2>

              <dl className="text-sm">
                <DetailRow label="Name" value={member.emergencyContactName} />
                <DetailRow label="Phone" value={member.emergencyContactPhone} />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Medical information
              </h2>

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
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Payment Form */}

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
                    defaultValue={100}
                    min={0}
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
                      defaultValue={defaultStart}
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
                      defaultValue={defaultEnd}
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

            {/* Payment History */}

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5 xl:col-span-2">
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

                        <button
                          onClick={() =>
                            handleDeletePayment(payment._id)
                          }
                          className="mt-4 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete payment
                        </button>
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
                              <button
                                onClick={() =>
                                  handleDeletePayment(payment._id)
                                }
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
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
        </div>
      </Shell>
    </Protected>
  );
}