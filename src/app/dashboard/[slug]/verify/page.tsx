import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CounterVerifyClient } from "./client";

export const dynamic = "force-dynamic";

interface CounterVerifyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CounterVerifyPage({ params }: CounterVerifyPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      primaryColor: true,
      programs: {
        where: { status: "PUBLISHED" },
        take: 1,
        select: {
          id: true,
          name: true,
          cardTitle: true,
          totalStamps: true,
        },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // Pre-fetch recent successful verifications for this business
  const recentVerifications = await prisma.visitVerification.findMany({
    where: {
      status: "VERIFIED",
      enrollment: { businessId: business.id },
    },
    take: 5,
    orderBy: { verifiedAt: "desc" },
    select: {
      id: true,
      code: true,
      verifiedAt: true,
      enrollment: {
        select: {
          currentStamps: true,
          currentCycle: true,
          customer: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  return (
    <CounterVerifyClient
      businessId={business.id}
      businessName={business.name}
      businessSlug={business.slug}
      programTitle={business.programs[0]?.cardTitle || `${business.name} Loyalty`}
      totalStamps={business.programs[0]?.totalStamps || 5}
      recentVerifications={recentVerifications.map((v) => ({
        id: v.id,
        code: v.code,
        verifiedAt: v.verifiedAt ? v.verifiedAt.toISOString() : new Date().toISOString(),
        customerName: v.enrollment.customer.name,
        customerEmail: v.enrollment.customer.email,
        currentStamps: v.enrollment.currentStamps,
        currentCycle: v.enrollment.currentCycle || 1,
      }))}
    />
  );
}
