import Link from "next/link";
import { type BlogPost } from "@/data/site-data";
import { RiArrowRightLine, RiCalendarLine, RiTimeLine } from "react-icons/ri";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  AI: "text-blue-400",
  "Software Engineering": "text-emerald-400",
  Entrepreneurship: "text-orange-400",
  Leadership: "text-purple-400",
  Learning: "text-yellow-400",
  Career: "text-pink-400",
};

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className={`card group flex flex-col h-full ${featured ? "p-7" : "p-6"}`}
      aria-label={`Blog post: ${post.title}`}
    >
      {/* Category */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            categoryColors[post.category] ?? "text-blue-400"
          }`}
        >
          {post.category}
        </span>
      </div>

      {/* Title */}
      <Link href={`/blog/${post.slug}`} className="group-hover:text-[#60a5fa] transition-colors">
        <h3
          className={`font-semibold text-white mb-3 leading-snug ${
            featured ? "text-xl" : "text-lg"
          }`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {post.title}
        </h3>
      </Link>

      {/* Excerpt */}
      <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">
        {post.excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5" aria-label="Tags">
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="badge badge-outline text-slate-500">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgba(14,82,168,0.1)]">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <RiCalendarLine size={12} />
            <time dateTime={post.date}>{formattedDate}</time>
          </span>
          <span className="flex items-center gap-1">
            <RiTimeLine size={12} />
            {post.readTime}
          </span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="flex items-center gap-1 text-xs text-[#0E52A8] hover:text-white font-medium transition-colors"
          aria-label={`Read: ${post.title}`}
        >
          Read
          <RiArrowRightLine size={13} />
        </Link>
      </div>
    </article>
  );
}
