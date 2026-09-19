import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import PrivacyPageView from "@/components/privacy/PrivacyPageView";
import { DEFAULT_PRIVACY_PAGE } from "@/lib/privacy-page";

const PAGE_DESCRIPTION = DEFAULT_PRIVACY_PAGE.lead;

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/privacy",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Privacy", path: "/privacy" },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/privacy",
            name: "Privacy Policy | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
            includePersonImage: false,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/privacy"),
        ])}
      />
      <PrivacyPageView />
    </>
  );
}
