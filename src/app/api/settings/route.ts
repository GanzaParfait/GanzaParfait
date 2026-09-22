import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { createServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";
import { DEFAULT_SOCIAL_LINKS } from "@/lib/socials";
import type { SiteSettings } from "@/lib/supabase";
import { canonicalizeIdentityFields } from "@/lib/identity";

const PUBLIC_PATHS = ["/", "/projects", "/about", "/contact", "/experience", "/services", "/cv"] as const;

function isAuthorized(request: NextRequest): boolean {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}

function supabaseErrorPayload(error: { message: string; code?: string; details?: string; hint?: string }) {
  const permission = /permission denied|42501/i.test(error.message || "");
  return {
    error: permission
      ? "Database permission denied for site_settings. Run migration site_settings_grants.sql in Supabase."
      : error.message || "Failed to save settings.",
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
}

/** Public read of site settings (service role on the server — avoids anon RLS 401s). */
export async function GET() {
  const settings = await getServerSiteSettings();
  return NextResponse.json(settings, {
    headers: {
      // Clients and CDNs must not serve stale dashboard content as “live”.
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    },
  });
}

/** Dashboard save — requires admin cookie. */
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasServiceRoleKey()) {
    return NextResponse.json({ error: "Server write key is not configured." }, { status: 503 });
  }

  let settings: SiteSettings;
  try {
    settings = canonicalizeIdentityFields((await request.json()) as SiteSettings);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "Missing settings payload." }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase(true);
    const payload = {
      banner_layout: settings.bannerLayout,
      site_title: settings.siteTitle,
      site_subtitle: settings.siteSubtitle,
      bio: settings.bio,
      location: settings.location,
      contact_email: settings.contactEmail,
      whatsapp_number: settings.whatsappNumber,
      header_social_limit: settings.headerSocialLimit,
      navbar_style: settings.navbarStyle || "pill",
      settings_json: settings,
      social_links: settings.socialLinks || DEFAULT_SOCIAL_LINKS,
      updated_at: new Date().toISOString(),
    };

    const { data, error: readError } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();
    if (readError) {
      return NextResponse.json(supabaseErrorPayload(readError), { status: 500 });
    }

    if (data?.id) {
      const { error } = await supabase.from("site_settings").update(payload).eq("id", data.id);
      if (error) {
        // Fallback: settings_json only (older schemas / partial grants)
        const fallback = await supabase
          .from("site_settings")
          .update({
            settings_json: settings,
            updated_at: payload.updated_at,
          })
          .eq("id", data.id);
        if (fallback.error) {
          return NextResponse.json(supabaseErrorPayload(error), { status: 500 });
        }
      }
    } else {
      const { error } = await supabase.from("site_settings").insert(payload);
      if (error) {
        return NextResponse.json(supabaseErrorPayload(error), { status: 500 });
      }
    }

    try {
      revalidateTag("site-settings", "max");
      revalidatePath("/", "layout");
      for (const path of PUBLIC_PATHS) {
        revalidatePath(path);
      }
      revalidatePath("/projects", "layout");
      revalidatePath("/sitemap.xml");
      revalidatePath("/image-sitemap.xml");
    } catch (revalidateError) {
      console.error("Settings revalidate failed:", revalidateError);
    }

    return NextResponse.json({ ok: true, syncedAt: payload.updated_at });
  } catch (error) {
    console.error("Settings save failed:", error);
    const message = error instanceof Error ? error.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
