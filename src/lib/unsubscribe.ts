import { createHmac, timingSafeEqual } from "crypto";
import { siteUrl } from "@/lib/env";

function unsubscribeSecret() {
  return (
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.EMAIL_PREVIEW_KEY ||
    process.env.ADMIN_PASSWORD ||
    process.env.SMTP_PASS ||
    "ppg-dev-unsubscribe"
  );
}

export function signUnsubscribeToken(email: string) {
  const normalized = email.trim().toLowerCase();
  return createHmac("sha256", unsubscribeSecret()).update(`unsub:${normalized}`).digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string) {
  if (!email || !token) return false;
  const expected = signUnsubscribeToken(email);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(String(token));
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Absolute unsubscribe link for a specific subscriber email. */
export function unsubscribeLinkFor(email: string, origin = siteUrl()) {
  const normalized = email.trim().toLowerCase();
  const token = signUnsubscribeToken(normalized);
  const base = origin.replace(/\/+$/, "");
  const params = new URLSearchParams({ email: normalized, token });
  return `${base}/unsubscribe?${params.toString()}`;
}

/** Relative path used inside email brand settings before abs(). */
export function unsubscribePathFor(email: string) {
  const normalized = email.trim().toLowerCase();
  const token = signUnsubscribeToken(normalized);
  return `/unsubscribe?email=${encodeURIComponent(normalized)}&token=${encodeURIComponent(token)}`;
}
