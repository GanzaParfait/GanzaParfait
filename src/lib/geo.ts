import { countryCodeToFlag, getCountryName } from "@/lib/analytics";

export interface GeoResult {
  country_code: string;
  country_name: string;
  country_flag: string;
  resolved_ip?: string | null;
  is_local?: boolean;
}

function geoFromHeaders(headers: Headers): GeoResult | null {
  const code =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code");

  if (!code || code === "XX" || code === "T1") return null;

  return {
    country_code: code.toUpperCase(),
    country_name: getCountryName(code),
    country_flag: countryCodeToFlag(code),
  };
}

export function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  let value = ip.trim();
  if (value.startsWith("::ffff:")) value = value.slice(7);
  if (value === "::1") value = "127.0.0.1";
  return value;
}

export function isPrivateIp(ip: string | null | undefined): boolean {
  const normalized = normalizeIp(ip);
  if (!normalized) return true;
  if (normalized === "127.0.0.1" || normalized === "localhost") return true;
  if (normalized.startsWith("10.") || normalized.startsWith("192.168.")) return true;
  const match = normalized.match(/^172\.(\d+)\./);
  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }
  return normalized.startsWith("fc") || normalized.startsWith("fd");
}

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return headers.get("x-real-ip") || headers.get("cf-connecting-ip") || headers.get("x-vercel-forwarded-for") || null;
}

async function lookupIpGeo(ip: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { "User-Agent": "ppg-portfolio-analytics/1.0", Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.country_code && data.country_code !== "XX") {
        return {
          country_code: data.country_code,
          country_name: data.country_name || getCountryName(data.country_code),
          country_flag: countryCodeToFlag(data.country_code),
          resolved_ip: data.ip || ip,
        };
      }
    }
  } catch {
    // try fallback below
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,query`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success" && data.countryCode) {
        return {
          country_code: data.countryCode,
          country_name: data.country || getCountryName(data.countryCode),
          country_flag: countryCodeToFlag(data.countryCode),
          resolved_ip: data.query || ip,
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

async function lookupPublicGeo(): Promise<GeoResult | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      headers: { "User-Agent": "ppg-portfolio-analytics/1.0", Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.country_code && data.country_code !== "XX") {
        return {
          country_code: data.country_code,
          country_name: data.country_name || getCountryName(data.country_code),
          country_flag: countryCodeToFlag(data.country_code),
          resolved_ip: data.ip || null,
          is_local: true,
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export async function resolveGeo(headers: Headers, ip: string | null): Promise<GeoResult> {
  const fromHeaders = geoFromHeaders(headers);
  if (fromHeaders) {
    return { ...fromHeaders, resolved_ip: normalizeIp(ip), is_local: false };
  }

  const normalizedIp = normalizeIp(ip);
  const localRequest = isPrivateIp(normalizedIp);

  if (localRequest) {
    const publicGeo = await lookupPublicGeo();
    if (publicGeo) return publicGeo;

    return {
      country_code: "RW",
      country_name: "Rwanda",
      country_flag: "🇷🇼",
      resolved_ip: null,
      is_local: true,
    };
  }

  if (normalizedIp) {
    const geo = await lookupIpGeo(normalizedIp);
    if (geo) return { ...geo, is_local: false };
  }

  return {
    country_code: "XX",
    country_name: "Unknown",
    country_flag: "🌍",
    resolved_ip: normalizedIp,
    is_local: false,
  };
}
