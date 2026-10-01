import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { createServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

/** HttpOnly pass for `/api/cv/pdf`. Set after an email is submitted, or after the link password is entered. */
export const CV_PDF_PASS_COOKIE = "cv_pdf_pass";
export const DEFAULT_CV_PDF_PASSWORD = "2024";
export const CV_PDF_PASSWORD_MIN_LENGTH = 4;
export const CV_PDF_PASSWORD_PASS_SECONDS = 12 * 60 * 60;

const SETTING_KEY = "cv_pdf_password";
const SESSION_PASS_SECONDS = 24 * 60 * 60;

type PassKind = "email" | "password";

function lockSecret() {
  return (
    process.env.CV_PDF_SECRET ||
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "ppg-dev-cv-pdf"
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function matchesHash(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  return safeEqual(scryptSync(password, salt, 32).toString("hex"), hash);
}

export type CvPdfPasswordState = { hash: string | null; storageReady: boolean };

/** Reads the stored hash. Missing table or row falls back to the default password. */
export async function readCvPdfPassword(): Promise<CvPdfPasswordState> {
  if (!hasServiceRoleKey()) return { hash: null, storageReady: false };
  try {
    const { data, error } = await createServerSupabase(true)
      .from("private_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();
    if (error) return { hash: null, storageReady: false };
    const hash = typeof data?.value?.hash === "string" ? data.value.hash : null;
    return { hash, storageReady: true };
  } catch {
    return { hash: null, storageReady: false };
  }
}

export async function saveCvPdfPassword(password: string) {
  const { error } = await createServerSupabase(true)
    .from("private_settings")
    .upsert(
      { key: SETTING_KEY, value: { hash: hashPassword(password) }, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}

export function checkCvPdfPassword(input: string, state: CvPdfPasswordState) {
  if (!input) return false;
  return state.hash ? matchesHash(input, state.hash) : safeEqual(input, DEFAULT_CV_PDF_PASSWORD);
}

/** Password passes are bound to the current hash, so changing the password revokes them. */
function passVersion(kind: PassKind, state?: CvPdfPasswordState) {
  return kind === "password" ? state?.hash || "default" : "email";
}

function sign(kind: PassKind, exp: number, version: string) {
  return createHmac("sha256", lockSecret()).update(`cvpdf:${kind}:${exp}:${version}`).digest("base64url");
}

export function createCvPdfPass(kind: PassKind, maxAgeSeconds: number | undefined, state?: CvPdfPasswordState) {
  const exp = Math.floor(Date.now() / 1000) + (maxAgeSeconds ?? SESSION_PASS_SECONDS);
  return `${kind}.${exp}.${sign(kind, exp, passVersion(kind, state))}`;
}

export async function verifyCvPdfPass(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [kind, expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if ((kind !== "email" && kind !== "password") || !Number.isFinite(exp) || !sig) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false;
  const state = kind === "password" ? await readCvPdfPassword() : undefined;
  return safeEqual(sign(kind, exp, passVersion(kind, state)), sig);
}

export function cvPdfPassCookieOptions(maxAgeSeconds: number | undefined) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(typeof maxAgeSeconds === "number" ? { maxAge: maxAgeSeconds } : {}),
  };
}

/** Only PDF endpoint paths may be used as a post-unlock redirect. */
export function safeCvPdfNext(raw: string | null | undefined) {
  const value = String(raw || "");
  return value.startsWith("/api/cv/pdf") && !value.startsWith("//") ? value : "/api/cv/pdf?download=1";
}
