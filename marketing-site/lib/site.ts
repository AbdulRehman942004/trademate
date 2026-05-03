export const site = {
  name: "IntelliTrade",
  shortName: "IntelliTrade",
  tagline: "AI-Powered Trade Intelligence",
  description:
    "AI-powered trade intelligence platform for instant HS code classification, tariff analysis, and shipping route optimization across Pakistan and the US.",
  url: "https://intellotrade.com",
  ogImage: "/images/og-image.png",
  twitter: "@intellotrade",
  email: "hello@intellotrade.com",
  phone: "+92-300-1234567",
  location: "Lahore, Pakistan",
  founded: "2024",
} as const;

export type Site = typeof site;
export default site;