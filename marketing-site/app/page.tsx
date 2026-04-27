import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradeMate — AI-Powered Trade Intelligence",
  description:
    "Instant HS code classification, tariff analysis, and live shipping rates powered by AI. Built for the Pakistan–US trade corridor.",
};

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 68px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        className="bg-orb bg-orb-brand"
        style={{ width: "600px", height: "600px", top: "-200px", left: "-150px" }}
      />
      <div
        className="bg-orb bg-orb-accent"
        style={{ width: "400px", height: "400px", bottom: "-100px", right: "-100px" }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "720px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.375rem 1rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(59 130 246 / 0.3)",
            background: "rgba(59 130 246 / 0.08)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-brand-400)",
            marginBottom: "2rem",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent-500)", display: "inline-block" }} />
          Phase 1 Complete — Layout Shell Active
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
          }}
        >
          AI-Powered{" "}
          <span className="text-gradient">Trade Intelligence</span>
          {" "}for the Modern Trader
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
          }}
        >
          Instant HS code classification, tariff analysis with exemptions,
          live shipping rates, and AI-powered trade guidance — all in one
          conversational interface.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/contact"
            id="home-hero-cta-primary"
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "var(--shadow-glow)",
              transition: "all var(--transition-fast)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Request Demo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="/features"
            id="home-hero-cta-secondary"
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              fontWeight: 500,
              fontSize: "1rem",
              transition: "all var(--transition-fast)",
            }}
          >
            Explore Features
          </a>
        </div>
      </div>
    </div>
  );
}
