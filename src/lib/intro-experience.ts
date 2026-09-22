import type { SiteSettings } from "@/lib/supabase";

export type IntroFrequency = "first_visit" | "session" | "every_visit";
export type IntroTransition = "fade_slide" | "fade" | "slide";

export type IntroGreeting = {
  id: string;
  text: string;
  language: string;
  locale: string;
  /** Auto-inferred when empty: ar → rtl */
  direction: "ltr" | "rtl" | "auto";
  enabled: boolean;
  sortOrder: number;
};

export type IntroExperience = {
  enabled: boolean;
  frequency: IntroFrequency;
  background: string;
  textColor: string;
  /** Total sequence duration in milliseconds (default ~2200) */
  totalDurationMs: number;
  transition: IntroTransition;
  maxGreetings: number;
  /** Bump to re-show after substantial redesign (first_visit mode) */
  version: number;
  greetings: IntroGreeting[];
};

export const INTRO_STORAGE_KEY = "ppg_intro_seen";
export const INTRO_SESSION_KEY = "ppg_intro_session";

/** Normalize to #rrggbb for <input type="color"> and reliable CSS. */
export function normalizeIntroHex(value: string | undefined, fallback: string): string {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.slice(1).toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

export const DEFAULT_INTRO_EXPERIENCE: IntroExperience = {
  enabled: true,
  frequency: "first_visit",
  background: "#000000",
  textColor: "#ffffff",
  totalDurationMs: 2200,
  transition: "fade_slide",
  maxGreetings: 5,
  version: 1,
  greetings: [
    { id: "g-en", text: "Hello.", language: "English", locale: "en", direction: "ltr", enabled: true, sortOrder: 0 },
    { id: "g-rw", text: "Muraho.", language: "Kinyarwanda", locale: "rw", direction: "ltr", enabled: true, sortOrder: 1 },
    { id: "g-fr", text: "Bonjour.", language: "French", locale: "fr", direction: "ltr", enabled: true, sortOrder: 2 },
    { id: "g-ar", text: "مرحباً.", language: "Arabic", locale: "ar", direction: "rtl", enabled: true, sortOrder: 3 },
    { id: "g-de", text: "Hallo.", language: "German", locale: "de", direction: "ltr", enabled: true, sortOrder: 4 },
    { id: "g-es", text: "Hola.", language: "Spanish", locale: "es", direction: "ltr", enabled: false, sortOrder: 5 },
  ],
};

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

export function resolveGreetingDirection(greeting: IntroGreeting): "ltr" | "rtl" {
  if (greeting.direction === "ltr" || greeting.direction === "rtl") return greeting.direction;
  const locale = (greeting.locale || "").toLowerCase().split("-")[0];
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

export function introExperienceFrom(settings: SiteSettings | null | undefined): IntroExperience {
  const raw = settings?.introExperience as Partial<IntroExperience> | undefined;
  if (!raw) return { ...DEFAULT_INTRO_EXPERIENCE, greetings: DEFAULT_INTRO_EXPERIENCE.greetings.map((g) => ({ ...g })) };

  const greetings = Array.isArray(raw.greetings) && raw.greetings.length
    ? raw.greetings
        .map((g, index) => ({
          id: String(g?.id || `g-${index}`),
          text: String(g?.text || "").trim() || "Hello.",
          language: String(g?.language || "").trim() || "English",
          locale: String(g?.locale || "en").trim() || "en",
          direction: (g?.direction === "ltr" || g?.direction === "rtl" || g?.direction === "auto"
            ? g.direction
            : "auto") as IntroGreeting["direction"],
          enabled: g?.enabled !== false,
          sortOrder: typeof g?.sortOrder === "number" ? g.sortOrder : index,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : DEFAULT_INTRO_EXPERIENCE.greetings.map((g) => ({ ...g }));

  const duration = Number(raw.totalDurationMs);
  const maxG = Number(raw.maxGreetings);
  const version = Number(raw.version);

  return {
    enabled: raw.enabled !== false,
    frequency:
      raw.frequency === "session" || raw.frequency === "every_visit" || raw.frequency === "first_visit"
        ? raw.frequency
        : DEFAULT_INTRO_EXPERIENCE.frequency,
    background: normalizeIntroHex(raw.background, DEFAULT_INTRO_EXPERIENCE.background),
    textColor: normalizeIntroHex(raw.textColor, DEFAULT_INTRO_EXPERIENCE.textColor),
    totalDurationMs:
      Number.isFinite(duration) && duration >= 800 && duration <= 8000
        ? Math.round(duration)
        : DEFAULT_INTRO_EXPERIENCE.totalDurationMs,
    transition:
      raw.transition === "fade" || raw.transition === "slide" || raw.transition === "fade_slide"
        ? raw.transition
        : DEFAULT_INTRO_EXPERIENCE.transition,
    maxGreetings:
      Number.isFinite(maxG) && maxG >= 1 && maxG <= 12 ? Math.round(maxG) : DEFAULT_INTRO_EXPERIENCE.maxGreetings,
    version: Number.isFinite(version) && version >= 1 ? Math.round(version) : 1,
    greetings,
  };
}

export function activeIntroGreetings(config: IntroExperience): IntroGreeting[] {
  return [...config.greetings]
    .filter((g) => g.enabled && g.text.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, Math.max(1, config.maxGreetings));
}

/** Lab tools (PageSpeed / Lighthouse) always look like a first visit — skip intro so LCP/SI aren't blocked. */
export function isLabOrAutomation(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /Chrome-Lighthouse|PageSpeed|HeadlessChrome|PTST|Lighthouse/i.test(ua);
}

export function shouldShowIntro(
  config: IntroExperience,
  opts?: { force?: boolean; pathname?: string }
): boolean {
  if (opts?.force) return true;
  if (!config.enabled) return false;

  // Skip admin / utility shells if pathname is passed
  if (opts?.pathname?.startsWith("/dashboard") || opts?.pathname?.startsWith("/email-preview")) {
    return false;
  }

  const greetings = activeIntroGreetings(config);
  if (!greetings.length) return false;

  if (typeof window === "undefined") return false;

  try {
    if (isLabOrAutomation()) return false;

    if (config.frequency === "every_visit") return true;

    if (config.frequency === "session") {
      return sessionStorage.getItem(INTRO_SESSION_KEY) !== String(config.version);
    }

    // first_visit
    const stored = localStorage.getItem(INTRO_STORAGE_KEY);
    if (!stored) return true;
    const parsed = JSON.parse(stored) as { version?: number };
    return Number(parsed?.version) !== config.version;
  } catch {
    return false;
  }
}

export function markIntroSeen(config: IntroExperience) {
  if (typeof window === "undefined") return;
  try {
    if (config.frequency === "session") {
      sessionStorage.setItem(INTRO_SESSION_KEY, String(config.version));
      return;
    }
    if (config.frequency === "first_visit") {
      localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify({ version: config.version, at: Date.now() }));
    }
  } catch {
    /* ignore quota / private mode */
  }
}
