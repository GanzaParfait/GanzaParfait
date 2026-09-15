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

async function logOutbound(mail: OutboundMail, status: "sent" | "failed") {
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

async function sendWithSmtp(mail: OutboundMail) {
  if (!smtpConfigured() && !process.env.SMTP_THANKS_PASS && !process.env.SMTP_CONTACT_PASS) return false;
  const from = mail.from || mailboxes.noreply();
  const thanks = mailboxes.thanks();
  const contact = mailboxes.contact();
  const hello = mailboxes.hello();
  let user = process.env.SMTP_USER || "";
  let pass = process.env.SMTP_PASS || "";
  if (from === thanks && process.env.SMTP_THANKS_USER && process.env.SMTP_THANKS_PASS) {
    user = process.env.SMTP_THANKS_USER;
    pass = process.env.SMTP_THANKS_PASS;
  } else if (from === contact && process.env.SMTP_CONTACT_USER && process.env.SMTP_CONTACT_PASS) {
    user = process.env.SMTP_CONTACT_USER;
    pass = process.env.SMTP_CONTACT_PASS;
  } else if (from === hello && process.env.SMTP_HELLO_USER && process.env.SMTP_HELLO_PASS) {
    user = process.env.SMTP_HELLO_USER;
    pass = process.env.SMTP_HELLO_PASS;
  }
  if (!process.env.SMTP_HOST || !user || !pass) return false;
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE !== "false" && port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo || mailboxes.replyTo(),
  });
  return true;
}

export async function sendMail(mail: OutboundMail) {
  try {
    let sent = false;
    if (process.env.RESEND_API_KEY) {
      sent = await sendWithResend(mail);
    } else {
      sent = await sendWithSmtp(mail);
    }
    if (sent) {
      await logOutbound(mail, "sent");
      return true;
    }
    if (mail.log) await logOutbound(mail, "failed");
    return false;
  } catch (error) {
    if (mail.log) await logOutbound(mail, "failed");
    throw error;
  }
}

export async function subscriberThanksMail(to: string, settings?: SiteSettings) {
  const site = settings || (await getServerSiteSettings());
  const content = welcomeEmailContent(emailBrandFromSettings(site));
  return {
    to,
    from: mailboxes.thanks(),
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
