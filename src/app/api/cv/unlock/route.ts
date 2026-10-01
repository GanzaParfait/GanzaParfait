import { NextRequest, NextResponse } from "next/server";
import {
  CV_PDF_PASS_COOKIE,
  CV_PDF_PASSWORD_PASS_SECONDS,
  checkCvPdfPassword,
  createCvPdfPass,
  cvPdfPassCookieOptions,
  readCvPdfPassword,
  safeCvPdfNext,
} from "@/lib/cv-pdf-lock";

export const runtime = "nodejs";

type RateBucket = { count: number; resetAt: number };
const attempts = new Map<string, RateBucket>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 80);
}

function rateLimited(key: string, limit = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = attempts.get(key);
  if (!bucket || bucket.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

/** Password form on `/cv/unlock` posts here; success redirects back to the PDF. */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") || "").trim();
  const next = safeCvPdfNext(String(form?.get("next") || ""));

  const back = (error: string) => {
    const url = new URL("/cv/unlock", request.nextUrl.origin);
    url.searchParams.set("next", next);
    url.searchParams.set("error", error);
    return NextResponse.redirect(url, 303);
  };

  if (rateLimited(clientKey(request))) return back("rate");

  const state = await readCvPdfPassword();
  if (!checkCvPdfPassword(password, state)) return back("invalid");

  const res = NextResponse.redirect(new URL(next, request.nextUrl.origin), 303);
  res.cookies.set(
    CV_PDF_PASS_COOKIE,
    createCvPdfPass("password", CV_PDF_PASSWORD_PASS_SECONDS, state),
    cvPdfPassCookieOptions(CV_PDF_PASSWORD_PASS_SECONDS),
  );
  return res;
}
