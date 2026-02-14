'use client';

import { useState } from 'react';

/* -------------------------------------------------------------------------- */
/*                               Pricing Model                                */
/* -------------------------------------------------------------------------- */

type Discipline = {
  id: 'BOXING' | 'BJJ' | 'MUAY_THAI';
  label: string;
  classesPerWeek: number;
  price: number; // monthly price
};

const DISCIPLINES: Discipline[] = [
  {
    id: 'BOXING',
    label: 'Boxing',
    classesPerWeek: 3,
    price: 60,
  },
  {
    id: 'BJJ',
    label: 'Brazilian Jiu-Jitsu',
    classesPerWeek: 3,
    price: 70,
  },
  {
    id: 'MUAY_THAI',
    label: 'Muay Thai',
    classesPerWeek: 3,
    price: 70,
  },
];

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function DisciplinesStep({
  onNext,
  onBack,
}: {
  onNext: (data: {
    disciplines: string[];
    totalPrice: number;
  }) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  };

  const totalPrice = DISCIPLINES.filter((d) =>
    selected.includes(d.id),
  ).reduce((sum, d) => sum + d.price, 0);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold">Choose your disciplines</h2>
        <p className="text-slate-400 mt-2">
          Select one or more disciplines. You can train across multiple styles.
        </p>
      </header>

      {/* --------------------------- Discipline Cards -------------------------- */}
      <div className="grid gap-4">
        {DISCIPLINES.map((d) => {
          const isSelected = selected.includes(d.id);

          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              className={`
                text-left rounded-xl border p-5 transition
                focus:outline-none focus:ring-2 focus:ring-amber-400
                ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-slate-700 hover:border-slate-500'
                }
              `}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{d.label}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {d.classesPerWeek} classes per week
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">£{d.price}</p>
                  <p className="text-sm text-slate-400">per month</p>
                </div>
              </div>

              {/* Hidden checkbox for accessibility */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(d.id)}
                className="sr-only"
                tabIndex={-1}
              />
            </button>
          );
        })}
      </div>

      {/* ------------------------------ Summary -------------------------------- */}
      <div className="rounded-xl border border-slate-700 p-5">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total monthly cost</span>
          <span className="text-xl font-bold">
            £{totalPrice}
          </span>
        </div>

        {selected.length > 1 && (
          <p className="text-sm text-slate-400 mt-2">
            You’ve selected multiple disciplines — great for well-rounded
            training.
          </p>
        )}
      </div>

      {/* ------------------------------ Actions -------------------------------- */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400"
        >
          Back
        </button>

        <button
          onClick={() =>
            onNext({
              disciplines: selected,
              totalPrice,
            })
          }
          disabled={!selected.length}
          className={`
            px-6 py-3 rounded-lg font-semibold
            ${
              selected.length
                ? 'bg-amber-400 text-black'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
