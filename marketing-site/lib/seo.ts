import { Metadata } from "next";

const siteConfig = {
  name: "TradeMate",
  title: "TradeMate — AI-Powered Trade Intelligence",
  description:
    "Instant HS code classification, tariff analysis, and live shipping rates powered by AI. Built for the Pakistan–US trade corridor.",
  url: "https://trademate.ai",
  ogImage: "/images/og-image.png",
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
    "importexport",
    "trade compliance",
  ],
  authors: [{ name: "TradeMate Team" }],
};

type SeoMetadata = Partial<Metadata>;

interface PageSeoParams {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

export function generatePageSeo({
  title,
  description,
  path,
  image,
  noindex = false,
}: PageSeoParams): SeoMetadata {
  const fullTitle = title === siteConfig.name 
    ? siteConfig.title 
    : `${title} | ${siteConfig.name}`;
    
  const canonicalUrl = `${siteConfig.url}${path}`;
  const ogImageUrl = image ? `${siteConfig.url}${image}` : siteConfig.ogImage;

  return {
    title: fullTitle,
    description,
    keywords: siteConfig.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      "https://twitter.com/trademate",
      "https://linkedin.com/company/trademate",
      "https://github.com/trademate",
    ],
  };
}

export function generateWebappSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function generateProductSchema(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${siteConfig.name} - ${name}`,
    description,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "500",
    },
  };
}

export const site = siteConfig;
export default siteConfig;