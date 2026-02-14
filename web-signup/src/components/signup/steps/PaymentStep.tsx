'use client';

export default function PaymentStep({
  onNext,
  onBack,
}: {
  onNext: (data: any) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment</h2>

      <div className="rounded-xl border border-slate-700 p-6 text-slate-300">
        Stripe payment form will go here.
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-slate-400">Back</button>
        <button
          onClick={() => onNext({ paymentIntentId: 'TEMP_INTENT' })}
          className="bg-amber-400 text-black px-6 py-3 rounded-lg"
        >
          Complete payment
        </button>
      </div>
    </div>
  );
}