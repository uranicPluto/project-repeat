import { prisma } from "@/lib/db/prisma";
import { CustomerNav } from "@/components/layout/customer-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Store, ArrowRight, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const businesses = await prisma.business.findMany({
    where: { status: "ACTIVE" },
    include: {
      programs: {
        where: { status: "PUBLISHED" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <CustomerNav />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="pb-6 border-b border-brand-border/60">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Participating Businesses
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Explore local cafes, bakeries, salons, and restaurants with digital loyalty rewards
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {businesses.map((biz) => {
              const program = biz.programs[0];
              return (
                <Card key={biz.id} className="hover:shadow-dropdown transition-all">
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="blue">{biz.category}</Badge>
                        {program && (
                          <span className="text-xs font-semibold text-brand-muted">
                            {program.totalStamps} stamps card
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-brand-navy">{biz.name}</h3>
                      {biz.description && (
                        <p className="text-xs text-brand-muted line-clamp-2">{biz.description}</p>
                      )}
                      {biz.address && (
                        <p className="text-xs text-brand-muted flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-brand-blue flex-shrink-0" />
                          <span className="truncate">{biz.address}</span>
                        </p>
                      )}
                    </div>

                    <Link href={`/b/${biz.slug}`}>
                      <Button variant="outline" className="w-full text-xs font-semibold">
                        View Loyalty Card <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
