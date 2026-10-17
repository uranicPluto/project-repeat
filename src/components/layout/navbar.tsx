"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-sm font-black">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-brand-navy tracking-tight leading-tight">
              Project Repeat
            </span>
            <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">
              by House of Workflow
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-brand-muted">
          <Link href="/features" className="hover:text-brand-navy transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-brand-navy transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="hover:text-brand-navy transition-colors">
            Pricing
          </Link>
          <Link href="/faq" className="hover:text-brand-navy transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center space-x-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register-business">
            <Button variant="primary" size="sm">
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-brand-muted hover:text-brand-navy"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-white px-4 pt-2 pb-6 space-y-3 shadow-dropdown">
          <Link
            href="/features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-navy hover:text-brand-blue"
          >
            Features
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-navy hover:text-brand-blue"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-navy hover:text-brand-blue"
          >
            Pricing
          </Link>
          <Link
            href="/faq"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-navy hover:text-brand-blue"
          >
            FAQ
          </Link>
          <div className="pt-3 border-t border-brand-border flex flex-col space-y-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/register-business" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
