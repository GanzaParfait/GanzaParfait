import type { Metadata } from "next";
import { siteConfig, blogPosts } from "@/data/site-data";
import BlogCard from "@/components/ui/BlogCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import NewsletterForm from "@/components/ui/NewsletterForm";
import BlogFilter from "@/components/ui/BlogFilter";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on AI, software engineering, entrepreneurship, and building technology products in Africa, by Prince Parfait GANZA.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Blog — Prince Parfait GANZA",
    description:
      "Articles on AI, software engineering, entrepreneurship, and building in Africa.",
    url: `${siteConfig.url}/blog`,
  },
};

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((p) => p.featured);
  const otherPosts = blogPosts.filter((p) => !p.featured);

  return (
    <>
      {/* Header */}
      <section className="section pt-32 pb-10 relative dot-grid overflow-hidden" aria-label="Blog header">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Writing</p>
            <h1 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Thoughts &amp; ideas.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              I write about AI, software engineering, entrepreneurship, and what
              it means to build technology that matters. Honest, practical, and
              human-first.
            </p>
          </AnimatedSection>

          {/* Category filters */}
          <AnimatedSection delay={150}>
            <BlogFilter />
          </AnimatedSection>
        </div>
      </section>

      {/* Featured posts */}
      {featuredPosts.length > 0 && (
        <section className="section bg-mesh" aria-label="Featured articles">
          <div className="container">
            <AnimatedSection className="mb-10">
              <p className="section-label">Featured</p>
              <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Must reads.
              </h2>
            </AnimatedSection>
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

      {/* All posts */}
      {otherPosts.length > 0 && (
        <section className="section" aria-label="All articles">
          <div className="container">
            <AnimatedSection className="mb-10">
              <p className="section-label">All Posts</p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 80}>
                  <BlogCard post={post} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="section" aria-label="Newsletter signup">
        <div className="container">
          <AnimatedSection>
            <div className="max-w-xl mx-auto text-center glass rounded-2xl p-10">
              <h2 className="text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Stay in the loop.
              </h2>
              <p className="text-slate-400 mb-6 text-sm">
                Get new articles directly to your inbox — no spam, ever. Only
                the stuff that actually matters.
              </p>
              <NewsletterForm />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
