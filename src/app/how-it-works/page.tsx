import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QrCode, Smartphone, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="blue">Operational Walkthrough</Badge>
            <h1 className="text-4xl font-extrabold text-brand-navy">
              How Project Repeat Operates at the Counter
            </h1>
            <p className="text-base text-brand-muted">
              Designed to avoid counter friction, prevent line delays, and ensure 100% stamp integrity.
            </p>
          </div>

          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-white border border-brand-border shadow-card flex flex-col md:flex-row gap-6 items-start">
              <div className="h-12 w-12 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-navy">Customer Scans Counter QR Code</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  The counter QR stand encodes your public URL (e.g. <code>app.domain.com/b/the-coffee-house</code>).
                  Customers point their standard mobile camera and open your digital storefront in Safari or Chrome instantly.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-brand-border shadow-card flex flex-col md:flex-row gap-6 items-start">
              <div className="h-12 w-12 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-navy">Customer Taps &quot;Claim Stamp at Counter&quot;</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Upon purchase, the customer clicks the verification button on their digital card. The server issues a
                  cryptographically random 6-digit code with an active 3-minute TTL.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-brand-border shadow-card flex flex-col md:flex-row gap-6 items-start">
              <div className="h-12 w-12 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-navy">Staff Verifies &amp; Stamp Accrues Instantly</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Staff enters the 6 digits on their phone or terminal. The server verifies the single-use code atomically,
                  appends a visit record to the immutable ledger, and the customer&apos;s card updates in real time.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <Link href="/register-business">
              <Button size="lg" className="font-semibold">
                Start Free Trial for Your Business
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
