"use client";

import { useState } from "react";
import Image from "next/image";
import { RiAddLine, RiEditLine, RiDeleteBinLine } from "react-icons/ri";

import { blogPosts as initialBlogPosts, BlogPost } from "@/data/site-data";
import BlogEditorModal from "@/components/dashboard/BlogEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";

export default function BlogsPage() {
  const [blogsList, setBlogsList] = useState<BlogPost[]>(initialBlogPosts);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  const handleSaveBlog = (blog: BlogPost) => {
    const exists = blogsList.find((b) => b.id === blog.id);
    if (exists) {
      setBlogsList(blogsList.map((b) => (b.id === blog.id ? blog : b)));
    } else {
      setBlogsList([blog, ...blogsList]);
    }
  };

  const handleDeleteBlog = (id: string) => {
    setBlogsList(blogsList.filter((b) => b.id !== id));
  };

  const triggerMediaPicker = (callback: (url: string) => void) => {
    setMediaTargetCallback(() => callback);
    setIsMediaOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetCallback) {
      mediaTargetCallback(url);
      setMediaTargetCallback(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
            Blog Articles Manager ({blogsList.length})
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
            Write, edit, publish, and delete blog posts across the site.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null);
            setIsBlogModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
        >
          <RiAddLine size={16} /> New Blog Article
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {blogsList.map((post) => (
          <div key={post.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "0.375rem", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div style={{ position: "relative", width: "3.5rem", height: "2.5rem", borderRadius: "0.25rem", overflow: "hidden", background: "#e2e8f0" }}>
                <img src={post.coverImage || "/images/blog/blog-placeholder.png"} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>{post.title}</h4>
                <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.1rem" }}>{post.date} • {post.category}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  setEditingBlog(post);
                  setIsBlogModalOpen(true);
                }}
                className="btn btn-outline btn-sm"
                style={{ gap: "0.25rem", borderRadius: "0.25rem" }}
              >
                <RiEditLine size={13} /> Edit
              </button>
              <button
                onClick={() => handleDeleteBlog(post.id)}
                className="btn btn-ghost btn-sm"
                style={{ color: "#ef4444", padding: "0.375rem", borderRadius: "0.25rem" }}
                title="Delete Article"
              >
                <RiDeleteBinLine size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <BlogEditorModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        post={editingBlog}
        onSave={handleSaveBlog}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingBlog((prev) => (prev ? { ...prev, coverImage: url } : null)))}
      />

      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
