"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  businessName: string;
  onVerifiedSuccess?: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  enrollmentId,
  businessName,
  onVerifiedSuccess,
}: VerificationModalProps) {
  const [code, setCode] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(180); // in seconds
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchVerificationCode = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/visits/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate code");
      }
      setCode(data.code);
      const expiry = new Date(data.expiresAt);
      setExpiresAt(expiry);
      setTimeLeft(Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000)));

      // Generate dynamic QR code
      const QRCode = (await import("qrcode")).default;
      const qrUrl = await QRCode.toDataURL(data.code, {
        width: 240,
        margin: 1,
        color: { dark: "#101828", light: "#FFFFFF" },
      });
      setQrDataUrl(qrUrl);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  React.useEffect(() => {
    if (isOpen && enrollmentId) {
      fetchVerificationCode();
    } else {
      setCode(null);
      setQrDataUrl(null);
    }
  }, [isOpen, enrollmentId, fetchVerificationCode]);

  // Countdown timer
  React.useEffect(() => {
    if (!isOpen || !expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Visit"
      description={`Show this code to staff at ${businessName} to claim your stamp.`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-2 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="text-sm text-brand-muted">Generating secure verification code...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-brand-error border border-red-200">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchVerificationCode} className="mt-3">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* 6-Digit Code Display */}
            <div className="w-full rounded-2xl bg-brand-bg p-5 border border-brand-border/80">
              <span className="text-xs uppercase tracking-wider text-brand-muted font-semibold">
                Single-Use Verification Code
              </span>
              <div className="mt-2 flex justify-center items-center space-x-2">
                {code?.split("").map((digit, index) => (
                  <div
                    key={index}
                    className="flex h-12 w-10 sm:h-14 sm:w-12 items-center justify-center rounded-xl bg-white border-2 border-brand-border text-2xl sm:text-3xl font-extrabold text-brand-navy shadow-sm tracking-tight"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Timer badge */}
              <div className="mt-4 flex items-center justify-center space-x-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-brand-muted" />
                {isExpired ? (
                  <span className="font-semibold text-brand-error">Code Expired</span>
                ) : (
                  <span className="text-brand-muted font-medium">
                    Valid for:{" "}
                    <span className="font-bold text-brand-navy">
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic QR Code */}
            {qrDataUrl && !isExpired && (
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-xl border border-brand-border bg-white p-2 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="Verification QR Code" width={180} height={180} />
                </div>
                <p className="mt-2 text-xs text-brand-muted">Staff can scan this code or enter the 6 digits</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex w-full space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={fetchVerificationCode}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Refresh Code
              </Button>
              <Button variant="primary" className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
