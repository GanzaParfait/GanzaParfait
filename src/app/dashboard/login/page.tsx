"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  RiLockPasswordLine,
  RiMailLine,
  RiShieldUserLine,
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { LAYOUT_HERO_IMAGES } from "@/lib/hero";
import { siteConfig } from "@/data/site-data";
import Footer from "@/components/layout/Footer";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.trim().toLowerCase() === "ganzaparfait7@gmail.com" && password === "0000") {
      if (typeof window !== "undefined") {
        localStorage.setItem("ppg_admin_auth", "true");
        document.cookie = "ppg_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
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
    <div className="login-shell" data-theme="light">
      <main className="login-split">
        <aside className="login-visual" aria-hidden="true">
          <p className="login-kicker">Control Center</p>
          <p className="hero-centered-name login-visual-name">{siteConfig.name}</p>
          <img
            src={LAYOUT_HERO_IMAGES.full_centered_floating}
            alt=""
            className="login-visual-photo"
          />
        </aside>

        <section className="login-panel">
          <div className="login-card">
            <Link href="/" aria-label={`${siteConfig.name} — Home`} className="login-logo">
              <Image
                src="/brand/logos/logo-horizontal-blue.png"
                alt={siteConfig.name}
                width={220}
                height={52}
                priority
                style={{ width: "11.5rem", height: "auto" }}
              />
            </Link>

            <h1 className="login-title">
              <RiShieldUserLine aria-hidden="true" />
              Sign in
            </h1>
            <p className="login-subtitle">Access Control Center to manage the public site.</p>

            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="login-form">
              <label className="login-label">
                Email
                <span className="login-field">
                  <RiMailLine size={18} aria-hidden="true" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                  />
                </span>
              </label>

              <label className="login-label">
                Password
                <span className="login-field">
                  <RiLockPasswordLine size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPassword((open) => !open)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </button>
                </span>
              </label>

              <button type="submit" disabled={loading} className="btn btn-primary login-submit">
                {loading ? "Signing in…" : <>Continue <RiArrowRightLine size={18} /></>}
              </button>
            </form>

            <p className="login-back">
              <Link href="/">Back to princeparfait.com</Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
