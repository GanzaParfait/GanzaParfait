import type { NextRequest } from "next/server";

export function isDashboardAuthorized(request: NextRequest): boolean {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}
