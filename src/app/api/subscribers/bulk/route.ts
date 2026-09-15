import { NextResponse, after } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { bulkNewsletterMail, sendMail } from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";

function requireAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("ppg_admin_auth=true");
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const subject = String(body.subject || "").trim();
    const title = String(body.title || "").trim() || subject;
    const message = String(body.body || body.message || "").trim();
    const audience = String(body.audience || "confirmed"); // confirmed | unconfirmed | both
    const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];

    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Message body is required." }, { status: 400 });
    }

    const supabase = createServerSupabase(true);
    let query = supabase.from("subscribers").select("id, email, confirmed, name");

    if (ids.length) {
      query = query.in("id", ids);
    } else if (audience === "confirmed") {
      query = query.eq("confirmed", true);
    } else if (audience === "unconfirmed") {
      query = query.eq("confirmed", false);
    }

    const { data, error } = await query.limit(2000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const recipients = (data || []).filter((row) => row.email);
    if (!recipients.length) {
      return NextResponse.json({ error: "No matching subscribers." }, { status: 400 });
    }

    after(async () => {
      const site = await getServerSiteSettings();
      for (const row of recipients) {
        try {
          const mail = await bulkNewsletterMail(
            {
              to: row.email,
              subject,
              title,
              body: message,
            },
            site,
          );
          await sendMail({
            ...mail,
            log: {
              kind: "bulk_newsletter",
              relatedType: "subscriber",
              relatedId: row.id,
            },
          });
        } catch (mailError) {
          console.error("Bulk mail failed for", row.email, mailError);
        }
      }
    });

    return NextResponse.json({
      ok: true,
      queued: recipients.length,
      audience: ids.length ? "selected" : audience,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not queue bulk email." }, { status: 500 });
  }
}
