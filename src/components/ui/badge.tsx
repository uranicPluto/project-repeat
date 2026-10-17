import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "outline" | "blue";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-brand-text border-gray-200",
    success: "bg-brand-success-subtle text-brand-success border-emerald-200",
    warning: "bg-brand-warning-subtle text-brand-warning border-amber-200",
    error: "bg-brand-error-subtle text-brand-error border-red-200",
    blue: "bg-brand-blue-light text-brand-blue border-blue-200",
    outline: "bg-transparent text-brand-muted border-brand-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
