"use client";

import { useEffect, useState } from "react";
import { RiSunLine, RiMoonLine } from "react-icons/ri";

const LIGHT_THEME = "#ffffff";
const DARK_THEME = "#ffffff";

function applyThemeColor(dark: boolean) {
  const color = dark ? DARK_THEME : LIGHT_THEME;
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", color);
    document.head.appendChild(meta);
    return;
  }
  metas.forEach((meta) => meta.setAttribute("content", color));
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const dark = stored === "dark";
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    applyThemeColor(dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    applyThemeColor(next);
  };

  if (!mounted) {
    return <div className="theme-toggle" aria-hidden="true" style={{ width: "2.25rem", height: "2.25rem" }} />;
  }

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
    </button>
  );
}
