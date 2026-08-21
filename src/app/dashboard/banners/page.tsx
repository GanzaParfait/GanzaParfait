"use client";

import { useState, useEffect } from "react";
import { RiLayoutGridLine, RiSettings4Line } from "react-icons/ri";

import { getLocalSettings, saveLocalSettings, SiteSettings, DEFAULT_SETTINGS, HeroLayoutType } from "@/lib/supabase";
import HeroEditorModal from "@/components/dashboard/HeroEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";

export default function BannersPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<HeroLayoutType>("split_portrait");

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | undefined>();

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const handleSaveSettings = (updated: Partial<SiteSettings>) => {
    const newSettings = saveLocalSettings(updated);
    setSettings(newSettings);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>
            Hero Layouts Manager
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", marginTop: "0.25rem" }}>
            Configure your digital headquarters' main entrance and switch between layout modes.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {([
          { id: "split_portrait" as const, label: "Split Portrait", desc: "Image right, content left — cinematic two-column layout. Best for standard professional portfolios." },
          { id: "featured_overlay" as const, label: "Tony Robbins / Full Overlay", desc: "Full-width background image with massive text and dark gradient overlay. Extremely bold." },
          { id: "full_centered_floating" as const, label: "Portm / Full Centered", desc: "Strong centered person image with attached floating innovation badges and large bottom typography." },
        ]).map((opt) => {
          const isActive = (settings.bannerLayout || "split_portrait") === opt.id;
          return (
            <div
              key={opt.id}
              style={{
                display: "flex", flexDirection: "column",
                padding: "1.5rem", borderRadius: "1rem",
                border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
                background: isActive ? "rgba(29, 78, 216, 0.05)" : "var(--color-surface)",
                boxShadow: isActive ? "0 10px 15px -3px rgba(29,78,216,0.1)" : "var(--shadow-sm)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", background: isActive ? "var(--color-primary)" : "var(--color-bg)", color: isActive ? "#ffffff" : "var(--color-text-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RiLayoutGridLine size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: isActive ? "var(--color-primary)" : "var(--color-text)" }}>
                    {opt.label}
                  </h3>
                  {isActive && <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)", background: "rgba(29, 78, 216, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>Currently Active</span>}
                </div>
              </div>
              
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", lineHeight: 1.5, flex: 1 }}>
                {opt.desc}
              </p>

              <button
                type="button"
                onClick={() => {
                  setEditingLayout(opt.id);
                  setIsHeroModalOpen(true);
                }}
                className="btn btn-outline"
                style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center", gap: "0.5rem", borderColor: isActive ? "var(--color-primary)" : "var(--color-border)", color: isActive ? "var(--color-primary)" : "var(--color-text-2)" }}
              >
                <RiSettings4Line /> {isActive ? "Edit Active Layout" : "Preview & Activate"}
              </button>
            </div>
          );
        })}
      </div>

      <HeroEditorModal
        isOpen={isHeroModalOpen}
        onClose={() => {
          setIsHeroModalOpen(false);
          setSelectedMediaUrl(undefined);
        }}
        settings={settings}
        initialLayout={editingLayout}
        onSave={handleSaveSettings}
        onOpenMedia={() => {
          setSelectedMediaUrl(undefined);
          setIsMediaOpen(true);
        }}
        selectedMediaUrl={selectedMediaUrl}
      />

      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => {
          setSelectedMediaUrl(url);
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
