"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Store, Coffee, Scissors, Croissant, Dumbbell, Sparkles } from "lucide-react";

export default function RegisterBusinessPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = React.useState("");
  const [category, setCategory] = React.useState("Cafe & Coffee Shop");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const categories = [
    { label: "Cafe & Coffee Shop", icon: Coffee },
    { label: "Bakery & Pastry", icon: Croissant },
    { label: "Salon & Barber", icon: Scissors },
    { label: "Fitness & Gym", icon: Dumbbell },
    { label: "Restaurant & Diner", icon: Store },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category,
          name,
          email,
          password,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create business");
      }

      router.push(`/dashboard/${data.business.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white font-black text-lg">
            R
          </div>
          <span className="text-xl font-bold text-brand-navy">Project Repeat</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Launch Your Business Loyalty Program</h2>
        <p className="text-xs text-brand-muted">
          Start your 14-day free trial. Setup takes less than 2 minutes. No credit card required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-brand-error border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Business info */}
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider font-bold text-brand-blue flex items-center">
                  <Store className="h-3.5 w-3.5 mr-1.5" />
                  Step 1: Business Profile
                </span>

                <Input
                  label="Business Name"
                  placeholder="e.g. The Coffee House or Urban Cuts"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Business Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setCategory(cat.label)}
                          className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                            isSelected
                              ? "bg-brand-blue-subtle border-brand-blue text-brand-blue font-semibold shadow-sm"
                              : "bg-white border-brand-border text-brand-muted hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Owner Account */}
              <div className="pt-4 border-t border-brand-border/60 space-y-4">
                <span className="text-xs uppercase tracking-wider font-bold text-brand-blue flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Step 2: Owner Account
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    placeholder="Owner Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    placeholder="owner@business.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password (min 8 chars)"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" size="lg" className="w-full font-bold text-base" isLoading={isLoading}>
                  Launch Business Dashboard
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-brand-border/60 text-center text-xs text-brand-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-blue hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
