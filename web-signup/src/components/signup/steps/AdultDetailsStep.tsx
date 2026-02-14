'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/* -------------------------------------------------------------------------- */
/*                               Validation                                   */
/* -------------------------------------------------------------------------- */

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select male or female',
  }),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),

  dateOfBirth: z
    .string()
    .refine((value) => {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      return age >= 18;
    }, 'You must be at least 18 years old to join'),

  phone: z.string().min(1, 'Contact phone number is required'),
  address: z.string().optional(),

  /* Medical & Emergency (required) */
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),

  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(
    1,
    'Emergency contact phone number is required',
  ),
});

type FormData = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function AdultDetailsStep({
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
      aria-labelledby="adult-details-heading"
    >
      <h2 id="adult-details-heading" className="text-2xl font-bold">
        Your details
      </h2>

      {/* --------------------------- Personal Info ---------------------------- */}
      <section aria-labelledby="personal-section">
        <h3 id="personal-section" className="text-lg font-semibold mb-2">
          Personal information
        </h3>

        <div className="grid gap-4">
          <Field label="First name" error={errors.firstName?.message}>
            <input {...register('firstName')} />
          </Field>

          <Field label="Last name" error={errors.lastName?.message}>
            <input {...register('lastName')} />
          </Field>

          <Field label="Gender" error={errors.gender?.message}>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="male"
                  {...register('gender')}
                />
                <span>Male</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="female"
                  {...register('gender')}
                />
                <span>Female</span>
              </label>
            </div>
          </Field>


          <Field label="Email" error={errors.email?.message}>
            <input type="email" {...register('email')} />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input type="password" {...register('password')} />
          </Field>

          <Field label="Date of birth" error={errors.dateOfBirth?.message}>
            <input type="date" {...register('dateOfBirth')} />
          </Field>
        </div>
      </section>

      {/* ----------------------------- Contact -------------------------------- */}
      <section aria-labelledby="contact-section">
        <h3 id="contact-section" className="text-lg font-semibold mb-2">
          Contact details
        </h3>

        <div className="grid gap-4">
          <Field label="Phone number" error={errors.phone?.message}>
            <input type="tel" {...register('phone')} />
          </Field>

          <Field label="Address (optional)">
            <input {...register('address')} />
          </Field>
        </div>
      </section>

      {/* ----------------------------- Medical -------------------------------- */}
      <section aria-labelledby="medical-section">
        <h3 id="medical-section" className="text-lg font-semibold mb-2">
          Medical & emergency information
        </h3>

        <p className="text-sm text-slate-400 mb-4">
          This information helps our coaches respond appropriately in the event
          of injury or medical emergency. It is visible only to authorised staff.
        </p>

        <div className="grid gap-4">
          <Field label="Allergies" error={errors.allergies?.message}>
            <textarea {...register('allergies')} />
          </Field>

          <Field
            label="Medical conditions"
            error={errors.medicalConditions?.message}
          >
            <textarea {...register('medicalConditions')} />
          </Field>

          <Field label="Current medications" error={errors.medications?.message}>
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
            <input type="tel" {...register('emergencyContactPhone')} />
          </Field>
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
      <div className="mt-1 [&>input,&>textarea]:w-full [&>input,&>textarea]:rounded-lg [&>input,&>textarea]:bg-slate-900 [&>input,&>textarea]:border [&>input,&>textarea]:border-slate-700 [&>input,&>textarea]:px-4 [&>input,&>textarea]:py-2">
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