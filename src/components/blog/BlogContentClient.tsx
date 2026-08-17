"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-markdown-preview/markdown.css";
import { BlogPost, blogPosts } from "@/data/site-data";
import Link from "next/link";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export default function BlogContentClient({ initialPost }: { initialPost: BlogPost }) {
  const [post, setPost] = useState<BlogPost>(initialPost);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("ppg_blog_posts");
      if (cached) {
        const parsed = JSON.parse(cached);
        const found = parsed.find((p: BlogPost) => p.slug === initialPost.slug);
        if (found) {
          setPost(found);
        }
      }
    } catch {}
  }, [initialPost.slug]);

  if (post.content) {
    return (
      <div data-color-mode="dark" className="rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] p-6 md:p-10 shadow-lg">
        <MarkdownPreview source={post.content} style={{ background: "transparent" }} />
      </div>
    );
  }

  return (
    <article className="prose max-w-none prose-invert prose-blue">
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
        <Link href="/contact" className="text-blue-400">reach out</Link> if you&apos;d like to be
        notified when this feature launches.
      </p>
    </article>
  );
}
