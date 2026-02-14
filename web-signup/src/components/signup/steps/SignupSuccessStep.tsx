'use client';

export default function SignupSuccessStep({
  email,
}: {
  email: string;
}) {
  return (
    <div className="space-y-8 text-center">
      {/* Success header */}
      <div className="space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <span className="text-3xl">✓</span>
        </div>

        <h2 className="text-3xl font-bold">
          Welcome to the club!
        </h2>

        <p className="text-slate-400">
          Your membership has been successfully created.
        </p>
      </div>

      {/* Next steps */}
      <div className="rounded-xl border border-slate-700 p-6 text-left space-y-4">
        <h3 className="font-semibold text-lg">
          What happens next?
        </h3>

        <ol className="list-decimal list-inside space-y-2 text-slate-300">
          <li>
            Download the club app using the links below
          </li>
          <li>
            Log in with the email you signed up with:
            <span className="block font-medium text-slate-100 mt-1">
              {email}
            </span>
          </li>
          <li>
            Book classes, manage your membership, and stay up to date
          </li>
        </ol>
      </div>

      {/* App download CTAs */}
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Download the app
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://apps.apple.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-800 px-6 py-3 font-medium hover:bg-slate-700 transition"
          >
            🍎 Download on the App Store
          </a>

          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-800 px-6 py-3 font-medium hover:bg-slate-700 transition"
          >
            🤖 Get it on Google Play
          </a>
        </div>
      </div>

      {/* Support reassurance */}
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        If you have any issues logging in or booking classes, our team is happy
        to help — just get in touch at the gym.
      </p>
    </div>
  );
}