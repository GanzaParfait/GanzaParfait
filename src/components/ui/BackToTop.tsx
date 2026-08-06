"use client";

import { useEffect, useState } from "react";
import { RiArrowUpLine } from "react-icons/ri";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 40,
        width: "3rem",
        height: "3rem",
        borderRadius: "50%",
        background: "var(--color-primary)",
        color: "#ffffff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(14,82,168,0.35)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.8) translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <RiArrowUpLine size={20} />
    </button>
  );
}
