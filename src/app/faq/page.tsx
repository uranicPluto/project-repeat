import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Do customers need to download an app from Google Play or Apple App Store?",
      a: "No! Project Repeat runs as a high-performance responsive web application. Customers scan a counter QR code, bookmark the web app to their home screen if they wish, and access their wallet anytime without app store logins or storage bloat.",
    },
    {
      q: "How does the platform prevent loyalty fraud and fake stamp awards?",
      a: "Our visit verification architecture relies on server-authoritative state. Static QR codes never grant stamps. Stamps are only awarded when staff enters an expiring, single-use 6-digit code or scans a dynamic token generated in real time on the customer's authenticated phone.",
    },
    {
      q: "Can I customize the stamp milestones (e.g. 5 stamps vs 10 stamps)?",
      a: "Yes. In the Card Builder, you can define whether your program has 3, 5, 8, 10, or up to 20 stamps, customize the stamp icon, and set intermediate or final rewards.",
    },
    {
      q: "Can one customer hold cards from multiple businesses?",
      a: "Yes! The customer's loyalty wallet cleanly isolates and displays cards from every participating business they have joined, each with its own brand colors, logo, and reward milestones.",
    },
    {
      q: "How are subscription payments processed?",
      a: "For businesses based in India, payments are processed securely via Razorpay supporting UPI, credit cards, and net banking. International payments use secure card processing adapters.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="blue">Knowledge Base</Badge>
            <h1 className="text-4xl font-extrabold text-brand-navy">Frequently Asked Questions</h1>
            <p className="text-base text-brand-muted">
              Everything you need to know about Project Repeat, setup, anti-fraud, and billing.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-brand-border shadow-card">
                <h3 className="text-base font-bold text-brand-navy flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-brand-blue flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm text-brand-muted leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
