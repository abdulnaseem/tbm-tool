// web-admin/src/app/members/[id]/edit/page.tsx
'use client';

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

      emergencyContactName: String(form.get('emergencyContactName') || '').trim(),
      emergencyContactPhone: String(form.get('emergencyContactPhone') || '').trim(),

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
          <div className="flex items-center justify-center py-16">
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

  return (
    <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="max-w-5xl">
          <h1 className="text-xl font-semibold text-slate-900">Edit member</h1>
          <p className="mb-6 text-sm text-slate-500">
            Update child, guardian, medical, consent and payment details.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft"
          >
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Child details
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="childFirstName"
                  required
                  defaultValue={member.childFirstName || ''}
                  placeholder="Child first name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="childMiddleName"
                  defaultValue={member.childMiddleName || ''}
                  placeholder="Child middle name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="childLastName"
                  required
                  defaultValue={member.childLastName || ''}
                  placeholder="Child last name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <select
                  name="childsGender"
                  defaultValue={member.childsGender || ''}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>

                <input
                  name="childDateOfBirth"
                  type="date"
                  required
                  defaultValue={toDateInput(member.childDateOfBirth)}
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <select
                  name="session"
                  defaultValue={member.session || 'UNKNOWN'}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="CUBS">Cubs</option>
                  <option value="TIGERS">Tigers</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>

                <select
                  name="membershipStatus"
                  defaultValue={member.membershipStatus || 'ACTIVE'}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Guardian details
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="guardianFirstName"
                  required
                  defaultValue={member.guardianFirstName || ''}
                  placeholder="Guardian first name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="guardianMiddleName"
                  defaultValue={member.guardianMiddleName || ''}
                  placeholder="Guardian middle name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="guardianLastName"
                  required
                  defaultValue={member.guardianLastName || ''}
                  placeholder="Guardian last name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <select
                  name="relationship"
                  defaultValue={member.relationship || 'Guardian'}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="Guardian">Guardian</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Parent">Parent</option>
                  <option value="Carer">Carer</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  name="email"
                  type="email"
                  defaultValue={member.email || ''}
                  placeholder="Guardian email"
                  className="rounded-xl border px-3 py-2 text-sm md:col-span-2"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Emergency contact
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="emergencyContactName"
                  defaultValue={member.emergencyContactName || ''}
                  placeholder="Emergency contact name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="emergencyContactPhone"
                  defaultValue={member.emergencyContactPhone || ''}
                  placeholder="Emergency contact phone"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Medical information
              </h2>

              <div className="space-y-4">
                <textarea
                  name="allergies"
                  defaultValue={member.allergies || ''}
                  placeholder="Allergies"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="medicalConditions"
                  defaultValue={member.medicalConditions || ''}
                  placeholder="Medical conditions"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="medications"
                  defaultValue={member.medications || ''}
                  placeholder="Medications"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="safeguardingNotes"
                  defaultValue={member.safeguardingNotes || ''}
                  placeholder="Safeguarding notes"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Consent
              </h2>

              <div className="space-y-3 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    name="consentSafeguarding"
                    type="checkbox"
                    defaultChecked={member.consentSafeguarding ?? true}
                  />
                  Safeguarding consent
                </label>

                <label className="flex items-center gap-2">
                  <input
                    name="consentData"
                    type="checkbox"
                    defaultChecked={member.consentData ?? true}
                  />
                  Data consent
                </label>

                <label className="flex items-center gap-2">
                  <input
                    name="consentPhotography"
                    type="checkbox"
                    defaultChecked={member.consentPhotography ?? false}
                  />
                  Photography consent
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Payment
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="totalPrice"
                  type="number"
                  defaultValue={member.totalPrice ?? 100}
                  min={0}
                  step="0.01"
                  placeholder="Total price"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="paymentIntentId"
                  defaultValue={member.paymentIntentId || 'MANUAL_ADMIN_UPDATE'}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Price is for the current 3-month period.
              </p>
            </section>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => router.push(`/members/${memberId}`)}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Update member'}
              </button>
            </div>
          </form>
        </div>
      </Shell>
    </Protected>
  );
}