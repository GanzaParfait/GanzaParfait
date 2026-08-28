"use client";

import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";
import { SiteSettings } from "@/lib/supabase";
import { heroImageFor, setting } from "@/lib/hero";

export default function FeaturedOverlayHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const image = heroImageFor(settings, "featured_overlay");

  return (
    <section
      className={isPreview ? "relative w-full overflow-hidden flex items-end hero-layout-preview" : "relative w-full overflow-hidden flex items-end"}
      style={{
        height: isPreview ? "100%" : "100dvh",
        minHeight: isPreview ? "100%" : "600px",
        paddingBottom: "3.5rem",
        paddingTop: isPreview ? "3rem" : "var(--public-nav-offset, 3.6rem)",
      }}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={image}
          alt={setting(settings, "siteTitle")}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl w-full flex flex-col md:flex-row items-end justify-between gap-8">
        <div className="max-w-2xl flex-1">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.22em] mb-4">
            {setting(settings, "heroAvailableText")} · {settings.location}
          </p>
          <h1
            className="text-[2.4rem] md:text-[4.25rem] font-black text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-heading)", textShadow: "0 8px 40px rgba(0,0,0,0.45)" }}
          >
            {setting(settings, "heroHeadline")}
          </h1>
          <Link
            href={setting(settings, "heroPrimaryCtaHref")}
            className="inline-flex items-center justify-center bg-white text-slate-900 font-bold px-8 py-3.5 rounded-full text-sm tracking-wide hover:bg-slate-100 transition-colors"
          >
            {setting(settings, "heroPrimaryCtaLabel")}
          </Link>
        </div>

        <aside className="w-full md:w-[22rem] bg-black/55 backdrop-blur-md rounded-2xl p-7 border border-white/10 shrink-0">
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">
            {setting(settings, "heroCardLabel")}
          </p>
          <p className="text-white/90 text-sm leading-relaxed mb-6">{settings.bio}</p>
          <Link
            href={setting(settings, "heroCardCtaHref")}
            className="flex items-center gap-3 text-white w-fit"
          >
            <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center">
              <RiArrowRightSLine size={18} />
            </span>
            <span className="text-sm font-bold">{setting(settings, "heroCardCtaLabel")}</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}
