/**
 * Normalize clipboard paste into textarea-friendly plain text.
 * Google AI / rich results often ship structured HTML while text/plain
 * keeps only partial breaks (paragraphs OK, signature lines jammed).
 */

export function plainTextFromClipboard(data: DataTransfer | null, fallback = ""): string {
  if (!data) return normalizePlainText(fallback);

  const html = data.getData("text/html");
  const plainRaw = data.getData("text/plain");
  const plain = normalizePlainText(plainRaw || fallback);
  const fromHtml =
    html && /<(?:p|div|br|li|h[1-6]|span|b|strong|section|blockquote)\b/i.test(html)
      ? htmlToPlainText(html)
      : "";

  if (fromHtml && structureScore(fromHtml) >= structureScore(plain)) {
    return fromHtml;
  }
  return repairCommonEmailPlain(plain);
}

function structureScore(value: string) {
  const text = String(value || "");
  const newlines = (text.match(/\n/g) || []).length;
  const paragraphs = (text.match(/\n\n/g) || []).length;
  const signatureLines = (text.match(/^\[[^\]]+\]$/gm) || []).length;
  return newlines * 2 + paragraphs * 4 + signatureLines * 3;
}

function htmlToPlainText(html: string) {
  if (typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(wrapFragment(html), "text/html");
      doc.querySelectorAll("script, style, noscript, meta, link").forEach((el) => el.remove());
      const text = nodeToText(doc.body);
      return repairCommonEmailPlain(normalizePlainText(text));
    } catch {
      /* fall through */
    }
  }
  return repairCommonEmailPlain(normalizePlainText(regexHtmlToText(html)));
}

function wrapFragment(html: string) {
  // Google sometimes pastes a full document; sometimes a fragment.
  if (/<html[\s>]/i.test(html) || /<body[\s>]/i.test(html)) return html;
  return `<!DOCTYPE html><html><body>${html}</body></html>`;
}

function nodeToText(node: Node | null): string {
  if (!node) return "";
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (tag === "br") return "\n";
  if (tag === "hr") return "\n\n";

  const block = /^(p|div|section|article|header|footer|li|tr|h[1-6]|blockquote|pre|table|thead|tbody|ul|ol)$/.test(
    tag,
  );
  const paragraph = /^(p|h[1-6]|blockquote|li)$/.test(tag);

  let out = block ? "\n" : "";
  for (const child of Array.from(el.childNodes)) {
    out += nodeToText(child);
  }
  if (paragraph) out += "\n\n";
  else if (block) out += "\n";
  return out;
}

function regexHtmlToText(html: string) {
  return html
    .replace(/\r\n?/g, "\n")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*hr\s*\/?>/gi, "\n\n")
    .replace(/<\s*(p|div|section|article|tr|h[1-6]|li|blockquote)[^>]*>/gi, "\n")
    .replace(/<\s*\/\s*(p|h[1-6]|blockquote)\s*>/gi, "\n\n")
    .replace(/<\s*\/\s*(div|section|article|li|tr)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** Fix jammed signature / greeting lines common in AI overview pastes. */
function repairCommonEmailPlain(value: string) {
  let text = String(value || "");

  text = text.replace(/\u00a0/g, " ");
  // Closing sign-offs only — do not split "Thank you for your time…"
  text = text.replace(/\b(Best regards|Kind regards|Sincerely|Yours truly),?\s*(?=\[|[A-Z])/gi, "$1,\n");
  text = text.replace(/\b(Thank you|Thanks),?\s*(?=\[)/gi, "$1,\n");
  // "[Your Name][Your Title][Your Company/Link]"
  text = text.replace(/\]\s*\[/g, "]\n[");
  // "Dear Prince Parfait,I hope" → blank line after greeting
  text = text.replace(/(Dear\s+[^,\n]+,),?\s+(?=[A-Z])/g, "$1\n\n");
  // "consideration.Best regards" / "consideration. Best regards"
  text = text.replace(/\.\s*(Best regards|Kind regards|Sincerely|Yours truly)\b/gi, ".\n\n$1");
  // Subject line as its own paragraph when pasted into the body
  text = text.replace(/^(Subject:\s*[^\n]+)\s+(?=Dear\b)/i, "$1\n\n");

  return normalizePlainText(text);
}

function normalizePlainText(value: string) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
