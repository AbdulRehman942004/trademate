// app/pricing/page.tsx
import type { Metadata } from "next";
import PricingContent from "@/components/pricing/PricingContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for TradeMate. Starter at $49/mo, Professional at $149/mo, and Enterprise at $499/mo. Annual plans save 20%.",
};

export default function PricingPage() {
  return <PricingContent />;
}
