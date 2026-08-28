import type { Metadata } from "next";
import { blogPosts } from "@/data/site-data";
import BlogCard from "@/components/ui/BlogCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import NewsletterForm from "@/components/ui/NewsletterForm";
import { buildPageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights",
  description:
    "Writing will appear here when articles are published. This page is not a placeholder blog of invented posts.",
  path: "/blog",
  noIndex: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Insights", path: "/blog" },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((p) => p.featured);
  const otherPosts = blogPosts.filter((p) => !p.featured);

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <section className="section pt-8 pb-10" aria-label="Insights header">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Insights</p>
            <h1 className="theme-heading mb-4">Writing, when it is ready.</h1>
            <p className="theme-copy text-lg leading-relaxed max-w-2xl">
              This page will hold notes on software, operations systems, and building from Kigali. Invented articles are not published here.
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

      {blogPosts.length === 0 && (
        <section className="section pt-0" aria-label="No articles yet">
          <div className="container max-w-2xl">
            <AnimatedSection>
              <div className="card p-10 text-center">
                <h2 className="theme-heading text-2xl mb-3">No public essays yet.</h2>
                <p className="theme-copy mb-8">
                  Case studies on the Work pages are the current writing. When long-form pieces are published, they will appear here and in the RSS feed.
                </p>
                <NewsletterForm />
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}
    </>
  );
}
