"use client";

import { useState } from "react";
import { RiCheckLine, RiExternalLinkLine, RiFileCopyLine, RiLinkM } from "react-icons/ri";
import { siteUrl } from "@/lib/env";
import { buildUtmQuery } from "@/lib/utm";

const PAGES = [
  { path: "/", label: "Homepage" },
  { path: "/about", label: "About" },
  { path: "/projects", label: "Work" },
  { path: "/services", label: "Services" },
  { path: "/contact", label: "Contact" },
];

const CHANNELS = [
  { id: "plain", label: "Plain link", source: "", medium: "" },
  { id: "whatsapp", label: "WhatsApp", source: "whatsapp", medium: "social" },
  { id: "linkedin", label: "LinkedIn", source: "linkedin", medium: "social" },
  { id: "instagram", label: "Instagram", source: "instagram", medium: "social" },
  { id: "x", label: "X / Twitter", source: "x", medium: "social" },
  { id: "email", label: "Email signature", source: "email", medium: "email" },
  { id: "qr", label: "QR / print", source: "qr", medium: "offline" },
];

function buildLink(path: string, source: string, medium: string): string {
  const base = siteUrl();
  const utm = source ? buildUtmQuery({ source, medium, campaign: "newsletter" }) : "";
  if (path === "/") return `${base}/subscribe${utm ? `?${utm}` : ""}`;
  return `${base}${path}?subscribe=1${utm ? `&${utm}` : ""}`;
}

export default function SubscribeLinkPanel() {
  const [path, setPath] = useState("/");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1800);
    } catch {
      window.prompt("Copy this link", link);
    }
  };

  return (
    <section className="dash-sublinks" aria-labelledby="dash-sublinks-title">
      <div className="dash-sublinks-head">
        <div>
          <h2 id="dash-sublinks-title">
            <RiLinkM size={18} aria-hidden="true" /> Signup links
          </h2>
          <p>
            Anyone who opens these links sees Stay updated right away: a bottom sheet on phones, a centered
            dialog on desktop. Sign-ups are recorded as <strong>Shared link</strong>, and each channel shows up in
            Analytics → Traffic sources.
          </p>
        </div>
        <label className="dash-tm-filter">
          <span>Opens on</span>
          <select value={path} onChange={(event) => setPath(event.target.value)}>
            {PAGES.map((page) => (
              <option key={page.path} value={page.path}>
                {page.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="dash-sublinks-list">
        {CHANNELS.map((channel) => {
          const link = buildLink(path, channel.source, channel.medium);
          return (
            <li key={channel.id}>
              <span className="dash-sublinks-label">{channel.label}</span>
              <code title={link}>{link.replace(/^https?:\/\//, "")}</code>
              <div className="dash-sublinks-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => void copy(channel.id, link)}
                  aria-label={`Copy ${channel.label} link`}
                >
                  {copied === channel.id ? <RiCheckLine size={15} /> : <RiFileCopyLine size={15} />}
                  {copied === channel.id ? "Copied" : "Copy"}
                </button>
                <a
                  className="btn btn-outline btn-sm"
                  href={path === "/" ? "/subscribe" : `${path}?subscribe=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Test ${channel.label} link`}
                >
                  <RiExternalLinkLine size={15} />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="dash-sublinks-note">
        Short versions also work: <code>/subscribe</code>, <code>/join</code>, <code>/newsletter</code>,{" "}
        <code>/stay-updated</code>, <code>/updates</code>, or add <code>?subscribe=1</code> or{" "}
        <code>#subscribe</code> to any page.
      </p>
    </section>
  );
}
