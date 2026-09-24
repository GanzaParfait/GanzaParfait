import nodemailer from "nodemailer";
import { primaryEmail } from "@/lib/contact-emails";
import { mailboxes } from "@/lib/env";
import {
  brandEmailHtml,
  brandEmailText,
  contactEmailContent,
  emailBrandFromSettings,
  newsletterEmailContent,
  welcomeEmailContent,
} from "@/lib/email-template";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import type { SiteSettings } from "@/lib/supabase";

export type OutboundMail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  /** Extra SMTP / provider headers (e.g. List-Unsubscribe). */
  headers?: Record<string, string>;
  /** When set, a row is written to mail_outbox after send. */
  log?: {
    kind: string;
    relatedType?: string;
    relatedId?: string;
  };
};

const FROM_DISPLAY = "Prince Parfait GANZA";

function bareEmail(address: string) {
  const match = String(address || "").match(/<([^>]+)>/);
  return (match ? match[1] : address).trim().toLowerCase();
}

function formatFrom(address: string) {
  const email = bareEmail(address);
  if (!email) return address;
  return `"${FROM_DISPLAY}" <${email}>`;
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 2000);
  return String(error).slice(0, 2000);
}

async function logOutbound(mail: OutboundMail, status: "sent" | "failed", err?: unknown) {
  if (!mail.log) return;
  try {
    const { createServerSupabase } = await import("@/lib/supabase-server");
    const supabase = createServerSupabase(true);
    await supabase.from("mail_outbox").insert([
      {
        kind: mail.log.kind,
        to_email: mail.to,
        from_email: mail.from || mailboxes.noreply(),
        subject: mail.subject,
        preview_html: mail.html?.slice(0, 200_000) || null,
        preview_text: mail.text?.slice(0, 20_000) || null,
        related_type: mail.log.relatedType || null,
        related_id: mail.log.relatedId || null,
        status,
        error_message: status === "failed" && err ? errorMessage(err) : null,
      },
    ]);
  } catch (error) {
    console.error("mail_outbox log failed", error);
  }
}

async function sendWithResend(mail: OutboundMail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: formatFrom(mail.from || mailboxes.noreply()),
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: mail.replyTo || mailboxes.replyTo(),
      headers: mail.headers,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed: ${response.status} ${body}`);
  }
  return true;
}

/** Next.js interpolates `$VARS` in .env files; a literal `$` is written as `\$`. */
function smtpSecret(value: string) {
  return value.replaceAll("$$", "$").replaceAll("\\$", "$");
}

function smtpAuthForFrom(from: string) {
  const address = bareEmail(from);
  const thanks = bareEmail(mailboxes.thanks());
  const contact = bareEmail(mailboxes.contact());
  const hello = bareEmail(mailboxes.hello());
  let user = process.env.SMTP_USER || "";
  let pass = smtpSecret(process.env.SMTP_PASS || "");
  if (address && address === thanks && process.env.SMTP_THANKS_USER && process.env.SMTP_THANKS_PASS) {
    user = process.env.SMTP_THANKS_USER;
    pass = smtpSecret(process.env.SMTP_THANKS_PASS);
  } else if (address && address === contact && process.env.SMTP_CONTACT_USER && process.env.SMTP_CONTACT_PASS) {
    user = process.env.SMTP_CONTACT_USER;
    pass = smtpSecret(process.env.SMTP_CONTACT_PASS);
  } else if (address && address === hello && process.env.SMTP_HELLO_USER && process.env.SMTP_HELLO_PASS) {
    user = process.env.SMTP_HELLO_USER;
    pass = smtpSecret(process.env.SMTP_HELLO_PASS);
  }
  return { user, pass };
}

function smtpTransport(user: string, pass: string) {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false" && port === 465;
  const servername = process.env.SMTP_TLS_SERVERNAME || "princeparfait.com";
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 45_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
    tls: {
      servername,
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
  });
}

async function sendWithSmtp(mail: OutboundMail) {
  const host = process.env.SMTP_HOST;
  if (!host) return false;

  const preferredFrom = mail.from || mailboxes.noreply();
  const primary = smtpAuthForFrom(preferredFrom);
  const attempts: { from: string; user: string; pass: string }[] = [];
  if (primary.user && primary.pass) {
    attempts.push({ from: preferredFrom, user: primary.user, pass: primary.pass });
  }

  const fallbackUser = process.env.SMTP_USER || "";
  const fallbackPass = smtpSecret(process.env.SMTP_PASS || "");
  const helloUser = process.env.SMTP_HELLO_USER || mailboxes.hello();
  const helloPass = smtpSecret(process.env.SMTP_HELLO_PASS || "");
  if (helloUser && helloPass && helloUser !== primary.user) {
    attempts.push({ from: helloUser, user: helloUser, pass: helloPass });
  }
  if (fallbackUser && fallbackPass && fallbackUser !== primary.user && fallbackUser !== helloUser) {
    attempts.push({ from: fallbackUser, user: fallbackUser, pass: fallbackPass });
  }

  if (!attempts.length) {
    throw new Error(`SMTP auth missing for From ${preferredFrom}`);
  }

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const transporter = smtpTransport(attempt.user, attempt.pass);
      const info = await transporter.sendMail({
        from: formatFrom(attempt.from),
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: mail.replyTo || mailboxes.replyTo(),
        headers: mail.headers,
      });
      mail.from = bareEmail(attempt.from) || attempt.from;
      console.info(
        `SMTP accepted to=${mail.to} from=${mail.from} id=${info.messageId || "?"} response=${info.response || "?"}`,
      );
      return true;
    } catch (error) {
      lastError = error;
      console.error(`SMTP send failed as ${attempt.user}`, error);
    }
  }
  throw lastError;
}

/**
 * Prefer SMTP when configured (custom domain mailboxes), then Resend.
 * Namecheap/cPanel: do not use the apex domain as SMTP_HOST when it points at
 * a CDN/proxy (ETIMEDOUT). Use the cPanel hostname (e.g. premiumNNN.web-hosting.com)
 * or shared hosting IP, with SMTP_TLS_SERVERNAME=yourdomain.com.
 */
export async function sendMail(mail: OutboundMail) {
  let lastError: unknown = null;
  let sent = false;

  const trySmtp = smtpConfigured() || Boolean(process.env.SMTP_THANKS_PASS || process.env.SMTP_CONTACT_PASS);
  if (trySmtp) {
    try {
      sent = await sendWithSmtp(mail);
    } catch (error) {
      lastError = error;
      console.error("SMTP send failed", error);
    }
  }

  if (!sent && process.env.RESEND_API_KEY) {
    try {
      sent = await sendWithResend(mail);
    } catch (error) {
      lastError = error;
      console.error("Resend send failed", error);
    }
  }

  if (sent) {
    await logOutbound(mail, "sent");
    return true;
  }

  if (!lastError) {
    lastError = new Error(
      "No mail transport succeeded. Check SMTP_HOST/credentials (or set RESEND_API_KEY with a verified domain).",
    );
  }

  if (mail.log) await logOutbound(mail, "failed", lastError);
  throw lastError;
}

export async function contactAckMail(
  input: { name: string; email: string; subject?: string },
  settings?: SiteSettings,
) {
  const site = settings || (await getServerSiteSettings());
  const brand = emailBrandFromSettings(site);
  const first = input.name.split(/\s+/)[0] || input.name;
  const topic = input.subject ? ` about “${input.subject}”` : "";
  const content = {
    preheader: `Thanks ${first}, I received your message.`,
    eyebrow: "Message received",
    title: `Thanks, ${first}.`,
    body: `I received your message${topic}. I usually reply within 24–48 hours on business days (Kigali, EAT).`,
    ctaLabel: "Visit the site",
    ctaHref: brand.origin,
  };
  return {
    to: input.email,
    from: mailboxes.hello() || mailboxes.thanks(),
    replyTo: mailboxes.replyTo(),
    subject: `Thanks for writing — ${site.siteTitle || "Prince Parfait GANZA"}`,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

export async function subscriberThanksMail(to: string, settings?: SiteSettings) {
  const site = settings || (await getServerSiteSettings());
  const { unsubscribeLinkFor, unsubscribePathFor } = await import("@/lib/unsubscribe");
  const withUnsub = { ...site, emailUnsubscribeUrl: unsubscribePathFor(to) };
  const content = welcomeEmailContent(emailBrandFromSettings(withUnsub));
  const unsub = unsubscribeLinkFor(to);
  // Prefer hello@ — transactional welcome from a personal mailbox lands better than thanks@.
  const from = mailboxes.hello() || mailboxes.thanks();
  return {
    to,
    from,
    replyTo: mailboxes.replyTo(),
    subject: `${content.title.replace(/!$/, "")} — ${site.siteTitle || "Prince Parfait GANZA"}`,
    text: brandEmailText(content, withUnsub),
    html: brandEmailHtml(content, withUnsub),
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  } satisfies OutboundMail;
}

export async function contactNotifyMail(
  input: { name: string; email: string; message: string; subject?: string },
  settings?: SiteSettings,
) {
  const site = settings || (await getServerSiteSettings());
  const content = contactEmailContent(input, emailBrandFromSettings(site));
  return {
    to: mailboxes.contact(),
    from: mailboxes.noreply(),
    replyTo: input.email,
    subject: `Contact form — ${input.name}`,
    text: brandEmailText(
      {
        ...content,
        detail: `${input.name} <${input.email}>\n\n${input.message}`,
      },
      site,
    ),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

/** `BrandMailContent.detail` is injected as raw HTML, so submitted text must be escaped. */
function escapeDetail(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />");
}

export async function testimonialAckMail(
  input: { name: string; email: string },
  settings?: SiteSettings,
) {
  const site = settings || (await getServerSiteSettings());
  const brand = emailBrandFromSettings(site);
  const first = input.name.split(/\s+/)[0] || input.name;
  const content = {
    preheader: `Thanks ${first} — your testimonial is with me for review.`,
    eyebrow: "Testimonial received",
    title: `Thank you, ${first}.`,
    body:
      "Your testimonial has been received and will be reviewed before publication. Nothing goes live until I have read it — reply to this email if you would like to change or withdraw it.",
    ctaLabel: "Visit the site",
    ctaHref: brand.origin,
  };
  return {
    to: input.email,
    from: mailboxes.hello() || mailboxes.thanks(),
    replyTo: mailboxes.replyTo(),
    subject: `Thanks for your testimonial — ${site.siteTitle || "Prince Parfait GANZA"}`,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

export async function testimonialNotifyMail(
  input: {
    name: string;
    email: string;
    body: string;
    organization?: string;
    relationship?: string;
    project?: string;
    location?: string;
  },
  settings?: SiteSettings,
) {
  const site = settings || (await getServerSiteSettings());
  const brand = emailBrandFromSettings(site);
  const who = [input.name, input.organization].filter(Boolean).join(" · ");
  const meta = [
    input.relationship ? `Relationship: ${input.relationship}` : "",
    input.project ? `Project: ${input.project}` : "",
    input.location ? `Location: ${input.location}` : "",
    `Email: ${input.email}`,
  ]
    .filter(Boolean)
    .join("\n");
  const plainDetail = `${who}\n${meta}\n\n${input.body}`;
  const content = {
    preheader: `${input.name} submitted a testimonial for review.`,
    eyebrow: "Needs review",
    title: "New testimonial awaiting moderation",
    body: `${who} submitted a testimonial. Review it in the dashboard — it stays unpublished until you confirm and publish.`,
    detail: escapeDetail(plainDetail),
    ctaLabel: "Open testimonials dashboard",
    ctaHref: `${brand.origin}/dashboard/testimonials`,
  };
  return {
    to: primaryEmail(site) || mailboxes.contact(),
    from: mailboxes.noreply(),
    replyTo: input.email,
    subject: `Testimonial for review — ${input.name}`,
    text: brandEmailText({ ...content, detail: plainDetail }, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

export async function testimonialPublishedMail(
  to: string,
  input: { name: string; shareUrl: string; project?: string },
  settings?: SiteSettings,
) {
  const site = settings || (await getServerSiteSettings());
  const brand = emailBrandFromSettings(site);
  const first = input.name.split(/\s+/)[0] || input.name;
  const projectLine = input.project ? ` It is listed with ${input.project}.` : "";
  const content = {
    preheader: `Your testimonial is live on ${brand.origin.replace(/^https?:\/\//, "")}.`,
    eyebrow: "Now published",
    title: `Your words are live, ${first}.`,
    body: `Thank you again — your testimonial is now published on the site.${projectLine} You can view and share it with the link below.`,
    ctaLabel: "View your testimonial",
    ctaHref: input.shareUrl,
  };
  return {
    to,
    from: mailboxes.hello() || mailboxes.thanks(),
    replyTo: mailboxes.replyTo(),
    subject: `Your testimonial is published — ${site.siteTitle || "Prince Parfait GANZA"}`,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

export async function newsletterSampleMail(settings?: SiteSettings) {
  const site = settings || (await getServerSiteSettings());
  const content = newsletterEmailContent(emailBrandFromSettings(site));
  return {
    to: site.contactEmail || mailboxes.hello(),
    from: mailboxes.noreply(),
    replyTo: mailboxes.replyTo(),
    subject: content.title,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

export async function bulkNewsletterMail(
  input: { to: string; subject: string; title: string; body: string; ctaLabel?: string; ctaHref?: string },
  settings?: SiteSettings,
) {
  const site = settings || (await getServerSiteSettings());
  const { unsubscribePathFor, unsubscribeLinkFor } = await import("@/lib/unsubscribe");
  const withUnsub = { ...site, emailUnsubscribeUrl: unsubscribePathFor(input.to) };
  const brand = emailBrandFromSettings(withUnsub);
  const content = {
    preheader: input.subject,
    eyebrow: "Update",
    title: input.title,
    body: input.body,
    ctaLabel: input.ctaLabel || "Visit the site",
    ctaHref: input.ctaHref || brand.origin,
  };
  const unsub = unsubscribeLinkFor(input.to);
  return {
    to: input.to,
    from: mailboxes.noreply(),
    replyTo: mailboxes.replyTo(),
    subject: input.subject,
    text: brandEmailText(content, withUnsub),
    html: brandEmailHtml(content, withUnsub),
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      Precedence: "bulk",
    },
  } satisfies OutboundMail;
}
