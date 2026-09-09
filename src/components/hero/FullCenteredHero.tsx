"use client";

import Link from "next/link";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, setting } from "@/lib/hero";
import { socialIcon, heroSocialsFor } from "@/lib/socials";

export default function FullCenteredHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const roles = setting(settings, "siteSubtitle").split(" • ").filter(Boolean);
  const primaryRole = roles[0] || "Founder";
  const image = heroImageFor(settings, "full_centered_floating");
  const name = setting(settings, "siteTitle");
  const email = setting(settings, "contactEmail");
  const location = setting(settings, "location");
  const socials = heroSocialsFor(settings);
  const highlights = heroHighlights(settings);

  return (
    <section
      className={isPreview ? "hero-centered hero-layout-preview" : "hero-centered"}
    >
      <div className="hero-centered-box">
        <div className="hero-centered-glow" aria-hidden="true" />
        <img src={image} alt={name} className="hero-centered-photo" />
        <div className="hero-centered-caption">
          <h1 className="hero-centered-name">{name}</h1>
          <p className="hero-centered-invite">
            {setting(settings, "heroInviteLine")}{" "}
            <Link href={setting(settings, "heroInviteCtaHref")} className="hero-centered-invite-link">
              {setting(settings, "heroInviteCtaLabel")}
            </Link>
          </p>
        </div>
      </div>

      <div className="hero-centered-info">
        <div className="hero-centered-left">
          <div className="hero-centered-pill">
            <p className="hero-centered-pill-title">{primaryRole}</p>
            <p className="hero-centered-pill-sub">Based in {location}</p>
          </div>
          <div className="hero-centered-pill">
            <p className="hero-centered-pill-sub">Say hello to</p>
            <a href={`mailto:${email}`} className="hero-centered-pill-title hero-centered-email">
              {email}
            </a>
          </div>
          <div className="hero-centered-socials">
            {socials.map((social) => {
              const Icon = socialIcon(social.platform);
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="hero-centered-social"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="hero-centered-stats">
          {highlights.map((item) => (
            <div key={`${item.value}-${item.label}`} className="hero-centered-stat">
              <p className="hero-centered-stat-value">{item.value}</p>
              <p className="hero-centered-stat-label">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
