import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Importers",
  description:
    "TradeMate helps importers streamline customs compliance, reduce landed costs, and ensure accurate HS code classification. Get instant tariff analysis and duty calculations.",
};

const benefits = [
  {
    id: "hsClassification",
    title: "Instant HS Classification",
    description: "Get accurate HS codes for any product in seconds. Our AI analyzes product descriptions, specifications, and materials to classify correctly.",
  },
  {
    id: "landedCost",
    title: "DDP Landed Cost Calculator",
    description: "Know your total cost before you buy. Calculate freight, insurance, customs duties, MPF, HMF, brokerage, and all other fees upfront.",
  },
  {
    id: "exemptions",
    title: "SRO Exemption Detection",
    description: "Automatically find applicable SRO exemptions and anti-dumping duties. Never overpay on duties you shouldn't owe.",
  },
  {
    id: "compliance",
    title: "Compliance Alerts",
    description: "Stay updated on regulatory changes. Get notified when duty rates change or new requirements affect your product category.",
  },
  {
    id: "supplierComparison",
    title: "Supplier & Origin Comparison",
    description: "Compare costs across different suppliers and countries. Find the most cost-effective sourcing strategy for your imports.",
  },
  {
    id: "documentGen",
    title: "Document Generation",
    description: "Generate compliant invoices, packing lists, and customs declarations. Export formatted documents for your freight forwarder.",
  },
];

const features = [
  {
    id: "aiChat",
    title: "AI Trade Chat",
    description: "Ask any question about tariffs, HS codes, or shipping in plain language. Get instant answers with citations.",
  },
  {
    id: "hsLookup",
    title: "HS Code Lookup",
    description: "Search by product name, description, or existing HS code. View full tariff schedules for Pakistan and US.",
  },
  {
    id: "tariffAnalysis",
    title: "Tariff Analysis",
    description: "Get detailed duty breakdowns including general duty, additional duties, cess, and regulatory fees.",
  },
  {
    id: "routePlanner",
    title: "Route Planner",
    description: "Compare shipping routes and get live freight quotes. Choose the most cost-effective option for your shipment.",
  },
  {
    id: "kgExplorer",
    title: "Knowledge Graph",
    description: "Explore relationships between HS codes, regulations, and trade agreements visually.",
  },
  {
    id: "docPipeline",
    title: "Document Pipeline",
    description: "Upload product specs for AI-powered classification and document generation.",
  },
];

const useCases = [
  {
    id: "electronics",
    title: "Electronics Import",
    description: "Classify laptops, phones, and components. Identify SRO exemptions for tech products.",
  },
  {
    id: "textiles",
    title: "Textile Import",
    description: "Classify fabrics and garments. Find quota restrictions and labeling requirements.",
  },
  {
    id: "machinery",
    title: "Machinery Import",
    description: "Identify capital goods exemptions. Calculate project costs for plant equipment.",
  },
  {
    id: "pharma",
    title: "Pharmaceutical Import",
    description: "Navigate DRAP requirements. Identify controlled substances and special permits.",
  },
];

export default function ImportersPage() {
  return (
    <div style={{ paddingBottom: "6rem" }}>
      {/* Hero */}
      <section style={{ padding: "6rem 0 4rem", textAlign: "center" }}>
        <div className="section-container">
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Trade Intelligence for Importers
          </h1>
          <p
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.25rem)",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
          >
            Classify products instantly, calculate accurate landed costs, and ensure
            customs compliance. Reduce duties and speed up clearance.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/contact"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-full)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
                boxShadow: "0 0 24px -4px rgba(59 130 246 / 0.5)",
                textDecoration: "none",
              }}
            >
              Request Demo
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-full)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                textDecoration: "none",
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-container">
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Why Importers Choose TradeMate
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: "500px",
            margin: "0 auto 2.5rem",
          }}
        >
          Everything you need to import smarter and cheaper.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {benefit.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "4rem 0" }}>
        <div className="section-container">
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Features Included
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              maxWidth: "500px",
              margin: "0 auto 2.5rem",
            }}
          >
            Full platform access for importers.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "1.25rem",
                  background: "var(--bg-muted)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ color: "var(--color-accent-500)", flexShrink: 0, marginTop: "0.125rem" }}
                >
                  <path
                    d="M7 10l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <h4
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {feature.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="section-container">
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Common Import Scenarios
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: "500px",
            margin: "0 auto 2.5rem",
          }}
        >
          TradeMate handles all major import categories.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {useCases.map((useCase) => (
            <div
              key={useCase.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                {useCase.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="section-container">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Start Importing Smarter
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto 2rem",
            }}
          >
            Get accurate HS codes and duty calculations in seconds.
          </p>
          <Link
            href="/contact"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-full)",
              fontSize: "1rem",
              fontWeight: 600,
              color: "white",
              background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
              boxShadow: "0 0 24px -4px rgba(59 130 246 / 0.5)",
              textDecoration: "none",
            }}
          >
            Request Demo
          </Link>
        </div>
      </section>
    </div>
  );
}