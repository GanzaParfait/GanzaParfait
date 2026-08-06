"use client";

import { useState } from "react";
import Image from "next/image";
import { RiCloseLine, RiSaveLine, RiUser3Line, RiMailLine, RiLockPasswordLine, RiImageAddLine } from "react-icons/ri";

export interface AdminProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AdminProfile;
  onSave: (updated: AdminProfile) => void;
  onOpenMedia: () => void;
}

export default function AdminProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onOpenMedia,
}: AdminProfileModalProps) {
  const [formData, setFormData] = useState<AdminProfile>(profile);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setMsg("Profile saved successfully!");
    setTimeout(() => {
      setMsg("");
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 210,
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
          maxWidth: "26rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem", // Small radius
          boxShadow: "var(--shadow-xl)",
          padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)" }}>
            Admin Profile Settings
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        {msg && (
          <div style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", fontSize: "0.8125rem", textAlign: "center", marginBottom: "1rem", fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ position: "relative", width: "4rem", height: "4rem", borderRadius: "50%", overflow: "hidden", background: "#f1f5f9", border: "2px solid var(--color-primary)" }}>
              <Image src={formData.avatarUrl || "/images/profile/hero-photo.png"} alt={formData.name} fill className="object-cover" />
            </div>
            <div>
              <button
                type="button"
                onClick={onOpenMedia}
                className="btn btn-outline btn-sm"
                style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
              >
                <RiImageAddLine size={16} /> Change Avatar
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Full Display Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Change Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ borderRadius: "0.375rem" }}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
              <RiSaveLine size={16} /> Save Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
