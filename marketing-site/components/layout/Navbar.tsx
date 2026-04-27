"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { navLinks } from "@/lib/static-data";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "TradeMate";
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

// Split CamelCase names like "TradeMate" → ["Trade", "Mate"] for two-tone logo
const camelParts = APP_NAME.match(/^([A-Z][a-z]+)([A-Z][a-zA-Z]*)$/);
const [namePart1, namePart2] = camelParts ? [camelParts[1], camelParts[2]] : [APP_NAME, ""];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: "var(--z-nav)",
        transition: "background var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)",
        background: scrolled
          ? "rgba(8, 12, 20, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "1px solid transparent",
      }}
    >
      <div
        className="section-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "68px",
        }}
      >
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link
          href="/"
          id="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          {/* Icon mark */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 5.5V12.5L9 16L2.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            {namePart1}<span style={{ color: "var(--color-brand-400)" }}>{namePart2}</span>
          </span>
        </Link>

        {/* ── Desktop Nav ────────────────────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          className="hidden-mobile"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  padding: "0.375rem 0.875rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: isActive ? "var(--color-brand-400)" : "var(--text-secondary)",
                  background: isActive ? "rgba(59 130 246 / 0.1)" : "transparent",
                  transition: "color var(--transition-fast), background var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255 255 255 / 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop CTA ────────────────────────────────────────────────── */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="hidden-mobile"
        >
          <Link
            href={LOGIN_URL}
            id="nav-login-btn"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.4375rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
            }}
          >
            Log in
          </Link>
          <Link
            href="/contact"
            id="nav-demo-btn"
            style={{
              padding: "0.4375rem 1.125rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "white",
              background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
              boxShadow: "0 0 20px -4px rgba(59 130 246 / 0.5)",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px -4px rgba(59 130 246 / 0.65)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px -4px rgba(59 130 246 / 0.5)";
            }}
          >
            Request Demo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* ── Mobile Hamburger ────────────────────────────────────────────── */}
        <button
          id="nav-mobile-menu-btn"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          style={{
            display: "none",
            padding: "0.5rem",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
          className="show-mobile"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M6 6l10 10M16 6L6 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 7h14M4 11h14M4 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile Menu Drawer ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="nav-mobile-menu"
          style={{
            background: "rgba(8, 12, 20, 0.97)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border-subtle)",
            padding: "1.25rem 1.5rem 1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            animation: "fadeInUp 0.2s ease forwards",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: isActive ? "var(--color-brand-400)" : "var(--text-secondary)",
                  background: isActive ? "rgba(59 130 246 / 0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href={LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              Log in
            </Link>
            <Link
              href="/contact"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
                textAlign: "center",
              }}
            >
              Request Demo
            </Link>
          </div>
        </div>
      )}

      {/* ── Responsive Helpers (inline style tag) ─────────────────────── */}
      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </header>
  );
}
