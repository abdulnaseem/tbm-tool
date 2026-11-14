
import Image from 'next/image';
import Link from 'next/link';

const sessions = [
  {
    name: 'Turtles',
    ages: '4-7 years old',
    time: '12:15 PM - 1:00 PM',
  },
  {
    name: 'Cubs',
    ages: '8-12 years old',
    time: '1:00 PM - 1:55 PM',
  },
  {
    name: 'Tigers (Boys Only)',
    ages: '12-17 years old',
    time: '2:00 PM - 3:00 PM',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="mx-auto flex min-h-[90vh] max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-xl md:p-10">
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

          <h1 className="mt-2 text-[28px] font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            <span className="block">Brawlers Boxing</span>
            <span className="block">Sign Up</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Join the Brawlers Boxing programme. Our boxing
            sessions take place every Saturday, with classes
            for children and teenagers aged 4-17.
            Membership runs on a rolling 3-month term basis,
            with payment due at the start of each term.
          </p>

          {/* Saturday Timetable */}
          <h2 className="mt-8 text-lg font-bold text-slate-900">
            Saturday Training Sessions
          </h2>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.name}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="font-bold text-slate-900">
                  {session.name}
                </div>

                <div className="mt-1 text-slate-600">
                  Ages {session.ages.replace(' years old', '')}
                </div>

                <div className="mt-3 font-semibold text-green-700">
                  {session.time}
                </div>
              </div>
            ))}
          </div>

          {/* Membership Fee */}
          <div className="mx-auto mt-4 max-w-md rounded-2xl border border-green-100 bg-green-50 p-4">
            <div className="font-semibold text-slate-900">
              Membership Fee
            </div>
            <div className="mt-1 text-xl font-bold text-green-700">
              £100 every 3 months
            </div>
          </div>

          {/* Current Term */}
          <div className="mx-auto mt-4 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <div className="font-semibold text-slate-900">
              Current Term - Autumn 2026
            </div>

            <div className="mt-2 font-medium text-slate-700">
              10 October - 26 December 2026
            </div>

          </div>


          {/* Training Location */}
          <div className="mx-auto mt-6 max-w-md text-center">
            <div className="font-semibold text-slate-900">
              Training Location
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Osmani Trust
              <br />
              58 Underwood Road
              <br />
              London E1 5AW
            </p>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Osmani+Trust+58+Underwood+Road+London+E1+5AW"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-green-700 hover:underline"
            >
              View on Google Maps
            </a>
          </div>


          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
          >
            Start registration
          </Link>
        </div>
      </div>
    </main>
  );
}
