import { siteUrl } from "@/lib/env";
import { PORTRAIT_PATH } from "@/lib/schema";
import { socialsFor, type SocialLink } from "@/lib/socials";
import type { EmailHeaderLayout, SiteSettings } from "@/lib/supabase";
import { DEFAULT_SETTINGS } from "@/lib/supabase";

const FONT = 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const SOCIAL_ICON_FILES: Record<string, string> = {
  linkedin: "linkedin.svg",
  github: "github.svg",
  instagram: "instagram.svg",
  twitter: "twitter.svg",
  youtube: "youtube.svg",
  whatsapp: "whatsapp.svg",
  facebook: "facebook.svg",
  tiktok: "tiktok.svg",
  threads: "threads.svg",
  website: "website.svg",
  buymeacoffee: "buymeacoffee.svg",
  luma: "luma.svg",
  custom: "custom.svg",
};

function resolveOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }
  return siteUrl();
}

export type BrandMailContent = {
  preheader?: string;
  eyebrow?: string;
  title: string;
  body: string;
  detail?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  footerNote?: string;
  /** Extra HTML injected before the signature (cards, lists, tips). */
  blocksHtml?: string;
  /** Hide default primary CTA row. */
  hideCta?: boolean;
  /** Contact-style meta row under eyebrow. */
  metaRight?: string;
  badgeTone?: "blue" | "green";
};

export type EmailBrandContext = {
  origin: string;
  title: string;
  subtitle: string;
  roles: string;
  location: string;
  phone: string;
  contactEmail: string;
  primary: string;
  tagline: string;
  headerLayout: EmailHeaderLayout;
  showSignature: boolean;
  signatureQuote: string;
  showSocials: boolean;
  showPhone: boolean;
  portraitUrl: string;
  logoUrl: string;
  logoLightUrl: string;
  bannerKicker: string;
  bannerHeadline: string;
  navLinks: { label: string; href: string }[];
  preferencesUrl: string;
  unsubscribeUrl: string;
  footerNote: string;
  socials: SocialLink[];
  welcome: {
    eyebrow: string;
    title: string;
    body: string;
    features: string[];
    ctaLabel: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
    imageUrl: string;
  };
  contact: {
    badge: string;
    tip: string;
  };
};

function normalizeHeaderLayout(value?: string): EmailHeaderLayout {
  if (value === "nav_socials" || value === "banner" || value === "profile" || value === "brand_tagline") return value;
  if (value === "brand_url" || value === "compact") return "nav_socials";
  if (value === "stacked") return "banner";
  return "brand_tagline";
}

function parseNavLinks(raw: string | undefined, origin: string) {
  const fallback = [
    { label: "About", href: "/about" },
    { label: "Work", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Ventures", href: "/ventures" },
    { label: "Contact", href: "/contact" },
  ];
  const lines = String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return fallback.map((item) => ({ ...item, href: abs(origin, item.href) }));
  return lines.map((line) => {
    const [label, path] = line.split("|").map((part) => part.trim());
    return { label: label || "Link", href: abs(origin, path || "/") };
  });
}

function abs(origin: string, path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function emailBrandFromSettings(settings?: Partial<SiteSettings> | null): EmailBrandContext {
  const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  const origin = resolveOrigin();
  const subtitle = (s.siteSubtitle || DEFAULT_SETTINGS.siteSubtitle).trim();
  const roles = subtitle
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");
  const features = String(s.emailWelcomeFeatures || DEFAULT_SETTINGS.emailWelcomeFeatures || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    origin,
    title: s.siteTitle || DEFAULT_SETTINGS.siteTitle,
    subtitle,
    roles: roles || "Founder · Entrepreneur · Technologist",
    location: s.location || DEFAULT_SETTINGS.location,
    phone: s.phoneNumber || "",
    contactEmail: s.contactEmail || DEFAULT_SETTINGS.contactEmail,
    primary: s.emailPrimaryColor || "#0E52AB",
    tagline: s.emailTagline || "Ideas. Projects. Real Impact.",
    headerLayout: normalizeHeaderLayout(s.emailHeaderLayout),
    showSignature: s.emailShowSignature !== false,
    signatureQuote: s.emailSignatureQuote || DEFAULT_SETTINGS.emailSignatureQuote || "",
    showSocials: s.emailShowSocials !== false,
    showPhone: s.emailShowPhone !== false,
    portraitUrl: abs(origin, s.emailPortraitUrl || s.heroImageUrl || PORTRAIT_PATH),
    logoUrl: abs(origin, "/brand/logos/logo-horizontal-blue.png"),
    logoLightUrl: abs(origin, "/brand/logos/logo-horizontal-light.png"),
    bannerKicker: s.emailBannerKicker || "Turning ideas into",
    bannerHeadline: s.emailBannerHeadline || "Real solutions",
    navLinks: parseNavLinks(s.emailHeaderNav || DEFAULT_SETTINGS.emailHeaderNav, origin),
    preferencesUrl: abs(origin, s.emailPreferencesUrl || "/contact"),
    unsubscribeUrl: abs(origin, s.emailUnsubscribeUrl || "/contact"),
    footerNote: s.emailFooterNote || "",
    socials: socialsFor(s as SiteSettings, "footer").slice(0, 5),
    welcome: {
      eyebrow: s.emailWelcomeEyebrow || "Welcome aboard",
      title: s.emailWelcomeTitle || "Thanks for joining!",
      body:
        s.emailWelcomeBody ||
        "You are on the list for notes from a founder, entrepreneur and technologist — published only when there is something worth saying.",
      features,
      ctaLabel: s.emailWelcomeCtaLabel || "Explore princeparfait.com →",
    },
    newsletter: {
      eyebrow: s.emailNewsletterEyebrow || "From the desk",
      title: s.emailNewsletterTitle || "Ideas. Projects. Real Impact.",
      body:
        s.emailNewsletterBody ||
        "Updates on software, systems, and work that turns complex needs into something people can use.",
      ctaLabel: s.emailNewsletterCtaLabel || "Read the latest on the site →",
      imageUrl: abs(origin, s.emailNewsletterImageUrl || ""),
    },
    contact: {
      badge: s.emailContactBadge || "New contact message",
      tip:
        s.emailContactTip ||
        "Quick tip: Reply directly to this email or use the Control Center to manage this conversation, add notes, or convert it to a project.",
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hostLabel(origin: string) {
  try {
    return new URL(origin).host.replace(/^www\./, "").toUpperCase();
  } catch {
    return "PRINCEPARFAIT.COM";
  }
}

function renderHeader(brand: EmailBrandContext) {
  const host = hostLabel(brand.origin);
  const fullLogo = `<img src="${escapeAttr(brand.logoUrl)}" width="168" height="40" alt="${escapeAttr(brand.title)}" style="display:block;border:0;width:168px;height:auto;max-width:100%" />`;
  const fullLogoLight = `<img src="${escapeAttr(brand.logoLightUrl)}" width="168" height="40" alt="${escapeAttr(brand.title)}" style="display:block;border:0;width:168px;height:auto;max-width:100%" />`;
  const roles = `<div style="font-size:11px;color:#64748B;letter-spacing:.02em;margin-top:6px;font-family:${FONT}">${escapeHtml(brand.roles)}</div>`;
  const rolesLight = `<div style="font-size:11px;color:rgba(255,255,255,.82);letter-spacing:.02em;margin-top:6px;font-family:${FONT}">${escapeHtml(brand.roles)}</div>`;
  const url = `<a href="${escapeAttr(brand.origin)}" style="color:${brand.primary};text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.08em;font-family:${FONT}">${escapeHtml(host)}</a>`;
  const tagline = `<div style="font-size:11px;color:#64748B;margin-top:3px;font-family:${FONT}">${escapeHtml(brand.tagline)}</div>`;
  const accent = `<div style="height:3px;background:${brand.primary};line-height:3px;font-size:0">&nbsp;</div>`;

  if (brand.headerLayout === "nav_socials") {
    const preferred = brand.navLinks.filter((link) => /^(about|contact)$/i.test(link.label));
    const navLinks = preferred.length ? preferred : brand.navLinks.slice(0, 2);
    const nav = navLinks
      .map((link, index) => {
        const sep = index > 0 ? `<span style="color:#CBD5E1;padding:0 6px">|</span>` : "";
        return `${sep}<a href="${escapeAttr(link.href)}" style="color:#475569;text-decoration:none;font-size:11px;font-weight:650;font-family:${FONT}">${escapeHtml(link.label)}</a>`;
      })
      .join("");
    const socialIcons = brand.socials
      .slice(0, 5)
      .map((link) => {
        const file = SOCIAL_ICON_FILES[link.platform] || SOCIAL_ICON_FILES.custom;
        const src = abs(brand.origin, `/brand/email-social/${file}`);
        return `<a href="${escapeAttr(link.url)}" style="display:inline-block;margin-left:6px;vertical-align:middle"><img src="${escapeAttr(src)}" width="24" height="24" alt="${escapeAttr(link.label)}" style="display:block;border:0;border-radius:999px" /></a>`;
      })
      .join("");
    return `${accent}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px" class="email-nav-header">
      <tr>
        <td class="email-stack" style="vertical-align:middle;width:170px;padding-bottom:8px">${fullLogo}${roles}</td>
        <td class="email-stack email-nav-social-col" style="vertical-align:middle;text-align:right;padding-left:10px;padding-bottom:8px">
          <div class="email-nav-row" style="font-size:11px;line-height:1.2;white-space:nowrap">${nav}</div>
          <div class="email-social-row" style="margin-top:8px;line-height:0;white-space:nowrap">${socialIcons}</div>
        </td>
      </tr>
    </table>`;
  }

  if (brand.headerLayout === "banner") {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.primary};border-radius:10px;overflow:hidden">
      <tr>
        <td style="padding:10px 12px;background:linear-gradient(105deg, ${brand.primary} 0%, ${brand.primary} 58%, #0b3d7a 100%)">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
            <td class="email-stack" style="vertical-align:middle;width:38%;padding-bottom:6px">${fullLogoLight.replace('width="168"', 'width="132"').replace("width:168px", "width:132px")}${rolesLight.replace("margin-top:6px", "margin-top:4px").replace("font-size:11px", "font-size:10px")}</td>
            <td class="email-hide-mobile" style="width:1px;background:rgba(255,255,255,.35)">&nbsp;</td>
            <td class="email-stack" style="vertical-align:middle;padding:0 10px 6px;width:32%">
              <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.8);font-family:${FONT}">${escapeHtml(brand.bannerKicker)}</div>
              <div style="font-size:13px;font-weight:800;color:#fff;letter-spacing:.02em;text-transform:uppercase;margin-top:2px;font-family:${FONT}">${escapeHtml(brand.bannerHeadline)}</div>
            </td>
            <td class="email-stack" style="vertical-align:middle;text-align:right;width:30%">
              <a href="${escapeAttr(brand.origin)}" style="color:#fff;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.08em;font-family:${FONT}">${escapeHtml(host)}</a>
              <div style="font-size:10px;color:rgba(255,255,255,.82);margin-top:2px;font-family:${FONT}">People. Technology. A Better Tomorrow.</div>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>`;
  }

  if (brand.headerLayout === "profile") {
    const quote = brand.signatureQuote || "Building meaningful solutions for a better tomorrow.";
    return `${accent}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px" class="email-profile-header">
      <tr>
        <td class="email-stack" style="vertical-align:top;padding-bottom:8px;width:68%">
          <table role="presentation" cellspacing="0" cellpadding="0" width="100%"><tr>
            <td style="vertical-align:middle;width:52px">
              <img src="${escapeAttr(brand.portraitUrl)}" width="48" height="48" alt="" style="display:block;border-radius:999px;object-fit:cover;border:0" />
            </td>
            <td style="vertical-align:middle;padding-left:12px">
              <div style="font-size:15px;font-weight:800;color:#0F172A;font-family:${FONT}">${escapeHtml(brand.title)}</div>
              ${roles}
            </td>
          </tr></table>
          <div style="margin-top:10px;font-size:12px;color:#64748B;font-style:italic;line-height:1.45;font-family:${FONT}">
            “${escapeHtml(quote)}”
          </div>
        </td>
        <td class="email-stack email-cta-right" style="vertical-align:middle;text-align:right;width:32%;padding-left:12px;padding-bottom:8px">
          <a href="${escapeAttr(brand.origin)}" style="color:${brand.primary};text-decoration:none;font-weight:800;font-size:12px;letter-spacing:.04em;font-family:${FONT}">↗ ${escapeHtml(host)}</a>
          <div style="margin-top:6px;font-size:11px;color:#64748B;font-family:${FONT};text-align:right">📍 ${escapeHtml(brand.location)}</div>
        </td>
      </tr>
    </table>`;
  }

  // brand_tagline — logo left; domain + tagline flush right
  return `${accent}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px"><tr>
    <td class="email-stack" style="vertical-align:middle;padding-bottom:8px">${fullLogo}${roles}</td>
    <td class="email-stack" style="vertical-align:middle;text-align:right;padding-bottom:4px">${url}${tagline}</td>
  </tr></table>`;
}

function renderSocials(brand: EmailBrandContext) {
  if (!brand.showSocials || !brand.socials.length) return "";
  const cells = brand.socials
    .map((link) => {
      const file = SOCIAL_ICON_FILES[link.platform] || SOCIAL_ICON_FILES.custom;
      const src = abs(brand.origin, `/brand/email-social/${file}`);
      const label = link.label || link.platform;
      return `<td style="padding:0 4px">
        <a href="${escapeAttr(link.url)}" style="display:inline-block;width:34px;height:34px;border-radius:999px;overflow:hidden;text-decoration:none" title="${escapeAttr(label)}">
          <img src="${escapeAttr(src)}" width="34" height="34" alt="${escapeAttr(label)}" style="display:block;border:0;width:34px;height:34px" />
        </a>
      </td>`;
    })
    .join("");
  return `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 14px"><tr>${cells}</tr></table>`;
}

function renderSignature(brand: EmailBrandContext) {
  if (!brand.showSignature) return "";
  const quote = brand.signatureQuote
    ? `<div style="margin-top:6px;font-size:12px;color:#64748B;font-style:italic;line-height:1.45">“${escapeHtml(brand.signatureQuote)}”</div>`
    : "";
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;border-top:1px solid #E2E8F0;padding-top:22px">
    <tr>
      <td style="width:56px;vertical-align:top">
        <img src="${escapeAttr(brand.portraitUrl)}" width="48" height="48" alt="" style="display:block;border-radius:999px;object-fit:cover;border:0" />
      </td>
      <td style="vertical-align:top;padding-left:12px">
        <div style="font-size:14px;font-weight:800;color:#0F172A">${escapeHtml(brand.title)}</div>
        <div style="font-size:12px;color:#64748B;margin-top:2px">${escapeHtml(brand.roles)}</div>
        ${quote}
      </td>
    </tr>
  </table>`;
}

function renderFooter(brand: EmailBrandContext) {
  const year = new Date().getFullYear();
  const phone =
    brand.showPhone && brand.phone
      ? `<div style="margin:0 0 8px;font-size:12px;color:#64748B">${escapeHtml(brand.phone)}</div>`
      : "";
  const note = brand.footerNote
    ? `<div style="margin:0 0 8px;font-size:12px;color:#64748B">${escapeHtml(brand.footerNote)}</div>`
    : "";
  return `<td style="padding:22px 24px 26px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center">
    ${renderSocials(brand)}
    ${phone}
    <div style="font-size:12px;color:#64748B;margin:0 0 8px">${escapeHtml(brand.location)} · <a href="${escapeAttr(brand.origin)}" style="color:${brand.primary};text-decoration:none;font-weight:700">${escapeHtml(brand.origin.replace(/^https?:\/\//, ""))}</a></div>
    ${note}
    <div style="font-size:11px;color:#94A3B8;margin:0 0 10px">
      <a href="${escapeAttr(brand.preferencesUrl)}" style="color:#64748B;text-decoration:underline">Manage preferences</a>
      &nbsp;|&nbsp;
      <a href="${escapeAttr(brand.unsubscribeUrl)}" style="color:#64748B;text-decoration:underline">Unsubscribe</a>
    </div>
    <div style="font-size:11px;color:#94A3B8">© ${year} ${escapeHtml(brand.title)}. All rights reserved.</div>
  </td>`;
}

function renderCtas(brand: EmailBrandContext, content: BrandMailContent) {
  if (content.hideCta) return "";
  const primary =
    content.ctaLabel && content.ctaHref
      ? `<a href="${escapeAttr(content.ctaHref)}" style="display:inline-block;background:${brand.primary};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 18px;border-radius:999px">${escapeHtml(content.ctaLabel)}</a>`
      : "";
  const secondary =
    content.secondaryCtaLabel && content.secondaryCtaHref
      ? `<a href="${escapeAttr(content.secondaryCtaHref)}" style="display:inline-block;background:#fff;color:${brand.primary};text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:999px;border:1px solid ${brand.primary}">${escapeHtml(content.secondaryCtaLabel)}</a>`
      : "";
  if (!primary && !secondary) return "";
  if (primary && secondary) {
    return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0 0"><tr>
      <td style="padding:0 8px 8px 0">${primary}</td>
      <td style="padding:0 0 8px">${secondary}</td>
    </tr></table>`;
  }
  return `<p style="margin:26px 0 0">${primary || secondary}</p>`;
}

/** Shared HTML look for every outbound message. */
export function brandEmailHtml(content: BrandMailContent, settings?: Partial<SiteSettings> | null) {
  const brand = emailBrandFromSettings(settings);
  const preheader = content.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(content.preheader)}</div>`
    : "";
  const badgeColor = content.badgeTone === "green" ? "#10B981" : brand.primary;
  const badgeBg = content.badgeTone === "green" ? "#ECFDF5" : "#EAF2FB";
  const eyebrow = content.eyebrow
    ? `<span style="display:inline-block;padding:5px 10px;border-radius:999px;background:${badgeBg};color:${badgeColor};font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase">${escapeHtml(content.eyebrow)}</span>`
    : "";
  const meta =
    content.metaRight != null
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 14px"><tr>
          <td style="vertical-align:middle">${eyebrow}</td>
          <td style="vertical-align:middle;text-align:right;font-size:12px;color:#64748B">${escapeHtml(content.metaRight)}</td>
        </tr></table>`
      : eyebrow
        ? `<div style="margin:0 0 14px">${eyebrow}</div>`
        : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${escapeHtml(content.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a, p, span, div { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body, table, td, a, p, span, div, h1 { font-family: ${FONT} !important; }
    @media only screen and (max-width: 620px) {
      .email-stack {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .email-hide-mobile { display: none !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
      .email-nav-social-col { text-align: left !important; padding-left: 0 !important; }
      .email-nav-row { text-align: left !important; white-space: normal !important; }
      .email-social-row { text-align: left !important; }
      .email-social-row a { margin-left: 0 !important; margin-right: 6px !important; }
      .email-profile-header td { text-align: left !important; }
      .email-profile-header .email-cta-right { text-align: right !important; }
      .email-profile-header .email-cta-right div { text-align: right !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;color:#0F172A;font-family:${FONT}">
  ${preheader}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8FAFC;padding:18px 0;font-family:${FONT}">
    <tr>
      <td align="center" style="padding:0 8px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #E2E8F0;border-radius:18px;overflow:hidden;font-family:${FONT}">
          <tr>
            <td style="padding:${brand.headerLayout === "banner" ? "12px 12px 8px" : "20px 22px 16px"};border-bottom:1px solid #EEF2F7;font-family:${FONT}">
              ${renderHeader(brand)}
            </td>
          </tr>
          <tr>
            <td style="padding:26px 22px 10px;font-family:${FONT}">
              ${meta}
              <h1 style="margin:0;font-size:26px;line-height:1.2;letter-spacing:-.02em;color:#0F172A;font-weight:800;font-family:${FONT}">${escapeHtml(content.title)}</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:#475569;font-family:${FONT}">${escapeHtml(content.body)}</p>
              ${content.blocksHtml || ""}
              ${content.detail ? `<div style="margin:20px 0 0;padding:16px 18px;border-radius:14px;background:#F8FAFC;border:1px solid #E2E8F0;color:#334155;font-size:14px;line-height:1.6;font-family:${FONT}">${content.detail}</div>` : ""}
              ${renderCtas(brand, content)}
              ${renderSignature(brand)}
            </td>
          </tr>
          <tr>
            ${renderFooter(brand)}
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function brandEmailText(content: BrandMailContent, settings?: Partial<SiteSettings> | null) {
  const brand = emailBrandFromSettings(settings);
  const parts = [
    content.title,
    "",
    content.body,
    content.detail ? `\n${stripTags(content.detail)}\n` : "",
    content.ctaLabel && content.ctaHref ? `${content.ctaLabel}: ${content.ctaHref}` : "",
    content.secondaryCtaLabel && content.secondaryCtaHref
      ? `${content.secondaryCtaLabel}: ${content.secondaryCtaHref}`
      : "",
    "",
    `— ${brand.title}`,
    brand.roles,
    brand.location,
    brand.showPhone && brand.phone ? brand.phone : "",
    brand.origin,
  ];
  return parts.filter(Boolean).join("\n");
}

export function welcomeEmailContent(brand = emailBrandFromSettings()): BrandMailContent {
  const check = abs(brand.origin, "/brand/email-social/check.svg");
  const features = brand.welcome.features
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:650;font-family:${FONT};vertical-align:top">
          <img src="${escapeAttr(check)}" width="18" height="18" alt="" style="display:inline-block;vertical-align:middle;border:0;margin-right:10px" />
          <span style="vertical-align:middle">${escapeHtml(item)}</span>
        </td></tr>`,
    )
    .join("");
  return {
    preheader: "Thanks for joining the list.",
    eyebrow: brand.welcome.eyebrow,
    title: brand.welcome.title,
    body: brand.welcome.body,
    ctaLabel: brand.welcome.ctaLabel,
    ctaHref: brand.origin,
    blocksHtml: features
      ? `<div style="margin:22px 0 0;padding:16px 18px;border-radius:14px;background:#F1F5F9;border:1px solid #E2E8F0">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${features}</table>
        </div>`
      : "",
  };
}

export function newsletterEmailContent(brand = emailBrandFromSettings()): BrandMailContent {
  const image = brand.newsletter.imageUrl
    ? `<div style="margin:20px 0 0;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0">
        <img src="${escapeAttr(brand.newsletter.imageUrl)}" width="556" alt="" style="display:block;width:100%;max-width:556px;height:auto;border:0" />
      </div>`
    : "";
  return {
    preheader: brand.newsletter.title,
    eyebrow: brand.newsletter.eyebrow,
    title: brand.newsletter.title,
    body: brand.newsletter.body,
    ctaLabel: brand.newsletter.ctaLabel,
    ctaHref: brand.origin,
    blocksHtml: image,
  };
}

export function contactEmailContent(
  input: {
    name: string;
    email: string;
    message: string;
    subject?: string;
    source?: string;
    when?: Date;
  },
  brand = emailBrandFromSettings(),
): BrandMailContent {
  const when = input.when || new Date();
  const stamp = when.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const inquiry = input.subject || "Project / Collaboration";
  const source = input.source || `${brand.origin.replace(/^https?:\/\//, "")}/contact`;
  const first = input.name.split(/\s+/)[0] || input.name;

  const details = `<div style="margin:20px 0 0;padding:16px 18px;border-radius:14px;background:#F8FAFC;border:1px solid #E2E8F0">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding-bottom:12px">
          <div style="font-size:15px;font-weight:800;color:#0F172A">${escapeHtml(input.name)}</div>
          <a href="mailto:${escapeAttr(input.email)}" style="color:${brand.primary};text-decoration:none;font-size:13px">${escapeHtml(input.email)}</a>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:33%;vertical-align:top;padding:6px 8px 0 0">
                <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8">Inquiry</div>
                <div style="font-size:13px;color:#0F172A;font-weight:650;margin-top:4px">${escapeHtml(inquiry)}</div>
              </td>
              <td style="width:34%;vertical-align:top;padding:6px 8px 0">
                <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8">Source</div>
                <div style="font-size:13px;color:#0F172A;font-weight:650;margin-top:4px">${escapeHtml(source)}</div>
              </td>
              <td style="width:33%;vertical-align:top;padding:6px 0 0 8px">
                <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8">Location</div>
                <div style="font-size:13px;color:#0F172A;font-weight:650;margin-top:4px">${escapeHtml(brand.location)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  <div style="margin:14px 0 0;padding:16px 18px;border-radius:14px;background:#F8FAFC;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:8px">Message</div>
    <div style="padding:14px 16px;border-radius:12px;background:#fff;border:1px solid #E2E8F0;color:#334155;font-size:14px;line-height:1.6">${escapeHtml(input.message).replace(/\n/g, "<br/>")}</div>
  </div>
  <div style="margin:18px 0 0;padding:14px 16px;border-radius:12px;background:#EAF2FB;color:#334155;font-size:13px;line-height:1.55">${escapeHtml(brand.contact.tip)}</div>`;

  return {
    preheader: `Message from ${input.name}`,
    eyebrow: brand.contact.badge,
    badgeTone: "blue",
    metaRight: stamp,
    title: `New message from ${input.name}`,
    body: `You received a new message through the contact form on ${brand.origin.replace(/^https?:\/\//, "")}.`,
    blocksHtml: details,
    ctaLabel: `Reply to ${first}`,
    ctaHref: `mailto:${input.email}`,
    secondaryCtaLabel: "View in Control Center",
    secondaryCtaHref: abs(brand.origin, "/dashboard"),
  };
}

/** Kept for older imports that expect a named escape helper nearby. */
export function featuresListFromSettings(settings?: Partial<SiteSettings> | null) {
  return emailBrandFromSettings(settings).welcome.features;
}
