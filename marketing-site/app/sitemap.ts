import { MetadataRoute } from "next";

const siteUrl = "https://intellotrade.com";

const staticPages = [
  { url: "", lastModified: new Date(), priority: 1.0 },
  { url: "/about", lastModified: new Date(), priority: 0.9 },
  { url: "/features", lastModified: new Date(), priority: 0.9 },
  { url: "/solutions", lastModified: new Date(), priority: 0.9 },
  { url: "/pricing", lastModified: new Date(), priority: 0.8 },
  { url: "/contact", lastModified: new Date(), priority: 0.8 },
  { url: "/how-it-works", lastModified: new Date(), priority: 0.8 },
  { url: "/voice", lastModified: new Date(), priority: 0.7 },
  { url: "/docs", lastModified: new Date(), priority: 0.7 },
  { url: "/resources", lastModified: new Date(), priority: 0.7 },
  { url: "/blog", lastModified: new Date(), priority: 0.7 },
  { url: "/case-studies", lastModified: new Date(), priority: 0.7 },
  { url: "/use-cases", lastModified: new Date(), priority: 0.7 },
  { url: "/help", lastModified: new Date(), priority: 0.6 },
  { url: "/importers", lastModified: new Date(), priority: 0.7 },
  { url: "/exporters", lastModified: new Date(), priority: 0.7 },
  { url: "/freight-forwarders", lastModified: new Date(), priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: "weekly",
    priority: page.priority,
  }));
}