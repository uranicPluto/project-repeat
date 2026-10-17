import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PLAN_CATALOG } from "@/server/services/billing";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  const plans = Object.values(PLAN_CATALOG);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="blue" className="px-3 py-1">Predictable Pricing</Badge>
            <h1 className="text-4xl font-extrabold text-brand-navy">
              Invest in retention, not expensive POS upgrades
            </h1>
            <p className="text-lg text-brand-muted">
              Choose the right plan for your business. Every tier includes a 14-day free trial.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-2xl bg-white p-6 border shadow-card ${
                  plan.isPopular ? "border-2 border-brand-blue ring-4 ring-brand-blue-light/50" : "border-brand-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-brand-navy">{plan.name}</h3>
                    {plan.isPopular && <Badge variant="blue">Popular</Badge>}
                  </div>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-brand-navy">₹{plan.priceMonthlyINR}</span>
                    <span className="ml-1 text-xs text-brand-muted">/mo</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-brand-navy">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-success flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/register-business">
                    <Button
                      variant={plan.isPopular ? "primary" : "outline"}
                      className="w-full text-xs font-semibold"
                    >
                      Choose {plan.name}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
