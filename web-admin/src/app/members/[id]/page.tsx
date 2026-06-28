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
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function toDateInput(date: Date) {
  return date.toISOString().split('T')[0];
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value || '-'}</dd>
    </div>
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

  const defaultStart = toDateInput(new Date());
  const defaultEnd = toDateInput(addMonths(new Date(), 3));

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
    
    setPaymentSaving(true);

    const payload = {
      memberId: member._id,
      guardianEmail: member.email || '',
      amount: Number(form.get('amount') || 100),
      currency: 'GBP',
      paymentMethod: form.get('paymentMethod') || 'CASH',
      status: 'PAID',
      periodStart: '2026-07-04',
      periodEnd: '2026-09-26',
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

      return (
        payment.status === 'PAID' &&
        start <= now &&
        end >= now
      );
    });
  }, [payments]);

  if (loading) {
    return (
      <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
        <Shell>
          <div className="flex items-center justify-center py-16">
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

  const childFullName = [
    member.childFirstName,
    member.childMiddleName,
    member.childLastName,
  ]
    .filter(Boolean)
    .join(' ');

  const guardianFullName = [
    member.guardianFirstName,
    member.guardianMiddleName,
    member.guardianLastName,
  ]
    .filter(Boolean)
    .join(' ');

  const disciplines = member.disciplines || [];
  const session = member.session || 'UNKNOWN';
  const displayedStatus = activePayment ? 'ACTIVE' : 'EXPIRED';

  return (
    <Protected roles={['COACH', 'ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {childFullName || 'Unnamed member'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {disciplines.length > 0
                  ? disciplines.join(' · ')
                  : 'No discipline'}{' '}
                · {session}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
                displayedStatus === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {displayedStatus}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft lg:col-span-2">
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
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
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
                  value={activePayment ? formatDate(activePayment.periodStart) : '-'}
                />
                <DetailRow
                  label="Valid until"
                  value={activePayment ? formatDate(activePayment.periodEnd) : '-'}
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
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Guardian
              </h2>
              <dl className="text-sm">
                <DetailRow label="Name" value={guardianFullName} />
                <DetailRow label="Relationship" value={member.relationship} />
                <DetailRow label="Email" value={member.email} />
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Emergency contact
              </h2>
              <dl className="text-sm">
                <DetailRow label="Name" value={member.emergencyContactName} />
                <DetailRow label="Phone" value={member.emergencyContactPhone} />
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft lg:col-span-2">
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
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
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
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Add payment
              </h2>

              <form onSubmit={handleAddPayment} className="space-y-3">
                <input
                  name="amount"
                  type="number"
                  defaultValue={100}
                  min={0}
                  step="0.01"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Amount"
                />

                <select
                  name="paymentMethod"
                  defaultValue="CASH"
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </select>

                <input
                  name="periodStart"
                  type="date"
                  defaultValue={defaultStart}
                  required
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="periodEnd"
                  type="date"
                  defaultValue={defaultEnd}
                  required
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="notes"
                  placeholder="Notes, e.g. Paid cash to coach"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <button
                  disabled={paymentSaving}
                  className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {paymentSaving ? 'Saving payment...' : 'Add payment'}
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Payment history
              </h2>

              {payments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No payments recorded yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Amount</th>
                        <th className="px-3 py-2 text-left">Method</th>
                        <th className="px-3 py-2 text-left">Paid on</th>
                        <th className="px-3 py-2 text-left">From</th>
                        <th className="px-3 py-2 text-left">Until</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                        <th className="px-3 py-2 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} className="border-t border-slate-100">

                          <td className="px-3 py-2">
                            {payment.currency} {payment.amount}
                          </td>

                          <td className="px-3 py-2">{payment.paymentMethod}</td>

                          <td className="px-3 py-2">
                            {formatDate(payment.createdAt)}
                          </td>

                          <td className="px-3 py-2">
                            {formatDate(payment.periodStart)}
                          </td>

                          <td className="px-3 py-2">
                            {formatDate(payment.periodEnd)}
                          </td>

                          <td className="px-3 py-2">{payment.status}</td>

                          <td className="px-3 py-2">
                            {payment.notes || '-'}
                          </td>

                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleDeletePayment(payment._id)}
                              className="text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Delete member
            </button>

            <Link
              href={`/members/${memberId}/edit`}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Edit member
            </Link>
          </div>
        </div>
      </Shell>
    </Protected>
  );
}