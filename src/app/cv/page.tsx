import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import CvPageClient from "@/components/cv/CvPageClient";

export const metadata: Metadata = buildPageMetadata({
  title: "CV / Resume",
  description:
    "Download Prince Parfait GANZA’s professional CV, compact resume, or executive profile — founder and software engineer based in Kigali, Rwanda.",
  path: "/cv",
  keywords: [
    "Prince Parfait GANZA CV",
    "Prince Parfait GANZA resume",
    "software engineer CV Kigali",
    "founder CV Rwanda",
  ],
});

export default async function CvPage() {
  const settings = await getServerSiteSettings();
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/cv",
            name: "CV / Resume — Prince Parfait GANZA",
            description:
              "Professional CV, compact resume, and executive profile downloads for Prince Parfait GANZA.",
          }),
          buildBreadcrumbListJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "CV / Resume", path: "/cv" },
            ],
            "/cv"
          ),
        ])}
      />
      <CvPageClient settings={settings} />
    </>
  );
}
