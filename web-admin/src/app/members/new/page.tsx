// web-admin/src/app/members/new/page.tsx
'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Protected } from '../../../components/Protected';
import { Shell } from '../../../components/layout/Shell';
import { apiFetch, ApiError } from '../../../lib/apiClient';

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

export default function AddMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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

      allergies: String(form.get('allergies') || '').trim(),
      medicalConditions: String(form.get('medicalConditions') || '').trim(),
      medications: String(form.get('medications') || '').trim(),

      emergencyContactName: String(
        form.get('emergencyContactName') || '',
      ).trim(),
      emergencyContactPhone: String(
        form.get('emergencyContactPhone') || '',
      ).trim(),

      safeguardingNotes: String(form.get('safeguardingNotes') || '').trim(),

      consentSafeguarding: form.get('consentSafeguarding') === 'on',
      consentData: form.get('consentData') === 'on',
      consentPhotography: form.get('consentPhotography') === 'on',
    };

    try {
      await apiFetch('/members', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.replace('/members');
      router.refresh();
    } catch (error) {
      console.error('Failed to create member:', error);

      alert(
        error instanceof ApiError
          ? error.message
          : 'Failed to create member',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="mx-auto max-w-5xl space-y-5 pb-24 sm:pb-0">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:p-5">
            <Link
              href="/members"
              className="mb-3 inline-flex text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              ← Back to members
            </Link>

            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Add member
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a new child member, guardian, medical and consent details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <SectionCard
              title="Child details"
              description="Enter the child's personal details and programme session."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel required>Child first name</FieldLabel>
                  <input
                    name="childFirstName"
                    required
                    placeholder="Child first name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Child middle name</FieldLabel>
                  <input
                    name="childMiddleName"
                    placeholder="Child middle name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel required>Child last name</FieldLabel>
                  <input
                    name="childLastName"
                    required
                    placeholder="Child last name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <select name="childsGender" className={inputClassName}>
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
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Session</FieldLabel>
                  <select
                    name="session"
                    defaultValue="CUBS"
                    className={inputClassName}
                  >
                    <option value="CUBS">Cubs</option>
                    <option value="TIGERS">Tigers</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Guardian details"
              description="Add the parent or guardian linked to this child."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel required>Guardian first name</FieldLabel>
                  <input
                    name="guardianFirstName"
                    required
                    placeholder="Guardian first name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Guardian middle name</FieldLabel>
                  <input
                    name="guardianMiddleName"
                    placeholder="Guardian middle name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel required>Guardian last name</FieldLabel>
                  <input
                    name="guardianLastName"
                    required
                    placeholder="Guardian last name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Relationship</FieldLabel>
                  <select
                    name="relationship"
                    defaultValue="Guardian"
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
                    placeholder="Emergency contact name"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Emergency contact phone</FieldLabel>
                  <input
                    name="emergencyContactPhone"
                    type="tel"
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
                    placeholder="Known allergies"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Medical conditions</FieldLabel>
                  <textarea
                    name="medicalConditions"
                    placeholder="Medical conditions"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Medications</FieldLabel>
                  <textarea
                    name="medications"
                    placeholder="Current medications"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Safeguarding notes</FieldLabel>
                  <textarea
                    name="safeguardingNotes"
                    placeholder="Safeguarding notes"
                    className={textareaClassName}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Consent"
              description="Confirm safeguarding, data and photography permissions."
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
                  <input
                    name="consentSafeguarding"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Safeguarding
                </label>

                <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
                  <input
                    name="consentData"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Data
                </label>

                <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
                  <input
                    name="consentPhotography"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Photography
                </label>
              </div>
            </SectionCard>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 p-3 shadow-soft backdrop-blur sm:static sm:border-t-0 sm:bg-transparent sm:p-0 sm:shadow-none">
              <div className="flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/members')}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex-none sm:py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:py-2"
                >
                  {saving ? 'Saving...' : 'Save member'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Shell>
    </Protected>
  );
}