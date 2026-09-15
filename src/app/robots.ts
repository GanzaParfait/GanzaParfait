import type { MetadataRoute } from "next";
import { CANONICAL_ORIGIN } from "@/lib/schema";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/dashboard/", "/admin", "/admin/", "/email-preview", "/email-preview/"],
      },
    ],
    sitemap: [`${CANONICAL_ORIGIN}/sitemap.xml`, `${CANONICAL_ORIGIN}/image-sitemap.xml`],
    host: CANONICAL_ORIGIN,
  };
}
