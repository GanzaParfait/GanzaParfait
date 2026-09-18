import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "www.princeparfait.com";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  // Apex → www for every path, including static logos Googlebot may request.
  if (host === "princeparfait.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: [
    // Skip only Next internals; still redirect apex static assets (png/webp/etc.).
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
