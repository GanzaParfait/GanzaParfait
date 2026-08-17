"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RiAddLine, RiCheckLine, RiEditLine, RiDeleteBinLine } from "react-icons/ri";

import { getLocalSettings, saveLocalSettings, SiteSettings, DEFAULT_SETTINGS, HeroLayoutType } from "@/lib/supabase";
import BannerEditorModal, { BannerItem } from "@/components/dashboard/BannerEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: "b1",
    title: "Prince Parfait GANZA",
    subtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
    imageUrl: "/images/profile/hero-photo.png",
    buttonText: "View My Work",
    buttonLink: "/projects",
    pageLocation: "main_hero",
    sortOrder: 1,
    isActive: true,
    layoutStyle: "split_portrait",
  },
  {
    id: "b2",
    title: "Featured Executive Banner",
    subtitle: "Building Software that Creates Impact Across Africa and Beyond",
    imageUrl: "/images/profile/hero-photo.png",
    buttonText: "Let's Collaborate",
    buttonLink: "https://wa.me/250792054846",
    pageLocation: "main_hero",
    sortOrder: 2,
    isActive: true,
    layoutStyle: "featured_overlay",
  },
];

export default function BannersPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [bannersList, setBannersList] = useState<BannerItem[]>(DEFAULT_BANNERS);

  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const handleLayoutChange = (layout: HeroLayoutType) => {
    const updated = saveLocalSettings({ bannerLayout: layout });
    setSettings(updated);
  };

  const handleSaveBanner = (banner: BannerItem) => {
    const exists = bannersList.find((b) => b.id === banner.id);
    if (exists) {
      setBannersList(bannersList.map((b) => (b.id === banner.id ? banner : b)));
    } else {
      setBannersList([banner, ...bannersList]);
    }
  };

  const handleDeleteBanner = (id: string) => {
    setBannersList(bannersList.filter((b) => b.id !== id));
  };

  const handleToggleBannerActive = (id: string) => {
    setBannersList(bannersList.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
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
            Banners & Hero Layouts Manager
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
            Manage home page carousel, executive banners, and presentation layouts.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            setIsBannerModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
        >
          <RiAddLine size={16} /> New Banner
        </button>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.5rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
          Global Hero Layout
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
          Choose which layout structure is used for the main homepage welcome section.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {([
            { id: "split_portrait" as const, label: "Split Portrait", desc: "Image right, content left — cinematic two-column layout." },
            { id: "featured_overlay" as const, label: "Full Banner Overlay", desc: "Full-width image with gradient overlay and text." },
            { id: "full_centered_floating" as const, label: "Full Centered + Badges", desc: "Strong centered person image with attached floating innovation badges." },
          ]).map((opt) => {
            const isActive = (settings.bannerLayout || "split_portrait") === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleLayoutChange(opt.id)}
                style={{
                  padding: "1rem", borderRadius: "0.375rem",
                  border: `2px solid ${isActive ? "#1d4ed8" : "#e2e8f0"}`,
                  background: isActive ? "#eff6ff" : "#f8fafc",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: isActive ? "#1d4ed8" : "#0f172a", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  {isActive && <RiCheckLine size={14} />}
                  {opt.label}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", marginTop: "1rem" }}>
        Promotional Banners
      </h3>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Preview</th>
                <th style={{ padding: "0.75rem 1rem" }}>Title / Details</th>
                <th style={{ padding: "0.75rem 1rem" }}>Layout Style</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannersList.map((banner) => (
                <tr key={banner.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ position: "relative", width: "2.75rem", height: "2.75rem", borderRadius: "0.25rem", overflow: "hidden", background: "#e2e8f0" }}>
                      <img src={banner.imageUrl} alt={banner.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <p style={{ fontWeight: 700, color: "#0f172a" }}>{banner.title}</p>
                    <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{banner.subtitle}</p>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.15rem 0.45rem", borderRadius: "0.25rem", background: "#f1f5f9", color: "#334155" }}>
                      {banner.layoutStyle === "split_portrait" ? "Split Portrait" : "Gradient Overlay"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <button onClick={() => handleToggleBannerActive(banner.id)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: banner.isActive ? "rgba(34, 197, 94, 0.1)" : "rgba(100, 116, 139, 0.1)", color: banner.isActive ? "#16a34a" : "#64748b" }}>
                        {banner.isActive ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.375rem" }}>
                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setIsBannerModalOpen(true);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "0.375rem", borderRadius: "0.25rem" }}
                        title="Edit Banner"
                      >
                        <RiEditLine size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "0.375rem", color: "#ef4444", borderRadius: "0.25rem" }}
                        title="Delete Banner"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BannerEditorModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banner={editingBanner}
        onSave={handleSaveBanner}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingBanner((prev) => (prev ? { ...prev, imageUrl: url } : null)))}
      />

      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
