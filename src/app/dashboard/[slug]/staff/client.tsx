"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { UserPlus, Shield, CheckCircle2, AlertCircle } from "lucide-react";

interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function StaffManagementClient({
  businessId,
  businessSlug,
  initialStaff,
}: {
  businessId: string;
  businessSlug: string;
  initialStaff: StaffMember[];
}) {
  const [staff, setStaff] = React.useState<StaffMember[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"STAFF" | "MANAGER">("STAFF");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/business/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add staff member");
      }

      setStaff((prev) => [
        ...prev,
        {
          id: data.membership.id,
          userId: data.membership.user.id,
          name: data.membership.user.name,
          email: data.membership.user.email,
          role: data.membership.role,
          createdAt: new Date().toISOString(),
        },
      ]);

      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
            Access &amp; Permissions
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
            Staff Members ({staff.length})
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Authorize team members to verify visits and redeem customer rewards at the counter.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
          <CardDescription>Roles: Owner (all permissions), Manager (analytics + cards), Staff (counter verify only)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-brand-navy">{m.name}</TableCell>
                  <TableCell className="text-xs text-brand-muted">{m.email}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "OWNER" ? "blue" : m.role === "MANAGER" ? "success" : "default"}>
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-brand-muted">{formatDate(m.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff Member"
        description="Create credentials for counter staff to log in and verify visits."
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-brand-error border border-red-200">
              {error}
            </div>
          )}

          <Input
            label="Staff Name"
            placeholder="John Cashier"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@business.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Temporary Password (min 8 chars)"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
              Role Permission
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full h-10 rounded-lg border border-brand-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="STAFF">Staff (Verify visits &amp; redeem perks)</option>
              <option value="MANAGER">Manager (Staff + Card Builder &amp; Analytics)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Add to Team
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
