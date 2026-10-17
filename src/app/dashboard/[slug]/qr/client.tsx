"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, ExternalLink, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";

interface QrClientViewProps {
  businessName: string;
  businessSlug: string;
  category: string;
  joinUrl: string;
  qrDataUrl: string;
}

export function QrClientView({
  businessName,
  businessSlug,
  category,
  joinUrl,
  qrDataUrl,
}: QrClientViewProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${businessSlug}-counter-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-border/60 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
            Storefront &amp; Signage
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-0.5">
            Public QR Code &amp; Counter Stand
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Display this QR code at your checkout counter. Scanning opens your mobile loyalty storefront.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print Signage
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1.5" />
            Download PNG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Printable Stand Preview */}
        <div className="lg:col-span-7">
          <div
            id="printable-sign"
            className="rounded-3xl bg-white p-8 sm:p-12 border-2 border-brand-border text-center shadow-card space-y-6 max-w-md mx-auto"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                Digital Loyalty Program
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{businessName}</h2>
              <p className="text-xs text-brand-muted">Turn your visits into rewards!</p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border inline-block shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={`${businessName} Loyalty QR`} width={240} height={240} className="mx-auto" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-blue-light text-brand-blue text-xs font-bold uppercase tracking-wider">
                Scan with your phone camera
              </span>
              <p className="text-xs text-brand-muted">
                No app installation required. Works on iPhone &amp; Android.
              </p>
            </div>

            <div className="pt-4 border-t border-brand-border/60 text-[11px] text-brand-muted/80">
              Powered by <span className="font-semibold text-brand-navy">Project Repeat</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Link */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storefront URL</CardTitle>
              <CardDescription>Stable public link encoded into your counter QR</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-brand-bg border border-brand-border text-xs font-mono text-brand-navy break-all">
                {joinUrl}
              </div>

              <div className="flex items-center space-x-3">
                <Link href={`/b/${businessSlug}`} target="_blank" className="flex-1">
                  <Button variant="outline" className="w-full text-xs font-semibold">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open Public Storefront
                  </Button>
                </Link>
                <Button variant="primary" className="flex-1 text-xs font-semibold" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Save PNG
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Counter Signage Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-brand-muted leading-relaxed">
              <p>• Place the printout right beside the POS or payment terminal.</p>
              <p>• Have your staff mention: &quot;Scan to get your free loyalty card and start collecting stamps!&quot;</p>
              <p>• Re-printing or rotating your QR code does not affect existing customer progress.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
