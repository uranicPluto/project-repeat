"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle,
  CreditCard,
  Users,
  Award,
  QrCode,
  BarChart3,
  UserCheck,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessSidebarProps {
  businessSlug: string;
  businessName: string;
  userRole?: string;
}

export function BusinessSidebar({ businessSlug, businessName, userRole = "STAFF" }: BusinessSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    {
      title: "Overview",
      href: `/dashboard/${businessSlug}`,
      icon: LayoutDashboard,
      exact: true,
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      title: "Verify Visits",
      href: `/dashboard/${businessSlug}/verify`,
      icon: CheckCircle,
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      title: "Card Builder",
      href: `/dashboard/${businessSlug}/card-builder`,
      icon: CreditCard,
      roles: ["OWNER", "MANAGER"],
    },
    {
      title: "Customers",
      href: `/dashboard/${businessSlug}/customers`,
      icon: Users,
      roles: ["OWNER", "MANAGER"],
    },
    {
      title: "Redemptions",
      href: `/dashboard/${businessSlug}/redemptions`,
      icon: Award,
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      title: "QR Code & Signage",
      href: `/dashboard/${businessSlug}/qr`,
      icon: QrCode,
      roles: ["OWNER", "MANAGER"],
    },
    {
      title: "Analytics",
      href: `/dashboard/${businessSlug}/analytics`,
      icon: BarChart3,
      roles: ["OWNER", "MANAGER"],
    },
    {
      title: "Staff Members",
      href: `/dashboard/${businessSlug}/staff`,
      icon: UserCheck,
      roles: ["OWNER"],
    },
    {
      title: "Billing & Plans",
      href: `/dashboard/${businessSlug}/billing`,
      icon: ShieldAlert,
      roles: ["OWNER"],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 border-r border-brand-border bg-white flex flex-col justify-between min-h-screen">
      <div className="p-5">
        {/* Business Selector / Header */}
        <div className="pb-5 border-b border-brand-border/70">
          <Link href={`/dashboard/${businessSlug}`} className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
              Business Portal
            </span>
            <h2 className="text-base font-bold text-brand-navy truncate mt-0.5">{businessName}</h2>
          </Link>
          <div className="mt-2 flex items-center justify-between text-xs text-brand-muted">
            <span className="rounded-md bg-brand-blue-light px-2 py-0.5 font-semibold text-brand-blue text-[10px]">
              {userRole}
            </span>
            <Link
              href={`/b/${businessSlug}`}
              target="_blank"
              className="flex items-center hover:text-brand-blue text-[11px]"
            >
              Live Card <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="mt-5 space-y-1">
          {filteredItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-blue text-white shadow-sm font-semibold"
                    : "text-brand-muted hover:text-brand-navy hover:bg-gray-100"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-brand-muted")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-brand-border/70">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-2.5 px-3 py-2 text-sm font-medium text-brand-muted hover:text-brand-error hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
