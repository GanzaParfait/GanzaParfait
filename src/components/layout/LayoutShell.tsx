"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SubscribeWidget from "@/components/ui/SubscribeWidget";
import PageFloaters from "@/components/ui/PageFloaters";
import CommandPalette from "@/components/ui/CommandPalette";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import UtmCapture from "@/components/analytics/UtmCapture";
import SiteIntroOverlay from "@/components/intro/SiteIntroOverlay";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/email-preview");
  const isHome = pathname === "/";

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {isHome ? <SiteIntroOverlay /> : null}
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
      <Suspense fallback={null}>
        <UtmCapture />
        <PageViewTracker />
      </Suspense>
    </>
  );
}
