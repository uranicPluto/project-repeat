import * as React from "react";
import { StampIcon } from "./stamp-icon";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StampGridProps {
  totalStamps: number;
  currentStamps: number;
  stampIcon?: string;
  primaryColor?: string;
  className?: string;
}

export function StampGrid({
  totalStamps = 5,
  currentStamps = 0,
  stampIcon = "cup",
  primaryColor = "#315EFB",
  className,
}: StampGridProps) {
  const stamps = Array.from({ length: totalStamps }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-brand-border/80 shadow-inner",
        totalStamps <= 6 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-4 sm:grid-cols-5",
        className
      )}
    >
      {stamps.map((stampNum) => {
        const isCompleted = stampNum <= currentStamps;
        const isNext = stampNum === currentStamps + 1;
        const isFinal = stampNum === totalStamps;

        return (
          <div
            key={stampNum}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300",
              isCompleted
                ? "bg-brand-blue-subtle border-brand-blue shadow-sm scale-100"
                : isNext
                ? "bg-white border-dashed border-brand-blue/60 animate-pulse"
                : "bg-gray-50/70 border-gray-200 opacity-60"
            )}
            style={{
              borderColor: isCompleted ? primaryColor : undefined,
              backgroundColor: isCompleted ? `${primaryColor}12` : undefined,
            }}
          >
            <div className="relative">
              <StampIcon
                icon={isFinal ? "gift" : stampIcon}
                isCompleted={isCompleted}
                color={primaryColor}
                className={cn("w-7 h-7 sm:w-8 sm:h-8", isCompleted && "transform scale-105")}
              />
              {isCompleted && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white text-[10px]"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
            <span
              className={cn(
                "mt-1 text-[11px] font-semibold tracking-wide",
                isCompleted ? "text-brand-navy" : "text-brand-muted"
              )}
            >
              {isFinal ? "Reward" : `#${stampNum}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
