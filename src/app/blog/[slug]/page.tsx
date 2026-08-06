import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { siteConfig, blogPosts } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ShareButton from "@/components/ui/ShareButton";
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiTimeLine,
} from "react-icons/ri";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${siteConfig.url}/blog/${slug}` },
    openGraph: {
      title: `${post.title} — Prince Parfait GANZA`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: ["Prince Parfait GANZA"],
      url: `${siteConfig.url}/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Prince Parfait GANZA",
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: "Prince Parfait GANZA",
      url: siteConfig.url,
    },
    url: `${siteConfig.url}/blog/${slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Header */}
      <section className="section pt-32 pb-8 relative dot-grid overflow-hidden" aria-label="Blog post header">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="container max-w-3xl relative z-10">
          <AnimatedSection>
            {/* Back */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
            >
              <RiArrowLeftLine size={16} />
              All Posts
            </Link>

            {/* Category */}
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0E52A8] mb-3">
              {post.category}
            </p>

            {/* Title */}
            <h1
              className="text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center gap-1.5">
                <RiCalendarLine size={14} />
                <time dateTime={post.date}>{formattedDate}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <RiTimeLine size={14} />
                {post.readTime}
              </span>
              <span>By <strong className="text-slate-400">Prince Parfait GANZA</strong></span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag} className="badge badge-outline text-slate-500">
                  {tag}
                </span>
              ))}
            </div>

            {/* Excerpt as intro */}
            <p className="text-lg text-slate-300 leading-relaxed border-l-2 border-[#0E52A8] pl-4">
              {post.excerpt}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Article body */}
      <section className="section py-8" aria-label="Article content">
        <div className="container max-w-3xl">
          <AnimatedSection>
            <article className="prose max-w-none">
              <p>
                This is a placeholder for the full article content. In the next version,
                blog posts will be powered by MDX files, allowing rich markdown content with
                embedded React components, code syntax highlighting, and more.
              </p>
              <p>
                The content management system (CMS) integration is planned for Version 2
                of this site, as outlined in the roadmap. For now, each article is
                represented by its metadata and excerpt.
              </p>
              <h2>Coming Soon</h2>
              <p>
                Full articles with MDX content will be available soon. Check back or{" "}
                <Link href="/contact">reach out</Link> if you&apos;d like to be
                notified when this feature launches.
              </p>
            </article>
          </AnimatedSection>
        </div>
      </section>

      {/* Share + Navigation */}
      <section className="section py-8 border-t border-[rgba(14,82,168,0.1)]" aria-label="Article navigation">
        <div className="container max-w-3xl flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/blog"
            className="btn btn-ghost text-slate-400 hover:text-white"
          >
            <RiArrowLeftLine size={16} />
            Back to Blog
          </Link>

          <ShareButton title={post.title} excerpt={post.excerpt} />
        </div>
      </section>
    </>
  );
}
