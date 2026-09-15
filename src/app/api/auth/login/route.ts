import { NextResponse } from "next/server";
import { adminEmail, adminPassword } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const expectedEmail = adminEmail();
  const expectedPassword = adminPassword();

  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json(
      { error: "Set ADMIN_EMAIL and ADMIN_PASSWORD in the server environment." },
      { status: 503 },
    );
  }

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("ppg_admin_auth", "true", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
