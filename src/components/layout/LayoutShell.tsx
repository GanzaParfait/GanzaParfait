"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SubscribeWidget from "@/components/ui/SubscribeWidget";
import PageFloaters from "@/components/ui/PageFloaters";
import CommandPalette from "@/components/ui/CommandPalette";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import UtmCapture from "@/components/analytics/UtmCapture";
import SiteIntroOverlay from "@/components/intro/SiteIntroOverlay";
import TestimonialShareViewer from "@/components/testimonials/TestimonialShareViewer";

function resetPageScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.getElementById("main-content")?.scrollTo?.(0, 0);
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipScrollReset = useRef(false);
  const isBare =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/email-preview");
  const isHome = pathname === "/";

  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname !== pathname) skipScrollReset.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [pathname]);

  useLayoutEffect(() => {
    if (skipScrollReset.current) {
      skipScrollReset.current = false;
      return;
    }
    if (window.location.hash) return;
    resetPageScroll();
    const frame = window.requestAnimationFrame(resetPageScroll);
    const timer = window.setTimeout(resetPageScroll, 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteIntroOverlay />
      <Navbar />
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className={isHome ? "site-main is-home" : "site-main"}
      >
        {children}
      </main>
      <Footer />
      <PageFloaters />
      <CommandPalette />
      <SubscribeWidget />
      <TestimonialShareViewer />
      <Suspense fallback={null}>
        <UtmCapture />
        <PageViewTracker />
      </Suspense>
    </>
  );
}
