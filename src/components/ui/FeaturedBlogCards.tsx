"use client";

import Link from "next/link";
import { RiArrowRightLine, RiTimeLine } from "react-icons/ri";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { BlogPost } from "@/data/site-data";

const categoryColors: Record<string, string> = {
  AI: "#0e52a8",
  Entrepreneurship: "#6366f1",
  "Software Engineering": "#0ea5e9",
  Leadership: "#10b981",
};

export default function FeaturedBlogCards({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="section" aria-label="Recent blog posts" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        <AnimatedSection style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p className="section-label">Blog</p>
            <h2 style={{ color: "var(--color-text)" }}>
              Thoughts &amp; <span className="hero-name-gradient">ideas.</span>
            </h2>
          </div>
          <Link href="/blog" className="btn btn-ghost" style={{ color: "var(--color-text-2)", fontWeight: 600 }}>
            All Posts <RiArrowRightLine size={16} />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, i) => {
            const accent = categoryColors[post.category] ?? "#0e52a8";
            return (
              <AnimatedSection key={post.id} delay={i * 120} direction="up">
                <Link
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <article
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "1.5rem",
                      overflow: "hidden",
                      transition: "all 0.4s ease",
                      boxShadow: "var(--shadow-sm)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="blog-card-hover"
                  >
                    {/* Color bar header */}
                    <div style={{
                      background: `linear-gradient(135deg, ${accent}15 0%, ${accent}08 100%)`,
                      borderBottom: "1px solid var(--color-border)",
                      padding: "2rem 2rem 1.5rem",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div aria-hidden="true" style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                        background: `linear-gradient(90deg, ${accent}, ${accent}60, transparent)`,
                      }} />
                      <div style={{
                        display: "inline-flex", alignItems: "center",
                        background: `${accent}18`, border: `1px solid ${accent}30`,
                        borderRadius: "9999px", padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem", fontWeight: 700,
                        color: accent, letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: "1rem",
                      }}>
                        {post.category}
                      </div>
                      <h3 style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "clamp(1.1rem, 2vw, 1.375rem)",
                        fontWeight: 800, color: "var(--color-text)",
                        lineHeight: 1.3, letterSpacing: "-0.02em",
                      }}>
                        {post.title}
                      </h3>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1.5rem 2rem 2rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <p style={{ color: "var(--color-text-2)", lineHeight: 1.75, fontSize: "0.9375rem", flex: 1 }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-3)", fontSize: "0.8125rem" }}>
                          <RiTimeLine size={14} />
                          {post.readTime}
                        </div>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          color: accent, fontSize: "0.875rem", fontWeight: 700,
                        }}>
                          Read more <RiArrowRightLine size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
