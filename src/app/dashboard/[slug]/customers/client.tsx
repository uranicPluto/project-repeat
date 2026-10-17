"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Users, Search, Download } from "lucide-react";

interface CustomerEnrollment {
  id: string;
  customerName: string;
  maskedEmail: string;
  currentStamps: number;
  totalStamps: number;
  currentCycle: number;
  lifetimeStamps: number;
  visitCount: number;
  redemptionCount: number;
  enrolledAt: string;
}

export function CustomersClientView({
  businessSlug,
  businessName,
  initialEnrollments,
}: {
  businessSlug: string;
  businessName: string;
  initialEnrollments: CustomerEnrollment[];
}) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = initialEnrollments.filter(
    (e) =>
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.maskedEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = [
      "Customer Name",
      "Masked Email",
      "Current Stamps",
      "Target Stamps",
      "Card Cycle",
      "Lifetime Stamps",
      "Total Visits",
      "Perks Claimed",
      "Enrolled Date",
    ];

    const rows = filtered.map((e) => [
      `"${e.customerName.replace(/"/g, '""')}"`,
      `"${e.maskedEmail}"`,
      e.currentStamps,
      e.totalStamps,
      e.currentCycle,
      e.lifetimeStamps,
      e.visitCount,
      e.redemptionCount,
      `"${formatDate(e.enrolledAt)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${businessSlug}-loyalty-customers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
            Directory &amp; Retention
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
            Loyalty Members ({initialEnrollments.length})
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Patrons who have joined your digital loyalty card. Contact details are masked for customer privacy.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Enrolled Members</CardTitle>
            <CardDescription>All registered patrons with active or completed cards</CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-brand-muted">
              {searchTerm ? "No customers matching your search query." : "No loyalty members yet."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact (Masked)</TableHead>
                  <TableHead>Current Card</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Perks Claimed</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-semibold text-brand-navy">{e.customerName}</TableCell>
                    <TableCell className="text-xs text-brand-muted font-mono">{e.maskedEmail}</TableCell>
                    <TableCell>
                      <Badge variant={e.currentStamps >= e.totalStamps ? "success" : "blue"}>
                        {e.currentStamps} / {e.totalStamps} stamps
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-brand-navy">
                      Cycle #{e.currentCycle}
                    </TableCell>
                    <TableCell className="font-medium">{e.visitCount} visits</TableCell>
                    <TableCell>{e.redemptionCount} claimed</TableCell>
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
