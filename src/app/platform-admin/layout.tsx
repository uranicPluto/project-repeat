import { getServerSession } from "@/lib/auth/session";
import { requirePlatformAdmin } from "@/lib/permissions/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Building2, CreditCard, Activity, ArrowLeft } from "lucide-react";

interface PlatformAdminLayoutProps {
  children: React.ReactNode;
}

export default async function PlatformAdminLayout({ children }: PlatformAdminLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?redirect=/platform-admin");
  }

  try {
    requirePlatformAdmin(session);
  } catch {
    redirect("/wallet?error=forbidden_admin_only");
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="border-b border-brand-border bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-xs">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold block">Platform Administration</span>
              <span className="text-[10px] text-white/60">House of Workflow Core Engine</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="text-white/80">
              Admin: <strong className="text-white">{session.email}</strong>
            </span>
            <Link href="/wallet" className="text-brand-blue-light hover:underline flex items-center">
              <ArrowLeft className="h-3 w-3 mr-1" /> Back to App
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
