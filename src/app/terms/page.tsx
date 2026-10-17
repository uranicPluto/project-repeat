import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 prose prose-slate">
          <h1 className="text-3xl font-extrabold text-brand-navy">Terms of Service</h1>
          <p className="text-sm text-brand-muted">
            Last Updated: October 2026. [Draft for Legal Review — Placeholders clearly indicated]
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy">1. Acceptance of Terms</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              By accessing or using Project Repeat, a digital loyalty SaaS product developed by House of Workflow,
              you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy">2. Business Responsibilities</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Participating businesses agree to honor earned rewards published on their digital cards, ensure staff
              maintain appropriate account security, and comply with all applicable local consumer protection regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy">3. Loyalty &amp; Anti-Abuse Standards</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Any attempt to fabricate stamp verifications, bypass single-use verification token checks, or manipulate
              balances through unauthorized means will result in immediate termination of the associated accounts.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
