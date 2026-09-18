import type { CvTemplateId } from "@/lib/cv";

export type CvAccessMode = "open" | "email";
export type CvAccessAction = "view" | "download";
export type CvAccessRememberDays = 0 | 1 | 7 | 30 | 90;
export type CvAccessSource =
  | "homepage"
  | "about"
  | "experience"
  | "cv_page"
  | "footer"
  | "direct"
  | "other";

export type CvAccessConfig = {
  mode: CvAccessMode;
  gateView: boolean;
  gateDownload: boolean;
  allowSkip: boolean;
  rememberDays: CvAccessRememberDays;
  collectName: boolean;
  marketingOptInAvailable: boolean;
  modalHeadingTemplate: string;
  modalBody: string;
  privacyHelper: string;
  marketingLabel: string;
  skipLabel: string;
  submitLabel: string;
};

export const CV_UNLOCK_COOKIE = "ppg_cv_unlocked";

export const DEFAULT_CV_ACCESS: CvAccessConfig = {
  mode: "email",
  gateView: true,
  gateDownload: true,
  allowSkip: true,
  rememberDays: 30,
  collectName: false,
  marketingOptInAvailable: true,
  modalHeadingTemplate: "Get my {format}",
  modalBody: "Enter your email for immediate access to the latest version.",
  privacyHelper: "No spam. Your information is handled responsibly.",
  marketingLabel: "I'd also like occasional updates from Prince Parfait.",
  skipLabel: "Continue without subscribing",
  submitLabel: "Continue to CV →",
};

export const CV_ACCESS_REMEMBER_OPTIONS: { value: CvAccessRememberDays; label: string }[] = [
  { value: 0, label: "Session only" },
  { value: 1, label: "1 day" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const FORMAT_ACCESS_LABELS: Record<CvTemplateId, string> = {
  professional: "Professional CV",
  compact: "Compact Resume",
  executive: "Executive Profile",
};

export function cvAccessFormatLabel(template: CvTemplateId, fallbackLabel?: string): string {
  return FORMAT_ACCESS_LABELS[template] || fallbackLabel || "CV";
}

export function cvAccessModalHeading(access: CvAccessConfig, template: CvTemplateId, formatLabel?: string): string {
  const format = cvAccessFormatLabel(template, formatLabel);
  const templateText = access.modalHeadingTemplate?.trim() || DEFAULT_CV_ACCESS.modalHeadingTemplate;
  return templateText.replace(/\{format\}/gi, format);
}

export function normalizeCvAccess(raw?: Partial<CvAccessConfig> | null): CvAccessConfig {
  const remember = Number(raw?.rememberDays);
  const rememberDays: CvAccessRememberDays =
    remember === 0 || remember === 1 || remember === 7 || remember === 30 || remember === 90
      ? remember
      : DEFAULT_CV_ACCESS.rememberDays;

  return {
    mode: raw?.mode === "open" ? "open" : "email",
    gateView: raw?.gateView !== false,
    gateDownload: raw?.gateDownload !== false,
    allowSkip: raw?.allowSkip !== false,
    rememberDays,
    collectName: Boolean(raw?.collectName),
    marketingOptInAvailable: raw?.marketingOptInAvailable !== false,
    modalHeadingTemplate: raw?.modalHeadingTemplate?.trim() || DEFAULT_CV_ACCESS.modalHeadingTemplate,
    modalBody: raw?.modalBody?.trim() || DEFAULT_CV_ACCESS.modalBody,
    privacyHelper: raw?.privacyHelper?.trim() || DEFAULT_CV_ACCESS.privacyHelper,
    marketingLabel: raw?.marketingLabel?.trim() || DEFAULT_CV_ACCESS.marketingLabel,
    skipLabel: raw?.skipLabel?.trim() || DEFAULT_CV_ACCESS.skipLabel,
    submitLabel: raw?.submitLabel?.trim() || DEFAULT_CV_ACCESS.submitLabel,
  };
}

export function isCvActionGated(access: CvAccessConfig, action: CvAccessAction): boolean {
  if (access.mode !== "email") return false;
  if (action === "view") return access.gateView;
  return access.gateDownload;
}

export function cvUnlockMaxAgeSeconds(rememberDays: CvAccessRememberDays): number | undefined {
  if (rememberDays === 0) return undefined;
  return rememberDays * 24 * 60 * 60;
}

export function parseCvAccessSource(value: string | null | undefined): CvAccessSource {
  const v = String(value || "").trim().toLowerCase();
  if (
    v === "homepage" ||
    v === "about" ||
    v === "experience" ||
    v === "cv_page" ||
    v === "footer" ||
    v === "direct" ||
    v === "other"
  ) {
    return v;
  }
  return "cv_page";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Client-readable unlock flag — stores no email. */
export function readCvUnlockedFromDocument(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${CV_UNLOCK_COOKIE}=1`));
}

export function writeCvUnlockedCookie(rememberDays: CvAccessRememberDays) {
  if (typeof document === "undefined") return;
  const maxAge = cvUnlockMaxAgeSeconds(rememberDays);
  const parts = [`${CV_UNLOCK_COOKIE}=1`, "path=/", "SameSite=Lax"];
  if (typeof maxAge === "number") parts.push(`max-age=${maxAge}`);
  document.cookie = parts.join("; ");
}
