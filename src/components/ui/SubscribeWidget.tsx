"use client";

import { useState, useEffect } from "react";
import { RiMailSendLine, RiCloseLine, RiCheckDoubleLine } from "react-icons/ri";
import { supabase } from "@/lib/supabase";

export default function SubscribeWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (localStorage.getItem("subscribe-dismissed")) {
      setIsDismissed(true);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), 8000); // 8s for new visitors
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
    }, 500);
    localStorage.setItem("subscribe-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const device = navigator.userAgent;
      let country = "Unknown";
      let location = Intl.DateTimeFormat().resolvedOptions().timeZone;

      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_name) country = data.country_name;
        if (data.city) location = `${data.city}, ${data.region}`;
      } catch (e) {
        console.warn("Could not fetch location", e);
      }

      const { error } = await supabase
        .from("subscribers")
        .insert([{ email, device, location, country }]);

      if (error && error.code !== '23505') throw error; // Ignore if already subscribed

      setStatus("success");
      setTimeout(() => {
        handleDismiss();
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (isDismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "1.25rem",
        boxShadow: "var(--shadow-lg)",
        padding: "1.5rem",
        width: "calc(100vw - 3rem)",
        maxWidth: "22rem",
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(100px) scale(0.9)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <button
        onClick={handleDismiss}
        style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          color: "var(--color-text-3)",
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        <RiCloseLine size={20} />
      </button>

      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <RiCheckDoubleLine
            size={56}
            color="#22c55e"
            style={{ margin: "0 auto 1rem", animation: "float 3s ease-in-out infinite" }}
          />
          <h4 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.5rem" }}>
            You&apos;re In! ✓
          </h4>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)" }}>
            Thanks for joining. I'll keep you updated with my latest projects and insights.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "rgba(14,82,168,0.1)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RiMailSendLine size={20} />
            </div>
            <h4 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
              Stay Updated
            </h4>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Subscribe to my newsletter to get the latest insights on AI and Software Engineering.
          </p>
          
          <div style={{ position: "relative" }}>
            <input
              type="email"
              placeholder="Your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                paddingRight: "5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn btn-primary"
              style={{
                position: "absolute",
                right: "0.25rem",
                top: "0.25rem",
                bottom: "0.25rem",
                padding: "0 1rem",
                borderRadius: "0.5rem",
                fontSize: "0.8125rem",
              }}
            >
              {status === "loading" ? "..." : "Join"}
            </button>
          </div>
          {status === "error" && (
            <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.5rem" }}>Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
