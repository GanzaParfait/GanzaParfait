"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  RiCloseLine,
  RiSaveLine,
  RiImageAddLine,
  RiLayoutGridLine,
  RiArrowRightLine,
  RiMapPinLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { BrainCircuit } from "lucide-react";

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
  layoutStyle: "split_portrait" | "featured_overlay" | "minimal_centered";
}

interface BannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerItem | null;
  onSave: (savedBanner: BannerItem) => void;
  onOpenMedia: () => void;
  selectedMediaUrl?: string;
}

interface ValidationErrors {
  title?: string;
  buttonLink?: string;
  imageUrl?: string;
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
    subtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
    imageUrl: "/images/profile/hero-photo.png",
    buttonText: "View My Work",
    buttonLink: "/projects",
    pageLocation: "main_hero",
    sortOrder: 1,
    isActive: true,
    layoutStyle: "split_portrait",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (banner) {
      setFormData(banner);
    } else {
      setFormData({
        id: Date.now().toString(),
        title: "Prince Parfait GANZA",
        subtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
        imageUrl: "/images/profile/hero-photo.png",
        buttonText: "View My Work",
        buttonLink: "/projects",
        pageLocation: "main_hero",
        sortOrder: 1,
        isActive: true,
        layoutStyle: "split_portrait",
      });
    }
    setErrors({});
  }, [banner, isOpen]);

  useEffect(() => {
    if (selectedMediaUrl) {
      setFormData((prev) => ({ ...prev, imageUrl: selectedMediaUrl }));
    }
  }, [selectedMediaUrl]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (formData.buttonLink && !formData.buttonLink.startsWith("/") && !formData.buttonLink.startsWith("http")) {
      newErrors.buttonLink = "Must start with / or http";
    }
    if (formData.imageUrl && !formData.imageUrl.startsWith("/") && !formData.imageUrl.startsWith("http")) {
      newErrors.imageUrl = "Must start with / or http";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  const roles = formData.subtitle ? formData.subtitle.split(" • ") : ["Role"];

  // Get layout label
  const layoutLabel = (style: string) => {
    switch (style) {
      case "split_portrait": return "Split Portrait";
      case "featured_overlay": return "Gradient Overlay";
      case "minimal_centered": return "Minimal Centered";
      default: return style;
    }
  };

  const inputStyle = (hasError?: string) => ({
    width: "100%",
    padding: "0.45rem 0.625rem",
    borderRadius: "0.375rem",
    background: "var(--color-bg)",
    border: `1px solid ${hasError ? "#ef4444" : "var(--color-border)"}`,
    color: "var(--color-text)",
    fontSize: "0.8125rem",
    outline: "none",
    transition: "border-color 0.15s ease",
  });

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
          maxWidth: "56rem",
          maxHeight: "92vh",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.75rem",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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
          <form onSubmit={handleSubmit} style={{ padding: "1.25rem", borderRight: "1px solid var(--color-border)", display: "grid", gap: "0.75rem" }}>
            
            {/* Image URL */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Banner Image URL
              </label>
              <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ ...inputStyle(errors.imageUrl), flex: 1 }}
                />
                <button type="button" onClick={onOpenMedia} className="btn btn-outline btn-sm" style={{ padding: "0.45rem 0.625rem", borderRadius: "0.375rem", flexShrink: 0 }}>
                  Browse
                </button>
              </div>
              {errors.imageUrl && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><RiErrorWarningLine size={12} /> {errors.imageUrl}</p>}
            </div>

            {/* Title */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Title / Headline <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: undefined }); }}
                style={inputStyle(errors.title)}
              />
              {errors.title && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><RiErrorWarningLine size={12} /> {errors.title}</p>}
            </div>

            {/* Subtitle */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Subtitle / Roles <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>(separated by &quot; • &quot;)</span>
              </label>
              <textarea
                rows={2}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                style={{ ...inputStyle(), resize: "vertical" }}
              />
            </div>

            {/* Button Text + Link */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  style={inputStyle()}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Button Link
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => { setFormData({ ...formData, buttonLink: e.target.value }); if (errors.buttonLink) setErrors({ ...errors, buttonLink: undefined }); }}
                  style={inputStyle(errors.buttonLink)}
                />
                {errors.buttonLink && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><RiErrorWarningLine size={12} /> {errors.buttonLink}</p>}
              </div>
            </div>

            {/* Layout + Active */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                  Layout Variant
                </label>
                <select
                  value={formData.layoutStyle}
                  onChange={(e) => setFormData({ ...formData, layoutStyle: e.target.value as any })}
                  style={inputStyle()}
                >
                  <option value="split_portrait">Split Portrait Layout</option>
                  <option value="featured_overlay">Gradient Overlay Banner</option>
                  <option value="minimal_centered">Minimal Centered</option>
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

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ borderRadius: "0.375rem" }}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
                <RiSaveLine size={16} /> Save Banner
              </button>
            </div>

          </form>

          {/* Right — Live Preview matching website */}
          <div style={{ padding: "1.25rem", background: "rgba(14, 82, 168, 0.03)", display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-3)" }}>
              Live Preview — {layoutLabel(formData.layoutStyle)}
            </span>

            <div style={{ width: "100%", borderRadius: "0.75rem", border: "1px solid var(--color-border)", overflow: "hidden", background: "var(--color-bg)" }}>

              {/* ─── SPLIT PORTRAIT PREVIEW ─── */}
              {formData.layoutStyle === "split_portrait" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.75rem", padding: "1.25rem", alignItems: "center" }}>
                  <div>
                    {/* Status pill mini */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.35rem",
                      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: "9999px", padding: "0.2rem 0.625rem",
                      fontSize: "0.6rem", fontWeight: 600, marginBottom: "0.5rem",
                    }}>
                      <span style={{ width: "0.3rem", height: "0.3rem", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                      <span style={{ color: "#16a34a" }}>Available</span>
                    </div>

                    <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-3)", marginBottom: "0.2rem" }}>
                      Hi there, I&apos;m
                    </p>
                    <h4 style={{ fontSize: "1.125rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.35rem" }}>
                      <span className="hero-name-gradient">{formData.title.split(" ").slice(0, -1).join(" ")}</span>
                      <br />
                      <span style={{ color: "var(--color-text)" }}>{formData.title.split(" ").slice(-1)[0]}</span>
                    </h4>

                    {/* Role ticker */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "var(--color-surface)", border: "1px solid var(--color-border)",
                      borderRadius: "0.5rem", padding: "0.3rem 0.625rem",
                      marginBottom: "0.4rem",
                    }}>
                      <span style={{ width: "2px", height: "0.875rem", background: "linear-gradient(180deg, var(--color-primary), #6366f1)", borderRadius: "9999px" }} />
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-text)" }}>
                        {roles[0]}
                      </span>
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: "0.5rem", padding: "0.3rem 0.75rem", fontSize: "0.7rem", borderRadius: "0.375rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      {formData.buttonText || "View Work"} <RiArrowRightLine size={11} />
                    </button>
                  </div>

                  {/* Portrait image with arch */}
                  <div style={{ position: "relative", width: "120px", height: "150px" }}>
                    <div style={{
                      position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                      width: "100%", height: "95%",
                      borderRadius: "50% 50% 0 0 / 55% 55% 0 0",
                      background: "linear-gradient(160deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%)",
                      zIndex: 0,
                    }} />
                    <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
                      <Image src={formData.imageUrl || "/images/profile/hero-photo.png"} alt="Preview" fill className="object-contain object-bottom" />
                    </div>
                    {/* Floating mini stats */}
                    <div style={{
                      position: "absolute", top: "0.25rem", right: "-0.25rem", zIndex: 2,
                      background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                      borderRadius: "0.75rem", padding: "0.25rem 0.5rem", textAlign: "center",
                      backdropFilter: "blur(8px)", boxShadow: "var(--shadow-sm)",
                    }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>15+</p>
                      <p style={{ fontSize: "0.45rem", color: "var(--color-text-3)" }}>Projects</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── GRADIENT OVERLAY PREVIEW ─── */}
              {formData.layoutStyle === "featured_overlay" && (
                <div>
                  {/* Top centered section */}
                  <div style={{ textAlign: "center", padding: "1rem 1rem 0.5rem" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "var(--color-surface)", border: "1px solid var(--color-border)",
                      borderRadius: "9999px", padding: "0.3rem 0.75rem", marginBottom: "0.5rem",
                      fontSize: "0.65rem", fontWeight: 600,
                    }}>
                      <span style={{ color: "var(--color-text)" }}>{formData.subtitle || "Subtitle"}</span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "0.375rem" }}>
                      Empowering Innovation.
                      <br />
                      <span className="hero-name-gradient">Shaping the Digital Horizon.</span>
                    </h4>
                    <p style={{ fontSize: "0.65rem", color: "var(--color-text-2)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                      I&apos;m <strong>{formData.title}</strong> — building high-performance software.
                    </p>
                    <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center", marginBottom: "0.5rem" }}>
                      <button className="btn btn-primary btn-sm" style={{ padding: "0.25rem 0.625rem", fontSize: "0.65rem", borderRadius: "0.375rem" }}>
                        Explore Portfolio <RiArrowRightLine size={10} />
                      </button>
                    </div>
                  </div>
                  {/* Image banner */}
                  <div style={{ position: "relative", width: "100%", height: "10rem", background: "linear-gradient(135deg, #0e52a8 0%, #1e1b4b 100%)" }}>
                    <Image src={formData.imageUrl || "/images/profile/hero-photo.png"} alt="Preview" fill className="object-cover object-top" style={{ opacity: 0.8 }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
                    <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", right: "0.75rem", color: "#fff" }}>
                      <span style={{ fontSize: "0.5rem", fontWeight: 700, textTransform: "uppercase", color: "#60a5fa", letterSpacing: "0.1em" }}>
                        FOUNDER & EXECUTIVE BUILDER
                      </span>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", marginTop: "0.1rem" }}>{formData.title}</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── MINIMAL CENTERED PREVIEW ─── */}
              {formData.layoutStyle === "minimal_centered" && (
                <div style={{ textAlign: "center", padding: "1.25rem 1rem" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "3.5rem", height: "3.5rem", borderRadius: "50%", margin: "0 auto 0.625rem",
                    position: "relative", overflow: "hidden",
                    border: "2px solid var(--color-primary)",
                    boxShadow: "0 0 15px rgba(14,82,168,0.2)",
                  }}>
                    <Image src={formData.imageUrl || "/images/profile/hero-photo.png"} alt="Preview" fill className="object-cover object-top" />
                  </div>

                  {/* Status mini pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                    borderRadius: "9999px", padding: "0.15rem 0.5rem",
                    fontSize: "0.55rem", fontWeight: 600, marginBottom: "0.5rem",
                  }}>
                    <span style={{ width: "0.25rem", height: "0.25rem", borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ color: "#16a34a" }}>Available</span>
                  </div>

                  {/* Name */}
                  <h4 style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.375rem" }}>
                    <span className="hero-name-gradient">{formData.title.split(" ").slice(0, -1).join(" ")}</span>
                    <br />
                    <span style={{ color: "var(--color-text)" }}>{formData.title.split(" ").slice(-1)[0]}</span>
                  </h4>

                  {/* Role */}
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
                    {roles[0]}
                  </p>

                  {/* Bio preview */}
                  <p style={{ fontSize: "0.625rem", color: "var(--color-text-2)", lineHeight: 1.5, marginBottom: "0.625rem", maxWidth: "18rem", margin: "0 auto 0.625rem" }}>
                    Building full-stack products and integrating AI to solve real-world problems.
                  </p>

                  <button className="btn btn-primary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.7rem", borderRadius: "0.375rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    {formData.buttonText || "View Work"} <RiArrowRightLine size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Layout quick info */}
            <div style={{
              padding: "0.75rem", borderRadius: "0.5rem",
              background: "rgba(14,82,168,0.05)", border: "1px solid rgba(14,82,168,0.1)",
              fontSize: "0.7rem", color: "var(--color-text-3)", lineHeight: 1.5,
            }}>
              <strong style={{ color: "var(--color-text-2)" }}>💡 Tip:</strong> All text fields (title, subtitle, bio, button text) are fully editable from this form and update on the live website in real-time via the Settings tab.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
