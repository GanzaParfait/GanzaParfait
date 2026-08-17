"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  RiSaveLine, 
  RiImageAddLine, 
  RiLockPasswordLine, 
  RiUser3Line, 
  RiShieldStarLine, 
  RiTimeLine,
  RiRefreshLine
} from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";

// Re-defining interface to avoid circular deps or complex imports
export interface AdminProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<AdminProfile>({
    name: "Prince Parfait GANZA",
    email: "ganzaparfait7@gmail.com",
    avatarUrl: "/images/profile/hero-photo.png",
    role: "Super Admin",
  });
  
  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  // Avatar preview state
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ppg_admin_profile");
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      setMsg("New passwords do not match!");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
      const updatedData = {
        ...formData,
        avatarUrl: previewAvatar || formData.avatarUrl
      };

      localStorage.setItem("ppg_admin_profile", JSON.stringify(updatedData));
      window.dispatchEvent(new Event("ppg_profile_updated"));
      
      setFormData(updatedData);
      setPreviewAvatar(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setIsSaving(false);
      setMsg("Profile saved successfully!");
      setTimeout(() => {
        setMsg("");
      }, 3000);
    }, 800);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "100%", margin: "0 auto", width: "100%", paddingBottom: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
            Profile Settings
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem" }}>
            Manage your personal information, security preferences, and view account metrics.
          </p>
        </div>
        <button form="profile-form" type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "0.875rem", borderRadius: "0.5rem", gap: "0.5rem", whiteSpace: "nowrap" }} disabled={isSaving}>
          {isSaving ? <span className="animate-spin">⏳</span> : <RiSaveLine size={18} />} 
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      
      {msg && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "0.5rem", background: msg.includes("successfully") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: msg.includes("successfully") ? "#16a34a" : "#ef4444", fontSize: "0.875rem", fontWeight: 600, border: `1px solid ${msg.includes("successfully") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
          {msg}
        </div>
      )}

      <form id="profile-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Section: Avatar */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiUser3Line color="#1d4ed8" /> Avatar & Identity
          </h3>
          
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
            {/* Current */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Current</span>
              <div style={{ position: "relative", width: "5.5rem", height: "5.5rem", borderRadius: "50%", overflow: "hidden", background: "#f1f5f9", border: "2px solid #e2e8f0" }}>
                <img src={formData.avatarUrl || "/images/profile/hero-photo.png"} alt={formData.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            
            {/* Arrow */}
            <RiRefreshLine size={24} color="#cbd5e1" />
            
            {/* Preview */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: previewAvatar ? "#1d4ed8" : "#94a3b8", textTransform: "uppercase" }}>Preview</span>
              <div style={{ position: "relative", width: "5.5rem", height: "5.5rem", borderRadius: "50%", overflow: "hidden", background: "#f8fafc", border: `2px dashed ${previewAvatar ? "#1d4ed8" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <RiUser3Line size={28} color="#cbd5e1" />
                )}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: "14rem", marginLeft: "1rem" }}>
              <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "0.875rem" }}>
                Select a new image from your media library to update your avatar across the dashboard.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => triggerMediaPicker((url) => setPreviewAvatar(url))}
                  className="btn btn-outline"
                  style={{ gap: "0.375rem", borderRadius: "0.375rem", fontSize: "0.8125rem", padding: "0.5rem 1rem" }}
                >
                  <RiImageAddLine size={16} /> Choose from Library
                </button>
                {previewAvatar && (
                  <button
                    type="button"
                    onClick={() => setPreviewAvatar(null)}
                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))", gap: "1.5rem" }}>
          {/* Section: Basic Details */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>
              Personal Details
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "0.875rem" }}
                />
              </div>
            </div>
          </div>

          {/* Section: Security */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <RiLockPasswordLine color="#ef4444" /> Security Settings
            </h3>
            
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.25rem" }}>
              To update your password, please provide your current password and confirm the new one. Leave blank if you don't wish to change it.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "0.875rem" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "0.875rem" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "0.875rem" }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Section: Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.375rem", background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiShieldStarLine size={22} />
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>System Role</p>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{formData.role}</p>
          </div>
        </div>
        
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.375rem", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiTimeLine size={22} />
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Last Login</p>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Just now</p>
          </div>
        </div>
      </div>

      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
