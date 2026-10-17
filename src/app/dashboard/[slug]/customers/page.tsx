import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { CustomersClientView } from "./client";

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

  const formattedEnrollments = enrollments.map((e) => ({
    id: e.id,
    customerName: e.customer.name,
    maskedEmail: maskEmail(e.customer.email),
    currentStamps: e.currentStamps,
    totalStamps: e.program.totalStamps,
    currentCycle: e.currentCycle || 1,
    lifetimeStamps: e.lifetimeStamps || e.currentStamps,
    visitCount: e.transactions.length,
    redemptionCount: e.redemptions.length,
    enrolledAt: e.enrolledAt.toISOString(),
  }));

  return (
    <CustomersClientView
      businessSlug={business.slug}
      businessName={business.name}
      initialEnrollments={formattedEnrollments}
    />
  );
}
