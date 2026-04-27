import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TradeMate — AI-Powered Trade Intelligence",
    template: "%s | TradeMate",
  },
  description:
    "TradeMate is an AI-powered trade intelligence platform for instant HS code classification, tariff analysis, and shipping route optimization across Pakistan and the US.",
  keywords: [
    "HS code lookup",
    "tariff analysis",
    "trade intelligence",
    "shipping routes",
    "Pakistan PCT",
    "US HTS",
    "AI trade assistant",
    "freight calculator",
    "customs compliance",
  ],
  authors: [{ name: "TradeMate Team" }],
  creator: "TradeMate",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trademate.ai",
    siteName: "TradeMate",
    title: "TradeMate — AI-Powered Trade Intelligence",
    description:
      "Instant HS code classification, tariff analysis, and live shipping rates powered by AI. Built for the Pakistan–US trade corridor.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "TradeMate — AI Trade Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeMate — AI-Powered Trade Intelligence",
    description:
      "Instant HS code classification, tariff analysis, and live shipping rates powered by AI.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            paddingTop: "68px", /* offset for fixed navbar */
          }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
