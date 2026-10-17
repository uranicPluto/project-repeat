import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-white text-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white font-black text-sm">
                R
              </div>
              <span className="font-bold text-brand-navy text-base">Project Repeat</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Turn One-Time Customers Into Repeat Customers with simple, branded digital loyalty cards.
            </p>
            <p className="text-[11px] text-brand-muted/80">
              A product by <span className="font-semibold text-brand-navy">House of Workflow</span>.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-muted">
              <li><Link href="/features" className="hover:text-brand-blue transition-colors">Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-blue transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-brand-blue transition-colors">Pricing Plans</Link></li>
              <li><Link href="/faq" className="hover:text-brand-blue transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Industries</h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-muted">
              <li><span className="hover:text-brand-navy">Cafes & Coffee Shops</span></li>
              <li><span className="hover:text-brand-navy">Bakeries & Pastry</span></li>
              <li><span className="hover:text-brand-navy">Salons & Barber Shops</span></li>
              <li><span className="hover:text-brand-navy">Fitness & Gyms</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Legal & Trust</h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-muted">
              <li><Link href="/privacy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-blue transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-brand-blue transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} House of Workflow. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Enterprise-grade multi-tenant architecture & anti-fraud loyalty engine.</p>
        </div>
      </div>
    </footer>
  );
}
