import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 prose prose-slate">
          <h1 className="text-3xl font-extrabold text-brand-navy">Privacy Policy</h1>
          <p className="text-sm text-brand-muted">
            Last Updated: October 2026. [Draft for Legal Review — Placeholders clearly indicated]
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy">1. Information We Collect</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Project Repeat (operated by House of Workflow) collects information necessary to deliver digital loyalty card
              services, verify counter visits, and process subscription billing:
            </p>
            <ul className="list-disc pl-5 text-sm text-brand-muted space-y-1">
              <li><strong>Customer Information:</strong> Name, email address, optional telephone number, and loyalty transaction records.</li>
              <li><strong>Business Information:</strong> Business name, address, category, branding assets, staff accounts, and billing details.</li>
              <li><strong>Technical Metadata:</strong> IP address, device user-agent string, and visit verification timestamps.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy">2. How We Use Information</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              We process personal data strictly to:
            </p>
            <ul className="list-disc pl-5 text-sm text-brand-muted space-y-1">
              <li>Maintain your digital loyalty cards and calculate milestone reward eligibility.</li>
              <li>Authenticate authorized staff and prevent counter fraud or duplicate stamp claims.</li>
              <li>Deliver marketing messages only when explicitly consented to by the customer.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy">3. Tenant Isolation &amp; Data Rights</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Under our strict multi-tenant architecture, participating businesses can only view their own enrolled customers
              and cannot access records from other businesses. Customers may view, update, or request deletion of their loyalty
              history at any time from their account settings.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
