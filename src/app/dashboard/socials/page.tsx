"use client";

import { useState, useEffect } from "react";
import { getLocalSettings, saveLocalSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/supabase";

export default function SocialsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const handleSocialLimitChange = (limit: number) => {
    const updated = saveLocalSettings({ headerSocialLimit: limit });
    setSettings(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
          Social Links & Header Controls
        </h2>
        <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
          Limit how many social icons appear in top header before overflow into menu.
        </p>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
          Primary Header Social Icons Limit
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
          Select how many primary icons to show directly in top header:
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleSocialLimitChange(num)}
              style={{
                padding: "0.5rem 1.125rem",
                borderRadius: "0.375rem",
                fontWeight: 700,
                fontSize: "0.8125rem",
                border: "1px solid #cbd5e1",
                background: (settings.headerSocialLimit || 3) === num ? "#1d4ed8" : "#ffffff",
                color: (settings.headerSocialLimit || 3) === num ? "#ffffff" : "#0f172a",
                cursor: "pointer",
              }}
            >
              {num} {num === 1 ? "Icon" : "Icons"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
