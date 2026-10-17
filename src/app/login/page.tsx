"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      // If a specific redirect was requested (e.g., joining a business card), go there
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push(data.redirectTo || "/wallet");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-brand-error border border-red-200 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" className="w-full font-semibold" isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white font-black text-lg">
            R
          </div>
          <span className="text-xl font-bold text-brand-navy">Project Repeat</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Sign in to your account</h2>
        <p className="text-xs text-brand-muted">
          Access your digital loyalty wallet or business dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          <CardContent className="pt-6">
            <React.Suspense fallback={<div className="py-8 text-center text-xs text-brand-muted">Loading form...</div>}>
              <LoginForm />
            </React.Suspense>

            <div className="mt-6 pt-6 border-t border-brand-border/60 text-center space-y-2 text-xs text-brand-muted">
              <div>
                Are you a customer?{" "}
                <Link href="/register" className="font-semibold text-brand-blue hover:underline">
                  Create customer wallet
                </Link>
              </div>
              <div>
                Are you a business owner?{" "}
                <Link href="/register-business" className="font-semibold text-brand-blue hover:underline">
                  Register your business
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
