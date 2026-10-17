import { getServerSession } from "@/lib/auth/session";
import { LoyaltyService } from "@/server/services/loyalty";
import { CustomerNav } from "@/components/layout/customer-nav";
import { LoyaltyCard } from "@/components/loyalty/loyalty-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, Compass, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?redirect=/wallet");
  }

  let cards: any[] = [];
  try {
    cards = await LoyaltyService.getCustomerWallet(session.userId);
  } catch (err) {
    console.error("Wallet cards fetch error:", err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <CustomerNav />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                Welcome back, {session.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
                My Loyalty Cards
              </h1>
            </div>
            <Link href="/explore">
              <Button variant="outline" size="sm">
                <Compass className="h-4 w-4 mr-1.5" />
                Discover Businesses
              </Button>
            </Link>
          </div>

          {/* Cards List or Empty State */}
          <div className="mt-8 space-y-8">
            {cards.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center border border-brand-border shadow-card max-w-lg mx-auto space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">Your wallet is currently empty</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  You haven&apos;t joined any business loyalty programs yet. Scan a counter QR code at your favorite local
                  cafe, bakery, or salon to start earning stamps!
                </p>
                <div className="pt-2">
                  <Link href="/explore">
                    <Button variant="primary">
                      <Compass className="h-4 w-4 mr-2" />
                      Browse Participating Businesses
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              cards.map((card) => (
                <div key={card.enrollmentId} className="transition-transform duration-200">
                  <LoyaltyCard
                    enrollmentId={card.enrollmentId}
                    businessName={card.businessName}
                    businessSlug={card.businessSlug}
                    cardTitle={card.cardTitle}
                    primaryColor={card.primaryColor}
                    secondaryColor={card.secondaryColor}
                    stampIcon={card.stampIcon}
                    totalStamps={card.totalStamps}
                    currentStamps={card.currentStamps}
                    nextReward={card.nextReward}
                    rewards={card.availableRewards}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
