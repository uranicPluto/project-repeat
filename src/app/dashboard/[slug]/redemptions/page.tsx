import { prisma } from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";

interface RedemptionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessRedemptionsPage({ params }: RedemptionsPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  const redemptions = await prisma.rewardRedemption.findMany({
    where: {
      enrollment: { businessId: business.id },
    },
    include: {
      enrollment: {
        include: { customer: true },
      },
      reward: true,
      staffUser: true,
    },
    orderBy: { redeemedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
          Perks &amp; Milestones
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
          Reward Redemptions Ledger
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Historical record of all milestone perks claimed by customers and authorized by staff.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verified Redemptions</CardTitle>
          <CardDescription>Immutable transaction records for counter reconciliation</CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <div className="py-12 text-center text-sm text-brand-muted">
              No rewards redeemed yet. As customers complete stamp cards, redemptions will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reward Milestone</TableHead>
                  <TableHead>Authorized By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Redemption Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-brand-navy">
                      {r.enrollment.customer.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-brand-navy">{r.reward.title}</span>
                        <span className="text-[11px] text-brand-muted">
                          {r.reward.stampsRequired} stamps milestone
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-brand-muted">
                      {r.staffUser.name} ({r.staffUser.role})
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Redeemed</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-brand-muted">{formatDateTime(r.redeemedAt)}</TableCell>
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
