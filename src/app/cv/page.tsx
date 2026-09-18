import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import CvPageClient from "@/components/cv/CvPageClient";

export const metadata: Metadata = buildPageMetadata({
  title: "CV / Resume",
  description:
    "View and download Prince Parfait GANZA’s curriculum vitae — founder, entrepreneur and technologist based in Kigali, Rwanda.",
  path: "/cv",
});

export default async function CvPage() {
  const settings = await getServerSiteSettings();
  return <CvPageClient settings={settings} />;
}
