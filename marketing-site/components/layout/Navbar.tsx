"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { navLinks } from "@/lib/static-data";
import { site } from "@/lib/site";

const APP_NAME = site.name;
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

const camelParts = APP_NAME.match(/^([A-Z][a-z]+)([A-Z][a-zA-Z]*)$/);
const [namePart1, namePart2] = camelParts ? [camelParts[1], camelParts[2]] : [APP_NAME, ""];

function DropdownMenu({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof navLinks)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={onToggle}
        style={{
          padding: "0.375rem 0.875rem",
          borderRadius: "var(--radius-full)",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--text-secondary)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          transition: "color var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
        }}
      >
        {item.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform var(--transition-fast)",
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && item.items && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "0.5rem",
            minWidth: "220px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: "0.5rem",
            animation: "fadeInUp 0.2s ease forwards",
            zIndex: 1000,
          }}
        >
          {item.items.map((subItem, idx) => (
            <Link
              key={idx}
              href={subItem.href}
              style={{
                display: "block",
                padding: "0.625rem 0.875rem",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {subItem.label}
              </div>
              {subItem.description && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "0.125rem",
                  }}
                >
                  {subItem.description}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
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
        background: scrolled ? "rgba(255, 255, 255, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
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
            {namePart1}
            <span style={{ color: "var(--color-brand-400)" }}>{namePart2}</span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.125rem",
          }}
          className="hidden-mobile"
        >
          {navLinks.map((link) => {
            if (link.items) {
              return (
                <DropdownMenu
                  key={link.label}
                  item={link}
                  isOpen={openDropdown === link.label}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === link.label ? null : link.label)
                  }
                />
              );
            }
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
                    (e.currentTarget as HTMLElement).style.background = "rgba(0 0 0 / 0.04)";
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

      {mobileOpen && (
        <div
          id="nav-mobile-menu"
          style={{
            background: "rgba(255, 255, 255, 0.98)",
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
            if (link.items) {
              return (
                <div key={link.label}>
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {link.label}
                  </div>
                  {link.items.map((subItem, idx) => (
                    <Link
                      key={idx}
                      href={subItem.href}
                      style={{
                        display: "block",
                        padding: "0.625rem 1rem 0.625rem 1.75rem",
                        fontSize: "0.9375rem",
                        color: "var(--text-secondary)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              );
            }
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