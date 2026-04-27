// components/pricing/PricingContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { pricingTiers } from "@/lib/static-data";
import type { PricingTier } from "@/lib/static-data";

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

// ── Check / cross icons ────────────────────────────────────────────────────
function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="var(--color-accent-500)" strokeOpacity="0.4" />
      <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--color-accent-500)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="var(--border-default)" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────
function TierCard({ tier, isAnnual }: { tier: PricingTier; isAnnual: boolean }) {
  const price = isAnnual ? tier.price.annual : tier.price.monthly;
  const isEnterprise = tier.id === "enterprise";
  const ctaHref = isEnterprise ? "/contact" : `${LOGIN_URL}/register`;

  return (
    <div
      style={{
        position: "relative",
        background: tier.isPopular ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.05))" : "var(--bg-surface)",
        border: tier.isPopular ? "1px solid rgba(59,130,246,0.35)" : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        boxShadow: tier.isPopular ? "var(--shadow-glow)" : "none",
      }}
    >
      {/* Popular badge */}
      {tier.badge && (
        <div
          style={{
            position: "absolute",
            top: "-13px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "0.25rem 1rem",
            borderRadius: "var(--radius-full)",
            background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {tier.badge}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.375rem", letterSpacing: "-0.025em" }}>
          {tier.name}
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.25rem" }}>
        <span
          style={{
            fontSize: "3rem",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: "var(--text-primary)",
          }}
        >
          ${price}
        </span>
        <div style={{ paddingBottom: "0.375rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.2 }}>/month</p>
          {isAnnual && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-accent-500)", fontWeight: 500 }}>
              billed annually
            </p>
          )}
        </div>
      </div>

      {/* CTA button */}
      {isEnterprise ? (
        <Link
          href={ctaHref}
          style={{
            display: "block",
            textAlign: "center",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: "0.9375rem",
            transition: "all var(--transition-fast)",
          }}
          className="tier-cta-outline"
        >
          {tier.cta}
        </Link>
      ) : (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-full)",
            background: tier.isPopular
              ? "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))"
              : "var(--bg-muted)",
            border: tier.isPopular ? "none" : "1px solid var(--border-subtle)",
            color: tier.isPopular ? "white" : "var(--text-primary)",
            fontWeight: 600,
            fontSize: "0.9375rem",
            boxShadow: tier.isPopular ? "0 0 20px -4px rgba(59,130,246,0.4)" : "none",
            transition: "all var(--transition-fast)",
          }}
          className={tier.isPopular ? "tier-cta-primary" : "tier-cta-secondary"}
        >
          {tier.cta}
        </a>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {tier.features.map((feat) => (
            <li
              key={feat.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                fontSize: "0.875rem",
                color: feat.included ? "var(--text-secondary)" : "var(--text-muted)",
              }}
            >
              <span style={{ flexShrink: 0, marginTop: "1px" }}>
                {feat.included ? <Check /> : <Cross />}
              </span>
              <span>
                {feat.label}
                {feat.note && (
                  <span
                    style={{
                      marginLeft: "0.375rem",
                      fontSize: "0.75rem",
                      color: "var(--color-brand-400)",
                      fontWeight: 500,
                    }}
                  >
                    ({feat.note})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PricingContent() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: "5rem",
          paddingBottom: "4rem",
          textAlign: "center",
        }}
      >
        <div className="bg-orb bg-orb-brand" style={{ width: "480px", height: "480px", top: "-180px", left: "-80px", opacity: 0.2 }} />
        <div className="bg-orb bg-orb-accent" style={{ width: "320px", height: "320px", bottom: "-60px", right: "-60px", opacity: 0.16 }} />

        <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.3125rem 0.875rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(59,130,246,0.3)",
              background: "rgba(59,130,246,0.07)",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--color-brand-400)",
              marginBottom: "1.75rem",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent-500)", display: "inline-block" }} />
            14-day free trial · No credit card required
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "1.25rem",
            }}
          >
            Simple,{" "}
            <span className="text-gradient">transparent pricing</span>
          </h1>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto 2.5rem",
            }}
          >
            Start with a free trial. Upgrade when you need more queries, live
            rates, or API access.
          </p>

          {/* ── Billing toggle ──────────────────────────────────────── */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.375rem",
              borderRadius: "var(--radius-full)",
              background: "var(--bg-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                padding: "0.375rem 1.25rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                background: !isAnnual ? "var(--bg-surface)" : "transparent",
                color: !isAnnual ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: !isAnnual ? "var(--shadow-sm)" : "none",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                padding: "0.375rem 1.25rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: isAnnual ? "var(--bg-surface)" : "transparent",
                color: isAnnual ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: isAnnual ? "var(--shadow-sm)" : "none",
              }}
            >
              Annual
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  padding: "0.125rem 0.5rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(16,185,129,0.15)",
                  color: "var(--color-accent-500)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────────────────── */}
      <section style={{ paddingBottom: "5rem" }}>
        <div className="section-container">
          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <TierCard key={tier.id} tier={tier} isAnnual={isAnnual} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Strip ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg-subtle)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "4rem 0",
        }}
      >
        <div className="section-container">
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Common questions
          </h2>
          <div className="faq-grid">
            {[
              {
                q: "Is there a free trial?",
                a: "Yes — both Starter and Professional include a 14-day free trial. No credit card required.",
              },
              {
                q: "What counts as an AI query?",
                a: "Each message you send to the AI agent counts as one query. Follow-up messages in the same conversation each count separately.",
              },
              {
                q: "Can I switch plans?",
                a: "Yes. You can upgrade or downgrade at any time. Upgrades are prorated. Downgrades take effect at the next billing cycle.",
              },
              {
                q: "What is the Freightos integration?",
                a: "Professional and Enterprise plans include real-time ocean and air freight spot quotes via the Freightos FaaS API — directly inside your chat responses.",
              },
              {
                q: "Is there an API for ERP integration?",
                a: "Professional includes 10,000 API requests/month. Enterprise includes unlimited requests plus webhook support.",
              },
              {
                q: "What is Enterprise pricing for large teams?",
                a: "Enterprise is $499/mo (or $399/mo billed annually) for unlimited seats. Contact us for custom contracts and volume discounts.",
              },
            ].map((item) => (
              <div
                key={item.q}
                style={{
                  padding: "1.5rem",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                }}
              >
                <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.625rem", fontSize: "0.9375rem" }}>
                  {item.q}
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 0", textAlign: "center" }}>
        <div className="section-container" style={{ maxWidth: "640px" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "1rem",
            }}
          >
            Need a custom plan?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Large customs brokerage? Logistics SaaS? We can tailor data coverage,
            SLAs, and contract terms to your operation.
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 2rem",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            Talk to Sales
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .pricing-grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .faq-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .faq-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .tier-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 0 28px -4px rgba(59,130,246,0.55) !important; }
        .tier-cta-secondary:hover { background: var(--bg-surface) !important; border-color: var(--border-default) !important; }
        .tier-cta-outline:hover { background: var(--bg-muted) !important; }
      `}</style>
    </>
  );
}
