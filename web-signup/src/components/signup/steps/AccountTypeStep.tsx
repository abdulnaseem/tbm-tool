import { AccountType } from '../SignupWizard';

export default function AccountTypeStep({
  onSelect,
}: {
  onSelect: (type: AccountType) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center">
        How would you like to join?
      </h2>

      <button
        onClick={() => onSelect('ADULT')}
        className="w-full rounded-xl border border-slate-700 p-6 hover:border-amber-400 transition"
      >
        I am 18+ joining myself
      </button>

      <button
        onClick={() => onSelect('GUARDIAN')}
        className="w-full rounded-xl border border-slate-700 p-6 hover:border-amber-400 transition"
      >
        I am a parent/guardian signing up a child
      </button>
    </div>
  );
}