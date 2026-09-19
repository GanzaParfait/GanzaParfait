"use client";

import { useMemo, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import {
  brandEmailHtml,
  contactEmailContent,
  emailBrandFromSettings,
  newsletterEmailContent,
  welcomeEmailContent,
} from "@/lib/email-template";
import type { EmailHeaderLayout, SiteSettings } from "@/lib/supabase";

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.375rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.8125rem",
  color: "#0f172a",
  outline: "none",
} as const;

const HEADER_OPTIONS: { id: EmailHeaderLayout; title: string; body: string }[] = [
  { id: "brand_tagline", title: "Brand + tagline", body: "Full logo + roles · domain + tagline" },
  { id: "nav_socials", title: "Nav + socials", body: "Logo, site links, and social icons" },
  { id: "banner", title: "Full banner", body: "Blue banner with statement and domain" },
  { id: "profile", title: "Profile", body: "Portrait, quote, CTA, and location" },
];

type EmailPanel = "thanks" | "contact" | "newsletter";

const PANELS: { id: EmailPanel; label: string; hint: string }[] = [
  { id: "thanks", label: "Welcome / thanks", hint: "Subscriber confirmation copy" },
  { id: "contact", label: "Contact notification", hint: "Inbox alert for new messages" },
  { id: "newsletter", label: "Newsletter shell", hint: "Shared brand / desk note" },
];

export default function EmailEditor({
  settings,
  patch,
}: {
  settings: SiteSettings;
  patch: (next: Partial<SiteSettings>) => void;
}) {
  const [open, setOpen] = useState<EmailPanel>("thanks");
  const previewHtml = useMemo(() => {
    const brand = emailBrandFromSettings(settings);
    const content =
      open === "contact"
        ? contactEmailContent(
            {
              name: "Alex Visitor",
              email: "alex@example.com",
              message: "I would like to discuss a systems project in Kigali.",
              subject: "Project / Collaboration",
            },
            brand,
          )
        : open === "newsletter"
          ? newsletterEmailContent(brand)
          : welcomeEmailContent(brand);
    return brandEmailHtml(content, settings);
  }, [open, settings]);

  const activeHeader = HEADER_OPTIONS.find((item) => item.id === (settings.emailHeaderLayout || "brand_tagline"));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 24rem) minmax(0, 1fr)", gap: "1.1rem", alignItems: "start" }}>
      <div style={{ display: "grid", gap: "0.9rem", minWidth: 0 }}>
        <section style={{ display: "grid", gap: "0.45rem" }}>
          <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
            1. Email type
          </p>
          {PANELS.map((panel) => {
            const expanded = open === panel.id;
            return (
              <div
                key={panel.id}
                style={{
                  border: expanded ? "1.5px solid #0e52a8" : "1px solid #cbd5e1",
                  borderRadius: "0.85rem",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(panel.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    padding: "0.75rem 0.85rem",
                    border: "none",
                    background: expanded ? "#eaf2fb" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>
                    <strong style={{ display: "block", fontSize: "0.86rem", color: "#0b192c" }}>{panel.label}</strong>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{panel.hint}</span>
                  </span>
                  <RiArrowDownSLine
                    size={18}
                    style={{ color: "#0e52a8", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }}
                  />
                </button>
                {expanded ? (
                  <div style={{ display: "grid", gap: "0.55rem", padding: "0.15rem 0.85rem 0.9rem", borderTop: "1px solid #e2e8f0" }}>
                    {panel.id === "thanks" ? (
                      <>
                        <Field label="Eyebrow" value={settings.emailWelcomeEyebrow || ""} onChange={(emailWelcomeEyebrow) => patch({ emailWelcomeEyebrow })} />
                        <Field label="Title" value={settings.emailWelcomeTitle || ""} onChange={(emailWelcomeTitle) => patch({ emailWelcomeTitle })} />
                        <Field label="Body" value={settings.emailWelcomeBody || ""} onChange={(emailWelcomeBody) => patch({ emailWelcomeBody })} area />
                        <Field label="Feature list (one per line)" value={settings.emailWelcomeFeatures || ""} onChange={(emailWelcomeFeatures) => patch({ emailWelcomeFeatures })} area />
                        <Field label="CTA label" value={settings.emailWelcomeCtaLabel || ""} onChange={(emailWelcomeCtaLabel) => patch({ emailWelcomeCtaLabel })} />
                      </>
                    ) : null}
                    {panel.id === "contact" ? (
                      <>
                        <Field label="Badge label" value={settings.emailContactBadge || ""} onChange={(emailContactBadge) => patch({ emailContactBadge })} />
                        <Field label="Quick tip" value={settings.emailContactTip || ""} onChange={(emailContactTip) => patch({ emailContactTip })} area />
                      </>
                    ) : null}
                    {panel.id === "newsletter" ? (
                      <>
                        <Field label="Eyebrow" value={settings.emailNewsletterEyebrow || ""} onChange={(emailNewsletterEyebrow) => patch({ emailNewsletterEyebrow })} />
                        <Field label="Title" value={settings.emailNewsletterTitle || ""} onChange={(emailNewsletterTitle) => patch({ emailNewsletterTitle })} />
                        <Field label="Body" value={settings.emailNewsletterBody || ""} onChange={(emailNewsletterBody) => patch({ emailNewsletterBody })} area />
                        <Field label="CTA label" value={settings.emailNewsletterCtaLabel || ""} onChange={(emailNewsletterCtaLabel) => patch({ emailNewsletterCtaLabel })} />
                        <Field label="Hero image URL" value={settings.emailNewsletterImageUrl || ""} onChange={(emailNewsletterImageUrl) => patch({ emailNewsletterImageUrl })} />
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>

        <section style={{ display: "grid", gap: "0.45rem", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "baseline" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
              2. Header layout
            </p>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{activeHeader?.body}</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              overflowX: "auto",
              paddingBottom: "0.2rem",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "thin",
            }}
          >
            {HEADER_OPTIONS.map((option) => {
              const active = (settings.emailHeaderLayout || "brand_tagline") === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  title={option.body}
                  onClick={() => patch({ emailHeaderLayout: option.id })}
                  style={{
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "999px",
                    border: active ? "1.5px solid #0e52a8" : "1px solid #cbd5e1",
                    background: active ? "#0e52a8" : "#fff",
                    color: active ? "#fff" : "#0b192c",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {option.title}
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ display: "grid", gap: "0.55rem" }}>
          <Toggle label="Show signature block" checked={settings.emailShowSignature !== false} onChange={(emailShowSignature) => patch({ emailShowSignature })} />
          <Toggle label="Show footer socials" checked={settings.emailShowSocials !== false} onChange={(emailShowSocials) => patch({ emailShowSocials })} />
          <Toggle label="Show phone in footer" checked={settings.emailShowPhone !== false} onChange={(emailShowPhone) => patch({ emailShowPhone })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
          <Field label="Primary color" value={settings.emailPrimaryColor || "#0E52AB"} onChange={(emailPrimaryColor) => patch({ emailPrimaryColor })} />
          <Field label="Header tagline" value={settings.emailTagline || ""} onChange={(emailTagline) => patch({ emailTagline })} placeholder="Ideas. Projects. Real Impact." />
        </div>
        <Field label="Banner kicker" value={settings.emailBannerKicker || ""} onChange={(emailBannerKicker) => patch({ emailBannerKicker })} placeholder="Turning ideas into" />
        <Field label="Banner headline" value={settings.emailBannerHeadline || ""} onChange={(emailBannerHeadline) => patch({ emailBannerHeadline })} placeholder="Real solutions" />
        <Field
          label="Nav links (label|/path per line)"
          value={settings.emailHeaderNav || ""}
          onChange={(emailHeaderNav) => patch({ emailHeaderNav })}
          area
          placeholder={"About|/about\nContact|/contact"}
        />
        <Field label="Signature quote" value={settings.emailSignatureQuote || ""} onChange={(emailSignatureQuote) => patch({ emailSignatureQuote })} area />
        <Field label="Portrait URL" value={settings.emailPortraitUrl || ""} onChange={(emailPortraitUrl) => patch({ emailPortraitUrl })} placeholder="/images/profile/..." />
        <Field label="Footer note" value={settings.emailFooterNote || ""} onChange={(emailFooterNote) => patch({ emailFooterNote })} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
          <Field label="Preferences URL" value={settings.emailPreferencesUrl || ""} onChange={(emailPreferencesUrl) => patch({ emailPreferencesUrl })} placeholder="/contact" />
          <Field
            label="Unsubscribe URL"
            value={settings.emailUnsubscribeUrl || ""}
            onChange={(emailUnsubscribeUrl) => patch({ emailUnsubscribeUrl })}
            placeholder="/unsubscribe"
          />
        </div>
        <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", lineHeight: 1.45 }}>
          Welcome and bulk emails use a signed per-recipient /unsubscribe link automatically. This field is the fallback shown in previews.
        </p>

        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
          Choose the email type first, then the shared header layout. Preview updates live. Full page:{" "}
          <a href="/email-preview" style={{ color: "#0e52a8", fontWeight: 700 }}>
            /email-preview
          </a>
          .
        </p>
      </div>

      <div style={{ position: "sticky", top: "1rem", display: "grid", gap: "0.55rem", minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
          Live preview · {PANELS.find((p) => p.id === open)?.label}
        </p>
        <iframe
          title="Email live preview"
          srcDoc={previewHtml}
          style={{ width: "100%", minHeight: "40rem", border: "1px solid #cbd5e1", borderRadius: "1rem", background: "#fff" }}
        />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  area,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
      {label}
      {area ? (
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input style={inputStyle} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
