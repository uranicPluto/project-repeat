import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { StaffManagementClient } from "./client";

export const dynamic = "force-dynamic";

interface StaffPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessStaffPage({ params }: StaffPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      memberships: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const staffList = business.memberships.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <StaffManagementClient
      businessId={business.id}
      businessSlug={business.slug}
      initialStaff={staffList}
    />
  );
}
