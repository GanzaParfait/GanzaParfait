"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiLayoutGridLine, RiArrowRightLine } from "react-icons/ri";

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  pageLocation: string;
  sortOrder: number;
  isActive: boolean;
  layoutStyle: "split_portrait" | "featured_overlay" | "interactive_stack";
}

interface BannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerItem | null;
  onSave: (savedBanner: BannerItem) => void;
  onOpenMedia: () => void;
  selectedMediaUrl?: string;
}

export default function BannerEditorModal({
  isOpen,
  onClose,
  banner,
  onSave,
  onOpenMedia,
  selectedMediaUrl,
}: BannerEditorModalProps) {
  const [formData, setFormData] = useState<BannerItem>({
    id: Date.now().toString(),
    title: "Prince Parfait GANZA",
    subtitle: "Founder • Software Engineer • AI Builder",
    imageUrl: "/images/profile/hero-photo.png",
    buttonText: "View My Work",
    buttonLink: "/projects",
    pageLocation: "main_hero",
    sortOrder: 1,
    isActive: true,
    layoutStyle: "split_portrait",
  });

  useEffect(() => {
    if (banner) {
      setFormData(banner);
    } else {
      setFormData({
        id: Date.now().toString(),
        title: "Prince Parfait GANZA",
        subtitle: "Founder • Software Engineer • AI Builder",
        imageUrl: "/images/profile/hero-photo.png",
        buttonText: "View My Work",
        buttonLink: "/projects",
        pageLocation: "main_hero",
        sortOrder: 1,
        isActive: true,
        layoutStyle: "split_portrait",
      });
    }
  }, [banner, isOpen]);

  useEffect(() => {
    if (selectedMediaUrl) {
      setFormData((prev) => ({ ...prev, imageUrl: selectedMediaUrl }));
    }
  }, [selectedMediaUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave(formData);
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
          maxWidth: "52rem",
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
            <RiLayoutGridLine style={{ color: "var(--color-primary)" }} /> {banner ? "Edit Banner Configuration" : "Create New Banner"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflowY: "auto" }} className="grid-cols-1 md:grid-cols-2">
          
          {/* Left Form */}
          <form onSubmit={handleSubmit} style={{ padding: "1.25rem", borderRight: "1px solid var(--color-border)", display: "grid", gap: "0.875rem" }}>
            
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Banner Image URL
              </label>
              <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ flex: 1, padding: "0.45rem 0.625rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
                />
                <button type="button" onClick={onOpenMedia} className="btn btn-outline btn-sm" style={{ padding: "0.45rem 0.625rem", borderRadius: "0.375rem" }}>
                  Browse
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Title / Headline <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: "100%", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                style={{ width: "100%", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  style={{ width: "100%", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Button Link
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  style={{ width: "100%", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Layout Variant
                </label>
                <select
                  value={formData.layoutStyle}
                  onChange={(e) => setFormData({ ...formData, layoutStyle: e.target.value as any })}
                  style={{ width: "100%", padding: "0.45rem 0.625rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
                >
                  <option value="split_portrait">Split Portrait Layout</option>
                  <option value="featured_overlay">Gradient Overlay Banner</option>
                  <option value="interactive_stack">Stacked Cards Banner</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Active Status
                </label>
                <div style={{ display: "flex", alignItems: "center", height: "2.125rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", cursor: "pointer", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    {formData.isActive ? "Active (Displayed)" : "Hidden"}
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ borderRadius: "0.375rem" }}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
                <RiSaveLine size={16} /> Save Banner
              </button>
            </div>

          </form>

          {/* Right Live Preview (APN Marketplace style) */}
          <div style={{ padding: "1.25rem", background: "rgba(14, 82, 168, 0.03)", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-3)" }}>
              Live Banner Preview
            </span>

            <div style={{ width: "100%", borderRadius: "0.375rem", border: "1px solid var(--color-border)", overflow: "hidden", background: "var(--color-bg)" }}>
              {formData.layoutStyle === "featured_overlay" ? (
                <div style={{ padding: "1.5rem 1.25rem", background: "linear-gradient(135deg, #0e52a8 0%, #0f172a 100%)", color: "#ffffff" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#60a5fa", marginBottom: "0.375rem" }}>
                    {formData.subtitle || "FEATURED SHOWCASE"}
                  </p>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.875rem" }}>
                    {formData.title || "Banner Headline"}
                  </h4>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#ffffff", color: "#000000", padding: "0.375rem 0.875rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700 }}>
                    {formData.buttonText || "Explore"} <RiArrowRightLine size={12} />
                  </div>
                </div>
              ) : (
                <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 90px", gap: "0.875rem", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--color-text)" }}>
                      {formData.title || "Banner Title"}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.2rem", lineHeight: 1.4 }}>
                      {formData.subtitle || "Banner Subtitle"}
                    </p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: "0.625rem", borderRadius: "0.375rem" }}>
                      {formData.buttonText || "View Work"}
                    </button>
                  </div>
                  <div style={{ position: "relative", width: "90px", height: "100px", borderRadius: "0.375rem", overflow: "hidden", background: "#e2e8f0" }}>
                    <Image src={formData.imageUrl || "/images/profile/hero-photo.png"} alt="Preview" fill className="object-cover object-bottom" />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
