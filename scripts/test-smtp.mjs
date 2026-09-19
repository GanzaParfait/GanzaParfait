#!/usr/bin/env node
/**
 * SMTP / Resend diagnostics for princeparfait.com mailboxes.
 *
 * Usage:
 *   yarn test:smtp
 *   yarn test:smtp --to you@example.com
 *   yarn test:smtp --send          # actually send a test message to --to
 *   yarn test:smtp --mailbox hello # verify only one mailbox auth
 *
 * Loads `.env.local` via Node --env-file (see package.json script).
 */

import nodemailer from "nodemailer";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback = "") => {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith("--")) return args[idx + 1];
  return fallback;
};

function smtpSecret(raw) {
  return String(raw || "")
    .replaceAll("$$", "$")
    .replaceAll("\\$", "$");
}

function mask(value) {
  const s = String(value || "");
  if (!s) return "(empty)";
  if (s.length <= 4) return "****";
  return `${s.slice(0, 2)}…${s.slice(-2)} (${s.length} chars)`;
}

const host = process.env.SMTP_HOST || "";
const port = Number(process.env.SMTP_PORT || 465);
const secure = process.env.SMTP_SECURE !== "false" && port === 465;
const servername = process.env.SMTP_TLS_SERVERNAME || "princeparfait.com";
const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false";

const mailboxes = [
  {
    id: "default",
    from: process.env.EMAIL_NOREPLY || process.env.SMTP_USER || "",
    user: process.env.SMTP_USER || "",
    pass: smtpSecret(process.env.SMTP_PASS),
  },
  {
    id: "hello",
    from: process.env.EMAIL_HELLO || "hello@princeparfait.com",
    user: process.env.SMTP_HELLO_USER || process.env.EMAIL_HELLO || "",
    pass: smtpSecret(process.env.SMTP_HELLO_PASS),
  },
  {
    id: "thanks",
    from: process.env.EMAIL_THANKS || "thanks@princeparfait.com",
    user: process.env.SMTP_THANKS_USER || process.env.EMAIL_THANKS || "",
    pass: smtpSecret(process.env.SMTP_THANKS_PASS),
  },
  {
    id: "contact",
    from: process.env.EMAIL_CONTACT || "contact@princeparfait.com",
    user: process.env.SMTP_CONTACT_USER || process.env.EMAIL_CONTACT || "",
    pass: smtpSecret(process.env.SMTP_CONTACT_PASS),
  },
];

const only = value("mailbox");
const to = value("to", process.env.ADMIN_EMAIL || process.env.EMAIL_HELLO || "");
const doSend = flag("send");

console.log("\nPrince Parfait — mail transport check\n");
console.log("SMTP_HOST           ", host || "(not set)");
console.log("SMTP_PORT           ", port);
console.log("SMTP_SECURE         ", secure);
console.log("SMTP_TLS_SERVERNAME ", servername);
console.log("TLS rejectUnauthorized", rejectUnauthorized);
console.log("RESEND_API_KEY      ", process.env.RESEND_API_KEY ? mask(process.env.RESEND_API_KEY) : "(not set)");
console.log("");

if (!host && !process.env.RESEND_API_KEY) {
  console.error("No SMTP_HOST and no RESEND_API_KEY — nothing to test.");
  process.exit(1);
}

async function verifySmtp(entry) {
  if (!entry.user || !entry.pass) {
    return { ok: false, error: "missing user/pass" };
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: entry.user, pass: entry.pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    tls: { servername, rejectUnauthorized },
  });
  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function sendSmtp(entry) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: entry.user, pass: entry.pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    tls: { servername, rejectUnauthorized },
  });
  await transporter.sendMail({
    from: entry.from || entry.user,
    to,
    subject: `[SMTP test] ${entry.id} mailbox — Prince Parfait`,
    text: `SMTP verify + send OK for mailbox "${entry.id}" as ${entry.user} → ${to}`,
  });
}

async function sendResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  const from = process.env.EMAIL_NOREPLY || process.env.EMAIL_HELLO || "onboarding@resend.dev";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "[Resend test] Prince Parfait",
      text: `Resend send OK → ${to}`,
    }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Resend ${response.status}: ${body.slice(0, 400)}`);
  return body;
}

const targets = only ? mailboxes.filter((m) => m.id === only) : mailboxes;
if (only && !targets.length) {
  console.error(`Unknown --mailbox ${only}. Use: default | hello | thanks | contact`);
  process.exit(1);
}

let failed = 0;

if (host) {
  for (const entry of targets) {
    process.stdout.write(`SMTP ${entry.id.padEnd(8)} user=${entry.user || "(empty)"} pass=${mask(entry.pass)} … `);
    const result = await verifySmtp(entry);
    if (result.ok) {
      console.log("OK (auth verified)");
      if (doSend) {
        if (!to) {
          console.log("  skip send — pass --to you@example.com");
        } else {
          try {
            await sendSmtp(entry);
            console.log(`  sent test message → ${to}`);
          } catch (error) {
            failed += 1;
            console.log(`  SEND FAILED: ${error instanceof Error ? error.message : error}`);
          }
        }
      }
    } else {
      failed += 1;
      console.log(`FAIL\n  ${result.error}`);
      if (String(result.error).includes("535")) {
        console.log("  Hint: 535 = bad username/password for that mailbox.");
        console.log("  Avoid $ in mailbox passwords (Next.js env interpolation). Prefer e.g. contact2024_.");
      }
    }
  }
} else {
  console.log("SMTP_HOST not set — skipping SMTP verify.");
}

if (process.env.RESEND_API_KEY) {
  process.stdout.write("Resend API … ");
  try {
    if (doSend && to) {
      const body = await sendResend();
      console.log(`OK (sent)\n  ${body.slice(0, 200)}`);
    } else {
      const response = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      console.log(response.ok ? `OK (domains ${response.status})` : `FAIL ${response.status}`);
      if (!response.ok) failed += 1;
    }
  } catch (error) {
    failed += 1;
    console.log(`FAIL: ${error instanceof Error ? error.message : error}`);
  }
}

console.log("");
if (failed) {
  console.log(`Finished with ${failed} failure(s).`);
  console.log("Subscribe welcome mail sends from hello@ (fallback thanks@) — fix that mailbox first.");
  process.exit(1);
}
console.log("All checked transports look good.");
if (!doSend) console.log("Re-run with --send --to you@example.com to deliver a real test message.");
console.log("Subscribe welcome mail sends from hello@ with lean transactional HTML.");

// SPF must authorize premiumNNN.web-hosting.com — forwarding-only SPF causes silent Gmail drops.
try {
  const { execFileSync } = await import("node:child_process");
  const domain = (process.env.SMTP_TLS_SERVERNAME || "princeparfait.com").replace(/^www\./, "");
  const raw = execFileSync("dig", ["+short", "TXT", domain], { encoding: "utf8" });
  const spf = raw
    .split("\n")
    .map((line) => line.replace(/"/g, "").trim())
    .find((line) => line.startsWith("v=spf1"));
  console.log("");
  console.log("SPF check", domain);
  console.log(" ", spf || "(no v=spf1 TXT found)");
  if (spf && !/include:spf\.web-hosting\.com/.test(spf)) {
    console.log("  WARN: SPF does not include spf.web-hosting.com.");
    console.log("  Outbound via premiumNNN.web-hosting.com will SPF-softfail at Gmail.");
    console.log("  Set TXT to:");
    console.log(
      "  v=spf1 include:spf.efwd.registrar-servers.com include:spf.web-hosting.com ~all",
    );
    console.log("  Then enable DKIM in cPanel → Email Deliverability and copy the TXT to Namecheap DNS.");
  } else if (spf) {
    console.log("  OK: hosting SPF include present.");
  }
} catch {
  /* dig optional */
}
