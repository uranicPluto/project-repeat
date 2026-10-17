import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { BarChart3, TrendingUp, Users, Award, Calendar, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface AnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessAnalyticsPage({ params }: AnalyticsPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  // 1. Total members
  const totalMembers = await prisma.loyaltyEnrollment.count({
    where: { businessId: business.id },
  });

  // 2. Members with multiple visits (repeat customers)
  const repeatMembers = await prisma.loyaltyEnrollment.count({
    where: {
      businessId: business.id,
      currentStamps: { gte: 2 },
    },
  });

  // 3. Members who reached full card completion
  const completedMembers = await prisma.loyaltyEnrollment.count({
    where: {
      businessId: business.id,
      currentStamps: { gte: 5 },
    },
  });

  // 4. Total visits and redemptions
  const totalVisits = await prisma.loyaltyTransaction.count({
    where: {
      enrollment: { businessId: business.id },
      type: "STAMP_EARNED",
    },
  });

  const totalRedemptions = await prisma.rewardRedemption.count({
    where: {
      enrollment: { businessId: business.id },
      status: "REDEEMED",
    },
  });

  const repeatRate = totalMembers > 0 ? Math.round((repeatMembers / totalMembers) * 100) : 0;
  const completionRate = totalMembers > 0 ? Math.round((completedMembers / totalMembers) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
          Insights &amp; Retention
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
          Program Analytics
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Performance calculated strictly from verified database transactions. No synthetic or fabricated metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Repeat Customer Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{repeatRate}%</div>
            <p className="text-xs text-brand-muted mt-1">
              {repeatMembers} of {totalMembers} members returned for 2+ visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Card Completion Rate
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{completionRate}%</div>
            <p className="text-xs text-brand-muted mt-1">
              {completedMembers} members unlocked milestone rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Total Verified Visits
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{totalVisits}</div>
            <p className="text-xs text-brand-muted mt-1">In-person counter stamp ledger events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Total Redemptions
            </CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{totalRedemptions}</div>
            <p className="text-xs text-brand-muted mt-1">Completed rewards handed to patrons</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metric Definitions &amp; Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-brand-muted leading-relaxed">
            <div>
              <strong className="text-brand-navy block font-semibold">Repeat Customer Rate</strong>
              Calculated as <code>(members with &ge; 2 visits) &divide; (total enrolled members) &times; 100</code>.
              Reflects the exact percentage of patrons who returned after their initial onboarding scan.
            </div>
            <div>
              <strong className="text-brand-navy block font-semibold">Verified Visits Source</strong>
              Derived strictly from single-use 6-digit codes verified by authorized staff at the checkout counter.
            </div>
            <div>
              <strong className="text-brand-navy block font-semibold">Data Integrity</strong>
              Stamps cannot be self-awarded by customers or simulated by page views.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Cohort Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-brand-navy">New Enrollees (1 Stamp)</span>
                <span className="text-brand-muted">{Math.max(0, totalMembers - repeatMembers)} patrons</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-brand-blue"
                  style={{
                    width: `${totalMembers > 0 ? ((totalMembers - repeatMembers) / totalMembers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-brand-navy">Active Repeat Regulars (2-4 Stamps)</span>
                <span className="text-brand-muted">{Math.max(0, repeatMembers - completedMembers)} patrons</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{
                    width: `${totalMembers > 0 ? ((repeatMembers - completedMembers) / totalMembers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-brand-navy">Loyalty Champions (5+ Stamps)</span>
                <span className="text-brand-muted">{completedMembers} patrons</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-brand-success"
                  style={{
                    width: `${totalMembers > 0 ? (completedMembers / totalMembers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
