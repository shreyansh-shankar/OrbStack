import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "The Last Deploy — Learn DevOps by fixing real systems",
  description:
    "An open-source DevOps learning platform. Complete hands-on labs on your own machine — no cloud fees, no fake terminals, no passive videos.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "The Last Deploy",
    description: "Learn DevOps by fixing real systems.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
