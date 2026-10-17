import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Building2, Users, Activity, CreditCard, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlatformAdminDashboardPage() {
  let businessesCount = 0;
  let usersCount = 0;
  let visitsCount = 0;
  let subscriptionsCount = 0;
  let businesses: any[] = [];
  let auditLogs: any[] = [];

  try {
    businessesCount = await prisma.business.count();
    usersCount = await prisma.user.count();
    visitsCount = await prisma.loyaltyTransaction.count({
      where: { type: "STAMP_EARNED" },
    });
    subscriptionsCount = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    businesses = await prisma.business.findMany({
      include: {
        subscription: true,
        _count: {
          select: { enrollments: true, memberships: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    auditLogs = await prisma.auditLog.findMany({
      include: {
        actorUser: true,
        business: true,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
  } catch (err) {
    console.error("Platform admin query error:", err);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-navy">Platform Overview</h1>
        <p className="text-sm text-brand-muted mt-1">
          High-level operational metrics across all registered business tenants.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Total Businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{businessesCount}</div>
            <p className="text-xs text-brand-muted mt-1">Active business tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Total Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{usersCount}</div>
            <p className="text-xs text-brand-muted mt-1">Customers &amp; staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Verified Counter Visits
            </CardTitle>
            <Activity className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{visitsCount}</div>
            <p className="text-xs text-brand-muted mt-1">Platform-wide stamp transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-brand-muted">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-brand-navy">{subscriptionsCount}</div>
            <p className="text-xs text-brand-muted mt-1">Paying or active trial tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Business Tenants</CardTitle>
          <CardDescription>Multi-tenant directory with subscription tiers and member counts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((biz) => (
                <TableRow key={biz.id}>
                  <TableCell className="font-semibold text-brand-navy">
                    <Link href={`/dashboard/${biz.slug}`} className="hover:text-brand-blue">
                      {biz.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-brand-muted">{biz.category}</TableCell>
                  <TableCell>
                    <Badge variant="blue">{biz.subscription?.planId || "STARTER"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{biz._count.enrollments}</TableCell>
                  <TableCell className="text-xs text-brand-muted">{biz._count.memberships}</TableCell>
                  <TableCell>
                    <Badge variant={biz.status === "ACTIVE" ? "success" : "error"}>
                      {biz.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-brand-muted">{formatDate(biz.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operational Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-brand-blue" />
            <span>Operational Audit Trail</span>
          </CardTitle>
          <CardDescription>System-level security events and administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-sm text-brand-muted">No audit events recorded.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Business Scope</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-bold text-brand-navy">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-xs text-brand-muted">
                      {log.actorUser ? log.actorUser.email : "System / Webhook"}
                    </TableCell>
                    <TableCell className="text-xs text-brand-muted">
                      {log.business ? log.business.name : "Platform Wide"}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-brand-muted truncate max-w-xs">
                      {log.details || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-brand-muted">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
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
