"use client";

import { useMemo, useState } from "react";
import {
  RiShareLine,
  RiFileCopyLine,
  RiLinkedinFill,
  RiTwitterXLine,
  RiWhatsappLine,
  RiCheckLine,
} from "react-icons/ri";
import { buildShareUrl, SHARE_PRESETS } from "@/lib/utm";

interface ShareActionsProps {
  title: string;
  excerpt: string;
  campaign: string;
  content?: string;
  compact?: boolean;
  /** Single-row share strip (case study under title). */
  inline?: boolean;
}

export default function ShareActions({
  title,
  excerpt,
  campaign,
  content,
  compact = false,
  inline = false,
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
  const shareText = `${title} — ${excerpt}`;

  const links = useMemo(() => {
    if (!pageUrl) return null;
    return {
      native: buildShareUrl(pageUrl, SHARE_PRESETS.native(campaign, content)),
      copy: buildShareUrl(pageUrl, SHARE_PRESETS.copy(campaign, content)),
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        buildShareUrl(pageUrl, SHARE_PRESETS.linkedin(campaign, content)),
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
        buildShareUrl(pageUrl, SHARE_PRESETS.twitter(campaign, content)),
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `${shareText} ${buildShareUrl(pageUrl, SHARE_PRESETS.whatsapp(campaign, content))}`,
      )}`,
    };
  }, [pageUrl, campaign, content, shareText]);

  const handleNativeShare = async () => {
    if (!links) return;
    if (navigator.share) {
      await navigator.share({ title, text: excerpt, url: links.native });
      return;
    }
    await navigator.clipboard.writeText(links.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    if (!links) return;
    await navigator.clipboard.writeText(links.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <button type="button" className="btn btn-outline btn-sm" onClick={handleNativeShare} aria-label="Share">
        <RiShareLine size={14} />
        Share
      </button>
    );
  }

  return (
    <div className={inline ? "share-actions is-inline" : "share-actions"}>
      <span className="share-actions-label">Share</span>
      <div className="share-actions-row">
        <button type="button" className="share-chip" onClick={handleNativeShare}>
          <RiShareLine size={14} /> Share
        </button>
        <button type="button" className="share-chip" onClick={handleCopy}>
          {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
        {links ? (
          <>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="share-icon" aria-label="Share on LinkedIn">
              <RiLinkedinFill size={15} />
            </a>
            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="share-icon" aria-label="Share on X">
              <RiTwitterXLine size={15} />
            </a>
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="share-icon" aria-label="Share on WhatsApp">
              <RiWhatsappLine size={15} />
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}
