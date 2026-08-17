"use client";

import { useState, useEffect } from "react";
import { RiSaveLine } from "react-icons/ri";
import { getLocalSettings, saveLocalSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/supabase";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getLocalSettings());
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      saveLocalSettings(settings);
      setIsSaving(false);
      setMsg("Site information saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    }, 800);
  };

  const handleSocialLimitChange = (limit: number) => {
    const updated = saveLocalSettings({ headerSocialLimit: limit });
    setSettings(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.5rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <form id="settings-form" onSubmit={handleSettingsSave}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                Site &amp; Brand Information
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Update global site identity fields shown across the portfolio.
              </p>
            </div>
            <button type="submit" form="settings-form" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem", borderRadius: "0.375rem", gap: "0.375rem" }} disabled={isSaving}>
              {isSaving ? <span className="animate-spin">⏳</span> : <RiSaveLine size={16} />} 
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
          
          {msg && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", fontSize: "0.875rem", fontWeight: 600, border: "1px solid rgba(34,197,94,0.2)", marginBottom: "1.25rem" }}>
              {msg}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                Display Name
              </label>
              <input type="text" value={settings.siteTitle || ""}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                Location
              </label>
              <input type="text" value={settings.location || ""}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="e.g. Kigali, Rwanda"
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                Roles &amp; Tagline <span style={{ color: "#94a3b8", fontWeight: 400 }}>(separated by " • ")</span>
              </label>
              <input type="text" value={settings.siteSubtitle || ""}
                onChange={(e) => setSettings({ ...settings, siteSubtitle: e.target.value })}
                placeholder="Founder • Software Engineer • AI Builder"
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                Bio Summary
              </label>
              <textarea rows={3} value={settings.bio || ""}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                Contact Email
              </label>
              <input type="email" value={settings.contactEmail || ""}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="hello@princeparfait.com"
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                WhatsApp Number <span style={{ color: "#94a3b8", fontWeight: 400 }}>(digits only)</span>
              </label>
              <input type="text" value={settings.whatsappNumber || ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="250792054846"
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.8125rem", color: "#0f172a", outline: "none" }}
              />
            </div>
          </div>


        </form>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.5rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
          Header Social Icons Limit
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
          How many icons appear directly in the top nav before overflow menu.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSocialLimitChange(num)}
              style={{
                padding: "0.5rem 1.125rem", borderRadius: "0.375rem",
                fontWeight: 700, fontSize: "0.8125rem",
                border: "1px solid #cbd5e1",
                background: (settings.headerSocialLimit || 3) === num ? "#1d4ed8" : "#ffffff",
                color: (settings.headerSocialLimit || 3) === num ? "#ffffff" : "#0f172a",
                cursor: "pointer", transition: "all 0.15s ease",
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
