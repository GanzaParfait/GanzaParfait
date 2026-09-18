export const SUBSCRIBE_JOINED_KEY = "pp-subscribe-joined";
export const SUBSCRIBE_JOINED_EVENT = "pp-subscribe-joined";

export function hasSubscribeJoined() {
  try {
    return localStorage.getItem(SUBSCRIBE_JOINED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSubscribeJoined() {
  try {
    localStorage.setItem(SUBSCRIBE_JOINED_KEY, "1");
    localStorage.removeItem("subscribe-dismissed");
  } catch {
    /* ignore quota / private mode */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUBSCRIBE_JOINED_EVENT));
  }
}

export async function submitSubscribe(email: string, source: "widget" | "footer" = "widget") {
  const device = navigator.userAgent;
  let country = "Unknown";
  let location = Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data.country_name) country = data.country_name;
    if (data.city) location = `${data.city}, ${data.region}`;
  } catch {
    /* geolocation is optional */
  }

  const response = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, device, location, country, source }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Subscribe failed");
  markSubscribeJoined();
  return data as { ok?: boolean; emailed?: boolean };
}
