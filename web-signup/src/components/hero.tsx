export default function Hero() {
    return (
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="max-w-3xl px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Train Strong.  
            <span className="block text-amber-400 mt-2 text-red-500">
              Move With Purpose.
            </span>
          </h1>
  
          <p className="mt-6 text-lg text-slate-300">
            Boxing, Brazilian Jiu-Jitsu & Muay Thai for adults and children.
            Build confidence, discipline, and resilience.
          </p>
  
          <a
            href="#signup"
            className="inline-block mt-10 rounded-xl bg-amber-400 px-8 py-4 font-semibold text-black hover:bg-amber-300 transition"
          >
            Join the Movement
          </a>
        </div>
      </section>
    );
}  