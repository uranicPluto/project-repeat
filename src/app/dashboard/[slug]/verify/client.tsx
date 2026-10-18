"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  QrCode,
  Gift,
  Award,
  Sparkles,
  Camera,
  History,
  RotateCcw,
} from "lucide-react";

interface RecentVerification {
  id: string;
  code: string;
  verifiedAt: string;
  customerName: string;
  customerEmail: string;
  currentStamps: number;
  currentCycle: number;
}

interface CounterVerifyClientProps {
  businessId: string;
  businessName: string;
  businessSlug: string;
  programTitle: string;
  totalStamps: number;
  recentVerifications: RecentVerification[];
}

export function CounterVerifyClient({
  businessId,
  businessName,
  businessSlug,
  programTitle,
  totalStamps,
  recentVerifications: initialRecent,
}: CounterVerifyClientProps) {
  const [code, setCode] = React.useState("");
  const [referenceCode, setReferenceCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [recentList, setRecentList] = React.useState<RecentVerification[]>(initialRecent);

  // Redemption state
  const [redeemingRewardId, setRedeemingRewardId] = React.useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = React.useState<any | null>(null);
  const [redemptionError, setRedemptionError] = React.useState<string | null>(null);

  // Scanner state
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [scannerSupported, setScannerSupported] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Check BarcodeDetector support
  React.useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      setScannerSupported(true);
    }
  }, []);

  const handleVerify = async (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault();
    const targetCode = overrideCode || code.trim().replace(/\D/g, "");

    if (targetCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setError(null);
    setResult(null);
    setRedemptionSuccess(null);
    setRedemptionError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/visits/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCode,
          businessId,
          businessSlug,
          referenceCode: referenceCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setResult(data.data);
      setCode("");
      setReferenceCode("");

      // Add to recent activity list
      const newEntry: RecentVerification = {
        id: data.data.transactionId || Date.now().toString(),
        code: targetCode,
        verifiedAt: new Date().toISOString(),
        customerName: "Verified Customer",
        customerEmail: `Card #${data.data.enrollmentId.slice(-6)}`,
        currentStamps: data.data.currentStamps,
        currentCycle: data.data.currentCycle || 1,
      };
      setRecentList((prev) => [newEntry, ...prev.slice(0, 4)]);

      // Close scanner if open
      stopScanner();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!businessId || !result?.enrollmentId) return;

    setRedeemingRewardId(rewardId);
    setRedemptionError(null);

    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: result.enrollmentId,
          rewardId,
          businessId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem reward");
      }

      setRedemptionSuccess(data.redemption);

      setResult((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          redeemableRewards: prev.redeemableRewards?.map((r: any) =>
            r.id === rewardId ? { ...r, isRedeemed: true } : r
          ),
        };
      });
    } catch (err: any) {
      setRedemptionError(err.message || "Failed to redeem reward");
    } finally {
      setRedeemingRewardId(null);
    }
  };

  // Camera QR scanner logic
  const startScanner = async () => {
    setIsScannerOpen(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const interval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const scannedRaw = barcodes[0].rawValue.trim();
              const digits = scannedRaw.replace(/\D/g, "");
              if (digits.length === 6) {
                clearInterval(interval);
                setCode(digits);
                handleVerify(undefined, digits);
              }
            }
          } catch {
            // Frame detection error, ignore
          }
        }, 500);
      }
    } catch (err: any) {
      setError("Unable to access camera. Please enter the 6-digit code manually.");
      setIsScannerOpen(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
  };

  React.useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
              Counter Terminal &bull; {businessName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
            Verify Customer Visit
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Enter the 6-digit code or scan the QR code from the customer&apos;s phone to award +1 stamp.
          </p>
        </div>
        <Badge variant="blue" className="self-start sm:self-auto text-xs py-1 px-3">
          {programTitle} ({totalStamps} stamps)
        </Badge>
      </div>

      {/* Main Terminal Card */}
      <Card className="border-2 border-brand-border shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Counter Stamp Verification</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Codes refresh every 3 minutes for anti-fraud protection
              </CardDescription>
            </div>
            {scannerSupported && !isScannerOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={startScanner}
                className="text-xs h-8 gap-1.5"
              >
                <Camera className="h-3.5 w-3.5 text-brand-blue" />
                Scan QR
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Live Camera Scanner View */}
          {isScannerOpen && (
            <div className="rounded-2xl overflow-hidden border-2 border-brand-blue bg-black relative p-2 text-center">
              <video
                ref={videoRef}
                className="w-full max-h-64 object-cover rounded-xl mx-auto"
                playsInline
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-brand-blue border-dashed rounded-xl animate-pulse" />
              </div>
              <div className="flex justify-between items-center px-2 pt-2">
                <span className="text-[11px] text-white/80">Point camera at customer&apos;s QR code</span>
                <Button variant="outline" size="sm" onClick={stopScanner} className="h-7 text-xs bg-white/90">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-xs sm:text-sm text-brand-error border border-red-200 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-red-600">
                  Tip: Ask the customer to open their loyalty card on their phone and tap &quot;Claim Stamp at Counter&quot; for the active 6-digit code.
                </p>
              </div>
            </div>
          )}

          {/* Verification Success Display */}
          {result && (
            <div className="rounded-2xl bg-brand-success-subtle p-5 border border-emerald-200 space-y-3 text-center animate-in fade-in duration-300">
              <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 text-brand-success flex items-center justify-center shadow-sm">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  Stamp Awarded Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                  Customer now has{" "}
                  <strong className="text-emerald-950 font-bold">
                    {result.currentStamps} of {result.totalStamps} stamps
                  </strong>{" "}
                  {result.currentCycle > 1 ? `(Cycle #${result.currentCycle})` : ""}.
                </p>
                <p className="text-[11px] text-emerald-700/80 mt-1">
                  Lifetime Stamps: {result.lifetimeStamps} &bull; Reference: {result.transactionId?.slice(-8)}
                </p>
              </div>

              {result.hasReachedCardCompletion && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm">
                  🎉 Card Completed! Top Milestone Reached!
                </div>
              )}

              {/* Redeemable Perks Section */}
              {result.redeemableRewards && result.redeemableRewards.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/60 text-left space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-950 flex items-center">
                    <Gift className="h-4 w-4 mr-1.5 text-emerald-700" />
                    Eligible Customer Perks Unlocked
                  </h4>

                  {redemptionSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-100 text-xs font-semibold text-emerald-950 border border-emerald-300">
                      ✓ Perk Claimed! Auth Code: <strong>{redemptionSuccess.redemptionCode || "RDM-CLAIMED"}</strong>
                    </div>
                  )}

                  {redemptionError && (
                    <div className="p-3 rounded-xl bg-red-50 text-xs font-semibold text-brand-error border border-red-200">
                      {redemptionError}
                    </div>
                  )}

                  <div className="space-y-2">
                    {result.redeemableRewards.map((reward: any) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 text-xs"
                      >
                        <div>
                          <span className="font-bold text-brand-navy block">{reward.title}</span>
                          <span className="text-[11px] text-brand-muted">
                            Threshold: {reward.stampsRequired} stamps
                          </span>
                        </div>
                        <div>
                          {reward.isRedeemed ? (
                            <Badge variant="outline">Redeemed</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-xs h-8 px-3 font-semibold"
                              isLoading={redeemingRewardId === reward.id}
                              onClick={() => handleRedeemReward(reward.id)}
                            >
                              Authorize Perk
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Code Input Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                Customer 6-Digit Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  required
                  value={code}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(clean);
                    if (clean.length === 6 && !isLoading) {
                      handleVerify(undefined, clean);
                    }
                  }}
                  className="w-full text-center text-3xl sm:text-4xl tracking-[0.4em] font-extrabold h-16 rounded-xl border-2 border-brand-border bg-brand-bg text-brand-navy focus:bg-white focus:border-brand-blue focus:outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] text-brand-muted text-center">
                Type the 6 digits displayed on the customer&apos;s phone screen
              </p>
            </div>

            <Input
              label="Receipt # / Note (Optional)"
              placeholder="e.g. BILL-49102"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold text-base h-12 shadow-sm"
              disabled={code.replace(/\D/g, "").length !== 6 || isLoading}
              isLoading={isLoading}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Verify &amp; Award +1 Stamp
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Counter Activity Feed */}
      <Card className="border border-brand-border">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-bold flex items-center text-brand-navy">
            <History className="h-4 w-4 mr-2 text-brand-blue" />
            Recent Counter Verifications
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentList.length === 0 ? (
            <p className="text-xs text-brand-muted py-3 text-center">
              No visits verified today yet. As patrons present their 6-digit codes at the counter, verified visits appear here in real time.
            </p>
          ) : (
            <div className="divide-y divide-brand-border/60">
              {recentList.map((entry) => (
                <div key={entry.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-brand-navy block">
                      {entry.customerName}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      Code: <strong className="text-brand-navy font-mono">{entry.code}</strong> &bull;{" "}
                      {new Date(entry.verifiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" className="text-[11px]">
                      {entry.currentStamps}/{totalStamps} Stamps
                    </Badge>
                    {entry.currentCycle > 1 && (
                      <span className="block text-[10px] text-brand-muted font-bold mt-0.5">
                        Cycle #{entry.currentCycle}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
