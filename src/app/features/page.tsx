import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  Palette,
  Users,
  BarChart3,
  QrCode,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile-First Digital Wallet",
      description:
        "No app store downloads or updates needed. Customers simply scan and bookmark their personalized digital cards.",
    },
    {
      icon: ShieldCheck,
      title: "Anti-Fraud Visit Verification",
      description:
        "Time-bounded 3-minute single-use codes and server-authoritative ledgers prevent counterfeit stamp claims.",
    },
    {
      icon: Palette,
      title: "Custom Brand & Card Builder",
      description:
        "Upload your logo, set your brand hex colors, choose custom stamp icons (coffee cup, star, gift), and set custom rewards.",
    },
    {
      icon: QrCode,
      title: "High-Resolution QR & Print Kit",
      description:
        "Export vector and PNG counter signage QR codes with one click for display on tables, counter stands, and receipts.",
    },
    {
      icon: Users,
      title: "Role-Based Staff Permissions",
      description:
        "Authorize counter staff to verify visits without exposing sensitive business billing, owner settings, or customer PII.",
    },
    {
      icon: BarChart3,
      title: "Actionable Retention Analytics",
      description:
        "Track repeat customer frequency, active loyalty members, and redemption velocities from real verified transactions.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="blue" className="px-3 py-1">Complete Feature Suite</Badge>
            <h1 className="text-4xl font-extrabold text-brand-navy">
              Everything you need to build customer retention
            </h1>
            <p className="text-lg text-brand-muted">
              Designed for speed at the counter, enterprise reliability behind the scenes, and delight for returning patrons.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-8 rounded-2xl bg-white border border-brand-border shadow-card flex flex-col justify-between">
                  <div>
                    <div className="h-12 w-12 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-brand-navy">{feat.title}</h3>
                    <p className="mt-2 text-sm text-brand-muted leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link href="/register-business">
              <Button size="lg" className="font-semibold px-8">
                Start Your 14-Day Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
