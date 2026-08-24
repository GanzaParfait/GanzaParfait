export type DeviceType = "Mobile" | "Desktop" | "Tablet";

export interface ParsedDevice {
  type: DeviceType;
  label: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  RW: "Rwanda",
  US: "United States",
  KE: "Kenya",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  NG: "Nigeria",
  ZA: "South Africa",
  UG: "Uganda",
  TZ: "Tanzania",
  IN: "India",
  CN: "China",
  JP: "Japan",
  AU: "Australia",
  BR: "Brazil",
};

export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2 || code === "XX") return "🌍";
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  const upper = code.toUpperCase();
  if (COUNTRY_NAMES[upper]) return COUNTRY_NAMES[upper];
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(upper) || "Unknown";
  } catch {
    return "Unknown";
  }
}

export function parseDevice(userAgent: string | null | undefined): ParsedDevice {
  const ua = (userAgent || "").toLowerCase();
  let type: DeviceType = "Desktop";

  if (/ipad|tablet|kindle|playbook/.test(ua)) {
    type = "Tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) {
    type = "Mobile";
  }

  let browser = "Browser";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/firefox\//.test(ua)) browser = "Firefox";
  else if (/chrome\//.test(ua) && !/edg\//.test(ua)) browser = "Chrome";
  else if (/safari\//.test(ua) && !/chrome\//.test(ua)) browser = "Safari";
  else if (/opr\//.test(ua) || /opera/.test(ua)) browser = "Opera";

  return { type, label: `${type} (${browser})` };
}

export function maskIp(ip: string | null | undefined, options?: { isLocal?: boolean }): string {
  if (!ip && options?.isLocal) return "Localhost";
  if (!ip) return "—";

  const normalized = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (options?.isLocal || normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost") {
    return "Localhost";
  }

  if (normalized.includes(":")) {
    const compact = normalized.replace(/^::ffff:/, "");
    if (compact.includes(".")) {
      const parts = compact.split(".");
      if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return `${normalized.split(":").slice(0, 2).join(":")}:****`;
  }

  const parts = normalized.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  return normalized;
}

export function displayIp(storedIp: string | null | undefined, resolvedIp?: string | null): string {
  const ip = resolvedIp || storedIp;
  const normalized = ip?.startsWith("::ffff:") ? ip.slice(7) : ip;
  const isLocal = !ip || normalized === "127.0.0.1" || normalized === "::1" || ip.startsWith("::ffff:127.");
  if (isLocal && resolvedIp) return maskIp(resolvedIp);
  return maskIp(ip, { isLocal });
}

export function formatRelativeTime(date: string | Date): string {
  const then = new Date(date).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return `${diffSec || 1}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hrs ago`;
  return `${Math.floor(diffSec / 86400)} days ago`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100% vs last month" : "No prior data";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% vs last month`;
}

export function pagePathToName(path: string): string {
  if (path === "/") return "Homepage";
  const segment = path.split("/").filter(Boolean)[0];
  if (!segment) return path;
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export const VISITOR_COOKIE = "_ppg_vid";
export const SESSION_COOKIE = "_ppg_sid";
export const SESSION_TOUCH_COOKIE = "_ppg_st";
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
