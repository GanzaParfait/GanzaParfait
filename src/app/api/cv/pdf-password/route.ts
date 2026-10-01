import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import {
  CV_PDF_PASSWORD_MIN_LENGTH,
  readCvPdfPassword,
  saveCvPdfPassword,
} from "@/lib/cv-pdf-lock";

export const runtime = "nodejs";

/** Status only; the password itself is never returned. */
export async function GET(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const state = await readCvPdfPassword();
  return NextResponse.json(
    { customized: Boolean(state.hash), storageReady: state.storageReady },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "").trim();
  if (password.length < CV_PDF_PASSWORD_MIN_LENGTH || password.length > 128) {
    return NextResponse.json(
      { error: `Use at least ${CV_PDF_PASSWORD_MIN_LENGTH} characters.` },
      { status: 400 },
    );
  }
  const state = await readCvPdfPassword();
  if (!state.storageReady) {
    return NextResponse.json(
      { error: "Password storage is not ready. Run the private_settings migration in Supabase." },
      { status: 503 },
    );
  }
  try {
    await saveCvPdfPassword(password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("CV PDF password save failed", error);
    return NextResponse.json({ error: "Could not save the password." }, { status: 500 });
  }
}
