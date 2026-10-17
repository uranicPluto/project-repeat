import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { CardBuilderClient } from "./client";

export const dynamic = "force-dynamic";

interface CardBuilderProps {
  params: Promise<{ slug: string }>;
}

export default async function CardBuilderPage({ params }: CardBuilderProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      programs: {
        where: { status: "PUBLISHED" },
        include: {
          rewards: {
            where: { isActive: true },
            orderBy: { stampsRequired: "asc" },
          },
        },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const program = business.programs[0];

  const initialData = {
    businessId: business.id,
    businessName: business.name,
    businessSlug: business.slug,
    programId: program?.id || "",
    name: program?.name || `${business.name} Rewards`,
    cardTitle: program?.cardTitle || `${business.name} Loyalty Card`,
    totalStamps: program?.totalStamps || 5,
    stampIcon: program?.stampIcon || "cup",
    primaryColor: business.primaryColor || "#315EFB",
    secondaryColor: business.secondaryColor || "#101828",
    terms: program?.terms || "",
    rewards: program?.rewards.map((r) => ({
      stampsRequired: r.stampsRequired,
      title: r.title,
      description: r.description || "",
      rewardType: r.rewardType as any,
      validityDays: r.validityDays,
    })) || [
      {
        stampsRequired: 5,
        title: "Complimentary Reward",
        description: "Redeem on your 5th visit",
        rewardType: "FREE_ITEM" as const,
        validityDays: 30,
      },
    ],
  };

  return <CardBuilderClient initialData={initialData} />;
}
