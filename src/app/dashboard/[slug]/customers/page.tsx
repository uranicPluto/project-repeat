import { prisma } from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Users, Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface CustomersPageProps {
  params: Promise<{ slug: string }>;
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export default async function BusinessCustomersPage({ params }: CustomersPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  const enrollments = await prisma.loyaltyEnrollment.findMany({
    where: { businessId: business.id },
    include: {
      customer: true,
      program: true,
      transactions: {
        where: { type: "STAMP_EARNED" },
      },
      redemptions: {
        where: { status: "REDEEMED" },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
          Directory &amp; Retention
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
          Loyalty Members ({enrollments.length})
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Patrons who have joined your digital loyalty card. Contact details are masked for customer privacy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Members</CardTitle>
          <CardDescription>All registered patrons with active or completed cards</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="py-12 text-center text-sm text-brand-muted">
              No loyalty members yet. Display your counter QR code to invite customers!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact (Masked)</TableHead>
                  <TableHead>Current Stamps</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Perks Claimed</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-semibold text-brand-navy">{e.customer.name}</TableCell>
                    <TableCell className="text-xs text-brand-muted font-mono">
                      {maskEmail(e.customer.email)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={e.currentStamps >= e.program.totalStamps ? "success" : "blue"}>
                        {e.currentStamps} / {e.program.totalStamps} stamps
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{e.transactions.length} visits</TableCell>
                    <TableCell>{e.redemptions.length} claimed</TableCell>
                    <TableCell className="text-xs text-brand-muted">{formatDate(e.enrolledAt)}</TableCell>
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
