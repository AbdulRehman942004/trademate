"use client";

import Link from "next/link";
import { footerLinks } from "@/lib/static-data";

const socialLinks = [
  {
    id: "footer-social-twitter",
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "footer-social-linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "footer-social-github",
    label: "GitHub",
    href: "https://github.com/AbdulRehman942004/trademate",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkHoverStyle = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
    },
  };

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-subtle)",
        paddingTop: "4rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="section-container">
        {/* ── Main Grid ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gap: "3rem",
            marginBottom: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand Column */}
          <div style={{ maxWidth: "300px" }}>
            <Link
              href="/"
              id="footer-logo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L15.5 5.5V12.5L9 16L2.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white" />
                </svg>
              </div>
              <span style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                Trade<span style={{ color: "var(--color-brand-400)" }}>Mate</span>
              </span>
            </Link>

            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              AI-powered trade intelligence for tariffs, HS codes, and global shipping routes. Built for the Pakistan–US trade corridor.
            </p>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "0.625rem" }}>
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  id={social.id}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-brand-400)";
                    e.currentTarget.style.borderColor = "var(--color-brand-500)";
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  marginBottom: "1rem",
                }}
              >
                {section.title}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      id={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                      style={{ fontSize: "0.875rem", color: "var(--text-muted)", transition: "color var(--transition-fast)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div>
            <h3
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Stay Updated
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
              Get trade intelligence insights and platform updates.
            </p>
            <form
              id="footer-newsletter-form"
              onSubmit={(e) => e.preventDefault()}
              style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}
            >
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="your@company.com"
                required
                aria-label="Email for newsletter"
                style={{
                  padding: "0.625rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-muted)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  outline: "none",
                  width: "100%",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-brand-500)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
              />
              <button
                type="submit"
                id="footer-newsletter-submit"
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-brand-600)",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "background var(--transition-fast)",
                  width: "100%",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-brand-500)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-brand-600)"; }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              © {currentYear} TradeMate. All rights reserved. Built as a Final Year Project.
            </p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Cookies", href: "/cookies" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`footer-legal-${item.label.toLowerCase()}`}
                  style={{ fontSize: "0.8125rem", color: "var(--text-muted)", transition: "color var(--transition-fast)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px)  { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; } }
      `}</style>
    </footer>
  );
}
