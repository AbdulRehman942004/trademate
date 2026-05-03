import type { Metadata } from "next";
import Link from "next/link";
import { platformStats, features, testimonials } from "@/lib/static-data";

export const metadata: Metadata = {
  title: "TradeMate — AI-Powered Trade Intelligence",
  description:
    "Instant HS code classification, tariff analysis, and live shipping rates powered by AI. Built for the Pakistan–US trade corridor.",
};

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "calc(100vh - 68px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "6rem 1.5rem 4rem",
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
        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
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
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent-500)", display: "inline-block" }} />
            Trusted by 500+ Trading Companies
          </div>

          <h1
            style={{
              fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            AI-Powered{" "}
            <span className="text-gradient">Trade Intelligence</span>
            {" "}for Modern Traders
          </h1>

          <p
            style={{
              fontSize: "clamp(1.0625rem, 2vw, 1.25rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
            }}
          >
            Classify HS codes instantly, calculate accurate landed costs, and navigate complex
            tariffs — all through natural conversation. Built for importers, exporters, and freight
            forwarders.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/contact"
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "var(--shadow-glow)",
                textDecoration: "none",
              }}
            >
              Request Demo
            </Link>
            <Link
              href="/features"
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontWeight: 500,
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "3rem 0", background: "var(--bg-subtle)" }}>
        <div className="section-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            {platformStats.slice(0, 6).map((stat) => (
              <div key={stat.id}>
                <div
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                    fontWeight: 700,
                    color: "var(--color-brand-400)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.value}
                  <span style={{ fontSize: "0.5em" }}>{stat.suffix}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section style={{ padding: "6rem 0" }}>
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              Everything You Need to Trade Smarter
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              From HS code classification to live shipping rates, all in one AI-powered platform.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {features.slice(0, 6).map((feature) => (
              <div
                key={feature.id}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(59 130 246 / 0.1)",
                    color: "var(--color-brand-400)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
                    <path d="M12 22V12M12 12l9-5M12 12l-9 5" />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {feature.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              href="/features"
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--color-brand-400)",
                textDecoration: "none",
              }}
            >
              View All Features →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "6rem 0", background: "var(--bg-subtle)" }}>
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              How It Works
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Get started in seconds. Just ask TradeMate your trade question.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                step: "01",
                title: "Ask Your Question",
                description: "Type or speak your trade question in natural language. No forms or dropdowns.",
              },
              {
                step: "02",
                title: "AI Processes Instantly",
                description: "TradeMate searches knowledge graphs, tariff databases, and live shipping rates.",
              },
              {
                step: "03",
                title: "Get Detailed Answers",
                description: "Receive instant answers with citations, calculations, and actionable next steps.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--color-brand-400)",
                    marginBottom: "1rem",
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section style={{ padding: "6rem 0" }}>
        <div className="section-container">
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "1rem",
                }}
              >
                Try TradeMate Now
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                See how TradeMate answers real trade questions. Try these examples:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  "What's the HS code for lithium batteries?",
                  "Compare shipping Karachi to Los Angeles",
                  "What duties apply to textile exports to US?",
                ].map((q, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "0.75rem 1rem",
                      background: "var(--bg-muted)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.9375rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    "{q}"
                  </li>
                ))}
              </ul>
            </div>
            <div
              style={{
                background: "var(--bg-muted)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                minHeight: "300px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M8 1l6 3.5v6L8 14l-6-4.5v-6L8 1z" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>TradeMate</span>
              </div>
              <div style={{ padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>What's the HS code for laptops?</span>
              </div>
              <div style={{ padding: "1rem", background: "rgba(16 185 129 / 0.1)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--color-accent-500)" }}>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
                  The HS code for laptops is <strong>8471.30</strong> (US HTS) / <strong>8471.30</strong> (Pakistan PCT).
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  US Rate: 0% (most-favored nation) • PK Rate: 16% + RD
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "6rem 0", background: "var(--bg-subtle)" }}>
        <div className="section-container">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "2.5rem",
              textAlign: "center",
            }}
          >
            Trusted by Industry Leaders
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {testimonials.slice(0, 3).map((t) => (
              <div
                key={t.id}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="var(--color-brand-400)">
                      <path d="M8 1l2.2 4.5 5 .7-3.6 3.5.8 5L8 12.3 3.6 14.7l.8-5L.8 6.2l5-.7L8 1z" />
                    </svg>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    marginBottom: "1.25rem",
                  }}
                >
                  "{t.quote}"
                </p>
                <div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {t.author}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {t.title}, {t.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="section-container">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Ready to Trade Smarter?
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto 2rem",
            }}
          >
            Join 500+ trading companies already using TradeMate to streamline their operations.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/contact"
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "var(--shadow-glow)",
                textDecoration: "none",
              }}
            >
              Request Demo
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontWeight: 500,
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}