const SUBJECT = "Call with Prince Parfait GANZA";
const DETAILS =
  "A conversation with Prince Parfait GANZA about a project, product, or venture. Based in Kigali, Rwanda. Confirm the time by email at hello@princeparfait.com.";

export function googleCalendarCallUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: SUBJECT,
    details: DETAILS,
    location: "Kigali, Rwanda or online",
    add: "hello@princeparfait.com",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const WHATSAPP_CALL_URL = "https://wa.me/250792054846?text=Hello%20Prince%20Parfait%20GANZA%2C%20I%20would%20like%20to%20book%20a%20call.";
