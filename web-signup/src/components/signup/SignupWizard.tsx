// web-signup/src/components/signup/SignupWizard.tsx
'use client';

import Image from 'next/image';
import { FormEvent, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { apiPost } from '../../lib/api';
import { isEmail, isRequired } from '../../lib/signup-validation';
import {
  getProgramme,
  ProgrammeId,
  SignupAccountType,
} from '../../config/programmes';
import { RecaptchaBox } from './shared/RecaptchaBox';

type AccountType = SignupAccountType;

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

  trainingStartDate: string;

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

  trainingStartDate: '',

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

type SignupWizardProps = {
  programmeId?: ProgrammeId;
};

export default function SignupWizard({
  programmeId = 'BRAWLERS_BOXING',
}: SignupWizardProps) {
  const programme = getProgramme(programmeId);

  const [form, setForm] = useState<SignupForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] =
    useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  function update<K extends keyof SignupForm>(
    key: K,
    value: SignupForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validate() {
    if (!isEmail(form.email)) {
      return 'Please enter a valid email address.';
    }

    if (!form.agreedToTerms) {
      return 'You must agree to the terms and conditions before submitting.';
    }

    if (
      !form.consentSafeguarding ||
      !form.consentData ||
      !form.consentPhotography
    ) {
      return 'You must provide all required consents before submitting.';
    }

    if (form.accountType === 'GUARDIAN') {
      if (!isRequired(form.guardianFirstName)) {
        return 'Guardian first name is required.';
      }
      if (!isRequired(form.guardianLastName)) {
        return 'Guardian last name is required.';
      }
      if (!isRequired(form.childFirstName)) {
        return 'Child first name is required.';
      }
      if (!isRequired(form.childLastName)) {
        return 'Child last name is required.';
      }
      if (!isRequired(form.childDateOfBirth)) {
        return 'Child date of birth is required.';
      }
      if (
        programme.id ===
          'THE_GRAPPLE_HUB' &&
        !isRequired(
          form.trainingStartDate,
        )
      ) {
        return 'Please enter the date the participant started Brazilian Jiu-Jitsu training.';
      }
    }

    if (form.accountType === 'ADULT') {
      if (!isRequired(form.adultFirstName)) {
        return 'First name is required.';
      }
      if (!isRequired(form.adultLastName)) {
        return 'Last name is required.';
      }
      if (!isRequired(form.adultDateOfBirth)) {
        return 'Date of birth is required.';
      }
    }

    if (!isRequired(form.emergencyContactName)) {
      return 'Emergency contact name is required.';
    }

    if (!isRequired(form.emergencyContactPhone)) {
      return 'Emergency contact phone is required.';
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

    const dob = isGuardian
      ? form.childDateOfBirth
      : form.adultDateOfBirth;

    const session = programme.getSession(
      dob,
      form.accountType,
    );

    const payload = {
      accountType: form.accountType,

      guardianFirstName: isGuardian
        ? form.guardianFirstName
        : form.adultFirstName,
      guardianLastName: isGuardian
        ? form.guardianLastName
        : form.adultLastName,
      relationship: isGuardian ? form.relationship : 'Self',
      email: form.email,
      phone: form.phone,

      childFirstName: isGuardian
        ? form.childFirstName
        : form.adultFirstName,
      childMiddleName: isGuardian ? form.childMiddleName : '',
      childLastName: isGuardian
        ? form.childLastName
        : form.adultLastName,
      childsGender: isGuardian
        ? form.childsGender
        : form.adultGender,
      childDateOfBirth: dob,

      trainingStartDate:
        programme.id ===
        'THE_GRAPPLE_HUB'
          ? form.trainingStartDate
          : undefined,

      session,
      disciplines: [programme.discipline],

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

      importSource: programme.importSource,
      recaptchaToken,
    };

    try {
      await apiPost(programme.apiPath, payload);

      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(
        'Signup failed. Please check your details and try again.',
      );
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Registration Submitted Successfully
          </h1>

          <p className="mt-4 leading-relaxed text-slate-600">
            {programme.success.thankYou}
          </p>

          <p className="mt-3 leading-relaxed text-slate-600">
            A confirmation email has been sent to the email address you
            provided. If you do not receive it within a few minutes, please
            check your <strong>Spam</strong> or <strong>Junk</strong> folder.
          </p>

          {programme.success.attendanceMessage && (
            <p className="mt-3 leading-relaxed text-slate-600">
              {programme.success.attendanceMessage}
            </p>
          )}

          <p className="mt-3 leading-relaxed text-slate-600">
            If you have any questions, please contact us on
            <a
              href="tel:07715316840"
              className="ml-1 font-semibold text-green-700 hover:underline"
            >
              07715&nbsp;316840
            </a>
            .
          </p>

          <p className="mt-5 font-medium text-slate-900">
            {programme.success.closingMessage}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl space-y-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:rounded-3xl sm:p-6 md:space-y-8 md:p-8"
      >
        <header className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/butterfly-logo-black.jpeg"
              alt="The Butterfly Movement"
              width={220}
              height={150}
              className="h-auto w-40 object-contain sm:w-52 md:w-64"
              priority
            />

            <div className="h-px w-full max-w-sm bg-slate-200" />

            <Image
              src={programme.logoSrc}
              alt={programme.logoAlt}
              width={180}
              height={180}
              className="h-auto w-28 object-contain sm:w-36 md:w-40"
              priority
            />
          </div>

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-green-700 sm:text-xs sm:tracking-[0.25em]">
            The Butterfly Movement presents
          </p>

          <h1 className="mt-2 text-[28px] font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            <span className="block">{programme.signupTitleLine1}</span>
            <span className="block">{programme.signupTitleLine2}</span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {programme.signupDescription}
          </p>
        </header>

        {form.accountType === 'GUARDIAN' ? (
          <>
            <Section title="Parent / Guardian details">
              <Input
                label="Guardian first name"
                value={form.guardianFirstName}
                onChange={(v) => update('guardianFirstName', v)}
                required
              />
              <Input
                label="Guardian last name"
                value={form.guardianLastName}
                onChange={(v) => update('guardianLastName', v)}
                required
              />
              <Input
                label="Relationship"
                value={form.relationship}
                onChange={(v) => update('relationship', v)}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update('phone', v)}
              />
            </Section>

            <Section title="Child details">
              <Input
                label="Child first name"
                value={form.childFirstName}
                onChange={(v) => update('childFirstName', v)}
                required
              />
              <Input
                label="Child middle name"
                value={form.childMiddleName}
                onChange={(v) => update('childMiddleName', v)}
              />
              <Input
                label="Child last name"
                value={form.childLastName}
                onChange={(v) => update('childLastName', v)}
                required
              />
              <Input
                label="Date of birth"
                type="date"
                value={form.childDateOfBirth}
                onChange={(v) => update('childDateOfBirth', v)}
                required
              />
              <Select
                label="Gender"
                value={form.childsGender}
                onChange={(v) => update('childsGender', v)}
              />

              {programme.id ===
                'THE_GRAPPLE_HUB' && (
                <Input
                  label="BJJ training start date"
                  type="date"
                  value={
                    form.trainingStartDate
                  }
                  onChange={(value) =>
                    update(
                      'trainingStartDate',
                      value,
                    )
                  }
                  helperText="Enter the date your child first started Brazilian Jiu-Jitsu training. If you do not know the exact date, please enter your best approximate date."                  required
                />
              )}
            </Section>
          </>
        ) : (
          <Section title="Your details">
            <Input
              label="First name"
              value={form.adultFirstName}
              onChange={(v) => update('adultFirstName', v)}
              required
            />
            <Input
              label="Last name"
              value={form.adultLastName}
              onChange={(v) => update('adultLastName', v)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update('email', v)}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(v) => update('phone', v)}
            />
            <Input
              label="Date of birth"
              type="date"
              value={form.adultDateOfBirth}
              onChange={(v) => update('adultDateOfBirth', v)}
              required
            />
            <Select
              label="Gender"
              value={form.adultGender}
              onChange={(v) => update('adultGender', v)}
            />
          </Section>
        )}

        <Section title="Emergency contact">
          <Input
            label="Emergency contact name"
            value={form.emergencyContactName}
            onChange={(v) => update('emergencyContactName', v)}
            required
          />
          <Input
            label="Emergency contact phone"
            type="tel"
            value={form.emergencyContactPhone}
            onChange={(v) => update('emergencyContactPhone', v)}
            required
          />
        </Section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Medical information
          </h2>

          <div className="mt-4 space-y-3">
            <Textarea
              label="Allergies"
              value={form.allergies}
              onChange={(v) => update('allergies', v)}
            />
            <Textarea
              label="Medical conditions"
              value={form.medicalConditions}
              onChange={(v) => update('medicalConditions', v)}
            />
            <Textarea
              label="Medications"
              value={form.medications}
              onChange={(v) => update('medications', v)}
            />
            <Textarea
              label="Safeguarding notes"
              value={form.safeguardingNotes}
              onChange={(v) => update('safeguardingNotes', v)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Terms and conditions
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-800">
            {programme.terms.map((term) => (
              <p key={term}>{term}</p>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <Checkbox
              label="I have read and agree to the Terms and Conditions."
              checked={form.agreedToTerms}
              onChange={(v) => update('agreedToTerms', v)}
              required
            />

            <Checkbox
              label="I consent to The Butterfly Movement carrying out any necessary safeguarding checks and procedures required to ensure the safety and wellbeing of participants."
              checked={form.consentSafeguarding}
              onChange={(v) => update('consentSafeguarding', v)}
              required
            />

            <Checkbox
              label="I understand that my personal data will be processed and stored securely for membership, safeguarding, programme administration, and participant communications purposes."
              checked={form.consentData}
              onChange={(v) => update('consentData', v)}
              required
            />

            <Checkbox
              label="I understand that photographs and videos may be taken during sessions and events. I consent to The Butterfly Movement using photographs and videos of my child for promotional and community engagement purposes on its official social media channels, including Instagram, TikTok, WhatsApp Status, and similar platforms."
              checked={form.consentPhotography}
              onChange={(v) => update('consentPhotography', v)}
              required
            />
          </div>
        </section>

        <RecaptchaBox
          ref={recaptchaRef}
          value={recaptchaToken}
          onChange={setRecaptchaToken}
        />

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
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
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
        {title}
      </h2>

      <div className="mt-4 grid gap-4 sm:mt-6 md:grid-cols-2">
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
  helperText,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  type?: string;
  required?: boolean;
  helperText?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-700 sm:py-3.5"
        required={required}
      />

      {helperText && (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {helperText}
        </span>
      )}
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
      <span className="text-sm font-semibold text-slate-900">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-green-700"
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
      <span className="text-sm font-semibold text-slate-900">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-green-700"
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
  onChange: (value: boolean) => void;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
      />

      <span className="text-sm font-medium leading-6 text-slate-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
    </label>
  );
}