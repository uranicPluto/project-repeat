"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Download, Trash2, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserAccountData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  marketingEmail: boolean;
}

export function AccountClientView({ user }: { user: UserAccountData }) {
  const router = useRouter();
  const [marketingEmail, setMarketingEmail] = React.useState(user.marketingEmail);
  const [isUpdatingConsent, setIsUpdatingConsent] = React.useState(false);
  const [consentSaved, setConsentSaved] = React.useState(false);

  const [isExporting, setIsExporting] = React.useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleToggleConsent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    setMarketingEmail(nextVal);
    setIsUpdatingConsent(true);
    setConsentSaved(false);

    try {
      const res = await fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingEmail: nextVal }),
      });
      if (res.ok) {
        setConsentSaved(true);
        setTimeout(() => setConsentSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update consent:", err);
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  const handleDownloadExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/privacy/export");
      if (!res.ok) throw new Error("Export request failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-repeat-export-${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Failed to download data export: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationInput !== "DELETE") {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/privacy/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      setIsDeleteDialogOpen(false);
      window.location.href = "/?notice=account_deleted";
    } catch (err: any) {
      setDeleteError(err.message || "Failed to process account deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">Account &amp; Privacy</h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage your personal details, loyalty notifications, and data privacy rights
        </p>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Your registered contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Name" defaultValue={user.name} disabled />
          <Input label="Email Address" defaultValue={user.email} disabled />
          <Input label="Phone Number" defaultValue={user.phone || "Not provided"} disabled />
        </CardContent>
      </Card>

      {/* Communication & Consent Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-brand-blue" />
            <span>Communication &amp; Marketing Preferences</span>
          </CardTitle>
          <CardDescription>
            Control which notifications you receive. Under our privacy framework, promotional communications require explicit opt-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-brand-border bg-brand-bg">
            <div>
              <span className="font-semibold text-brand-navy block">Transactional Visit Receipts</span>
              <span className="text-xs text-brand-muted">Immediate stamp verification alerts</span>
            </div>
            <span className="text-xs font-bold text-brand-success flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-brand-border bg-white">
            <div className="pr-4">
              <span className="font-semibold text-brand-navy block">Promotional Campaigns &amp; Special Offers</span>
              <span className="text-xs text-brand-muted">Opt-in notifications for double-stamp days and new rewards</span>
              {consentSaved && (
                <span className="text-[11px] font-semibold text-brand-success block mt-1">
                  ✓ Preference saved
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isUpdatingConsent && <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />}
              <input
                type="checkbox"
                checked={marketingEmail}
                onChange={handleToggleConsent}
                disabled={isUpdatingConsent}
                className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-brand-blue" />
            <span>Data Rights &amp; Export</span>
          </CardTitle>
          <CardDescription>
            Exercise your applicable rights under DPDP / GDPR regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-brand-border">
            <div>
              <h4 className="text-sm font-semibold text-brand-navy">Export Loyalty Data</h4>
              <p className="text-xs text-brand-muted">Download a complete JSON record of all your visits and stamp awards</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadExport}
              isLoading={isExporting}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download JSON Export
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div>
              <h4 className="text-sm font-semibold text-brand-error">Delete Loyalty Account</h4>
              <p className="text-xs text-brand-muted">Permanently erase your wallet and close all active cards</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDeleteError(null);
                setDeleteConfirmationInput("");
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Permanent Account Deletion"
        description="This action cannot be undone. All active cards, collected stamps, and redemption history will be permanently deleted."
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
          {deleteError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-brand-error border border-red-200">
              {deleteError}
            </div>
          )}

          <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              To proceed with erasure under DPDP/GDPR regulations, type <strong>DELETE</strong> in the box below.
            </span>
          </div>

          <Input
            label='Type "DELETE" to confirm'
            value={deleteConfirmationInput}
            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
            placeholder="DELETE"
            required
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              isLoading={isDeleting}
              disabled={deleteConfirmationInput !== "DELETE"}
            >
              Permanently Erase My Account
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
