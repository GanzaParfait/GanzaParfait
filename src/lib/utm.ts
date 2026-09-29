export const UTM_STORAGE_KEY = "_ppg_utm_attribution";

export const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/** Click and ad identifiers that should not stay in the public URL. */
export const CLICK_ID_KEYS = [
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "ttclid",
  "twclid",
  "li_fat_id",
  "igshid",
  "mc_cid",
  "mc_eid",
  "_ga",
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

const SOURCE_RULES: { test: RegExp; source: string; medium: string }[] = [
  { test: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$|^chatgpt$/i, source: "ChatGPT", medium: "referral" },
  { test: /(^|\.)openai\.com$/i, source: "OpenAI", medium: "referral" },
  { test: /(^|\.)perplexity\.ai$/i, source: "Perplexity", medium: "referral" },
  { test: /(^|\.)claude\.ai$|(^|\.)anthropic\.com$/i, source: "Claude", medium: "referral" },
  { test: /(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/i, source: "Gemini", medium: "referral" },
  { test: /(^|\.)google\.[a-z.]+$/i, source: "Google", medium: "organic" },
  { test: /(^|\.)bing\.com$/i, source: "Bing", medium: "organic" },
  { test: /(^|\.)duckduckgo\.com$/i, source: "DuckDuckGo", medium: "organic" },
  { test: /(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/i, source: "LinkedIn", medium: "social" },
  { test: /(^|\.)twitter\.com$|(^|\.)x\.com$|(^|\.)t\.co$/i, source: "X", medium: "social" },
  { test: /(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)instagram\.com$/i, source: "Meta", medium: "social" },
  { test: /(^|\.)whatsapp\.com$|(^|\.)wa\.me$/i, source: "WhatsApp", medium: "social" },
  { test: /(^|\.)github\.com$/i, source: "GitHub", medium: "referral" },
  { test: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, source: "YouTube", medium: "social" },
];

function hostOf(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("://")) {
      return new URL(trimmed).hostname.replace(/^www\./i, "").toLowerCase();
    }
  } catch {
    return "";
  }
  return trimmed.replace(/^www\./i, "").toLowerCase().split("/")[0]?.split("?")[0] || "";
}

function matchSource(value: string): { source: string; medium: string } | null {
  const host = hostOf(value);
  if (!host) return null;
  return SOURCE_RULES.find((rule) => rule.test.test(host)) || null;
}

/** Turn raw values such as chatgpt.com into a stable source name for metrics. */
export function normalizeSourceLabel(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  return matchSource(raw)?.source || raw.slice(0, 120);
}

export function attributionFromReferrer(referrer: string | null | undefined): UtmParams {
  const matched = referrer ? matchSource(referrer) : null;
  if (!matched) return {};
  return { utm_source: matched.source, utm_medium: matched.medium };
}

/** Keep an explicit campaign, and fill a missing source from the referrer. */
export function correctAttribution(utm: UtmParams, referrer?: string | null): UtmParams {
  const next: UtmParams = { ...utm };
  if (next.utm_source) {
    const matched = matchSource(next.utm_source);
    next.utm_source = matched?.source || next.utm_source.trim().slice(0, 120);
    if (matched && !next.utm_medium) next.utm_medium = matched.medium;
  } else {
    const inferred = attributionFromReferrer(referrer);
    if (inferred.utm_source) next.utm_source = inferred.utm_source;
    if (!next.utm_medium && inferred.utm_medium) next.utm_medium = inferred.utm_medium;
  }
  if (next.utm_medium) next.utm_medium = next.utm_medium.trim().slice(0, 120);
  if (next.utm_campaign) next.utm_campaign = next.utm_campaign.trim().slice(0, 120);
  return next;
}

export function stripTrackingSearch(params: URLSearchParams): boolean {
  let changed = false;
  for (const key of [...UTM_PARAM_KEYS, ...CLICK_ID_KEYS]) {
    if (params.has(key)) {
      params.delete(key);
      changed = true;
    }
  }
  return changed;
}

/** Record attribution first, then remove tracking params from the address bar. */
export function cleanBrowserUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!stripTrackingSearch(url.searchParams)) return;
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

export function cleanReferrer(referrer: string | null | undefined): string | null {
  const raw = referrer?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    stripTrackingSearch(url.searchParams);
    return url.toString().slice(0, 500);
  } catch {
    return raw.slice(0, 500);
  }
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
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://www.princeparfait.com");
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
  facebook: (campaign: string, content?: string): ShareUtmOptions => ({
    source: "facebook",
    medium: "social",
    campaign,
    content,
  }),
} as const;
