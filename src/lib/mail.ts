import nodemailer from "nodemailer";
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
  /** When set, a row is written to mail_outbox after send. */
  log?: {
    kind: string;
    relatedType?: string;
    relatedId?: string;
  };
};

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
      from: mail.from || mailboxes.noreply(),
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: mail.replyTo || mailboxes.replyTo(),
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
  const thanks = mailboxes.thanks();
  const contact = mailboxes.contact();
  const hello = mailboxes.hello();
  let user = process.env.SMTP_USER || "";
  let pass = smtpSecret(process.env.SMTP_PASS || "");
  if (from === thanks && process.env.SMTP_THANKS_USER && process.env.SMTP_THANKS_PASS) {
    user = process.env.SMTP_THANKS_USER;
    pass = smtpSecret(process.env.SMTP_THANKS_PASS);
  } else if (from === contact && process.env.SMTP_CONTACT_USER && process.env.SMTP_CONTACT_PASS) {
    user = process.env.SMTP_CONTACT_USER;
    pass = smtpSecret(process.env.SMTP_CONTACT_PASS);
  } else if (from === hello && process.env.SMTP_HELLO_USER && process.env.SMTP_HELLO_PASS) {
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
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
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
      await transporter.sendMail({
        from: attempt.from,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: mail.replyTo || mailboxes.replyTo(),
      });
      mail.from = attempt.from;
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
 * Namecheap/cPanel: if the apex A record is CDN/proxy, set SMTP_HOST to the
 * hosting IP (or a mail.* A record) and SMTP_TLS_SERVERNAME=yourdomain.com.
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
    from: mailboxes.thanks() || mailboxes.hello(),
    replyTo: mailboxes.replyTo(),
    subject: `Thanks for writing — ${site.siteTitle || "Prince Parfait GANZA"}`,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}

export async function subscriberThanksMail(to: string, settings?: SiteSettings) {
  const site = settings || (await getServerSiteSettings());
  const content = welcomeEmailContent(emailBrandFromSettings(site));
  return {
    to,
    from: mailboxes.hello() || mailboxes.thanks(),
    replyTo: mailboxes.replyTo(),
    subject: `${content.title.replace(/!$/, "")} — ${site.siteTitle || "Prince Parfait GANZA"}`,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
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
  const brand = emailBrandFromSettings(site);
  const content = {
    preheader: input.subject,
    eyebrow: "Update",
    title: input.title,
    body: input.body,
    ctaLabel: input.ctaLabel || "Visit the site",
    ctaHref: input.ctaHref || brand.origin,
  };
  return {
    to: input.to,
    from: mailboxes.noreply(),
    replyTo: mailboxes.replyTo(),
    subject: input.subject,
    text: brandEmailText(content, site),
    html: brandEmailHtml(content, site),
  } satisfies OutboundMail;
}
