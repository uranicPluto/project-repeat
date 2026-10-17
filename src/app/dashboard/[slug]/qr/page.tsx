import { prisma } from "@/lib/db/prisma";
import { generateQrDataUrl, getBusinessJoinUrl } from "@/lib/qr/qrcode";
import { notFound } from "next/navigation";
import { QrClientView } from "./client";

export const dynamic = "force-dynamic";

interface QrPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessQrPage({ params }: QrPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  const joinUrl = getBusinessJoinUrl(business.slug);
  const qrDataUrl = await generateQrDataUrl(joinUrl);

  return (
    <QrClientView
      businessName={business.name}
      businessSlug={business.slug}
      category={business.category}
      joinUrl={joinUrl}
      qrDataUrl={qrDataUrl}
    />
  );
}
