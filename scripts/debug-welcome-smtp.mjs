#!/usr/bin/env node
/**
 * Compare plain vs branded HTML delivery over the same SMTP path the app uses.
 *   node --env-file=.env.local scripts/debug-welcome-smtp.mjs --to you@example.com
 */
import nodemailer from "nodemailer";

const to = (() => {
  const i = process.argv.indexOf("--to");
  return i >= 0 ? process.argv[i + 1] : process.env.ADMIN_EMAIL || "";
})();
if (!to) {
  console.error("Pass --to you@example.com");
  process.exit(1);
}

function smtpSecret(value) {
  return String(value || "")
    .replaceAll("$$", "$")
    .replaceAll("\\$", "$");
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const secure = process.env.SMTP_SECURE !== "false" && port === 465;
const servername = process.env.SMTP_TLS_SERVERNAME || "princeparfait.com";
const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false";
const user = process.env.SMTP_HELLO_USER || process.env.EMAIL_HELLO || process.env.SMTP_USER;
const pass = smtpSecret(process.env.SMTP_HELLO_PASS || process.env.SMTP_PASS);
const fromEmail = process.env.EMAIL_HELLO || user;
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.princeparfait.com").replace(/\/+$/, "");

console.log({ host, port, user, fromEmail, to, site });

function transport() {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    logger: true,
    debug: true,
    tls: { servername, rejectUnauthorized },
  });
}

const brandedHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Thanks for joining</title></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#F8FAFC;color:#0F172A">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:18px">
    <tr><td style="padding:24px">
      <img src="${site}/brand/logos/logo-horizontal-blue.png" width="168" height="40" alt="Prince Parfait" style="display:block;border:0" />
      <h1 style="margin:20px 0 8px;font-size:24px">Thanks for joining</h1>
      <p style="margin:0;color:#475569;line-height:1.6">This is a debug welcome matching the site HTML path.</p>
      <p style="margin:18px 0 0"><a href="${site}" style="color:#0E52A8;font-weight:700">Visit the site →</a></p>
    </td></tr>
  </table>
</body></html>`;

const cases = [
  {
    id: "A-plain",
    opts: {
      from: fromEmail,
      to,
      subject: `[debug A] plain text hello — ${Date.now()}`,
      text: "Plain text only. If you get this, basic SMTP delivery works.",
    },
  },
  {
    id: "B-named-from",
    opts: {
      from: `"Prince Parfait GANZA" <${fromEmail}>`,
      to,
      subject: `[debug B] named From — ${Date.now()}`,
      text: "Named From header only.",
    },
  },
  {
    id: "C-html-simple",
    opts: {
      from: `"Prince Parfait GANZA" <${fromEmail}>`,
      to,
      subject: `[debug C] simple HTML — ${Date.now()}`,
      text: "Simple HTML multipart.",
      html: "<p>Simple <b>HTML</b> body with no remote images.</p>",
    },
  },
  {
    id: "D-html-branded",
    opts: {
      from: `"Prince Parfait GANZA" <${fromEmail}>`,
      to,
      subject: `[debug D] branded HTML + images — ${Date.now()}`,
      text: "Branded HTML with remote logo.",
      html: brandedHtml,
      headers: {
        "List-Unsubscribe": `<${site}/unsubscribe?email=${encodeURIComponent(to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
  },
  {
    id: "E-html-no-headers",
    opts: {
      from: fromEmail,
      to,
      subject: `[debug E] branded HTML bare From no List-Unsub — ${Date.now()}`,
      text: "Branded HTML, bare From, no List-Unsubscribe.",
      html: brandedHtml,
    },
  },
];

const t = transport();
for (const c of cases) {
  process.stdout.write(`\n=== ${c.id} ===\n`);
  try {
    const info = await t.sendMail(c.opts);
    console.log("accepted", info.accepted);
    console.log("rejected", info.rejected);
    console.log("response", info.response);
    console.log("messageId", info.messageId);
    console.log("envelope", info.envelope);
  } catch (error) {
    console.error("FAILED", error instanceof Error ? error.message : error);
  }
}

console.log("\nDone. Check Gmail (inbox + spam) for subjects starting with [debug.");
