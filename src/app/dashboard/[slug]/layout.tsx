import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessAccess } from "@/lib/permissions/rbac";
import { BusinessSidebar } from "@/components/layout/business-sidebar";
import { notFound, redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { slug } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?redirect=/dashboard/${slug}`);
  }

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  // Enforce server-side tenant isolation
  let role = "STAFF";
  try {
    const access = requireBusinessAccess(session, business.id, ["OWNER", "MANAGER", "STAFF"]);
    role = access.businessRole;
  } catch {
    redirect("/wallet?error=access_denied");
  }

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <BusinessSidebar businessSlug={business.slug} businessName={business.name} userRole={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
