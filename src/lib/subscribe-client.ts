export const SUBSCRIBE_JOINED_KEY = "pp-subscribe-joined";
export const SUBSCRIBE_JOINED_EVENT = "pp-subscribe-joined";
export const SUBSCRIBE_OPEN_EVENT = "pp:open-subscribe";
export const SUBSCRIBE_QUERY_KEY = "subscribe";
export const SUBSCRIBE_HASH = "#subscribe";

/** Open the Stay updated dialog from anywhere on the site. */
export function openSubscribe() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SUBSCRIBE_OPEN_EVENT));
}

/** True when the URL asks for the dialog; strips the marker so a refresh does not reopen it. */
export function consumeSubscribeInvite(): boolean {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.has(SUBSCRIBE_QUERY_KEY);
  const fromHash = url.hash === SUBSCRIBE_HASH;
  if (!fromQuery && !fromHash) return false;
  url.searchParams.delete(SUBSCRIBE_QUERY_KEY);
  if (fromHash) url.hash = "";
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

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

export async function submitSubscribe(
  email: string,
  source: "widget" | "link" | "footer" = "widget",
  options?: { markJoined?: boolean },
) {
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
  if (options?.markJoined !== false) markSubscribeJoined();
  return data as { ok?: boolean; emailed?: boolean; mailError?: string };
}
