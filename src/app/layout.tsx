import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Repeat — Digital Loyalty & Customer Retention Platform",
  description:
    "Turn one-time customers into repeat customers with simple, branded digital loyalty cards by House of Workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
