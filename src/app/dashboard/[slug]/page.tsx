import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  CheckCircle,
  Award,
  TrendingUp,
  QrCode,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OverviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessOverviewPage({ params }: OverviewPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  // Real Database Metrics
  const totalMembers = await prisma.loyaltyEnrollment.count({
    where: { businessId: business.id },
  });

  const verifiedVisits = await prisma.loyaltyTransaction.count({
    where: {
      enrollment: { businessId: business.id },
      type: "STAMP_EARNED",
    },
  });

  const rewardsRedeemed = await prisma.rewardRedemption.count({
    where: {
      enrollment: { businessId: business.id },
      status: "REDEEMED",
    },
  });

  // Calculate repeat-customer rate: enrollments with >= 2 stamps
  const repeatMembers = await prisma.loyaltyEnrollment.count({
    where: {
      businessId: business.id,
      currentStamps: { gte: 2 },
    },
  });

  const repeatCustomerRate = totalMembers > 0 ? Math.round((repeatMembers / totalMembers) * 100) : 0;

  // Recent transactions
  const recentTransactions = await prisma.loyaltyTransaction.findMany({
    where: { enrollment: { businessId: business.id } },
    include: {
      enrollment: {
        include: { customer: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
            Overview &amp; Metrics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
            {business.name}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/dashboard/${slug}/qr`}>
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-1.5" />
              Counter QR
            </Button>
          </Link>
          <Link href={`/dashboard/${slug}/verify`}>
            <Button variant="primary" size="sm">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Verify Customer Visit
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand-muted">Total Loyalty Members</CardTitle>
            <Users className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-navy">{totalMembers}</div>
            <p className="text-xs text-brand-muted mt-1">Patrons enrolled via QR scan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand-muted">Verified Visits</CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-navy">{verifiedVisits}</div>
            <p className="text-xs text-brand-muted mt-1">Counter stamp transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand-muted">Rewards Redeemed</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-navy">{rewardsRedeemed}</div>
            <p className="text-xs text-brand-muted mt-1">Milestone perks claimed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand-muted">Repeat Customer Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-brand-navy">{repeatCustomerRate}%</div>
            <p className="text-xs text-brand-muted mt-1">Members with 2+ verified visits</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ledger Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Verified Activity</CardTitle>
            <CardDescription>Live counter visit stamps and reward redemptions</CardDescription>
          </div>
          <Link href={`/dashboard/${slug}/customers`}>
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-brand-muted">
              No loyalty visits recorded yet. Open the counter verification page to award your first stamp!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Stamps Delta</TableHead>
                  <TableHead>Card Balance</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-semibold">{tx.enrollment.customer.name}</TableCell>
                    <TableCell>
                      {tx.type === "STAMP_EARNED" ? (
                        <Badge variant="blue">+1 Stamp Earned</Badge>
                      ) : (
                        <Badge variant="success">Reward Claimed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      {tx.stampsDelta > 0 ? `+${tx.stampsDelta}` : tx.stampsDelta}
                    </TableCell>
                    <TableCell>{tx.balanceAfter} stamps</TableCell>
                    <TableCell className="text-xs text-brand-muted">{formatDateTime(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
