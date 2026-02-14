'use client';

import { useState } from 'react';
import AccountTypeStep from './steps/AccountTypeStep';
import AdultDetailsStep from './steps/AdultDetailsStep';
import GuardianChildDetailsStep from './steps/GuardianChildDetailsStep';
import DisciplinesStep from './steps/DisciplinesStep';
import PaymentStep from './steps/PaymentStep';
import ReviewStep from './steps/ReviewStep';
import SignupSuccessStep from './steps/SignupSuccessStep';

export type AccountType = 'ADULT' | 'GUARDIAN';

export default function SignupWizard() {
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<any>({});

  const next = (data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }));
    }
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  return (
    <div className="max-w-2xl mx-auto px-6">
      {step === 0 && (
        <AccountTypeStep
          onSelect={(type) => {
            setAccountType(type);
            next();
          }}
        />
      )}

      {step === 1 && accountType === 'ADULT' && (
        <AdultDetailsStep onNext={next} onBack={back} />
      )}

      {step === 1 && accountType === 'GUARDIAN' && (
        <GuardianChildDetailsStep onNext={next} onBack={back} />
      )}

      {step === 2 && (
        <DisciplinesStep onNext={next} onBack={back} />
      )}

      {step === 3 && (
        <PaymentStep onNext={next} onBack={back} />
      )}

      {step === 4 && (
        <ReviewStep
          accountType={accountType}
          data={formData}
          onConfirm={() => {
            // 🔐 This is where you will call the backend later
            // await submitSignup(formData);

            next();
          }}
        />
      )}

      {step === 5 && (
        <SignupSuccessStep email={formData.email} />
      )}
    </div>
  );
}
