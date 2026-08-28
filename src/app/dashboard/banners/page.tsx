"use client";

import { useEffect, useState } from "react";
import { RiCheckLine, RiSettings4Line } from "react-icons/ri";
import { getLocalSettings, saveLocalSettings, SiteSettings, DEFAULT_SETTINGS, HeroLayoutType } from "@/lib/supabase";
import { HERO_LAYOUTS } from "@/lib/hero";
import HeroEditorModal from "@/components/dashboard/HeroEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import HeroPreviewFrame from "@/components/hero/HeroPreviewFrame";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";

export default function BannersPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<HeroLayoutType>("split_portrait");
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | undefined>();
  const { runSave } = useDashboardFeedback();

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const handleSaveSettings = (updated: Partial<SiteSettings>) => {
    setSettings(saveLocalSettings(updated));
  };

  const activate = async (id: HeroLayoutType) => {
    await runSave(() => {
      setSettings(saveLocalSettings({ bannerLayout: id }));
    }, `${HERO_LAYOUTS.find((layout) => layout.id === id)?.name || "Layout"} is now live.`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
          Public homepage
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0b192c", letterSpacing: "-0.03em" }}>
          Hero layouts
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.35rem", maxWidth: "40rem" }}>
          Switch the live homepage banner, preview at true composition, and edit only the fields that layout actually shows.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {HERO_LAYOUTS.map((layout) => {
          const isActive = (settings.bannerLayout || "split_portrait") === layout.id;
          const previewSettings = { ...settings, bannerLayout: layout.id };
          return (
            <article
              key={layout.id}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "1.1rem",
                overflow: "hidden",
                border: `2px solid ${isActive ? "#0e52a8" : "#e2e8f0"}`,
                background: "#ffffff",
                boxShadow: isActive ? "0 12px 30px rgba(14,82,168,0.12)" : "0 1px 2px rgba(15,23,42,0.05)",
              }}
            >
              <div style={{ height: "auto", aspectRatio: "16 / 10", position: "relative", background: "#ffffff" }}>
                <HeroPreviewFrame
                  settings={previewSettings}
                  previewTheme="light"
                  fit="width"
                />
                {isActive && (
                  <span style={{ position: "absolute", top: "0.7rem", right: "0.7rem", background: "#0e52a8", color: "#fff", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.55rem", borderRadius: "999px" }}>
                    Live
                  </span>
                )}
              </div>
              <div style={{ padding: "1.1rem 1.2rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                <div>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0b192c" }}>{layout.name}</h2>
                  <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.55, marginTop: "0.3rem" }}>{layout.description}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => {
                      setEditingLayout(layout.id);
                      setIsHeroModalOpen(true);
                    }}
                  >
                    <RiSettings4Line /> Preview &amp; edit
                  </button>
                  <button
                    type="button"
                    className={isActive ? "btn btn-primary" : "btn btn-ghost"}
                    style={{ justifyContent: "center", minWidth: "7.5rem" }}
                    onClick={() => activate(layout.id)}
                    disabled={isActive}
                  >
                    {isActive ? <><RiCheckLine /> Active</> : "Activate"}
                  </button>
                </div>
              </div>
            </article>
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
