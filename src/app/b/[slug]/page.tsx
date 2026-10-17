import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { LoyaltyCard } from "@/components/loyalty/loyalty-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { JoinButton } from "./join-button";

export const dynamic = "force-dynamic";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPublicPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  let business = null;
  let enrollment = null;
  let session = null;

  try {
    business = await prisma.business.findUnique({
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

    session = await getServerSession();
    const program = business?.programs[0];

    if (session && program) {
      enrollment = await prisma.loyaltyEnrollment.findUnique({
        where: {
          customerId_programId: {
            customerId: session.userId,
            programId: program.id,
          },
        },
        include: {
          redemptions: true,
        },
      });
    }
  } catch (err) {
    console.error("Database query failed:", err);
  }

  // Fallback demo data for instant preview when external DB is cold
  const FALLBACK_BUSINESSES: Record<string, any> = {
    "the-coffee-house": {
      id: "biz-coffee-house",
      name: "The Coffee House",
      slug: "the-coffee-house",
      category: "Cafe & Coffee Shop",
      description: "Artisan espresso bar, single-origin roasts, and fresh morning pastries.",
      address: "104 Indiranagar 100ft Road, Bengaluru",
      primaryColor: "#315EFB",
      secondaryColor: "#101828",
      programs: [
        {
          id: "prog-coffee-house",
          name: "Artisan Regulars Club",
          cardTitle: "Coffee Regulars Stamp Card",
          totalStamps: 5,
          stampIcon: "cup",
          status: "PUBLISHED",
          terms: "Receive 1 stamp per beverage purchase. Valid at all branches.",
          rewards: [
            {
              id: "rew-coffee-1",
              stampsRequired: 3,
              title: "15% Off Any Bakery Item",
              description: "Enjoy a discount on our croissants and sourdoughs",
              rewardType: "DISCOUNT_PERCENT",
              discountValue: 15,
            },
            {
              id: "rew-coffee-2",
              stampsRequired: 5,
              title: "Complimentary Coffee of Your Choice",
              description: "Any regular size espresso, pour-over, or cold brew",
              rewardType: "FREE_ITEM",
            },
          ],
        },
      ],
    },
    "urban-cuts": {
      id: "biz-urban-cuts",
      name: "Urban Cuts & Grooming",
      slug: "urban-cuts",
      category: "Salon & Barber",
      description: "Contemporary styling, luxury grooming, and beard craft.",
      address: "42 Church Street, Bengaluru",
      primaryColor: "#059669",
      secondaryColor: "#064E3B",
      programs: [
        {
          id: "prog-urban-cuts",
          name: "Grooming Club Card",
          cardTitle: "VIP Haircut & Spa Card",
          totalStamps: 6,
          stampIcon: "star",
          status: "PUBLISHED",
          terms: "1 stamp per appointment over ₹400.",
          rewards: [
            {
              id: "rew-salon-1",
              stampsRequired: 6,
              title: "50% Off Deluxe Haircut & Wash",
              description: "Half off any haircut service on your 6th visit",
              rewardType: "DISCOUNT_PERCENT",
              discountValue: 50,
            },
          ],
        },
      ],
    },
  };

  if (!business) {
    business = FALLBACK_BUSINESSES[slug];
  }

  if (!business) {
    notFound();
  }

  const program = business.programs[0];

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Business Hero Banner */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-brand-border shadow-card text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="blue" className="text-xs">
                {business.category}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{business.name}</h1>
              {business.description && (
                <p className="text-sm text-brand-muted max-w-xl">{business.description}</p>
              )}
              {business.address && (
                <div className="flex items-center text-xs text-brand-muted pt-1 justify-center sm:justify-start">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-brand-blue" />
                  <span>{business.address}</span>
                </div>
              )}
            </div>

            {/* Quick action button */}
            <div className="w-full sm:w-auto">
              {enrollment ? (
                <Link href="/wallet" className="w-full sm:w-auto block">
                  <Button variant="primary" size="lg" className="w-full font-bold">
                    Open in Your Wallet
                  </Button>
                </Link>
              ) : session ? (
                <JoinButton programId={program?.id} />
              ) : (
                <Link href={`/login?redirect=/b/${slug}`} className="w-full sm:w-auto block">
                  <Button variant="primary" size="lg" className="w-full font-bold">
                    Sign In to Join Card
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Loyalty Card Showcase */}
          {program ? (
            <div className="mt-8">
              <LoyaltyCard
                enrollmentId={enrollment?.id}
                businessName={business.name}
                businessSlug={business.slug}
                cardTitle={program.cardTitle}
                primaryColor={business.primaryColor}
                secondaryColor={business.secondaryColor}
                stampIcon={program.stampIcon}
                totalStamps={program.totalStamps}
                currentStamps={enrollment?.currentStamps || 0}
                nextReward={
                  program.rewards[0]
                    ? {
                        title: program.rewards[0].title,
                        stampsRemaining: Math.max(
                          0,
                          program.rewards[0].stampsRequired - (enrollment?.currentStamps || 0)
                        ),
                      }
                    : null
                }
                rewards={program.rewards.map((r: any) => ({
                  id: r.id,
                  title: r.title,
                  description: r.description,
                  stampsRequired: r.stampsRequired,
                  isRedeemed: enrollment?.redemptions.some((red: any) => red.rewardId === r.id),
                }))}
                isPreview={!enrollment}
              />
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-8 border border-brand-border text-center">
              <p className="text-sm text-brand-muted">This business is currently preparing their loyalty program.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
