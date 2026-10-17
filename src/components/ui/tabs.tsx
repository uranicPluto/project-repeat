"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue: value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
}

export function TabList({ children, className, activeValue, onValueChange }: any) {
  return (
    <div className={cn("flex space-x-1 border-b border-brand-border p-1 bg-gray-50/70 rounded-lg", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const props = child.props as any;
          return React.cloneElement(child, {
            isSelected: props?.value === activeValue,
            onClick: () => onValueChange?.(props?.value),
          } as any);
        }
        return child;
      })}
    </div>
  );
}

export function TabTrigger({ value, isSelected, onClick, children, className }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
        isSelected
          ? "bg-white text-brand-blue shadow-sm font-semibold"
          : "text-brand-muted hover:text-brand-navy hover:bg-white/50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabContent({ value, activeValue, children, className }: any) {
  if (value !== activeValue) return null;
  return <div className={cn("pt-4 focus:outline-none", className)}>{children}</div>;
}
