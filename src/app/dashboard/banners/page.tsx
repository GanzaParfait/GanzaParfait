"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  RiCheckLine,
  RiEyeLine,
  RiMoreLine,
  RiAddLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import { getLocalSettings, saveLocalSettings, SiteSettings, DEFAULT_SETTINGS, HeroLayoutType } from "@/lib/supabase";
import {
  HERO_LAYOUTS,
  carouselLayouts,
  heroHighlights,
  heroImageFor,
  hiddenHeroLayoutOptions,
  settingsForLayout,
  visibleHeroLayouts,
} from "@/lib/hero";
import HeroEditorModal from "@/components/dashboard/HeroEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";

const menuItemStyle: CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "0.6rem 0.85rem",
  background: "transparent",
  border: "none",
  fontSize: "0.8rem",
  color: "#0f172a",
  cursor: "pointer",
};

export default function BannersPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<HeroLayoutType>("split_portrait");
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | undefined>();
  const [menuOpen, setMenuOpen] = useState<HeroLayoutType | null>(null);
  const { runSave } = useDashboardFeedback();

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const handleSaveSettings = (updated: Partial<SiteSettings>) => {
    setSettings(saveLocalSettings(updated));
  };

  const visible = visibleHeroLayouts(settings);
  const hidden = hiddenHeroLayoutOptions(settings);
  const liveId = settings.bannerLayout || "split_portrait";
  const inCarousel = new Set(carouselLayouts(settings));

  const openEditor = (id: HeroLayoutType) => {
    setEditingLayout(id);
    setIsHeroModalOpen(true);
    setMenuOpen(null);
  };

  const activate = async (id: HeroLayoutType) => {
    setMenuOpen(null);
    await runSave(() => {
      setSettings(saveLocalSettings({ bannerLayout: id }));
    }, `${HERO_LAYOUTS.find((layout) => layout.id === id)?.name || "Layout"} is now live.`);
  };

  const deactivate = async (id: HeroLayoutType) => {
    setMenuOpen(null);
    const fallback = visible.find((layout) => layout.id !== id)?.id || "split_portrait";
    await runSave(() => {
      setSettings(saveLocalSettings({ bannerLayout: fallback }));
    }, "Live homepage now uses another layout.");
  };

  const removeLayout = async (id: HeroLayoutType) => {
    setMenuOpen(null);
    if (visible.length <= 1) return;
    const nextHidden = [...(settings.hiddenHeroLayouts || []), id];
    const nextLive = liveId === id
      ? visible.find((layout) => layout.id !== id)?.id || "split_portrait"
      : liveId;
    await runSave(() => {
      setSettings(saveLocalSettings({ hiddenHeroLayouts: nextHidden, bannerLayout: nextLive }));
    }, "Layout removed from this dashboard list.");
  };

  const addLayout = async (id: HeroLayoutType) => {
    await runSave(() => {
      setSettings(saveLocalSettings({
        hiddenHeroLayouts: (settings.hiddenHeroLayouts || []).filter((item) => item !== id),
      }));
    }, "Layout added back.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
          Public homepage
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0b192c", letterSpacing: "-0.03em" }}>
          Hero layouts
        </h1>
      </div>

      <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1rem 1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0b192c" }}>Moving carousel</h2>
            <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem", maxWidth: "36rem" }}>
              Rotate the homepage through every visible layout, or only the ones you tick. Runs on desktop, tablet, and mobile. Hover pauses on desktop.
            </p>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
            <input
              type="checkbox"
              checked={Boolean(settings.heroCarouselEnabled)}
              onChange={(event) => handleSaveSettings({ heroCarouselEnabled: event.target.checked })}
            />
            Rotate layouts
          </label>
        </div>
        {settings.heroCarouselEnabled ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.9rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(["all", "selected"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSaveSettings({ heroCarouselMode: mode })}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "999px",
                    padding: "0.35rem 0.75rem",
                    background: (settings.heroCarouselMode || "all") === mode ? "#0e52a8" : "#fff",
                    color: (settings.heroCarouselMode || "all") === mode ? "#fff" : "#0f172a",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {mode === "all" ? "All visible layouts" : "Only selected"}
                </button>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", marginLeft: "0.25rem" }}>
                Every
                <input
                  type="number"
                  min={4}
                  max={20}
                  value={settings.heroCarouselInterval || 8}
                  onChange={(event) => handleSaveSettings({ heroCarouselInterval: Number(event.target.value) || 8 })}
                  style={{ width: "4rem", padding: "0.3rem 0.45rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1" }}
                />
                seconds
              </label>
            </div>
            {settings.heroCarouselMode === "selected" ? (
              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                {HERO_LAYOUTS.map((layout) => {
                  const selected = (settings.heroCarouselLayouts || []).includes(layout.id);
                  return (
                    <label key={layout.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#334155" }}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          const current = settings.heroCarouselLayouts || [];
                          handleSaveSettings({
                            heroCarouselLayouts: selected
                              ? current.filter((id) => id !== layout.id)
                              : [...current, layout.id],
                          });
                        }}
                      />
                      {layout.name}
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "0.7rem", padding: "0.22rem" }}>
          <span style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "0.55rem",
            background: "#ffffff",
            color: "#0e52a8",
            fontSize: "0.8rem",
            fontWeight: 800,
            boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
          }}>
            Layout
          </span>
        </div>
        {hidden.length > 0 && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {hidden.map((layout) => (
              <button
                key={layout.id}
                type="button"
                className="btn btn-outline"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                onClick={() => addLayout(layout.id)}
              >
                <RiAddLine /> Add {layout.short}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {visible.map((layout) => {
          const isActive = liveId === layout.id;
          const image = heroImageFor(settings, layout.id);
          const highlights = heroHighlights(settingsForLayout(settings, layout.id));
          return (
            <article
              key={layout.id}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "1rem",
                border: `1.5px solid ${isActive ? "#0e52a8" : "#e2e8f0"}`,
                background: "#ffffff",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", gap: "0.85rem", padding: "0.9rem 1rem 0.75rem" }}>
                <div style={{
                  width: "4.75rem",
                  height: "4.75rem",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  background: "#f8fafc",
                  flexShrink: 0,
                  border: "1px solid #e2e8f0",
                }}>
                  <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <h2 style={{ fontSize: "0.98rem", fontWeight: 800, color: "#0b192c" }}>{layout.name}</h2>
                    {isActive && (
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#0e52a8", background: "#eff6ff", padding: "0.15rem 0.4rem", borderRadius: "999px" }}>
                        Live
                      </span>
                    )}
                    {inCarousel.has(layout.id) && (
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#0f172a", background: "#e2e8f0", padding: "0.15rem 0.4rem", borderRadius: "999px" }}>
                        Carousel
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem", lineHeight: 1.4 }}>
                    {layout.description}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", padding: "0 1rem 0.85rem" }}>
                {highlights.map((item, index) => (
                  <div key={`${item.value}-${item.label}`} style={{ background: "#f8fafc", borderRadius: "0.55rem", padding: "0.4rem 0.5rem" }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Highlight {index + 1}
                    </p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0b192c" }}>{item.value}</p>
                    <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{item.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.4rem", padding: "0 1rem 0.95rem", position: "relative" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: "center", padding: "0.45rem 0.6rem", fontSize: "0.8rem" }}
                  onClick={() => openEditor(layout.id)}
                >
                  <RiEyeLine /> Preview
                </button>
                <button
                  type="button"
                  className={isActive ? "btn btn-primary" : "btn btn-ghost"}
                  style={{ justifyContent: "center", minWidth: "6.4rem", padding: "0.45rem 0.6rem", fontSize: "0.8rem" }}
                  onClick={() => activate(layout.id)}
                  disabled={isActive}
                >
                  {isActive ? <><RiCheckLine /> Active</> : "Activate"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "0.45rem 0.55rem" }}
                  aria-label={`More actions for ${layout.name}`}
                  onClick={() => setMenuOpen((current) => (current === layout.id ? null : layout.id))}
                >
                  <RiMoreLine />
                </button>
                {menuOpen === layout.id && (
                  <div style={{
                    position: "absolute",
                    right: "1rem",
                    bottom: "3.1rem",
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.7rem",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                    minWidth: "11.5rem",
                    zIndex: 4,
                    overflow: "hidden",
                  }}>
                    <button type="button" style={menuItemStyle} onClick={() => openEditor(layout.id)}>Preview &amp; edit</button>
                    {isActive ? (
                      <button type="button" style={menuItemStyle} onClick={() => deactivate(layout.id)} disabled={visible.length <= 1}>
                        Deactivate
                      </button>
                    ) : (
                      <button type="button" style={menuItemStyle} onClick={() => activate(layout.id)}>Activate</button>
                    )}
                    <a href="/" target="_blank" rel="noreferrer" style={{ ...menuItemStyle, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <RiExternalLinkLine /> Live site
                    </a>
                    <button
                      type="button"
                      style={{ ...menuItemStyle, color: "#b91c1c" }}
                      onClick={() => removeLayout(layout.id)}
                      disabled={visible.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                )}
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
