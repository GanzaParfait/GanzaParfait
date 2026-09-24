import { unstable_cache } from "next/cache";
import { createServerSupabase } from "@/lib/supabase-server";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/supabase";
import { DEFAULT_SOCIAL_LINKS } from "@/lib/socials";
import { sanitizeWelcomeBody } from "@/lib/welcome-copy";
import { canonicalizeIdentityFields } from "@/lib/identity";
import { normalizeBookingSettings } from "@/lib/booking";

async function loadSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createServerSupabase(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "settings_json, social_links, navbar_style, contact_email, whatsapp_number, location, site_title, site_subtitle, bio, header_social_limit, banner_layout",
      )
      .limit(1)
      .maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    const json = (data.settings_json || {}) as Partial<SiteSettings>;
    return normalizeBookingSettings(
      canonicalizeIdentityFields({
        ...DEFAULT_SETTINGS,
        ...json,
        bannerLayout: (json.bannerLayout || data.banner_layout || DEFAULT_SETTINGS.bannerLayout) as SiteSettings["bannerLayout"],
        navbarStyle: json.navbarStyle || data.navbar_style || DEFAULT_SETTINGS.navbarStyle,
        contactEmail: json.contactEmail || data.contact_email || DEFAULT_SETTINGS.contactEmail,
        contactEmailSecondary:
          json.contactEmailSecondary || DEFAULT_SETTINGS.contactEmailSecondary || "",
        whatsappNumber: json.whatsappNumber || data.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
        location: json.location || data.location || DEFAULT_SETTINGS.location,
        siteTitle: json.siteTitle || data.site_title || DEFAULT_SETTINGS.siteTitle,
        siteSubtitle: json.siteSubtitle || data.site_subtitle || DEFAULT_SETTINGS.siteSubtitle,
        bio: json.bio || data.bio || DEFAULT_SETTINGS.bio,
        headerSocialLimit: json.headerSocialLimit ?? data.header_social_limit ?? DEFAULT_SETTINGS.headerSocialLimit,
        socialLinks: json.socialLinks?.length ? json.socialLinks : data.social_links || DEFAULT_SOCIAL_LINKS,
        emailWelcomeBody: sanitizeWelcomeBody(json.emailWelcomeBody),
        footerQuote: json.footerQuote?.trim() || DEFAULT_SETTINGS.footerQuote,
        footerQuoteAttribution: json.footerQuoteAttribution?.trim() || DEFAULT_SETTINGS.footerQuoteAttribution,
        footerShowQuote: json.footerShowQuote !== false,
      }),
    );
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Load public site settings for SSR. Tag-invalidated on PUT /api/settings. */
export const getServerSiteSettings = unstable_cache(loadSiteSettings, ["site-settings"], {
  revalidate: 120,
  tags: ["site-settings"],
});
