/** Default welcome body. Avoid em-dash “technologist — published…” phrasing. */
export const WELCOME_BODY =
  "You are on the list for occasional notes on projects, systems, and work from Kigali.";

export const WIDGET_BLURB =
  "Occasional notes on projects, systems, and work from Kigali. No weekly noise.";

const AI_WELCOME = /technologist\s+[—–-]\s*published/i;

export function sanitizeWelcomeBody(value?: string | null) {
  const text = (value || "").trim();
  if (!text || AI_WELCOME.test(text)) return WELCOME_BODY;
  return text;
}
