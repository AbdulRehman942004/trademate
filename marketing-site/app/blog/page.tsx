import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on trade intelligence, HS codes, tariffs, customs compliance, and global logistics. Stay updated with the latest in trade policy and regulations.",
};

const posts = [
  {
    id: "sro-changes-2024",
    title: "Understanding Pakistan's SRO Changes in 2024",
    excerpt:
      "A comprehensive guide to the new SROs effective in 2024, including changes to duty exemptions for automotive, electronics, and pharmaceutical sectors.",
    category: "Trade Policy",
    date: "December 15, 2024",
    readTime: "8 min read",
  },
  {
    id: "hs-code-basics",
    title: "HS Code Classification: The Complete Guide",
    excerpt:
      "Everything you need to know about Harmonized System codes, from 2-digit chapters to 12-digit subheadings, and how to correctly classify your products.",
    category: "Guides",
    date: "December 8, 2024",
    readTime: "12 min read",
  },
  {
    id: "us-pharma-tariffs",
    title: "US Tariff Analysis: Pharmaceutical Products",
    excerpt:
      "Deep dive into US HTS codes for pharmaceutical products, including Section 232 and 301 tariffs that often affect medicine imports.",
    category: "Tariff Analysis",
    date: "November 28, 2024",
    readTime: "6 min read",
  },
  {
    id: "ddp-vs-fob",
    title: "DDP vs FOB: Understanding Incoterms",
    excerpt:
      "Comparing Delivered Duty Paid (DDP) vs Free on Board (FOB) and when to use each for international trade transactions.",
    category: "Logistics",
    date: "November 20, 2024",
    readTime: "5 min read",
  },
  {
    id: "anti-dumping-guide",
    title: "Anti-Dumping Duties: What Importers Need to Know",
    excerpt:
      "Understanding anti-dumping duties, how they're calculated, and which products from specific countries are subject to ADD in Pakistan and the US.",
    category: "Compliance",
    date: "November 12, 2024",
    readTime: "7 min read",
  },
  {
    id: "gsp-guide",
    title: "GSP+ for Pakistan: Complete Eligibility Guide",
    excerpt:
      "How Pakistan's GSP+ status benefits exporters to the EU, including rules of origin requirements and which products qualify for duty-free access.",
    category: "Trade Policy",
    date: "November 5, 2024",
    readTime: "9 min read",
  },
];

const categories = [
  "All Posts",
  "Trade Policy",
  "Tariff Analysis",
  "Guides",
  "Logistics",
  "Compliance",
];

export default function BlogPage() {
  return (
    <div style={{ paddingBottom: "6rem" }}>
      {/* Hero */}
      <section
        style={{
          padding: "6rem 0 4rem",
          textAlign: "center",
        }}
      >
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
            Blog
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
            Insights on trade intelligence, tariffs, customs compliance, and global logistics.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="section-container">
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "3rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {categories.map((category, idx) => (
            <button
              key={category}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: idx === 0 ? "var(--color-brand-400)" : "var(--text-secondary)",
                background: idx === 0 ? "rgba(59 130 246 / 0.1)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Featured post */}
      <section className="section-container" style={{ marginBottom: "3rem" }}>
        <article
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "var(--bg-muted)",
              borderRadius: "var(--radius-lg)",
              height: "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-brand-400)",
                background: "rgba(59 130 246 / 0.1)",
                padding: "0.25rem 0.625rem",
                borderRadius: "var(--radius-full)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Featured
            </span>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              {posts[0].title}
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "1rem",
              }}
            >
              {posts[0].excerpt}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
              }}
            >
              <span>{posts[0].date}</span>
              <span>•</span>
              <span>{posts[0].readTime}</span>
            </div>
          </div>
        </article>
      </section>

      {/* Recent posts */}
      <section className="section-container">
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "1.5rem",
          }}
        >
          Recent Posts
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {posts.slice(1).map((post) => (
            <article
              key={post.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-brand-400)",
                    background: "rgba(59 130 246 / 0.1)",
                    padding: "0.25rem 0.625rem",
                    borderRadius: "var(--radius-full)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {post.category}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {post.readTime}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {post.excerpt}
              </p>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                }}
              >
                {post.date}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ padding: "2rem 0" }}>
        <div className="section-container">
          <div
            style={{
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              Stay Updated
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                maxWidth: "400px",
                margin: "0 auto 1.5rem",
              }}
            >
              Get the latest trade intelligence delivered to your inbox weekly.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                maxWidth: "400px",
                margin: "0 auto",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.9375rem",
                }}
              />
              <button
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "white",
                  background: "var(--color-brand-500)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}