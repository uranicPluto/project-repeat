import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CustomerNav } from "@/components/layout/customer-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { Shield, Bell, Download, Trash2, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?redirect=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      enrollments: {
        include: { business: true },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <CustomerNav />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
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
              <Input label="Name" defaultValue={user?.name} disabled />
              <Input label="Email Address" defaultValue={user?.email} disabled />
              <Input label="Phone Number" defaultValue={user?.phone || "Not provided"} disabled />
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
              <div className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-brand-bg">
                <div>
                  <span className="font-semibold text-brand-navy block">Transactional Visit Receipts</span>
                  <span className="text-xs text-brand-muted">Immediate stamp verification alerts</span>
                </div>
                <span className="text-xs font-bold text-brand-success flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Enabled
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-white">
                <div>
                  <span className="font-semibold text-brand-navy block">Promotional Campaigns &amp; Special Offers</span>
                  <span className="text-xs text-brand-muted">Opt-in notifications for double-stamp days and new rewards</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue"
                />
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
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1.5" />
                  Request Export
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-200 bg-red-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-brand-error">Delete Loyalty Account</h4>
                  <p className="text-xs text-brand-muted">Permanently erase your wallet and close all active cards</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
