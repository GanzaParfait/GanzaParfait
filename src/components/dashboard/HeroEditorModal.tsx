"use client";

import { useState, useEffect } from "react";
import {
  RiCloseLine,
  RiSaveLine,
  RiImageAddLine,
  RiLayoutGridLine,
  RiCheckLine,
} from "react-icons/ri";
import { SiteSettings, HeroLayoutType } from "@/lib/supabase";
import SplitHero from "@/components/hero/SplitHero";
import FeaturedOverlayHero from "@/components/hero/FeaturedOverlayHero";
import FullCenteredHero from "@/components/hero/FullCenteredHero";

interface HeroEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  initialLayout?: HeroLayoutType;
  onSave: (updated: Partial<SiteSettings>) => void;
  onOpenMedia: () => void;
  selectedMediaUrl?: string;
}

export default function HeroEditorModal({
  isOpen,
  onClose,
  settings,
  initialLayout,
  onSave,
  onOpenMedia,
  selectedMediaUrl,
}: HeroEditorModalProps) {
  const [formData, setFormData] = useState<SiteSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...settings,
        bannerLayout: initialLayout || settings.bannerLayout || "split_portrait",
      });
    }
  }, [isOpen, settings, initialLayout]);

  useEffect(() => {
    if (selectedMediaUrl) {
      setFormData((prev) => ({ ...prev, heroImageUrl: selectedMediaUrl }));
    }
  }, [selectedMediaUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const layoutOptions: { id: HeroLayoutType; label: string }[] = [
    { id: "split_portrait", label: "Split Portrait" },
    { id: "featured_overlay", label: "Full Banner Overlay" },
    { id: "full_centered_floating", label: "Full Centered" },
  ];

  const renderPreview = () => {
    switch (formData.bannerLayout) {
      case "featured_overlay":
        return <FeaturedOverlayHero settings={formData} />;
      case "full_centered_floating":
        return <FullCenteredHero settings={formData} />;
      case "split_portrait":
      default:
        return <SplitHero settings={formData} />;
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0, 0, 0, 0.7)",
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
          maxWidth: "1400px",
          height: "95vh",
          background: "#ffffff",
          borderRadius: "1rem",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiLayoutGridLine style={{ color: "#1d4ed8" }} /> Hero Layout Editor
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", borderRadius: "0.5rem", gap: "0.5rem" }}>
              <RiSaveLine size={18} /> Save Changes
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left Form Panel */}
          <div style={{ width: "24rem", minWidth: "24rem", overflowY: "auto", borderRight: "1px solid #e2e8f0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", background: "#ffffff" }}>
            
            {/* Layout Selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Select Layout
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {layoutOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, bannerLayout: opt.id })}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.75rem 1rem", borderRadius: "0.5rem",
                      border: `2px solid ${formData.bannerLayout === opt.id ? "#1d4ed8" : "#e2e8f0"}`,
                      background: formData.bannerLayout === opt.id ? "#eff6ff" : "#ffffff",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
                      color: formData.bannerLayout === opt.id ? "#1d4ed8" : "#334155"
                    }}
                  >
                    <div style={{ width: "1.25rem" }}>
                      {formData.bannerLayout === opt.id && <RiCheckLine size={16} />}
                    </div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: "1px", background: "#e2e8f0", width: "100%" }}></div>

            {/* Content Editor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Image URL */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase" }}>Hero Image</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="text"
                    value={formData.heroImageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button type="button" onClick={onOpenMedia} className="btn btn-outline btn-sm" style={{ padding: "0.5rem", borderRadius: "0.5rem", flexShrink: 0 }}>
                    <RiImageAddLine size={18} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase" }}>Primary Headline / Name</label>
                <input
                  type="text"
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase" }}>Roles (Separated by •)</label>
                <textarea
                  rows={2}
                  value={formData.siteSubtitle}
                  onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase" }}>Hero Bio / Tagline</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

            </div>
          </div>

          {/* Right Preview Panel */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0f172a" }}>
            <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 50, background: "rgba(0,0,0,0.5)", padding: "0.25rem 0.75rem", borderRadius: "1rem", color: "#fff", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Live Preview
            </div>
            
            <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
              {/* Scale it down slightly so it fits in the modal viewport beautifully without massive scrolling, or keep it 100% since it's meant to be full screen. */}
              <div style={{ width: "100%", transformOrigin: "top center" }}>
                {renderPreview()}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
