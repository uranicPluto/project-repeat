"use client";

import * as React from "react";
import { StampGrid } from "./stamp-grid";
import { VerificationModal } from "./verification-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Gift, Sparkles, CheckCircle2, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoyaltyCardProps {
  enrollmentId?: string;
  businessName: string;
  businessSlug?: string;
  cardTitle: string;
  primaryColor?: string;
  secondaryColor?: string;
  stampIcon?: string;
  totalStamps: number;
  currentStamps: number;
  nextReward?: {
    title: string;
    stampsRemaining: number;
  } | null;
  rewards?: {
    id: string;
    title: string;
    description?: string | null;
    stampsRequired: number;
    isRedeemed?: boolean;
  }[];
  currentCycle?: number;
  lifetimeStamps?: number;
  isPreview?: boolean;
  onRefresh?: () => void;
}

export function LoyaltyCard({
  enrollmentId,
  businessName,
  businessSlug,
  cardTitle,
  primaryColor = "#315EFB",
  secondaryColor = "#101828",
  stampIcon = "cup",
  totalStamps = 5,
  currentStamps = 0,
  currentCycle = 1,
  lifetimeStamps = 0,
  nextReward,
  rewards = [],
  isPreview = false,
  onRefresh,
}: LoyaltyCardProps) {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = React.useState(false);

  const progressPercent = Math.min(100, Math.round((currentStamps / totalStamps) * 100));

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Header & Brand Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-card transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${secondaryColor} 0%, #1a2234 100%)`,
        }}
      >
        {/* Decorative subtle background circle */}
        <div
          className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-white/70 font-semibold">
                Digital Loyalty Card
              </span>
              {currentCycle > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-blue text-white shadow-sm">
                  Cycle #{currentCycle}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">{businessName}</h3>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold"
            style={{ color: primaryColor }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Card Title & Progress Bar */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-semibold text-white/90">{cardTitle}</h4>
            <span className="text-sm font-extrabold text-white">
              {currentStamps} <span className="text-xs font-normal text-white/60">/ {totalStamps} stamps</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: primaryColor,
              }}
            />
          </div>
        </div>

        {/* Interactive Stamp Grid */}
        <div className="mt-5">
          <StampGrid
            totalStamps={totalStamps}
            currentStamps={currentStamps}
            stampIcon={stampIcon}
            primaryColor={primaryColor}
          />
        </div>

        {/* Next Reward Milestone Alert */}
        {nextReward && nextReward.stampsRemaining > 0 ? (
          <div className="mt-4 flex items-center space-x-2.5 rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10 text-xs text-white/90">
            <Gift className="h-4 w-4 flex-shrink-0 text-amber-300" />
            <span>
              <strong className="text-white font-semibold">
                {nextReward.stampsRemaining} more {nextReward.stampsRemaining === 1 ? "stamp" : "stamps"}
              </strong>{" "}
              until <strong className="text-white underline decoration-white/40">{nextReward.title}</strong>!
            </span>
          </div>
        ) : currentStamps >= totalStamps ? (
          <div className="mt-4 flex items-center space-x-2.5 rounded-xl bg-emerald-500/20 backdrop-blur-sm p-3 border border-emerald-400/30 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-300" />
            <span>
              <strong className="text-white font-semibold">Card Completed!</strong> You have unlocked the top reward.
            </span>
          </div>
        ) : null}

        {/* Action Button: Verify at Counter */}
        {!isPreview && enrollmentId && (
          <div className="mt-5">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold shadow-lg"
              style={{ backgroundColor: primaryColor }}
              onClick={() => setIsVerifyModalOpen(true)}
            >
              <QrCode className="h-5 w-5 mr-2" />
              Claim Stamp at Counter
            </Button>
          </div>
        )}
      </div>

      {/* Reward Milestones Details */}
      {rewards.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-5 border border-brand-border shadow-card">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-muted flex items-center">
            <Award className="h-4 w-4 mr-1.5 text-brand-blue" />
            Milestone Rewards
          </h4>
          <div className="mt-3 space-y-2.5">
            {rewards.map((r) => {
              const isUnlocked = currentStamps >= r.stampsRequired;
              const isRedeemed = Boolean(r.isRedeemed);

              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-sm transition-colors",
                    isRedeemed
                      ? "bg-gray-50 border-gray-200 text-brand-muted"
                      : isUnlocked
                      ? "bg-brand-success-subtle border-emerald-200 text-emerald-900"
                      : "bg-white border-brand-border text-brand-navy"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{r.title}</span>
                    {r.description && <span className="text-xs text-brand-muted">{r.description}</span>}
                  </div>
                  <div>
                    {isRedeemed ? (
                      <Badge variant="outline">Redeemed</Badge>
                    ) : isUnlocked ? (
                      <Badge variant="success">Unlocked</Badge>
                    ) : (
                      <Badge variant="default">{r.stampsRequired} stamps</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {!isPreview && enrollmentId && (
        <VerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => {
            setIsVerifyModalOpen(false);
            onRefresh?.();
          }}
          enrollmentId={enrollmentId}
          businessName={businessName}
        />
      )}
    </div>
  );
}
