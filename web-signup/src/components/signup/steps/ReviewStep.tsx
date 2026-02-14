'use client';

export default function ReviewStep({
  accountType,
  data,
  onConfirm,
}: {
  accountType: 'ADULT' | 'GUARDIAN' | null;
  data: any;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Review & confirm
      </h2>

      <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm overflow-x-auto">
        {JSON.stringify({ accountType, ...data }, null, 2)}
      </pre>

      <p className="text-slate-300">
        When you confirm, your membership will be created and activated.
      </p>

      <button
        onClick={onConfirm}
        className="w-full bg-green-500 text-black px-6 py-4 rounded-lg font-semibold"
      >
        Confirm & Join
      </button>
    </div>
  );
}
