export const UTM_STORAGE_KEY = "_ppg_utm_attribution";

export const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface ShareUtmOptions {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

export function hasUtmParams(params: UtmParams): boolean {
  return UTM_PARAM_KEYS.some((key) => Boolean(params[key]));
}

export function parseUtmFromSearchParams(searchParams: URLSearchParams | null | undefined): UtmParams {
  const utm: UtmParams = {};
  if (!searchParams) return utm;

  for (const key of UTM_PARAM_KEYS) {
    const value = searchParams.get(key)?.trim();
    if (value) utm[key] = value.slice(0, 120);
  }

  return utm;
}

export function parseUtmFromUrl(url: string): UtmParams {
  try {
    return parseUtmFromSearchParams(new URL(url).searchParams);
  } catch {
    return {};
  }
}

export function cleanPagePath(path: string): string {
  const withoutQuery = path.split("?")[0]?.split("#")[0] || path;
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

export function buildUtmQuery(params: UtmParams | ShareUtmOptions): string {
  const entries: [string, string][] = [];

  const map: Record<string, string | undefined> =
    "source" in params
      ? {
          utm_source: params.source,
          utm_medium: params.medium,
          utm_campaign: params.campaign,
          utm_content: params.content,
          utm_term: params.term,
        }
      : {
          utm_source: params.utm_source,
          utm_medium: params.utm_medium,
          utm_campaign: params.utm_campaign,
          utm_content: params.utm_content,
          utm_term: params.utm_term,
        };

  for (const [key, value] of Object.entries(map)) {
    if (value) entries.push([key, value]);
  }

  return new URLSearchParams(entries).toString();
}

export function buildShareUrl(baseUrl: string, options: ShareUtmOptions): string {
  const url = new URL(baseUrl);
  const query = buildUtmQuery(options);
  if (query) url.search = query;
  return url.toString();
}

export function persistUtmAttribution(utm: UtmParams): void {
  if (typeof window === "undefined" || !hasUtmParams(utm)) return;
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // ignore storage errors
  }
}

export function getStoredUtmAttribution(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UtmParams;
    return hasUtmParams(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function resolveUtmAttribution(
  fromUrl: UtmParams,
  stored: UtmParams | null
): UtmParams {
  if (hasUtmParams(fromUrl)) return fromUrl;
  return stored || {};
}

export function appendUtmToUrl(url: string, utm: UtmParams): string {
  if (!hasUtmParams(utm)) return url;
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://princeparfait.com");
    for (const key of UTM_PARAM_KEYS) {
      const value = utm[key];
      if (value) parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function appendStoredUtmToUrl(url: string): string {
  const stored = getStoredUtmAttribution();
  if (!stored) return url;
  return appendUtmToUrl(url, stored);
}

export const SHARE_PRESETS = {
  native: (campaign: string, content?: string): ShareUtmOptions => ({
    source: "share",
    medium: "native_share",
    campaign,
    content,
  }),
  copy: (campaign: string, content?: string): ShareUtmOptions => ({
    source: "share",
    medium: "copy_link",
    campaign,
    content,
  }),
  linkedin: (campaign: string, content?: string): ShareUtmOptions => ({
    source: "linkedin",
    medium: "social",
    campaign,
    content,
  }),
  twitter: (campaign: string, content?: string): ShareUtmOptions => ({
    source: "twitter",
    medium: "social",
    campaign,
    content,
  }),
  whatsapp: (campaign: string, content?: string): ShareUtmOptions => ({
    source: "whatsapp",
    medium: "social",
    campaign,
    content,
  }),
} as const;
