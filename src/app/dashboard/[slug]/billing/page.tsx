import { prisma } from "@/lib/db/prisma";
import { BillingService, PLAN_CATALOG } from "@/server/services/billing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface BillingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessBillingPage({ params }: BillingPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  const { subscription, plan, isConfigured } = await BillingService.getBusinessSubscription(business.id);
  const allPlans = Object.values(PLAN_CATALOG);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
          Subscription &amp; Invoices
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
          Plan &amp; Billing
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage your subscription tier, billing period, and payment settings.
        </p>
      </div>

      {!isConfigured && (
        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Development Sandbox Mode</span>
            <span>
              Live Razorpay payment gateway credentials are not configured in <code>.env</code>. The application is operating in
              mock billing mode for local testing and compliance evaluation.
            </span>
          </div>
        </div>
      )}

      {/* Current Plan Overview */}
      <Card className="border-2 border-brand-blue/30 bg-gradient-to-r from-white via-white to-brand-blue-subtle/50">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Current Subscription</span>
              <Badge variant="success">Active</Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              {plan.name} Tier — ₹{plan.priceMonthlyINR}/month
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted">
              Current billing period ends on{" "}
              <strong className="text-brand-navy font-semibold">
                {subscription ? formatDate(subscription.currentPeriodEnd) : "Next Month"}
              </strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              View Invoices
            </Button>
            <Button variant="primary" size="sm">
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Catalog Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-brand-navy">Available Subscription Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.slice(0, 3).map((p) => {
            const isCurrent = p.id === plan.id;
            return (
              <div
                key={p.id}
                className={`flex flex-col justify-between rounded-2xl bg-white p-6 border shadow-card ${
                  isCurrent ? "border-2 border-brand-blue ring-4 ring-brand-blue-light/40" : "border-brand-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-brand-navy">{p.name}</h4>
                    {isCurrent && <Badge variant="blue">Current Plan</Badge>}
                  </div>

                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-extrabold text-brand-navy">₹{p.priceMonthlyINR}</span>
                    <span className="ml-1 text-xs text-brand-muted">/month</span>
                  </div>

                  <ul className="mt-5 space-y-2 text-xs text-brand-navy">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-success flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full text-xs" disabled>
                      Active Plan
                    </Button>
                  ) : (
                    <Button variant="primary" className="w-full text-xs">
                      Switch to {p.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
