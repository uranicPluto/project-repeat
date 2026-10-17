import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 md:py-24 bg-brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="blue">Get in Touch</Badge>
            <h1 className="text-4xl font-extrabold text-brand-navy">Contact House of Workflow</h1>
            <p className="text-base text-brand-muted">
              Have questions about Project Repeat, custom enterprise deployments, or hardware inquiries?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-brand-border shadow-card space-y-6">
              <h3 className="text-lg font-bold text-brand-navy">Support & Inquiries</h3>
              <div className="space-y-4 text-sm text-brand-muted">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-brand-navy block">Email</span>
                    <span>support@houseofworkflow.com</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-brand-navy block">Headquarters</span>
                    <span>House of Workflow Technology Labs, Bengaluru, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-brand-border shadow-card space-y-4">
              <h3 className="text-lg font-bold text-brand-navy">Send us a message</h3>
              <Input label="Your Name" placeholder="Jane Doe" />
              <Input label="Business Email" type="email" placeholder="jane@business.com" />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="How can we assist your business?"
                />
              </div>
              <Button className="w-full font-semibold">Send Inquiry</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
