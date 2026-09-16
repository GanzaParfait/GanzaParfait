"use client";

import Link from "next/link";
import { RiArrowRightLine, RiArrowRightSLine } from "react-icons/ri";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, setting } from "@/lib/hero";

export default function FeaturedOverlayHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const image = heroImageFor(settings, "featured_overlay");
  const highlights = heroHighlights(settings);

  return (
    <section
      className={isPreview ? "hero-cinematic hero-layout-preview" : "hero-cinematic"}
      style={isPreview ? {
        height: "100%",
        minHeight: "100%",
        paddingBottom: "2rem",
        paddingTop: "3rem",
      } : undefined}
    >
      <div className="hero-cinematic-media">
        <img src={image} alt={setting(settings, "siteTitle")} />
        <div className="hero-cinematic-shade" aria-hidden="true" />
      </div>

      <div className="container hero-cinematic-inner">
        <div className="hero-cinematic-copy">
          <p className="hero-cinematic-kicker">
            {setting(settings, "heroAvailableText")} · {settings.location}
          </p>
          <h1 className="hero-cinematic-title">{setting(settings, "heroHeadline")}</h1>
          <Link href={setting(settings, "heroPrimaryCtaHref")} className="hero-cinematic-action">
            {setting(settings, "heroPrimaryCtaLabel")}
            <RiArrowRightLine size={16} />
          </Link>
        </div>

        <aside className="hero-cinematic-card">
          <p className="hero-cinematic-card-label">{setting(settings, "heroCardLabel")}</p>
          <p className="hero-cinematic-card-body">{setting(settings, "heroCardBody")}</p>
          {highlights.length > 0 ? (
            <div className="hero-cinematic-highlights">
              {highlights.map((item) => (
                <div key={`${item.value}-${item.label}`} className="hero-cinematic-chip">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <Link href={setting(settings, "heroCardCtaHref")} className="hero-cinematic-card-cta">
            <span className="hero-cinematic-play">
              <RiArrowRightSLine size={18} />
            </span>
            {setting(settings, "heroCardCtaLabel")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
