import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { ClerkProvider } from "@clerk/nextjs";
export const metadata: Metadata = {
  title: "Canvas LM",
  description: "A Canvas App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Analytics />
        <SpeedInsights />
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
