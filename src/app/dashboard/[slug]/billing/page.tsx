import { prisma } from "@/lib/db/prisma";
import { BillingService, PLAN_CATALOG } from "@/server/services/billing";
import { getServerSession } from "@/lib/auth/session";
import { requireBusinessAccess } from "@/lib/permissions/rbac";
import { redirect, notFound } from "next/navigation";
import { BillingClientView } from "./client";

export const dynamic = "force-dynamic";

interface BillingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessBillingPage({ params }: BillingPageProps) {
  const { slug } = await params;
  const session = await getServerSession();

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  // Only business OWNER or PLATFORM_ADMIN can view or manage billing
  try {
    requireBusinessAccess(session, business.id, ["OWNER"]);
  } catch {
    redirect(`/dashboard/${slug}?error=owner_only_billing`);
  }

  const { subscription, plan, isConfigured } = await BillingService.getBusinessSubscription(business.id);
  const allPlans = Object.values(PLAN_CATALOG);

  return (
    <BillingClientView
      businessId={business.id}
      businessSlug={business.slug}
      currentPlan={plan}
      subscription={
        subscription
          ? {
              id: subscription.id,
              planId: subscription.planId,
              status: subscription.status,
              currentPeriodStart: subscription.currentPeriodStart,
              currentPeriodEnd: subscription.currentPeriodEnd,
              paymentProvider: subscription.paymentProvider,
            }
          : null
      }
      allPlans={allPlans}
      isConfigured={isConfigured}
    />
  );
}
