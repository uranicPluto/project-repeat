"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Compass, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { title: "My Wallet", href: "/wallet", icon: CreditCard },
    { title: "Explore", href: "/explore", icon: Compass },
    { title: "Account", href: "/account", icon: User },
  ];

  return (
    <div className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/wallet" className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue text-white font-bold text-xs">
            R
          </div>
          <span className="font-bold text-brand-navy text-sm">Loyalty Wallet</span>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-blue-light text-brand-blue font-semibold"
                    : "text-brand-muted hover:text-brand-navy"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="p-1.5 text-brand-muted hover:text-brand-error rounded-lg"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
