// web-admin/src/app/members/[id]/edit/page.tsx
'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Protected } from '../../../../components/Protected';
import { Shell } from '../../../../components/layout/Shell';
import { apiFetch } from '../../../../lib/apiClient';

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

  session?: string;
  disciplines?: string[];
  membershipStatus?: string;

  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  safeguardingNotes?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  consentSafeguarding?: boolean;
  consentData?: boolean;
  consentPhotography?: boolean;

  totalPrice?: number;
  paymentIntentId?: string;
};

function toDateInput(value?: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
}

function getFullName(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-slate-500">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const textareaClassName =
  'min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const memberId = params.id;

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!memberId) return;

    apiFetch<MemberDetail>(`/members/${memberId}`)
      .then(setMember)
      .catch((err) => {
        console.error('Failed to fetch member:', err);
        setMember(null);
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      accountType: 'GUARDIAN',

      guardianFirstName: String(form.get('guardianFirstName') || '').trim(),
      guardianMiddleName: String(form.get('guardianMiddleName') || '').trim(),
      guardianLastName: String(form.get('guardianLastName') || '').trim(),
      email: String(form.get('email') || '').trim().toLowerCase(),
      relationship: String(form.get('relationship') || 'Guardian').trim(),

      childFirstName: String(form.get('childFirstName') || '').trim(),
      childMiddleName: String(form.get('childMiddleName') || '').trim(),
      childLastName: String(form.get('childLastName') || '').trim(),
      childsGender: String(form.get('childsGender') || '').trim(),
      childDateOfBirth: form.get('childDateOfBirth'),

      session: form.get('session') || 'UNKNOWN',
      disciplines: ['BOXING'],
      membershipStatus: String(form.get('membershipStatus') || 'ACTIVE'),

      allergies: String(form.get('allergies') || '').trim(),
      medicalConditions: String(form.get('medicalConditions') || '').trim(),
      medications: String(form.get('medications') || '').trim(),
      safeguardingNotes: String(form.get('safeguardingNotes') || '').trim(),

      emergencyContactName: String(
        form.get('emergencyContactName') || '',
      ).trim(),
      emergencyContactPhone: String(
        form.get('emergencyContactPhone') || '',
      ).trim(),

      consentSafeguarding: form.get('consentSafeguarding') === 'on',
      consentData: form.get('consentData') === 'on',
      consentPhotography: form.get('consentPhotography') === 'on',

      totalPrice: Number(form.get('totalPrice') || 100),
      paymentIntentId:
        String(form.get('paymentIntentId') || '').trim() ||
        'MANUAL_ADMIN_UPDATE',
    };

    try {
      await apiFetch(`/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      router.push(`/members/${memberId}`);
    } catch (err) {
      console.error('Failed to update member:', err);
      alert('Failed to update member');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
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
      <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
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

  return (
    <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="mx-auto max-w-5xl space-y-5 pb-24 sm:pb-0">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
            <Link
              href={`/members/${memberId}`}
              className="mb-3 inline-flex text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              ← Back to member
            </Link>

            <h1 className="break-words text-xl font-semibold text-slate-900 sm:text-2xl">
              Edit member
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update child, guardian, medical, consent and payment details.
            </p>

            {childFullName && (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Editing
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {childFullName}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
              title="Child details"
              description="Update the child's personal information and programme session."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel required>Child first name</FieldLabel>
                  <input
                    name="childFirstName"
                    required
                    defaultValue={member.childFirstName || ''}
                    placeholder="Child first name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Child middle name</FieldLabel>
                  <input
                    name="childMiddleName"
                    defaultValue={member.childMiddleName || ''}
                    placeholder="Child middle name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel required>Child last name</FieldLabel>
                  <input
                    name="childLastName"
                    required
                    defaultValue={member.childLastName || ''}
                    placeholder="Child last name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <select
                    name="childsGender"
                    defaultValue={member.childsGender || ''}
                    className={inputClassName}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>Date of birth</FieldLabel>
                  <input
                    name="childDateOfBirth"
                    type="date"
                    required
                    defaultValue={toDateInput(member.childDateOfBirth)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Session</FieldLabel>
                  <select
                    name="session"
                    defaultValue={member.session || 'UNKNOWN'}
                    className={inputClassName}
                  >
                    <option value="CUBS">Cubs</option>
                    <option value="TIGERS">Tigers</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Membership status</FieldLabel>
                  <select
                    name="membershipStatus"
                    defaultValue={member.membershipStatus || 'ACTIVE'}
                    className={inputClassName}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="TRIAL">Trial</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Guardian details"
              description="Update the parent or guardian details linked to this member."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel required>Guardian first name</FieldLabel>
                  <input
                    name="guardianFirstName"
                    required
                    defaultValue={member.guardianFirstName || ''}
                    placeholder="Guardian first name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Guardian middle name</FieldLabel>
                  <input
                    name="guardianMiddleName"
                    defaultValue={member.guardianMiddleName || ''}
                    placeholder="Guardian middle name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel required>Guardian last name</FieldLabel>
                  <input
                    name="guardianLastName"
                    required
                    defaultValue={member.guardianLastName || ''}
                    placeholder="Guardian last name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Relationship</FieldLabel>
                  <select
                    name="relationship"
                    defaultValue={member.relationship || 'Guardian'}
                    className={inputClassName}
                  >
                    <option value="Guardian">Guardian</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Parent">Parent</option>
                    <option value="Carer">Carer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Guardian email</FieldLabel>
                  <input
                    name="email"
                    type="email"
                    defaultValue={member.email || ''}
                    placeholder="guardian@example.com"
                    className={inputClassName}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Emergency contact"
              description="Add a backup contact who can be reached in an emergency."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Emergency contact name</FieldLabel>
                  <input
                    name="emergencyContactName"
                    defaultValue={member.emergencyContactName || ''}
                    placeholder="Emergency contact name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Emergency contact phone</FieldLabel>
                  <input
                    name="emergencyContactPhone"
                    type="tel"
                    defaultValue={member.emergencyContactPhone || ''}
                    placeholder="Emergency contact phone"
                    className={inputClassName}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Medical information"
              description="Record any health, medical or safeguarding information staff need to know."
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Allergies</FieldLabel>
                  <textarea
                    name="allergies"
                    defaultValue={member.allergies || ''}
                    placeholder="Known allergies"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Medical conditions</FieldLabel>
                  <textarea
                    name="medicalConditions"
                    defaultValue={member.medicalConditions || ''}
                    placeholder="Medical conditions"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Medications</FieldLabel>
                  <textarea
                    name="medications"
                    defaultValue={member.medications || ''}
                    placeholder="Current medications"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Safeguarding notes</FieldLabel>
                  <textarea
                    name="safeguardingNotes"
                    defaultValue={member.safeguardingNotes || ''}
                    placeholder="Safeguarding notes"
                    className={textareaClassName}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Consent"
              description="Manage safeguarding, data and photography permissions."
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
                  <input
                    name="consentSafeguarding"
                    type="checkbox"
                    defaultChecked={member.consentSafeguarding ?? true}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Safeguarding
                </label>

                <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
                  <input
                    name="consentData"
                    type="checkbox"
                    defaultChecked={member.consentData ?? true}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Data
                </label>

                <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
                  <input
                    name="consentPhotography"
                    type="checkbox"
                    defaultChecked={member.consentPhotography ?? false}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Photography
                </label>
              </div>
            </SectionCard>

            <SectionCard
              title="Payment"
              description="Update the member's payment metadata for the current 3-month period."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Total price</FieldLabel>
                  <input
                    name="totalPrice"
                    type="number"
                    defaultValue={member.totalPrice ?? 100}
                    min={0}
                    step="0.01"
                    placeholder="Total price"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Payment intent ID</FieldLabel>
                  <input
                    name="paymentIntentId"
                    defaultValue={
                      member.paymentIntentId || 'MANUAL_ADMIN_UPDATE'
                    }
                    placeholder="Payment intent ID"
                    className={inputClassName}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Price is for the current 3-month period.
              </p>
            </SectionCard>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 p-3 shadow-soft backdrop-blur sm:static sm:border-t-0 sm:bg-transparent sm:p-0 sm:shadow-none">
              <div className="flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push(`/members/${memberId}`)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex-none sm:py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:py-2"
                >
                  {saving ? 'Saving...' : 'Update member'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Shell>
    </Protected>
  );
}