import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-navy placeholder:text-brand-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-brand-error focus-visible:ring-brand-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-brand-muted">{helperText}</p>}
        {error && <p className="text-xs font-medium text-brand-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
