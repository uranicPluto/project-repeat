"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sparkles,
  FileText,
  Download,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BillingClientProps {
  businessId: string;
  businessSlug: string;
  currentPlan: {
    id: string;
    name: string;
    priceMonthlyINR: number;
    features: string[];
  };
  subscription: {
    id: string;
    planId: string;
    status: string;
    currentPeriodStart: string | Date;
    currentPeriodEnd: string | Date;
    paymentProvider: string;
  } | null;
  allPlans: Array<{
    id: string;
    name: string;
    priceMonthlyINR: number;
    features: string[];
    isPopular?: boolean;
  }>;
  isConfigured: boolean;
}

export function BillingClientView({
  businessId,
  businessSlug,
  currentPlan,
  subscription,
  allPlans,
  isConfigured,
}: BillingClientProps) {
  const router = useRouter();
  const [activePlanId, setActivePlanId] = React.useState(subscription?.planId || currentPlan.id);
  const [isSwitching, setIsSwitching] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = React.useState(false);

  const plansRef = React.useRef<HTMLDivElement>(null);

  const handleSwitchPlan = async (planId: string) => {
    setIsSwitching(planId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/business/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, planId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change subscription plan");
      }

      setActivePlanId(planId);
      setSuccessMessage(data.message || `Switched to ${planId} successfully`);
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to switch plan");
    } finally {
      setIsSwitching(null);
    }
  };

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const activePlanDef = allPlans.find((p) => p.id === activePlanId) || currentPlan;

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
            <span className="font-bold block">Development Sandbox Billing</span>
            <span>
              Live Razorpay payment gateway credentials are not configured in <code>.env</code>. You can switch plans
              freely in sandbox mode to evaluate platform features and limits.
            </span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs sm:text-sm text-brand-error">
          {errorMessage}
        </div>
      )}

      {/* Current Plan Card */}
      <Card className="border-2 border-brand-blue/30 bg-gradient-to-r from-white via-white to-brand-blue-subtle/50 shadow-card">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Current Subscription</span>
              <Badge variant="success">Active</Badge>
              {!isConfigured && <Badge variant="outline">Sandbox Evaluation</Badge>}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              {activePlanDef.name} Tier — ₹{activePlanDef.priceMonthlyINR}/month
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted">
              Current billing period ends on{" "}
              <strong className="text-brand-navy font-semibold">
                {subscription ? formatDate(subscription.currentPeriodEnd) : "Next Month"}
              </strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInvoicesModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              View Invoices
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={scrollToPlans}
            >
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Catalog Grid */}
      <div ref={plansRef} className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-brand-navy">Available Subscription Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.slice(0, 3).map((p) => {
            const isCurrent = p.id === activePlanId;
            return (
              <div
                key={p.id}
                className={`flex flex-col justify-between rounded-2xl bg-white p-6 border shadow-card transition-all ${
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
                    <Button variant="outline" className="w-full text-xs font-semibold" disabled>
                      Active Plan
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full text-xs font-semibold"
                      isLoading={isSwitching === p.id}
                      onClick={() => handleSwitchPlan(p.id)}
                    >
                      Switch to {p.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices Modal */}
      <Dialog
        isOpen={isInvoicesModalOpen}
        onClose={() => setIsInvoicesModalOpen(false)}
        title="Subscription Invoices & Receipts"
        description="Billing statements and tax invoices generated for your business."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3 rounded-xl border border-brand-border bg-brand-bg flex items-center justify-between">
            <div>
              <span className="font-bold text-brand-navy block">
                {activePlanDef.name} Plan — Monthly Subscription
              </span>
              <span className="text-[11px] text-brand-muted">
                Receipt #REC-{businessSlug.substring(0, 4).toUpperCase()}-2026-01 • Paid
              </span>
            </div>
            <span className="font-bold text-brand-navy">₹{activePlanDef.priceMonthlyINR}.00</span>
          </div>

          <div className="p-3 rounded-xl border border-dashed border-brand-border text-center text-brand-muted">
            All tax invoices are generated automatically at the end of each 30-day billing cycle.
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsInvoicesModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
