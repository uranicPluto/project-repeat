import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoyaltyCard } from "@/components/loyalty/loyalty-card";
import { PLAN_CATALOG } from "@/server/services/billing";
import {
  Sparkles,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Smartphone,
  BarChart3,
  Coffee,
  Scissors,
  Croissant,
  Dumbbell,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function HomePage() {
  const plans = Object.values(PLAN_CATALOG);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-brand-border/60 bg-gradient-to-b from-white via-brand-bg to-brand-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <Badge variant="blue" className="px-3 py-1 text-xs">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-brand-blue" />
                  House of Workflow Presents Project Repeat
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy leading-tight">
                  Turn One-Time Customers Into{" "}
                  <span className="text-brand-blue underline decoration-brand-blue/30">Repeat Customers</span>.
                </h1>

                <p className="text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  A simple, branded digital loyalty platform that helps local cafes, restaurants, bakeries, and salons
                  reward customers, encourage repeat visits, and understand customer engagement.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link href="/register-business" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto text-base font-semibold">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/b/the-coffee-house" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                      Try Live Customer Card
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-brand-muted">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-success" />
                    <span>No App Download Required</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-success" />
                    <span>Instant QR Code Setup</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-success" />
                    <span>Anti-Fraud Ledger</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Card Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md transform hover:scale-[1.01] transition-transform duration-300">
                  <LoyaltyCard
                    businessName="The Coffee House"
                    businessSlug="the-coffee-house"
                    cardTitle="Artisan Regulars Club"
                    primaryColor="#315EFB"
                    secondaryColor="#101828"
                    stampIcon="cup"
                    totalStamps={5}
                    currentStamps={3}
                    nextReward={{
                      title: "Complimentary Flat White",
                      stampsRemaining: 2,
                    }}
                    rewards={[
                      {
                        id: "r1",
                        title: "10% Off Any Pastry",
                        stampsRequired: 3,
                        isRedeemed: false,
                      },
                      {
                        id: "r2",
                        title: "Complimentary Flat White",
                        stampsRequired: 5,
                        isRedeemed: false,
                      },
                    ]}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM & SOLUTION SECTION */}
        <section className="py-16 md:py-24 bg-white border-b border-brand-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                The Loyalty Challenge
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                Paper punch cards get lost. Custom mobile apps are too expensive.
              </h2>
              <p className="text-brand-muted text-base sm:text-lg">
                Traditional customer retention is broken for independent businesses. Here is how Project Repeat bridges
                the gap with zero friction.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-brand-error/70">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-bold text-lg text-brand-navy">The Lost Paper Card</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    Paper cards clutter wallets, get forgotten at home, or run through the wash. Businesses get zero customer
                    analytics and no way to reconnect.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-amber-500/70">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-bold text-lg text-brand-navy">App Store Drop-Off</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    Expecting a customer to download a 50MB native mobile app while standing in line causes drop-offs.
                    Over 80% abandon registration at the counter.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-brand-blue">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-bold text-lg text-brand-navy">Project Repeat Solution</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    Customers scan your counter QR code once, save a beautiful branded card to their mobile browser,
                    and earn stamps in 2 seconds with fraud-proof verification.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-16 md:py-24 bg-brand-bg border-b border-brand-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Simple Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                Up and running in less than 5 minutes
              </h2>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                {
                  step: "01",
                  title: "Create Account",
                  desc: "Sign up your business and configure your custom brand colors.",
                },
                {
                  step: "02",
                  title: "Design Card",
                  desc: "Set stamp milestones (e.g. 5 or 10 stamps) and choose rewards.",
                },
                {
                  step: "03",
                  title: "Display QR",
                  desc: "Download and print your ready-made counter stand QR code.",
                },
                {
                  step: "04",
                  title: "Collect Stamps",
                  desc: "Customers scan, join in seconds, and collect stamps on purchase.",
                },
                {
                  step: "05",
                  title: "Redeem Rewards",
                  desc: "Staff verify visits and redeem earned rewards securely.",
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col rounded-2xl bg-white p-5 border border-brand-border shadow-card">
                  <span className="text-2xl font-black text-brand-blue">{item.step}</span>
                  <h3 className="mt-2 text-base font-bold text-brand-navy">{item.title}</h3>
                  <p className="mt-1 text-xs text-brand-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRY USE CASES */}
        <section className="py-16 md:py-24 bg-white border-b border-brand-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Tailored Experience</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                Built for everyday neighborhood businesses
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
                <Coffee className="h-8 w-8 text-brand-blue" />
                <h3 className="mt-4 font-bold text-brand-navy">Cafes & Coffee Bars</h3>
                <p className="mt-1 text-xs text-brand-muted">
                  Reward morning regulars with a 5th coffee free or discounted pastries.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
                <Croissant className="h-8 w-8 text-amber-500" />
                <h3 className="mt-4 font-bold text-brand-navy">Bakeries & Confectionery</h3>
                <p className="mt-1 text-xs text-brand-muted">
                  Encourage weekend visits with milestone bakery boxes and birthday treats.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
                <Scissors className="h-8 w-8 text-emerald-600" />
                <h3 className="mt-4 font-bold text-brand-navy">Salons & Barbers</h3>
                <p className="mt-1 text-xs text-brand-muted">
                  Keep grooming appointments on schedule with every 6th haircut discounted.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
                <Dumbbell className="h-8 w-8 text-purple-600" />
                <h3 className="mt-4 font-bold text-brand-navy">Fitness & Gym Studios</h3>
                <p className="mt-1 text-xs text-brand-muted">
                  Reward workout consistency and personal training renewals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-16 md:py-24 bg-brand-bg border-b border-brand-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                Transparent Plans
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                Affordable pricing tailored to your scale
              </h2>
              <p className="text-brand-muted text-base">
                All plans include a 14-day free trial. Cancel or upgrade anytime with zero hidden fees.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl bg-white p-8 border shadow-card ${
                    plan.isPopular ? "border-2 border-brand-blue ring-4 ring-brand-blue-light/50" : "border-brand-border"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="blue" className="px-3 py-1 font-bold text-xs uppercase shadow-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-brand-navy">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-brand-navy">₹{plan.priceMonthlyINR}</span>
                      <span className="ml-1 text-sm text-brand-muted font-medium">/month</span>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm text-brand-navy">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-brand-success flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Link href="/register-business">
                      <Button
                        variant={plan.isPopular ? "primary" : "outline"}
                        className="w-full font-semibold"
                      >
                        Start 14-Day Free Trial
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">FAQ</span>
              <h2 className="text-3xl font-bold text-brand-navy">Frequently Asked Questions</h2>
            </div>

            <div className="mt-12 space-y-6">
              {[
                {
                  q: "Do customers need to install an app from the App Store or Play Store?",
                  a: "No! Project Repeat is a progressive web experience. Customers simply scan your counter QR code once and their digital loyalty card opens immediately in their mobile browser.",
                },
                {
                  q: "How does the anti-fraud visit verification work?",
                  a: "Public QR codes only direct customers to your storefront. To claim a stamp at the counter, the customer's phone generates a secure 3-minute expiring 6-digit code which authorized staff verify.",
                },
                {
                  q: "Can I customize the stamp milestones and branding?",
                  a: "Yes! You can configure your business logo, primary and secondary brand colors, card titles, 5 or 10 stamp counts, custom stamp icons (coffee cup, star, gift), and custom rewards.",
                },
                {
                  q: "What payment methods are supported for subscriptions?",
                  a: "We support UPI, Net Banking, and Credit/Debit cards via Razorpay for businesses in India, as well as international billing options.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
                  <h3 className="text-base font-bold text-brand-navy flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-brand-blue flex-shrink-0" />
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm text-brand-muted leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
