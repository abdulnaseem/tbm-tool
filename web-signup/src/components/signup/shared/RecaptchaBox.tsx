'use client';

import { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

type RecaptchaBoxProps = {
  value: string | null;
  onChange: (token: string | null) => void;
};

export const RecaptchaBox = forwardRef<ReCAPTCHA, RecaptchaBoxProps>(
  function RecaptchaBox({ value, onChange }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">
          Security check <span className="text-red-600">*</span>
        </p>

        <div className="flex justify-center">
            <ReCAPTCHA
                ref={ref}
                sitekey={siteKey}
                onChange={onChange}
                onExpired={() => onChange(null)}
                onErrored={() => onChange(null)}
            />
        </div>

        {!value && (
          <p className="mt-2 text-xs text-slate-500">
            Please complete the reCAPTCHA before submitting.
          </p>
        )}
      </div>
    );
  },
);