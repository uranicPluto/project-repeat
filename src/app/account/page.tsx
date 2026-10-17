import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CustomerNav } from "@/components/layout/customer-nav";
import { AccountClientView } from "./client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?redirect=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  const consent = await prisma.customerConsent.findFirst({
    where: { customerId: session.userId },
  });

  const userData = {
    id: user?.id || session.userId,
    name: user?.name || session.name,
    email: user?.email || session.email,
    phone: user?.phone,
    marketingEmail: consent?.marketingEmail ?? false,
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <CustomerNav />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AccountClientView user={userData} />
        </div>
      </main>
    </div>
  );
}
