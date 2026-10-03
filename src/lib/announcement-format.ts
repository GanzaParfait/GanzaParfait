/** Escape HTML, then apply lightweight markdown + auto-links for announcement detail. */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (!href) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(href)) return href;
  if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(href)) return `mailto:${href}`;
  if (/^\+?[\d\s().-]{7,}$/.test(href)) return `tel:${href.replace(/[^\d+]/g, "")}`;
  if (/^www\./i.test(href)) return `https://${href}`;
  return null;
}

function linkifyText(text: string) {
  return text.replace(
    /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(\+?\d[\d\s().-]{6,}\d)/gi,
    (match) => {
      const href = safeHref(match);
      if (!href) return match;
      const external = /^https?:\/\//i.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${match}</a>`;
    },
  );
}

/** Linkify only text nodes — never rewrite URLs already inside tags/attributes. */
function linkifyPlain(html: string) {
  return html.replace(/(^|>)([^<]+)/g, (_, prefix: string, text: string) => `${prefix}${linkifyText(text)}`);
}

function applyInlineMarkdown(escaped: string) {
  let html = escaped;
  // [label](url)
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeHref(String(url));
    if (!href) return label;
    const external = /^https?:\/\//i.test(href);
    return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^_])_([^_]+)_(?!_)/g, "$1<em>$2</em>");
  return linkifyPlain(html);
}

/** Convert announcement detail (plain + light markdown) into safe HTML. */
export function formatAnnouncementDetailHtml(raw: string): string {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return "";
  const blocks = text.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => applyInlineMarkdown(escapeHtml(line)));
      return `<p>${lines.join("<br />")}</p>`;
    })
    .join("");
}

export function wrapAnnouncementSelection(
  value: string,
  start: number,
  end: number,
  kind: "bold" | "italic" | "link",
  linkUrl?: string,
  linkLabel?: string,
) {
  const selected = value.slice(start, end);
  let next = "";
  if (kind === "bold") next = `**${selected || "text"}**`;
  else if (kind === "italic") next = `*${selected || "text"}*`;
  else {
    const href = (linkUrl || "https://").trim() || "https://";
    const label = (linkLabel?.trim() || selected || href).trim() || href;
    next = `[${label}](${href})`;
  }
  return {
    value: `${value.slice(0, start)}${next}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + next.length,
  };
}
