import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  contactNotifyMail,
  newsletterSampleMail,
  subscriberThanksMail,
} from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";

export const metadata: Metadata = {
  title: "Email preview",
  robots: { index: false, follow: false },
};

const SAMPLES = ["thanks", "contact", "blank"] as const;
type Sample = (typeof SAMPLES)[number];

async function allowed(searchParams: { key?: string }) {
  if (process.env.NODE_ENV !== "production") return true;
  const key = process.env.EMAIL_PREVIEW_KEY;
  if (key && searchParams.key === key) return true;
  const jar = await cookies();
  return jar.get("ppg_admin_auth")?.value === "true";
}

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string; key?: string }>;
}) {
  const params = await searchParams;
  if (!(await allowed(params))) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", fontFamily: "system-ui" }}>
        <p>Email preview is private. Sign in to the dashboard, or pass ?key=EMAIL_PREVIEW_KEY.</p>
      </main>
    );
  }

  const settings = await getServerSiteSettings();
  const sample = (SAMPLES.includes(params.sample as Sample) ? params.sample : "thanks") as Sample;
  const mail =
    sample === "contact"
      ? await contactNotifyMail(
          {
            name: "Alex Visitor",
            email: "alex@example.com",
            message: "I would like to discuss a systems project in Kigali.",
            subject: "Project / Collaboration",
          },
          settings,
        )
      : sample === "blank"
        ? await newsletterSampleMail(settings)
        : await subscriberThanksMail("visitor@example.com", settings);

  const labels: Record<Sample, string> = {
    thanks: "Welcome / thanks",
    contact: "Contact notification",
    blank: "Shared brand / newsletter",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#e8eef7", padding: "1.25rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "72rem", margin: "0 auto", display: "grid", gap: "1rem" }}>
        <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "end" }}>
          <div>
            <p style={{ margin: 0, color: "#0E52A8", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Inbox preview</p>
            <h1 style={{ margin: "0.2rem 0 0", fontSize: "1.5rem" }}>{labels[sample]}</h1>
            <p style={{ margin: "0.35rem 0 0", color: "#475569", fontSize: "0.9rem" }}>
              From: {mail.from} · Subject: {mail.subject}
            </p>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.8rem" }}>
              Uses site settings (header layout, socials, phone, signature). Edit in Dashboard → Settings → Email.
            </p>
          </div>
          <nav style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            {SAMPLES.map((item) => (
              <a
                key={item}
                href={`/email-preview?sample=${item}${params.key ? `&key=${encodeURIComponent(params.key)}` : ""}`}
                style={{
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  background: item === sample ? "#0E52A8" : "#fff",
                  color: item === sample ? "#fff" : "#0f172a",
                  border: "1px solid #cbd5e1",
                }}
              >
                {item === "blank" ? "newsletter" : item}
              </a>
            ))}
            <a
              href="/dashboard/settings#email"
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
                background: "#fff",
                color: "#0E52A8",
                border: "1px solid #cbd5e1",
              }}
            >
              Configure
            </a>
          </nav>
        </header>
        <iframe
          title={labels[sample]}
          srcDoc={mail.html}
          style={{ width: "100%", minHeight: "42rem", border: "1px solid #cbd5e1", borderRadius: "1rem", background: "#fff" }}
        />
      </div>
    </main>
  );
}
