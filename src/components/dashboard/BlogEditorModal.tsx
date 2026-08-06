"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiBookOpenLine } from "react-icons/ri";
import { BlogPost } from "@/data/site-data";

interface BlogEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  onSave: (savedPost: BlogPost) => void;
  onOpenMedia: () => void;
  selectedMediaUrl?: string;
}

export default function BlogEditorModal({
  isOpen,
  onClose,
  post,
  onSave,
  onOpenMedia,
  selectedMediaUrl,
}: BlogEditorModalProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "/images/blog/blog-placeholder.png",
    category: "Engineering",
    tags: ["Software", "AI"],
    featured: false,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "4 min read",
  });

  useEffect(() => {
    if (post) {
      setFormData(post);
    } else {
      setFormData({
        id: Date.now().toString(),
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "/images/blog/blog-placeholder.png",
        category: "Engineering",
        tags: ["Software", "AI"],
        featured: false,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        readTime: "4 min read",
      });
    }
  }, [post, isOpen]);

  useEffect(() => {
    if (selectedMediaUrl) {
      setFormData((prev) => ({ ...prev, coverImage: selectedMediaUrl }));
    }
  }, [selectedMediaUrl]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title: val, slug: post ? prev.slug : generatedSlug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) return;
    onSave(formData as BlogPost);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "44rem",
          maxHeight: "90vh",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem", // Small radius
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiBookOpenLine style={{ color: "var(--color-primary)" }} /> {post ? "Edit Blog Article" : "Create New Blog Article"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "grid", gap: "1rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Article Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Building AI Products in Africa"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                URL Slug <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="building-ai-products-africa"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Cover Image URL
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
              <button type="button" onClick={onOpenMedia} className="btn btn-outline btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
                <RiImageAddLine size={16} /> Library
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Excerpt / Short Summary
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Article Content (Markdown / Text)
            </label>
            <textarea
              rows={6}
              placeholder="Write your article content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none", fontFamily: "monospace" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ borderRadius: "0.375rem" }}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
              <RiSaveLine size={16} /> Save Article
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
