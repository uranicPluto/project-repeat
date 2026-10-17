"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Sparkles, QrCode } from "lucide-react";

export default function CounterVerifyPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [referenceCode, setReferenceCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch business info to get businessId
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const mem = data.user?.businessMemberships?.find((m: any) => m.businessSlug === slug);
        if (mem) {
          setBusinessId(mem.businessId);
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || code.length !== 6) return;

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/visits/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          businessId,
          referenceCode: referenceCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setResult(data.data);
      setCode("");
      setReferenceCode("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
          Staff Counter Terminal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
          Verify Customer Visit
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Enter the 6-digit verification code presented on the customer&apos;s phone to award an authentic stamp.
        </p>
      </div>

      <Card className="border-2 border-brand-border">
        <CardHeader>
          <CardTitle className="text-lg">Counter Stamp Verification</CardTitle>
          <CardDescription>
            Codes expire after 3 minutes to prevent duplicate stamp awards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-xs sm:text-sm text-brand-error border border-red-200 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="rounded-2xl bg-brand-success-subtle p-5 border border-emerald-200 space-y-2 text-center animate-in fade-in duration-300">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 text-brand-success flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">Stamp Awarded Successfully!</h3>
                <p className="text-xs sm:text-sm text-emerald-800">
                  Customer now has{" "}
                  <strong className="text-emerald-950 font-bold">
                    {result.currentStamps} of {result.totalStamps} stamps
                  </strong>
                  .
                </p>
                {result.hasReachedCardCompletion && (
                  <Badge variant="success" className="mt-2 text-xs font-bold uppercase">
                    🎉 Card Completed! Reward Unlocked!
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-3xl sm:text-4xl tracking-[0.3em] font-extrabold h-16 rounded-xl border-2 border-brand-border bg-brand-bg text-brand-navy focus:bg-white focus:border-brand-blue focus:outline-none transition-all"
              />
            </div>

            <Input
              label="Purchase Reference / Receipt # (Optional)"
              placeholder="e.g. REC-10492"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold text-base h-12"
              disabled={code.length !== 6 || !businessId}
              isLoading={isLoading}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Verify &amp; Award +1 Stamp
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
