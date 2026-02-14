'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/* -------------------------------------------------------------------------- */
/*                               Validation                                   */
/* -------------------------------------------------------------------------- */

const schema = z.object({
  guardianFirstName: z.string().min(1, 'Guardian first name is required'),
  guardianLastName: z.string().min(1, 'Guardian last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  relationship: z.enum(['Mother', 'Father', 'Carer', 'Legal Guardian'], {
    errorMap: () => ({ message: 'Select your relationship to the child' }),
  }),

  childFirstName: z.string().min(1, 'Child first name is required'),
  childLastName: z.string().min(1, 'Child last name is required'),
  childsGender: z.enum(['male', 'female'], {
    required_error: 'Please select male or female',
  }),
  childDateOfBirth: z
    .string()
    .refine((value) => {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      return age >= 5 && age <= 17;
    }, 'Child must be between 5 and 17 years old'),

  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),

  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),

  safeguardingNotes: z.string().optional(),

  consentSafeguarding: z.literal(true, {
    errorMap: () => ({ message: 'Safeguarding consent is required' }),
  }),
  consentData: z.literal(true, {
    errorMap: () => ({ message: 'Data protection consent is required' }),
  }),
});

type FormData = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function GuardianChildDetailsStep({
  onNext,
  onBack,
}: {
  onNext: (data: FormData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="space-y-12"
      aria-labelledby="guardian-child-heading"
    >
      <h2 id="guardian-child-heading" className="text-2xl font-bold">
        Guardian & Child Information
      </h2>

      {/* ----------------------------- Guardian -------------------------------- */}
      <section aria-labelledby="guardian-section">
        <h3 id="guardian-section" className="text-lg font-semibold mb-2">
          Guardian details
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Required for safeguarding, communication, and emergency contact.
        </p>

        <div className="grid gap-4">
          <Field label="First name" error={errors.guardianFirstName?.message}>
            <input {...register('guardianFirstName')} />
          </Field>

          <Field label="Last name" error={errors.guardianLastName?.message}>
            <input {...register('guardianLastName')} />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input type="email" {...register('email')} />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input type="password" {...register('password')} />
          </Field>

          <Field
            label="Relationship to child"
            error={errors.relationship?.message}
          >
            <select {...register('relationship')}>
              <option value="">Select…</option>
              <option>Mother</option>
              <option>Father</option>
              <option>Carer</option>
              <option>Legal Guardian</option>
            </select>
          </Field>
        </div>
      </section>

      {/* ------------------------------- Child --------------------------------- */}
      <section aria-labelledby="child-section">
        <h3 id="child-section" className="text-lg font-semibold mb-2">
          Child details
        </h3>

        <div className="grid gap-4">
          <Field label="Child first name" error={errors.childFirstName?.message}>
            <input {...register('childFirstName')} />
          </Field>

          <Field label="Child last name" error={errors.childLastName?.message}>
            <input {...register('childLastName')} />
          </Field>

          <Field label="Gender" error={errors.childsGender?.message}>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="male"
                  {...register('childsGender')}
                />
                <span>Male</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="female"
                  {...register('childsGender')}
                />
                <span>Female</span>
              </label>
            </div>
          </Field>

          <Field
            label="Date of birth"
            error={errors.childDateOfBirth?.message}
          >
            <input type="date" {...register('childDateOfBirth')} />
          </Field>
        </div>
      </section>

      {/* ----------------------------- Medical --------------------------------- */}
      <section aria-labelledby="medical-section">
        <h3 id="medical-section" className="text-lg font-semibold mb-2">
          Medical & emergency information
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          This information helps our coaches keep your child safe during training.
          It is only visible to authorised staff.
        </p>

        <div className="grid gap-4">
          <Field label="Allergies (if any)">
            <textarea {...register('allergies')} />
          </Field>

          <Field label="Medical conditions">
            <textarea {...register('medicalConditions')} />
          </Field>

          <Field label="Current medications">
            <textarea {...register('medications')} />
          </Field>

          <Field
            label="Emergency contact name"
            error={errors.emergencyContactName?.message}
          >
            <input {...register('emergencyContactName')} />
          </Field>

          <Field
            label="Emergency contact phone"
            error={errors.emergencyContactPhone?.message}
          >
            <input {...register('emergencyContactPhone')} />
          </Field>
        </div>
      </section>

      {/* --------------------------- Safeguarding ------------------------------ */}
      <section aria-labelledby="safeguarding-section">
        <h3 id="safeguarding-section" className="text-lg font-semibold mb-2">
          Safeguarding notes
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Optional information to help us provide appropriate supervision and care.
        </p>

        <Field label="Additional safeguarding notes">
          <textarea {...register('safeguardingNotes')} />
        </Field>

        <div className="space-y-3 mt-4">
          <Checkbox
            {...register('consentSafeguarding')}
            label="I consent to this information being shared with authorised coaching staff for safeguarding purposes."
            error={errors.consentSafeguarding?.message}
          />

          <Checkbox
            {...register('consentData')}
            label="I consent to the secure storage of this data in accordance with data protection laws."
            error={errors.consentData?.message}
          />
        </div>
      </section>

      {/* ------------------------------ Actions -------------------------------- */}
      <div className="flex justify-between pt-6">
        <button type="button" onClick={onBack} className="text-slate-400">
          Back
        </button>
        <button
          type="submit"
          className="bg-amber-400 text-black px-6 py-3 rounded-lg font-semibold"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Helper Components                                */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="mt-1 [&>input,&>textarea,&>select]:w-full [&>input,&>textarea,&>select]:rounded-lg [&>input,&>textarea,&>select]:bg-slate-900 [&>input,&>textarea,&>select]:border [&>input,&>textarea,&>select]:border-slate-700 [&>input,&>textarea,&>select]:px-4 [&>input,&>textarea,&>select]:py-2">
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Checkbox({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1" {...props} />
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}