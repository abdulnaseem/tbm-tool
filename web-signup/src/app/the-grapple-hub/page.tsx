import Image from 'next/image';
import Link from 'next/link';

export default function GrappleHubHomePage() {
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
              src="/grapple-hub-logo.jpeg"
              alt="The Grapple Hub"
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
            <span className="block">The Grapple Hub</span>
            <span className="block">Participant Registration</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            This private registration is for the current Youth BJJ cohort.
            Please complete the form so we have accurate participant,
            emergency contact, medical and safeguarding information for our records.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">Programme</div>
              <div>Brazilian Jiu-Jitsu</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">Cohort</div>
              <div>Current Youth BJJ</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">Registration</div>
              <div>Participant records</div>
            </div>
          </div>

          <Link
            href="/the-grapple-hub/signup"
            className="mt-8 inline-flex rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Start registration
          </Link>
        </div>
      </div>
    </main>
  );
}