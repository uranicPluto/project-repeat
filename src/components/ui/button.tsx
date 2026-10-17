import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary: "bg-brand-blue text-white hover:bg-brand-blue-hover focus-visible:ring-brand-blue shadow-sm",
      secondary: "bg-brand-blue-light text-brand-blue hover:bg-blue-100 focus-visible:ring-brand-blue",
      outline: "border border-brand-border bg-white text-brand-navy hover:bg-gray-50 focus-visible:ring-brand-blue shadow-sm",
      ghost: "text-brand-muted hover:text-brand-navy hover:bg-gray-100 focus-visible:ring-brand-blue",
      destructive: "bg-brand-error text-white hover:bg-red-600 focus-visible:ring-brand-error shadow-sm",
      success: "bg-brand-success text-white hover:bg-emerald-600 focus-visible:ring-brand-success shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
