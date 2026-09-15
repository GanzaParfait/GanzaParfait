/**
 * Central env helpers. Values come from `.env.local` (local) or the host
 * environment (Vercel). Never commit real secrets.
 */

export function env(name: string, fallback = "") {
  return (process.env[name] || fallback).trim();
}

export function requiredEnv(name: string) {
  const value = env(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function siteUrl() {
  return env("NEXT_PUBLIC_SITE_URL", "https://www.princeparfait.com").replace(/\/+$/, "");
}

export function adminEmail() {
  return env("ADMIN_EMAIL").toLowerCase();
}

export function adminPassword() {
  return env("ADMIN_PASSWORD");
}

/** Addresses used when sending mail. Create these mailboxes, then put them here. */
export const mailboxes = {
  /** Default From for transactional mail */
  noreply: () => env("EMAIL_NOREPLY", "noreply@princeparfait.com"),
  /** Public contact / hello inbox */
  hello: () => env("EMAIL_HELLO", "hello@princeparfait.com"),
  /** Thanks / welcome notes to new subscribers */
  thanks: () => env("EMAIL_THANKS", "thanks@princeparfait.com"),
  /** Contact-form notifications to you */
  contact: () => env("EMAIL_CONTACT", "contact@princeparfait.com"),
  /** Reply-To shown to subscribers and form senders */
  replyTo: () => env("EMAIL_REPLY_TO", env("EMAIL_HELLO", "hello@princeparfait.com")),
};

/** Optional Cloudinary credentials kept available for media CDN / uploads. */
export const cloudinary = {
  cloudName: () => env("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
  apiKey: () => env("CLOUDINARY_API_KEY") || env("NEXT_PUBLIC_CLOUDINARY_API_KEY"),
  apiSecret: () => env("CLOUDINARY_API_SECRET"),
  url: () => env("CLOUDINARY_URL"),
  uploadPreset: () => env("CLOUDINARY_UPLOAD_PRESET"),
};
