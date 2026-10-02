"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  RiCheckLine,
  RiEyeLine,
  RiMoreLine,
  RiAddLine,
  RiExternalLinkLine,
  RiSettings3Line,
  RiCloseLine,
} from "react-icons/ri";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings, SiteSettings, DEFAULT_SETTINGS, HeroLayoutType } from "@/lib/supabase";
import {
  HERO_LAYOUTS,
  carouselLayouts,
  heroHighlights,
  heroImageFor,
  hiddenHeroLayoutOptions,
  settingsForLayout,
  visibleHeroLayouts,
} from "@/lib/hero";
import { isVideoUrl } from "@/lib/media";
import { cloudinaryVideoPosterUrl } from "@/lib/cloudinary-url";
import HeroEditorModal from "@/components/dashboard/HeroEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

function layoutCardPreview(src: string) {
  if (!isVideoUrl(src)) {
    return <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />;
  }
  const poster = cloudinaryVideoPosterUrl(src, { width: 320 });
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#0b1329" }}>
      {poster ? (
        <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      ) : (
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <span
        style={{
          position: "absolute",
          left: "0.35rem",
          bottom: "0.35rem",
          fontSize: "0.58rem",
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#fff",
          background: "rgba(11,25,44,0.72)",
          padding: "0.12rem 0.35rem",
          borderRadius: "999px",
        }}
      >
        Video
      </span>
    </div>
  );
}

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
  const [carouselSheetOpen, setCarouselSheetOpen] = useState(false);
  useHistoryBackClose(carouselSheetOpen, () => setCarouselSheetOpen(false));
  const { runSave } = useDashboardFeedback();

  useEffect(() => {
    setSettings(getLocalSettings());
    void fetchRemoteSettings().then((remote) => {
      if (remote) setSettings(remote);
    });
  }, []);

  const handleSaveSettings = async (updated: Partial<SiteSettings>) => {
    const next = await saveLocalSettings(updated);
    setSettings(next);
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
    await runSave(async () => {
      setSettings(await saveLocalSettings({ bannerLayout: id }));
    }, `${HERO_LAYOUTS.find((layout) => layout.id === id)?.name || "Layout"} is now live.`);
  };

  const deactivate = async (id: HeroLayoutType) => {
    setMenuOpen(null);
    const fallback = visible.find((layout) => layout.id !== id)?.id || "split_portrait";
    await runSave(async () => {
      setSettings(await saveLocalSettings({ bannerLayout: fallback }));
    }, "Live homepage now uses another layout.");
  };

  const removeLayout = async (id: HeroLayoutType) => {
    setMenuOpen(null);
    if (visible.length <= 1) return;
    const nextHidden = [...(settings.hiddenHeroLayouts || []), id];
    const nextLive = liveId === id
      ? visible.find((layout) => layout.id !== id)?.id || "split_portrait"
      : liveId;
    await runSave(async () => {
      setSettings(await saveLocalSettings({ hiddenHeroLayouts: nextHidden, bannerLayout: nextLive }));
    }, "Layout removed from this dashboard list.");
  };

  const addLayout = async (id: HeroLayoutType) => {
    await runSave(async () => {
      setSettings(await saveLocalSettings({
        hiddenHeroLayouts: (settings.hiddenHeroLayouts || []).filter((item) => item !== id),
      }));
    }, "Layout added back.");
  };

  return (
    <div className="banners-page">
      <header className="banners-page-head">
        <div>
          <p className="section-label">Public homepage</p>
          <h1 className="banners-page-title">Hero layouts</h1>
        </div>
        <div className="banners-page-head-actions">
          <span className={settings.heroCarouselEnabled ? "banners-carousel-pill is-on" : "banners-carousel-pill"}>
            {settings.heroCarouselEnabled ? "Carousel on" : "Carousel off"}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setCarouselSheetOpen(true)}
          >
            <RiSettings3Line size={15} /> Configure carousel
          </button>
        </div>
      </header>

      {carouselSheetOpen ? (
        <div className="dash-sheet-layer" role="presentation">
          <button type="button" className="dash-sheet-backdrop" aria-label="Close carousel options" onClick={() => setCarouselSheetOpen(false)} />
          <div className="dash-sheet banners-carousel-modal" role="dialog" aria-modal="true" aria-labelledby="carousel-sheet-title">
            <header className="banners-modal-head">
              <div>
                <p className="banners-modal-kicker">Homepage</p>
                <h2 id="carousel-sheet-title">Moving carousel</h2>
                <p className="banners-modal-lead">
                  Rotate layouts on desktop, tablet, and mobile. Hover pauses on desktop.
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm banners-modal-close" onClick={() => setCarouselSheetOpen(false)} aria-label="Close">
                <RiCloseLine size={18} />
              </button>
            </header>

            <label className="banners-modal-check">
              <input
                type="checkbox"
                checked={Boolean(settings.heroCarouselEnabled)}
                onChange={(event) => handleSaveSettings({ heroCarouselEnabled: event.target.checked })}
              />
              <span>Rotate layouts</span>
            </label>

            <div className="banners-modal-section">
              <p className="banners-modal-label">Which layouts</p>
              <div className="banners-modal-pills" role="group" aria-label="Carousel mode">
                {(["all", "selected"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={(settings.heroCarouselMode || "all") === mode ? "is-on" : undefined}
                    onClick={() => handleSaveSettings({ heroCarouselMode: mode })}
                  >
                    {mode === "all" ? "All visible" : "Only selected"}
                  </button>
                ))}
              </div>
            </div>

            <label className="banners-modal-field">
              <span className="banners-modal-label">Interval (seconds)</span>
              <input
                type="number"
                min={4}
                max={20}
                value={settings.heroCarouselInterval || 8}
                onChange={(event) => handleSaveSettings({ heroCarouselInterval: Number(event.target.value) || 8 })}
              />
            </label>

            {settings.heroCarouselMode === "selected" ? (
              <div className="banners-modal-section">
                <p className="banners-modal-label">Selected layouts</p>
                <div className="banners-modal-checks">
                  {HERO_LAYOUTS.map((layout) => {
                    const selected = (settings.heroCarouselLayouts || []).includes(layout.id);
                    return (
                      <label key={layout.id} className="banners-modal-check is-row">
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
                        <span>{layout.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="banners-modal-foot">
              <button type="button" className="btn btn-primary" onClick={() => setCarouselSheetOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="dash-page-head" style={{ alignItems: "center" }}>
        <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "0.7rem", padding: "0.22rem" }} className="dash-hscroll">
          <span style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "0.55rem",
            background: "#ffffff",
            color: "#0e52a8",
            fontSize: "0.8rem",
            fontWeight: 800,
            boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
            whiteSpace: "nowrap",
          }}>
            Layout
          </span>
        </div>
        {hidden.length > 0 && (
          <div className="dash-hscroll" style={{ gap: "0.4rem" }}>
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

      <div className="banners-layout-grid">
        {visible.map((layout) => {
          const isActive = liveId === layout.id;
          const image = heroImageFor(settings, layout.id);
          const highlights = heroHighlights(settingsForLayout(settings, layout.id));
          return (
            <article
              key={layout.id}
              className={isActive ? "banners-layout-card is-active" : "banners-layout-card"}
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
                  {layoutCardPreview(image)}
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

              <div className="banners-card-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => openEditor(layout.id)}
                >
                  <RiEyeLine size={14} /> Preview
                </button>
                <button
                  type="button"
                  className={isActive ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  onClick={() => activate(layout.id)}
                  disabled={isActive}
                >
                  {isActive ? <><RiCheckLine size={14} /> Active</> : "Activate"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm banners-card-more"
                  aria-label={`More actions for ${layout.name}`}
                  onClick={() => setMenuOpen((current) => (current === layout.id ? null : layout.id))}
                >
                  <RiMoreLine size={16} />
                </button>
                {menuOpen === layout.id && (
                  <div className="banners-card-menu">
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
