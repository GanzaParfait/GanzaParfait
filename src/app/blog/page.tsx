import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine, RiQuillPenLine, RiRssLine } from "react-icons/ri";
import { blogPosts } from "@/data/site-data";
import BlogCard from "@/components/ui/BlogCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { buildPageMetadata } from "@/lib/seo";

const hasPosts = blogPosts.length > 0;

export const metadata: Metadata = buildPageMetadata({
  title: hasPosts ? "Insights | Prince Parfait GANZA" : "Insights (Coming Soon) | Prince Parfait GANZA",
  absoluteTitle: true,
  description: hasPosts
    ? "Notes on software, research technology and data systems by Prince Parfait GANZA, software engineer in Kigali, Rwanda."
    : "Insights from Prince Parfait GANZA are coming soon: notes on software, research technology and data systems from Kigali, Rwanda.",
  path: "/blog",
  noIndex: !hasPosts,
});

export default function BlogPage() {
  if (!hasPosts) {
    return (
      <section className="section insights-soon" aria-labelledby="insights-soon-title">
        <div className="container">
          <AnimatedSection>
            <div className="insights-soon-card">
              <span className="insights-soon-icon" aria-hidden="true">
                <RiQuillPenLine size={26} />
              </span>
              <p className="section-label">Insights</p>
              <h1 id="insights-soon-title">Coming soon.</h1>
              <p className="insights-soon-copy">
                Notes on software, research technology and data systems from Kigali, Rwanda. Until the first article
                is published, the case studies under Work are the best place to read about the work.
              </p>
              <div className="insights-soon-actions">
                <Link href="/projects" className="btn btn-primary">
                  Browse work <RiArrowRightLine size={16} aria-hidden="true" />
                </Link>
                <a href="#subscribe" className="btn btn-outline">
                  Get notified
                </a>
              </div>
              <p className="insights-soon-note">
                <RiRssLine size={14} aria-hidden="true" />
                <span>
                  New articles will also appear in the <a href="/feed.xml">RSS feed</a>.
                </span>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  const featuredPosts = blogPosts.filter((p) => p.featured);
  const otherPosts = blogPosts.filter((p) => !p.featured);

  return (
    <>
      <section className="section page-compact-hero" aria-label="Insights header">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Insights</p>
            <h1 className="theme-heading mb-4">Notes from the work.</h1>
            <p className="theme-copy text-lg leading-relaxed max-w-2xl">
              Software, research technology and data systems, written from Kigali, Rwanda.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="section pt-0" aria-label="Featured articles">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 80}>
                  <BlogCard post={post} featured />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {otherPosts.length > 0 && (
        <section className="section" aria-label="All articles">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherPosts.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 80}>
                  <BlogCard post={post} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
