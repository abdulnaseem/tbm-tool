import Hero from '@/components/hero';
import SignupWizard from '@/components/signup/SignupWizard';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <section id="signup" className="py-24">
        <SignupWizard />
      </section>
    </main>
  );
}