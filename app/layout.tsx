import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Canvas LM",
  description: "A Canvas App for Diagramming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/canvas">
      <html lang="en">
        <Analytics />
        <SpeedInsights />
        <body className={outfit.variable}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
