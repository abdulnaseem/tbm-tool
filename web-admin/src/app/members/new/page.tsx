// web-admin/src/app/members/new/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Protected } from '../../../components/Protected';
import { Shell } from '../../../components/layout/Shell';
import { apiFetch } from '../../../lib/apiClient';

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

      emergencyContactName: String(form.get('emergencyContactName') || '').trim(),
      emergencyContactPhone: String(form.get('emergencyContactPhone') || '').trim(),

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

      router.push('/members');
    } catch (err) {
      console.error('Failed to create member:', err);
      alert('Failed to create member');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected roles={['ADMIN', 'SUPER_ADMIN']}>
      <Shell>
        <div className="max-w-5xl">
          <h1 className="text-xl font-semibold text-slate-900">Add member</h1>
          <p className="mb-6 text-sm text-slate-500">
            Add a new child member, guardian, medical, consent and payment details.
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
                  placeholder="Child first name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="childMiddleName"
                  placeholder="Child middle name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="childLastName"
                  required
                  placeholder="Child last name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <select
                  name="childsGender"
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
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <select
                name="session"
                defaultValue="CUBS"
                className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="CUBS">Cubs</option>
                  <option value="TIGERS">Tigers</option>
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
                  placeholder="Guardian first name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="guardianMiddleName"
                  placeholder="Guardian middle name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="guardianLastName"
                  required
                  placeholder="Guardian last name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <select
                  name="relationship"
                  defaultValue="Guardian"
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
                  placeholder="Emergency contact name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />

                <input
                  name="emergencyContactPhone"
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
                  placeholder="Allergies"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="medicalConditions"
                  placeholder="Medical conditions"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="medications"
                  placeholder="Medications"
                  className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  name="safeguardingNotes"
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
                  <input name="consentSafeguarding" type="checkbox" defaultChecked />
                  Safeguarding consent
                </label>

                <label className="flex items-center gap-2">
                  <input name="consentData" type="checkbox" defaultChecked />
                  Data consent
                </label>

                <label className="flex items-center gap-2">
                  <input name="consentPhotography" type="checkbox" />
                  Photography consent
                </label>
              </div>
            </section>


            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => router.push('/members')}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save member'}
              </button>
            </div>
          </form>
        </div>
      </Shell>
    </Protected>
  );
}