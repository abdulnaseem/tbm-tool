// web-signup/src/components/signup/SignupWizard.tsx
'use client';

import Image from 'next/image';
import { FormEvent, useRef, useState } from 'react';
import { apiPost } from '../../lib/api';
import { getSessionFromDob, isEmail, isRequired } from '../../lib/signup-validation';
import { RecaptchaBox } from './shared/RecaptchaBox';
import ReCAPTCHA from 'react-google-recaptcha';

type AccountType = 'GUARDIAN' | 'ADULT';

type SignupForm = {
  accountType: AccountType;

  guardianFirstName: string;
  guardianLastName: string;
  relationship: string;
  email: string;
  phone: string;

  childFirstName: string;
  childMiddleName: string;
  childLastName: string;
  childsGender: string;
  childDateOfBirth: string;

  adultFirstName: string;
  adultLastName: string;
  adultDateOfBirth: string;
  adultGender: string;

  emergencyContactName: string;
  emergencyContactPhone: string;

  allergies: string;
  medicalConditions: string;
  medications: string;
  safeguardingNotes: string;

  consentSafeguarding: boolean;
  consentData: boolean;
  consentPhotography: boolean;
  agreedToTerms: boolean;
};

const initialForm: SignupForm = {
  accountType: 'GUARDIAN',

  guardianFirstName: '',
  guardianLastName: '',
  relationship: 'Parent/Guardian',
  email: '',
  phone: '',

  childFirstName: '',
  childMiddleName: '',
  childLastName: '',
  childsGender: '',
  childDateOfBirth: '',

  adultFirstName: '',
  adultLastName: '',
  adultDateOfBirth: '',
  adultGender: '',

  emergencyContactName: '',
  emergencyContactPhone: '',

  allergies: '',
  medicalConditions: '',
  medications: '',
  safeguardingNotes: '',

  consentSafeguarding: false,
  consentData: false,
  consentPhotography: false,
  agreedToTerms: false,
};

export default function SignupWizard() {
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  function update<K extends keyof SignupForm>(key: K, value: SignupForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validate() {
    if (!isEmail(form.email)) return 'Please enter a valid email address.';

    if (!form.agreedToTerms) {
      return 'You must agree to the terms and conditions before submitting.';
    }

    if (!form.consentSafeguarding || !form.consentData) {
      return 'Safeguarding and data consent are required.';
    }

    if (form.accountType === 'GUARDIAN') {
      if (!isRequired(form.guardianFirstName)) return 'Guardian first name is required.';
      if (!isRequired(form.guardianLastName)) return 'Guardian last name is required.';
      if (!isRequired(form.childFirstName)) return 'Child first name is required.';
      if (!isRequired(form.childLastName)) return 'Child last name is required.';
      if (!isRequired(form.childDateOfBirth)) return 'Child date of birth is required.';
    }

    if (form.accountType === 'ADULT') {
      if (!isRequired(form.adultFirstName)) return 'First name is required.';
      if (!isRequired(form.adultLastName)) return 'Last name is required.';
      if (!isRequired(form.adultDateOfBirth)) return 'Date of birth is required.';
    }

    if (!recaptchaToken) {
      return 'Please complete the reCAPTCHA security check.';
    }

    return '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const isGuardian = form.accountType === 'GUARDIAN';

    const dob = isGuardian ? form.childDateOfBirth : form.adultDateOfBirth;
    const session = getSessionFromDob(dob);

    const payload = {
      accountType: form.accountType,

      guardianFirstName: isGuardian ? form.guardianFirstName : form.adultFirstName,
      guardianLastName: isGuardian ? form.guardianLastName : form.adultLastName,
      relationship: isGuardian ? form.relationship : 'Self',
      email: form.email,
      phone: form.phone,

      childFirstName: isGuardian ? form.childFirstName : form.adultFirstName,
      childMiddleName: isGuardian ? form.childMiddleName : '',
      childLastName: isGuardian ? form.childLastName : form.adultLastName,
      childsGender: isGuardian ? form.childsGender : form.adultGender,
      childDateOfBirth: dob,

      session,
      disciplines: ['BOXING'],

      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,

      allergies: form.allergies,
      medicalConditions: form.medicalConditions,
      medications: form.medications,
      safeguardingNotes: form.safeguardingNotes,

      consentSafeguarding: form.consentSafeguarding,
      consentData: form.consentData,
      consentPhotography: form.consentPhotography,
      agreedToTerms: form.agreedToTerms,

      importSource: 'PUBLIC_SIGNUP',
      recaptchaToken,
    };

    try {
      await apiPost('/public/signup', payload);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-3xl bg-white p-8 shadow-xl border border-slate-100 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
  
          <h1 className="text-2xl font-bold text-slate-900">
            Registration submitted successfully
          </h1>
  
          <p className="mt-4 text-slate-600 leading-relaxed">
            Thank you for registering with <strong>Brawlers Boxing</strong>.
          </p>
  
          <p className="mt-3 text-slate-600 leading-relaxed">
            Your registration form has been received and a confirmation email has
            been sent to the email address provided.
          </p>
  
          <p className="mt-3 text-slate-600 leading-relaxed">
            If you do not receive the email within a few minutes, please check
            your <strong>spam</strong> or <strong>junk</strong> folder.
          </p>
  
          <p className="mt-3 text-slate-600 leading-relaxed">
            A member of <strong>The Butterfly Movement</strong> team will review
            your registration and contact you shortly regarding your place on the
            programme.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-slate-100 space-y-8"
      >
        <header className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/butterfly-logo-black.jpeg"
              alt="The Butterfly Movement"
              width={260}
              height={180}
              className="h-auto w-64 object-contain"
              priority
            />

            <div className="h-px w-full max-w-sm bg-slate-200" />

            <Image
              src="/brawlers-boxing.jpeg"
              alt="Brawlers Boxing"
              width={220}
              height={220}
              className="h-auto w-40 object-contain"
              priority
            />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-green-700">
            The Butterfly Movement presents
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Brawlers Boxing Sign Up
          </h1>

          <p className="mt-2 text-slate-600">
            Complete this form to register yourself or your child for the Brawlers
            Boxing programme.
          </p>
        </header>

        {/* <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Who are you registering?
          </h2>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => update('accountType', 'GUARDIAN')}
              className={`rounded-2xl border p-4 text-left ${
                form.accountType === 'GUARDIAN'
                  ? 'border-green-700 bg-green-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="font-semibold">My child</div>
              <div className="text-sm text-slate-500">
                Parent or guardian registration
              </div>
            </button>

            <button
              type="button"
              onClick={() => update('accountType', 'ADULT')}
              className={`rounded-2xl border p-4 text-left ${
                form.accountType === 'ADULT'
                  ? 'border-green-700 bg-green-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="font-semibold">Myself</div>
              <div className="text-sm text-slate-500">
                Adult self-registration
              </div>
            </button>
          </div>
        </section> */}

        {form.accountType === 'GUARDIAN' ? (
          <>
            <Section title="Parent / Guardian details">
              <Input label="Guardian first name" value={form.guardianFirstName} onChange={(v) => update('guardianFirstName', v)} required />
              <Input label="Guardian last name" value={form.guardianLastName} onChange={(v) => update('guardianLastName', v)} required />
              <Input label="Relationship" value={form.relationship} onChange={(v) => update('relationship', v)} />
              <Input label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
              <Input label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
            </Section>

            <Section title="Child details">
              <Input label="Child first name" value={form.childFirstName} onChange={(v) => update('childFirstName', v)} required />
              <Input label="Child middle name" value={form.childMiddleName} onChange={(v) => update('childMiddleName', v)} />
              <Input label="Child last name" value={form.childLastName} onChange={(v) => update('childLastName', v)} required />
              <Input label="Date of birth" type="date" value={form.childDateOfBirth} onChange={(v) => update('childDateOfBirth', v)} required />
              <Select label="Gender" value={form.childsGender} onChange={(v) => update('childsGender', v)} />
            </Section>
          </>
        ) : (
          <Section title="Your details">
            <Input label="First name" value={form.adultFirstName} onChange={(v) => update('adultFirstName', v)} required />
            <Input label="Last name" value={form.adultLastName} onChange={(v) => update('adultLastName', v)} required />
            <Input label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
            <Input label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
            <Input label="Date of birth" type="date" value={form.adultDateOfBirth} onChange={(v) => update('adultDateOfBirth', v)} required />
            <Select label="Gender" value={form.adultGender} onChange={(v) => update('adultGender', v)} />
          </Section>
        )}

        <Section title="Emergency contact">
          <Input label="Emergency contact name" value={form.emergencyContactName} onChange={(v) => update('emergencyContactName', v)} required />
          <Input label="Emergency contact phone" value={form.emergencyContactPhone} onChange={(v) => update('emergencyContactPhone', v)} required />
        </Section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">
            Medical information
          </h2>

          <div className="mt-4 space-y-3">
            <Textarea label="Allergies" value={form.allergies} onChange={(v) => update('allergies', v)} />
            <Textarea label="Medical conditions" value={form.medicalConditions} onChange={(v) => update('medicalConditions', v)} />
            <Textarea label="Medications" value={form.medications} onChange={(v) => update('medications', v)} />
            <Textarea label="Safeguarding notes" value={form.safeguardingNotes} onChange={(v) => update('safeguardingNotes', v)} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-2xl font-bold text-slate-900">
            Terms and conditions
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-800">
            <p>
              Brawlers Boxing - Summer Term 2026. Saturday 4th July 2026 to
              Saturday 26th September 2026.
            </p>
            <p>
              Summer term fee: £100 per child for the 3-month programme.
            </p>
            <p>
              Each child must complete an individual registration form to secure
              their place. Parents/guardians are responsible for ensuring regular
              attendance. Refunds are not offered for absences, except genuine
              health or medical reasons with appropriate evidence.
            </p>
            <p>
              Cubs: 12:45pm-1:45pm. Tigers: 1:45pm-2:45pm.
            </p>
            <p>
              Osmani Trust, <br/>58 Underwood Rd, <br/>London E1 5AW
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <Checkbox
              label="I agree to the terms and conditions."
              checked={form.agreedToTerms}
              onChange={(v) => update('agreedToTerms', v)}
              required
            />

            <Checkbox
              label="I consent to safeguarding checks and procedures."
              checked={form.consentSafeguarding}
              onChange={(v) => update('consentSafeguarding', v)}
              required
            />

            <Checkbox
              label="I consent to my data being stored securely for membership purposes."
              checked={form.consentData}
              onChange={(v) => update('consentData', v)}
              required
            />

            <Checkbox
              label="I consent to photography/video use."
              checked={form.consentPhotography}
              onChange={(v) => update('consentPhotography', v)}
            />
          </div>
        </section>

        <RecaptchaBox
          ref={recaptchaRef}
          value={recaptchaToken}
          onChange={setRecaptchaToken}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          disabled={submitting}
          className="w-full rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit registration'}
        </button>
      </form>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900">
        {title}
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          mt-1
          w-full
          rounded-xl
          border
          border-slate-300
          px-4
          py-3
          text-slate-900
          placeholder:text-slate-400
          outline-none
          focus:border-green-700
        "
        required={required}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-slate-900
                    outline-none
                    focus:border-green-700
                  "
      >
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1
                    min-h-24
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-slate-900
                    outline-none
                    focus:border-green-700
                  "
      />
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  required = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
      />

      <span className="text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>
    </label>
  );
}