const BOOKING_HOSTS = ["calendar.google.com", "calendar.app.google"];

export function configuredBookingUrl(value?: string) {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!BOOKING_HOSTS.includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const WHATSAPP_CALL_URL = "https://wa.me/250792054846?text=Hello%20Prince%20Parfait%20GANZA%2C%20I%20would%20like%20to%20book%20a%20conversation.";
