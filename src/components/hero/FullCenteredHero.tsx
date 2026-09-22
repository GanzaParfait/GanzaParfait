"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteSettings } from "@/lib/supabase";
import { heroHighlights, heroImageFor, heroPortraitAlt, heroRoles, setting } from "@/lib/hero";
import { socialIcon, heroSocialsFor } from "@/lib/socials";

export default function FullCenteredHero({
  settings,
  isPreview = false,
}: {
  settings: SiteSettings;
  isPreview?: boolean;
}) {
  const roles = heroRoles(settings);
  const image = heroImageFor(settings, "full_centered_floating");
  const name = setting(settings, "siteTitle");
  const portraitAlt = heroPortraitAlt(settings);
  const email = setting(settings, "contactEmail");
  const location = setting(settings, "location");
  const socials = heroSocialsFor(settings);
  const highlights = heroHighlights(settings);
  const [roleIndex, setRoleIndex] = useState(0);
  const isStatic = image.startsWith("/") && !image.startsWith("//");

  useEffect(() => {
    if (roles.length <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % roles.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [roles.length]);

  return (
    <section
      className={isPreview ? "hero-centered hero-layout-preview" : "hero-centered"}
    >
      <div className="hero-centered-box">
        <div className="hero-centered-scene" aria-hidden="true">
          <div className="hero-centered-grid" />
          <div className="hero-centered-orbit" />
          <div className="hero-centered-glow" />
          <div className="hero-centered-floor" />
        </div>
        <div className="hero-centered-figure">
          {isStatic ? (
            <Image
              src={image}
              alt={portraitAlt}
              width={900}
              height={1350}
              priority={!isPreview}
              fetchPriority={isPreview ? undefined : "high"}
              sizes="(max-width: 767px) 72vw, (max-width: 1100px) 40vw, 472px"
              className="hero-centered-photo"
            />
          ) : (
            <img
              src={image}
              alt={portraitAlt}
              className="hero-centered-photo"
              fetchPriority={isPreview ? undefined : "high"}
              decoding="async"
            />
          )}
        </div>
        <div className="hero-centered-caption">
          <h1 className="hero-centered-name">{name}</h1>
          <p className="sr-only">
            Founder, entrepreneur, technologist, software engineer and AI builder based in Kigali, Rwanda.
            Building digital products, business systems and practical AI with LERONY Ltd.
          </p>
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
            <ul className="hero-role-list is-cycling" aria-live="polite">
              {roles.map((role, index) => (
                <li
                  key={role}
                  className={index === roleIndex ? "is-active" : "is-idle"}
                  aria-current={index === roleIndex ? "true" : undefined}
                >
                  {role}
                </li>
              ))}
            </ul>
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
                  data-tip={social.label}
                  aria-label={social.label}
                  className="hero-centered-social social-tip"
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
