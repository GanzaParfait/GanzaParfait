"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RiLockPasswordLine, RiMailLine, RiShieldUserLine, RiArrowRightLine } from "react-icons/ri";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.trim().toLowerCase() === "ganzaparfait7@gmail.com" && password === "0000") {
      if (typeof window !== "undefined") {
        localStorage.setItem("ppg_admin_auth", "true");
        document.cookie = "ppg_admin_auth=true; path=/; max-age=86400";
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } else {
      setLoading(false);
      setError("Invalid credentials. Please verify email and password.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", padding: "1.5rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "26rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ position: "relative", width: "10rem", height: "3rem", margin: "0 auto 1rem" }}>
            <Image
              src="/brand/logos/logo-horizontal-dark.png"
              alt="Prince Parfait GANZA"
              fill
              className="object-contain"
            />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <RiShieldUserLine style={{ color: "var(--color-primary)" }} /> Admin Portal
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
            Sign in to access Control Center & Analytics
          </p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444", fontSize: "0.8125rem", marginBottom: "1.5rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
              Admin Email
            </label>
            <div style={{ position: "relative" }}>
              <RiMailLine size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-3)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ganzaparfait7@gmail.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.875rem 0.75rem 2.5rem",
                  borderRadius: "0.75rem",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-2)", marginBottom: "0.375rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <RiLockPasswordLine size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-3)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.875rem 0.75rem 2.5rem",
                  borderRadius: "0.75rem",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.875rem", gap: "0.5rem" }}
          >
            {loading ? "Authenticating..." : <>Sign In to Dashboard <RiArrowRightLine size={16} /></>}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-3)" }}>
          Target Email: ganzaparfait7@gmail.com
        </div>
      </div>
    </div>
  );
}
